'use client';


import React from 'react';
import Image from 'next/image';

import CompanionIcon from '@/components/CompanionIcon';

export const HomeGreeting: React.FC = () => {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 32px',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          maxWidth: '800px',
        }}
      >
        <CompanionIcon />
        <h1
          style={{
            fontSize: '36px',
            fontWeight: 600,
            marginBottom: '16px',
          }}
        >
          Willkommen!
        </h1>
        <p
          style={{
            fontSize: '26px',
            fontWeight: 600,
            marginBottom: '12px',
            lineHeight: '1.4',
          }}
        >
          Ich bin Lumee, Ihr digitaler Begleiter. Ich helfe Ihnen, die Wartezeit zu überbrücken.
        </p>
        <p
          style={{
            fontSize: '24px',
            lineHeight: '1.4',
          }}
        >
          Wenn Sie möchten, stelle ich Ihnen ein paar kurze Fragen zu Ihrem befinden. 
          Dies hilft dem Personal, sich besser um Sie zu kümmern. Benutzen Sie hierfür einfach die Textleiste unten
        </p>
      </div>
    </div>
  );
};