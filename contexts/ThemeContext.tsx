'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// تطبيق محسّن للوضع الليلي مع معالجة مبسطة
function applyThemeToDocument(isDark: boolean) {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  const body = document.body;

  console.log(`🌙 تطبيق الوضع ${isDark ? 'الليلي' : 'النهاري'}...`);

  // تطبيق أساسي على HTML/Body فقط
  if (isDark) {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
    body.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
    body.classList.remove('dark');
    root.style.colorScheme = 'light';
  }
  
  // تحديث meta theme-color
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', isDark ? '#0f172a' : '#ffffff');
  }

  console.log(`✅ تم تطبيق الوضع ${isDark ? 'الليلي' : 'النهاري'} بنجاح`);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [mounted, setMounted] = useState(false);

  // حساب الثيم الفعلي بناءً على التفضيل وإعدادات النظام
  const getResolvedTheme = useCallback((theme: Theme, systemPrefersDark: boolean): ResolvedTheme => {
    if (theme === 'system') {
      return systemPrefersDark ? 'dark' : 'light';
    }
    return theme as ResolvedTheme;
  }, []);

  // تحميل الثيم من localStorage عند التحميل
  useEffect(() => {
    setMounted(true);

    try {
      // ترحيل البيانات القديمة من StaticHeader
      const oldDarkMode = localStorage.getItem('darkMode');
      let savedTheme = localStorage.getItem('theme') as Theme | null;

      // إذا كان هناك إعداد قديم ولا يوجد إعداد جديد، قم بالترحيل
      if (oldDarkMode !== null && !savedTheme) {
        const wasOldDarkMode = JSON.parse(oldDarkMode);
        savedTheme = wasOldDarkMode ? 'dark' : 'light';
        localStorage.setItem('theme', savedTheme);
        localStorage.removeItem('darkMode'); // حذف الإعداد القديم
      }

      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

      // استخدام الثيم المحفوظ أو الافتراضي للنظام
      const initialTheme = savedTheme || 'system';
      setThemeState(initialTheme);

      // حساب الثيم الفعلي
      const resolved = getResolvedTheme(initialTheme, systemPrefersDark);
      setResolvedTheme(resolved);

      // التأكد من تطبيق الثيم الصحيح
      applyThemeToDocument(resolved === 'dark');
    } catch (error) {
      console.error('خطأ في تحميل إعدادات الثيم:', error);
    }
  }, [getResolvedTheme]);

  // الاستماع لتغييرات تفضيل النظام
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        const resolved = e.matches ? 'dark' : 'light';
        setResolvedTheme(resolved);
        applyThemeToDocument(resolved === 'dark');
      }
    };

    // دعم المتصفحات القديمة
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [theme, mounted]);

  // تطبيق الثيم على document
  useEffect(() => {
    if (!mounted) return;

    try {
      const isDarkTheme = resolvedTheme === 'dark';
      applyThemeToDocument(isDarkTheme);

      // حفظ في localStorage
      localStorage.setItem('theme', theme);
    } catch (error) {
      console.error('خطأ في تطبيق الثيم:', error);
    }
  }, [theme, resolvedTheme, mounted]);

  const toggleTheme = useCallback(() => {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    setThemeState(prev => {
      // دورة: light -> dark -> system -> light
      let newTheme: Theme;
      if (prev === 'light') newTheme = 'dark';
      else if (prev === 'dark') newTheme = 'system';
      else newTheme = 'light';

      // تطبيق التغيير فوراً
      const resolved = getResolvedTheme(newTheme, systemPrefersDark);
      setResolvedTheme(resolved);

      // تطبيق الثيم فوراً
      applyThemeToDocument(resolved === 'dark');

      // حفظ في localStorage
      try {
        localStorage.setItem('theme', newTheme);
      } catch (error) {
        console.error('خطأ في حفظ الثيم:', error);
      }

      return newTheme;
    });
  }, [getResolvedTheme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);

    // حساب وتطبيق الثيم الفعلي فوراً
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolved = getResolvedTheme(newTheme, systemPrefersDark);
    setResolvedTheme(resolved);

    // تطبيق الثيم فوراً
    applyThemeToDocument(resolved === 'dark');

    // حفظ في localStorage
    try {
      localStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('خطأ في حفظ الثيم:', error);
    }
  }, [getResolvedTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, toggleTheme, setTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // إرجاع قيم افتراضية آمنة
    return {
      theme: 'light' as Theme,
      resolvedTheme: 'light' as ResolvedTheme,
      toggleTheme: () => {
        console.warn('toggleTheme: ThemeProvider not available');
      },
      setTheme: (theme: Theme) => {
        console.warn('setTheme: ThemeProvider not available');
      },
      mounted: false
    };
  }
  return context;
}
