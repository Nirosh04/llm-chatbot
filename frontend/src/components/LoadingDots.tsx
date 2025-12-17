'use client';


import React from 'react';

export const LoadingDots: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
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
              //backgroundColor: colors.fabColor,
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