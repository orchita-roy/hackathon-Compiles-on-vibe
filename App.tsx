
import React, { useState, useEffect, useCallback } from 'react';
import { Page, Notification, User } from './types';
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
import NpmManagerPage from './pages/NpmManagerPage';
import AuthPage from './pages/AuthPage';

type Theme = 'light' | 'dark';

const NOTIFICATIONS_KEY = 'healthFriendNotifications';
const USER_KEY = 'healthFriendUser';

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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(NOTIFICATIONS_KEY);
      if (saved) {
        setNotifications(JSON.parse(saved));
      }
      const savedUser = localStorage.getItem(USER_KEY);
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error("Failed to load data from localStorage:", e);
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

  const handleLogin = useCallback((user: User) => {
    setCurrentUser(user);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setIsAuthModalOpen(false);
    addNotification(`স্বাগতম, ${user.name}!`, 'success');
  }, [addNotification]);
  
  const handleSignup = useCallback((user: User) => {
    setCurrentUser(user);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setIsAuthModalOpen(false);
    addNotification(`${user.name}, আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!`, 'success');
  }, [addNotification]);

  const handleGoogleLogin = useCallback(() => {
    // This is a mock implementation. In a real app, this would involve a Google OAuth flow.
    const mockGoogleUser: User = {
      name: 'গুগল ব্যবহারকারী',
      email: 'user@google.com',
      age: 30,
      gender: 'other',
    };
    handleLogin(mockGoogleUser);
  }, [handleLogin]);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(USER_KEY);
    addNotification('আপনি সফলভাবে লগ আউট করেছেন।', 'info');
  }, [addNotification]);

  const handleResetApp = useCallback(() => {
    const confirmation = window.confirm(
      "আপনি কি নিশ্চিত? এটি আপনার সমস্ত সংরক্ষিত ডেটা যেমন প্রোফাইল, স্বাস্থ্য চেক-ইন এবং অফলাইন ডেটা স্থায়ীভাবে মুছে ফেলবে।"
    );
    if (confirmation) {
        localStorage.clear();
        window.location.reload();
    }
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
        return <SeasonalHealthTipsPage />;
      case Page.MaternalAndChildHealth:
        return <MaternalAndChildHealthPage addNotification={addNotification} />;
      case Page.SymptomAwarenessGuide:
        return <SymptomAwarenessGuidePage addNotification={addNotification} />;
      case Page.CommunityHealthEvents:
        return <CommunityHealthEventsPage addNotification={addNotification} />;
      case Page.VolunteerDirectory:
        return <VolunteerDirectoryPage addNotification={addNotification} />;
      case Page.NpmManager:
        return <NpmManagerPage addNotification={addNotification} />;
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
        currentUser={currentUser}
        onLoginClick={() => setIsAuthModalOpen(true)}
        onLogoutClick={handleLogout}
        onResetClick={handleResetApp}
      />
      <main className="flex-grow">
        {renderPage()}
      </main>
      {isAuthModalOpen && (
        <AuthPage 
            onClose={() => setIsAuthModalOpen(false)}
            onLogin={handleLogin}
            onSignup={handleSignup}
            onGoogleLogin={handleGoogleLogin}
        />
      )}
      <Footer />
      <Chatbot />
    </div>
  );
};

export default App;