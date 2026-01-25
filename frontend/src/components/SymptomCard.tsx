'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
} from '@mui/material';
import { Edit, Delete, ExpandMore } from '@mui/icons-material';
import { Symptom } from './../types/PatientMedicalData';
import { useTranslations } from 'next-intl';
import PainSlider from './PainSlider';
import BodyMap from './BodyMap';



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
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {symptom.description}
        </Typography>
      </AccordionSummary>
      
      <AccordionDetails>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          {/* Body Map Visualization */}
          <BodyMap highlightLocation={symptom.location} />
          
          {/* Symptom Details */}
          <Box sx={{ flex: 1 }}>
            <Stack spacing={1}>
              <Typography variant="body1">
                {t('durationShort')}: {symptom.duration}
              </Typography>

              <Typography variant="body2">
                {t('locationShort')}: {symptom.location}
              </Typography>

              <Box sx={{ mt: 2 }}>
                <PainSlider
                  value={symptom.pain}
                  onChange={(value) => onPainChange(index, value)}
                  showLabels={true}
                  showValue={true}
                />
              </Box>
            </Stack>
          </Box>
        </Stack>
          
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
      </AccordionDetails>
    </Accordion>
  );
}