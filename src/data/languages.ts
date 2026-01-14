import { Language } from "@/types/translation";

// DeepL supported languages with their API codes
// DeepL uses uppercase codes and some special variants
export const SUPPORTED_LANGUAGES: Language[] = [
  { code: "EN", name: "English", nativeName: "English" },
  { code: "ES", name: "Spanish", nativeName: "Español" },
  { code: "FR", name: "French", nativeName: "Français" },
  { code: "DE", name: "German", nativeName: "Deutsch" },
  { code: "IT", name: "Italian", nativeName: "Italiano" },
  { code: "PT-BR", name: "Portuguese (Brazil)", nativeName: "Português (Brasil)" },
  { code: "PT-PT", name: "Portuguese (Portugal)", nativeName: "Português (Portugal)" },
  { code: "RU", name: "Russian", nativeName: "Русский" },
  { code: "ZH-HANS", name: "Chinese (Simplified)", nativeName: "中文 (简体)" },
  { code: "ZH-HANT", name: "Chinese (Traditional)", nativeName: "中文 (繁體)" },
  { code: "JA", name: "Japanese", nativeName: "日本語" },
  { code: "KO", name: "Korean", nativeName: "한국어" },
  { code: "AR", name: "Arabic", nativeName: "العربية" },
  { code: "TR", name: "Turkish", nativeName: "Türkçe" },
  { code: "NL", name: "Dutch", nativeName: "Nederlands" },
  { code: "PL", name: "Polish", nativeName: "Polski" },
  { code: "SV", name: "Swedish", nativeName: "Svenska" },
  { code: "DA", name: "Danish", nativeName: "Dansk" },
  { code: "FI", name: "Finnish", nativeName: "Suomi" },
  { code: "NB", name: "Norwegian", nativeName: "Norsk" },
  { code: "EL", name: "Greek", nativeName: "Ελληνικά" },
  { code: "ID", name: "Indonesian", nativeName: "Bahasa Indonesia" },
  { code: "CS", name: "Czech", nativeName: "Čeština" },
  { code: "HU", name: "Hungarian", nativeName: "Magyar" },
  { code: "RO", name: "Romanian", nativeName: "Română" },
  { code: "UK", name: "Ukrainian", nativeName: "Українська" },
  { code: "SK", name: "Slovak", nativeName: "Slovenčina" },
  { code: "BG", name: "Bulgarian", nativeName: "Български" },
  { code: "LT", name: "Lithuanian", nativeName: "Lietuvių" },
  { code: "LV", name: "Latvian", nativeName: "Latviešu" },
  { code: "ET", name: "Estonian", nativeName: "Eesti" },
  { code: "SL", name: "Slovenian", nativeName: "Slovenščina" },
];

export const getLanguageByCode = (code: string): Language | undefined => {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
};

// Map for converting Web Speech API language codes to DeepL codes
export const speechToDeepLCode = (speechCode: string): string => {
  const mapping: Record<string, string> = {
    "en": "EN",
    "en-US": "EN",
    "en-GB": "EN",
    "es": "ES",
    "es-ES": "ES",
    "fr": "FR",
    "fr-FR": "FR",
    "de": "DE",
    "de-DE": "DE",
    "it": "IT",
    "it-IT": "IT",
    "pt": "PT-BR",
    "pt-BR": "PT-BR",
    "pt-PT": "PT-PT",
    "ru": "RU",
    "zh": "ZH-HANS",
    "zh-CN": "ZH-HANS",
    "zh-TW": "ZH-HANT",
    "ja": "JA",
    "ko": "KO",
    "ar": "AR",
    "tr": "TR",
    "nl": "NL",
    "pl": "PL",
    "sv": "SV",
    "da": "DA",
    "fi": "FI",
    "no": "NB",
    "nb": "NB",
    "el": "EL",
    "id": "ID",
    "cs": "CS",
    "hu": "HU",
    "ro": "RO",
    "uk": "UK",
    "sk": "SK",
    "bg": "BG",
    "lt": "LT",
    "lv": "LV",
    "et": "ET",
    "sl": "SL",
  };
  return mapping[speechCode] || mapping[speechCode.split("-")[0]] || "EN";
};

// Map DeepL codes to Web Speech API compatible codes for TTS
export const deepLToSpeechCode = (deepLCode: string): string => {
  const mapping: Record<string, string> = {
    "EN": "en-US",
    "ES": "es-ES",
    "FR": "fr-FR",
    "DE": "de-DE",
    "IT": "it-IT",
    "PT-BR": "pt-BR",
    "PT-PT": "pt-PT",
    "RU": "ru-RU",
    "ZH-HANS": "zh-CN",
    "ZH-HANT": "zh-TW",
    "JA": "ja-JP",
    "KO": "ko-KR",
    "AR": "ar-SA",
    "TR": "tr-TR",
    "NL": "nl-NL",
    "PL": "pl-PL",
    "SV": "sv-SE",
    "DA": "da-DK",
    "FI": "fi-FI",
    "NB": "nb-NO",
    "EL": "el-GR",
    "ID": "id-ID",
    "CS": "cs-CZ",
    "HU": "hu-HU",
    "RO": "ro-RO",
    "UK": "uk-UA",
    "SK": "sk-SK",
    "BG": "bg-BG",
    "LT": "lt-LT",
    "LV": "lv-LV",
    "ET": "et-EE",
    "SL": "sl-SI",
  };
  return mapping[deepLCode] || "en-US";
};

export const DEFAULT_SOURCE_LANGUAGE = SUPPORTED_LANGUAGES[0]; // English
export const DEFAULT_TARGET_LANGUAGE = SUPPORTED_LANGUAGES[1]; // Spanish
