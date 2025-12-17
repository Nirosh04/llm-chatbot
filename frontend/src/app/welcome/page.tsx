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
import CompanionIcon from '@/assets/CompanionIcon.png'; 
import DE from 'country-flag-icons/react/3x2/DE';
import GB from 'country-flag-icons/react/3x2/GB';

const WelcomePage: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();

  // Track selected language
  const [selectedLanguage, setSelectedLanguage] = useState<'DE' | 'GB'>('DE');

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

  const handleLanguageClick = (lang: 'DE' | 'GB') => { // more languages will follow (spanish etc.)
    setSelectedLanguage(lang);
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
      <AppBar position="static" sx={{ boxShadow: 'none', borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Toolbar />
      </AppBar>

      <Container maxWidth="md" sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
        <Stack direction="column" alignItems="center" justifyContent="center" spacing={3} sx={{ width: '100%', textAlign: 'center' }}>
          <Box sx={{ width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Image
              src={CompanionIcon}
              alt="Lumee"
              width={120}
              height={120}
              style={{
                filter: 'invert(24%) sepia(89%) saturate(1582%) hue-rotate(316deg) brightness(96%) contrast(92%)',
                marginBottom: '24px',
              }}
            />
          </Box>

          <Typography variant="h1" sx={textStyles.headline1}>Willkommen!</Typography>
          <Box sx={{ ...textStyles.headline2, textAlign: 'center' }}>
            Ich bin <Box component="span" sx={textStyles.headline2Bold}>Lumee</Box>,
          </Box>
          <Typography variant="h3" sx={textStyles.headline3}>Dein digitaler Begleiter für die Wartezeit.</Typography>
          <Typography variant="body1" sx={textStyles.defaultText}>Ich freue mich, Dich kennenzulernen!</Typography>

          <Box sx={{ mt: 4 }}>
            <Stack direction="row" spacing={4} justifyContent="center">
              <IconButton
                onClick={() => handleLanguageClick('DE')}
                sx={{
                  padding: 1,
                  border: selectedLanguage === 'DE' ? `2px solid` : '2px solid transparent',
                  borderRadius: 1,
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                }}
              >
                <DE style={{ width: 40, height: 30 }} />
              </IconButton>

              <IconButton
                onClick={() => handleLanguageClick('GB')}
                sx={{
                  padding: 1,
                  border: selectedLanguage === 'GB' ? `2px solid`  : '2px solid transparent',
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
          <Typography sx={textStyles.buttonText}>Fangen wir an</Typography>
        </Fab>
      </Box>
    </Box>
  );
};

export default WelcomePage;
