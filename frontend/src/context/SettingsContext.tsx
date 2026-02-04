'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { NextIntlClientProvider } from 'next-intl';
import { getTheme } from '@/theme/theme';

type SettingsContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
  language: string;
  setLanguage: (lang: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguageState] = useState('en');
  const [fontSize, setFontSizeState] = useState(16);
  const [hydrated, setHydrated] = useState(false);
  const [translations, setTranslations] = useState<any>(null);

  // Load translations for a given language
  const loadTranslations = async (lang: string) => {
    const lowerLang = lang.toLowerCase();
    try {
      const msgs = await import(`../i18n/locales/${lowerLang}.json`);
      setTranslations(msgs.default);
    } catch (error) {
      console.error('Failed to load locales:', error);
      // Fallback to Englisch
      const msgs = await import(`../i18n/locales/en.json`);
      setTranslations(msgs.default);
    }
  };

  // Combined setLanguage that also loads translations
  const setLanguage = async (lang: string) => {
    setLanguageState(lang);
    if (hydrated) {
      localStorage.setItem('language', lang);
    }
    await loadTranslations(lang);
  };

  const setFontSize = (size: number) => {
    setFontSizeState(size);
    if (hydrated) {
      localStorage.setItem('fontSize', String(size));
    }
  };

  // Load from localStorage on first client render
  useEffect(() => {
    const storedDarkMode = localStorage.getItem('darkMode');
    const storedLanguage = localStorage.getItem('language') || 'en';
    const storedFontSize = localStorage.getItem('fontSize');

    if (storedDarkMode !== null) {
      setDarkMode(storedDarkMode === 'true');
    }

    if (storedFontSize !== null) {
      const parsedFontSize = Number(storedFontSize);
      if (!Number.isNaN(parsedFontSize)) {
        setFontSizeState(parsedFontSize);
      }
    }

    // Load initial language
    setLanguage(storedLanguage);

    setHydrated(true);
  }, []);

  // Persist dark mode changes
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode, hydrated]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const theme = getTheme(darkMode, fontSize);

  // Prevent theme flash before hydration
  if (!hydrated || !translations) return null;

  return (
    <SettingsContext.Provider value={{ darkMode, toggleDarkMode, language, setLanguage, fontSize, setFontSize }}>
      <NextIntlClientProvider locale={language} messages={translations}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </NextIntlClientProvider>
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
