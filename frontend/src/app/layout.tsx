import './globals.css';
import { ReactNode } from 'react';
import { SettingsProvider } from '@/context/SettingsContext';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SettingsProvider>
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}
