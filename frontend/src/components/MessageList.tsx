// components/MessageList.tsx - Alternative version

'use client';

import React from 'react';
import { ChatBubble } from './ChatBubble';
import { LoadingDots } from './LoadingDots';
import { useTheme } from '@mui/material';


export interface Message {
  id: string | number;
  text: string;
  isMe: boolean;
}

export interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading = false,
}) => {
  const theme = useTheme();
  
  // Only render if there are messages or loading
  if (messages.length === 0 && !isLoading) {
    return null; // Return nothing, parent handles greeting
  }

  return (
    <>
      {messages.map((msg) => (
        <ChatBubble
          key={msg.id}
          message={msg.text}
          isMe={msg.isMe}
        />
      ))}
      
      {isLoading && (
        <div
          style={{
            padding: '0 110px 0 10px',
            marginBottom: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}> 
            <div   // this div wraps around loadingDots - this should be inside of loadingDots.tsx - not here
              style={{
                backgroundColor: theme.palette.loadingDots.bg,
                color: '#333',
                padding: '12px',
                borderRadius: '15px',
                maxWidth: '70%',
                fontSize: '16px',
                lineHeight: '1.4',
              }}
            >
              <LoadingDots />
            </div>
          </div>
        </div>
      )}
    </>
  );
};