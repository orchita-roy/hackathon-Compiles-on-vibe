import React, { useState, useRef } from 'react';
import { HealthTopic, Notification } from '../types';
import { SpeakerWaveIcon, ExclamationTriangleIcon, SparklesIcon, ChevronDownIcon, BookOpenIcon, CheckCircleIcon, ShareIcon } from '../components/IconComponents';
import { getShareableUrl } from '../utils/shareUtils';
import { generateSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';

const healthTopicsData: HealthTopic[] = [
    {
        category: 'সাধারণ',
        title: 'জ্বর',
        worry: [
            'জ্বর ১০৩°F (৩৯.৪°C) এর বেশি হলে',
            'টানা তিন দিনের বেশি জ্বর থাকলে',
            'জ্বরের সাথে তীব্র মাথাব্যথা, শ্বাসকষ্ট বা খিঁচুনি হলে',
            'শরীরে র‍্যাশ বা ফুসকুড়ি দেখা দিলে'
        ],
        dos: [
            'প্রচুর পরিমাণে পানি, ফলের রস ও তরল খাবার গ্রহণ করুন।',
            'কপাল ও শরীর মোছার জন্য হালকা গরম পানি ব্যবহার করুন।',
            'পরিপূর্ণ বিশ্রামে থাকুন।',
            'ডাক্তারের পরামর্শ অনুযায়ী প্যারাসিটামল সেবন করুন।'
        ],
        myths: [
            { myth: 'বেশি কাঁথা-কম্বল চাপা দিয়ে ঘাম ঝরালে জ্বর দ্রুত সারে।', reality: 'এটি শরীরের তাপমাত্রা আরও বাড়িয়ে ডিহাইড্রেশনের ঝুঁকি তৈরি করে, যা বিপজ্জনক হতে পারে।' }
        ]
    },
    {
        category: 'পেট',
        title: 'ডায়রিয়া',
        worry: [
            'দিনে ১০ বারের বেশি পাতলা পায়খানা হলে',
            'পায়খানার সাথে রক্ত বা শ্লেষ্মা (আম) গেলে',
            'শরীর খুব দুর্বল হয়ে গেলে, মুখ শুকিয়ে গেলে বা প্রস্রাব কমে গেলে',
            'ডায়রিয়া তিন দিনের বেশি স্থায়ী হলে'
        ],
        dos: [
            'প্রতিবার পাতলা পায়খানার পর পর্যাপ্ত পরিমাণে খাবার স্যালাইন পান করুন।',
            'সহজপাচ্য খাবার যেমন- ভাতের মাড়, কাঁচকলা সেদ্ধ, ডাবের পানি ও স্যুপ খান।',
            'জিংক ট্যাবলেট (ডাক্তারের পরামর্শে) গ্রহণ করুন।'
        ],
        myths: [
            { myth: 'ডায়রিয়া হলে সব ধরনের খাবার ও পানি খাওয়া বন্ধ করে দিতে হয়।', reality: 'এটি শরীরকে আরও পানিশূন্য ও দুর্বল করে ফেলে। শরীরকে সচল রাখতে খাবার স্যালাইনের পাশাপাশি সহজপাচ্য খাবার খাওয়া চালিয়ে যাওয়া জরুরি।' }
        ]
    },
    {
        category: 'বুক',
        title: 'কাশি এবং ঠান্ডা',
        worry: [
            'শ্বাস নিতে কষ্ট বা বুকে ব্যথা হলে',
            'কাশির সাথে সবুজ, হলুদ বা রক্ত মিশ্রিত কফ বের হলে',
            'টানা দুই সপ্তাহের বেশি কাশি থাকলে'
        ],
        dos: [
            'গরম পানিতে লবণ মিশিয়ে গার্গল করুন।',
            'আদা, লেবু ও মধু দিয়ে গরম চা পান করুন।',
            'ধোঁয়া ও ধুলোবালি এড়িয়ে চলুন।'
        ],
        myths: [
            { myth: 'অ্যান্টিবায়োটিক খেলেই কাশি দ্রুত ভালো হয়ে যায়।', reality: 'বেশিরভাগ কাশির কারণ ভাইরাস, যেখানে অ্যান্টিবায়োটিক কাজ করে না। ডাক্তারের পরামর্শ ছাড়া অ্যান্টিবায়োটিক সেবন করলে তা শরীরের জন্য ক্ষতিকর হতে পারে।' }
        ]
    },
    {
        category: 'মাথা',
        title: 'মাথাব্যথা',
        worry: [
            'হঠাৎ করে তীব্র ও অসহ্য মাথাব্যথা শুরু হলে',
            'মাথাব্যথার সাথে জ্বর, ঘাড় শক্ত হয়ে যাওয়া, বা কথা বলতে অসুবিধা হলে',
            'মাথায় আঘাত পাওয়ার পর মাথাব্যথা শুরু হলে'
        ],
        dos: [
            'শান্ত ও অন্ধকার ঘরে বিশ্রাম নিন।',
            'কপালে ঠান্ডা বা গরম সেঁক দিতে পারেন।',
            'পর্যাপ্ত পরিমাণে পানি পান করুন।',
            'ডাক্তারের পরামর্শে ব্যথানাশক গ্রহণ করতে পারেন।'
        ],
        myths: [
            { myth: 'সব মাথাব্যথাই মাইগ্রেনের কারণে হয়।', reality: 'মাথাব্যথার অনেক কারণ থাকতে পারে, যেমন- টেনশন, ডিহাইড্রেশন বা অন্যান্য শারীরিক সমস্যা। সঠিক কারণ নির্ণয়ের জন্য ডাক্তারের পরামর্শ নেওয়া উচিত।' }
        ]
    }
];

const categories: (HealthTopic['category'] | 'সব')[] = ['সব', 'সাধারণ', 'পেট', 'বুক', 'মাথা'];

interface SymptomAwarenessGuidePageProps {
    addNotification: (message: string, type?: Notification['type']) => void;
}

const SymptomAwarenessGuidePage: React.FC<SymptomAwarenessGuidePageProps> = ({ addNotification }) => {
    const [activeCategory, setActiveCategory] = useState<HealthTopic['category'] | 'সব'>('সব');
    const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
    const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
    
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

    const stopCurrentPlayback = () => {
        if (audioSourceRef.current) {
            audioSourceRef.current.stop();
            audioSourceRef.current.disconnect();
            audioSourceRef.current = null;
        }
        setCurrentlyPlaying(null);
    };

    const handleReadAloud = async (sectionId: string, textsToRead: string[]) => {
        if (currentlyPlaying === sectionId) {
            stopCurrentPlayback();
            return;
        }

        stopCurrentPlayback();

        try {
            setCurrentlyPlaying(sectionId);

            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                audioContextRef.current = new AudioContext({ sampleRate: 24000 });
            }
            await audioContextRef.current.resume();
            
            const fullText = textsToRead.join('. ');
            const base64Audio = await generateSpeech(fullText);

            if (base64Audio && audioContextRef.current) {
                const audioData = decode(base64Audio);
                const audioBuffer = await decodeAudioData(audioData, audioContextRef.current, 24000, 1);

                const source = audioContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContextRef.current.destination);
                source.start(0);

                audioSourceRef.current = source;

                source.onended = () => {
                    if (audioSourceRef.current === source) {
                        setCurrentlyPlaying(null);
                        audioSourceRef.current = null;
                    }
                };
            } else {
                throw new Error('Failed to generate or decode audio.');
            }
        } catch (error) {
            console.error('Error handling audio playback:', error);
            addNotification('দুঃখিত, অডিও চালাতে একটি সমস্যা হয়েছে।', 'error');
            setCurrentlyPlaying(null);
        }
    };

    const handleShare = async (topic: HealthTopic) => {
        const title = `স্বাস্থ্য বন্ধু নির্দেশিকা: ${topic.title}`;
        const worryText = `কখন চিন্তা করবেন:\n- ${topic.worry.join('\n- ')}`;
        const dosText = `কী করণীয়:\n- ${topic.dos.join('\n- ')}`;
        const fullText = `${title}\n\n${worryText}\n\n${dosText}`;

        const shareData = {
            title: title,
            text: fullText,
            url: getShareableUrl(),
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error("Share failed (user might have cancelled):", err);
            }
        } else {
            // Fallback for browsers that don't support navigator.share
            const subject = encodeURIComponent(shareData.title);
            const body = encodeURIComponent(shareData.text);
            const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
            window.location.href = mailtoLink;
            addNotification('ইমেইল ক্লায়েন্ট খোলা হচ্ছে...', 'info');
        }
    };

    const toggleTopic = (title: string) => {
        if (expandedTopic !== title && currentlyPlaying) {
            stopCurrentPlayback();
        }
        setExpandedTopic(prev => (prev === title ? null : title));
    };

    const filteredTopics = activeCategory === 'সব' ? healthTopicsData : healthTopicsData.filter(topic => topic.category === activeCategory);

    return (
        <div className="bg-stone-50 dark:bg-slate-900 py-12 min-h-[calc(100vh-8rem)]">
            <div className="container mx-auto px-6">
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-stone-800 dark:text-stone-100">উপসর্গ সচেতনতা নির্দেশিকা</h1>
                    <p className="mt-4 text-lg text-stone-600 dark:text-stone-400 max-w-3xl mx-auto">
                        সাধারণ স্বাস্থ্য উপসর্গ সম্পর্কে জানুন এবং কখন পেশাদার সাহায্য নিতে হবে তা বুঝুন।
                    </p>
                </header>

                <section className="max-w-4xl mx-auto">
                    <div className="mb-8 flex flex-wrap justify-center gap-2">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                    activeCategory === category
                                        ? 'bg-teal-600 text-white'
                                        : 'bg-white dark:bg-slate-800 text-stone-700 dark:text-stone-300 hover:bg-teal-100 dark:hover:bg-slate-700'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        {filteredTopics.map((topic) => (
                            <div key={topic.title} className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
                                <button onClick={() => toggleTopic(topic.title)} className="w-full flex justify-between items-center p-4 sm:p-6 text-left">
                                    <div className="flex items-center">
                                        <BookOpenIcon className="h-8 w-8 text-teal-500 mr-4" />
                                        <h2 className="text-xl font-bold text-stone-800 dark:text-white">{topic.title}</h2>
                                    </div>
                                    <ChevronDownIcon className={`h-6 w-6 text-stone-500 dark:text-stone-400 transition-transform ${expandedTopic === topic.title ? 'rotate-180' : ''}`} />
                                </button>
                                {expandedTopic === topic.title && (
                                    <div className="p-4 sm:p-6 pt-0">
                                        {/* When to Worry */}
                                        <div className="mb-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="flex items-center text-lg font-bold text-red-600 dark:text-red-400">
                                                    <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                                                    কখন চিন্তা করবেন
                                                </h3>
                                                <button 
                                                    onClick={() => handleReadAloud(`${topic.title}-worry`, ['কখন চিন্তা করবেন', ...topic.worry])} 
                                                    className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-slate-700"
                                                    aria-label="পড়ে শোনান"
                                                    disabled={currentlyPlaying !== null && currentlyPlaying !== `${topic.title}-worry`}
                                                >
                                                    {currentlyPlaying === `${topic.title}-worry` ? (
                                                        <div className="animate-pulse">
                                                            <SpeakerWaveIcon className="h-5 w-5 text-teal-500" />
                                                        </div>
                                                    ) : (
                                                        <SpeakerWaveIcon className="h-5 w-5 text-stone-500" />
                                                    )}
                                                </button>
                                            </div>
                                            <ul className="list-disc list-inside space-y-1 text-stone-600 dark:text-stone-400">
                                                {topic.worry.map((item, i) => <li key={i}>{item}</li>)}
                                            </ul>
                                        </div>

                                        {/* What to Do */}
                                        <div className="mb-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="flex items-center text-lg font-bold text-green-600 dark:text-green-400">
                                                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                                                    কী করণীয়
                                                </h3>
                                                 <button 
                                                    onClick={() => handleReadAloud(`${topic.title}-dos`, ['কী করণীয়', ...topic.dos])} 
                                                    className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-slate-700" 
                                                    aria-label="পড়ে শোনান"
                                                    disabled={currentlyPlaying !== null && currentlyPlaying !== `${topic.title}-dos`}
                                                >
                                                    {currentlyPlaying === `${topic.title}-dos` ? (
                                                        <div className="animate-pulse">
                                                            <SpeakerWaveIcon className="h-5 w-5 text-teal-500" />
                                                        </div>
                                                    ) : (
                                                        <SpeakerWaveIcon className="h-5 w-5 text-stone-500" />
                                                    )}
                                                </button>
                                            </div>
                                            <ul className="list-disc list-inside space-y-1 text-stone-600 dark:text-stone-400">
                                                {topic.dos.map((item, i) => <li key={i}>{item}</li>)}
                                            </ul>
                                        </div>

                                        {/* Avoid Myths */}
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="flex items-center text-lg font-bold text-blue-600 dark:text-blue-400">
                                                    <SparklesIcon className="h-5 w-5 mr-2" />
                                                    ভুল ধারণা এড়িয়ে চলুন
                                                </h3>
                                                <button 
                                                    onClick={() => handleReadAloud(`${topic.title}-myths`, ['ভুল ধারণা এড়িয়ে চলুন', ...topic.myths.map(m => `ভুল ধারণা: ${m.myth}. বাস্তবতা: ${m.reality}`)])} 
                                                    className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-slate-700" 
                                                    aria-label="পড়ে শোনান"
                                                    disabled={currentlyPlaying !== null && currentlyPlaying !== `${topic.title}-myths`}
                                                >
                                                    {currentlyPlaying === `${topic.title}-myths` ? (
                                                        <div className="animate-pulse">
                                                            <SpeakerWaveIcon className="h-5 w-5 text-teal-500" />
                                                        </div>
                                                    ) : (
                                                        <SpeakerWaveIcon className="h-5 w-5 text-stone-500" />
                                                    )}
                                                </button>
                                            </div>
                                            {topic.myths.map((item, i) => (
                                                <div key={i} className="p-3 bg-stone-50 dark:bg-slate-700/50 rounded-lg">
                                                    <p className="text-sm text-stone-600 dark:text-stone-400"><strong className="text-stone-700 dark:text-stone-300">ভুল ধারণা:</strong> {item.myth}</p>
                                                    <p className="text-sm text-stone-700 dark:text-stone-300 mt-1"><strong className="text-teal-600 dark:text-teal-400">বাস্তবতা:</strong> {item.reality}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Share button */}
                                        <div className="border-t border-stone-200 dark:border-slate-700 mt-6 pt-4 flex justify-end items-center gap-4">
                                            <button 
                                                onClick={() => handleShare(topic)}
                                                className="inline-flex items-center px-4 py-2 bg-slate-100 dark:bg-slate-700 text-stone-700 dark:text-stone-300 font-medium rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                                aria-label="এই তথ্য শেয়ার করুন"
                                            >
                                                <ShareIcon className="h-5 w-5 mr-2" />
                                                শেয়ার করুন
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SymptomAwarenessGuidePage;