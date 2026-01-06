'use client';


import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import CompanionIcon from '@/components/CompanionIcon';

export const HomeGreeting: React.FC = () => {
  const t = useTranslations('homeGreeting');
  
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
          {t('welcome')}
        </h1>
        <p
          style={{
            fontSize: '26px',
            fontWeight: 600,
            marginBottom: '12px',
            lineHeight: '1.4',
          }}
        >
          {t('intro')}
        </p>
        <p
          style={{
            fontSize: '24px',
            lineHeight: '1.4',
          }}
        >
          {t('description')}
        </p>
      </div>
    </div>
  );
};