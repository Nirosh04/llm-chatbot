// components/ChatBubble.tsx
'use client';

import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import CompanionIcon from './CompanionIcon';

interface ChatBubbleProps {
  message: string;
  isMe: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isMe }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        px: 1,            // horizontal padding around the row
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
          <Box sx={{ mt: 1, flexShrink: 0 }}>
            <CompanionIcon width={45} height={45} />
          </Box>
        )}

        <Box
          sx={{
            bgcolor: isMe ? theme.palette.chat.me : theme.palette.chat.llm,
            color: isMe ? theme.palette.chat.textMe : theme.palette.chat.textLlm,
            p: 1.5,
            borderRadius: 2,
            maxWidth: '80%',
            wordBreak: 'break-word',
          }}
        >
          <Typography
            variant="body1"
            sx={{
              // optional: ensure it tracks theme scaling
              fontSize: 'inherit',
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
