import './globals.css';
import { ReactNode } from 'react';
import { SettingsProvider } from '@/context/SettingsContext';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" style={{ height: 'auto', overflow: 'auto' }}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover" />
      </head>
      <body style={{ height: 'auto', overflow: 'auto', margin: 0 }}>
        <SettingsProvider>
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}
