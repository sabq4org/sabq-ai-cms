'use client';

import React, { createContext, useContext } from 'react';
import { useTheme } from './ThemeContext';

interface DarkModeContextType {
  darkMode: boolean;
  mounted: boolean;
  toggleDarkMode: () => void;
}

const DarkModeContext = createContext<DarkModeContextType>({
  darkMode: false,
  mounted: true,
  toggleDarkMode: () => {}
});

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <DarkModeContext.Provider value={{ 
      darkMode: theme === 'dark', 
      mounted: true,
      toggleDarkMode: toggleTheme 
    }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkModeContext() {
  return useContext(DarkModeContext);
} 