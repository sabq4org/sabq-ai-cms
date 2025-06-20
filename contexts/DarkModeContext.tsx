'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useDarkMode } from '@/hooks/useDarkMode';

interface DarkModeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  mounted: boolean;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const darkModeData = useDarkMode();

  return (
    <DarkModeContext.Provider value={darkModeData}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkModeContext() {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkModeContext must be used within a DarkModeProvider');
  }
  return context;
} 