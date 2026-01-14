import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { deepLToSpeechCode } from "@/data/languages";

interface AudioButtonProps {
  text: string;
  language: string;
  disabled?: boolean;
}

export const AudioButton = ({ text, language, disabled }: AudioButtonProps) => {
  const { isSpeaking, speak, stop, isSupported } = useTextToSpeech();

  if (!isSupported) {
    return null;
  }

  const handleClick = () => {
    if (isSpeaking) {
      stop();
    } else {
      // Convert DeepL language code to Web Speech API compatible code
      const speechLang = deepLToSpeechCode(language);
      speak(text, speechLang);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      disabled={disabled || !text}
      className={`icon-button ${
        isSpeaking ? "bg-primary text-primary-foreground" : ""
      } ${disabled || !text ? "opacity-50 cursor-not-allowed" : ""}`}
      aria-label={isSpeaking ? "Stop speaking" : "Listen to pronunciation"}
    >
      {isSpeaking ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Volume2 className="h-5 w-5" />
      )}
    </motion.button>
  );
};