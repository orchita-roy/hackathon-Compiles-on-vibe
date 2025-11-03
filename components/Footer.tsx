import React from 'react';
import { HeartIcon } from './IconComponents';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-800 text-white dark:bg-slate-950 border-t border-slate-700 dark:border-slate-800">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <HeartIcon className="h-8 w-8 text-teal-400" />
            <span className="text-xl font-bold text-stone-200 dark:text-stone-100">স্বাস্থ্য বন্ধু</span>
          </div>
          <p className="text-sm text-stone-400">&copy; {new Date().getFullYear()} স্বাস্থ্য বন্ধু। সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;