'use client';

import { createTheme } from '@mui/material/styles';
import { lightPalette, darkPalette } from './colors';


declare module '@mui/material/styles' {
  interface Palette {
    chat: {
      me: string;
      llm: string;
      textMe: string;
      textLlm: string;
    };
  }

  interface PaletteOptions {
    chat?: {
      me: string;
      llm: string;
      textMe: string;
      textLlm: string;
    };
    button?: {
      bg: string;
      hover: string;
      text: string;
    };
  }
}



export const getTheme = (darkMode: boolean) => {
  const palette = darkMode ? darkPalette : lightPalette;

  return createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      background: {
        default: palette.background,
        paper: palette.paper,
      },
      primary: {
        main: palette.primary.main,
        contrastText: palette.primary.contrastText,
      },
      secondary: {
        main: palette.secondary.main,
      },
      text: {
        primary: palette.text.primary,
        secondary: palette.text.secondary,
      },
      chat: palette.chat,
      button: palette.button
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            backgroundColor: palette.button.bg,
            color: palette.button.text,
            '&:hover': {
              backgroundColor: palette.button.hover,
            },
          },
        },
      },
    },
  });
};
