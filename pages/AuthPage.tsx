import React, { useState } from 'react';
import { User } from '../types';
import { XMarkIcon, EnvelopeIcon, LockClosedIcon, UserIcon } from '../components/IconComponents';

interface AuthPageProps {
    onClose: () => void;
    onLogin: (user: User) => void;
    onSignup: (user: User) => void;
    onGoogleLogin: () => void;
}

const GoogleIcon: React.FC = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.802 6.82C34.553 2.964 29.602 1 24 1 10.745 1 1 10.745 1 24s9.745 23 23 23 23-9.745 23-23c0-1.652-.27-3.243-.789-4.789l-1.211.1z" />
        <path fill="#FF3D00" d="M6.306 14.691c-1.402 2.695-2.206 5.808-2.206 9.111s.804 6.416 2.206 9.111l7.338-5.736C13.291 26.31 13 25.183 13 24s.291-2.31.644-3.362l-7.338-5.747z" />
        <path fill="#4CAF50" d="M24 48c5.602 0 10.553-1.964 14.802-5.18l-7.962-6.177c-2.336 1.565-5.182 2.502-8.34 2.502-4.438 0-8.28-2.022-10.47-5.025l-7.338 5.736C8.804 43.19 15.756 48 24 48z" />
        <path fill="#1976D2" d="M43.611 20.083L42 20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.841-5.841C34.553 2.964 29.602 1 24 1 10.745 1 1 10.745 1 24s9.745 23 23 23 23-9.745 23-23c0-1.652-.27-3.243-.789-4.789z" />
    </svg>
);


const AuthPage: React.FC<AuthPageProps> = ({ onClose, onLogin, onSignup, onGoogleLogin }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
    const [age, setAge] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('অনুগ্রহ করে সমস্ত প্রয়োজনীয় ক্ষেত্র পূরণ করুন।');
            return;
        }

        if (isLoginView) {
            // Mock login - derive name from email for this mock scenario
            const mockName = email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase());
            onLogin({ name: mockName, email });
        } else {
            // Mock signup
            if (!name || !age) {
                setError('অনুগ্রহ করে সমস্ত প্রয়োজনীয় ক্ষেত্র পূরণ করুন।');
                return;
            }
            const ageNum = parseInt(age, 10);
            if (isNaN(ageNum) || ageNum <= 0) {
                setError('অনুগ্রহ করে একটি বৈধ বয়স লিখুন।');
                return;
            }
            onSignup({ name, email, gender, age: ageNum });
        }
    };
    
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://www.undp.org/sites/g/files/zskgke326/files/styles/scaled_image_large/public/2022-09/UNDP%20BD%20Acc%20lab.jpg')" }}></div>
            <div className="absolute inset-0 bg-black/30"></div>

            <div 
                className="relative w-full max-w-md m-auto bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 text-white"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10">
                    <XMarkIcon className="h-6 w-6" />
                </button>

                <div className="p-8">
                    <h2 className="text-3xl font-bold text-center mb-2">{isLoginView ? 'স্বাগতম' : 'অ্যাকাউন্ট তৈরি করুন'}</h2>
                    <p className="text-center text-white/80 mb-6">{isLoginView ? 'আপনার অ্যাকাউন্টে লগইন করুন' : 'স্বাস্থ্য বন্ধুতে যোগ দিন'}</p>
                    
                    <div className="flex justify-center mb-6 bg-black/20 rounded-full p-1">
                        <button onClick={() => setIsLoginView(true)} className={`w-1/2 px-4 py-2 font-semibold transition-all rounded-full ${isLoginView ? 'bg-teal-500 text-white shadow-md' : 'text-white/60'}`}>লগইন</button>
                        <button onClick={() => setIsLoginView(false)} className={`w-1/2 px-4 py-2 font-semibold transition-all rounded-full ${!isLoginView ? 'bg-teal-500 text-white shadow-md' : 'text-white/60'}`}>সাইন আপ</button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLoginView && (
                            <div className="relative">
                                <UserIcon className="h-5 w-5 absolute top-1/2 left-4 -translate-y-1/2 text-white/50" />
                                <input type="text" placeholder="নাম" value={name} onChange={e => setName(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white/10 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-400 placeholder-white/70" required />
                            </div>
                        )}
                        <div className="relative">
                            <EnvelopeIcon className="h-5 w-5 absolute top-1/2 left-4 -translate-y-1/2 text-white/50" />
                            <input type="email" placeholder="ইমেল" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white/10 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-400 placeholder-white/70" required />
                        </div>
                        <div className="relative">
                            <LockClosedIcon className="h-5 w-5 absolute top-1/2 left-4 -translate-y-1/2 text-white/50" />
                            <input type="password" placeholder="পাসওয়ার্ড" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white/10 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-400 placeholder-white/70" required />
                        </div>

                        {!isLoginView && (
                            <div className="flex gap-4">
                                <div className="relative flex-1">
                                    <UserIcon className="h-5 w-5 absolute top-1/2 left-4 -translate-y-1/2 text-white/50" />
                                    <select value={gender} onChange={e => setGender(e.target.value as any)} className="w-full pl-12 pr-4 py-3 bg-white/10 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-400 appearance-none">
                                        <option value="male" className="text-black">পুরুষ</option>
                                        <option value="female" className="text-black">মহিলা</option>
                                        <option value="other" className="text-black">অন্যান্য</option>
                                    </select>
                                </div>
                                <div className="relative flex-1">
                                    <input type="number" placeholder="বয়স" value={age} onChange={e => setAge(e.target.value)} className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-400 placeholder-white/70" required />
                                </div>
                            </div>
                        )}
                        
                        {error && <p className="text-sm text-red-300 text-center">{error}</p>}

                        <button type="submit" className="w-full py-3 bg-teal-500 rounded-lg font-bold hover:bg-teal-600 transition-colors shadow-lg">
                            {isLoginView ? 'লগইন' : 'সাইন আপ'}
                        </button>
                    </form>

                    <div className="flex items-center my-6">
                        <hr className="flex-grow border-white/20" />
                        <span className="mx-4 text-sm text-white/80">অথবা</span>
                        <hr className="flex-grow border-white/20" />
                    </div>
                    
                    <button 
                        onClick={onGoogleLogin}
                        className="w-full py-2.5 bg-white text-stone-700 font-semibold rounded-lg flex items-center justify-center hover:bg-stone-200 transition-colors shadow-md">
                       <GoogleIcon />
                        গুগল দিয়ে সাইন ইন করুন
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;