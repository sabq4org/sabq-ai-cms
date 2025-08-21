'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { DarkModeProvider } from '@/contexts/DarkModeContext';
import { ThemeManagerProvider } from '@/contexts/ThemeManagerContext';
import FilteredToaster from '@/components/FilteredToaster';
import NextThemesProvider from './theme-provider'
import { UserProvider } from '@/contexts/UserContext'
import { QueryProvider } from './query-provider'
import { Toaster } from 'react-hot-toast'
import DarkModeInitializer from '@/components/DarkModeInitializer';
// import UserInteractionInitializer from '@/components/UserInteractionInitializer';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <DarkModeProvider>
        <ThemeManagerProvider>
          <AuthProvider>
            <DarkModeInitializer />
            {/* <UserInteractionInitializer /> */}
            {children}
            <FilteredToaster />
          </AuthProvider>
        </ThemeManagerProvider>
      </DarkModeProvider>
    </ThemeProvider>
  );
}
