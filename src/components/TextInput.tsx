import { X, Copy, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}

export const TextInput = ({
  value,
  onChange,
  placeholder = "Enter text",
  disabled,
  maxLength = 5000,
}: TextInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(
        120,
        textareaRef.current.scrollHeight
      )}px`;
    }
  }, [value]);

  const handleClear = () => {
    onChange("");
    textareaRef.current?.focus();
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        className="w-full min-h-[120px] p-4 bg-transparent text-foreground text-lg resize-none focus:outline-none placeholder:text-muted-foreground/60"
        aria-label="Text to translate"
      />

      <div className="absolute bottom-2 right-2 flex items-center gap-2">
        {value && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleClear}
            className="p-1.5 rounded-lg hover:bg-secondary/80 text-muted-foreground transition-colors"
            aria-label="Clear text"
          >
            <X className="h-4 w-4" />
          </motion.button>
        )}
        <span className="text-xs text-muted-foreground">
          {value.length}/{maxLength}
        </span>
      </div>
    </div>
  );
};

interface TranslationOutputProps {
  text: string;
  isLoading?: boolean;
  placeholder?: string;
}

export const TranslationOutput = ({
  text,
  isLoading,
  placeholder = "Translation",
}: TranslationOutputProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <div className="relative min-h-[120px] p-4">
      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <span className="text-sm">Translating...</span>
        </div>
      ) : text ? (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg text-foreground"
        >
          {text}
        </motion.p>
      ) : (
        <p className="text-lg text-muted-foreground/60">{placeholder}</p>
      )}

      {text && !isLoading && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={handleCopy}
          className="absolute bottom-2 right-2 p-1.5 rounded-lg hover:bg-secondary/80 text-muted-foreground transition-colors"
          aria-label="Copy translation"
        >
          {copied ? (
            <Check className="h-4 w-4 text-primary" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </motion.button>
      )}
    </div>
  );
};
