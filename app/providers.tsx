'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { DarkModeProvider } from '@/contexts/DarkModeContext';
import FilteredToaster from '@/components/FilteredToaster';
import DarkModeInitializer from '@/components/DarkModeInitializer';
import { ThemeProvider } from '@/contexts/ThemeContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <ThemeProvider>
          <DarkModeInitializer />
          {children}
          <FilteredToaster />
        </ThemeProvider>
      </AuthProvider>
    </DarkModeProvider>
  );
}
