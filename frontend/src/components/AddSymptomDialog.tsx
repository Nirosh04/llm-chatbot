'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import PainSlider from './PainSlider';
import BodyMap from './BodyMap';


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
  const t = useTranslations('symptoms');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={isMobile}>
      <DialogTitle sx={{ pb: { xs: 1, sm: 2 } }}>
        {isEditing ? t('editSymptom') : t('addSymptom')}
      </DialogTitle>
      <DialogContent sx={{ pt: { xs: 1, sm: 2 } }}>
        <Stack spacing={{ xs: 2, sm: 3 }} sx={{ mt: { xs: 0.5, sm: 1 } }}>
          <TextField
            label={t('description')}
            fullWidth
            value={symptom.description}
            onChange={(e) => onSymptomChange({ ...symptom, description: e.target.value })}
            size={isMobile ? 'small' : 'medium'}
          />
          
          <TextField
            label={t('duration')}
            fullWidth
            value={symptom.duration}
            onChange={(e) => onSymptomChange({ ...symptom, duration: e.target.value })}
            size={isMobile ? 'small' : 'medium'}
          />
          
          <TextField
            label={t('location')}
            fullWidth
            value={symptom.location}
            onChange={(e) => onSymptomChange({ ...symptom, location: e.target.value })}
            size={isMobile ? 'small' : 'medium'}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <BodyMap 
              onBodyPartSelect={(bodyPart) => {
                if (bodyPart) {
                  onSymptomChange({ ...symptom, location: bodyPart });
                }
              }}
              highlightLocation={symptom.location}
              showControls={true}
              showSelectedText={false}
            />
          </Box>
          
          <Box>
            <PainSlider
              value={symptom.pain}
              onChange={(value) => onSymptomChange({ ...symptom, pain: value })}
              showLabels={true}
              showValue={true}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 } }}>
        <Button onClick={onClose} size={isMobile ? 'small' : 'medium'}>{t('cancel')}</Button>
        <Button 
          onClick={onSave}
          variant="contained"
          size={isMobile ? 'small' : 'medium'}
          // sx={{ backgroundColor: colors.buttonColor }}
        >
          {isEditing ? t('update') : t('add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}