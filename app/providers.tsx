'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { DarkModeProvider } from '@/contexts/DarkModeContext';
import { ThemeManagerProvider } from '@/contexts/ThemeManagerContext';
import FilteredToaster from '@/components/FilteredToaster';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <DarkModeProvider>
        <ThemeManagerProvider>
          <AuthProvider>
            {children}
            <FilteredToaster />
          </AuthProvider>
        </ThemeManagerProvider>
      </DarkModeProvider>
    </ThemeProvider>
  );
}
