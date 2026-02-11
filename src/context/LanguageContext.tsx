import React, { createContext, useContext, useState, useEffect } from 'react';
import { sr } from '../locales/sr';
import { en } from '../locales/en';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'sr' | 'en';
type Translations = typeof sr;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations) => string; // Funkcija za prevod
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('sr');

  // Učitaj sačuvan jezik pri pokretanju
  useEffect(() => {
    const loadLanguage = async () => {
      const savedLang = await AsyncStorage.getItem('appLanguage');
      if (savedLang === 'en' || savedLang === 'sr') {
        setLanguageState(savedLang);
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem('appLanguage', lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'sr' ? 'en' : 'sr');
  };

  // Glavna funkcija koja vraća tekst na osnovu ključa
  const t = (key: keyof Translations) => {
    const dict = language === 'sr' ? sr : en;
    return dict[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};