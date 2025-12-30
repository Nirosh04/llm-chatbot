'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from '@/theme/theme';

type SettingsContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
  language: string;
  setLanguage: (lang: string) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('DE');
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on first client render
  useEffect(() => {
    const storedDarkMode = localStorage.getItem('darkMode');
    const storedLanguage = localStorage.getItem('language');

    if (storedDarkMode !== null) {
      setDarkMode(storedDarkMode === 'true');
    }

    if (storedLanguage) {
      setLanguage(storedLanguage);
    }

    setHydrated(true);
  }, []);

  // Persist changes
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('language', language);
  }, [language, hydrated]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const theme = getTheme(darkMode);

  // Prevent theme flash before hydration
  if (!hydrated) return null;

  return (
    <SettingsContext.Provider value={{ darkMode, toggleDarkMode, language, setLanguage }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
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
