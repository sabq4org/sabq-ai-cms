'use client';

import React, { createContext, useContext } from 'react';
// ThemeContext removed for performance

interface DarkModeContextType {
  darkMode: boolean;
  mounted: boolean;
  toggleDarkMode: () => void;
}

const DarkModeContext = createContext<DarkModeContextType>({
  darkMode: false,
  mounted: false,
  toggleDarkMode: () => {}
});

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);
  
  const toggleDarkMode = React.useCallback(() => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);
  
  return (
    <DarkModeContext.Provider value={{ 
      darkMode, 
      mounted,
      toggleDarkMode 
    }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkModeContext() {
  return useContext(DarkModeContext);
} 

// Force rebuild - 2025-01-04 