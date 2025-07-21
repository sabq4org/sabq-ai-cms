'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { DarkModeProvider } from '@/contexts/DarkModeContext';
import FilteredToaster from '@/components/FilteredToaster';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <DarkModeProvider>
        <AuthProvider>
          {children}
          <FilteredToaster />
        </AuthProvider>
      </DarkModeProvider>
    </ThemeProvider>
  );
}
