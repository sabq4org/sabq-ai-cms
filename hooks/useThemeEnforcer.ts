'use client';

import { useEffect } from 'react';

export const useThemeEnforcer = (darkMode: boolean, mounted: boolean) => {
  useEffect(() => {
    if (!mounted) return;

    const enforceTheme = () => {
      const html = document.documentElement;
      const body = document.body;

      console.log(`🌙 تطبيق الوضع ${darkMode ? 'الليلي' : 'النهاري'} (مبسط)...`);

      // تطبيق أساسي على العقدة الجذر فقط - بدون تطبيق مباشر للخلفية
      if (darkMode) {
        html.classList.add('dark');
        html.setAttribute('data-theme', 'dark');
        body.classList.add('dark');
        html.style.colorScheme = 'dark';
      } else {
        html.classList.remove('dark');
        html.setAttribute('data-theme', 'light');
        body.classList.remove('dark');
        html.style.colorScheme = 'light';
      }

      // إزالة أي تطبيق مباشر للخلفية من التطبيقات السابقة
      html.style.removeProperty('background-color');
      html.style.removeProperty('color');
      body.style.removeProperty('background-color');
      body.style.removeProperty('color');

      console.log(`✅ تم تطبيق الوضع ${darkMode ? 'الليلي' : 'النهاري'} على HTML/Body فقط`);
    };

    // تطبيق فوري واحد فقط
    enforceTheme();

    // تطبيق واحد بعد تحميل المحتوى
    const timeoutId = setTimeout(enforceTheme, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [darkMode, mounted]);
};

export default useThemeEnforcer;
