'use client';

import { useEffect } from 'react';

export const useThemeEnforcer = (darkMode: boolean, mounted: boolean) => {
  useEffect(() => {
    if (!mounted) return;

    const enforceTheme = () => {
      const html = document.documentElement;
      const body = document.body;

      console.log(`🛡️ إنفاذ الوضع ${darkMode ? 'الليلي' : 'النهاري'} على جميع العناصر...`);

      // تطبيق على العقدة الجذر
      if (darkMode) {
        html.classList.add('dark');
        html.setAttribute('data-theme', 'dark');
        html.setAttribute('data-mode', 'dark');
        body.classList.add('dark');
        body.setAttribute('data-theme', 'dark');
        
        // CSS Variables شاملة
        html.style.setProperty('--bg-main', '#0f172a');
        html.style.setProperty('--bg-elevated', '#1e293b');
        html.style.setProperty('--text-primary', '#f8fafc');
        html.style.setProperty('--text-secondary', '#cbd5e1');
        html.style.setProperty('--color-bg-base', '#0f172a');
        html.style.setProperty('--color-text-primary', '#f8fafc');
        
        // تطبيق مباشر للضمان
        html.style.backgroundColor = '#0f172a';
        html.style.color = '#f8fafc';
        body.style.backgroundColor = '#0f172a';
        body.style.color = '#f8fafc';
      } else {
        html.classList.remove('dark');
        html.setAttribute('data-theme', 'light');
        html.setAttribute('data-mode', 'light');
        body.classList.remove('dark');
        body.setAttribute('data-theme', 'light');
        
        // CSS Variables للوضع الفاتح
        html.style.setProperty('--bg-main', '#ffffff');
        html.style.setProperty('--bg-elevated', '#f8fafc');
        html.style.setProperty('--text-primary', '#0f172a');
        html.style.setProperty('--text-secondary', '#475569');
        html.style.setProperty('--color-bg-base', '#ffffff');
        html.style.setProperty('--color-text-primary', '#0f172a');
        
        // إزالة التطبيق المباشر
        html.style.backgroundColor = '';
        html.style.color = '';
        body.style.backgroundColor = '';
        body.style.color = '';
      }

      // البحث عن جميع العناصر الموجودة وتطبيق الكلاس
      const allElements = document.querySelectorAll('*:not(script):not(style):not(link):not(meta)');
      allElements.forEach((element, index) => {
        if (!element.tagName || ['SCRIPT', 'STYLE', 'LINK', 'META', 'TITLE', 'HEAD'].includes(element.tagName)) return;
        
        if (darkMode) {
          element.classList.add('dark');
        } else {
          element.classList.remove('dark');
        }
      });

      console.log(`✅ تم إنفاذ الوضع ${darkMode ? 'الليلي' : 'النهاري'} على ${allElements.length} عنصر`);
    };

    // تطبيق فوري
    enforceTheme();

    // تطبيق متأخر للضمان
    setTimeout(enforceTheme, 50);
    setTimeout(enforceTheme, 200);

    // مراقب للتغييرات الجديدة
    let timeoutId: NodeJS.Timeout;
    const observer = new MutationObserver((mutations) => {
      let needsUpdate = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) { // Element node
              const element = node as Element;
              if (element.tagName && !['SCRIPT', 'STYLE', 'LINK', 'META'].includes(element.tagName)) {
                needsUpdate = true;
              }
            }
          });
        }
      });
      
      if (needsUpdate) {
        // تجميع التحديثات لتجنب التطبيق المتكرر
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          // تطبيق الكلاس على العناصر الجديدة فقط
          const newElements = document.querySelectorAll(darkMode ? '*:not(.dark)' : '.dark');
          newElements.forEach(element => {
            if (!element.tagName || ['SCRIPT', 'STYLE', 'LINK', 'META', 'HTML', 'BODY'].includes(element.tagName)) return;
            
            if (darkMode) {
              element.classList.add('dark');
            } else {
              element.classList.remove('dark');
            }
          });
        }, 10);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false
    });

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [darkMode, mounted]);
};

export default useThemeEnforcer;
