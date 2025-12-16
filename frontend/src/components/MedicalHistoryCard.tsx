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
import { colors } from './../styles/colors';
import { MedicalCondition } from './../types/PatientMedicalData'; // rename to patientData.ts




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

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      sx={{
        backgroundColor: colors.llmChatColor,
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
        <Typography sx={{ fontSize: 20, fontWeight: 700, color: colors.textColor }}>
          {condition.condition}
        </Typography>
      </AccordionSummary>
      
      <AccordionDetails>
        <Stack spacing={2}>
          <Typography sx={{ fontSize: 16, color: colors.textColor }}>
            Seit: {condition.since}
          </Typography>
          
          {condition.notes && (
            <Typography sx={{ fontSize: 14, color: colors.textColor }}>
              Notizen: {condition.notes}
            </Typography>
          )}
          
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onEdit(index);
              }}
              sx={{ color: colors.textColor }}
            >
              <Edit />
            </IconButton>
            
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onRemove(index);
              }}
              sx={{ color: colors.textColor }}
            >
              <Delete />
            </IconButton>
          </Stack>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}