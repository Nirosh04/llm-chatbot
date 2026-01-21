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
    button: {
      bg: string;
      hover: string;
      text: string;
    };
    loadingDots: {
      dots: string;
      bg: string;
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
    loadingDots?: {
      dots: string;
      bg: string;
    };
  }
}


export const getTheme = (darkMode: boolean, fontSize: number) => {
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
      button: palette.button,
      loadingDots: palette.loadingDots
    },
    typography: {
    fontSize,      // base font size in px
    htmlFontSize: 16, // keep rem math stable (optional but sensible)
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          html {
            height: auto !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
          }
          body {
            height: auto !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
          }
          #__next {
            height: auto !important;
            overflow: visible !important;
          }
        `,
      },
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
