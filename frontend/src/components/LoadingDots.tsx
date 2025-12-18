'use client';

import { useTheme } from '@mui/material';
import React from 'react';

export const LoadingDots: React.FC = () => {
  const theme = useTheme();
  
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        backgroundColor: theme.palette.loadingDots.bg, 
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '8px',
        }}
      >
        {[1, 2, 3].map((dot) => (
          <div
            key={dot}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: theme.palette.loadingDots.dots,
              animation: `pulse 1.5s ease-in-out ${dot * 0.3}s infinite`,
            }}
          />
        ))}
      </div>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};