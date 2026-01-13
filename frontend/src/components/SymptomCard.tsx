'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
} from '@mui/material';
import { Edit, Delete, ExpandMore } from '@mui/icons-material';
import { Symptom } from './../types/PatientMedicalData';
import { useTranslations } from 'next-intl';



interface SymptomCardProps {
  symptom: Symptom;
  index: number;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
  onPainChange: (index: number, value: number) => void;
}

export default function SymptomCard({
  symptom,
  index,
  onEdit,
  onRemove,
  onPainChange,
}: SymptomCardProps) {
  const [expanded, setExpanded] = useState(false);
  const t = useTranslations('symptoms');

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

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      sx={{
        //backgroundColor: theme.palette.paper,
        borderRadius: '12px !important',
        mb: 2,
        '&:before': { display: 'none' },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{
          minHeight: 64,
          '& .MuiAccordionSummary-content': {
            my: 1,
          },
        }}
      >
        <Typography sx={{ fontSize: 20, fontWeight: 700}}>
          {symptom.description}
        </Typography>
      </AccordionSummary>
      
      <AccordionDetails>
        <Stack spacing={1}>
          <Typography sx={{ fontSize: 16}}>
            {t('durationShort')}: {symptom.duration}
          </Typography>
          
          <Typography sx={{ fontSize: 14}}>
            {t('locationShort')}: {symptom.location}
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography sx={{ fontSize: 14, fontWeight: 600}}>
                {t('pain')}
              </Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 600}}>
                {symptom.pain}
              </Typography>
            </Stack>
            
            <Slider
              value={symptom.pain}
              min={1}
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
              onChange={(_, value) => onPainChange(index, value as number)}
            />
            <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.primary" sx={{ fontSize: '0.9rem' }}>
                  {t('painlevel0')}
              </Typography>
              <Typography variant="body2" color="text.primary" sx={{ fontSize: '0.9rem' }}>
                {t('painlevel10')}
              </Typography>
            </Stack>
          </Box>
          
          <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 2 }}>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onEdit(index);
              }}
            >
              <Edit />
            </IconButton>
            
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onRemove(index);
              }}
            >
              <Delete />
            </IconButton>
          </Stack>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}