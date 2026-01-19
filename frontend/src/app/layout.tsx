import './globals.css';
import { ReactNode } from 'react';
import { SettingsProvider } from '@/context/SettingsContext';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" style={{ height: 'auto', overflow: 'auto' }}>
      <body style={{ height: 'auto', overflow: 'auto', margin: 0 }}>
        <SettingsProvider>
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}
