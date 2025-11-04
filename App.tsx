
import React, { useState, useEffect, useCallback } from 'react';
import { Page } from './types';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import MissionsPage from './pages/MissionsPage';
import CommunityHealthMapPage from './pages/CommunityHealthMapPage';
import VoiceAssistantPage from './pages/VoiceAssistantPage';
import Chatbot from './components/Chatbot';
import MentalHealthCheckPage from './pages/MentalHealthCheckPage';
import AnonymousHelpRequestPage from './pages/AnonymousHelpRequestPage';
import SeasonalHealthTipsPage from './pages/SeasonalHealthTipsPage';
import MaternalAndChildHealthPage from './pages/MaternalAndChildHealthPage';
import SymptomAwarenessGuidePage from './pages/SymptomAwarenessGuidePage';
import CommunityHealthEventsPage from './pages/CommunityHealthEventsPage';
import VolunteerDirectoryPage from './pages/VolunteerDirectoryPage';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
  
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (currentPage) {
      case Page.Home:
        return <HomePage navigateTo={navigateTo} />;
      case Page.Missions:
        return <MissionsPage navigateTo={navigateTo} />;
      case Page.CommunityHealthMap:
        return <CommunityHealthMapPage />;
      case Page.VoiceAssistant:
        return <VoiceAssistantPage />;
      case Page.MentalHealthCheck:
        return <MentalHealthCheckPage />;
      case Page.AnonymousHelpRequest:
        return <AnonymousHelpRequestPage />;
      case Page.SeasonalHealthTips:
        return <SeasonalHealthTipsPage />;
      case Page.MaternalAndChildHealth:
        return <MaternalAndChildHealthPage />;
      case Page.SymptomAwarenessGuide:
        return <SymptomAwarenessGuidePage />;
      case Page.CommunityHealthEvents:
        return <CommunityHealthEventsPage />;
      case Page.VolunteerDirectory:
        return <VolunteerDirectoryPage />;
      default:
        return <HomePage navigateTo={navigateTo} />;
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar 
        navigateTo={navigateTo} 
        currentPage={currentPage} 
        theme={theme} 
        toggleTheme={toggleTheme} 
      />
      <main className="flex-grow">
        {renderPage()}
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
};

export default App;