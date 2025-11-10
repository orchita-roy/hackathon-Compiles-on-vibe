import { ComponentType } from 'react';

export enum Page {
  Home,
  Missions,
  CommunityHealthMap,
  VoiceAssistant,
  MentalHealthCheck,
  AnonymousHelpRequest,
  SeasonalHealthTips,
  MaternalAndChildHealth,
  SymptomAwarenessGuide,
  CommunityHealthEvents,
  VolunteerDirectory,
  NpmManager,
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
  timestamp: number;
  read: boolean;
}

export interface User {
  name: string;
  email?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  age?: number;
}

export interface Mission {
  id: number;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}

export interface GroundingChunk {
  maps?: {
    uri: string;
    title: string;
  };
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export type Mood = 'happy' | 'calm' | 'neutral' | 'sad' | 'anxious';

export interface MentalHealthCheckin {
  id: string;
  date: string; // ISO string
  mood: Mood;
  reflection?: string;
}

export interface HelpRequest {
  id: string;
  message: string;
  contactInfo?: string;
  timestamp: number;
}

export interface ANCVisit {
  id: string;
  title: string;
  recommendedDate: string;
  completed: boolean;
}

export interface Vaccination {
  id: string;
  name: string;
  recommendedAge: string;
  dueDate: string;
  completed: boolean;
}

export interface HealthTopic {
  category: 'সাধারণ' | 'পেট' | 'বুক' | 'মাথা';
  title: string;
  worry: string[];
  dos: string[];
  myths: { myth: string; reality: string }[];
}

export type EventCategory = 'টিকাদান' | 'রক্তদান' | 'মানসিক স্বাস্থ্য' | 'মাতৃস্বাস্থ্য' | 'ডায়াবেটিস';

export interface CommunityHealthEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  date: string; // ISO string
  time: string;
  location: string;
  organizer: string;
  mapLink: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  verified: boolean;
}

export type VolunteerSkill = 'প্রাথমিক চিকিৎসা' | 'মানসিক স্বাস্থ্য' | 'মাতৃস্বাস্থ্য' | 'দীর্ঘস্থায়ী রোগ';

export interface Volunteer {
    id: string;
    name: string;
    location: string;
    skills: VolunteerSkill[];
    phone: string;
    whatsapp: boolean;
    workingHours: string;
    verified: boolean;
    coordinates: {
        lat: number;
        lng: number;
    };
}

export interface NpmPackage {
    name: string;
    description: string;
    version: string;
}