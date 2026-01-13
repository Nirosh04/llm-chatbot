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

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      sx={{
        // backgroundColor: colors.llmChatColor,
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
          {condition.condition}
        </Typography>
      </AccordionSummary>
      
      <AccordionDetails>
        <Stack spacing={2}>
          <Typography sx={{ fontSize: 16}}>
            {t('since')}: {condition.since}
          </Typography>
          
          {condition.medication && (
            <Typography sx={{ fontSize: 14}}>
              Medikamente: {condition.medication}
            </Typography>
          )}
          
          {condition.notes && (
            <Typography sx={{ fontSize: 14}}>
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