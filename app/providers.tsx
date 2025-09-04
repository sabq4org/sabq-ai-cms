'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { DarkModeProvider } from '@/contexts/DarkModeContext';
import FilteredToaster from '@/components/FilteredToaster';
import DarkModeInitializer from '@/components/DarkModeInitializer';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <DarkModeInitializer />
        {children}
        <FilteredToaster />
      </AuthProvider>
    </DarkModeProvider>
  );
}
