export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export interface Translation {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  timestamp: number;
  isFavorite?: boolean;
}

export interface TranslationState {
  sourceText: string;
  translatedText: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  isTranslating: boolean;
  error: string | null;
}
