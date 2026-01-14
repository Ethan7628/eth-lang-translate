import { Translation } from "@/types/translation";
import { cacheTranslation, getCachedTranslation } from "./cacheService";

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 300; // 300ms between requests

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// DeepL API configuration
const DEEPL_API_URL = "https://api-free.deepl.com/v2/translate";

// Mock translation for demo/offline fallback
const mockTranslate = async (text: string, targetLang: string): Promise<{ translatedText: string; detectedSourceLang?: string }> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  const mockTranslations: Record<string, Record<string, string>> = {
    "hello": { ES: "hola", FR: "bonjour", DE: "hallo", IT: "ciao", "PT-BR": "olá", JA: "こんにちは", "ZH-HANS": "你好", KO: "안녕하세요", AR: "مرحبا", RU: "привет" },
    "goodbye": { ES: "adiós", FR: "au revoir", DE: "auf wiedersehen", IT: "arrivederci", "PT-BR": "adeus", JA: "さようなら", "ZH-HANS": "再见", KO: "안녕히 가세요", AR: "وداعا", RU: "до свидания" },
    "thank you": { ES: "gracias", FR: "merci", DE: "danke", IT: "grazie", "PT-BR": "obrigado", JA: "ありがとう", "ZH-HANS": "谢谢", KO: "감사합니다", AR: "شكرا", RU: "спасибо" },
    "how are you": { ES: "¿cómo estás?", FR: "comment allez-vous?", DE: "wie geht es dir?", IT: "come stai?", "PT-BR": "como você está?", JA: "お元気ですか", "ZH-HANS": "你好吗", KO: "어떻게 지내세요?", AR: "كيف حالك؟", RU: "как дела?" },
  };
  
  const lowerText = text.toLowerCase().trim();
  if (mockTranslations[lowerText] && mockTranslations[lowerText][targetLang]) {
    return { translatedText: mockTranslations[lowerText][targetLang], detectedSourceLang: "EN" };
  }
  
  // Return text with language indicator for demo
  return { translatedText: `[${targetLang}] ${text}`, detectedSourceLang: "EN" };
};

export interface TranslateResult {
  translatedText: string;
  detectedSourceLang?: string;
}

export const translateText = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<Translation> => {
  if (!text.trim()) {
    throw new Error("Please enter text to translate");
  }

  // Check cache first
  const cached = await getCachedTranslation(text, sourceLanguage, targetLanguage);
  if (cached) {
    return cached;
  }

  // Rate limiting
  const now = Date.now();
  if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
    await new Promise((resolve) =>
      setTimeout(resolve, MIN_REQUEST_INTERVAL - (now - lastRequestTime))
    );
  }
  lastRequestTime = Date.now();

  // Check if we're offline
  if (!navigator.onLine) {
    // Try to find any cached translation for this text
    const offlineResult = await mockTranslate(text, targetLanguage);
    const translation: Translation = {
      id: generateId(),
      sourceText: text,
      translatedText: offlineResult.translatedText,
      sourceLanguage: offlineResult.detectedSourceLang || sourceLanguage,
      targetLanguage,
      timestamp: Date.now(),
    };
    return translation;
  }

  // Get DeepL API key
  const apiKey = import.meta.env.VITE_DEEPL_API_KEY;
  
  let translatedText: string;
  let detectedSourceLang: string | undefined;
  
  if (apiKey) {
    try {
      // Build request body for DeepL
      const requestBody: Record<string, string | string[]> = {
        text: [text],
        target_lang: targetLanguage,
      };
      
      // Only add source_lang if it's not auto-detect
      // DeepL auto-detects if source_lang is omitted
      if (sourceLanguage && sourceLanguage !== "AUTO") {
        // DeepL requires just the base language code for source (no regional variants)
        requestBody.source_lang = sourceLanguage.split("-")[0];
      }

      const response = await fetch(DEEPL_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `DeepL-Auth-Key ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("DeepL API error:", response.status, errorText);
        
        if (response.status === 403) {
          throw new Error("Invalid API key. Please check your DeepL API key.");
        } else if (response.status === 456) {
          throw new Error("DeepL quota exceeded. Please check your usage limits.");
        } else if (response.status === 429) {
          throw new Error("Too many requests. Please wait a moment and try again.");
        } else {
          // Fallback to mock for other errors
          console.warn("DeepL API error, using mock translation");
          const mockResult = await mockTranslate(text, targetLanguage);
          translatedText = mockResult.translatedText;
          detectedSourceLang = mockResult.detectedSourceLang;
        }
      } else {
        const data = await response.json();
        translatedText = data.translations[0].text;
        detectedSourceLang = data.translations[0].detected_source_language;
      }
    } catch (error) {
      if (error instanceof Error && 
          (error.message.includes("Invalid API key") || 
           error.message.includes("quota exceeded") ||
           error.message.includes("Too many requests"))) {
        throw error;
      }
      console.warn("API error, using mock translation:", error);
      const mockResult = await mockTranslate(text, targetLanguage);
      translatedText = mockResult.translatedText;
      detectedSourceLang = mockResult.detectedSourceLang;
    }
  } else {
    // No API key - use mock translation for demo
    console.warn("No DeepL API key configured, using mock translation");
    const mockResult = await mockTranslate(text, targetLanguage);
    translatedText = mockResult.translatedText;
    detectedSourceLang = mockResult.detectedSourceLang;
  }

  const translation: Translation = {
    id: generateId(),
    sourceText: text,
    translatedText: translatedText!,
    sourceLanguage: detectedSourceLang || sourceLanguage,
    targetLanguage,
    timestamp: Date.now(),
  };

  // Cache the translation
  await cacheTranslation(translation);

  return translation;
};
