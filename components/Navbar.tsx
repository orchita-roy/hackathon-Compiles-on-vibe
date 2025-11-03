import React from 'react';
import { Page } from '../types';
import { HeartIcon, SunIcon, MoonIcon } from './IconComponents';

interface NavbarProps {
  navigateTo: (page: Page) => void;
  currentPage: Page;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ navigateTo, currentPage, theme, toggleTheme }) => {
  const navItems = [
    { page: Page.Home, label: 'হোম' },
    { page: Page.Missions, label: 'মিশন' },
    { page: Page.CommunityHealthMap, label: 'স্বাস্থ্য মানচিত্র' },
    { page: Page.VoiceAssistant, label: 'ভয়েস সহকারী' },
  ];

  const headerClasses = 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md sticky';
  
  const logoClasses = 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400';

  const themeToggleClasses = 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800';


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
                  
                  const activeClasses = 'bg-emerald-600 text-white';
                  const inactiveClasses = 'text-gray-700 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-gray-800 hover:text-emerald-800 dark:hover:text-white';

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
            <button
              onClick={toggleTheme}
              className={`ml-6 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${themeToggleClasses}`}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;