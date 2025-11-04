
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Volunteer, VolunteerSkill } from '../types';
import { MagnifyingGlassIcon, MapIcon, PhoneIcon, ShieldCheckIcon, BookmarkIcon, WhatsAppIcon } from '../components/IconComponents';

// Add type declaration for Leaflet
declare const L: any;

const mockVolunteers: Volunteer[] = [
    { id: 'v1', name: 'রহিমা বেগম', location: 'আদর্শ সদর, কুমিল্লা', skills: ['মাতৃস্বাস্থ্য', 'প্রাথমিক চিকিৎসা'], phone: '01711-111111', whatsapp: true, workingHours: 'সকাল ৯টা - বিকাল ৫টা', verified: true, coordinates: { lat: 23.4617, lng: 91.1850 } },
    { id: 'v2', name: 'করিম শেখ', location: 'লাকসাম, কুমিল্লা', skills: ['প্রাথমিক চিকিৎসা'], phone: '01822-222222', whatsapp: false, workingHours: 'বিকাল ৪টা - রাত ৯টা', verified: true, coordinates: { lat: 23.2425, lng: 91.1213 } },
    { id: 'v3', name: 'ফাতেমা আক্তার', location: 'মুরাদনগর, কুমিল্লা', skills: ['মানসিক স্বাস্থ্য', 'মাতৃস্বাস্থ্য'], phone: '01933-333333', whatsapp: true, workingHours: 'সকাল ১০টা - বিকাল ৬টা', verified: false, coordinates: { lat: 23.6333, lng: 90.9667 } },
    { id: 'v4', name: 'আব্দুল জলিল', location: 'দেবিদ্বার, কুমিল্লা', skills: ['দীর্ঘস্থায়ী রোগ', 'প্রাথমিক চিকিৎসা'], phone: '01544-444444', whatsapp: true, workingHours: '২৪ ঘন্টা খোলা', verified: true, coordinates: { lat: 23.6000, lng: 91.0500 } },
    { id: 'v5', name: 'সালমা খাতুন', location: 'চান্দিনা, কুমিল্লা', skills: ['মাতৃস্বাস্থ্য'], phone: '01655-555555', whatsapp: false, workingHours: 'সকাল ৮টা - দুপুর ২টা', verified: true, coordinates: { lat: 23.4833, lng: 90.9667 } },
];

const SAVED_CONTACTS_KEY = 'savedVolunteerContacts';

const skillOptions: VolunteerSkill[] = ['প্রাথমিক চিকিৎসা', 'মানসিক স্বাস্থ্য', 'মাতৃস্বাস্থ্য', 'দীর্ঘস্থায়ী রোগ'];

const VolunteerDirectoryPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSkills, setActiveSkills] = useState<Set<VolunteerSkill>>(new Set());
    const [savedContacts, setSavedContacts] = useState<Set<string>>(new Set());
    const [notification, setNotification] = useState('');
    const [selectedVolunteerId, setSelectedVolunteerId] = useState<string | null>(null);

    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markersRef = useRef<{ [key: string]: any }>({});

    useEffect(() => {
        try {
            const saved = localStorage.getItem(SAVED_CONTACTS_KEY);
            if (saved) {
                setSavedContacts(new Set(JSON.parse(saved)));
            }
        } catch (e) { console.error("Failed to load saved contacts", e) }
    }, []);

    const handleSkillToggle = (skill: VolunteerSkill) => {
        const newSkills = new Set(activeSkills);
        if (newSkills.has(skill)) {
            newSkills.delete(skill);
        } else {
            newSkills.add(skill);
        }
        setActiveSkills(newSkills);
    };

    const handleSaveContact = (volunteer: Volunteer) => {
        const newSaved = new Set(savedContacts);
        let message = '';
        if (newSaved.has(volunteer.id)) {
            newSaved.delete(volunteer.id);
            message = `${volunteer.name} এর তথ্য মুছে ফেলা হয়েছে।`;
        } else {
            newSaved.add(volunteer.id);
            message = `${volunteer.name} এর তথ্য অফলাইনের জন্য সংরক্ষণ করা হয়েছে।`;
        }
        setSavedContacts(newSaved);
        localStorage.setItem(SAVED_CONTACTS_KEY, JSON.stringify(Array.from(newSaved)));
        setNotification(message);
        setTimeout(() => setNotification(''), 3000);
    };

    const filteredVolunteers = useMemo(() => {
        return mockVolunteers.filter(v => {
            const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || v.location.toLowerCase().includes(searchTerm.toLowerCase());
            // Fix: Explicitly type 's' as VolunteerSkill to resolve type inference issue.
            const matchesSkills = activeSkills.size === 0 || Array.from(activeSkills).every((s: VolunteerSkill) => v.skills.includes(s));
            return matchesSearch && matchesSkills;
        });
    }, [searchTerm, activeSkills]);

    useEffect(() => {
        if (!mapContainerRef.current) return;
        if (!mapInstanceRef.current) {
            mapInstanceRef.current = L.map(mapContainerRef.current).setView([23.46, 91.18], 10);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapInstanceRef.current);
        }
    }, []);

    useEffect(() => {
        if (!mapInstanceRef.current) return;
        Object.values(markersRef.current).forEach((marker: any) => marker.remove());
        markersRef.current = {};

        filteredVolunteers.forEach(v => {
            const marker = L.marker([v.coordinates.lat, v.coordinates.lng])
                .addTo(mapInstanceRef.current)
                .bindPopup(`<b>${v.name}</b><br>${v.location}`);
            marker.on('click', () => setSelectedVolunteerId(v.id));
            markersRef.current[v.id] = marker;
        });
    }, [filteredVolunteers]);

    useEffect(() => {
        if (!mapInstanceRef.current) return;
        Object.values(markersRef.current).forEach((marker: any) => {
            marker?._icon?.classList.remove('highlighted-marker');
            marker.setZIndexOffset(0);
        });

        if (selectedVolunteerId) {
            const volunteer = filteredVolunteers.find(v => v.id === selectedVolunteerId);
            const marker = markersRef.current[selectedVolunteerId];
            if (volunteer && marker) {
                mapInstanceRef.current.flyTo([volunteer.coordinates.lat, volunteer.coordinates.lng], 14);
                marker._icon?.classList.add('highlighted-marker');
                marker.setZIndexOffset(1000);
                marker.openPopup();
            }
        }
    }, [selectedVolunteerId, filteredVolunteers]);

    return (
        <div className="bg-stone-50 dark:bg-slate-900 py-12 min-h-[calc(100vh-8rem)]">
            <div className="container mx-auto px-6">
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-stone-800 dark:text-stone-100">স্বেচ্ছাসেবক কর্মী ডিরেক্টরি</h1>
                    <p className="mt-4 text-lg text-stone-600 dark:text-stone-400 max-w-3xl mx-auto">
                        আপনার এলাকার প্রশিক্ষিত ও যাচাইকৃত স্বাস্থ্য স্বেচ্ছাসেবকদের খুঁজুন।
                    </p>
                </header>

                <section className="mb-8">
                    <div className="max-w-xl mx-auto mb-6 relative">
                        <MagnifyingGlassIcon className="h-5 w-5 absolute top-1/2 left-4 -translate-y-1/2 text-stone-400" />
                        <input
                            type="text"
                            placeholder="নাম বা গ্রাম দিয়ে খুঁজুন..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border rounded-full bg-white dark:bg-slate-800 border-stone-300 dark:border-slate-600 focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                        {skillOptions.map(skill => (
                            <button
                                key={skill}
                                onClick={() => handleSkillToggle(skill)}
                                className={`px-4 py-2 text-sm font-semibold rounded-full border-2 transition-colors ${activeSkills.has(skill) ? 'bg-teal-600 text-white border-teal-600' : 'bg-transparent text-stone-700 dark:text-stone-300 border-stone-300 dark:border-slate-600 hover:bg-teal-50 dark:hover:bg-slate-800'}`}
                            >
                                {skill}
                            </button>
                        ))}
                    </div>
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div ref={mapContainerRef} className="lg:col-span-2 h-96 lg:h-[70vh] rounded-lg shadow-md z-0"></div>
                    <div className="lg:col-span-3 h-[70vh] overflow-y-auto space-y-4 pr-2">
                        {filteredVolunteers.length > 0 ? filteredVolunteers.map(v => (
                            <div key={v.id} className={`bg-white dark:bg-slate-800 rounded-lg shadow-lg p-5 border-l-4 transition-all ${selectedVolunteerId === v.id ? 'border-teal-500 shadow-teal-500/20' : 'border-transparent'}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-stone-800 dark:text-white mb-1 flex items-center">
                                            {v.name}
                                            {v.verified && <ShieldCheckIcon title="যাচাইকৃত" className="h-6 w-6 text-blue-500 ml-2" />}
                                        </h3>
                                        <p className="text-stone-500 dark:text-stone-400 flex items-center"><MapIcon className="h-4 w-4 mr-1.5" />{v.location}</p>
                                    </div>
                                    <button onClick={() => handleSaveContact(v)} title="অফলাইনের জন্য সংরক্ষণ করুন">
                                        <BookmarkIcon solid={savedContacts.has(v.id)} className={`h-7 w-7 transition-colors ${savedContacts.has(v.id) ? 'text-teal-500' : 'text-stone-400 hover:text-teal-500'}`} />
                                    </button>
                                </div>
                                <div className="my-3 flex flex-wrap gap-2">
                                    {v.skills.map(skill => (
                                        <span key={skill} className="px-2.5 py-1 text-xs font-semibold rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200">{skill}</span>
                                    ))}
                                </div>
                                <div className="text-sm space-y-2 text-stone-700 dark:text-stone-300 border-t dark:border-slate-700 pt-3 mt-3">
                                    <p className="flex items-center gap-2">
                                        <PhoneIcon className="h-5 w-5 text-teal-500" />
                                        <a href={`tel:${v.phone}`} className="hover:underline">{v.phone}</a>
                                        {v.whatsapp && <WhatsAppIcon className="h-5 w-5 text-green-500" title="হোয়াটসঅ্যাপে উপলব্ধ" />}
                                    </p>
                                    <p><span className="font-semibold">কার্য ঘন্টা:</span> {v.workingHours}</p>
                                </div>
                                <div className="mt-4 text-right">
                                    <button onClick={() => setSelectedVolunteerId(v.id)} className="px-3 py-1.5 text-xs font-semibold rounded-full transition-colors bg-stone-100 dark:bg-slate-700 hover:bg-stone-200 text-stone-600 dark:text-stone-300">মানচিত্রে দেখুন</button>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow-md">
                                <p className="text-stone-500 dark:text-stone-400">আপনার অনুসন্ধানের সাথে মেলে এমন কোনো স্বেচ্ছাসেবক পাওয়া যায়নি।</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
            {notification && (
                <div className="fixed bottom-24 right-6 bg-slate-800 text-white px-6 py-3 rounded-full shadow-lg transition-transform animate-bounce">
                    {notification}
                </div>
            )}
        </div>
    );
};

export default VolunteerDirectoryPage;