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
            Dauer: {symptom.duration}
          </Typography>
          
          <Typography sx={{ fontSize: 14}}>
            Ort: {symptom.location}
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography sx={{ fontSize: 14, fontWeight: 600}}>
                Schmerz (1-10)
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
                color: '#64a0ff', //colors.fabColor,
                '& .MuiSlider-track': {
                  backgroundColor: '#64a0ff', // colors.fabColor,
                },
                '& .MuiSlider-rail': {
                  backgroundColor: '#dcebff'// colors.barColor,
                },
              }}
              onChange={(_, value) => onPainChange(index, value as number)}
            />
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