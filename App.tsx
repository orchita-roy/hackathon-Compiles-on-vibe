

import React, { useState, useEffect, useCallback } from 'react';
import { Page, Notification } from './types';
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

const NOTIFICATIONS_KEY = 'healthFriendNotifications';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
  
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(NOTIFICATIONS_KEY);
      if (saved) {
        setNotifications(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load notifications:", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.error("Failed to save notifications:", e);
    }
  }, [notifications]);

  const addNotification = useCallback((message: string, type: Notification['type'] = 'info') => {
    const newNotification: Notification = {
      id: new Date().toISOString(),
      message,
      type,
      timestamp: Date.now(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

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
    const pageProps = { navigateTo, addNotification };
    switch (currentPage) {
      case Page.Home:
        return <HomePage navigateTo={navigateTo} />;
      case Page.Missions:
        return <MissionsPage navigateTo={navigateTo} />;
      case Page.CommunityHealthMap:
        return <CommunityHealthMapPage addNotification={addNotification} />;
      case Page.VoiceAssistant:
        return <VoiceAssistantPage />;
      case Page.MentalHealthCheck:
        return <MentalHealthCheckPage />;
      case Page.AnonymousHelpRequest:
        return <AnonymousHelpRequestPage addNotification={addNotification} />;
      case Page.SeasonalHealthTips:
        return <SeasonalHealthTipsPage addNotification={addNotification} />;
      case Page.MaternalAndChildHealth:
        return <MaternalAndChildHealthPage addNotification={addNotification} />;
      case Page.SymptomAwarenessGuide:
        return <SymptomAwarenessGuidePage addNotification={addNotification} />;
      case Page.CommunityHealthEvents:
        return <CommunityHealthEventsPage addNotification={addNotification} />;
      case Page.VolunteerDirectory:
        return <VolunteerDirectoryPage addNotification={addNotification} />;
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
        notifications={notifications}
        markNotificationAsRead={markNotificationAsRead}
        markAllNotificationsAsRead={markAllNotificationsAsRead}
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