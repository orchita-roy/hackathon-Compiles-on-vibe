import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Page, Notification, User } from '../types';
import { HeartIcon, SunIcon, MoonIcon, BellIcon, UserCircleIcon } from './IconComponents';

interface NavbarProps {
  navigateTo: (page: Page) => void;
  currentPage: Page;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  currentUser: User | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  navigateTo, 
  currentPage, 
  theme, 
  toggleTheme,
  notifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  currentUser,
  onLoginClick,
  onLogoutClick
}) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { page: Page.Home, label: 'হোম' },
    { page: Page.Missions, label: 'মিশন' },
    { page: Page.CommunityHealthMap, label: 'স্বাস্থ্য মানচিত্র' },
    { page: Page.VoiceAssistant, label: 'ভয়েস সহকারী' },
  ];

  const hasUnread = useMemo(() => notifications.some(n => !n.read), [notifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const headerClasses = 'bg-stone-50/80 dark:bg-slate-900/80 backdrop-blur-md shadow-md sticky';
  const logoClasses = 'text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300';
  const themeToggleClasses = 'text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-slate-700 focus:ring-offset-stone-100 dark:focus:ring-offset-slate-800';

  const userInitial = currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : '?';

  return (
    <header className={`${headerClasses} top-0 z-50 transition-colors duration-300`}>
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button onClick={() => navigateTo(Page.Home)} className={`flex items-center space-x-2 transition-colors ${logoClasses}`}>
              <HeartIcon className="h-8 w-8" />
              <span className="font-bold text-xl">স্বাস্থ্য বন্ধু</span>
            </button>
          </div>
          <div className="flex items-center">
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item) => {
                  const isActive = currentPage === item.page;
                  const baseClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors";
                  const activeClasses = 'bg-teal-600 text-white';
                  const inactiveClasses = 'text-stone-700 dark:text-stone-300 hover:bg-teal-100 dark:hover:bg-slate-800 hover:text-teal-800 dark:hover:text-white';
                  return (
                    <button
                      key={item.label}
                      onClick={() => navigateTo(item.page)}
                      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative ml-4" ref={notificationsRef}>
              <button
                onClick={() => setIsNotificationsOpen(prev => !prev)}
                className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 relative ${themeToggleClasses}`}
                aria-label="Toggle notifications"
              >
                <BellIcon className="h-6 w-6" />
                {hasUnread && <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-teal-500 ring-2 ring-stone-50 dark:ring-slate-900"></span>}
              </button>
              
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 max-h-[80vh] overflow-y-auto bg-white dark:bg-slate-800 rounded-lg shadow-xl border dark:border-slate-700">
                  <div className="p-3 flex justify-between items-center border-b dark:border-slate-700 sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                    <h3 className="font-bold text-stone-800 dark:text-white">নোটিফিকেশন</h3>
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
                      disabled={!hasUnread}
                    >
                      সব পঠিত হিসাবে চিহ্নিত করুন
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="p-4 text-center text-sm text-stone-500 dark:text-stone-400">আপনার কোনো নোটিফিকেশন নেই।</p>
                  ) : (
                    <ul>
                      {notifications.map(n => (
                        <li key={n.id} className={`border-b dark:border-slate-700 ${!n.read ? 'bg-teal-50 dark:bg-slate-700/50' : ''}`}>
                          <button onClick={() => markNotificationAsRead(n.id)} className="w-full text-left p-3 hover:bg-stone-100 dark:hover:bg-slate-700 flex items-start gap-3">
                            {!n.read && <span className="mt-1.5 block h-2 w-2 rounded-full bg-teal-500 flex-shrink-0"></span>}
                            <div className={n.read ? 'pl-5' : ''}>
                              <p className="text-sm text-stone-700 dark:text-stone-300">{n.message}</p>
                              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                                {new Date(n.timestamp).toLocaleString('bn-BD', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit'})}
                              </p>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={toggleTheme}
              className={`ml-2 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${themeToggleClasses}`}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
            </button>

            <div className="relative ml-3" ref={profileRef}>
              {currentUser ? (
                  <>
                    <button
                        onClick={() => setIsProfileOpen(prev => !prev)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 bg-teal-600 text-white`}
                    >
                        {userInitial}
                    </button>
                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-xl border dark:border-slate-700">
                            <div className="p-4 border-b dark:border-slate-700">
                                <p className="font-bold text-lg text-stone-800 dark:text-white truncate">{currentUser.name}</p>
                                <p className="text-sm text-stone-500 dark:text-stone-400 truncate">{currentUser.email}</p>
                                <div className="text-sm text-stone-500 dark:text-stone-400 mt-2 flex gap-4">
                                    {currentUser.gender && <span>লিঙ্গ: {currentUser.gender === 'male' ? 'পুরুষ' : currentUser.gender === 'female' ? 'মহিলা' : 'অন্যান্য'}</span>}
                                    {currentUser.age && <span>বয়স: {currentUser.age}</span>}
                                </div>
                            </div>
                            <div className="p-2">
                                <button
                                    onClick={() => { onLogoutClick(); setIsProfileOpen(false); }}
                                    className="w-full text-left px-3 py-2 rounded-md text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    লগআউট
                                </button>
                            </div>
                        </div>
                    )}
                  </>
              ) : (
                  <button
                      onClick={onLoginClick}
                      className="px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-slate-700 rounded-md hover:bg-stone-200 dark:hover:bg-slate-600 transition-colors"
                  >
                      লগইন
                  </button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;