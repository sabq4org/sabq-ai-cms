'use client';

import React, { createContext, useContext } from 'react';

interface DarkModeContextType {
  darkMode: boolean;
}

const DarkModeContext = createContext<DarkModeContextType>({
  darkMode: false
});

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  return (
    <DarkModeContext.Provider value={{ darkMode: false }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkModeContext() {
  return useContext(DarkModeContext);
} 