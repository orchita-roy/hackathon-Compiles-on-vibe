
import { ComponentType } from 'react';

export enum Page {
  Home,
  Missions,
  CommunityHealthMap,
  VoiceAssistant,
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
