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
    { page: Page.Home, label: 'Home' },
    { page: Page.Missions, label: 'Missions' },
    { page: Page.CommunityHealthMap, label: 'Health Map' },
  ];

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button onClick={() => navigateTo(Page.Home)} className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400">
              <HeartIcon className="h-8 w-8" />
              <span className="font-bold text-xl">Health Hub</span>
            </button>
          </div>
          <div className="flex items-center">
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => navigateTo(item.page)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentPage === item.page
                        ? 'bg-emerald-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-gray-800 hover:text-emerald-800 dark:hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="ml-6 p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-emerald-500"
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