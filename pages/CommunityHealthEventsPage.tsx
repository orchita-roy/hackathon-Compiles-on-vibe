
import React, { useState, FormEvent, useEffect, useRef } from 'react';
import { CommunityHealthEvent, EventCategory, GroundingChunk } from '../types';
import { CalendarDaysIcon, MapIcon, ShareIcon, BellIcon, UserGroupIcon, MagnifyingGlassIcon } from '../components/IconComponents';
import { getShareableUrl } from '../utils/shareUtils';
import { findNearbyPlaces } from '../services/geminiService';

// Add type declaration for Leaflet
declare const L: any;

const mockEvents: CommunityHealthEvent[] = [
    {
        id: '1',
        title: 'বিনামূল্যে টিকা দান শিবির',
        description: 'সকল শিশুদের জন্য পোলিও, এমআর এবং অন্যান্য প্রয়োজনীয় টিকা বিনামূল্যে প্রদান করা হবে।',
        category: 'টিকাদান',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        time: 'সকাল ৯:০০ - বিকাল ৪:০০',
        location: 'কুমিল্লা সদর হাসপাতাল প্রাঙ্গণ',
        organizer: 'জেলা স্বাস্থ্য অধিদপ্তর',
        mapLink: 'https://maps.google.com/?q=Comilla+Sadar+Hospital',
        coordinates: { lat: 23.4583, lng: 91.1833 },
    },
    {
        id: '2',
        title: 'স্বেচ্ছায় রক্তদান কর্মসূচি',
        description: 'আপনার এক ব্যাগ রক্ত পারে একজন মুমূর্ষু রোগীর জীবন বাঁচাতে। রক্তদানে এগিয়ে আসুন।',
        category: 'রক্তদান',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        time: 'সকাল ১০:০০ - বিকাল ৫:০০',
        location: 'টাউন হল ময়দান, কুমিল্লা',
        organizer: 'সন্ধানী ব্লাড ব্যাংক',
        mapLink: 'https://maps.google.com/?q=Comilla+Town+Hall',
        coordinates: { lat: 23.4610, lng: 91.1848 },
    },
    {
        id: '3',
        title: 'মা ও শিশু স্বাস্থ্য পরামর্শ',
        description: 'গর্ভবতী মা এবং শিশুদের স্বাস্থ্য পরীক্ষা এবং প্রয়োজনীয় পরামর্শ প্রদান করা হবে।',
        category: 'মাতৃস্বাস্থ্য',
        date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
        time: 'সকাল ১০:০০ - দুপুর ২:০০',
        location: 'মাতৃমঙ্গল কেন্দ্র, কুমিল্লা',
        organizer: 'স্বাস্থ্য বন্ধু কমিউনিটি',
        mapLink: 'https://maps.google.com/?q=Comilla',
        coordinates: { lat: 23.4680, lng: 91.1750 },
    },
    {
        id: '4',
        title: 'মানসিক স্বাস্থ্য সচেতনতা কর্মশালা',
        description: 'মানসিক চাপ মোকাবেলা এবং সুস্থ জীবন যাপনের কৌশল নিয়ে আলোচনা করা হবে।',
        category: 'মানসিক স্বাস্থ্য',
        date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        time: 'বিকাল ৩:০০ - বিকাল ৫:০০',
        location: 'পাবলিক লাইব্রেরি, কুমিল্লা',
        organizer: 'মনের বন্ধু',
        mapLink: 'https://maps.google.com/?q=Comilla+Public+Library',
        coordinates: { lat: 23.4625, lng: 91.1812 },
    },
];

const categories: ('সব' | EventCategory | 'অনুসন্ধান')[] = ['সব', 'টিকাদান', 'রক্তদান', 'মাতৃস্বাস্থ্য', 'মানসিক স্বাস্থ্য', 'ডায়াবেটিস', 'অনুসন্ধান'];
const categoryOptions: EventCategory[] = ['টিকাদান', 'রক্তদান', 'মাতৃস্বাস্থ্য', 'মানসিক স্বাস্থ্য', 'ডায়াবেটিস'];

const categoryColors: Record<EventCategory, string> = {
    'টিকাদান': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'রক্তদান': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'মাতৃস্বাস্থ্য': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    'মানসিক স্বাস্থ্য': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'ডায়াবেটিস': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

const initialFormState: Omit<CommunityHealthEvent, 'id' | 'date' | 'coordinates'> & { date: string, coordinates: { lat: string, lng: string } } = {
    title: '',
    description: '',
    category: 'টিকাদান',
    date: '',
    time: '',
    location: '',
    organizer: '',
    mapLink: '',
    coordinates: { lat: '', lng: '' }
};

const CommunityHealthEventsPage: React.FC = () => {
    // State for user-submitted events
    const [events, setEvents] = useState<CommunityHealthEvent[]>(mockEvents);
    const [activeCategory, setActiveCategory] = useState<'সব' | EventCategory | 'অনুসন্ধান'>('সব');
    const [rsvpdEvents, setRsvpdEvents] = useState<Set<string>>(new Set());
    const [notificationMessage, setNotificationMessage] = useState<string>('');
    const [showForm, setShowForm] = useState(false);
    const [newEvent, setNewEvent] = useState(initialFormState);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

    // State for map grounding search
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<{ text: string; chunks: GroundingChunk[] } | null>(null);
    const [searchIsLoading, setSearchIsLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<GroundingChunk | null>(null);

    // Refs for Leaflet map
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markersRef = useRef<{ [key: string]: any }>({});
    
    const filteredEvents = (activeCategory === 'সব' || activeCategory === 'অনুসন্ধান' ? events : events.filter(e => e.category === activeCategory))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Initialize Leaflet map
    useEffect(() => {
        if (activeCategory === 'অনুসন্ধান' || !mapContainerRef.current) return;
        if (!mapInstanceRef.current) {
            mapInstanceRef.current = L.map(mapContainerRef.current).setView([23.4617, 91.1850], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapInstanceRef.current);
        }
    }, [activeCategory]);

    // Update markers on Leaflet map
    useEffect(() => {
        if (activeCategory === 'অনুসন্ধان' || !mapInstanceRef.current) return;
        Object.values(markersRef.current).forEach(marker => (marker as any).remove());
        markersRef.current = {};

        const eventsToDisplay = activeCategory === 'সব' ? events : filteredEvents;

        eventsToDisplay.forEach(event => {
            const marker = L.marker([event.coordinates.lat, event.coordinates.lng])
                .addTo(mapInstanceRef.current)
                .bindPopup(`<b>${event.title}</b><br>${event.location}`);
            
            marker.on('click', () => {
                setSelectedEventId(event.id);
            });
            markersRef.current[event.id] = marker;
        });
    }, [filteredEvents, events, activeCategory]);

    // Highlight marker on Leaflet map
    useEffect(() => {
        if (activeCategory === 'অনুসন্ধان' || !mapInstanceRef.current) return;
        Object.values(markersRef.current).forEach((marker: any) => {
            marker?._icon?.classList.remove('highlighted-marker');
            marker.setZIndexOffset(0);
        });
    
        if (selectedEventId) {
            const event = events.find(e => e.id === selectedEventId);
            const marker = markersRef.current[selectedEventId];
    
            if (event && marker) {
                mapInstanceRef.current.flyTo([event.coordinates.lat, event.coordinates.lng], 15);
                marker._icon?.classList.add('highlighted-marker');
                marker.setZIndexOffset(1000);
                marker.openPopup();
            }
        }
    }, [selectedEventId, events, activeCategory]);
    
    const handleRsvp = (eventId: string, eventTitle: string) => {
        const newRsvpdEvents = new Set(rsvpdEvents);
        let message = '';
        if (newRsvpdEvents.has(eventId)) {
            newRsvpdEvents.delete(eventId);
            message = `"${eventTitle}" ইভেন্ট থেকে আপনার RSVP সরানো হয়েছে।`;
        } else {
            newRsvpdEvents.add(eventId);
            message = `"${eventTitle}" ইভেন্টের জন্য আপনি সফলভাবে RSVP করেছেন!`;
        }
        setRsvpdEvents(newRsvpdEvents);
        setNotificationMessage(message);
        setTimeout(() => setNotificationMessage(''), 4000);
    };

    const handleShare = async (event: CommunityHealthEvent) => {
        const shareText = `স্বাস্থ্য বন্ধু কমিউনিটি ইভেন্ট:\n\n${event.title}\nতারিখ: ${new Date(event.date).toLocaleDateString('bn-BD')}\nসময়: ${event.time}\nস্থান: ${event.location}\n\nআরও জানতে অ্যাপটি দেখুন!`;
        if (navigator.share) {
            try {
                await navigator.share({ title: event.title, text: shareText, url: getShareableUrl() });
            } catch (error) { 
                console.error('Error sharing (user probably cancelled):', error); 
            }
        } else {
            const subject = encodeURIComponent(event.title);
            const body = encodeURIComponent(shareText);
            const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
            window.location.href = mailtoLink;
            setNotificationMessage('ইমেইল ক্লায়েন্ট খোলা হচ্ছে...');
            setTimeout(() => setNotificationMessage(''), 4000);
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'lat' || name === 'lng') {
            setNewEvent(prev => ({ ...prev, coordinates: { ...prev.coordinates, [name]: value } }));
        } else {
            setNewEvent(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        const createdEvent: CommunityHealthEvent = {
            ...newEvent,
            id: new Date().toISOString(),
            date: new Date(newEvent.date).toISOString(),
            coordinates: {
                lat: parseFloat(newEvent.coordinates.lat),
                lng: parseFloat(newEvent.coordinates.lng)
            }
        };
        setEvents(prev => [createdEvent, ...prev]);
        setNewEvent(initialFormState);
        setShowForm(false);
    };

    const viewOnMap = (event: CommunityHealthEvent) => {
        setSelectedEventId(event.id);
        if (mapContainerRef.current) {
            mapContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };
    
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setSearchIsLoading(true);
        setSearchError(null);
        setSearchResults(null);
        setSelectedLocation(null);

        try {
            const response = await findNearbyPlaces(searchQuery);
            setSearchResults(response);
        } catch (err) {
            setSearchError('একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
            console.error(err);
        } finally {
            setSearchIsLoading(false);
        }
    };

    const mapChunks = searchResults?.chunks?.filter(c => c.maps) || [];

    return (
        <div className="bg-stone-50 dark:bg-slate-900 py-12 min-h-[calc(100vh-8rem)]">
            <div className="container mx-auto px-6">
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-stone-800 dark:text-stone-100">কমিউনিটি স্বাস্থ্য হাব</h1>
                    <p className="mt-4 text-lg text-stone-600 dark:text-stone-400 max-w-3xl mx-auto">
                        কমিউনিটি ইভেন্ট দেখুন অথবা আপনার কাছাকাছি স্বাস্থ্যকেন্দ্র অনুসন্ধান করুন।
                    </p>
                </header>

                <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex flex-wrap justify-center gap-2">
                        {categories.map(cat => (
                            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors inline-flex items-center gap-2 ${activeCategory === cat ? 'bg-teal-600 text-white' : 'bg-white dark:bg-slate-800 hover:bg-teal-100 dark:hover:bg-slate-700'}`}>
                                {cat === 'অনুসন্ধান' && <MagnifyingGlassIcon className="h-4 w-4" />}
                                {cat}
                            </button>
                        ))}
                    </div>
                    {activeCategory !== 'অনুসন্ধান' && (
                        <button onClick={() => setShowForm(prev => !prev)} className="px-5 py-2.5 bg-teal-600 text-white font-bold rounded-full shadow-lg hover:bg-teal-700 transition-transform transform hover:scale-105 whitespace-nowrap">
                            {showForm ? 'ফর্ম বন্ধ করুন' : 'নতুন ইভেন্ট পোস্ট করুন'}
                        </button>
                    )}
                </div>

                {showForm && (
                    <div className="max-w-3xl mx-auto mb-12 bg-white dark:bg-slate-800 p-8 rounded-lg shadow-2xl">
                        <h2 className="text-2xl font-bold text-center mb-6 text-stone-800 dark:text-white">নতুন ইভেন্ট তৈরি করুন</h2>
                        <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2"><input name="title" value={newEvent.title} onChange={handleFormChange} placeholder="ইভেন্টের শিরোনাম" required className="w-full p-3 border rounded-md dark:bg-slate-700 dark:border-slate-600" /></div>
                            <div className="md:col-span-2"><textarea name="description" value={newEvent.description} onChange={handleFormChange} placeholder="বিবরণ" required className="w-full p-3 border rounded-md dark:bg-slate-700 dark:border-slate-600"></textarea></div>
                            <div><select name="category" value={newEvent.category} onChange={handleFormChange} className="w-full p-3 border rounded-md dark:bg-slate-700 dark:border-slate-600"><option disabled>ক্যাটাগরি</option>{categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                            <div><input type="date" name="date" value={newEvent.date} onChange={handleFormChange} required className="w-full p-3 border rounded-md dark:bg-slate-700 dark:border-slate-600" /></div>
                            <div><input name="time" value={newEvent.time} onChange={handleFormChange} placeholder="সময় (যেমন, সকাল ৯টা - বিকাল ৫টা)" required className="w-full p-3 border rounded-md dark:bg-slate-700 dark:border-slate-600" /></div>
                            <div><input name="location" value={newEvent.location} onChange={handleFormChange} placeholder="স্থান" required className="w-full p-3 border rounded-md dark:bg-slate-700 dark:border-slate-600" /></div>
                            <div className="md:col-span-2"><input name="organizer" value={newEvent.organizer} onChange={handleFormChange} placeholder="সংগঠক" required className="w-full p-3 border rounded-md dark:bg-slate-700 dark:border-slate-600" /></div>
                            <div><input name="lat" value={newEvent.coordinates.lat} onChange={handleFormChange} placeholder="অক্ষাংশ (Latitude)" required className="w-full p-3 border rounded-md dark:bg-slate-700 dark:border-slate-600" /></div>
                            <div><input name="lng" value={newEvent.coordinates.lng} onChange={handleFormChange} placeholder="দ্রাঘিমাংশ (Longitude)" required className="w-full p-3 border rounded-md dark:bg-slate-700 dark:border-slate-600" /></div>
                            <div className="md:col-span-2 flex justify-end gap-4"><button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 bg-stone-200 dark:bg-slate-600 rounded-full font-semibold">বাতিল</button><button type="submit" className="px-6 py-2 bg-teal-600 text-white rounded-full font-semibold">জমা দিন</button></div>
                        </form>
                    </div>
                )}
                
                {activeCategory === 'অনুসন্ধান' ? (
                    <section>
                        <div className="max-w-2xl mx-auto mb-8">
                            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                                <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="যেমন, 'নিকটতম ক্লিনিক কোথায়?'"
                                className="flex-grow px-4 py-3 border border-stone-300 dark:border-slate-600 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-slate-800 text-stone-900 dark:text-stone-100"
                                disabled={searchIsLoading}
                                />
                                <button
                                type="submit"
                                disabled={searchIsLoading}
                                className="px-8 py-3 bg-teal-600 text-white font-bold rounded-full shadow-lg hover:bg-teal-700 disabled:bg-teal-300 transition-colors"
                                >
                                {searchIsLoading ? 'অনুসন্ধান করা হচ্ছে...' : 'অনুসন্ধান'}
                                </button>
                            </form>
                        </div>
                        {searchIsLoading && (
                            <div className="flex justify-center items-center p-12">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-500"></div>
                            </div>
                        )}
                        {searchError && <p className="text-center text-red-500">{searchError}</p>}
                        {searchResults && !searchIsLoading && (
                             mapChunks.length > 0 ? (
                                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                                    <div className="lg:col-span-2 bg-stone-200 dark:bg-slate-800 p-2 rounded-lg shadow-md h-96 lg:h-[60vh]">
                                        {selectedLocation ? (
                                            <iframe
                                                key={selectedLocation.maps?.uri}
                                                title="Location Map"
                                                className="w-full h-full rounded-md border-0"
                                                loading="lazy"
                                                allowFullScreen
                                                referrerPolicy="no-referrer-when-downgrade"
                                                src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedLocation.maps?.title || '')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                                            ></iframe>
                                        ) : (
                                            <div className="flex items-center justify-center h-full rounded-md bg-white dark:bg-slate-700">
                                                <p className="text-stone-500 dark:text-stone-400 text-lg">মানচিত্রে দেখার জন্য একটি অবস্থান নির্বাচন করুন।</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md h-[60vh] overflow-y-auto">
                                        <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-white">অনুসন্ধানের ফলাফল</h2>
                                        <ul className="space-y-3">
                                            {mapChunks.map((chunk, index) => (
                                                <li key={index}>
                                                    <button
                                                        onClick={() => setSelectedLocation(chunk)}
                                                        className={`w-full flex items-start p-3 rounded-md shadow-sm text-left transition-colors ${selectedLocation?.maps?.uri === chunk.maps?.uri ? 'bg-teal-100 dark:bg-slate-600' : 'bg-stone-50 dark:bg-slate-700 hover:bg-teal-50 dark:hover:bg-slate-600'}`}
                                                    >
                                                        <MapIcon className="h-6 w-6 text-teal-500 mr-4 flex-shrink-0 mt-1" />
                                                        <span className="text-stone-800 dark:text-stone-200 font-medium">{chunk.maps?.title}</span>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md text-center">
                                    <p className="text-stone-700 dark:text-stone-300">কোনো অবস্থান পাওয়া যায়নি। অনুগ্রহ করে একটি ভিন্ন অনুসন্ধান শব্দ দিয়ে চেষ্টা করুন।</p>
                                </div>
                            )
                        )}
                    </section>
                ) : (
                    <section className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        <div ref={mapContainerRef} className="lg:col-span-2 h-96 lg:h-[70vh] rounded-lg shadow-md z-0"></div>
                        <div className="lg:col-span-3 h-[70vh] overflow-y-auto space-y-4 pr-2">
                            {filteredEvents.length > 0 ? filteredEvents.map(event => {
                                const isRsvpd = rsvpdEvents.has(event.id);
                                return (
                                    <div key={event.id} className={`bg-white dark:bg-slate-800 rounded-lg shadow-lg p-5 border-l-4 ${selectedEventId === event.id ? 'border-teal-500' : 'border-transparent'}`}>
                                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-2 ${categoryColors[event.category]}`}>{event.category}</span>
                                        <h3 className="text-xl font-bold text-stone-800 dark:text-white mb-2">{event.title}</h3>
                                        <p className="text-stone-600 dark:text-stone-400 mb-4">{event.description}</p>
                                        <div className="text-sm space-y-2 text-stone-700 dark:text-stone-300">
                                            <p className="flex items-center"><CalendarDaysIcon className="h-5 w-5 mr-2 text-teal-500" /> {new Date(event.date).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })} - {event.time}</p>
                                            <p className="flex items-center"><MapIcon className="h-5 w-5 mr-2 text-teal-500" /> {event.location}</p>
                                            <p className="flex items-center"><UserGroupIcon className="h-5 w-5 mr-2 text-teal-500" /> সংগঠক: {event.organizer}</p>
                                        </div>
                                        <div className="mt-4 pt-4 border-t dark:border-slate-700 flex justify-between items-center">
                                            <div>
                                                <button onClick={() => handleRsvp(event.id, event.title)} className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-full transition-colors ${isRsvpd ? 'bg-teal-600 text-white' : 'bg-stone-200 dark:bg-slate-700 hover:bg-stone-300'}`}>
                                                    <BellIcon className="h-5 w-5 mr-2" /> {isRsvpd ? 'RSVP করা হয়েছে' : 'RSVP করুন'}
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleShare(event)} className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full transition-colors bg-stone-100 dark:bg-slate-700 hover:bg-stone-200 text-stone-600 dark:text-stone-300" aria-label={`${event.title} শেয়ার করুন`}>
                                                    <ShareIcon className="h-4 w-4 mr-1.5" />
                                                    শেয়ার
                                                </button>
                                                <button onClick={() => viewOnMap(event)} className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full transition-colors bg-stone-100 dark:bg-slate-700 hover:bg-stone-200 text-stone-600 dark:text-stone-300" aria-label="মানচিত্রে দেখুন">
                                                    <MapIcon className="h-4 w-4 mr-1.5" />
                                                    মানচিত্র
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow-md">
                                    <p className="text-stone-500 dark:text-stone-400">এই ক্যাটাগরিতে কোনো ইভেন্ট পাওয়া যায়নি।</p>
                                </div>
                            )}
                        </div>
                    </section>
                )}
                
                {notificationMessage && (
                    <div className="fixed bottom-24 right-6 bg-slate-800 text-white px-6 py-3 rounded-full shadow-lg transition-transform animate-bounce">
                        {notificationMessage}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityHealthEventsPage;
