'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

export function useDarkMode() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // تجنب hydration mismatch
  if (!mounted) {
    return {
      darkMode: false,
      toggleDarkMode: () => {},
      setDarkMode: () => {}
    };
  }

  const currentTheme = theme === 'system' ? systemTheme : theme;
  const darkMode = currentTheme === 'dark';

  const toggleDarkMode = () => {
    setTheme(darkMode ? 'light' : 'dark');
  };

  const setDarkMode = (isDark: boolean) => {
    setTheme(isDark ? 'dark' : 'light');
  };

  return {
    darkMode,
    toggleDarkMode,
    setDarkMode
  };
}

// للتوافق مع الكود القديم
export default useDarkMode;
