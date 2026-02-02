'use client';
import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Stack,
  IconButton,
  useTheme,
  BottomNavigation,
  Fab,
  Slider,
  Switch
} from '@mui/material';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import CompanionIcon from '@/components/CompanionIcon';
import { FontSizeSelect } from './../../components/FontSizeSelect';
import DE from 'country-flag-icons/react/3x2/DE';
import GB from 'country-flag-icons/react/3x2/GB';
import { useTranslations } from 'next-intl';
import { useSettings } from '@/context/SettingsContext';
import { text } from 'stream/consumers';

const WelcomePage: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const t = useTranslations('welcome');
  const tSettings = useTranslations('settings');
  const {language, setLanguage, fontSize, setFontSize, darkMode, toggleDarkMode } = useSettings();
  // temporary state until logic is ready

  const textStyles = {
    headline1: { 
      fontSize: { 
        xs: theme.typography.pxToRem(Math.min(fontSize * 1.2, 22)), 
        sm: theme.typography.pxToRem(Math.min(fontSize * 1.8, 32)),
        md: theme.typography.pxToRem(fontSize * 2.25)
      }, 
      fontWeight: 600, 
      lineHeight: 1.2 
    },
    headline2: { 
      fontSize: { 
        xs: theme.typography.pxToRem(Math.min(fontSize * 0.95, 15)), 
        sm: theme.typography.pxToRem(Math.min(fontSize * 1.3, 22)),
        md: theme.typography.pxToRem(fontSize * 1.625)
      }, 
      fontWeight: 600, 
      lineHeight: 1.3 
    },
    headline3: { 
      fontSize: { 
        xs: theme.typography.pxToRem(Math.min(fontSize * 0.9, 14)), 
        sm: theme.typography.pxToRem(Math.min(fontSize * 1.15, 18)),
        md: theme.typography.pxToRem(fontSize * 1.5)
      }, 
      fontWeight: 500, 
      lineHeight: 1.3 
    },
    defaultText: { 
      fontSize: { 
        xs: theme.typography.pxToRem(Math.min(fontSize * 0.85, 13)), 
        sm: theme.typography.pxToRem(Math.min(fontSize * 0.95, 15)),
        md: theme.typography.pxToRem(fontSize * 1.125)
      }, 
      lineHeight: 1.5 
    },
    buttonText: { 
      fontSize: { 
        xs: theme.typography.pxToRem(Math.min(fontSize * 0.9, 14)), 
        sm: theme.typography.pxToRem(Math.min(fontSize * 1.15, 18)),
        md: theme.typography.pxToRem(fontSize * 1.625)
      }, 
      fontWeight: 'bold', 
      textTransform: 'none' as const
    },
  };


  const handleStartClick = () => {
    router.push(`/walkthrough/1`);
  };

  const handleLanguageClick = (lang: 'de' | 'en') => {
    setLanguage(lang);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        overflowX: 'hidden', // Kein horizontales Scrollen
        overflowY: 'auto', // Vertikales Scrollen erlaubt
        width: '100%',
        //backgroundColor: colors.backgroundColor,
      }}
    >
      {/* Language selection top-right */}
      <Box sx={{ position: 'fixed', top: 12, right: 12, zIndex: theme.zIndex.appBar }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <IconButton
            onClick={() => handleLanguageClick('de')}
            sx={{
              padding: 0.75,
              border: language === 'de' ? `2px solid` : '2px solid transparent',
              borderRadius: 1,
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
            }}
            aria-label="Deutsch"
          >
            <Box sx={{ width: 32, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DE style={{ width: '100%', height: '100%' }} />
            </Box>
          </IconButton>

          <IconButton
            onClick={() => handleLanguageClick('en')}
            sx={{
              padding: 0.75,
              border: language === 'en' ? `2px solid`  : '2px solid transparent',
              borderRadius: 1,
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
            }}
            aria-label="English"
          >
            <Box sx={{ width: 32, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GB style={{ width: '100%', height: '100%' }} />
            </Box>
          </IconButton>
        </Stack>
      </Box>

      <Container 
        maxWidth="md" 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          pt: { xs: 8, sm: 4 }, // Noch mehr Platz oben auf Mobile
          pb: { xs: 3, sm: 4 },
          px: { xs: 2, sm: 3 }, // Mehr seitliches Padding auf Mobile
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          overflowY: 'auto'
        }}
      >
        <Stack 
          direction="column" 
          alignItems="center" 
          justifyContent="center" 
          spacing={{ xs: 1.5, sm: 3 }} 
          sx={{ 
            width: '100%', 
            maxWidth: { xs: '100%', sm: '100%' },
            textAlign: 'center',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ 
            width: { xs: 120, sm: 150 }, 
            height: { xs: 120, sm: 150 }, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            overflow: 'visible', // Erlaubt, dass das Icon über die Box hinausragt
            mb: { xs: 1, sm: 2 } // Abstand nach unten
          }}>
            < CompanionIcon />
          </Box>

          <Typography variant="h1" sx={{ ...textStyles.headline1, wordBreak: 'break-word', px: { xs: 1, sm: 0 } }}>{t('title')}</Typography>
          <Box sx={{ ...textStyles.headline2, textAlign: 'center', wordBreak: 'break-word', px: { xs: 1, sm: 0 } }}>
            {t('intro')}
          </Box>
          <Typography variant="h3" sx={{ ...textStyles.headline3, wordBreak: 'break-word', px: { xs: 1, sm: 0 } }}>{t('description')}</Typography>
          <Typography variant="body1" sx={{ ...textStyles.defaultText, wordBreak: 'break-word', px: { xs: 1, sm: 0 } }}>{t('lookForward')}</Typography>

          <Box sx={{ mt: { xs: 2, sm: 4 }, width: '100%', maxWidth: 600, px: { xs: 3, sm: 0 } }}>
            {/* Font size slider with 5 levels (centered) */}
            <Box sx={{ textAlign: 'center', mx: 'auto', px: { xs: 1, sm: 2 }}}>
              <Typography sx={{ mb: 1 }}>
                {tSettings('selectFontSize')}
              </Typography>
              <Slider
                min={12}
                max={20}
                step={2}
                marks={[
                  { value: 12, label: tSettings('verySmall') },
                  { value: 14, label: tSettings('small') },
                  { value: 16, label: tSettings('medium') },
                  { value: 18, label: tSettings('large') },
                  { value: 20, label: tSettings('veryLarge') }
                ]}
                value={fontSize}
                onChange={(_, v) => setFontSize(Array.isArray(v) ? v[0] : v)}
                sx={{ 
                  width: '100%',
                  mb: 2,
                  '& .MuiSlider-markLabel': {
                    fontSize: theme.typography.pxToRem(fontSize * 0.75),
                    whiteSpace: 'normal',
                    width: '60px',
                    textAlign: 'center',
                    color: theme.palette.primary.main
                  },
                  '& .MuiSlider-markLabelActive': {
                    color: theme.palette.primary.main
                  },
                  [`& .MuiSlider-markLabel[data-index="${(fontSize - 12) / 2}"]`]: {
                    color: theme.palette.text.primary
                  }
                }}
              />
            </Box>

            {/* Dark mode under font size (centered) */}
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
              <Typography>{tSettings('darkMode')}</Typography>
              <Switch checked={darkMode} onChange={toggleDarkMode} />
            </Box>
          </Box>
        </Stack>
      </Container>

      <BottomNavigation sx={{ 
        borderTop: `1px solid ${theme.palette.divider}`, 
        height: 'calc(50px + env(safe-area-inset-bottom))',
        pb: 'env(safe-area-inset-bottom)'
      }} />

      <Box sx={{ position: 'fixed', bottom: { xs: 12, sm: 16 }, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: theme.zIndex.fab, px: 2, pb: 'env(safe-area-inset-bottom)' }}>
        <Fab
          variant="extended"
          onClick={handleStartClick}
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            padding: { xs: theme.spacing(1.5, 3), sm: theme.spacing(2, 4) },
            width: { xs: '100%', sm: 'auto' },
            maxWidth: { xs: '90%', sm: 'none' },
            '&:hover': { backgroundColor: theme.palette.primary.dark }
          }}
        >
          <Typography sx={textStyles.buttonText}>{t('startButton')}</Typography>
        </Fab>
      </Box>
    </Box>
  );
};

export default WelcomePage;
