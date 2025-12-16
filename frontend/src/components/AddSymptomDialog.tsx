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
import { colors } from './../styles/colors';


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
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? "Symptom bearbeiten" : "Neues Symptom Hinzufügen"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Beschreibung"
            fullWidth
            value={symptom.description}
            onChange={(e) => onSymptomChange({ ...symptom, description: e.target.value })}
          />
          
          <TextField
            label="Dauer"
            fullWidth
            value={symptom.duration}
            onChange={(e) => onSymptomChange({ ...symptom, duration: e.target.value })}
          />
          
          <TextField
            label="Ort"
            fullWidth
            value={symptom.location}
            onChange={(e) => onSymptomChange({ ...symptom, location: e.target.value })}
          />
          
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography>Schmerz (1-10)</Typography>
              <Typography sx={{ fontWeight: 600 }}>{symptom.pain}</Typography>
            </Stack>
            
            <Slider
              value={symptom.pain}
              min={1}
              max={10}
              step={1}
              marks
              valueLabelDisplay="auto"
              sx={{
                color: colors.fabColor,
                '& .MuiSlider-track': {
                  backgroundColor: colors.fabColor,
                },
                '& .MuiSlider-rail': {
                  backgroundColor: colors.barColor,
                },
              }}
              onChange={(_, value) => onSymptomChange({ ...symptom, pain: value as number })}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button 
          onClick={onSave}
          variant="contained"
          sx={{ backgroundColor: colors.buttonColor }}
        >
          {isEditing ? "Aktualisieren" : "Hinzufügen"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Need to import Box for the Stack component
import { Box } from '@mui/material';