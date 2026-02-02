// app/tabMain/page.tsx - Main page w tabs

"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from "next/navigation";
import {
  AppBar,
  Switch,
  Select,
  MenuItem,
  List,
  ListItem,
  Button,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tab,
  Tabs,
  Box,
  Container,
  Tooltip,
} from '@mui/material';

import SickIcon from '@mui/icons-material/Sick';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import ChatIcon from '@mui/icons-material/Chat';
import InfoIcon from '@mui/icons-material/Info';
import SendIcon from '@mui/icons-material/Send';
import NavigationIcon from '@mui/icons-material/Navigation';

//import { ChatBubble } from './components/ChatBubble';
import { MessageList } from './../../components/MessageList';
import { HomeGreeting } from './../../components/HomeGreeting';
import { CustomTextField } from './../../components/CustomTextField';
import { InfoTabNoInfo } from './../../components/InfoTabNoInfo';
import {
  getSignalCheck,
  createSession,
  dummyGetLLMResponseFromServer,
  getLLMResponseFromServer,
  getHealthSummary,
  resetConversationRequest
} from './../../services/serverRequests';
import SymptomsPage from '@/app/symptoms/page'; // adjust the path if needed
import { useSettings } from '@/context/SettingsContext';


interface ChatMessage {
  id: string;
  text: string;
  isMe: boolean;
}


export default function TabMain() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [healthSummaryText, setHealthSummaryText] = useState(
    "No Health summary was requested yet"
  );

  const router = useRouter();
  const { darkMode, toggleDarkMode, language, setLanguage } = useSettings();



  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    console.log('1. handleSendMessage called');

    if (!inputText.trim() || isLoading) {
      console.log('2. Early return - input empty or loading');
      return;
    }

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isMe: true,
    };

    console.log('3. Adding user message:', newMessage.text);
    setMessages(prev => [...prev, newMessage]);
    setInputText('');
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


  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Don't send if Enter is pressed while loading
    if (e.key === 'Enter' && !isLoading && inputText.trim()) {
      handleSendMessage();
    }
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


  // Main content container - FIXED: Consistent height
  const renderTabContent = () => {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          overflow: 'hidden',
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
            <Box               // Parent component
              sx={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden', // Prevent horizontal scrolling
                padding: 2,
              }}
            >
              {messages.length === 0 && !isLoading ? (
                <HomeGreeting />
              ) : (
                <>
                  <MessageList messages={messages} isLoading={isLoading} />
                  <div ref={messagesEndRef} />
                </>
              )}
            </Box>

            {/* Input area */}
            <Box
              sx={{
                padding: 2,
                display: 'flex',
                gap: 1,
                alignItems: 'center',
                flexShrink: 0, // Prevent input area from shrinking
                backgroundColor: theme => theme.palette.background.paper,

              }}
            >
              <Box sx={{
                flex: 1,
              }}>
                <CustomTextField
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                />
              </Box>
              <Tooltip title="Send message">
                <IconButton
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  sx={{
                    borderRadius: '20px',
                    padding: '12px',
                    backgroundColor: theme => theme.palette.primary.main,

                    '&:hover': {
                      backgroundColor: theme => theme.palette.primary.main,
                      opacity: 0.9,
                    },
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        )}

        {activeTab === 1 && (
          <SymptomsPage sessionId={sessionId} />
        )}


        {activeTab === 2 && ( // Settings Tab
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              //backgroundColor: colors.backgroundColor,
              //color: colors.textColor,
            }}
          >
            <List
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center', // centers all ListItems horizontally
                gap: 1,               // optional: space between items
              }}>

              {/* Language Selector */}
              <ListItem>
                <ListItemText primary="Language" />
                <Select value={language} onChange={e => setLanguage(e.target.value)} sx={{ minWidth: 100 }}>
                  <MenuItem value="DE">Deutsch</MenuItem>
                  <MenuItem value="EN">English</MenuItem>
                </Select>
              </ListItem>

              {/* Dark Mode Toggle */}
              <ListItem>
                <ListItemText primary="Dark Mode" />
                <Switch checked={darkMode} onChange={toggleDarkMode} />
              </ListItem>


              {/* Test - Create Session */}
              <ListItem>
                <Button
                  onClick={async () => {
                    const newSessionId = await createSession();
                    console.log('Session created:', newSessionId);
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
                <Button>
                  <ListItemIcon>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </Button>
              </ListItem>
            </List>

          </Box>
        )}

        {activeTab === 3 && ( // NEW: Navigation Tab
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <iframe
              title="Navigation"
              src="/navigation"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                borderRadius: '8px',
              }}
              sandbox="allow-scripts allow-same-origin allow-forms"
              allow="clipboard-read; clipboard-write; geolocation; microphone; camera"
            />
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <AppBar
          position="static"
          sx={{
            backgroundColor: theme => theme.palette.background.paper,
            boxShadow: 'none',
            flexShrink: 0,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            centered
            sx={{
              '& .MuiTab-root': {
                color: theme => theme.palette.text.primary,
                minHeight: 56,
              },
              '& .MuiTab-root.Mui-selected': {
                color: theme => theme.palette.text.secondary,
              },
              '& .MuiTabs-indicator': {
                backgroundColor: theme => theme.palette.text.secondary,
                height: 3,
                borderRadius: 2,
              },
            }}
          >
            <Tab icon={<ChatIcon />} label="CHAT" />
            <Tab icon={<SickIcon />} label="INFO" />
            <Tab icon={<SettingsIcon />} label="SETTINGS" />
            <Tab icon={<NavigationIcon />} label="NAVIGATION" />
          </Tabs>
        </AppBar>

        {renderTabContent()}
      </Box>
    </Box>
  );
};

