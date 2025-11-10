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
  onResetClick: () => void;
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
  onLogoutClick,
  onResetClick
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
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  return (
    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left side: Logo and nav items */}
          <div className="flex items-center">
            <button onClick={() => navigateTo(Page.Home)} className="flex-shrink-0 flex items-center space-x-2">
              <HeartIcon className="h-8 w-8 text-teal-500" />
              <span className="text-xl font-bold text-stone-800 dark:text-stone-100">স্বাস্থ্য বন্ধু</span>
            </button>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => navigateTo(item.page)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentPage === item.page
                        ? 'bg-teal-50 text-teal-700 dark:bg-slate-800 dark:text-teal-400'
                        : 'text-stone-600 hover:bg-teal-50 hover:text-teal-700 dark:text-stone-300 dark:hover:bg-slate-800 dark:hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right side: Theme toggle, notifications, profile */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button onClick={toggleTheme} className="p-2 rounded-full text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors">
              {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
            </button>
            
            {/* Notifications dropdown */}
            <div className="relative" ref={notificationsRef}>
              <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="p-2 rounded-full text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-800 relative transition-colors">
                <BellIcon className="h-6 w-6" />
                {hasUnread && <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"></span>}
              </button>
              {isNotificationsOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <div className="px-4 py-2 flex justify-between items-center border-b dark:border-slate-700">
                      <h3 className="text-sm font-medium text-stone-900 dark:text-white">নোটিফিকেশন ({unreadCount})</h3>
                      {unreadCount > 0 && <button onClick={markAllNotificationsAsRead} className="text-xs text-teal-600 dark:text-teal-400 hover:underline">সব পঠিত করুন</button>}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? notifications.map(n => (
                      <div key={n.id} className={`p-4 border-b dark:border-slate-700 ${!n.read ? 'bg-teal-50 dark:bg-slate-700/50' : ''}`}>
                        <p className={`text-sm ${ n.type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-stone-600 dark:text-stone-300'}`}>{n.message}</p>
                        {!n.read && <button onClick={() => markNotificationAsRead(n.id)} className="text-xs text-stone-500 hover:text-stone-800 mt-1">পঠিত হিসাবে চিহ্নিত করুন</button>}
                      </div>
                    )) : (
                      <p className="text-sm text-stone-500 dark:text-stone-400 p-4 text-center">কোনো নোটিফিকেশন নেই</p>
                    )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile dropdown */}
            <div className="relative" ref={profileRef}>
              {currentUser ? (
                <div>
                  <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="p-1 rounded-full text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                    <UserCircleIcon className="h-8 w-8" />
                  </button>
                  {isProfileOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5">
                      <div className="px-4 py-3 border-b dark:border-slate-700">
                        <p className="text-sm text-stone-900 dark:text-white font-medium">হিসাবে সাইন ইন করেছেন</p>
                        <p className="text-sm text-stone-700 dark:text-stone-300 truncate font-semibold">{currentUser.name}</p>
                      </div>
                      <button onClick={onLogoutClick} className="block w-full text-left px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-slate-700">
                        লগ আউট
                      </button>
                      <button onClick={onResetClick} className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-stone-100 dark:hover:bg-slate-700">
                        অ্যাপ রিসেট করুন
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onLoginClick}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  লগইন / সাইন আপ
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;