import React, { useState, useEffect } from 'react';
import { findNearbyPlaces } from '../services/geminiService';
import { GroundingChunk, Notification } from '../types';
import { MapIcon, ArrowDownTrayIcon } from '../components/IconComponents';

const OFFLINE_MAP_KEY = 'offlineHealthMapData';

interface CommunityHealthMapPageProps {
    addNotification: (message: string, type?: Notification['type']) => void;
}

const CommunityHealthMapPage: React.FC<CommunityHealthMapPageProps> = ({ addNotification }) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{ text: string; chunks: GroundingChunk[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<GroundingChunk | null>(null);

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineLocations, setOfflineLocations] = useState<GroundingChunk[]>([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load saved offline data on mount
    try {
        const savedData = localStorage.getItem(OFFLINE_MAP_KEY);
        if (savedData) {
            setOfflineLocations(JSON.parse(savedData));
        }
    } catch (e) {
        console.error("Failed to load offline map data:", e);
    }

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setSelectedLocation(null);

    try {
      const response = await findNearbyPlaces(query);
      setResult(response);
    } catch (err) {
      setError('একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const mapChunks = result?.chunks?.filter(c => c.maps) || [];

  const handleSaveOffline = () => {
    if (result && mapChunks.length > 0) {
        try {
            localStorage.setItem(OFFLINE_MAP_KEY, JSON.stringify(mapChunks));
            setOfflineLocations(mapChunks);
            addNotification(`${mapChunks.length}টি অবস্থান অফলাইন ব্যবহারের জন্য সংরক্ষণ করা হয়েছে।`, 'success');
        } catch (e) {
            console.error("Failed to save map data:", e);
            addNotification('অবস্থান সংরক্ষণ করতে ব্যর্থ হয়েছে।', 'error');
        }
    }
  };

  const renderOnlineView = () => (
    <>
      {/* Search Form */}
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="যেমন, 'নিকটতম ক্লিনিক কোথায়?'"
            className="flex-grow px-4 py-3 border border-stone-300 dark:border-slate-600 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-slate-800 text-stone-900 dark:text-stone-100"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-3 bg-teal-600 text-white font-bold rounded-full shadow-lg hover:bg-teal-700 disabled:bg-teal-300 transition-colors"
          >
            {isLoading ? 'অনুসন্ধান করা হচ্ছে...' : 'অনুসন্ধান'}
          </button>
        </form>
      </div>

      {/* Results Section */}
      <div className="mt-12 max-w-7xl mx-auto">
        {isLoading && (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        )}
        {error && <p className="text-center text-red-500">{error}</p>}

        {result && !isLoading && (
          mapChunks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Locations List */}
                  <div className="md:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md h-[60vh] overflow-y-auto">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-stone-900 dark:text-white">প্রাসঙ্গিক অবস্থান</h2>
                        <button
                            onClick={handleSaveOffline}
                            title="Save results for offline use"
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-slate-700 rounded-full hover:bg-teal-200 dark:hover:bg-slate-600 transition-colors"
                        >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                            অফলাইনে সংরক্ষণ
                        </button>
                      </div>
                      <ul className="space-y-3">
                          {mapChunks.map((chunk, index) => (
                              <li key={index}>
                                  <button
                                      onClick={() => setSelectedLocation(chunk)}
                                      className={`w-full flex items-start p-3 rounded-md shadow-sm text-left transition-colors ${selectedLocation?.maps?.uri === chunk.maps?.uri ? 'bg-teal-100 dark:bg-slate-600' : 'bg-stone-50 dark:bg-slate-700 hover:bg-teal-50 dark:hover:bg-slate-600'}`}
                                      aria-current={selectedLocation?.maps?.uri === chunk.maps?.uri}
                                  >
                                      <MapIcon className="h-6 w-6 text-teal-500 mr-4 flex-shrink-0 mt-1" />
                                      <span className="text-stone-800 dark:text-stone-200 font-medium">
                                          {chunk.maps?.title}
                                      </span>
                                  </button>
                              </li>
                          ))}
                      </ul>
                  </div>

                  {/* Map View */}
                  <div className="md:col-span-2 bg-stone-200 dark:bg-slate-800 p-2 rounded-lg shadow-md h-[60vh]">
                      {selectedLocation ? (
                          <iframe
                              key={selectedLocation.maps?.uri}
                              title="Location Map"
                              className="w-full h-full rounded-md border-0"
                              loading="lazy"
                              allowFullScreen
                              referrerPolicy="no-referrer-when-downgrade"
                              src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedLocation.maps?.title || '')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                          >
                          </iframe>
                      ) : (
                          <div className="flex items-center justify-center h-full rounded-md bg-white dark:bg-slate-700">
                              <p className="text-stone-500 dark:text-stone-400 text-lg">মানচিত্রে দেখার জন্য তালিকা থেকে একটি অবস্থান নির্বাচন করুন।</p>
                          </div>
                      )}
                  </div>
              </div>
          ) : (
              <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md text-center">
                  <p className="text-stone-700 dark:text-stone-300">কোনো অবস্থান পাওয়া যায়নি। অনুগ্রহ করে একটি ভিন্ন অনুসন্ধান শব্দ দিয়ে চেষ্টা করুন।</p>
              </div>
          )
        )}
      </div>
    </>
  );

  const renderOfflineView = () => (
    <div className="max-w-4xl mx-auto">
        <div className="p-4 bg-yellow-100 dark:bg-yellow-900/50 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200 rounded-r-lg mb-8">
            <p><span className="font-bold">আপনি অফলাইনে আছেন।</span> সংরক্ষিত অবস্থানগুলি নিচে দেখানো হলো।</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-stone-900 dark:text-white">সংরক্ষিত অবস্থান</h2>
            {offlineLocations.length > 0 ? (
                <ul className="space-y-3">
                    {offlineLocations.map((chunk, index) => (
                        <li key={index} className="flex items-start p-3 rounded-md bg-stone-50 dark:bg-slate-700">
                            <MapIcon className="h-6 w-6 text-teal-500 mr-4 flex-shrink-0 mt-1" />
                            <span className="text-stone-800 dark:text-stone-200 font-medium">
                                {chunk.maps?.title}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-stone-500 dark:text-stone-400">কোনো অফলাইন ডেটা পাওয়া যায়নি।</p>
            )}
        </div>
    </div>
  );

  return (
    <div className="bg-stone-50 dark:bg-slate-900 min-h-[calc(100vh-8rem)]">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-stone-800 dark:text-stone-100">কমিউনিটি স্বাস্থ্য মানচিত্র</h1>
          <p className="mt-4 text-lg text-stone-600 dark:text-stone-400 max-w-3xl mx-auto">
            কুমিল্লা, বাংলাদেশ অঞ্চলের ক্লিনিক, ফার্মেসি এবং স্বাস্থ্যকর্মী খুঁজে পেতে প্রশ্ন জিজ্ঞাসা করুন।
          </p>
        </div>

        {isOnline ? renderOnlineView() : renderOfflineView()}
        
      </div>
    </div>
  );
};

export default CommunityHealthMapPage;