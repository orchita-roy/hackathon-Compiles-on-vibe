
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ANCVisit, Vaccination } from '../types';
import { LockClosedIcon, CheckCircleIcon, ArrowDownTrayIcon, UserGroupIcon } from '../components/IconComponents';

const ANC_STORAGE_KEY = 'ancTrackerData';
const VACCINATION_STORAGE_KEY = 'vaccinationTrackerData';

const epiSchedule = [
  { id: 'bcg', name: 'বিসিজি এবং ওপিভি-০', weeks: 0, recommendedAge: 'জন্মের সময়' },
  { id: 'penta1', name: 'পেন্টা-১, ওপিভি-১, পিসিভি-১', weeks: 6, recommendedAge: '৬ সপ্তাহ' },
  { id: 'penta2', name: 'পেন্টা-২, ওপিভি-২, পিসিভি-২', weeks: 10, recommendedAge: '১০ সপ্তাহ' },
  { id: 'penta3', name: 'পেন্টা-৩, ওপিভি-৩, পিসিভি-৩', weeks: 14, recommendedAge: '১৪ সপ্তাহ' },
  { id: 'mr1', name: 'এমআর-১', weeks: 39, recommendedAge: '৯ মাস' },
  { id: 'mr2', name: 'এমআর-২', weeks: 65, recommendedAge: '১৫ মাস' },
];

const ancScheduleTemplate = [
    { id: 'anc1', title: '১ম চেক-আপ', weeksBeforeDue: 24, recommendedDate: 'গর্ভধারণের ১৬ সপ্তাহের মধ্যে' },
    { id: 'anc2', title: '২য় চেক-আপ', weeksBeforeDue: 12, recommendedDate: 'গর্ভধারণের ২৪-২৮ সপ্তাহের মধ্যে' },
    { id: 'anc3', title: '৩য় চেক-আপ', weeksBeforeDue: 8, recommendedDate: 'গর্ভধারণের ৩২ সপ্তাহে' },
    { id: 'anc4', title: '৪র্থ চেক-আপ', weeksBeforeDue: 4, recommendedDate: 'গর্ভধারণের ৩৬ সপ্তাহে' },
];

const MaternalAndChildHealthPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'anc' | 'vaccination'>('anc');
    
    // ANC State
    const [dueDate, setDueDate] = useState('');
    const [ancVisits, setAncVisits] = useState<ANCVisit[]>([]);
    
    // Vaccination State
    const [dob, setDob] = useState('');
    const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);

    const [copySuccess, setCopySuccess] = useState('');

    // Load data from localStorage
    useEffect(() => {
        try {
            const savedAnc = localStorage.getItem(ANC_STORAGE_KEY);
            if (savedAnc) {
                const data = JSON.parse(savedAnc);
                setDueDate(data.dueDate || '');
                setAncVisits(data.ancVisits || []);
            }
            const savedVaccination = localStorage.getItem(VACCINATION_STORAGE_KEY);
            if (savedVaccination) {
                const data = JSON.parse(savedVaccination);
                setDob(data.dob || '');
                setVaccinations(data.vaccinations || []);
            }
        } catch (error) {
            console.error("Failed to load tracker data from localStorage:", error);
        }
    }, []);

    // Generate and save ANC schedule
    useEffect(() => {
        if (dueDate) {
            const due = new Date(dueDate);
            const newVisits = ancScheduleTemplate.map(template => {
                const visitDate = new Date(due);
                visitDate.setDate(due.getDate() - (template.weeksBeforeDue * 7));
                const existing = ancVisits.find(v => v.id === template.id);
                return {
                    id: template.id,
                    title: template.title,
                    recommendedDate: visitDate.toLocaleDateString('bn-BD'),
                    completed: existing ? existing.completed : false,
                };
            });
            setAncVisits(newVisits);
            localStorage.setItem(ANC_STORAGE_KEY, JSON.stringify({ dueDate, ancVisits: newVisits }));
        }
    }, [dueDate]);

     // Generate and save Vaccination schedule
    useEffect(() => {
        if (dob) {
            const birthDate = new Date(dob);
            const newVaccinations = epiSchedule.map(vaccine => {
                const vaccineDate = new Date(birthDate);
                vaccineDate.setDate(birthDate.getDate() + (vaccine.weeks * 7));
                const existing = vaccinations.find(v => v.id === vaccine.id);
                return {
                    ...vaccine,
                    dueDate: vaccineDate.toLocaleDateString('bn-BD'),
                    completed: existing ? existing.completed : false,
                };
            });
            setVaccinations(newVaccinations);
            localStorage.setItem(VACCINATION_STORAGE_KEY, JSON.stringify({ dob, vaccinations: newVaccinations }));
        }
    }, [dob]);

    const handleToggleANCVisit = (id: string) => {
        const updatedVisits = ancVisits.map(v => v.id === id ? { ...v, completed: !v.completed } : v);
        setAncVisits(updatedVisits);
        localStorage.setItem(ANC_STORAGE_KEY, JSON.stringify({ dueDate, ancVisits: updatedVisits }));
    };
    
    const handleToggleVaccination = (id: string) => {
        const updatedVaccinations = vaccinations.map(v => v.id === id ? { ...v, completed: !v.completed } : v);
        setVaccinations(updatedVaccinations);
        localStorage.setItem(VACCINATION_STORAGE_KEY, JSON.stringify({ dob, vaccinations: updatedVaccinations }));
    };
    
    const handleExport = async () => {
        let textToCopy = '';
        if(activeTab === 'anc') {
            textToCopy = 'প্রসবপূর্ব যত্ন (ANC) সময়সূচী:\n';
            textToCopy += `সম্ভাব্য প্রসবের তারিখ: ${new Date(dueDate).toLocaleDateString('bn-BD')}\n\n`;
            ancVisits.forEach(visit => {
                textToCopy += `${visit.title} - তারিখ: ${visit.recommendedDate} [${visit.completed ? 'সম্পন্ন' : 'বাকি'}]\n`;
            });
        } else {
            textToCopy = 'শিশু টিকা সময়সূচী:\n';
            textToCopy += `জন্ম তারিখ: ${new Date(dob).toLocaleDateString('bn-BD')}\n\n`;
            vaccinations.forEach(vac => {
                textToCopy += `${vac.name} (${vac.recommendedAge}) - তারিখ: ${vac.dueDate} [${vac.completed ? 'সম্পন্ন' : 'বাকি'}]\n`;
            });
        }
        
        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopySuccess('সময়সূচী ক্লিপবোর্ডে কপি করা হয়েছে!');
            setTimeout(() => setCopySuccess(''), 3000);
        } catch (err) {
            setCopySuccess('কপি করতে ব্যর্থ হয়েছে।');
            setTimeout(() => setCopySuccess(''), 3000);
        }
    };
    
    return (
        <div className="bg-stone-50 dark:bg-slate-900 py-12 min-h-[calc(100vh-8rem)]">
            <div className="container mx-auto px-6">
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-stone-800 dark:text-stone-100">মাতৃ ও শিশু স্বাস্থ্য ট্র্যাকার</h1>
                    <p className="mt-4 text-lg text-stone-600 dark:text-stone-400 max-w-3xl mx-auto">
                        প্রসবপূর্ব যত্ন এবং শিশু টিকাদানের গুরুত্বপূর্ণ তারিখগুলি ট্র্যাক করুন।
                    </p>
                </header>

                <section className="max-w-4xl mx-auto">
                    <div className="mb-8 flex justify-center border-b border-stone-200 dark:border-slate-700">
                        <button onClick={() => setActiveTab('anc')} className={`px-6 py-3 font-medium transition-colors ${activeTab === 'anc' ? 'border-b-2 border-teal-500 text-teal-600 dark:text-teal-400' : 'text-stone-500 hover:text-teal-600'}`}>
                            গর্ভাবস্থা ট্র্যাকার
                        </button>
                        <button onClick={() => setActiveTab('vaccination')} className={`px-6 py-3 font-medium transition-colors ${activeTab === 'vaccination' ? 'border-b-2 border-teal-500 text-teal-600 dark:text-teal-400' : 'text-stone-500 hover:text-teal-600'}`}>
                            টিকা ট্র্যাকার
                        </button>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 sm:p-8">
                        <div className="mb-6 p-4 bg-stone-100 dark:bg-slate-700 rounded-lg flex items-center space-x-3">
                            <LockClosedIcon className="h-8 w-8 text-teal-500 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-stone-800 dark:text-white">আপনার ডেটা ব্যক্তিগত</h3>
                                <p className="text-sm text-stone-600 dark:text-stone-400">সমস্ত তথ্য শুধুমাত্র আপনার ডিভাইসে সংরক্ষণ করা হয় এবং কারো সাথে শেয়ার করা হয় না।</p>
                            </div>
                        </div>

                        {activeTab === 'anc' && (
                            <div>
                                <h2 className="text-2xl font-bold text-stone-800 dark:text-white mb-4">প্রসবপূর্ব যত্ন (ANC) সময়সূচী</h2>
                                <div className="mb-6">
                                    <label htmlFor="dueDate" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">সম্ভাব্য প্রসবের তারিখ লিখুন</label>
                                    <input type="date" id="dueDate" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full max-w-xs px-3 py-2 border border-stone-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-teal-500 bg-white dark:bg-slate-700"/>
                                </div>
                                {dueDate && ancVisits.length > 0 && (
                                    <ul className="space-y-3">
                                        {ancVisits.map(visit => (
                                            <li key={visit.id} className="flex items-center justify-between p-3 rounded-md bg-stone-50 dark:bg-slate-700/50">
                                                <div>
                                                    <p className="font-bold text-stone-800 dark:text-stone-200">{visit.title}</p>
                                                    <p className="text-sm text-stone-600 dark:text-stone-400">প্রস্তাবিত তারিখ: {visit.recommendedDate}</p>
                                                </div>
                                                <button onClick={() => handleToggleANCVisit(visit.id)} className={`px-4 py-1 text-sm rounded-full transition-colors ${visit.completed ? 'bg-green-500 text-white' : 'bg-stone-200 dark:bg-slate-600 hover:bg-stone-300'}`}>
                                                    {visit.completed ? 'সম্পন্ন' : 'বাকি'}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}

                        {activeTab === 'vaccination' && (
                            <div>
                                <h2 className="text-2xl font-bold text-stone-800 dark:text-white mb-4">শিশু টিকা সময়সূচী</h2>
                                <div className="mb-6">
                                    <label htmlFor="dob" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">শিশুর জন্ম তারিখ লিখুন</label>
                                    <input type="date" id="dob" value={dob} onChange={e => setDob(e.target.value)} className="w-full max-w-xs px-3 py-2 border border-stone-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-teal-500 bg-white dark:bg-slate-700"/>
                                </div>
                                {dob && vaccinations.length > 0 && (
                                    <ul className="space-y-3">
                                        {vaccinations.map(vac => (
                                            <li key={vac.id} className="flex items-center justify-between p-3 rounded-md bg-stone-50 dark:bg-slate-700/50">
                                                <div>
                                                    <p className="font-bold text-stone-800 dark:text-stone-200">{vac.name}</p>
                                                    <p className="text-sm text-stone-600 dark:text-stone-400">{vac.recommendedAge} (প্রস্তাবিত তারিখ: {vac.dueDate})</p>
                                                </div>
                                                 <button onClick={() => handleToggleVaccination(vac.id)} className={`px-4 py-1 text-sm rounded-full transition-colors ${vac.completed ? 'bg-green-500 text-white' : 'bg-stone-200 dark:bg-slate-600 hover:bg-stone-300'}`}>
                                                    {vac.completed ? 'সম্পন্ন' : 'বাকি'}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                        
                        {( (activeTab === 'anc' && dueDate) || (activeTab === 'vaccination' && dob) ) && (
                            <div className="mt-8 border-t border-stone-200 dark:border-slate-700 pt-6 text-center">
                                <button onClick={handleExport} className="inline-flex items-center px-6 py-2 bg-slate-600 text-white font-bold rounded-full shadow hover:bg-slate-700 transition-colors">
                                    <ArrowDownTrayIcon className="h-5 w-5 mr-2"/>
                                    সময়সূচী এক্সপোর্ট করুন
                                </button>
                                {copySuccess && <p className="text-green-600 dark:text-green-400 text-sm mt-3">{copySuccess}</p>}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default MaternalAndChildHealthPage;
