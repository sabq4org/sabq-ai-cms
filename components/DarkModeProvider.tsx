'use client';

import { useEffect } from 'react';

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  // يتم تطبيق الوضع الليلي في useDarkMode hook
  // لا حاجة لتطبيقه هنا مرة أخرى
  
  useEffect(() => {
    // الاستماع لتغييرات الوضع الليلي لفرض إعادة الرسم
    const handleDarkModeChange = () => {
      // فرض إعادة رسم بشكل سلس باستخدام requestAnimationFrame
      requestAnimationFrame(() => {
        // تحديث أي متغيرات CSS مخصصة إذا لزم الأمر
        const isDark = document.documentElement.classList.contains('dark');
        document.documentElement.style.setProperty('--color-scheme', isDark ? 'dark' : 'light');
      });
    };

    window.addEventListener('dark-mode-changed', handleDarkModeChange);
    
    // تطبيق الإعدادات الأولية
    handleDarkModeChange();
    
    return () => window.removeEventListener('dark-mode-changed', handleDarkModeChange);
  }, []);

  return <>{children}</>;
} 