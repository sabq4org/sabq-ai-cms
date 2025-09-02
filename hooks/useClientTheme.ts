'use client';

import { useState, useEffect } from 'react';

export function useClientTheme() {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // استخدام localStorage لتحديد الثيم
    const theme = localStorage.getItem('sabq-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(theme === 'dark' || (theme === null && systemPrefersDark));
  }, []);

  // دالة لتبديل الثيم
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('sabq-theme', newMode ? 'dark' : 'light');
    
    // تطبيق الثيم على الـ body
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // تطبيق الثيم عند التحميل
  useEffect(() => {
    if (mounted) {
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [darkMode, mounted]);

  return {
    darkMode,
    setDarkMode,
    toggleDarkMode,
    mounted
  };
}
