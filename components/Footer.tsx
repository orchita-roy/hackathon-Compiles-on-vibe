import React from 'react';
import { HeartIcon } from './IconComponents';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white dark:bg-gray-900 border-t border-gray-700 dark:border-gray-800">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <HeartIcon className="h-8 w-8 text-emerald-500" />
            <span className="text-xl font-bold text-gray-200 dark:text-gray-100">Community Health Hub</span>
          </div>
          <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} Community Health Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;