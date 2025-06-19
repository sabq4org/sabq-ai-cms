'use client';

import { useEffect, useState, useCallback } from 'react';

export function useDarkMode() {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  // دالة تحديث الوضع الليلي
  const updateDarkMode = useCallback((isDark: boolean) => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    
    // تحديث meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark ? '#1f2937' : '#ffffff');
    }
    
    // فرض إعادة حساب الأنماط
    document.body.style.display = 'none';
    document.body.offsetHeight; // Force reflow
    document.body.style.display = '';
  }, []);

  useEffect(() => {
    setMounted(true);
    
    // التحقق من localStorage أولاً
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) {
      const isDark = JSON.parse(stored);
      setDarkMode(isDark);
      updateDarkMode(isDark);
    } else {
      // إذا لم يكن هناك تفضيل محفوظ، تحقق من تفضيل النظام
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
      updateDarkMode(prefersDark);
    }

    // الاستماع لتغييرات تفضيل النظام
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // فقط إذا لم يكن هناك تفضيل محفوظ
      if (localStorage.getItem('darkMode') === null) {
        setDarkMode(e.matches);
        updateDarkMode(e.matches);
      }
    };

    // الاستماع لتغييرات من tabs أخرى
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'darkMode' && e.newValue !== null) {
        const isDark = JSON.parse(e.newValue);
        setDarkMode(isDark);
        updateDarkMode(isDark);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [updateDarkMode]);

  const toggleDarkMode = useCallback(() => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    localStorage.setItem('darkMode', JSON.stringify(newValue));
    updateDarkMode(newValue);
    
    // فرض إعادة رسم الصفحة للتأكد من التحديث الفوري
    window.dispatchEvent(new Event('dark-mode-changed'));
    
    // بث الحدث لجميع المكونات
    const event = new CustomEvent('dark-mode-toggled', { detail: { darkMode: newValue } });
    window.dispatchEvent(event);
  }, [darkMode, updateDarkMode]);

  return { darkMode, toggleDarkMode, mounted };
} 