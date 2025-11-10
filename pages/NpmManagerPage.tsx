import React, { useState, useEffect, FormEvent } from 'react';
import { NpmPackage, Notification } from '../types';
import { MagnifyingGlassIcon, CubeIcon, ArrowDownTrayIcon, TrashIcon } from '../components/IconComponents';

const INSTALLED_PACKAGES_KEY = 'npmInstalledPackages';

const mockSearchResults: NpmPackage[] = [
    { name: 'react', description: 'A JavaScript library for building user interfaces.', version: '19.2.0' },
    { name: 'lodash', description: 'A modern JavaScript utility library delivering modularity, performance, & extras.', version: '4.17.21' },
    { name: 'moment', description: 'Parse, validate, manipulate, and display dates and times in JavaScript.', version: '2.30.1' },
    { name: 'tailwindcss', description: 'A utility-first CSS framework for rapid UI development.', version: '3.4.3' },
    { name: 'express', description: 'Fast, unopinionated, minimalist web framework for Node.js', version: '4.19.2' },
];

interface NpmManagerPageProps {
    addNotification: (message: string, type?: Notification['type']) => void;
}

const NpmManagerPage: React.FC<NpmManagerPageProps> = ({ addNotification }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<NpmPackage[]>([]);
    const [installedPackages, setInstalledPackages] = useState<NpmPackage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(INSTALLED_PACKAGES_KEY);
            if (saved) {
                setInstalledPackages(JSON.parse(saved));
            }
        } catch (e) {
            console.error("Failed to load installed packages from localStorage", e);
        }
    }, []);

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) {
            setSearchResults([]);
            return;
        };
        setIsLoading(true);
        setError(null);
        // Simulate an API call
        setTimeout(() => {
            const filtered = mockSearchResults.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setSearchResults(filtered);
            if (filtered.length === 0) {
                 setError(`'${searchTerm}' এর জন্য কোনো প্যাকেজ পাওয়া যায়নি।`);
            }
            setIsLoading(false);
        }, 1000);
    };

    const handleInstall = (pkg: NpmPackage) => {
        if (installedPackages.some(p => p.name === pkg.name)) {
            addNotification(`"${pkg.name}" ইতিমধ্যে ইনস্টল করা আছে।`, 'info');
            return;
        }
        const newInstalled = [...installedPackages, pkg];
        setInstalledPackages(newInstalled);
        localStorage.setItem(INSTALLED_PACKAGES_KEY, JSON.stringify(newInstalled));
        addNotification(`"${pkg.name}" সফলভাবে ইনস্টল করা হয়েছে।`, 'success');
    };

    const handleUninstall = (pkg: NpmPackage) => {
        const confirmation = window.confirm(`আপনি কি "${pkg.name}" আনইনস্টল করতে নিশ্চিত?`);
        if (confirmation) {
            const newInstalled = installedPackages.filter(p => p.name !== pkg.name);
            setInstalledPackages(newInstalled);
            localStorage.setItem(INSTALLED_PACKAGES_KEY, JSON.stringify(newInstalled));
            addNotification(`"${pkg.name}" সফলভাবে আনইনস্টল করা হয়েছে।`, 'success');
        }
    };

    return (
        <div className="bg-stone-50 dark:bg-slate-900 py-12 min-h-[calc(100vh-8rem)]">
            <div className="container mx-auto px-6">
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-stone-800 dark:text-stone-100">NPM প্যাকেজ ম্যানেজার</h1>
                    <p className="mt-4 text-lg text-stone-600 dark:text-stone-400 max-w-3xl mx-auto">
                        প্রজেক্টের জন্য প্যাকেজ অনুসন্ধান এবং পরিচালনা করুন (সিমুলেশন)।
                    </p>
                </header>

                <section className="max-w-4xl mx-auto">
                    <form onSubmit={handleSearch} className="flex gap-4 mb-12">
                         <div className="relative flex-grow">
                            <MagnifyingGlassIcon className="h-5 w-5 absolute top-1/2 left-4 -translate-y-1/2 text-stone-400" />
                            <input
                                type="text"
                                placeholder="প্যাকেজ খুঁজুন (যেমন, react, lodash)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border rounded-full bg-white dark:bg-slate-800 border-stone-300 dark:border-slate-600 focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                        </div>
                        <button type="submit" disabled={isLoading} className="px-8 py-3 bg-teal-600 text-white font-bold rounded-full shadow-lg hover:bg-teal-700 disabled:bg-teal-300 transition-colors">
                            {isLoading ? 'অনুসন্ধান...' : 'অনুসন্ধান'}
                        </button>
                    </form>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Search Results */}
                        <div>
                            <h2 className="text-2xl font-bold text-stone-800 dark:text-white mb-4">অনুসন্ধানের ফলাফল</h2>
                            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 h-96 overflow-y-auto">
                                {isLoading && (
                                    <div className="flex justify-center items-center h-full">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
                                    </div>
                                )}
                                {!isLoading && error && <p className="text-center text-red-500 pt-8">{error}</p>}
                                {!isLoading && searchResults.length > 0 && (
                                    <ul className="space-y-4">
                                        {searchResults.map(pkg => (
                                            <li key={pkg.name} className="p-3 bg-stone-50 dark:bg-slate-700/50 rounded-md flex justify-between items-center">
                                                <div>
                                                    <p className="font-bold text-stone-800 dark:text-stone-200">{pkg.name} <span className="text-xs text-stone-500 dark:text-stone-400">v{pkg.version}</span></p>
                                                    <p className="text-sm text-stone-600 dark:text-stone-400">{pkg.description}</p>
                                                </div>
                                                <button onClick={() => handleInstall(pkg)} title={`ইনস্টল করুন ${pkg.name}`} className="p-2 rounded-full text-stone-500 hover:bg-teal-100 hover:text-teal-600 dark:hover:bg-slate-600 transition-colors">
                                                    <ArrowDownTrayIcon className="h-6 w-6" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {!isLoading && !error && searchTerm && searchResults.length === 0 && (
                                    <p className="text-center text-stone-500 pt-8">আপনার অনুসন্ধানের সাথে মেলে এমন কোনো প্যাকেজ পাওয়া যায়নি।</p>
                                )}
                                 {!isLoading && !searchTerm && (
                                    <p className="text-center text-stone-500 pt-8">অনুসন্ধান শুরু করতে একটি প্যাকেজের নাম টাইপ করুন।</p>
                                )}
                            </div>
                        </div>

                        {/* Installed Packages */}
                        <div>
                            <h2 className="text-2xl font-bold text-stone-800 dark:text-white mb-4">ইনস্টল করা প্যাকেজ ({installedPackages.length})</h2>
                            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 h-96 overflow-y-auto">
                                {installedPackages.length > 0 ? (
                                    <ul className="space-y-4">
                                        {installedPackages.map(pkg => (
                                            <li key={pkg.name} className="p-3 bg-stone-50 dark:bg-slate-700/50 rounded-md flex justify-between items-center">
                                                <div className="flex items-center">
                                                    <CubeIcon className="h-6 w-6 text-teal-500 mr-3" />
                                                    <div>
                                                        <p className="font-bold text-stone-800 dark:text-stone-200">{pkg.name}</p>
                                                        <p className="text-xs text-stone-500 dark:text-stone-400">v{pkg.version}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleUninstall(pkg)} title={`আনইনস্টল করুন ${pkg.name}`} className="p-2 rounded-full text-stone-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-slate-600 transition-colors">
                                                    <TrashIcon className="h-6 w-6" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-center text-stone-500 pt-8">এখনও কোনো প্যাকেজ ইনস্টল করা হয়নি।</p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default NpmManagerPage;