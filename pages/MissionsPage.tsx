

import React from 'react';
import { Mission, Page } from '../types';
import { HeartIcon, MapIcon, SunIcon, MicrophoneIcon, ClipboardDocumentCheckIcon, BookOpenIcon, CalendarDaysIcon, ClipboardDocumentListIcon, ChartBarIcon, QuestionMarkCircleIcon } from '../components/IconComponents';

interface MissionWithPage extends Mission {
    page?: Page;
}

const missions: MissionWithPage[] = [
    { id: 1, title: 'মানসিক স্বাস্থ্য পরীক্ষা', description: 'আপনার মানসিক সুস্থতা বুঝতে প্রতিদিন আপনার মেজাজ লগ করুন।', icon: ClipboardDocumentCheckIcon, page: Page.MentalHealthCheck },
    { id: 2, title: 'কমিউনিটি স্বাস্থ্য মানচিত্র', description: 'অফলাইনেও কাছাকাছি ক্লিনিক, ফার্মেসি এবং স্বাস্থ্যকর্মী খুঁজুন।', icon: MapIcon, page: Page.CommunityHealthMap },
    { id: 3, title: 'নামবিহীন সাহায্যের অনুরোধ', description: 'ব্যক্তিগতভাবে এবং নিরাপদে মানসিক স্বাস্থ্য সহায়তার জন্য একটি অনুরোধ পাঠান।', icon: QuestionMarkCircleIcon, page: Page.AnonymousHelpRequest },
    { id: 4, title: 'ঋতুভিত্তিক স্বাস্থ্য টিপস', description: 'বর্ষা, শীত এবং গ্রীষ্মের জন্য প্রাসঙ্গিক স্বাস্থ্য পরামর্শ পান।', icon: SunIcon, page: Page.SeasonalHealthTips },
    { id: 5, title: 'মাতৃ ও শিশু স্বাস্থ্য', description: 'অনুস্মারক সহ প্রসবপূর্ব যত্ন এবং টিকাদানের সময়সূচী ট্র্যাক করুন।', icon: HeartIcon, page: Page.MaternalAndChildHealth },
    { id: 6, title: 'উপসর্গ সচেতনতা নির্দেশিকা', description: 'উপসর্গগুলি বুঝুন এবং কখন পেশাদার সাহায্য নিতে হবে তা জানুন।', icon: BookOpenIcon, page: Page.SymptomAwarenessGuide },
    { id: 7, title: 'কমিউনিটি স্বাস্থ্য ইভেন্ট', description: 'টিকাদান শিবিরের মতো স্থানীয় স্বাস্থ্য ইভেন্টগুলি খুঁজুন এবং RSVP করুন।', icon: CalendarDaysIcon, page: Page.CommunityHealthEvents },
    { id: 8, title: 'স্বেচ্ছাসেবক কর্মী ডিরেক্টরি', description: 'গ্রাম বা দক্ষতা দ্বারা যাচাইকৃত কমিউনিটি স্বাস্থ্য কর্মীদের জন্য অনুসন্ধান করুন।', icon: ClipboardDocumentListIcon, page: Page.VolunteerDirectory },
    { id: 10, title: 'ভয়েস-ফার্স্ট স্বাস্থ্য সহকারী', description: 'সকল স্তরের সাক্ষরতার জন্য ডিজাইন করা স্বাস্থ্য তথ্যের জন্য আপনার ভয়েস ব্যবহার করুন।', icon: MicrophoneIcon, page: Page.VoiceAssistant },
];

interface MissionsPageProps {
  navigateTo: (page: Page) => void;
}

const MissionsPage: React.FC<MissionsPageProps> = ({ navigateTo }) => {
    return (
        <div className="bg-stone-50 dark:bg-slate-900">
            {/* Hero Section */}
            <header className="relative h-[60vh] min-h-[450px] text-white overflow-hidden">
                <div 
                    className="absolute inset-0 w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: "url('https://satu-bd.org/wp-content/uploads/2018/04/slide-3.jpg')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent"></div>
                <div className="relative z-10 flex flex-col items-center justify-center h-full container mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.6)' }}>
                        আমাদের মিশন
                    </h1>
                    <p className="mt-4 text-lg md:text-xl text-stone-200 max-w-3xl mx-auto" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>
                        আমরা মানসিক, মাতৃ এবং প্রতিরোধমূলক যত্ন সহ নয়টি কেন্দ্রবিন্দু মিশনের মাধ্যমে সম্প্রদায়ের স্বাস্থ্যের উন্নতিতে নিবেদিত।
                    </p>
                </div>
            </header>
            
            {/* Main Content Section */}
            <main className="container mx-auto px-6 py-20">
                {/* Features List Section */}
                <section>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {missions.map((mission) => (
                             <button
                                key={mission.id}
                                onClick={mission.page !== undefined ? () => navigateTo(mission.page) : undefined}
                                disabled={mission.page === undefined}
                                className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-300 disabled:cursor-default disabled:hover:scale-100 disabled:opacity-80"
                            >
                                <div className="bg-teal-100 text-teal-600 rounded-full p-4 mb-4">
                                    <mission.icon className="h-10 w-10" />
                                </div>
                                <h2 className="text-2xl font-bold text-stone-800 dark:text-white mb-2">{mission.title}</h2>
                                <p className="text-stone-600 dark:text-stone-400 flex-grow">{mission.description}</p>
                            </button>
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="text-center mt-20">
                    <h2 className="text-3xl font-bold text-stone-800 dark:text-stone-100">একটি স্বাস্থ্যকর সমাজ গঠনে আমাদের সাথে যোগ দিন</h2>
                    <p className="mt-4 text-lg text-stone-600 dark:text-stone-400">আপনি কীভাবে উপকৃত হতে পারেন এবং অবদান রাখতে পারেন তা দেখতে প্রতিটি মিশন অন্বেষণ করুন।</p>
                </section>
            </main>
        </div>
    );
};

export default MissionsPage;