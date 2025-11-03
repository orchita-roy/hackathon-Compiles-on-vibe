// Fix: Removed `LiveSession` from the import as it's no longer exported.
import { GoogleGenAI, Chat, GenerateContentResponse, Modality, Blob, LiveServerMessage } from '@google/genai';
import { GroundingChunk } from '../types';
import { encode } from '../utils/audioUtils';


if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Chat functionality
export const createChatSession = (): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: 'You are "Shastho Bondhu" (Health Friend), a caring and empathetic AI health assistant for a rural community app in Bangladesh. Your tone should always be warm, supportive, and natural, like a trusted community health worker. The user may type in any language (e.g., English, Bengali, or Banglish), but you MUST understand it and ALWAYS respond in the Bengali language. Provide clear, simple, and encouraging answers.',
    },
  });
};

// Maps Grounding functionality for Community Health Map
export const findNearbyPlaces = async (query: string): Promise<{ text: string; chunks: GroundingChunk[] }> => {
  try {
    // Hardcoded location for Cumilla, Bangladesh
    const location = {
      latitude: 23.4617,
      longitude: 91.1850,
    };

    const constrainedQuery = `${query}. Do not include pet care, veterinary, or animal clinics. Focus on human health facilities.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: constrainedQuery,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: location.latitude,
              longitude: location.longitude
            }
          }
        }
      },
    });

    const text = response.text;
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];
    return { text, chunks };
  } catch (error) {
    console.error('Error with Maps Grounding:', error);
    return { text: 'দুঃখিত, আমি এটি খুঁজে পেতে সমস্যায় পড়েছি। অনুগ্রহ করে আবার চেষ্টা করুন।', chunks: [] };
  }
};

// Text-to-Speech functionality (used by Chatbot)
export const generateSpeech = async (text: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Using a standard voice
          },
        },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error('Error generating speech:', error);
    return null;
  }
};


// Real-time Voice Assistant functionality
export const startLiveHealthSession = (
  location: { latitude: number; longitude: number } | null,
  callbacks: {
    onOpen?: () => void;
    onMessage: (message: LiveServerMessage) => void;
    onError: (error: ErrorEvent) => void;
    onClose: (event: CloseEvent) => void;
  }
// Fix: Removed explicit return type `Promise<LiveSession>` to let TypeScript infer it.
) => {
  const systemInstruction = `You are "Shastho Bondhu" (Health Friend), a caring and empathetic AI health assistant for a rural community app in Bangladesh. Your tone should always be warm, supportive, and natural, like a trusted community health worker. You are having a real-time voice conversation.
- The user will speak in Bengali. Process all user input as Bengali.
- When a user describes symptoms, first assess if they are for a common, non-serious ailment (like a simple fever, cold, or headache) or if they could indicate something serious.
- **For common ailments:** Suggest simple, safe, over-the-counter remedies commonly available in Bangladesh (e.g., paracetamol for fever, saline for dehydration). Keep it simple and clear.
- **For serious issues:** If symptoms are severe (e.g., high fever for several days, chest pain, difficulty breathing), complex, or unclear, do NOT suggest remedies. Your primary goal is to strongly and clearly advise them to consult a doctor immediately.
- **Providing Location Information:** When you advise seeing a doctor, you should say: "আপনার এলাকার কাছাকাছি ডাক্তার বা ক্লিনিক খুঁজে পেতে অ্যাপের হেলথ ম্যাপ (Health Map) ব্যবহার করতে পারেন।" (To find a doctor or clinic near your area, you can use the app's Health Map).
- ALWAYS include this disclaimer at the end of your final response in a turn: 'দাবিত্যাগ: এটি পেশাদার চিকিৎসা পরামর্শের বিকল্প নয়। সঠিক تشخیص এবং চিকিৎসার জন্য অনুগ্রহ করে একজন ডাক্তারের সাথে পরামর্শ করুন।'
- **IMPORTANT: You MUST respond exclusively in the Bengali language.**
${location ? `The user's current location is approximately latitude ${location.latitude}, longitude ${location.longitude}.` : ''}`;

  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks: {
      onopen: callbacks.onOpen,
      onmessage: callbacks.onMessage,
      onerror: callbacks.onError,
      onclose: callbacks.onClose,
    },
    config: {
      systemInstruction,
      responseModalities: [Modality.AUDIO],
      inputAudioTranscription: {},
      outputAudioTranscription: {},
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });
};


export const createPcmBlob = (inputData: Float32Array): Blob => {
  const l = inputData.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = inputData[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
};