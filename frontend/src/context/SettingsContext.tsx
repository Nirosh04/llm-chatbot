'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
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

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  // Create MUI theme dynamically based on darkMode
  const theme = getTheme(darkMode);


  return (
    <SettingsContext.Provider value={{ darkMode, toggleDarkMode, language, setLanguage }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </SettingsContext.Provider>
  );
};

// Hook to use settings anywhere
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
