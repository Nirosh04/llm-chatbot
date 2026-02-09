"use client"
import React from 'react'
import { useRouter } from 'next/navigation'
import { Box, Stack, Typography, Button, Container, Switch, Dialog, DialogTitle, DialogContent, DialogActions, useTheme, useMediaQuery, IconButton } from '@mui/material'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import { useSettings } from '@/context/SettingsContext'
import { useTranslations } from 'next-intl'
import privacyDetailsDE from '@/i18n/locales/privacyDetailsDE.json'
import privacyDetailsEN from '@/i18n/locales/privacyDetailsEN.json'
import Image from 'next/image'
import imgFreiiwilligDE from '../../../assets/1_freiwillig.png'
import imgAerzteDE from '../../../assets/2_aerzte.png'
import imgFilterDE from '../../../assets/3_filter.png'
import imgGeschuetztDE from '../../../assets/4_geschuetzt.png'
import imgSettingsDE from '../../../assets/einstellungen_walkthrough.png'
import imgAktuelleBeschwerdenDE from '../../../assets/aktuellebeschwerden_walkthrough.png'
import imgKrankengeschichteDE from '../../../assets/krankengeschichte_walkthrough.png'
import imgChatPageDE from '../../../assets/chat_de_walkthrough.png'
import imgNavigationDE from '../../../assets/navi_de_walkthrough.png'
import imgFreiiwilligEN from '../../../assets/en/1_freiwillig.png'
import imgAerzteEN from '../../../assets/en/2_aerzte.png'
import imgFilterEN from '../../../assets/en/3_filter.png'
import imgGeschuetztEN from '../../../assets/en/4_geschuetzt.png'
import imgSettingsEN from '../../../assets/en/settings_walkthrough.png'
import imgAktuelleBeschwerdenEN from '../../../assets/en/concerns_walkthrough.png'
import imgKrankengeschichteEN from '../../../assets/en/medicalhistory_walkthrough.png'
import imgChatPageEN from '../../../assets/en/chat_en_walkthrough.png'
import imgNavigationEN from '../../../assets/en/navi_en_walkthrough.png'

interface Props {
  initialStep: number
}

type LocaleKey = 'de' | 'en'

type LocalizedImage = {
  de: typeof imgSettingsDE
  en?: typeof imgSettingsDE
}

const walkthroughImageVariants: Record<string, LocalizedImage> = {
  settings: { de: imgSettingsDE, en: imgSettingsEN },
  chat: { de: imgChatPageDE, en: imgChatPageEN },
  complaints: { de: imgAktuelleBeschwerdenDE, en: imgAktuelleBeschwerdenEN },
  history: { de: imgKrankengeschichteDE, en: imgKrankengeschichteEN },
  navigation: { de: imgNavigationDE, en: imgNavigationEN }
}

const privacySlideVariants: LocalizedImage[] = [
  { de: imgFreiiwilligDE, en: imgFreiiwilligEN },
  { de: imgAerzteDE, en: imgAerzteEN },
  { de: imgFilterDE, en: imgFilterEN },
  { de: imgGeschuetztDE, en: imgGeschuetztEN }
]

export default function WalkthroughClient({ initialStep }: Props) {
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { darkMode, toggleDarkMode, language, fontSize } = useSettings()
  const t = useTranslations('walkthrough')
  const resolvedLocale: LocaleKey = language === 'de' ? 'de' : 'en'
  const getLocalizedImage = React.useCallback(
    (variant: LocalizedImage) => variant[resolvedLocale] ?? variant.de,
    [resolvedLocale]
  )
  const privacyImages = React.useMemo(
    () => privacySlideVariants.map((variant) => getLocalizedImage(variant)),
    [getLocalizedImage]
  )

  const privacyDetails = language === 'de' ? privacyDetailsDE : privacyDetailsEN
  // Image size scales with font size
  const baseImageSize = isMobile ? 256 : 480
  const imageSize = Math.round(baseImageSize * (fontSize / 16))
  // Make the slideshow card more squashed vertically (75% of width)
  const boxHeight = Math.round(imageSize * 0.75)
  // Calculate scaled font sizes
  const scaleFactor = fontSize / 16
  const headingSize = { xs: `${scaleFactor * 2}rem`, sm: `${scaleFactor * 2.5}rem` }
  const bodySize = `${scaleFactor * 1.125}rem`
  const smallTextSize = `${scaleFactor * 1}rem`

  const totalSteps = 8 // includes navigation, privacy, and decline
  const progressCount = Math.min(7, totalSteps) // number of walkthrough steps shown in dots
  const [step, setStep] = React.useState<number>(Math.max(1, Math.min(totalSteps, initialStep)))

  // preserve originals so we can revert when going back to Welcome
  const origDarkRef = React.useRef<boolean>(darkMode)
  const origFontRef = React.useRef<string>(typeof document !== 'undefined' ? (document.documentElement.style.fontSize || '') : '')

  // font size adjustment removed from walkthrough step 1

  // checkbox states for privacy step
  const [mandatoryChecked, setMandatoryChecked] = React.useState<boolean>(false)
  const [optionalChecked, setOptionalChecked] = React.useState<boolean>(false)
  const [detailsOpen, setDetailsOpen] = React.useState<boolean>(false)
  const [currentSlide, setCurrentSlide] = React.useState<number>(0)
  const [step4Slide, setStep4Slide] = React.useState<number>(0)

  // sync route param -> state
  React.useEffect(() => {
    setStep(Math.max(1, Math.min(totalSteps, initialStep)))
  }, [initialStep, totalSteps])

  // removed global font size application

  const stepData: { title: string; description: string }[] = [
    {
      title: t('step1.title'),
      description: t('step1.description')
    },
    {
      title: t('step2.title'),
      description: t('step2.description')
    },
    {
      title: t('step3.title'),
      description: t('step3.description')
    },
    {
      title: t('step4.title'),
      description: t('step4.description')
    },
    {
      title: t('step5.title'),
      description: t('step5.description')
    },
    {
      title: t('step6.title'),
      description: t('step6.description')
    },
    {
      title: t('step7.title'),
      description: t('step7.description')
    },
    {
      title: t('step8.title'),
      description: t('step8.description')
    }
  ]

  const goToStep = (next: number) => {
    const clamped = Math.max(1, Math.min(totalSteps, next))
    setStep(clamped)
    router.push(`/walkthrough/${clamped}`)
  }

  const handleNext = async () => {
    // move to next step (Next button only shown for steps before privacy)
    goToStep(step + 1)
  }

  const handleBack = () => {
    if (step <= 1) {
      // Revert any changes made during the walkthrough and go back to welcome
      if (darkMode !== origDarkRef.current) {
        toggleDarkMode()
      }
      if (typeof document !== 'undefined') {
        document.documentElement.style.fontSize = origFontRef.current || ''
      }
      router.push('/welcome')
      return
    }
    goToStep(step - 1)
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      pb: 10,
      overflowX: 'hidden',
      width: '100%'
    }}>
      <Container maxWidth={false} sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 4, sm: 6 },
        px: { xs: 2, sm: 3 }
      }}>
        <Stack spacing={{ xs: 2, sm: 3 }} sx={{ width: '100%', textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontSize: headingSize, wordBreak: 'break-word' }}>{stepData[step - 1].title}</Typography>
          {step <= 6 && (
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', fontSize: bodySize, wordBreak: 'break-word' }}>
              {stepData[step - 1].description}
            </Typography>
          )}


          {/* Step 1: language, dark mode, font size */}
          {step === 1 && (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
              {/* Settings image below the step 1 text */}
              <Box sx={{ width: '100%' }}>
                <Image
                  src={getLocalizedImage(walkthroughImageVariants.settings)}
                  alt="settings"
                  width={imageSize}
                  height={imageSize}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </Box>
            </Box>
          )}
          
          {/* Step 2: Chat page image */}
          {step === 2 && (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
              <Box sx={{ width: '100%' }}>
                <Image
                  src={getLocalizedImage(walkthroughImageVariants.chat)}
                  alt="chatpage"
                  width={imageSize}
                  height={imageSize}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </Box>
            </Box>
          )}

          {/* Step 3: Chat page image (same as step 2) */}
          {step === 3 && (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
              <Box sx={{ width: '100%' }}>
                <Image
                  src={getLocalizedImage(walkthroughImageVariants.chat)}
                  alt="chatpage"
                  width={imageSize}
                  height={imageSize}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </Box>
            </Box>
          )}
        
          {/* Step 4: Aktuelle Beschwerden - use same rendering as step 1 (responsive image) */}
          {step === 4 && (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
              <Box sx={{ width: '100%' }}>
                <Image
                  src={getLocalizedImage(walkthroughImageVariants.complaints)}
                  alt="aktuellebeschwerden"
                  width={imageSize}
                  height={imageSize}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </Box>
            </Box>
          )}

          {/* Step 5: Krankengeschichte - use same rendering as step 1 (responsive image) */}
          {step === 5 && (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
              <Box sx={{ width: '100%' }}>
                <Image
                  src={getLocalizedImage(walkthroughImageVariants.history)}
                  alt="krankengeschichte"
                  width={imageSize}
                  height={imageSize}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </Box>
            </Box>
          )}

          {/* Step 6: Navigation */}
          {step === 6 && (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
              <Box sx={{ width: '100%' }}>
                <Image
                  src={getLocalizedImage(walkthroughImageVariants.navigation)}
                  alt="navigation"
                  width={imageSize}
                  height={imageSize}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </Box>
            </Box>
          )}

          {/* Step 7: Privacy Consent (Datenschutz) */}
          {step === 7 && (
            <Box sx={{ mt: 2, textAlign: 'left' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
                <IconButton
                  aria-label="previous"
                  onClick={() => setCurrentSlide((s) => Math.max(0, s - 1))}
                  disabled={currentSlide === 0}
                >
                  <ArrowBackIosNewIcon />
                </IconButton>

                <Box
                  sx={{
                    width: imageSize,
                    minHeight: boxHeight,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderTop: 'none',
                    borderRadius: 2,
                    boxShadow: 1,
                    backgroundColor: 'background.paper',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box sx={{ height: Math.round(imageSize * 0.5), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Image
                      src={privacyImages[currentSlide]}
                      alt={`privacy_${currentSlide + 1}`}
                      width={imageSize}
                      height={imageSize}
                      style={{ objectFit: 'contain', width: '100%', height: '100%', display: 'block' }}
                    />
                  </Box>
                  <Box sx={{ px: 1, py: 1, flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line', textAlign: 'center', lineHeight: 1.3, fontSize: bodySize }}>
                      {(t.raw('step7.imageCaptions') as string[])[currentSlide]}
                    </Typography>
                  </Box>
                </Box>

                <IconButton
                  aria-label="next"
                  onClick={() => setCurrentSlide((s) => Math.min(3, s + 1))}
                  disabled={currentSlide === 3}
                >
                  <ArrowForwardIosIcon />
                </IconButton>
              </Box>

              <Box sx={{ mt: 1 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: bodySize }}>
                  <input id="mandatory" type="checkbox" checked={mandatoryChecked} onChange={(e) => setMandatoryChecked(e.target.checked)} />
                  {' '}{t('step7.mandatoryConsent')}
                  {!mandatoryChecked && (
                    <span style={{ color: 'red', marginLeft: 8 }}>{t('step7.mandatoryRequired')}</span>
                  )}
                </label>

                <label style={{ display: 'block', marginBottom: 8, fontSize: bodySize }}>
                  <input id="optional" type="checkbox" checked={optionalChecked} onChange={(e) => setOptionalChecked(e.target.checked)} />
                  {' '}{t('step7.optionalConsent')}
                </label>

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: 2 }}>
                  <Button variant="outlined" onClick={() => setDetailsOpen(true)} fullWidth={true} sx={{ minWidth: { sm: 'auto' } }}>{t('step7.showDetails')}</Button>
                  <Button variant="text" color="error" onClick={() => goToStep(8)} fullWidth={true} sx={{ minWidth: { sm: 'auto' } }}>{t('step7.decline')}</Button>
                  <Button variant="contained" onClick={() => {
                    if (mandatoryChecked) {
                      if (typeof document !== 'undefined') document.documentElement.style.fontSize = origFontRef.current || ''
                      router.push('/ChatInterface')
                    }
                  }} disabled={!mandatoryChecked} fullWidth={true} sx={{ minWidth: { sm: 'auto' } }}>{t('step7.acceptAndStart')}</Button>
                </Box>

                <Box sx={{ mt: 3, fontSize: smallTextSize, color: 'text.secondary' }}>
                  <div><strong>{t('step7.responsibleParty')}</strong></div>
                  <div>{t('step7.responsible')}</div>
                  <div>{t('step7.dataProtection')}</div>
                </Box>
              </Box>
            </Box>
          )}

          {/* Step 8: Decline screen */}
          {step === 8 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" sx={{ mt: 2, fontSize: bodySize }}>{t('step8.description')}</Typography>
              {/* Highlight the important note */}
              <Typography variant="body1" sx={{ mt: 2, fontWeight: 600, fontSize: bodySize }}>{t('step8.important')}</Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
                <Button variant="outlined" onClick={() => router.push('/welcome')}>{t('step8.backToWelcome')}</Button>
              </Box>
            </Box>
          )}
        </Stack>
      </Container>

      {/* Footer: back (left), progress (center), next/start (right) */}
      <Box sx={{
        position: 'fixed',
        bottom: { xs: 8, sm: 16 },
        left: { xs: 8, sm: 16 },
        right: { xs: 8, sm: 16 },
        pb: 'env(safe-area-inset-bottom)', // Platz für Home Indicator
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: { xs: 'wrap', sm: 'nowrap' },
        gap: { xs: 1, sm: 0 }
      }}>
        <Button variant="outlined" onClick={handleBack} size={isMobile ? 'small' : 'medium'} sx={{ order: { xs: 1, sm: 1 } }}>{t('goBack')}</Button>

        <Box sx={{ display: 'flex', gap: 1, order: { xs: 3, sm: 2 }, width: { xs: '100%', sm: 'auto' }, justifyContent: 'center' }}>
          {Array.from({ length: progressCount }, (_, i) => {
            const filled = i < Math.min(progressCount, step)
            return (
              <Box
                key={i}
                sx={{
                  width: { xs: 8, sm: 10 },
                  height: { xs: 8, sm: 10 },
                  borderRadius: '50%',
                  backgroundColor: filled ? 'primary.main' : 'transparent',
                  border: '1px solid rgba(0,0,0,0.2)'
                }}
              />
            )
          })}
        </Box>

        {/* Right side: show Next for steps 1-6; for step 7 (privacy) buttons are inside the content; for step 8 nothing here */}
        {step <= 6 ? (
          <Button variant="contained" onClick={handleNext} size={isMobile ? 'small' : 'medium'} sx={{ order: { xs: 2, sm: 3 } }}>{t('next')}</Button>
        ) : (
          <Box sx={{ width: { xs: 0, sm: 96 }, order: { xs: 2, sm: 3 } }} />
        )}
      </Box>

      {/* Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>{t('step7.detailsTitle')}</DialogTitle>
        <DialogContent>
          {/* Option 1: Strukturierte Abschnitte anzeigen */}
          {privacyDetails.sections && privacyDetails.sections.length > 0 ? (
            <Box sx={{ mt: 2 }}>
              {privacyDetails.sections.map((section, idx) => (
                <Box key={idx} sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, fontSize: `${scaleFactor * 1.5}rem` }}>
                    {section.heading}
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line', fontSize: bodySize }}>
                    {section.content}
                  </Typography>
                </Box>
              ))}

            </Box>
          ) : (
            /* Option 2: Volltext anzeigen */
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mt: 2, fontSize: bodySize }}>
              {privacyDetails.fullText || t('step7.detailsText')}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)} variant="contained">
            {t('step7.closeDetails')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
