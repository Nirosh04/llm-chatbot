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
import { useSettings } from '@/context/SettingsContext';



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
  const { fontSize } = useSettings();

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      sx={{
        //backgroundColor: theme.palette.paper,
        borderRadius: '12px !important',
        mb: 2,
        '&:before': { display: 'none' },
        width: '100%',
        overflowX: 'hidden',
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{
          minHeight: { xs: 56, sm: 64 },
          px: { xs: 1, sm: 2 },
          '& .MuiAccordionSummary-content': {
            my: 1,
            mr: 0,
            overflow: 'hidden',
            maxWidth: 'calc(100% - 48px)',
          },
          '& .MuiAccordionSummary-expandIconWrapper': {
            marginLeft: 'auto',
          },
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700, 
            fontSize: `${fontSize}px`,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '100%',
          }}
        >
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
              <Typography variant="body1" sx={{ fontSize: `${fontSize}px` }}>
                {t('durationShort')}: {symptom.duration}
              </Typography>

              <Typography variant="body2" sx={{ fontSize: `${fontSize}px` }}>
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