'use client';

import { useState } from 'react';
import {
  Typography,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
} from '@mui/material';
import { Edit, Delete, ExpandMore } from '@mui/icons-material';
import { MedicalCondition } from './../types/PatientMedicalData'; // rename to patientData.ts
import { useTranslations } from 'next-intl';
import { useSettings } from '@/context/SettingsContext';




interface MedicalHistoryCardProps {
  condition: MedicalCondition;
  index: number;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
}

export default function MedicalHistoryCard({
  condition,
  index,
  onEdit,
  onRemove,
}: MedicalHistoryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const t = useTranslations('medicalHistory');
  const { fontSize } = useSettings();

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      sx={{
        // backgroundColor: colors.llmChatColor,
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
          sx={{ 
            fontSize: `${fontSize}px`, 
            fontWeight: 700,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '100%',
          }}
        >
          {condition.condition}
        </Typography>
      </AccordionSummary>
      
      <AccordionDetails>
          <Stack spacing={2}>
            <Typography variant="body1" sx={{ fontSize: `${fontSize}px` }}>
              {t('sinceShort')}: {condition.since}
            </Typography>

            {condition.medication && (
              <Typography variant="body2" sx={{ fontSize: `${fontSize}px` }}>
                {t('medicationShort')}: {condition.medication}
              </Typography>
            )}

            {condition.notes && (
              <Typography variant="body2" sx={{ fontSize: `${fontSize}px` }}>
                {t('notesShort')}: {condition.notes}
              </Typography>
            )}
                  
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onEdit(index);
              }}
              // sx={{ color: colors.textColor }}
            >
              <Edit />
            </IconButton>
            
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onRemove(index);
              }}
              // sx={{ color: colors.textColor }}
            >
              <Delete />
            </IconButton>
          </Stack>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}