'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Slider,
  Stack,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';


interface AddSymptomDialogProps {
  open: boolean;
  onClose: () => void;
  symptom: {
    description: string;
    duration: string;
    location: string;
    pain: number;
  };
  onSymptomChange: (symptom: {
    description: string;
    duration: string;
    location: string;
    pain: number;
  }) => void;
  onSave: () => void;
  isEditing?: boolean;
}

export default function AddSymptomDialog({
  open,
  onClose,
  symptom,
  onSymptomChange,
  onSave,
  isEditing = false,
}: AddSymptomDialogProps) {
  // Funktion zur Berechnung der Farbe basierend auf dem Schmerzwert
  // Farbverlauf: hellgrün -> gelb -> orange -> hellrot -> dunkelrot
  const getPainColor = (value: number): string => {
    const colorStops = [
      { value: 0, color: { r: 144, g: 238, b: 144 } },  // hellgrün
      { value: 5, color: { r: 255, g: 255, b: 0 } },    // gelb
      { value: 7, color: { r: 255, g: 165, b: 0 } },    // orange
      { value: 8, color: { r: 255, g: 85, b: 0 } },  // hellrot
      { value: 10, color: { r: 180, g: 0, b: 0 } },     // dunkelrot
    ];
    
    // Finde die beiden Farbstopps zwischen denen wir interpolieren
    let lowerStop = colorStops[0];
    let upperStop = colorStops[colorStops.length - 1];
    
    for (let i = 0; i < colorStops.length - 1; i++) {
      if (value >= colorStops[i].value && value <= colorStops[i + 1].value) {
        lowerStop = colorStops[i];
        upperStop = colorStops[i + 1];
        break;
      }
    }
    
    // Interpoliere zwischen den beiden Stopps
    const ratio = (value - lowerStop.value) / (upperStop.value - lowerStop.value);
    const r = Math.round(lowerStop.color.r + (upperStop.color.r - lowerStop.color.r) * ratio);
    const g = Math.round(lowerStop.color.g + (upperStop.color.g - lowerStop.color.g) * ratio);
    const b = Math.round(lowerStop.color.b + (upperStop.color.b - lowerStop.color.b) * ratio);
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  const t = useTranslations('symptoms');
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? t('editSymptom') : t('addSymptom')}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label={t('description')}
            fullWidth
            value={symptom.description}
            onChange={(e) => onSymptomChange({ ...symptom, description: e.target.value })}
          />
          
          <TextField
            //label="Seit wann haben Sie diese Beschwerden?"
            label={t('duration')}
            fullWidth
            value={symptom.duration}
            onChange={(e) => onSymptomChange({ ...symptom, duration: e.target.value })}
          />
          
          <TextField
            //label="Wo genau sind die Beschwerden?"
            label={t('location')}
            fullWidth
            value={symptom.location}
            onChange={(e) => onSymptomChange({ ...symptom, location: e.target.value })}
          />
          
          <Box>
            <Typography mb={1}>{t('pain')}</Typography>
            
            <Slider
              value={symptom.pain}
              min={0}
              max={10}
              step={1}
              marks
              valueLabelDisplay="auto"
              sx={{
                color: getPainColor(symptom.pain),
                '& .MuiSlider-track': {
                  backgroundColor: getPainColor(symptom.pain),
                },
                '& .MuiSlider-thumb': {
                  backgroundColor: getPainColor(symptom.pain),
                },
                '& .MuiSlider-rail': {
                  background: 'linear-gradient(to right, rgb(144, 238, 144), rgb(255, 255, 0), rgb(255, 165, 0), rgb(255, 100, 100), rgb(139, 0, 0))',
                },
              }}
              onChange={(_, value) => onSymptomChange({ ...symptom, pain: value as number })}
            />
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                {t('painlevel0')}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: getPainColor(symptom.pain) }}>
                {symptom.pain}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                {t('painlevel10')}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('cancel')}</Button>
        <Button 
          onClick={onSave}
          variant="contained"
          // sx={{ backgroundColor: colors.buttonColor }}
        >
          {isEditing ? t('update') : t('add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Need to import Box for the Stack component
import { Box } from '@mui/material';