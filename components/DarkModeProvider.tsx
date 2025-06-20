'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useDarkMode } from '@/hooks/useDarkMode';

interface DarkModeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  mounted: boolean;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const darkModeData = useDarkMode();
  
  useEffect(() => {
    // الاستماع لتغييرات الوضع الليلي لفرض إعادة الرسم
    const handleDarkModeChange = () => {
      // فرض إعادة رسم بشكل سلس باستخدام requestAnimationFrame
      requestAnimationFrame(() => {
        // تحديث أي متغيرات CSS مخصصة إذا لزم الأمر
        const isDark = document.documentElement.classList.contains('dark');
        document.documentElement.style.setProperty('--color-scheme', isDark ? 'dark' : 'light');
        
        // فرض إعادة تحميل الأنماط
        document.body.style.display = 'none';
        document.body.offsetHeight; // Force reflow
        document.body.style.display = '';
      });
    };

    window.addEventListener('dark-mode-changed', handleDarkModeChange);
    
    // تطبيق الإعدادات الأولية
    handleDarkModeChange();
    
    return () => window.removeEventListener('dark-mode-changed', handleDarkModeChange);
  }, []);

  return (
    <DarkModeContext.Provider value={darkModeData}>
      <div key={darkModeData.darkMode ? 'dark' : 'light'} className="min-h-screen">
        {children}
      </div>
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