'use client';


import React from 'react';

export const InfoTabNoInfo: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        padding: '20px',
      }}
    >
      <p style={{ textAlign: 'center', fontSize: '16px' }}>
        Information for the creation of a health summary is missing
      </p>
    </div>
  );
};