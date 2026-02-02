
// app/ChatInterface/page.tsx - Main page w tabs

"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  AppBar,
  Switch,
  Slider,
  Select,
  MenuItem,
  List,
  ListItem,
  Button,
  ListItemIcon,
  ListItemText,
  IconButton,
  useTheme,
  Tab,
  Tabs,
  Box,
  Tooltip,
  Collapse,
  Stack,
  Container,
} from '@mui/material';

import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import ChatIcon from '@mui/icons-material/Chat';
import InfoIcon from '@mui/icons-material/Info';
import NavigationIcon from '@mui/icons-material/Navigation';
import SendIcon from '@mui/icons-material/Send';
import PainIcon from '@mui/icons-material/Scale';
import BodyIcon from '@mui/icons-material/AccessibilityNew';

// removed FontSizeSelect in favor of a slider
import { MessageList } from './../../components/MessageList';
import { CustomTextField } from './../../components/CustomTextField';
import PainSlider from './../../components/PainSlider';
import BodyMap from './../../components/BodyMap';
import {
  createSession,
  getLLMResponseFromServer,
  getHealthSummary,
  resetConversationRequest
} from '../../services/serverRequests';
import SymptomsPage from '@/app/symptoms/page'; // adjust the path if needed
import NavigationPage from '@/app/navigation/page';
import { useSettings } from '@/context/SettingsContext';
import { useTranslations } from 'next-intl';


interface ChatMessage {
  id: string;
  text: string;
  isMe: boolean;
}


export default function TabMain() {
  const { darkMode, toggleDarkMode, language, setLanguage, fontSize, setFontSize } = useSettings();
  const tChat = useTranslations('chat');
  const tTabs = useTranslations('tabs');
  const tSettings = useTranslations('settings');
  const theme = useTheme();

  console.log('=== PAGE.TSX fontSize:', fontSize);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [{
    id: 'welcome',
    text: tChat('firstMessage'),
    isMe: false,
  }]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [, setHealthSummaryText] = useState(
    "No Health summary was requested yet"
  );
  const [logoutOpen, setLogoutOpen] = useState(false);
  // dummy function
  const [sliderOpen, setSliderOpen] = useState(false);
  const [painLevel, setPainLevel] = useState(5);
  const [bodyMapOpen, setBodyMapOpen] = useState(false);
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollableContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-scroll to top when slider opens
  useEffect(() => {
    if (sliderOpen && scrollableContainerRef.current) {
      scrollableContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [sliderOpen]);

  // Auto-update text field when pain level changes
  useEffect(() => {
    if (sliderOpen) {
      const painText = `${tChat('painLevel')}: ${painLevel}/10`;
      const painPattern = new RegExp(`${tChat('painLevel')}:\\s*\\d+/10`);
      
      setInputText(prev => {
        if (painPattern.test(prev)) {
          // Replace existing pain level
          return prev.replace(painPattern, painText);
        } else {
          // Add pain level
          return prev ? `${prev} | ${painText}` : painText;
        }
      });
    }
  }, [painLevel, sliderOpen, tChat]);

  // Auto-update text field when body part is selected
  useEffect(() => {
    if (bodyMapOpen) {
      const label = tChat('painLocation');
      const locationPattern = new RegExp(`\\s*\\|?\\s*${label}:\\s*[^|.,!?]+\\s*\\|?\\s*`);

      if (selectedBodyPart) {
        // Add or update body location
        const bodyText = `${label}: ${selectedBodyPart}`;
        const simplePattern = new RegExp(`${label}:\\s*[^|.,!?]+`);
        
        setInputText(prev => {
          if (simplePattern.test(prev)) {
            // Replace existing location
            return prev.replace(simplePattern, bodyText);
          } else {
            // Add body location
            return prev ? `${prev} | ${bodyText}` : bodyText;
          }
        });
      } else {
        // Remove body location when deselected
        setInputText(prev => prev.replace(locationPattern, '').replace(/\s*\|\s*\|\s*/g, ' | '));
      }
    }
  }, [selectedBodyPart, bodyMapOpen, tChat]);

  const handleSendMessage = async (message?: string) => {
    console.log('1. handleSendMessage called');
    
    const messageToSend = message || inputText.trim();
    
    if (!messageToSend || isLoading) {
      console.log('2. Early return - input empty or loading');
      return;
    }

    // Close slider and body map after sending
    setSliderOpen(false);
    setBodyMapOpen(false);

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: messageToSend,
      isMe: true,
    };

    console.log('3. Adding user message:', newMessage.text);
    setMessages(prev => [...prev, newMessage]);
    if (!message) setInputText(''); // Only clear input if it was from the text field
    setIsLoading(true);
    console.log('4. Loading set to true');

    let currentSessionId = sessionId; // get current sessionId
    if (!currentSessionId) {
      console.log('5. Creating new session');
      //currentSessionId = '1111111';  // Dummy ID
      currentSessionId = await createSession();
      setSessionId(currentSessionId);
    }

    console.log('6. Calling (dummy)GetLLMResponseFromServer');
    const response = await getLLMResponseFromServer(
      currentSessionId,
      newMessage.text
    );
    
    console.log('7. Got response:', response);

    const aiMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: response.ai_response,
      isMe: false,
    };

    console.log('8. Adding AI message');
    setMessages(prev => {
      console.log('9. Current messages before adding AI:', prev);
      return [...prev, aiMessage];
    });
    setIsLoading(false);
    console.log('10. Loading set to false');
  };


  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Don't send if Enter is pressed while loading
    if (e.key === 'Enter' && !isLoading && inputText.trim()) {
      handleSendMessage();
    }
  };

  const handleSendPainLevel = async () => {
    const painMessage = `${tChat('painLevel')}: ${painLevel}/10`;
    setSliderOpen(false);
    await handleSendMessage(painMessage);
  };

  const handleBodyPartSelect = (bodyPart: string | null) => {
    setSelectedBodyPart(bodyPart);
  };

  const handleSendBodyPart = async () => {
    if (!selectedBodyPart) return;

    const bodyMessage = `${tChat('painLocation')}: ${selectedBodyPart}`;
    setBodyMapOpen(false);
    await handleSendMessage(bodyMessage);
  };

  const handleCancelPainSlider = () => {
    // Remove pain text from input field
    const painPattern = new RegExp(`\\s*\\|?\\s*${tChat('painLevel')}:\\s*\\d+/10\\s*\\|?\\s*`);
    setInputText(prev => prev.replace(painPattern, ''));
    setSliderOpen(false);
    setPainLevel(5);
  };

  const handleCancelBodyMap = () => {
    // Remove body location text from input field
    const locationPattern = new RegExp(`\\s*\\|?\\s*${tChat('painLocation')}:\\s*[^|.,!?]+\\s*\\|?\\s*`);
    setInputText(prev => prev.replace(locationPattern, ''));
    setBodyMapOpen(false);
    setSelectedBodyPart(null);
  };

  const loadHealthSummary = async () => {
  let id = sessionId;

  if (!id) {
    id = await createSession();
    setSessionId(id);
    console.log('[health] created session:', id);
  }

  const response = await getHealthSummary(id);
  console.log('[health] summary received');

  setHealthSummaryText(response.ai_summary);
};


  const resetConversation = async () => {
    if (sessionId) {
      await resetConversationRequest(sessionId);
      setMessages([]);
    }
  };

  const handleConfirmLogout = async () => {
    try {
      if (sessionId) {
        await resetConversationRequest(sessionId);
      }
      setSessionId(null);
      setMessages([]);
      setLogoutOpen(false);
      // Navigate to welcome/start page
      window.location.href = '/welcome';
    } catch (e) {
      console.error('Error ending session:', e);
      setLogoutOpen(false);
    }
  };


  // Main content container
  const renderTabContent = () => {
    return (
      <Box
        sx={{
          flex: 1, // This makes it fill remaining space
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0, // Important for proper scrolling
          overflow: 'auto', // Allow scroll everywhere

        }}
      >
        {activeTab === 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              minHeight: 0, // Important for scrolling
              overflow: 'hidden',

            }}
          >
            {/* Messages area */}
            <Container maxWidth={false} sx={{ flex: 1, display: 'flex', flexDirection: 'column', px: 0 }}>
              <Box               // Parent component
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  overflowX: 'hidden', // Prevent horizontal scrolling
                  padding: { xs: 1, sm: 2 },
                }}
              >
                <MessageList messages={messages} isLoading={isLoading} />
              <div ref={messagesEndRef} />
              </Box>
            </Container>

            {/* Input area */}
            <Box
              sx={{
                padding: {xs: 0.5, sm: 1},
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                flexShrink: 0, // Prevent input area from shrinking
                backgroundColor: theme => theme.palette.background.paper,
              }}
            >
              {/* Scrollable container for pain slider and body map */}
              <Box
                ref={scrollableContainerRef}
                sx={{
                  maxHeight: '55vh',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  display: sliderOpen || bodyMapOpen ? 'block' : 'none',
                }}
              >
                {/* Pain Level Slider - Collapsible */}
                <Collapse in={sliderOpen}>
                  <Box
                    sx={{
                      p: 2,
                      mb: 1,
                      borderRadius: 2,
                      backgroundColor: theme => theme.palette.background.default,
                      border: theme => `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <PainSlider
                      value={painLevel}
                      onChange={setPainLevel}
                      showLabels={true}
                      showValue={true}
                    />

                    <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
                      <Button
                        size="small"
                        onClick={handleCancelPainSlider}
                        sx={{ textTransform: 'none' }}
                      >
                        {tChat('cancel')}
                      </Button>
                      <Button
                        size="small"
                        onClick={handleSendPainLevel}
                      disabled={isLoading}
                        sx={{ textTransform: 'none' }}
                      >
                        {tChat('send')}
                      </Button>
                    </Stack>
                  </Box>
                </Collapse>

                {/* Body Map - Collapsible */}
                <Collapse in={bodyMapOpen}>
                  <Box
                    sx={{
                      p: 2,
                      mb: 1,
                      borderRadius: 2,
                      backgroundColor: theme => theme.palette.background.default,
                      border: theme => `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <BodyMap 
                      onBodyPartSelect={handleBodyPartSelect} 
                      highlightLocation={selectedBodyPart || undefined}
                    />

                    <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
                      <Button
                        size="small"
                        onClick={handleCancelBodyMap}
                        sx={{ textTransform: 'none' }}
                      >
                        {tChat('cancel')}
                      </Button>
                      <Button
                        size="small"
                        onClick={handleSendBodyPart}
                      disabled={isLoading || !selectedBodyPart}
                        sx={{ textTransform: 'none' }}
                      >
                        {tChat('send')}
                      </Button>
                    </Stack>
                  </Box>
                </Collapse>
              </Box>

              {/* Pain Level and Body Map Buttons - Above text field */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title={tChat('sendPainLevel')}>
                  <Button
                    onClick={() => {
                      setSliderOpen(!sliderOpen);
                    }}
                    startIcon={<PainIcon />}
                    variant={sliderOpen ? 'contained' : 'outlined'}
                    size="small"
                    sx={{ 
                      textTransform: 'none',
                      borderRadius: '20px',
                    }}
                  >
                    {tChat('painLevel')}
                  </Button>
                </Tooltip>
                
                <Tooltip title={tChat('selectBodyPart')}>
                  <Button
                    onClick={() => {
                      setBodyMapOpen(!bodyMapOpen);
                    }}
                    startIcon={<BodyIcon />}
                    variant={bodyMapOpen ? 'contained' : 'outlined'}
                    size="small"
                    sx={{ 
                      textTransform: 'none',
                      borderRadius: '20px',
                    }}
                  >
                    {tChat('bodyMap')}
                  </Button>
                </Tooltip>
              </Box>

              {/* Text Input and Send Button Row */}
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {/* Text Input */}
                <Box sx={{ flex: 1 }}>
                  <CustomTextField
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={tChat('typeMessage')}
                  />
                </Box>

                {/* Send Button */}
                <Tooltip title={tChat('sendMessage')}>
                  <IconButton
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim() || isLoading}
                    sx={{
                      borderRadius: '20px',
                      padding: {xs: '10px', sm: '12px' },
                      backgroundColor: theme => theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: theme => theme.palette.primary.main,
                        opacity: 0.9,
                      },
                    }}
                  >
                    <SendIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}/>
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        )}

        {activeTab === 1 && (
          <SymptomsPage sessionId={sessionId} />
        )}
        
        {activeTab === 2 && (
          <NavigationPage />
        )}

        {activeTab === 3 && ( // Settings Tab
          <Container maxWidth={false} sx={{ flex: 1, py: 2 }}>
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
            <List
            sx={{
              width: '100%',
              maxWidth: 600,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center', // centers all ListItems horizontally
              gap: 1,               // optional: space between items
              '& .MuiListItemText-primary': {
                fontSize: `${fontSize}px`,
              },
              '& .MuiMenuItem-root': {
                fontSize: `${fontSize}px`,
              },
            }}>

          {/* Language Selector */}
          <ListItem>
            <ListItemText primary={tSettings('language')} />
            <Select value={language} onChange={e => setLanguage(e.target.value)} sx={{ minWidth: 100 }}>
              <MenuItem value="de">{tSettings('german')}</MenuItem>
              <MenuItem value="en">{tSettings('english')}</MenuItem>
            </Select>
          </ListItem>

          {/* Font size slider */}
          <ListItem sx={{ width: '100%', flexDirection: 'column', alignItems: 'stretch' }}>
            <Box sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <ListItemText primary={tSettings('selectFontSize')} />
              </Box>
              <Box sx={{ px: 3, mt: 1 }}>
                <Slider
                  min={12}
                  max={20}
                  step={2}
                  marks={[
                    { value: 12, label: tSettings('verySmall') },
                    { value: 14, label: tSettings('small') },
                    { value: 16, label: tSettings('medium') },
                    { value: 18, label: tSettings('large') },
                    { value: 20, label: tSettings('veryLarge') }
                  ]}
                  value={fontSize}
                  onChange={(_, v) => setFontSize(Array.isArray(v) ? v[0] : v)}
                  sx={{ 
                    width: '100%',
                    mb: 2,
                    '& .MuiSlider-markLabel': {
                      fontSize: theme.typography.pxToRem(fontSize * 0.75),
                      whiteSpace: 'normal',
                      width: '60px',
                      textAlign: 'center',
                      color: theme.palette.primary.main
                    },
                    '& .MuiSlider-markLabelActive': {
                      color: theme.palette.primary.main
                    },
                    [`& .MuiSlider-markLabel[data-index="${(fontSize - 12) / 2}"]`]: {
                      color: theme.palette.text.primary
                    }
                  }}
                />
              </Box>
            </Box>
          </ListItem>


          {/* Dark Mode Toggle */}
          <ListItem>
            <ListItemText primary={tSettings('darkMode')} />
            <Switch checked={darkMode} onChange={toggleDarkMode} />
          </ListItem>
  

          {/* Test - Create Session */}
          <ListItem>
            <Button
              onClick={async () => {
                const newSessionId = await createSession();
                console.log ('Session created:', newSessionId);
                setSessionId(newSessionId);
              }}
            >
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Test - Create session" />
            </Button>
          </ListItem>

          {/* Test - Health Summary */}
          <ListItem>
            <Button onClick={loadHealthSummary}>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Test health summary" />
            </Button>
          </ListItem>

          {/* Test - Reset Conversation */}
          <ListItem>
            <Button onClick={resetConversation}>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Test Reset conversation" />
            </Button>
          </ListItem>

          {/* Profile */}
          <ListItem>
            <Button>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </Button>
          </ListItem>

          {/* Logout */}
          <ListItem>
            <Button onClick={() => setLogoutOpen(true)}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary={tSettings('logout')} />
            </Button>
          </ListItem>
        </List>
      
            </Box>
          </Container>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      
      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {/* AppBar */}
        <AppBar
          position="static"
          sx={{
            backgroundColor: theme => theme.palette.background.paper, // uses paper
            boxShadow: 'none',
            flexShrink: 0, // Prevent AppBar from shrinking
          }}
        >
          
          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            centered
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': { // when not selected
                color: theme => theme.palette.text.primary,
                minHeight: { xs: 56, sm: 64 },
                fontSize: `${fontSize}px`,
                padding: { xs: '6px 4px', sm: '12px 16px' },
                minWidth: { xs: 60, sm: 90 },
                transition: 'background-color 0.3s',
                '&:hover': {
                  backgroundColor: theme => theme.palette.action.hover,
                },
                '& .MuiTab-wrapper': {
                  whiteSpace: 'normal',
                  lineHeight: 1.2,
                },
              },
              '& .MuiTab-root.Mui-selected': { // when clicked
                color: theme => theme.palette.text.secondary,
              },
              '& .MuiTabs-indicator': { // bar under clicked - should be the same as clicked
                backgroundColor: theme => theme.palette.text.secondary,
                height: 3,
                borderRadius: 2,
              },
              '& .MuiSvgIcon-root': {
                fontSize: { xs: '1.2rem', sm: '1.5rem' },
              },
            }}
          >
            <Tab 
              icon={<ChatIcon />} 
              label={tTabs('chat')} 
              sx={{ 
                '& .MuiTab-iconWrapper': { mb: 0.5 },
                hyphens: 'auto',
              }} 
              lang="de" 
            />
            <Tab 
              icon={<PersonIcon />} 
              label={tTabs('info')} 
              sx={{ 
                '& .MuiTab-iconWrapper': { mb: 0.5 },
                hyphens: 'auto',
              }} 
              lang="de" 
            />
            <Tab 
              icon={<NavigationIcon />} 
              label={tTabs('navigation')} 
              sx={{ 
                '& .MuiTab-iconWrapper': { mb: 0.5 },
                hyphens: 'auto',
              }} 
              lang="de"
            />
            <Tab 
              icon={<SettingsIcon />} 
              label={tTabs('settings')} 
              sx={{ 
                '& .MuiTab-iconWrapper': { mb: 0.5 },
                hyphens: 'auto',
              }} 
              lang="de" 
            />
          </Tabs>
        </AppBar>

        {/* Tab Content */}
        {renderTabContent()}
      </Box>

      {/* Logout confirmation dialog */}
      <Dialog open={logoutOpen} onClose={() => setLogoutOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{tSettings('logout')}</DialogTitle>
        <DialogContent>
          <Box sx={{ fontSize: `${fontSize}px` }}>
            <div>{tSettings('logoutConfirmLine1')}</div>
            <div style={{ marginTop: 8 }}>{tSettings('logoutConfirmLine2')}</div>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutOpen(false)}>{tSettings('confirmCancel')}</Button>
          <Button color="error" variant="contained" onClick={handleConfirmLogout}>{tSettings('confirmYes')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

