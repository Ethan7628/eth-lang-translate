import { ArrowLeft, Sun, Moon, User, Volume2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useSettings, VoiceType } from "@/contexts/SettingsContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const voiceOptions: { value: VoiceType; label: string; icon: string; description: string }[] = [
  { value: "male", label: "Male Voice", icon: "👨", description: "Deep adult male voice" },
  { value: "female", label: "Female Voice", icon: "👩", description: "Adult female voice" },
  { value: "boy", label: "Boy Voice", icon: "👦", description: "Young male voice" },
  { value: "girl", label: "Girl Voice", icon: "👧", description: "Young female voice" },
];

const Settings = () => {
  const { settings, setVoiceType, toggleTheme } = useSettings();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="icon-button"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold text-foreground">Settings</h1>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* Theme Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            {settings.theme === "dark" ? (
              <Moon className="h-5 w-5 text-primary" />
            ) : (
              <Sun className="h-5 w-5 text-primary" />
            )}
            <h2 className="text-lg font-semibold">Appearance</h2>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
            <div className="flex items-center gap-3">
              <Sun className="h-5 w-5 text-muted-foreground" />
              <Label htmlFor="theme-toggle" className="text-foreground cursor-pointer">
                Dark Mode
              </Label>
            </div>
            <Switch
              id="theme-toggle"
              checked={settings.theme === "dark"}
              onCheckedChange={toggleTheme}
            />
          </div>
        </motion.section>

        {/* Voice Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-elevated p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Volume2 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Voice Settings</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Choose the voice type for text-to-speech pronunciation
          </p>

          <RadioGroup
            value={settings.voiceType}
            onValueChange={(value) => setVoiceType(value as VoiceType)}
            className="space-y-3"
          >
            {voiceOptions.map((option) => (
              <motion.div
                key={option.value}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Label
                  htmlFor={option.value}
                  className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border-2 ${
                    settings.voiceType === option.value
                      ? "border-primary bg-primary/10"
                      : "border-transparent bg-secondary/30 hover:bg-secondary/50"
                  }`}
                >
                  <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                  <span className="text-2xl">{option.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  {settings.voiceType === option.value && (
                    <div className="w-3 h-3 rounded-full bg-primary" />
                  )}
                </Label>
              </motion.div>
            ))}
          </RadioGroup>
        </motion.section>

        {/* Info Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-xl bg-accent/30 text-center"
        >
          <User className="h-6 w-6 text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Voice availability depends on your browser and system settings.
            Some voices may not be available on all devices.
          </p>
        </motion.section>
      </main>
    </div>
  );
};

export default Settings;
