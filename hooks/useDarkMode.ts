'use client';

import { useTheme } from '@/contexts/ThemeContext';

export function useDarkMode() {
  const { theme, toggleTheme } = useTheme();
  
  return {
    darkMode: theme === 'dark',
    toggleDarkMode: toggleTheme
  };
} 