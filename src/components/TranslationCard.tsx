import { Volume2, Star, StarOff, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Translation } from "@/types/translation";
import { getLanguageByCode } from "@/data/languages";
import { AudioButton } from "./AudioButton";

interface TranslationCardProps {
  translation: Translation;
  onToggleFavorite?: (translation: Translation) => void;
  onSelect?: (translation: Translation) => void;
}

export const TranslationCard = ({
  translation,
  onToggleFavorite,
  onSelect,
}: TranslationCardProps) => {
  const sourceLanguage = getLanguageByCode(translation.sourceLanguage);
  const targetLanguage = getLanguageByCode(translation.targetLanguage);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-elevated p-4 cursor-pointer hover:shadow-medium transition-shadow"
      onClick={() => onSelect?.(translation)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span className="font-medium">{sourceLanguage?.name}</span>
            <span>→</span>
            <span className="font-medium">{targetLanguage?.name}</span>
            <span className="flex items-center gap-1 ml-auto">
              <Clock className="h-3 w-3" />
              {formatTime(translation.timestamp)}
            </span>
          </div>
          
          <p className="text-sm text-foreground/80 truncate mb-1">
            {translation.sourceText}
          </p>
          <p className="text-sm font-medium text-foreground truncate">
            {translation.translatedText}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <AudioButton
            text={translation.translatedText}
            language={translation.targetLanguage}
          />
          
          {onToggleFavorite && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(translation);
              }}
              className="icon-button"
              aria-label={translation.isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {translation.isFavorite ? (
                <Star className="h-5 w-5 text-primary fill-primary" />
              ) : (
                <StarOff className="h-5 w-5" />
              )}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
