'use client';

import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [darkMode, setDarkModeState] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // تحقق من الإعداد المحفوظ
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      const isDark = JSON.parse(saved);
      setDarkModeState(isDark);
      document.documentElement.classList.toggle('dark', isDark);
    } else {
      // تحقق من تفضيل النظام
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const isDark = mediaQuery.matches;
      setDarkModeState(isDark);
      document.documentElement.classList.toggle('dark', isDark);
    }
  }, []);

  // تجنب hydration mismatch
  if (!mounted) {
    return {
      darkMode: false,
      toggleDarkMode: () => {},
      setDarkMode: () => {}
    };
  }

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkModeState(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
    document.documentElement.classList.toggle('dark', newDarkMode);
  };

  const setDarkMode = (isDark: boolean) => {
    setDarkModeState(isDark);
    localStorage.setItem('darkMode', JSON.stringify(isDark));
    document.documentElement.classList.toggle('dark', isDark);
  };

  return {
    darkMode,
    toggleDarkMode,
    setDarkMode
  };
}

// للتوافق مع الكود القديم
export default useDarkMode;
