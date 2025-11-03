import React, { useState } from 'react';
import { findNearbyPlaces } from '../services/geminiService';
import { GroundingChunk } from '../types';
import { MapIcon } from '../components/IconComponents';

const CommunityHealthMapPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{ text: string; chunks: GroundingChunk[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<GroundingChunk | null>(null);

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

  return (
    <div className="bg-white dark:bg-gray-900 min-h-[calc(100vh-8rem)]">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-gray-100">কমিউনিটি স্বাস্থ্য মানচিত্র</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            কুমিল্লা, বাংলাদেশ অঞ্চলের ক্লিনিক, ফার্মেসি এবং স্বাস্থ্যকর্মী খুঁজে পেতে প্রশ্ন জিজ্ঞাসা করুন।
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="যেমন, 'নিকটতম ক্লিনিক কোথায়?'"
              className="flex-grow px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-full shadow-lg hover:bg-emerald-700 disabled:bg-emerald-300 transition-colors"
            >
              {isLoading ? 'অনুসন্ধান করা হচ্ছে...' : 'অনুসন্ধান'}
            </button>
          </form>
        </div>

        {/* Results Section */}
        <div className="mt-12 max-w-7xl mx-auto">
          {isLoading && (
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          )}
          {error && <p className="text-center text-red-500">{error}</p>}

          {result && !isLoading && (
            mapChunks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Locations List */}
                    <div className="md:col-span-1 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md h-[60vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">প্রাসঙ্গিক অবস্থান</h2>
                        <ul className="space-y-3">
                            {mapChunks.map((chunk, index) => (
                                <li key={index}>
                                    <button
                                        onClick={() => setSelectedLocation(chunk)}
                                        className={`w-full flex items-start p-3 rounded-md shadow-sm text-left transition-colors ${selectedLocation?.maps?.uri === chunk.maps?.uri ? 'bg-emerald-200 dark:bg-gray-600' : 'bg-white dark:bg-gray-700 hover:bg-emerald-50 dark:hover:bg-gray-600'}`}
                                        aria-current={selectedLocation?.maps?.uri === chunk.maps?.uri}
                                    >
                                        <MapIcon className="h-6 w-6 text-emerald-500 mr-4 flex-shrink-0 mt-1" />
                                        <span className="text-gray-800 dark:text-gray-200 font-medium">
                                            {chunk.maps?.title}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Map View */}
                    <div className="md:col-span-2 bg-gray-200 dark:bg-gray-800 p-2 rounded-lg shadow-md h-[60vh]">
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
                            <div className="flex items-center justify-center h-full rounded-md bg-gray-50 dark:bg-gray-700">
                                <p className="text-gray-500 dark:text-gray-400 text-lg">মানচিত্রে দেখার জন্য তালিকা থেকে একটি অবস্থান নির্বাচন করুন।</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
                    <p className="text-gray-700 dark:text-gray-300">কোনো অবস্থান পাওয়া যায়নি। অনুগ্রহ করে একটি ভিন্ন অনুসন্ধান শব্দ দিয়ে চেষ্টা করুন।</p>
                </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityHealthMapPage;