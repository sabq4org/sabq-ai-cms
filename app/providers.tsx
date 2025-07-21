'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { DarkModeProvider } from '@/contexts/DarkModeContext';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <DarkModeProvider>
        <AuthProvider>
          {children}
          <Toaster 
            position="top-center"
            reverseOrder={false}
            toastOptions={{
              duration: 4000,
              style: {
                direction: 'rtl',
                fontFamily: 'var(--font-ibm-plex-arabic), Arial, sans-serif',
              },
            }}
          />
        </AuthProvider>
      </DarkModeProvider>
    </ThemeProvider>
  );
}
