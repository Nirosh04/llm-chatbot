
// app/symptoms/page.tsx - Symptome und Krankengeschichte
'use client';
import { useTheme, useMediaQuery } from '@mui/material';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  AppBar,
  Box,
  Container,
  Typography,
  IconButton,
  Tooltip,
  Fab,
  CircularProgress,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Add,
  Home,
} from '@mui/icons-material';
import SymptomCard from './../../components/SymptomCard';
import MedicalHistoryCard from './../../components/MedicalHistoryCard';
import AddSymptomDialog from './../../components/AddSymptomDialog';
import { Symptom, MedicalCondition, HealthSummary } from './../../types/PatientMedicalData'; // rename to patient_data.ts
import { useSettings } from '@/context/SettingsContext';
import { useTranslations } from 'next-intl';
import { getHealthSummary } from '@/services/serverRequests';




interface SymptomsPageProps {
  sessionId: string | null;
}

// passing sessionId as prop works as long as it is loaded as a component
export default function SymptomsPage({ sessionId }: SymptomsPageProps) {
  const [jsonData, setJsonData] = useState<HealthSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [hoveredTab, setHoveredTab] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [addSymptomDialogOpen, setAddSymptomDialogOpen] = useState(false);
  const [addHistoryDialogOpen, setAddHistoryDialogOpen] = useState(false);
  const [editSymptomDialogOpen, setEditSymptomDialogOpen] = useState(false);
  const [editHistoryDialogOpen, setEditHistoryDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const { darkMode, fontSize } = useSettings();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();
  const tSymptoms = useTranslations('symptoms');
  const tMedicalHistory = useTranslations('medicalHistory');

  // Form states
  const [newSymptom, setNewSymptom] = useState({
    description: '',
    duration: '',
    location: '',
    pain: 5,
  });
  const [newHistory, setNewHistory] = useState({
    condition: '',
    since: '',
    notes: '',
    medication: '',
  });

  const fetchHealthSummary = useCallback(async () => {
    if (!sessionId) {
      // Use default data if no session
      const defaultData: HealthSummary = {
        historyOfPresentIllness: {
          keySymptoms: [
            {
              description: "Kopfschmerzen",
              location: "Kopf",
              severity: "6/10",
              duration: "seit 2 Tagen",
              pain: 6
            },
            {
              description: "Müdigkeit",
              location: "gesamt",
              severity: "3/10",
              duration: "seit 1 Woche",
              pain: 3
            }
          ]
        },
        medicalHistory: {
          conditions: [
            {
              condition: "Diabetes Typ II",
              since: "seit 2015",
              medication: "Metformin",
              notes: "Medikamentös eingestellt"
            },
            {
              condition: "Allergien: Pollen",
              since: "Kindheit",
              medication: "Antihistaminika bei Bedarf",
              notes: "Saisonal, Niesreiz"
            },
            {
              condition: "Hypertonie (Bluthochdruck)",
              since: "seit 2019",
              medication: "Ramipril 5mg",
              notes: "Kontrolliert mit Medikamenten"
            },
            {
              condition: "Asthma bronchiale",
              since: "seit 2005",
              medication: "Salbutamol Inhaler",
              notes: "Gelegentliche Inhaler-Nutzung"
            },
            {
              condition: "Herzinfarkt",
              since: "2018",
              medication: "Aspirin, Statin",
              notes: "Stent-Implantation"
            }
          ]
        }
      };
      setJsonData(defaultData);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await getHealthSummary(sessionId);
      setJsonData(data);
      setError(null);
    } catch (err) {
      setError(tSymptoms('errorLoading'));
      console.error('Error fetching health summary:', err);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, tSymptoms]);

  useEffect(() => {
    fetchHealthSummary();
  }, [fetchHealthSummary]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleNextPage = () => {
    if (activeTab === 0) setActiveTab(1);
  };

  const handlePreviousPage = () => {
    if (activeTab === 1) setActiveTab(0);
  };

  const handleAddSymptom = () => {
    if (!jsonData) return;

    const symptom: Symptom = {
      description: newSymptom.description.trim() || tSymptoms('unnamedSymptom'),
      location: newSymptom.location.trim() || tSymptoms('unknown'),
      severity: `${newSymptom.pain}/10`,
      duration: newSymptom.duration.trim() || tSymptoms('unknown'),
      pain: Math.max(0, Math.min(10, newSymptom.pain)),
    };

    setJsonData({
      ...jsonData,
      historyOfPresentIllness: {
        ...jsonData.historyOfPresentIllness,
        keySymptoms: [...jsonData.historyOfPresentIllness.keySymptoms, symptom]
      }
    });

    // Reset form and close dialog
    setNewSymptom({ description: '', duration: '', location: '', pain: 5 });
    setAddSymptomDialogOpen(false);
  };

  const handleEditSymptom = (index: number) => {
    if (!jsonData || index < 0 || index >= jsonData.historyOfPresentIllness.keySymptoms.length) return;

    const symptom = jsonData.historyOfPresentIllness.keySymptoms[index];
    setNewSymptom({
      description: symptom.description,
      duration: symptom.duration,
      location: symptom.location,
      pain: symptom.pain,
    });
    setEditingIndex(index);
    setEditSymptomDialogOpen(true);
  };

  const handleUpdateSymptom = () => {
    if (!jsonData || editingIndex === null) return;

    const updatedSymptoms = [...jsonData.historyOfPresentIllness.keySymptoms];
    updatedSymptoms[editingIndex] = {
      description: newSymptom.description.trim() || tSymptoms('unnamedSymptom'),
      location: newSymptom.location.trim() || tSymptoms('unknown'),
      severity: `${newSymptom.pain}/10`,
      duration: newSymptom.duration.trim() || tSymptoms('unknown'),
      pain: Math.max(0, Math.min(10, newSymptom.pain)),
    };

    setJsonData({
      ...jsonData,
      historyOfPresentIllness: {
        ...jsonData.historyOfPresentIllness,
        keySymptoms: updatedSymptoms
      }
    });

    // Reset and close
    setNewSymptom({ description: '', duration: '', location: '', pain: 5 });
    setEditingIndex(null);
    setEditSymptomDialogOpen(false);
  };

  const handleRemoveSymptom = (index: number) => {
    if (!jsonData) return;

    const updatedSymptoms = [...jsonData.historyOfPresentIllness.keySymptoms];
    updatedSymptoms.splice(index, 1);

    setJsonData({
      ...jsonData,
      historyOfPresentIllness: {
        ...jsonData.historyOfPresentIllness,
        keySymptoms: updatedSymptoms
      }
    });
  };

  const handleAddHistory = () => {
    if (!jsonData) return;

    const condition: MedicalCondition = {
      condition: newHistory.condition.trim() || tMedicalHistory('unnamedCondition'),
      since: newHistory.since.trim() || tMedicalHistory('unknown'),
      medication: newHistory.medication.trim(),
      notes: newHistory.notes.trim(),
    };

    setJsonData({
      ...jsonData,
      medicalHistory: {
        ...jsonData.medicalHistory,
        conditions: [...jsonData.medicalHistory.conditions, condition]
      }
    });

    // Reset form and close dialog
    setNewHistory({ condition: '', since: '', notes: '', medication: '' });
    setAddHistoryDialogOpen(false);
  };

  const handleEditHistory = (index: number) => {
    if (!jsonData || index < 0 || index >= jsonData.medicalHistory.conditions.length) return;

    const condition = jsonData.medicalHistory.conditions[index];
    setNewHistory({
      condition: condition.condition,
      since: condition.since,
      medication: condition.medication,
      notes: condition.notes,
    });
    setEditingIndex(index);
    setEditHistoryDialogOpen(true);
  };

  const handleUpdateHistory = () => {
    if (!jsonData || editingIndex === null) return;

    const updatedConditions = [...jsonData.medicalHistory.conditions];
    updatedConditions[editingIndex] = {
      condition: newHistory.condition.trim() || "Unbenannte Erkrankung",
      since: newHistory.since.trim() || "Unbekannt",
      medication: newHistory.medication.trim(),
      notes: newHistory.notes.trim(),
    };

    setJsonData({
      ...jsonData,
      medicalHistory: {
        ...jsonData.medicalHistory,
        conditions: updatedConditions
      }
    });

    // Reset and close
    setNewHistory({ condition: '', since: '', notes: '', medication: '' });
    setEditingIndex(null);
    setEditHistoryDialogOpen(false);
  };

  const handleRemoveHistory = (index: number) => {
    if (!jsonData) return;

    const updatedConditions = [...jsonData.medicalHistory.conditions];
    updatedConditions.splice(index, 1);

    setJsonData({
      ...jsonData,
      medicalHistory: {
        ...jsonData.medicalHistory,
        conditions: updatedConditions
      }
    });
  };

  const handlePainChange = (index: number, value: number) => {
    if (!jsonData) return;

    const updatedSymptoms = [...jsonData.historyOfPresentIllness.keySymptoms];
    updatedSymptoms[index] = {
      ...updatedSymptoms[index],
      pain: Math.max(0, Math.min(10, value)),
      severity: `${value}/10`,
    };

    setJsonData({
      ...jsonData,
      historyOfPresentIllness: {
        ...jsonData.historyOfPresentIllness,
        keySymptoms: updatedSymptoms
      }
    });
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          p: 3,
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 600 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          py: { xs: 0.5, sm: 1 },
          backgroundColor: theme => theme.palette.background.paper, // appbar of symptoms page uses paper
        }}
      >
        <Container maxWidth={false} sx={{ px: { xs: 1, sm: 2 } }}>
          <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 2 }}>
            {/* Home button removed per request */}

            {/* Left arrow for Krankengeschichte page */}
            {activeTab === 1 && (
              <Tooltip title={tMedicalHistory('backToSymptoms')}>
                <IconButton
                  onClick={handlePreviousPage}
                >
                  <ChevronLeft />
                </IconButton>
              </Tooltip>
            )}

            {/* Tab Navigation */}
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: { xs: 16, sm: 24 },
                  p: 0.5,
                  mx: 'auto',
                  maxWidth: 600,
                }}
              >
                {/* Active tab indicator */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 4,
                    bottom: 4,
                    left: activeTab === 0 ? 4 : '50%',
                    right: activeTab === 1 ? 4 : '50%',
                    borderRadius: { xs: 12, sm: 20 },
                    transition: 'all 0.25s ease-in-out',
                    backgroundColor: theme.palette.button.bg, // or any color like '#e0e0e0'
                    boxShadow: darkMode
                      ? '0 2px 8px rgba(255, 255, 255, 0.2)' // lighter shadow for dark mode
                      : '0 2px 8px rgba(35, 35, 35, 0.2)',   // dark shadow for light mode
                  }}
                />

                {/* Tabs */}
                <Stack direction="row">
                  <Box
                    component="button"
                    sx={{
                      flex: 1,
                      position: 'relative',
                      zIndex: 1,
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      py: { xs: 0.75, sm: 1 },
                      px: { xs: 0.5, sm: 1 },
                      borderRadius: { xs: 12, sm: 16 },
                      transition: 'background-color 0.2s',
                      backgroundColor: hoveredTab === 0
                        ? 'rgba(0, 0, 0, 0.08)'
                        : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.08)',
                      },
                    }}
                    onClick={() => setActiveTab(0)}
                    onMouseEnter={() => setHoveredTab(0)}
                    onMouseLeave={() => setHoveredTab(null)}
                  >
                    <Typography
                      sx={{
                        fontSize: `${fontSize}px`,
                        fontWeight: 700,
                        textAlign: 'center',
                        hyphens: 'auto',
                        overflowWrap: 'break-word',
                        lineHeight: 1.2,
                        //color: theme => theme.palette.text.primary,
                      }}
                      lang="de"
                    >
                      {tSymptoms('symptomsTab')}
                    </Typography>
                  </Box>

                  <Box
                    component="button"
                    sx={{
                      flex: 1,
                      position: 'relative',
                      zIndex: 1,
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      py: { xs: 0.75, sm: 1 },
                      px: { xs: 0.5, sm: 1 },
                      borderRadius: { xs: 12, sm: 16 },
                      transition: 'background-color 0.2s',
                      backgroundColor: hoveredTab === 1
                        ? 'rgba(0, 0, 0, 0.08)'
                        : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.08)',
                      },
                    }}
                    onClick={() => setActiveTab(1)}
                    onMouseEnter={() => setHoveredTab(1)}
                    onMouseLeave={() => setHoveredTab(null)}
                  >
                    <Typography
                      sx={{
                        fontSize: `${fontSize}px`,
                        fontWeight: 700,
                        textAlign: 'center',
                        hyphens: 'auto',
                        overflowWrap: 'break-word',
                        lineHeight: 1.2,
                        //color: theme => theme.palette.text.primary,
                      }}
                      lang="de"
                    >
                      {tMedicalHistory('medicalHistoryTab')}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>

            {/* Right arrow for Symptome page */}
            {activeTab === 0 && (
              <Tooltip title={tSymptoms('toMedicalHistory')}>
                <IconButton
                  onClick={handleNextPage}
                >
                  <ChevronRight />
                </IconButton>
              </Tooltip>
            )}

            {/* Empty space when arrow is not shown */}
            {activeTab === 1 && <Box sx={{ width: 48 }} />}
          </Stack>
        </Container>
      </AppBar>

      <Container
        maxWidth={false}
        sx={{
          py: { xs: 2, sm: 3 },
          px: { xs: 2, sm: 3 },
          pb: { xs: 14, sm: 11 },
          overflowX: 'hidden',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {/* Symptoms Tab Content */}
        {activeTab === 0 && jsonData && (
          <Stack spacing={2}>
            {jsonData.historyOfPresentIllness.keySymptoms.map((symptom, index) => (
              <SymptomCard
                key={index}
                symptom={symptom}
                index={index}
                onEdit={handleEditSymptom}
                onRemove={handleRemoveSymptom}
                onPainChange={handlePainChange}
              />
            ))}

            {jsonData.historyOfPresentIllness.keySymptoms.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1">
                  {tSymptoms('noSymptomsYet')}
                </Typography>
              </Box>
            )}
          </Stack>
        )}

        {/* Medical History Tab Content */}
        {activeTab === 1 && jsonData && (
          <Stack spacing={2}>
            {jsonData.medicalHistory.conditions.map((condition, index) => (
              <MedicalHistoryCard
                key={index}
                condition={condition}
                index={index}
                onEdit={handleEditHistory}
                onRemove={handleRemoveHistory}
              />
            ))}

            {jsonData.medicalHistory.conditions.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  {tMedicalHistory('noHistoryYet')}
                </Typography>
              </Box>
            )}
          </Stack>
        )}
      </Container>

      {/* FAB for adding items - CENTERED */}
      <Box sx={{
        position: 'fixed',
        bottom: { xs: 80, sm: 24 },
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1300,
      }}>
        <Tooltip
          title={activeTab === 0
            ? tSymptoms('addSymptom')
            : tMedicalHistory('addHistory')
          }
        >
          <Fab
            sx={{
              color: theme.palette.text.primary,
              bgcolor: theme.palette.primary.main, // background color
              width: { xs: 56, sm: 60 },
              height: { xs: 56, sm: 60 },
              boxShadow: '4px 6px 18px rgba(100, 160, 255, 0.35)',

              '&:hover': {
                boxShadow: '6px 8px 22px rgba(100, 160, 255, 0.55)',
              },
            }}
            onClick={() => {
              if (activeTab === 0) {
                setAddSymptomDialogOpen(true);
              } else {
                setAddHistoryDialogOpen(true);
              }
            }}
          >
            <Add sx={{ fontSize: { xs: 28, sm: 32 } }} />
          </Fab>
        </Tooltip>
      </Box>

      {/* Add Symptom Dialog */}
      <AddSymptomDialog
        open={addSymptomDialogOpen}
        onClose={() => setAddSymptomDialogOpen(false)}
        symptom={newSymptom}
        onSymptomChange={setNewSymptom}
        onSave={handleAddSymptom}
      />

      {/* Edit Symptom Dialog */}
      <AddSymptomDialog
        open={editSymptomDialogOpen}
        onClose={() => {
          setEditSymptomDialogOpen(false);
          setEditingIndex(null);
          setNewSymptom({ description: '', duration: '', location: '', pain: 5 });
        }}
        symptom={newSymptom}
        onSymptomChange={setNewSymptom}
        onSave={handleUpdateSymptom}
        isEditing={true}
      />

      {/* Add Medical History Dialog */}
      <Dialog
        open={addHistoryDialogOpen}
        onClose={() => setAddHistoryDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ pb: { xs: 1, sm: 2 } }}>{tMedicalHistory('addHistory')}</DialogTitle>
        <DialogContent sx={{ pt: { xs: 1, sm: 2 } }}>
          <Stack spacing={{ xs: 2, sm: 2 }} sx={{ mt: { xs: 0.5, sm: 1 } }}>
            <TextField
              label={tMedicalHistory('condition')}
              fullWidth
              value={newHistory.condition}
              onChange={(e) => setNewHistory({ ...newHistory, condition: e.target.value })}
              size={isMobile ? 'small' : 'medium'}
            />
            <TextField
              label={tMedicalHistory('since')}
              fullWidth
              value={newHistory.since}
              onChange={(e) => setNewHistory({ ...newHistory, since: e.target.value })}
              size={isMobile ? 'small' : 'medium'}
            />
            <TextField
              label={tMedicalHistory('medication')}
              fullWidth
              multiline
              rows={isMobile ? 2 : 2}
              value={newHistory.medication}
              onChange={(e) => setNewHistory({ ...newHistory, medication: e.target.value })}
              size={isMobile ? 'small' : 'medium'}
            />
            <TextField
              label={tMedicalHistory('notes')}
              fullWidth
              multiline
              rows={isMobile ? 2 : 3}
              value={newHistory.notes}
              onChange={(e) => setNewHistory({ ...newHistory, notes: e.target.value })}
              size={isMobile ? 'small' : 'medium'}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 } }}>
          <Button onClick={() => setAddHistoryDialogOpen(false)} size={isMobile ? 'small' : 'medium'}>{tMedicalHistory('cancel')}</Button>
          <Button
            onClick={handleAddHistory}
            variant="contained"
            size={isMobile ? 'small' : 'medium'}
          >
            {tMedicalHistory('add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Medical History Dialog */}
      <Dialog
        open={editHistoryDialogOpen}
        onClose={() => {
          setEditHistoryDialogOpen(false);
          setEditingIndex(null);
          setNewHistory({ condition: '', since: '', medication: '', notes: '' });
        }}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ pb: { xs: 1, sm: 2 } }}>{tMedicalHistory('editHistory')}</DialogTitle>
        <DialogContent sx={{ pt: { xs: 1, sm: 2 } }}>
          <Stack spacing={{ xs: 2, sm: 2 }} sx={{ mt: { xs: 0.5, sm: 1 } }}>
            <TextField
              label={tMedicalHistory('condition')}
              fullWidth
              value={newHistory.condition}
              onChange={(e) => setNewHistory({ ...newHistory, condition: e.target.value })}
              size={isMobile ? 'small' : 'medium'}
            />
            <TextField
              label={tMedicalHistory('since')}
              fullWidth
              value={newHistory.since}
              onChange={(e) => setNewHistory({ ...newHistory, since: e.target.value })}
              size={isMobile ? 'small' : 'medium'}
            />
            <TextField
              label={tMedicalHistory('medication')}
              fullWidth
              multiline
              rows={isMobile ? 2 : 2}
              value={newHistory.medication}
              onChange={(e) => setNewHistory({ ...newHistory, medication: e.target.value })}
              size={isMobile ? 'small' : 'medium'}
            />
            <TextField
              label={tMedicalHistory('notes')}
              fullWidth
              multiline
              rows={isMobile ? 2 : 3}
              value={newHistory.notes}
              onChange={(e) => setNewHistory({ ...newHistory, notes: e.target.value })}
              size={isMobile ? 'small' : 'medium'}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 } }}>
          <Button onClick={() => {
            setEditHistoryDialogOpen(false);
            setEditingIndex(null);
            setNewHistory({ condition: '', since: '', notes: '', medication: '' });
          }} size={isMobile ? 'small' : 'medium'}>
            {tMedicalHistory('cancel')}
          </Button>
          <Button
            onClick={handleUpdateHistory}
            variant="contained"
            size={isMobile ? 'small' : 'medium'}
          >
            {tMedicalHistory('update')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}