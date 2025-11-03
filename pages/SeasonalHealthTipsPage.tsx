
import React, { useState, ComponentType } from 'react';
import { SunIcon, ShareIcon, SpeakerWaveIcon, CloudRainIcon, SnowflakeIcon } from '../components/IconComponents';

type Season = 'monsoon' | 'winter' | 'summer';

interface HealthTip {
    icon: ComponentType<{ className?: string }>;
    title: string;
    text: string;
}

const tipsData: Record<Season, HealthTip[]> = {
    monsoon: [
        {
            icon: CloudRainIcon,
            title: 'ডেঙ্গু প্রতিরোধ',
            text: 'জমা পানি ডেঙ্গু মশার জন্মস্থান। আপনার বাড়ির চারপাশে পানি জমতে দেবেন না। দিনে ও রাতে মশারি ব্যবহার করুন।',
        },
        {
            icon: CloudRainIcon,
            title: 'বিশুদ্ধ পানি পান করুন',
            text: 'বর্ষাকালে পানিবাহিত রোগ বাড়ে। সর্বদা ১০ মিনিট ধরে ফোটানো বা ফিল্টার করা বিশুদ্ধ পানি পান করুন।',
        },
        {
            icon: CloudRainIcon,
            title: 'ভেজা কাপড় এড়িয়ে চলুন',
            text: 'ভেজা কাপড়ে ছত্রাকের সংক্রমণ হতে পারে। বৃষ্টিতে ভিজলে যত তাড়াতাড়ি সম্ভব শুকনো কাপড় পরুন।',
        },
    ],
    winter: [
        {
            icon: SnowflakeIcon,
            title: 'সর্দি-কাশি থেকে সুরক্ষা',
            text: 'শীতকালে ঠান্ডা ও ফ্লু সাধারণ। গরম পোশাক পরুন, ভিটামিন-সি সমৃদ্ধ খাবার খান এবং নিয়মিত হাত ধুয়ে নিন।',
        },
        {
            icon: SnowflakeIcon,
            title: 'ত্বকের যত্ন নিন',
            text: 'ঠান্ডা আবহাওয়ায় ত্বক শুষ্ক হয়ে যায়। ত্বককে আর্দ্র রাখতে ময়েশ্চারাইজার ব্যবহার করুন এবং প্রচুর পানি পান করুন।',
        },
        {
            icon: SnowflakeIcon,
            title: 'গরম ও পুষ্টিকর খাবার',
            text: 'শরীর গরম রাখতে গরম স্যুপ, চা এবং পুষ্টিকর খাবার গ্রহণ করুন। এটি রোগ প্রতিরোধ ক্ষমতা বাড়াতে সাহায্য করে।',
        },
    ],
    summer: [
        {
            icon: SunIcon,
            title: 'ডায়রিয়া এবং ডিহাইড্রেশন',
            text: 'গরমকালে ডায়রিয়া এবং পানিশূন্যতা একটি বড় সমস্যা। প্রচুর পরিমাণে বিশুদ্ধ পানি এবং খাবার স্যালাইন পান করুন।',
        },
        {
            icon: SunIcon,
            title: 'হিট স্ট্রোক থেকে বাঁচুন',
            text: 'তীব্র গরমে সরাসরি সূর্যের আলো এড়িয়ে চলুন। দিনের বেলায়, বিশেষ করে দুপুর ১২টা থেকে বিকেল ৪টা পর্যন্ত বাড়ির ভিতরে থাকুন।',
        },
        {
            icon: SunIcon,
            title: 'সহজপাচ্য খাবার খান',
            text: 'হালকা এবং সহজপাচ্য খাবার খান। অতিরিক্ত তেল ও মশলাযুক্ত খাবার এড়িয়ে চলুন, কারণ এটি হজমে সমস্যা করতে পারে।',
        },
    ],
};

const seasonTabs: { id: Season; label: string; icon: ComponentType<{ className?: string }> }[] = [
    { id: 'monsoon', label: 'বর্ষা', icon: CloudRainIcon },
    { id: 'winter', label: 'শীত', icon: SnowflakeIcon },
    { id: 'summer', label: 'গ্রীষ্ম', icon: SunIcon },
];

const SeasonalHealthTipsPage: React.FC = () => {
    const [activeSeason, setActiveSeason] = useState<Season>('monsoon');

    const handleReadAloud = (textToRead: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(textToRead);
            utterance.lang = 'bn-BD';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        } else {
            alert('দুঃখিত, আপনার ব্রাউজার এই বৈশিষ্ট্যটি সমর্থন করে না।');
        }
    };

    const handleShare = async (title: string, text: string) => {
        const shareData = {
            title: `স্বাস্থ্য বন্ধু টিপস: ${title}`,
            text: text,
            url: window.location.href,
        };
        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error("Share failed:", err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}`);
                alert('টিপসটি ক্লিপবোর্ডে অনুলিপি করা হয়েছে!');
            } catch (err) {
                alert('দুঃখিত, এই টিপসটি শেয়ার করা যায়নি।');
            }
        }
    };

    return (
        <div className="bg-stone-50 dark:bg-slate-900 py-12 min-h-[calc(100vh-8rem)]">
            <div className="container mx-auto px-6">
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-stone-800 dark:text-stone-100">ঋতুভিত্তিক স্বাস্থ্য টিপস</h1>
                    <p className="mt-4 text-lg text-stone-600 dark:text-stone-400 max-w-3xl mx-auto">
                        প্রতি ঋতুতে সুস্থ থাকার জন্য প্রতিরোধমূলক স্বাস্থ্য পরামর্শ।
                    </p>
                </header>

                <section className="max-w-4xl mx-auto">
                    {/* Season Tabs */}
                    <div className="mb-8 flex justify-center border-b border-stone-200 dark:border-slate-700">
                        {seasonTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveSeason(tab.id)}
                                className={`flex items-center space-x-2 px-4 sm:px-6 py-3 text-sm sm:text-base font-medium transition-colors -mb-px ${
                                    activeSeason === tab.id
                                        ? 'border-b-2 border-teal-500 text-teal-600 dark:text-teal-400'
                                        : 'text-stone-500 hover:text-teal-600 dark:text-stone-400 dark:hover:text-teal-400 border-b-2 border-transparent'
                                }`}
                            >
                                <tab.icon className="h-5 w-5" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Tips Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {tipsData[activeSeason].map((tip, index) => (
                            <div key={index} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 flex flex-col">
                                <div className="flex items-center mb-4">
                                    <div className="bg-teal-100 text-teal-600 rounded-full p-3 mr-4">
                                        <tip.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-stone-800 dark:text-white">{tip.title}</h3>
                                </div>
                                <p className="text-stone-600 dark:text-stone-400 flex-grow mb-6">{tip.text}</p>
                                <div className="flex justify-end space-x-2 mt-auto border-t border-stone-100 dark:border-slate-700 pt-4">
                                    <button
                                        onClick={() => handleReadAloud(`${tip.title}। ${tip.text}`)}
                                        className="p-2 rounded-full text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-slate-700 transition-colors"
                                        aria-label="পড়ে শোনান"
                                    >
                                        <SpeakerWaveIcon className="h-6 w-6" />
                                    </button>
                                    <button
                                        onClick={() => handleShare(tip.title, tip.text)}
                                        className="p-2 rounded-full text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-slate-700 transition-colors"
                                        aria-label="শেয়ার করুন"
                                    >
                                        <ShareIcon className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SeasonalHealthTipsPage;
