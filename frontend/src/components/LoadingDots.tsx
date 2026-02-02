'use client';

import { useTheme } from '@mui/material';
import React from 'react';
import { useSettings } from '@/context/SettingsContext';

export const LoadingDots: React.FC = () => {
  const theme = useTheme();
  const { fontSize } = useSettings();
  
  // Scale dots based on fontSize (default base is 16px)
  const scale = fontSize / 16;
  const dotSize = Math.round(8 * scale);
  const gap = Math.round(6 * scale);
  const padding = Math.round(5 * scale);
  
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: `${padding}px`,
        backgroundColor: theme.palette.loadingDots.bg, 
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: `${gap}px`,
        }}
      >
        {[1, 2, 3].map((dot) => (
          <div
            key={dot}
            style={{
              width: `${dotSize}px`,
              height: `${dotSize}px`,
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