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

// دوال مساعدة لتطبيق الوضع الليلي
function applyDarkModeToAllElements() {
  const selectors = [
    'main', 'header', 'nav', 'footer', 'aside', 'section', 'article',
    'div[class*="container"]', 'div[class*="wrapper"]', 'div[class*="layout"]',
    'div[class*="page"]', 'div[class*="content"]', 'div[class*="panel"]',
    'div[class*="dashboard"]', 'div[class*="admin"]'
  ];

  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(element => {
      element.classList.add('dark');
    });
  });
}

function removeDarkModeFromAllElements() {
  const selectors = [
    'main', 'header', 'nav', 'footer', 'aside', 'section', 'article',
    'div[class*="container"]', 'div[class*="wrapper"]', 'div[class*="layout"]',
    'div[class*="page"]', 'div[class*="content"]', 'div[class*="panel"]',
    'div[class*="dashboard"]', 'div[class*="admin"]'
  ];

  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(element => {
      element.classList.remove('dark');
    });
  });
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

      // التأكد من تطبيق الكلاس الصحيح
      if (resolved === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        // تطبيق على جميع العناصر الرئيسية
        applyDarkModeToAllElements();
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
        // إزالة من جميع العناصر
        removeDarkModeFromAllElements();
      }
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

        if (resolved === 'dark') {
          document.documentElement.classList.add('dark');
          document.body.classList.add('dark');
          applyDarkModeToAllElements();
        } else {
          document.documentElement.classList.remove('dark');
          document.body.classList.remove('dark');
          removeDarkModeFromAllElements();
        }
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
      const root = document.documentElement;

      if (resolvedTheme === 'dark') {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
        document.body.classList.add('dark');
        applyDarkModeToAllElements();
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
        document.body.classList.remove('dark');
        removeDarkModeFromAllElements();
      }

      // تحديث meta theme-color
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', resolvedTheme === 'dark' ? '#111827' : '#1e40af');
      }

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

      // تطبيق الكلاس فوراً
      if (resolved === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
        document.body.classList.add('dark');
        applyDarkModeToAllElements();
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
        document.body.classList.remove('dark');
        removeDarkModeFromAllElements();
      }

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

    // تطبيق الكلاس فوراً
    if (resolved === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
      document.body.classList.add('dark');
      applyDarkModeToAllElements();
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
      document.body.classList.remove('dark');
      removeDarkModeFromAllElements();
    }

    // تحديث meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', resolved === 'dark' ? '#111827' : '#1e40af');
    }

    // حفظ في localStorage
    try {
      localStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('خطأ في حفظ الثيم:', error);
    }
  }, [getResolvedTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, toggleTheme, setTheme, mounted }}>
      {mounted ? children : <div style={{ visibility: 'hidden' }}>{children}</div>}
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
