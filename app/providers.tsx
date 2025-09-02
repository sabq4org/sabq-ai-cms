'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import FilteredToaster from '@/components/FilteredToaster';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <FilteredToaster />
    </AuthProvider>
  );
}
