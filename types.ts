
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