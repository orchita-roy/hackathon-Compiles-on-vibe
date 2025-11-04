
import React, { useState, useEffect } from 'react';
import { HelpRequest, Notification } from '../types';
import { LockClosedIcon, InformationCircleIcon } from '../components/IconComponents';

const OFFLINE_QUEUE_KEY = 'anonymousHelpRequestQueue';

interface AnonymousHelpRequestPageProps {
    addNotification: (message: string, type?: Notification['type']) => void;
}

const AnonymousHelpRequestPage: React.FC<AnonymousHelpRequestPageProps> = ({ addNotification }) => {
    const [message, setMessage] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [consent, setConsent] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'queued' | 'error'>('idle');
    const [error, setError] = useState('');

    // Offline queue synchronization
    useEffect(() => {
        const syncOfflineRequests = async () => {
            const queueString = localStorage.getItem(OFFLINE_QUEUE_KEY);
            if (!queueString) return;
            
            const queue: HelpRequest[] = JSON.parse(queueString);
            if (queue.length === 0) return;
            
            addNotification(`সিঙ্ক করা হচ্ছে ${queue.length} অফলাইন অনুরোধ...`, 'info');
            
            // Simulate sending each request
            const syncPromises = queue.map(async (request) => {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
                console.log(`Request ${request.id} synced.`);
                return request.id;
            });

            try {
                await Promise.all(syncPromises);
                localStorage.removeItem(OFFLINE_QUEUE_KEY);
                addNotification('সমস্ত অফলাইন অনুরোধ সফলভাবে পাঠানো হয়েছে।', 'success');
            } catch (e) {
                addNotification('অফলাইন অনুরোধ সিঙ্ক করতে ব্যর্থ হয়েছে।', 'error');
            }
        };

        window.addEventListener('online', syncOfflineRequests);
        // Attempt sync on page load as well
        if (navigator.onLine) {
            syncOfflineRequests();
        }

        return () => {
            window.removeEventListener('online', syncOfflineRequests);
        };
    }, [addNotification]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !consent) {
            setError('অনুগ্রহ করে একটি বার্তা লিখুন এবং সম্মতিতে টিক দিন।');
            return;
        }

        setIsSubmitting(true);
        setError('');
        setSubmissionStatus('idle');

        const newRequest: HelpRequest = {
            id: new Date().toISOString(),
            message,
            contactInfo,
            timestamp: Date.now(),
        };

        if (navigator.onLine) {
            try {
                // Simulate sending the request to a backend
                await new Promise(resolve => setTimeout(resolve, 1500));
                console.log('Submitting request online:', newRequest);
                setSubmissionStatus('success');
                addNotification('আপনার সাহায্যের অনুরোধ সফলভাবে পাঠানো হয়েছে।', 'success');
            } catch (err) {
                setSubmissionStatus('error');
                setError('আপনার অনুরোধ পাঠাতে একটি সমস্যা হয়েছে।');
                addNotification('সাহায্যের অনুরোধ পাঠাতে ব্যর্থ হয়েছে।', 'error');
            }
        } else {
            // User is offline, queue the request
            const queueString = localStorage.getItem(OFFLINE_QUEUE_KEY);
            const queue: HelpRequest[] = queueString ? JSON.parse(queueString) : [];
            queue.push(newRequest);
            localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
            setSubmissionStatus('queued');
            addNotification('আপনি অফলাইনে আছেন। সংযোগ ফিরে এলে আপনার অনুরোধ পাঠানো হবে।', 'info');
            console.log('Request queued for offline submission:', newRequest);
        }

        setIsSubmitting(false);
        setMessage('');
        setContactInfo('');
        setConsent(false);
    };

    const renderStatusMessage = () => {
        switch (submissionStatus) {
            case 'success':
                return (
                    <div className="mt-6 p-4 bg-green-100 dark:bg-green-900/50 border-l-4 border-green-500 text-green-800 dark:text-green-200 rounded-r-lg">
                        <p className="font-bold">অনুরোধ পাঠানো হয়েছে!</p>
                        <p>একজন প্রশিক্ষিত স্বেচ্ছাসেবক শীঘ্রই আপনার বার্তাটি পর্যালোচনা করবেন।</p>
                    </div>
                );
            case 'queued':
                return (
                    <div className="mt-6 p-4 bg-blue-100 dark:bg-blue-900/50 border-l-4 border-blue-500 text-blue-800 dark:text-blue-200 rounded-r-lg">
                        <p className="font-bold">আপনি অফলাইনে আছেন।</p>
                        <p>আপনার সংযোগ ফিরে এলে আপনার অনুরোধটি স্বয়ংক্রিয়ভাবে পাঠানো হবে।</p>
                    </div>
                );
            case 'error':
                 return (
                    <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 text-red-800 dark:text-red-200 rounded-r-lg">
                        <p>{error}</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-stone-50 dark:bg-slate-900 py-12 min-h-[calc(100vh-8rem)]">
            <div className="container mx-auto px-6">
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-stone-800 dark:text-stone-100">গোপনীয় সাহায্যের অনুরোধ</h1>
                    <p className="mt-4 text-lg text-stone-600 dark:text-stone-400 max-w-3xl mx-auto">
                        এখানে আপনি নিরাপদে এবং বেনামে মানসিক স্বাস্থ্য সহায়তার জন্য অনুরোধ করতে পারেন।
                    </p>
                </header>

                <section className="max-w-2xl mx-auto">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 sm:p-8">
                        {submissionStatus !== 'idle' ? (
                            <div className="text-center">
                                {renderStatusMessage()}
                                <button
                                    onClick={() => setSubmissionStatus('idle')}
                                    className="mt-8 px-6 py-3 bg-teal-600 text-white font-bold rounded-full shadow-lg hover:bg-teal-700 transition-colors"
                                >
                                    একটি নতুন অনুরোধ করুন
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="mb-6 p-4 bg-stone-100 dark:bg-slate-700 rounded-lg flex items-center space-x-3">
                                    <LockClosedIcon className="h-8 w-8 text-teal-500 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-bold text-stone-800 dark:text-white">আপনার গোপনীয়তা সুরক্ষিত</h3>
                                        <p className="text-sm text-stone-600 dark:text-stone-400">আপনার নাম বা পরিচয় শেয়ার করার প্রয়োজন নেই। আপনার বার্তাটি গোপনীয়ভাবে একজন প্রশিক্ষিত স্বেচ্ছাসেবকের কাছে পাঠানো হবে।</p>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label htmlFor="message" className="block text-lg font-medium text-stone-700 dark:text-stone-300 mb-2">আপনার বার্তা</label>
                                    <textarea
                                        id="message"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        rows={6}
                                        className="w-full px-3 py-2 border border-stone-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-700 text-stone-900 dark:text-stone-200 text-base"
                                        placeholder="আপনার অনুভূতি বা পরিস্থিতি সম্পর্কে এখানে লিখুন..."
                                        required
                                    />
                                </div>

                                <div className="mb-6">
                                    <label htmlFor="contact" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">যোগাযোগের তথ্য (ঐচ্ছিক)</label>
                                    <input
                                        type="text"
                                        id="contact"
                                        value={contactInfo}
                                        onChange={(e) => setContactInfo(e.target.value)}
                                        className="w-full px-3 py-2 border border-stone-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-700 text-stone-900 dark:text-stone-200"
                                        placeholder="ফোন নম্বর বা ইমেল (যদি আপনি উত্তর চান)"
                                    />
                                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">আপনি উত্তর পেতে চাইলে এটি পূরণ করুন। এটি সম্পূর্ণ ঐচ্ছিক।</p>
                                </div>

                                <div className="mb-6 flex items-start">
                                    <input
                                        id="consent"
                                        type="checkbox"
                                        checked={consent}
                                        onChange={(e) => setConsent(e.target.checked)}
                                        className="h-5 w-5 mt-1 rounded border-stone-300 text-teal-600 focus:ring-teal-500"
                                    />
                                    <label htmlFor="consent" className="ml-3 text-sm text-stone-600 dark:text-stone-400">
                                        আমি বুঝি যে আমার বার্তাটি পর্যালোচনার জন্য একজন প্রশিক্ষিত স্বেচ্ছাসেবকের কাছে পাঠানো হবে।
                                    </label>
                                </div>
                                
                                {error && <p className="text-center text-sm text-red-500 mb-4">{error}</p>}

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !consent || !message.trim()}
                                    className="w-full px-6 py-3 bg-teal-600 text-white font-bold rounded-full shadow-lg hover:bg-teal-700 disabled:bg-teal-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isSubmitting ? 'পাঠানো হচ্ছে...' : 'গোপনীয়ভাবে অনুরোধ পাঠান'}
                                </button>
                            </form>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AnonymousHelpRequestPage;