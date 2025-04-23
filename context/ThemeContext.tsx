import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Definizione del tipo per il contesto del tema
interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setDarkMode: (isDark: boolean) => void;
}

// Creazione del contesto con un valore predefinito
const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
  setDarkMode: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Carica la preferenza del tema all'avvio
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("theme");
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === "dark");
        }
      } catch (error) {
        console.error("Errore nel caricamento del tema:", error);
      }
    };

    loadThemePreference();
  }, []);

  // Funzione per cambiare il tema
  const toggleTheme = async () => {
    try {
      const newThemeValue = !isDarkMode;
      setIsDarkMode(newThemeValue);
      await AsyncStorage.setItem("theme", newThemeValue ? "dark" : "light");
    } catch (error) {
      console.error("Errore nel salvataggio del tema:", error);
    }
  };

  // Funzione per impostare direttamente la modalità scura
  const setDarkMode = async (isDark: boolean) => {
    try {
      setIsDarkMode(isDark);
      await AsyncStorage.setItem("theme", isDark ? "dark" : "light");
    } catch (error) {
      console.error("Errore nel salvataggio del tema:", error);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => useContext(ThemeContext);
