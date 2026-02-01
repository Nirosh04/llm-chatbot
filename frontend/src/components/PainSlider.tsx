'use client';

import { Box, Typography, Slider, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';

interface PainSliderProps {
  value: number;
  onChange: (value: number) => void;
  showLabels?: boolean;
  showValue?: boolean;
}

// Function to calculate color based on pain level
// Color gradient: light green -> yellow -> orange -> light red -> dark red
const getPainColor = (value: number): string => {
  const colorStops = [
    { value: 0, color: { r: 144, g: 238, b: 144 } },  // light green
    { value: 5, color: { r: 255, g: 255, b: 0 } },    // yellow
    { value: 7, color: { r: 255, g: 165, b: 0 } },    // orange
    { value: 8, color: { r: 255, g: 85, b: 0 } },     // light red
    { value: 10, color: { r: 180, g: 0, b: 0 } },     // dark red
  ];
  
  let lowerStop = colorStops[0];
  let upperStop = colorStops[colorStops.length - 1];
  
  for (let i = 0; i < colorStops.length - 1; i++) {
    if (value >= colorStops[i].value && value <= colorStops[i + 1].value) {
      lowerStop = colorStops[i];
      upperStop = colorStops[i + 1];
      break;
    }
  }
  
  const ratio = (value - lowerStop.value) / (upperStop.value - lowerStop.value);
  const r = Math.round(lowerStop.color.r + (upperStop.color.r - lowerStop.color.r) * ratio);
  const g = Math.round(lowerStop.color.g + (upperStop.color.g - lowerStop.color.g) * ratio);
  const b = Math.round(lowerStop.color.b + (upperStop.color.b - lowerStop.color.b) * ratio);
  
  return `rgb(${r}, ${g}, ${b})`;
};

export default function PainSlider({
  value,
  onChange,
  showLabels = true,
  showValue = true,
}: PainSliderProps) {
  const t = useTranslations('symptoms');

  return (
    <Box>
      {showValue && (
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {t('pain')}
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {value}
          </Typography>
        </Stack>
      )}
      
      <Slider
        value={value}
        min={0}
        max={10}
        step={1}
        marks
        valueLabelDisplay="auto"
        sx={{
          color: getPainColor(value),
          '& .MuiSlider-track': {
            backgroundColor: getPainColor(value),
          },
          '& .MuiSlider-thumb': {
            backgroundColor: getPainColor(value),
          },
          '& .MuiSlider-rail': {
            background: 'linear-gradient(to right, rgb(144, 238, 144), rgb(255, 255, 0), rgb(255, 165, 0), rgb(255, 100, 100), rgb(139, 0, 0))',
          },
        }}
        onChange={(_, newValue) => onChange(newValue as number)}
      />
      
      {showLabels && (
        <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.primary">
                {t('painlevel0')}
          </Typography>
          <Typography variant="caption" color="text.primary">
                {t('painlevel10')}
          </Typography>
        </Stack>
      )}
    </Box>
  );
}
