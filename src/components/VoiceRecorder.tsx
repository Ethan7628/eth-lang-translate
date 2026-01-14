import { Mic, MicOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useEffect } from "react";
import { deepLToSpeechCode } from "@/data/languages";

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  language: string;
  disabled?: boolean;
}

export const VoiceRecorder = ({
  onTranscript,
  language,
  disabled,
}: VoiceRecorderProps) => {
  const {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    isSupported,
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript && !isListening) {
      onTranscript(transcript);
    }
  }, [transcript, isListening, onTranscript]);

  const handleToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      // Convert DeepL language code to Web Speech API compatible code
      const speechLang = deepLToSpeechCode(language);
      startListening(speechLang);
    }
  };

  if (!isSupported) {
    return (
      <button
        disabled
        className="icon-button opacity-50 cursor-not-allowed"
        title="Speech recognition not supported"
      >
        <MicOff className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        disabled={disabled}
        className={`recording-button ${isListening ? "is-recording" : ""} ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        aria-label={isListening ? "Stop recording" : "Start voice input"}
      >
        {isListening ? (
          <>
            <span className="absolute inset-0 rounded-full bg-destructive/30 animate-pulse-ring" />
            <Loader2 className="h-6 w-6 animate-spin relative z-10" />
          </>
        ) : (
          <Mic className="h-6 w-6" />
        )}
      </motion.button>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 text-xs text-destructive bg-destructive/10 px-3 py-1.5 rounded-lg whitespace-nowrap"
        >
          {error}
        </motion.p>
      )}

      {isListening && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 text-xs text-primary bg-accent px-3 py-1.5 rounded-lg whitespace-nowrap"
        >
          Listening...
        </motion.p>
      )}
    </div>
  );
};