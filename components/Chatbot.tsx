import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chat } from '@google/genai';
import { createChatSession, generateSpeech } from '../services/geminiService';
import { Message } from '../types';
import { ChatBubbleOvalLeftEllipsisIcon, PaperAirplaneIcon } from './IconComponents';
import { decode, decodeAudioData } from '../utils/audioUtils';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'initial', text: 'আসসালামু আলাইকুম! আমি আপনার স্বাস্থ্য বন্ধু। কীভাবে সাহায্য করতে পারি?', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Ref for audio playback
  const outputAudioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (isOpen && !chatRef.current) {
      chatRef.current = createChatSession();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const playAudio = useCallback(async (base64Audio: string) => {
    try {
        if (!outputAudioContextRef.current || outputAudioContextRef.current.state === 'closed') {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
        }
        // Resume context on user interaction, which is implicitly handled by sending a message
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

  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || !chatRef.current) return;

    const userMessage: Message = { id: Date.now().toString(), text: messageText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatRef.current.sendMessage({ message: messageText });
      const botMessage: Message = { id: Date.now().toString() + 'b', text: response.text, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);

      if (response.text) {
        const audioData = await generateSpeech(response.text);
        if (audioData) {
            await playAudio(audioData);
        }
      }

    } catch (error) {
      console.error('Gemini chat error:', error);
      const errorMessage: Message = { id: Date.now().toString() + 'e', text: 'Sorry, I encountered an error. Please try again.', sender: 'bot' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [playAudio]);

  // Cleanup audio context on close
  useEffect(() => {
    if(!isOpen) {
      if (outputAudioContextRef.current?.state !== 'closed') {
        outputAudioContextRef.current?.close().catch(console.error);
        outputAudioContextRef.current = null;
      }
    }
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:bg-emerald-700 transition-transform duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 z-50"
        aria-label="Toggle chatbot"
      >
        <ChatBubbleOvalLeftEllipsisIcon className="h-8 w-8" />
      </button>
      
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-full max-w-md h-[65vh] max-h-[500px] bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl shadow-2xl flex flex-col z-40 transform transition-all duration-300 origin-bottom-right">
          <div className="bg-emerald-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
            <h3 className="font-bold text-lg">স্বাস্থ্য বন্ধু</h3>
          </div>
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex my-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-lg px-4 py-2 max-w-[80%] ${msg.sender === 'user' ? 'bg-emerald-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start my-2">
                 <div className="rounded-lg px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                    চিন্তা করছি...
                 </div>
              </div>
            )}
             {error && <p className="text-center text-sm text-red-500">{error}</p>}
            <div ref={messagesEndRef} />
          </div>
          <div className="border-t p-2 bg-white dark:bg-gray-800 dark:border-gray-700 flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage(input)}
              placeholder={'একটি প্রশ্ন জিজ্ঞাসা করুন...'}
              className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
              disabled={isLoading}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={isLoading || !input.trim()}
              className="ml-2 p-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 disabled:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              aria-label="Send message"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;