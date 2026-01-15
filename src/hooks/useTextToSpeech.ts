import { useState, useCallback, useRef, useEffect } from "react";

type VoiceType = "male" | "female" | "boy" | "girl";

interface TextToSpeechHook {
  isSpeaking: boolean;
  speak: (text: string, language?: string, voiceType?: VoiceType) => void;
  stop: () => void;
  isSupported: boolean;
}

// Voice matching keywords for different voice types
const voicePatterns: Record<VoiceType, { keywords: string[]; pitch: number; rate: number }> = {
  male: { keywords: ["male", "man", "guy", "david", "james", "mark", "daniel"], pitch: 0.8, rate: 0.9 },
  female: { keywords: ["female", "woman", "lady", "samantha", "victoria", "kate", "susan", "zira"], pitch: 1.1, rate: 0.95 },
  boy: { keywords: ["boy", "child", "kid", "junior"], pitch: 1.4, rate: 1.0 },
  girl: { keywords: ["girl", "child", "kid"], pitch: 1.5, rate: 1.0 },
};

export const useTextToSpeech = (): TextToSpeechHook => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  // Load voices when available
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [isSupported]);

  const findVoiceForType = useCallback(
    (language: string, voiceType: VoiceType): SpeechSynthesisVoice | null => {
      const langCode = language.split("-")[0];
      const pattern = voicePatterns[voiceType];
      
      // Filter voices by language
      const langVoices = voices.filter(
        (v) => v.lang.startsWith(langCode) || v.lang.startsWith(language)
      );

      if (langVoices.length === 0) return null;

      // Try to find a voice matching the type keywords
      for (const keyword of pattern.keywords) {
        const match = langVoices.find((v) =>
          v.name.toLowerCase().includes(keyword)
        );
        if (match) return match;
      }

      // Fallback: use pitch to simulate voice type
      // For male/boy, prefer voices without "female" in name
      // For female/girl, prefer voices with "female" or without "male"
      if (voiceType === "male" || voiceType === "boy") {
        const nonFemale = langVoices.find(
          (v) => !v.name.toLowerCase().includes("female")
        );
        return nonFemale || langVoices[0];
      } else {
        const female = langVoices.find(
          (v) =>
            v.name.toLowerCase().includes("female") ||
            !v.name.toLowerCase().includes("male")
        );
        return female || langVoices[0];
      }
    },
    [voices]
  );

  const speak = useCallback(
    (text: string, language = "en-US", voiceType: VoiceType = "female") => {
      if (!isSupported) {
        console.warn("Text-to-speech is not supported in this browser");
        return;
      }

      // Stop any current speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Set language
      utterance.lang = language;

      // Find and set voice based on type
      const voice = findVoiceForType(language, voiceType);
      if (voice) {
        utterance.voice = voice;
      }

      // Set pitch and rate based on voice type
      const pattern = voicePatterns[voiceType];
      utterance.pitch = pattern.pitch;
      utterance.rate = pattern.rate;
      utterance.volume = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [isSupported, findVoiceForType]
  );

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  return {
    isSpeaking,
    speak,
    stop,
    isSupported,
  };
};
