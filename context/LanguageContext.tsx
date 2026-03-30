import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "@/lib/i18n";

type Language = "en" | "it";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  toggleLanguage: () => {},
});

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const loadLanguagePreference = async () => {
      try {
        const saved = await AsyncStorage.getItem("language");
        if (saved === "en" || saved === "it") {
          setLanguage(saved);
          await i18n.changeLanguage(saved);
        }
      } catch (error) {
        console.error("Error loading language preference:", error);
      }
    };

    loadLanguagePreference();
  }, []);

  const toggleLanguage = async () => {
    try {
      const newLanguage: Language = language === "en" ? "it" : "en";
      setLanguage(newLanguage);
      await i18n.changeLanguage(newLanguage);
      await AsyncStorage.setItem("language", newLanguage);
    } catch (error) {
      console.error("Error saving language preference:", error);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => useContext(LanguageContext);
