import React from 'react';
import { Page } from '../types';
import { HeartIcon, MapIcon, MicrophoneIcon, ShieldCheckIcon, SunIcon, UsersIcon } from '../components/IconComponents';
import HeroSlider from '../components/HeroSlider';

interface HomePageProps {
  navigateTo: (page: Page) => void;
}

const HomePage: React.FC<HomePageProps> = ({ navigateTo }) => {
  const features = [
    { name: 'Mental Health Check-In', icon: HeartIcon, description: 'Track your mood daily.' },
    { name: 'Community Health Map', icon: MapIcon, description: 'Find local health services.' },
    { name: 'Voice-First Assistant', icon: MicrophoneIcon, description: 'Get help with your voice.' },
    { name: 'Seasonal Health Tips', icon: SunIcon, description: 'Stay healthy year-round.' },
    { name: 'Volunteer Directory', icon: UsersIcon, description: 'Connect with health workers.' },
    { name: 'Anonymous Help Request', icon: ShieldCheckIcon, description: 'Seek help privately.' },
  ];

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] text-white">
        <HeroSlider />
        <div className="relative z-10 flex flex-col items-center justify-center h-full container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.7)'}}>Your Health, Your Community</h1>
          <p className="mt-4 text-lg md:text-xl text-gray-200 max-w-3xl mx-auto" style={{textShadow: '1px 1px 4px rgba(0,0,0,0.7)'}}>
            A trusted partner for rural health, providing accessible tools and information to empower you and your loved ones.
          </p>
          <button
            onClick={() => navigateTo(Page.Missions)}
            className="mt-8 px-8 py-4 bg-white text-emerald-700 font-bold rounded-full shadow-lg hover:bg-emerald-50 dark:bg-gray-100 dark:text-emerald-800 dark:hover:bg-gray-200 transition-transform transform hover:scale-105"
          >
            Explore Our Missions
          </button>
        </div>
      </section>

      {/* Features List Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">Everything You Need for Better Health</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Discover missions designed for our community's well-being.</p>
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

      {/* Benefits Section */}
      <section className="bg-gray-100 dark:bg-black py-20">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">Designed for You</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">We focus on what matters most: accessibility, privacy, and local relevance.</p>
            <div className="mt-12 grid md:grid-cols-3 gap-8">
                <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Works Offline</h3>
                    <p className="text-gray-600 dark:text-gray-400">Access vital information even without an internet connection.</p>
                </div>
                <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Your Privacy Matters</h3>
                    <p className="text-gray-600 dark:text-gray-400">Your data is stored securely on your device.</p>
                </div>
                <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Localized Content</h3>
                    <p className="text-gray-600 dark:text-gray-400">Health tips and resources relevant to your area and language.</p>
                </div>
            </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">Ready to Take Control of Your Health?</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Use our AI-powered tools to find health services and get answers to your questions.
          </p>
          <div className="mt-8 flex justify-center gap-4 flex-wrap">
            <button
              onClick={() => navigateTo(Page.CommunityHealthMap)}
              className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-full shadow-lg hover:bg-emerald-700 transition-transform transform hover:scale-105"
            >
              Find Health Services
            </button>
             <button
              onClick={() => navigateTo(Page.VoiceAssistant)}
              className="px-8 py-3 bg-gray-700 text-white font-bold rounded-full shadow-lg hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 transition-transform transform hover:scale-105"
            >
              Talk to Assistant
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
