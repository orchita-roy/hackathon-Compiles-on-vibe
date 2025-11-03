import { GoogleGenAI, Chat, GenerateContentResponse, Modality, LiveSession, Blob } from '@google/genai';
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
    return { text: 'Sorry, I had trouble finding that. Please try again.', chunks: [] };
  }
};


// Health Advisor functionality
export const getHealthAdvice = async (
  query: string,
  location: { latitude: number; longitude: number } | null
): Promise<{ text: string; chunks: GroundingChunk[] }> => {
  const systemInstruction = `You are "Shastho Bondhu" (Health Friend), a caring and empathetic AI health assistant for a rural community app in Bangladesh. Your tone should always be warm, supportive, and natural, like a trusted community health worker. Your role is to provide preliminary advice for common, non-emergency health issues and suggest seeking professional medical help for serious conditions.
- The user will speak in Bengali. Process all user input as Bengali, even if it contains some English words (Banglish).
- For common ailments like fever, cold, or headache, you may suggest common over-the-counter remedies.
- For any condition that seems serious, complex, or requires a diagnosis, you MUST recommend consulting a doctor or clinic.
- When recommending a doctor or clinic, use the provided tools to find nearby locations.
- ALWAYS include this disclaimer at the end of your response, exactly as written: 'দাবিত্যাগ: এটি পেশাদার চিকিৎসা পরামর্শের বিকল্প নয়। সঠিক تشخیص এবং চিকিৎসার জন্য অনুগ্রহ করে একজন ডাক্তারের সাথে পরামর্শ করুন।'
- **IMPORTANT: You MUST respond exclusively in the Bengali language.**`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        systemInstruction,
        tools: [{ googleMaps: {} }],
        toolConfig: location ? {
          retrievalConfig: {
            latLng: {
              latitude: location.latitude,
              longitude: location.longitude
            }
          }
        } : undefined,
      },
    });

    const text = response.text;
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];
    return { text, chunks };
  } catch (error) {
    console.error('Error getting health advice:', error);
    return { text: 'দুঃখিত, একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।', chunks: [] };
  }
};

// Text-to-Speech functionality
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

// Real-time Transcription functionality
export const startTranscriptionSession = (
  onTranscriptionUpdate: (text: string, isFinal: boolean) => void,
  onError: (error: Error) => void
): Promise<LiveSession> => {
    return ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            onopen: () => {
                // Connection is open, component can start sending audio.
            },
            onmessage: (message) => {
                if (message.serverContent?.inputTranscription) {
                    const { text, isFinal } = message.serverContent.inputTranscription;
                    onTranscriptionUpdate(text, isFinal ?? false);
                }
            },
            onerror: (e: ErrorEvent) => {
                console.error('Live session error:', e);
                onError(new Error('Live session error: ' + (e.message || 'Unknown error')));
            },
            onclose: () => {
                // Session closed
            },
        },
        config: {
            inputAudioTranscription: {},
            // FIX: Per Gemini API guidelines, responseModalities must contain Modality.AUDIO for the Live API.
            responseModalities: [Modality.AUDIO],
        },
    });
};

// FIX: Corrected typo from Float3Array to Float32Array.
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