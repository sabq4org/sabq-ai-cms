'use client';

import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export function useDarkMode() {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  // دالة تحديث الوضع الليلي المحسنة
  const updateDarkMode = useCallback((isDark: boolean) => {
    const root = document.documentElement;
    
    // تطبيق التغيير فوراً على المستند
    if (isDark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
      // تحديث متغيرات CSS مباشرة
      root.style.setProperty('--tw-bg-opacity', '1');
      root.style.setProperty('--tw-text-opacity', '1');
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
      // تحديث متغيرات CSS مباشرة
      root.style.setProperty('--tw-bg-opacity', '1');
      root.style.setProperty('--tw-text-opacity', '1');
    }
    
    // تحديث meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark ? '#1f2937' : '#ffffff');
    }
    
    // فرض إعادة حساب جميع الأنماط فوراً
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      if (element instanceof HTMLElement) {
        // فرض إعادة حساب الأنماط
        element.offsetHeight;
      }
    });
    
    // إرسال حدث تغيير الثيم
    window.dispatchEvent(new CustomEvent('theme-changed', { 
      detail: { isDark } 
    }));
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
    
    // تحديث الحالة فوراً
    setDarkMode(newValue);
    
    // حفظ في localStorage فوراً
    localStorage.setItem('darkMode', JSON.stringify(newValue));
    
    // تطبيق التغيير فوراً
    updateDarkMode(newValue);
    
    // إظهار رسالة toast
    toast.success(
      newValue ? '🌙 تم التبديل إلى الوضع الليلي' : '☀️ تم التبديل إلى الوضع النهاري',
      {
        duration: 2000,
        position: 'bottom-center',
        style: {
          background: newValue ? '#1f2937' : '#ffffff',
          color: newValue ? '#ffffff' : '#1f2937',
          border: `1px solid ${newValue ? '#374151' : '#e5e7eb'}`,
        },
      }
    );
  }, [darkMode, updateDarkMode]);

  return { darkMode, toggleDarkMode, mounted };
} 