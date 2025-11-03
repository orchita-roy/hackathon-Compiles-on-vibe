
import { ComponentType } from 'react';

export enum Page {
  Home,
  Missions,
  CommunityHealthMap,
  VoiceAssistant,
  MentalHealthCheck,
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
