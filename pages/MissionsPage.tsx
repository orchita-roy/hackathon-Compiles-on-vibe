import React from 'react';
import { Mission } from '../types';
import { HeartIcon, MapIcon, ShieldCheckIcon, SunIcon, UsersIcon, MicrophoneIcon } from '../components/IconComponents';

const missions: Mission[] = [
    { id: 1, title: 'Mental Health Check-In', description: 'Log your mood daily to understand your mental well-being.', icon: HeartIcon },
    { id: 2, title: 'Community Health Map', description: 'Find nearby clinics, pharmacies, and health workers, even offline.', icon: MapIcon },
    { id: 3, title: 'Anonymous Help Request', description: 'Send a request for mental health support privately and securely.', icon: ShieldCheckIcon },
    { id: 4, title: 'Seasonal Health Tips', description: 'Get relevant health advice for monsoon, winter, and summer.', icon: SunIcon },
    { id: 5, title: 'Maternal & Child Health', description: 'Track antenatal care and vaccination schedules with reminders.', icon: HeartIcon },
    { id: 6, title: 'Symptom Awareness Guide', description: 'Understand symptoms and learn when to seek professional help.', icon: HeartIcon },
    { id: 7, title: 'Community Health Events', description: 'Find and RSVP to local health events like vaccination camps.', icon: UsersIcon },
    { id: 8, title: 'Volunteer Worker Directory', description: 'Search for verified Community Health Workers by village or skill.', icon: UsersIcon },
    { id: 9, title: 'Health Data Export', description: 'NGOs can view anonymized trends to improve health planning.', icon: UsersIcon },
    { id: 10, title: 'Voice-First Health Assistant', description: 'Use your voice to ask for health information, designed for all literacy levels.', icon: MicrophoneIcon },
];

const MissionsPage: React.FC = () => {
    return (
        <div className="bg-white dark:bg-gray-900 py-12">
            <div className="container mx-auto px-6">
                {/* Header Section */}
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-gray-100">Our Missions</h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                        We are dedicated to improving community health through ten focused missions, addressing mental, maternal, and preventive care.
                    </p>
                </header>

                {/* Features List Section */}
                <section>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {missions.map((mission) => (
                            <div key={mission.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg p-8 flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-300">
                                <div className="bg-emerald-100 text-emerald-600 rounded-full p-4 mb-4">
                                    <mission.icon className="h-10 w-10" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{mission.title}</h2>
                                <p className="text-gray-600 dark:text-gray-400 flex-grow">{mission.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="text-center mt-20">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Join Us in Building a Healthier Community</h2>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Explore each mission to see how you can benefit and contribute.</p>
                </section>
            </div>
        </div>
    );
};

export default MissionsPage;