import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type VoiceType = "male" | "female" | "boy" | "girl";
export type Theme = "light" | "dark";

interface Settings {
  voiceType: VoiceType;
  theme: Theme;
}

interface SettingsContextType {
  settings: Settings;
  setVoiceType: (voice: VoiceType) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const defaultSettings: Settings = {
  voiceType: "female",
  theme: "light",
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_KEY = "eth-lang-settings";

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  // Apply theme on mount and change
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [settings.theme]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const setVoiceType = (voice: VoiceType) => {
    setSettings((prev) => ({ ...prev, voiceType: voice }));
  };

  const setTheme = (theme: Theme) => {
    setSettings((prev) => ({ ...prev, theme }));
  };

  const toggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === "light" ? "dark" : "light",
    }));
  };

  return (
    <SettingsContext.Provider value={{ settings, setVoiceType, setTheme, toggleTheme }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
