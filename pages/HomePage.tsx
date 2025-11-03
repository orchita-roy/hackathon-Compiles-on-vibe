import React from 'react';
import { Page } from '../types';
import { HeartIcon, MapIcon, MicrophoneIcon, ShieldCheckIcon, SunIcon, UsersIcon } from '../components/IconComponents';
import HeroSlider from '../components/HeroSlider';

interface HomePageProps {
  navigateTo: (page: Page) => void;
}

const HomePage: React.FC<HomePageProps> = ({ navigateTo }) => {
  const features = [
    { name: 'মানসিক স্বাস্থ্য পরীক্ষা', icon: HeartIcon, description: 'প্রতিদিন আপনার মানসিক অবস্থা ট্র্যাক করুন।' },
    { name: 'কমিউনিটি স্বাস্থ্য মানচিত্র', icon: MapIcon, description: 'স্থানীয় স্বাস্থ্য পরিষেবা খুঁজুন।' },
    { name: 'ভয়েস-ফার্স্ট সহকারী', icon: MicrophoneIcon, description: 'আপনার ভয়েসের মাধ্যমে সহায়তা পান।' },
    { name: 'ঋতুভিত্তিক স্বাস্থ্য টিপস', icon: SunIcon, description: 'সারা বছর সুস্থ থাকুন।' },
    { name: 'স্বেচ্ছাসেবক ডিরেক্টরি', icon: UsersIcon, description: 'স্বাস্থ্যকর্মীদের সাথে সংযোগ স্থাপন করুন।' },
    { name: 'নামবিহীন সাহায্যের অনুরোধ', icon: ShieldCheckIcon, description: 'গোপনে সাহায্য প্রার্থনা করুন।' },
  ];

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] text-white">
        <HeroSlider />
        <div className="relative z-10 flex flex-col items-center justify-center h-full container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.7)'}}>আপনার স্বাস্থ্য, আপনার সমাজ</h1>
          <p className="mt-4 text-lg md:text-xl text-gray-200 max-w-3xl mx-auto" style={{textShadow: '1px 1px 4px rgba(0,0,0,0.7)'}}>
            গ্রামীণ স্বাস্থ্যসেবার জন্য একটি নির্ভরযোগ্য সঙ্গী, আপনাকে এবং আপনার প্রিয়জনদের জন্য সহজে ব্যবহারযোগ্য সরঞ্জাম ও তথ্য প্রদান করছে।
          </p>
          <button
            onClick={() => navigateTo(Page.Missions)}
            className="mt-8 px-8 py-4 bg-white text-emerald-700 font-bold rounded-full shadow-lg hover:bg-emerald-50 dark:bg-gray-100 dark:text-emerald-800 dark:hover:bg-gray-200 transition-transform transform hover:scale-105"
          >
            অনুসন্ধান করুন
          </button>
        </div>
      </section>

      {/* Features List Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">উন্নত স্বাস্থ্যের জন্য আপনার যা কিছু প্রয়োজন</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">আমাদের সম্প্রদায়ের সুস্থতার জন্য ডিজাইন করা মিশনগুলি আবিষ্কার করুন।</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.name} className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-center h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full mb-6">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{feature.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">আপনার স্বাস্থ্যের নিয়ন্ত্রণ নিতে প্রস্তুত?</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            স্বাস্থ্য পরিষেবা খুঁজে পেতে এবং আপনার প্রশ্নের উত্তর পেতে আমাদের AI-চালিত সরঞ্জামগুলি ব্যবহার করুন।
          </p>
          <div className="mt-8 flex justify-center gap-4 flex-wrap">
            <button
              onClick={() => navigateTo(Page.CommunityHealthMap)}
              className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-full shadow-lg hover:bg-emerald-700 transition-transform transform hover:scale-105"
            >
              স্বাস্থ্য পরিষেবা খুঁজুন
            </button>
             <button
              onClick={() => navigateTo(Page.VoiceAssistant)}
              className="px-8 py-3 bg-gray-700 text-white font-bold rounded-full shadow-lg hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 transition-transform transform hover:scale-105"
            >
              সহকারীর সাথে কথা বলুন
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;