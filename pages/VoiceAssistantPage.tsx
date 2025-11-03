import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { LiveSession } from '@google/genai';
import { getHealthAdvice, startTranscriptionSession, generateSpeech, createPcmBlob } from '../services/geminiService';
import { GroundingChunk } from '../types';
import { MapIcon, MicrophoneIcon } from '../components/IconComponents';
import { decode, decodeAudioData } from '../utils/audioUtils';

// Types
interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    chunks?: GroundingChunk[];
}
type Status = 'idle' | 'recording' | 'processing';

const VoiceAssistantPage: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'initial',
            text: 'আসসালামু আলাইকুম! আমি আপনার স্বাস্থ্য বন্ধু। আপনার স্বাস্থ্য উদ্বেগ সম্পর্কে আমি কীভাবে সাহায্য করতে পারি? কথা বলা শুরু করতে মাইক্রোফোন বোতামটি চাপুন।',
            sender: 'bot'
        }
    ]);
    const [status, setStatus] = useState<Status>('idle');
    const [liveTranscript, setLiveTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    
    // Ref to reliably accumulate the final, confirmed parts of the transcript
    const finalTranscriptRef = useRef('');

    // Refs for audio processing
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const sessionRef = useRef<LiveSession | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);

    // Scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, liveTranscript]);

    // Get user location once on mount
    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (err) => {
                    console.warn(`Geolocation error: ${err.message}`);
                    setError("অবস্থান অ্যাক্সেস করা যায়নি। ডিফল্ট অবস্থান ব্যবহার করা হচ্ছে।");
                }
            );
        }
    }, []);
    
    // Audio playback function
    const playAudio = useCallback(async (base64Audio: string) => {
        try {
            if (!outputAudioContextRef.current || outputAudioContextRef.current.state === 'closed') {
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
            }
            await outputAudioContextRef.current.resume();

            const decodedBytes = decode(base64Audio);
            const audioBuffer = await decodeAudioData(decodedBytes, outputAudioContextRef.current, 24000, 1);
            const source = outputAudioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputAudioContextRef.current.destination);
            source.start();
        } catch (e) {
            console.error("Error playing audio:", e);
            setError("দুঃখিত, আমি অডিও প্রতিক্রিয়াটি চালাতে পারিনি।");
        }
    }, []);
    
    const stopAudioAndMedia = useCallback(() => {
        sessionRef.current?.close();
        sessionRef.current = null;

        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;

        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }

        if (inputAudioContextRef.current?.state !== 'closed') {
            inputAudioContextRef.current?.close().catch(console.error);
            inputAudioContextRef.current = null;
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopAudioAndMedia();
            if (outputAudioContextRef.current?.state !== 'closed') {
                outputAudioContextRef.current?.close().catch(console.error);
            }
        };
    }, [stopAudioAndMedia]);
    
    // Process the final voice query
    const processVoiceQuery = useCallback(async (query: string) => {
        if (!query) {
            setStatus('idle');
            return;
        }
        
        setMessages(prev => [...prev, { id: Date.now().toString(), text: query, sender: 'user' }]);
        setError(null);

        try {
            const response = await getHealthAdvice(query, location);

            const botMessage: ChatMessage = {
                id: Date.now().toString() + 'b',
                text: response.text,
                sender: 'bot',
                chunks: response.chunks,
            };
            setMessages(prev => [...prev, botMessage]);

            if (response.text) {
                const audioData = await generateSpeech(response.text);
                if (audioData) {
                    await playAudio(audioData);
                }
            }
        } catch (err) {
            console.error(err);
            setError('দুঃখিত, একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
        } finally {
            setStatus('idle');
        }
    }, [location, playAudio]);

    // Handle transcription updates from the service
    const handleTranscriptionUpdate = useCallback((text: string, isFinal: boolean) => {
        if (isFinal) {
            finalTranscriptRef.current = (finalTranscriptRef.current + ' ' + text).trim();
            setLiveTranscript(finalTranscriptRef.current);
        } else {
            setLiveTranscript((finalTranscriptRef.current + ' ' + text).trim());
        }
    }, []);

    // Start recording audio from the microphone
    const startRecording = useCallback(async () => {
        if (status !== 'idle') return;

        setStatus('recording');
        finalTranscriptRef.current = '';
        setLiveTranscript('');
        setError(null);
        
        try {
            const sessionPromise = startTranscriptionSession(handleTranscriptionUpdate, (err) => {
                setError(err.message);
                stopAudioAndMedia();
                setStatus('idle');
            });
            sessionRef.current = await sessionPromise;
            
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            inputAudioContextRef.current = new AudioContext({ sampleRate: 16000 });
            await inputAudioContextRef.current.resume();

            const source = inputAudioContextRef.current.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (event) => {
                const inputData = event.inputBuffer.getChannelData(0);
                const pcmBlob = createPcmBlob(inputData);
                if (sessionRef.current) {
                    sessionRef.current.sendRealtimeInput({ media: pcmBlob });
                }
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current.destination);
            scriptProcessorRef.current = scriptProcessor;

        } catch (err) {
            console.error('Error starting recording:', err);
            setError('মাইক্রোফোন শুরু করা যায়নি। অনুগ্রহ করে অনুমতি পরীক্ষা করুন।');
            stopAudioAndMedia();
            setStatus('idle');
        }
    }, [status, handleTranscriptionUpdate, stopAudioAndMedia]);
    
    // Stop recording and start processing the query
    const stopRecordingAndProcess = useCallback(() => {
        if (status !== 'recording') return;

        setStatus('processing');
        const fullQuery = liveTranscript.trim();
        stopAudioAndMedia();
        
        if (fullQuery) {
            processVoiceQuery(fullQuery);
        } else {
            setStatus('idle');
        }

    }, [status, liveTranscript, stopAudioAndMedia, processVoiceQuery]);

    // Main interaction handler for the microphone button
    const handleMicClick = useCallback(() => {
        if (status === 'idle') {
            startRecording();
        } else if (status === 'recording') {
            stopRecordingAndProcess();
        }
        // Do nothing if 'processing'
    }, [status, startRecording, stopRecordingAndProcess]);

    const getButtonUI = () => {
        switch (status) {
            case 'recording':
                return {
                    label: 'Stop Recording',
                    className: 'bg-red-500 text-white animate-pulse',
                };
            case 'processing':
                return {
                    label: 'Processing...',
                    className: 'bg-yellow-500 text-white',
                };
            case 'idle':
            default:
                return {
                    label: 'Start Recording',
                    className: 'bg-emerald-600 text-white hover:bg-emerald-700',
                };
        }
    };
    const buttonUI = getButtonUI();
    
    return (
        <div className="bg-white dark:bg-gray-900 min-h-[calc(100vh-8rem)]">
            <div className="container mx-auto px-6 py-12 flex flex-col h-[calc(100vh-8rem)] max-w-6xl">
                <header className="text-center mb-6">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-gray-100">AI স্বাস্থ্য বন্ধু</h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                        আপনার স্বাস্থ্যের প্রশ্ন জিজ্ঞাসা করতে মাইক্রোফোন বোতামটি চাপুন এবং কথা বলুন।
                    </p>
                    {error && <p className="mt-2 text-red-500 bg-red-100 dark:bg-red-900/50 p-2 rounded-md">{error}</p>}
                </header>

                <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner">
                    <div className="space-y-4">
                        {messages.map((msg) => (
                             <div key={msg.id} className={`flex my-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`rounded-lg px-4 py-2 max-w-[90%] whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-emerald-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                                    {msg.text}
                                    {msg.sender === 'bot' && msg.chunks?.length > 0 && (
                                        <div className="mt-4 pt-3 border-t border-gray-300 dark:border-gray-600">
                                            <h4 className="font-bold mb-2">প্রস্তাবিত স্থান:</h4>
                                            <ul className="space-y-2">
                                                {msg.chunks.filter(c => c.maps).map((chunk, index) => (
                                                    <li key={index}>
                                                        <a href={chunk.maps?.uri} target="_blank" rel="noopener noreferrer" className="flex items-start text-emerald-700 dark:text-emerald-400 hover:underline">
                                                            <MapIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-1" />
                                                            <span>{chunk.maps?.title}</span>
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                         {status === 'recording' && (
                            <div className="flex justify-end my-2">
                                <div className="rounded-lg px-4 py-2 max-w-[90%] bg-emerald-500 text-white opacity-75">
                                    {liveTranscript || 'শুনছি...'}
                                </div>
                            </div>
                         )}
                         {status === 'processing' && (
                            <div className="flex justify-start my-2">
                                <div className="rounded-lg px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                                    অনুগ্রহ করে অপেক্ষা করুন...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                <div className="mt-6 flex flex-col items-center">
                    <button
                        onClick={handleMicClick}
                        disabled={status === 'processing'}
                        className={`w-20 h-20 rounded-full shadow-lg flex items-center justify-center transition-colors duration-300 transform hover:scale-105 disabled:opacity-50 disabled:scale-100 ${buttonUI.className}`}
                        aria-label={buttonUI.label}
                    >
                         {status === 'processing' ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                        ) : (
                            <MicrophoneIcon className="h-10 w-10" />
                        )}
                    </button>
                    <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                        {status === 'recording' ? 'থামতে আবার ট্যাপ করুন' : status === 'idle' ? 'কথা বলতে ট্যাপ করুন' : 'অনুগ্রহ করে অপেক্ষা করুন...'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VoiceAssistantPage;