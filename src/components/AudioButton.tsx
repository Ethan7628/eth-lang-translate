import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

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
      // Map language codes to BCP 47 language tags
      const langMap: Record<string, string> = {
        en: "en-US",
        es: "es-ES",
        fr: "fr-FR",
        de: "de-DE",
        it: "it-IT",
        pt: "pt-BR",
        ru: "ru-RU",
        zh: "zh-CN",
        ja: "ja-JP",
        ko: "ko-KR",
        ar: "ar-SA",
        hi: "hi-IN",
        tr: "tr-TR",
        nl: "nl-NL",
        pl: "pl-PL",
        sv: "sv-SE",
        da: "da-DK",
        fi: "fi-FI",
        no: "nb-NO",
        el: "el-GR",
        he: "he-IL",
        th: "th-TH",
        vi: "vi-VN",
        id: "id-ID",
        ms: "ms-MY",
        cs: "cs-CZ",
        hu: "hu-HU",
        ro: "ro-RO",
        uk: "uk-UA",
        am: "am-ET",
      };
      
      speak(text, langMap[language] || "en-US");
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
