import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MicrophoneIcon } from '../components/IconComponents';
import { startLiveHealthSession, createPcmBlob } from '../services/geminiService';
// Fix: Removed `LiveSession` as it's no longer exported from `@google/genai`.
import { LiveServerMessage } from '@google/genai';
import { decode, decodeAudioData } from '../utils/audioUtils';

type Status = 'idle' | 'connecting' | 'connected' | 'error';
interface Transcript {
    id: string;
    user: string;
    bot: string;
}

const VoiceAssistantPage: React.FC = () => {
    const [status, setStatus] = useState<Status>('idle');
    const [error, setError] = useState('');
    const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const [transcripts, setTranscripts] = useState<Transcript[]>(() => {
        try {
            const saved = localStorage.getItem('voiceAssistantTranscripts');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Failed to load transcripts from storage:', e);
            return [];
        }
    });
    const [currentInterimUserTranscript, setCurrentInterimUserTranscript] = useState('');
    const [currentBotTranscript, setCurrentBotTranscript] = useState('');
    
    // --- REFACTORED REFS ---
    // Single ref to build the complete user transcript for the current turn.
    const userTranscriptForTurnRef = useRef<string>('');
    // Ref for the bot's transcript.
    const botTranscriptForTurnRef = useRef<string>('');

    // Refs for audio and session management
    // Fix: Used `ReturnType` to infer the session promise type instead of the removed `LiveSession`.
    const sessionPromiseRef = useRef<ReturnType<typeof startLiveHealthSession> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const nextAudioStartTimeRef = useRef<number>(0);
    const audioQueueRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // Get user location once on mount
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
            (err) => console.warn("Could not get location:", err.message)
        );
    }, []);
    
    // Persist transcripts to localStorage
    useEffect(() => {
        try {
            localStorage.setItem('voiceAssistantTranscripts', JSON.stringify(transcripts));
        } catch (e) {
            console.error('Failed to save transcripts to storage:', e);
        }
    }, [transcripts]);

    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcripts, currentInterimUserTranscript, currentBotTranscript]);

    // Centralized function to save the current turn and reset for the next one
    const completeAndSaveTurn = useCallback(() => {
        const userTranscript = userTranscriptForTurnRef.current;
        const botTranscript = botTranscriptForTurnRef.current;

        if (userTranscript || botTranscript) {
            setTranscripts(prev => [
                ...prev,
                {
                    id: Date.now().toString(),
                    user: userTranscript,
                    bot: botTranscript,
                }
            ]);
        }
        
        // Reset for the next turn or session
        setCurrentInterimUserTranscript('');
        setCurrentBotTranscript('');
        userTranscriptForTurnRef.current = '';
        botTranscriptForTurnRef.current = '';
    }, []);

    // Cleanup function
    const cleanup = useCallback(() => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.onaudioprocess = null;
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            inputAudioContextRef.current.close().catch(console.error);
        }
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            outputAudioContextRef.current.close().catch(console.error);
        }
        audioQueueRef.current.forEach(source => source.stop());
        audioQueueRef.current.clear();
        sessionPromiseRef.current?.then(session => session.close());
        sessionPromiseRef.current = null;
    }, []);

    // Main session handling function
    const handleToggleSession = useCallback(async () => {
        if (status === 'connected' || status === 'connecting') {
            completeAndSaveTurn();
            setStatus('idle');
            cleanup();
            return;
        }

        setStatus('connecting');
        setError('');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            if (!outputAudioContextRef.current || outputAudioContextRef.current.state === 'closed') {
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
            }
            await outputAudioContextRef.current.resume();

            sessionPromiseRef.current = startLiveHealthSession(location, {
                onOpen: () => {
                    setStatus('connected');
                    if (!inputAudioContextRef.current || inputAudioContextRef.current.state === 'closed') {
                        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                        inputAudioContextRef.current = new AudioContext({ sampleRate: 16000 });
                    }
                    const source = inputAudioContextRef.current.createMediaStreamSource(stream);
                    const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                    
                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createPcmBlob(inputData);
                        sessionPromiseRef.current?.then(session => {
                             session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContextRef.current.destination);
                    scriptProcessorRef.current = scriptProcessor;
                },
                onMessage: async (message: LiveServerMessage) => {
                    if (message.serverContent?.inputTranscription) {
                        const { text } = message.serverContent.inputTranscription;
                        userTranscriptForTurnRef.current += text;
                        setCurrentInterimUserTranscript(userTranscriptForTurnRef.current);
                    }
                    if (message.serverContent?.outputTranscription) {
                        const { text } = message.serverContent.outputTranscription;
                        // Correctly build the bot's full transcript for the turn by appending every chunk.
                        botTranscriptForTurnRef.current += text;
                        // Update the display with the complete, accumulating transcript.
                        setCurrentBotTranscript(botTranscriptForTurnRef.current);
                    }

                    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (base64Audio && outputAudioContextRef.current) {
                        const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
                        const source = outputAudioContextRef.current.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputAudioContextRef.current.destination);
                        
                        const currentTime = outputAudioContextRef.current.currentTime;
                        const startTime = Math.max(currentTime, nextAudioStartTimeRef.current);
                        source.start(startTime);
                        
                        nextAudioStartTimeRef.current = startTime + audioBuffer.duration;
                        
                        audioQueueRef.current.add(source);
                        source.onended = () => audioQueueRef.current.delete(source);
                    }

                    if (message.serverContent?.turnComplete) {
                        completeAndSaveTurn();
                    }
                },
                onError: (e: ErrorEvent) => {
                    setError('Connection error. Please try again.');
                    setStatus('error');
                    cleanup();
                },
                onClose: () => {
                    setStatus('idle');
                    cleanup();
                }
            });
        } catch (err) {
            setError('Could not access microphone. Please check permissions.');
            setStatus('error');
            cleanup();
        }
    }, [status, cleanup, location, completeAndSaveTurn]);
    
    const getStatusInfo = () => {
        switch (status) {
            case 'connecting':
                return { style: 'bg-yellow-500', label: 'সংযোগ করা হচ্ছে...', pulse: true };
            case 'connected':
                return { style: 'bg-red-500', label: 'কথা বলা থামাতে ট্যাপ করুন', pulse: true };
            case 'error':
                return { style: 'bg-stone-500', label: 'আবার চেষ্টা করুন', pulse: false };
            case 'idle':
            default:
                return { style: 'bg-teal-600', label: 'কথা বলতে ট্যাপ করুন', pulse: false };
        }
    };
    const { style, label, pulse } = getStatusInfo();

    return (
        <div className="bg-stone-50 dark:bg-slate-900 min-h-[calc(100vh-8rem)] flex flex-col">
            {/* Header */}
            <header className="text-center p-6 border-b dark:border-slate-700">
                <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">স্বাস্থ্য বন্ধু</h1>
                <p className="mt-2 text-stone-600 dark:text-stone-400">আপনার প্রশ্ন জিজ্ঞাসা করুন, আমি সাহায্য করতে এখানে আছি।</p>
            </header>

            {/* Chat Area */}
            <div className="flex-1 p-4 overflow-y-auto w-full max-w-4xl mx-auto">
                {transcripts.map((t) => (
                    <div key={t.id}>
                        {t.user && <div className="flex justify-end my-2">
                            <div className="bg-teal-500 text-white rounded-lg px-4 py-2 max-w-[80%]">
                                {t.user}
                            </div>
                        </div>}
                        {t.bot && <div className="flex justify-start my-2">
                            <div className="bg-stone-200 dark:bg-slate-700 text-stone-800 dark:text-stone-200 rounded-lg px-4 py-2 max-w-[80%]">
                                {t.bot}
                            </div>
                        </div>}
                    </div>
                ))}
                {/* Live Transcripts */}
                {currentInterimUserTranscript && <div className="flex justify-end my-2">
                    <div className="bg-teal-200 dark:bg-teal-900/50 text-stone-600 dark:text-stone-300 rounded-lg px-4 py-2 max-w-[80%]">
                        {currentInterimUserTranscript}
                    </div>
                </div>}
                {currentBotTranscript && <div className="flex justify-start my-2">
                    <div className="bg-stone-300 dark:bg-slate-600 text-stone-600 dark:text-stone-300 rounded-lg px-4 py-2 max-w-[80%]">
                        {currentBotTranscript}
                    </div>
                </div>}
                 {error && <p className="text-center text-sm text-red-500 py-2">{error}</p>}
                <div ref={messagesEndRef} />
            </div>

            {/* Controls */}
            <div className="p-4 border-t dark:border-slate-700 flex flex-col items-center">
                <button
                    onClick={handleToggleSession}
                    className={`w-20 h-20 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105 text-white ${style} ${pulse ? 'animate-pulse' : ''}`}
                    aria-label={label}
                    disabled={status === 'connecting'}
                >
                    <MicrophoneIcon className="h-10 w-10" />
                </button>
                <p className="mt-4 text-lg text-stone-600 dark:text-stone-300 h-6">{label}</p>
            </div>
        </div>
    );
};

export default VoiceAssistantPage;