import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRightLeft, History, Globe, Sparkles, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { Language, Translation } from "@/types/translation";
import { DEFAULT_SOURCE_LANGUAGE, DEFAULT_TARGET_LANGUAGE } from "@/data/languages";
import { translateText } from "@/services/translateService";
import { getRecentTranslations, toggleFavorite } from "@/services/cacheService";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { OfflineBanner } from "@/components/OfflineBanner";
import { LanguageSelector } from "@/components/LanguageSelector";
import { TextInput, TranslationOutput } from "@/components/TextInput";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { AudioButton } from "@/components/AudioButton";
import { TranslationCard } from "@/components/TranslationCard";

const TranslatorApp = () => {
  const isOnline = useOnlineStatus();
  
  const [sourceLanguage, setSourceLanguage] = useState<Language>(DEFAULT_SOURCE_LANGUAGE);
  const [targetLanguage, setTargetLanguage] = useState<Language>(DEFAULT_TARGET_LANGUAGE);
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentTranslations, setRecentTranslations] = useState<Translation[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load recent translations
  useEffect(() => {
    const loadHistory = async () => {
      const recent = await getRecentTranslations(10);
      setRecentTranslations(recent);
    };
    loadHistory();
  }, [translatedText]);

  // Debounced translation
  useEffect(() => {
    if (!sourceText.trim()) {
      setTranslatedText("");
      setError(null);
      return;
    }

    const timer = setTimeout(async () => {
      if (!isOnline) {
        setError("You're offline. Showing cached results only.");
        return;
      }

      setIsTranslating(true);
      setError(null);

      try {
        const result = await translateText(
          sourceText,
          sourceLanguage.code,
          targetLanguage.code
        );
        setTranslatedText(result.translatedText);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Translation failed");
      } finally {
        setIsTranslating(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [sourceText, sourceLanguage, targetLanguage, isOnline]);

  const handleSwapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleVoiceTranscript = useCallback((text: string) => {
    setSourceText(text);
  }, []);

  const handleToggleFavorite = async (translation: Translation) => {
    await toggleFavorite(translation);
    const recent = await getRecentTranslations(10);
    setRecentTranslations(recent);
  };

  const handleSelectTranslation = (translation: Translation) => {
    setSourceText(translation.sourceText);
    setTranslatedText(translation.translatedText);
    setSourceLanguage(
      { code: translation.sourceLanguage, name: translation.sourceLanguage, nativeName: "" }
    );
    setTargetLanguage(
      { code: translation.targetLanguage, name: translation.targetLanguage, nativeName: "" }
    );
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <OfflineBanner />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Eth Lang</h1>
                <p className="text-xs text-muted-foreground">Smart Translation</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/settings"
                className="icon-button"
                aria-label="Settings"
              >
                <Settings className="h-5 w-5" />
              </Link>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`icon-button ${showHistory ? "bg-primary text-primary-foreground" : ""}`}
                aria-label="Translation history"
              >
                <History className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6">
        {/* Language Selectors */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 mb-6">
          <LanguageSelector
            selectedLanguage={sourceLanguage}
            onSelect={setSourceLanguage}
          />

          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSwapLanguages}
            className="swap-button flex-shrink-0"
            aria-label="Swap languages"
          >
            <ArrowRightLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </motion.button>

          <LanguageSelector
            selectedLanguage={targetLanguage}
            onSelect={setTargetLanguage}
          />
        </div>

        {/* Translation Panels */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Source Panel */}
          <div className="translation-panel">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-border">
              <span className="text-sm font-medium text-muted-foreground">
                {sourceLanguage.name}
              </span>
              <div className="flex items-center gap-2">
                <VoiceRecorder
                  onTranscript={handleVoiceTranscript}
                  language={sourceLanguage.code}
                  disabled={!isOnline}
                />
                <AudioButton
                  text={sourceText}
                  language={sourceLanguage.code}
                />
              </div>
            </div>
            <TextInput
              value={sourceText}
              onChange={setSourceText}
              placeholder="Enter text to translate..."
            />
          </div>

          {/* Target Panel */}
          <div className="translation-panel bg-accent/30">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-border">
              <span className="text-sm font-medium text-muted-foreground">
                {targetLanguage.name}
              </span>
              <AudioButton
                text={translatedText}
                language={targetLanguage.code}
                disabled={isTranslating}
              />
            </div>
            <TranslationOutput
              text={translatedText}
              isLoading={isTranslating}
              placeholder="Translation will appear here..."
            />
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-xl bg-destructive/10 text-destructive text-sm text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* History Panel */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-4">
                <History className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Recent Translations</h2>
              </div>

              {recentTranslations.length > 0 ? (
                <div className="space-y-3">
                  {recentTranslations.map((translation) => (
                    <TranslationCard
                      key={translation.id}
                      translation={translation}
                      onToggleFavorite={handleToggleFavorite}
                      onSelect={handleSelectTranslation}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Sparkles className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">No translations yet</p>
                  <p className="text-sm text-muted-foreground/70">
                    Start translating to build your history
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Phrases (when not showing history) */}
        {!showHistory && !sourceText && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <p className="text-sm text-muted-foreground mb-4">Try these phrases:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Hello", "Thank you", "How are you", "Goodbye"].map((phrase) => (
                <button
                  key={phrase}
                  onClick={() => setSourceText(phrase)}
                  className="language-chip"
                >
                  {phrase}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border py-3">
        <div className="container max-w-4xl mx-auto px-4">
          <p className="text-xs text-center text-muted-foreground">
            {isOnline ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-online" />
                Online Mode • Using live translations {new Date().toLocaleDateString()}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-offline" />
                Offline Mode • Using cached translations {new Date().toLocaleDateString()}
              </span>
            )}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TranslatorApp;
