// components/ChatBubble.tsx
'use client';

import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import CompanionIcon from './CompanionIcon';
import { useSettings } from '@/context/SettingsContext';

interface ChatBubbleProps {
  message: string;
  isMe: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isMe }) => {
  const theme = useTheme();
  const { fontSize } = useSettings();
  
  console.log('ChatBubble fontSize:', fontSize);

  return (
    <Box
      sx={{
        px: 0,
        mb: 1.5,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: isMe ? 'flex-end' : 'flex-start',
          alignItems: 'flex-start',
          gap: 1,
        }}
      >
        {!isMe && (
          <Box 
            sx={{ 
              mt: 1, 
              flexShrink: 0, 
              width: { xs: 30, sm: 45 }, 
              height: { xs: 30, sm: 45 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '& > *': {
                width: '100%',
                height: '100%',
              }
            }}
          >
            <CompanionIcon width={45} height={45} />
          </Box>
        )}

        <Box
          sx={{
            bgcolor: isMe ? theme.palette.chat.me : theme.palette.chat.llm,
            color: isMe ? theme.palette.chat.textMe : theme.palette.chat.textLlm,
            p: { xs: 1.25, sm: 1.5 },
            borderRadius: 2,
            maxWidth: { xs: '90%', sm: 'calc(100% - 72px)' },
            wordBreak: 'break-word',
          }}
        >
          <Typography
            variant="body1"
            sx={{
              fontSize: `${fontSize}px`,
              lineHeight: 1.4,
              whiteSpace: 'pre-wrap', // keeps line breaks if your messages have them
            }}
          >
            {message}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
