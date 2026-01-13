import { Translation } from "@/types/translation";
import { cacheTranslation, getCachedTranslation } from "./cacheService";

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 300; // 300ms between requests

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Mock translation for demo (fallback when no API key)
const mockTranslate = async (text: string, targetLang: string): Promise<string> => {
  // Simple mock that adds language indicator
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  const mockTranslations: Record<string, Record<string, string>> = {
    "hello": { es: "hola", fr: "bonjour", de: "hallo", it: "ciao", pt: "olá", ja: "こんにちは", zh: "你好", ko: "안녕하세요", ar: "مرحبا", am: "ሰላም" },
    "goodbye": { es: "adiós", fr: "au revoir", de: "auf wiedersehen", it: "arrivederci", pt: "adeus", ja: "さようなら", zh: "再见", ko: "안녕히 가세요", ar: "وداعا", am: "ደህና ሁን" },
    "thank you": { es: "gracias", fr: "merci", de: "danke", it: "grazie", pt: "obrigado", ja: "ありがとう", zh: "谢谢", ko: "감사합니다", ar: "شكرا", am: "አመሰግናለሁ" },
    "how are you": { es: "¿cómo estás?", fr: "comment allez-vous?", de: "wie geht es dir?", it: "come stai?", pt: "como você está?", ja: "お元気ですか", zh: "你好吗", ko: "어떻게 지내세요?", ar: "كيف حالك؟", am: "እንዴት ነህ?" },
  };
  
  const lowerText = text.toLowerCase().trim();
  if (mockTranslations[lowerText] && mockTranslations[lowerText][targetLang]) {
    return mockTranslations[lowerText][targetLang];
  }
  
  // Return text with language indicator for demo
  return `[${targetLang.toUpperCase()}] ${text}`;
};

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

  // Try Google Cloud Translation API
  const apiKey = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;
  
  let translatedText: string;
  
  if (apiKey) {
    try {
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            q: text,
            source: sourceLanguage,
            target: targetLanguage,
            format: "text",
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 403 || response.status === 429) {
          // Quota exceeded or forbidden - fall back to mock
          console.warn("API quota exceeded, using mock translation");
          translatedText = await mockTranslate(text, targetLanguage);
        } else {
          throw new Error(error.error?.message || "Translation failed");
        }
      } else {
        const data = await response.json();
        translatedText = data.data.translations[0].translatedText;
      }
    } catch (error) {
      console.warn("API error, using mock translation:", error);
      translatedText = await mockTranslate(text, targetLanguage);
    }
  } else {
    // No API key - use mock translation for demo
    translatedText = await mockTranslate(text, targetLanguage);
  }

  const translation: Translation = {
    id: generateId(),
    sourceText: text,
    translatedText,
    sourceLanguage,
    targetLanguage,
    timestamp: Date.now(),
  };

  // Cache the translation
  await cacheTranslation(translation);

  return translation;
};
