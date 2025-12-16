'use client';


import React from 'react';
import Image from 'next/image';

import { colors } from "./../styles/colors";
import CompanionIcon from './../assets/CompanionIcon.png';

export const HomeGreeting: React.FC = () => {
  return (
    <div
      style={{
        height: '100vh',
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
        <Image
            src={CompanionIcon}
            alt="Lumee"
            width={120}
            height={120}
            style={{
              filter: 'invert(24%) sepia(89%) saturate(1582%) hue-rotate(316deg) brightness(96%) contrast(92%)',
              marginBottom: '24px',
            }}
          />
        <h1
          style={{
            fontSize: '36px',
            fontWeight: 600,
            color: colors.textColor,
            marginBottom: '16px',
          }}
        >
          Willkommen!
        </h1>
        <p
          style={{
            fontSize: '26px',
            fontWeight: 600,
            color: colors.textColor,
            marginBottom: '12px',
            lineHeight: '1.4',
          }}
        >
          Ich bin Lumee, Ihr digitaler Begleiter. Ich helfe Ihnen, die Wartezeit zu überbrücken.
        </p>
        <p
          style={{
            fontSize: '24px',
            color: colors.textColor,
            lineHeight: '1.4',
          }}
        >
          Wenn Sie möchten, stelle ich Ihnen ein paar kurze Fragen zu Ihrem befinden. 
          Dies hilft dem Personal, sich besser um Sie zu kümmern. Klicken Sie dazu einfach 
          unten auf "Chat beginnen"
        </p>
      </div>
    </div>
  );
};