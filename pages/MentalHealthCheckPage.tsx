import React, { useState, useEffect, useMemo } from 'react';
import { MentalHealthCheckin, Mood } from '../types';
import { InformationCircleIcon } from '../components/IconComponents';

const STORAGE_KEY = 'mentalHealthCheckins';

const moodOptions: { mood: Mood; emoji: string; label: string, color: string }[] = [
  { mood: 'happy', emoji: '😊', label: 'খুশি', color: 'text-green-500' },
  { mood: 'calm', emoji: '😌', label: 'শান্ত', color: 'text-blue-500' },
  { mood: 'neutral', emoji: '😐', label: 'সাধারণ', color: 'text-yellow-500' },
  { mood: 'sad', emoji: '😔', label: 'দুঃখিত', color: 'text-indigo-500' },
  { mood: 'anxious', emoji: '😟', label: 'উদ্বিগ্ন', color: 'text-purple-500' },
];

const wellnessTips: Record<Mood, string> = {
  happy: 'দারুণ! এই অনুভূতিটি ধরে রাখতে আপনার পছন্দের কিছু করুন।',
  calm: 'শান্তি অমূল্য। মননশীলতার জন্য কিছুক্ষণ সময় নিন।',
  neutral: 'ঠিক আছে অনুভব করাও ঠিক আছে। আপনার শরীরের কথা শুনুন, বিশ্রামের প্রয়োজন হতে পারে।',
  sad: 'মনে রাখবেন এই অনুভূতি সাময়িক। বিশ্বস্ত কারো সাথে কথা বলুন।',
  anxious: 'গভীর শ্বাস নিন। আপনার ইন্দ্রিয়কে শান্ত করতে পারে এমন কিছুর উপর মনোযোগ দিন।',
};

const moodValue: Record<Mood, number> = { happy: 5, calm: 4, neutral: 3, sad: 2, anxious: 1 };

const TrendsChart: React.FC<{ data: MentalHealthCheckin[] }> = ({ data }) => {
    const last7DaysData = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const checkinForDay = data.find(c => new Date(c.date).toDateString() === date.toDateString());
            days.push({ date, checkin: checkinForDay });
        }
        return days;
    }, [data]);

    const points = useMemo(() => {
        return last7DaysData
            .map((day, index) => {
                if (!day.checkin) return null;
                const mood = moodValue[day.checkin.mood]; // 1 to 5
                return {
                    x: (index / 6) * 100, // percentage from 0 to 100
                    y: 100 - ((mood - 1) / 4) * 80 - 10, // percentage from 10 (top) to 90 (bottom)
                    mood: day.checkin.mood,
                    label: moodOptions.find(m => m.mood === day.checkin.mood)?.label,
                    date: day.date
                };
            })
            .filter((p): p is { x: number; y: number; mood: Mood; label: string; date: Date } => p !== null && p.label !== undefined);
    }, [last7DaysData]);

    const pathData = useMemo(() => {
        if (points.length < 2) return '';
        return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    }, [points]);

    const moodColorSVG: Record<Mood, string> = { 
        happy: 'stroke-green-500 fill-green-500', 
        calm: 'stroke-blue-500 fill-blue-500',
        neutral: 'stroke-yellow-500 fill-yellow-500',
        sad: 'stroke-indigo-500 fill-indigo-500',
        anxious: 'stroke-purple-500 fill-purple-500'
    };
    
    return (
        <div>
            <h3 className="text-xl font-bold text-stone-800 dark:text-white mb-4">গত ৭ দিনের ট্রেন্ড</h3>
            {points.length < 2 && (
                <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400 mb-4 text-center">
                    {data.length === 1 ? 'এটি আপনার প্রথম চেক-ইন। আপনার মানসিক স্বাস্থ্যের ট্রেন্ড দেখতে থাকুন!' : 'গত ৭ দিনের ট্রেন্ড দেখতে কমপক্ষে দুটি চেক-ইন প্রয়োজন।'}
                </p>
            )}
            <div className="relative h-60 bg-stone-100 dark:bg-slate-700 p-4 rounded-lg">
                <svg width="100%" height="100%" viewBox="0 0 100 120" preserveAspectRatio="xMidYMin meet" aria-label="মানসিক স্বাস্থ্যের ট্রেন্ড চার্ট">
                    {/* Grid lines for moods */}
                    <line x1="0" y1="10" x2="100" y2="10" className="stroke-stone-200 dark:stroke-slate-600" strokeWidth="0.5" strokeDasharray="2,2" />
                    <line x1="0" y1="30" x2="100" y2="30" className="stroke-stone-200 dark:stroke-slate-600" strokeWidth="0.5" strokeDasharray="2,2" />
                    <line x1="0" y1="50" x2="100" y2="50" className="stroke-stone-200 dark:stroke-slate-600" strokeWidth="0.5" strokeDasharray="2,2" />
                    <line x1="0" y1="70" x2="100" y2="70" className="stroke-stone-200 dark:stroke-slate-600" strokeWidth="0.5" strokeDasharray="2,2" />
                    <line x1="0" y1="90" x2="100" y2="90" className="stroke-stone-200 dark:stroke-slate-600" strokeWidth="0.5" strokeDasharray="2,2" />
                    
                    {/* Trend line */}
                    {pathData && <path d={pathData} fill="none" className="stroke-teal-500" strokeWidth="1.5" />}

                    {/* Data points */}
                    {points.map((p, i) => (
                        <circle 
                            key={i} 
                            cx={p.x} 
                            cy={p.y} 
                            r="2.5" 
                            className={`${moodColorSVG[p.mood]}`}
                        >
                            <title>{`${p.date.toLocaleDateString('bn-BD')}: ${p.label}`}</title>
                        </circle>
                    ))}

                    {/* X-axis labels */}
                    {last7DaysData.map((day, index) => {
                        const x = (index / 6) * 100;
                        return (
                             <text
                                key={index}
                                x={x}
                                y="108"
                                textAnchor="end"
                                className="text-[10px] fill-stone-600 dark:fill-stone-400 font-sans"
                                transform={`rotate(-45 ${x} 108)`}
                            >
                                {day.date.toLocaleDateString('bn-BD', { weekday: 'short' }).slice(0, 3)}
                            </text>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
};

const HistoryList: React.FC<{ checkins: MentalHealthCheckin[] }> = ({ checkins }) => {
    return (
        <div>
            <h3 className="text-xl font-bold text-stone-800 dark:text-white mb-4">সাম্প্রতিক চেক-ইন</h3>
            <ul className="space-y-4">
                {checkins.slice(0, 5).map(checkin => {
                    const moodInfo = moodOptions.find(m => m.mood === checkin.mood);
                    return (
                        <li key={checkin.id} className="p-4 rounded-lg bg-stone-50 dark:bg-slate-700/50 flex items-start">
                            <span className={`text-3xl mr-4 ${moodInfo?.color}`}>{moodInfo?.emoji}</span>
                            <div>
                                <p className="font-bold text-stone-800 dark:text-stone-200">
                                    {new Date(checkin.date).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                                <p className="text-stone-600 dark:text-stone-400 leading-relaxed mt-1">{checkin.reflection || 'কোনো মন্তব্য নেই।'}</p>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};


const MentalHealthCheckPage: React.FC = () => {
    const [checkins, setCheckins] = useState<MentalHealthCheckin[]>([]);
    const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
    const [reflection, setReflection] = useState('');
    const [showReminder, setShowReminder] = useState(false);

    useEffect(() => {
        try {
            const savedCheckins = localStorage.getItem(STORAGE_KEY);
            const loadedCheckins = savedCheckins ? JSON.parse(savedCheckins).sort((a: MentalHealthCheckin, b: MentalHealthCheckin) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];
            setCheckins(loadedCheckins);

            if (loadedCheckins.length > 0) {
                const lastCheckinDate = new Date(loadedCheckins[0].date);
                const threeDaysAgo = new Date();
                threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
                if (lastCheckinDate < threeDaysAgo) {
                    setShowReminder(true);
                }
            } else {
                 setShowReminder(true);
            }
        } catch (error) {
            console.error("Failed to load check-ins:", error);
        }
    }, []);

    const hasCheckedInToday = useMemo(() => {
        if (checkins.length === 0) return false;
        const lastCheckinDate = new Date(checkins[0].date);
        const today = new Date();
        return lastCheckinDate.toDateString() === today.toDateString();
    }, [checkins]);

    const handleSubmit = () => {
        if (!selectedMood) return;
        const newCheckin: MentalHealthCheckin = {
            id: new Date().toISOString(),
            date: new Date().toISOString(),
            mood: selectedMood,
            reflection: reflection.trim(),
        };
        const updatedCheckins = [newCheckin, ...checkins];
        setCheckins(updatedCheckins);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCheckins));
        setSelectedMood(null);
        setReflection('');
        setShowReminder(false);
    };

    return (
        <div className="bg-stone-50 dark:bg-slate-900 py-12 min-h-[calc(100vh-8rem)]">
            <div className="container mx-auto px-6">
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-stone-800 dark:text-stone-100">মানসিক স্বাস্থ্য পরীক্ষা</h1>
                    <p className="mt-4 text-lg leading-relaxed text-stone-600 dark:text-stone-400 max-w-3xl mx-auto">
                        নিয়মিত আপনার মানসিক অবস্থা পরীক্ষা করে নিজের যত্ন নিন।
                    </p>
                </header>

                <section className="max-w-2xl mx-auto mb-16">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 sm:p-8">
                        {hasCheckedInToday ? (
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-teal-600 dark:text-teal-400 mb-4">আজকের জন্য ধন্যবাদ!</h2>
                                <p className="text-stone-600 dark:text-stone-400 leading-relaxed">আপনি ইতিমধ্যে আজ চেক ইন করেছেন। আগামীকাল আবার আসবেন।</p>
                            </div>
                        ) : (
                            <>
                                {showReminder && (
                                    <div className="mb-6 p-4 bg-yellow-100 dark:bg-yellow-900/50 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200 rounded-r-lg flex items-center space-x-3">
                                        <InformationCircleIcon className="h-6 w-6 flex-shrink-0" />
                                        <p className="leading-relaxed"><span className="font-bold">অনুস্মারক:</span> আপনাকে কিছুক্ষণ ধরে দেখিনি। আপনার অনুভূতি পরীক্ষা করার জন্য এটি একটি ভালো সময়।</p>
                                    </div>
                                )}
                                <h2 className="text-2xl font-bold text-stone-800 dark:text-white mb-6 text-center">আজ আপনার কেমন লাগছে?</h2>
                                
                                <div className="flex justify-around items-center mb-8 flex-wrap gap-2">
                                    {moodOptions.map(({ mood, emoji, label }) => (
                                        <button key={mood} onClick={() => setSelectedMood(mood)} className={`text-center p-2 rounded-lg transition-all duration-200 w-20 ${selectedMood === mood ? 'bg-teal-100 dark:bg-slate-700 ring-2 ring-teal-500' : 'hover:bg-stone-100 dark:hover:bg-slate-700'}`}>
                                            <span className="text-4xl sm:text-5xl">{emoji}</span>
                                            <p className="text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300 mt-2">{label}</p>
                                        </button>
                                    ))}
                                </div>
                                
                                {selectedMood && (
                                    <div className="my-6 p-4 bg-teal-50 dark:bg-slate-700/50 rounded-lg text-center">
                                        <p className="text-teal-800 dark:text-teal-200 leading-relaxed">{wellnessTips[selectedMood]}</p>
                                    </div>
                                )}

                                <div className="mb-6">
                                    <label htmlFor="reflection" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">আপনার অনুভূতি সম্পর্কে কিছু লিখুন (ঐচ্ছিক)</label>
                                    <textarea
                                        id="reflection"
                                        value={reflection}
                                        onChange={(e) => setReflection(e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-stone-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-700 text-stone-900 dark:text-stone-200"
                                        placeholder="এখানে আপনার চিন্তা শেয়ার করুন..."
                                    />
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={!selectedMood}
                                    className="w-full px-6 py-3 bg-teal-600 text-white font-bold rounded-full shadow-lg hover:bg-teal-700 disabled:bg-teal-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    জমা দিন
                                </button>
                            </>
                        )}
                    </div>
                </section>

                <section className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-stone-800 dark:text-white mb-6 text-center">আপনার সাম্প্রতিক ইতিহাস</h2>
                    {checkins.length > 0 ? (
                        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 sm:p-8">
                            <TrendsChart data={checkins} />
                            <hr className="my-8 border-stone-200 dark:border-slate-700" />
                            <HistoryList checkins={checkins} />
                        </div>
                    ) : (
                        <div className="text-center text-stone-500 dark:text-stone-400 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
                            <p>আপনার প্রথম চেক-ইন করার পরে, আপনার ইতিহাস এখানে দেখানো হবে।</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default MentalHealthCheckPage;