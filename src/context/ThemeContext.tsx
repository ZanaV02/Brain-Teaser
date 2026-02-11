import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Definišemo koje boje imamo na raspolaganju
export const ACCENT_COLORS = {
  purple: '#a934cc',
  blue: '#0a497d',
  orange: '#ca9b55',
};

// Definišemo kako izgledaju boje za svijetlu i tamnu temu
const themes = {
  light: {
    background: '#F8F9FA',
    card: '#FFFFFF',
    text: '#212121',
    textSecondary: '#757575',
    border: '#e0e0e0',
    iconBg: '#f0f0f0',
  },
  dark: {
    background: '#121212',
    card: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    border: '#333333',
    iconBg: '#2C2C2C',
  },
};

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  theme: typeof themes.light; // Ovo nam daje pristup bojama (theme.background, theme.text...)
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [accentColor, setAccentColorState] = useState(ACCENT_COLORS.purple);

  // Učitaj podešavanja iz memorije kad se aplikacija upali
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('@is_dark_mode');
        const storedColor = await AsyncStorage.getItem('@accent_color');
        
        if (storedTheme !== null) setIsDarkMode(JSON.parse(storedTheme));
        if (storedColor !== null) setAccentColorState(storedColor);
      } catch (e) {
        console.error("Greška pri učitavanju teme:", e);
      }
    };
    loadSettings();
  }, []);

  // Funkcija za promjenu teme (Svijetla/Tamna)
  const toggleTheme = async () => {
    try {
      const newVal = !isDarkMode;
      setIsDarkMode(newVal);
      await AsyncStorage.setItem('@is_dark_mode', JSON.stringify(newVal));
    } catch (e) {
      console.error(e);
    }
  };

  // Funkcija za promjenu glavne boje
  const setAccentColor = async (color: string) => {
    try {
      setAccentColorState(color);
      await AsyncStorage.setItem('@accent_color', color);
    } catch (e) {
      console.error(e);
    }
  };

  // Trenutno aktivne boje na osnovu moda
  const theme = isDarkMode ? themes.dark : themes.light;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, accentColor, setAccentColor, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme mora biti unutar ThemeProvider-a");
  return context;
};