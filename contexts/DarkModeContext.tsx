'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DarkModeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

interface DarkModeProviderProps {
  children: ReactNode;
}

export function DarkModeProvider({ children }: DarkModeProviderProps) {
  const [darkMode, setDarkModeState] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // تحميل الإعداد المحفوظ أو إعداد النظام
    try {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      const shouldBeDark = savedTheme === 'dark' || (savedTheme !== 'light' && prefersDark);
      setDarkModeState(shouldBeDark);
      
      // تطبيق الثيم فوراً
      document.documentElement.classList.toggle('dark', shouldBeDark);
    } catch (error) {
      // في حالة الـ SSR، تجاهل الخطأ واستخدم القيمة الافتراضية
      console.log('Dark mode context: SSR detected, using default theme');
    }
  }, []);

  const setDarkMode = (isDark: boolean) => {
    setDarkModeState(isDark);
    
    // تأكد من وجود localStorage قبل الاستخدام
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
    
    // تأكد من وجود document قبل الاستخدام
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', isDark);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // تجنب hydration mismatch
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode, setDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkModeContext() {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkModeContext must be used within a DarkModeProvider');
  }
  return context;
}

// تصدير إضافي للتوافق
export { DarkModeProvider as default };
