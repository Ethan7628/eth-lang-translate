import { useState, useCallback, useRef } from "react";

interface TextToSpeechHook {
  isSpeaking: boolean;
  speak: (text: string, language?: string) => void;
  stop: () => void;
  isSupported: boolean;
}

export const useTextToSpeech = (): TextToSpeechHook => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  const speak = useCallback((text: string, language = "en-US") => {
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
    
    // Find a voice for the language
    const voices = window.speechSynthesis.getVoices();
    const langCode = language.split("-")[0];
    const voice = voices.find(
      (v) => v.lang.startsWith(langCode) || v.lang.startsWith(language)
    );
    
    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [isSupported]);

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
