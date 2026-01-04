// components/ChatBubble.tsx
'use client';
import { Box, useTheme } from '@mui/material';
import React from 'react';

interface ChatBubbleProps {
  message: string;
  isMe: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isMe }) => {
  const theme = useTheme();


  return (
    <div
      style={{
        // REDUCED from 110px to 20-40px for less side padding
        padding: `0 ${isMe ? '4px' : '8px'} 0 ${isMe ? '8px' : '4px'}`,
        marginBottom: '12px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: isMe ? 'flex-end' : 'flex-start',
        }}
      >
        <div
          style={{
            backgroundColor: isMe ? theme.palette.chat.me : theme.palette.chat.llm,
            color: isMe ?  theme.palette.chat.textMe : theme.palette.chat.textLlm,
            padding: '12px',
            borderRadius: '15px',
            maxWidth: '80%',
            fontSize: '16px',
            lineHeight: '1.4',
            wordBreak: 'break-word', // Better text wrapping
          }}
        >
          {message}
        </div>
      </div>
    </div>
  );
};