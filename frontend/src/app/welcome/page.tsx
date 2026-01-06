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
  Fab
} from '@mui/material';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import CompanionIcon from '@/components/CompanionIcon';
import DE from 'country-flag-icons/react/3x2/DE';
import GB from 'country-flag-icons/react/3x2/GB';
import { useTranslations } from 'next-intl';
import { useSettings } from '@/context/SettingsContext';

const WelcomePage: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const t = useTranslations('welcome');
  const { language, setLanguage } = useSettings();

  const textStyles = {
    headline1: { fontSize: '2.25rem', fontWeight: 600, lineHeight: 1.2 },
    headline2: { fontSize: '1.625rem', fontWeight: 600, lineHeight: 1.2 },
    headline2Bold: { fontSize: '1.625rem', fontWeight: 'bold', lineHeight: 1.2 },
    headline3: { fontSize: '1.625rem', fontWeight: 600, lineHeight: 1.2 },
    defaultText: { fontSize: '1.5rem', lineHeight: 1.5 },
    buttonText: { fontSize: '1.625rem' },
  };

  const handleStartClick = () => {
    router.push(`/tabMain`); // we need to pass the selected Language
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
        //backgroundColor: colors.backgroundColor,
      }}
    >
    

      <Container maxWidth="md" sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
        <Stack direction="column" alignItems="center" justifyContent="center" spacing={3} sx={{ width: '100%', textAlign: 'center' }}>
          <Box sx={{ width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            < CompanionIcon />
          </Box>

          <Typography variant="h1" sx={textStyles.headline1}>{t('title')}</Typography>
          <Box sx={{ ...textStyles.headline2, textAlign: 'center' }}>
            {t('iAmLumee')}
          </Box>
          <Typography variant="h3" sx={textStyles.headline3}>{t('subtitle')}</Typography>
          <Typography variant="body1" sx={textStyles.defaultText}>{t('lookForward')}</Typography>

          <Box sx={{ mt: 4 }}>
            <Stack direction="row" spacing={4} justifyContent="center">
              <IconButton
                onClick={() => handleLanguageClick('de')}
                sx={{
                  padding: 1,
                  border: language === 'de' ? `2px solid` : '2px solid transparent',
                  borderRadius: 1,
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                }}
              >
                <DE style={{ width: 40, height: 30 }} />
              </IconButton>

              <IconButton
                onClick={() => handleLanguageClick('en')}
                sx={{
                  padding: 1,
                  border: language === 'en' ? `2px solid`  : '2px solid transparent',
                  borderRadius: 1,
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                }}
              >
                <GB style={{ width: 40, height: 30 }} />
              </IconButton>
            </Stack>
          </Box>
        </Stack>
      </Container>

      <BottomNavigation sx={{ borderTop: `1px solid ${theme.palette.divider}`, height: 50 }} />

      <Box sx={{ position: 'fixed', bottom: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: theme.zIndex.fab }}>
        <Fab
          variant="extended"
          onClick={handleStartClick}
          sx={{
            // backgroundColor: colors.buttonColor, // || theme.palette.primary.main,
            // color: colors.textColor,
            padding: theme.spacing(2, 4),
            //'&:hover': //  { backgroundColor: colors.buttonHoverColor} // || theme.palette.primary.dark },
          }}
        >
          <Typography sx={textStyles.buttonText}>{t('startButton')}</Typography>
        </Fab>
      </Box>
    </Box>
  );
};

export default WelcomePage;
