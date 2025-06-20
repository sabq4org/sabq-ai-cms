'use client';

import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export function useDarkMode() {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  // دالة تحديث الوضع الليلي
  const updateDarkMode = useCallback((isDark: boolean) => {
    const root = document.documentElement;
    
    // تحديث الكلاسات مباشرة
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
    
    // فرض إعادة حساب الأنماط بطريقة أكثر فعالية
    // استخدام CSS transition لتجنب الوميض
    root.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    
    // تحديث CSS variables
    root.style.setProperty('--tw-bg-opacity', '1');
    
    // فرض إعادة الرسم
    void root.offsetHeight;
  }, []);

  useEffect(() => {
    setMounted(true);
    
    // منع الانتقالات عند التحميل الأولي
    document.documentElement.classList.add('no-transition');
    
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
    
    // إزالة منع الانتقالات بعد التحميل
    requestAnimationFrame(() => {
      document.documentElement.classList.remove('no-transition');
    });

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
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('dark-mode-changed'));
      
      // تحديث جميع العناصر التي تستخدم Tailwind classes
      document.querySelectorAll('*').forEach(el => {
        if (el instanceof HTMLElement) {
          const computedStyle = window.getComputedStyle(el);
          el.style.cssText = el.style.cssText; // Force style recalculation
        }
      });
    });
    
    // بث الحدث لجميع المكونات
    const event = new CustomEvent('dark-mode-toggled', { detail: { darkMode: newValue } });
    window.dispatchEvent(event);
    
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