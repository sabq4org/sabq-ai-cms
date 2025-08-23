'use client';

import { useEffect } from 'react';

export const useThemeEnforcer = (darkMode: boolean, mounted: boolean) => {
  useEffect(() => {
    if (!mounted) return;

    const enforceTheme = () => {
      const html = document.documentElement;
      const body = document.body;

      // تطبيق على العقدة الجذر
      if (darkMode) {
        html.classList.add('dark');
        html.setAttribute('data-theme', 'dark');
        body.classList.add('dark');
        body.setAttribute('data-theme', 'dark');
        
        // تطبيق style مباشر للضمان
        html.style.backgroundColor = '#0f172a';
        html.style.color = '#f8fafc';
        body.style.backgroundColor = '#0f172a';
        body.style.color = '#f8fafc';
      } else {
        html.classList.remove('dark');
        html.setAttribute('data-theme', 'light');
        body.classList.remove('dark');
        body.setAttribute('data-theme', 'light');
        
        // إزالة التطبيق المباشر
        html.style.backgroundColor = '';
        html.style.color = '';
        body.style.backgroundColor = '';
        body.style.color = '';
      }

      // البحث عن جميع العناصر وتطبيق الكلاس
      const allElements = document.querySelectorAll('*');
      allElements.forEach(element => {
        if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') return;
        
        if (darkMode) {
          element.classList.add('dark');
        } else {
          element.classList.remove('dark');
        }
      });
    };

    // تطبيق فوري
    enforceTheme();

    // تطبيق متأخر للضمان
    setTimeout(enforceTheme, 100);

    // مراقب للتغييرات
    const observer = new MutationObserver((mutations) => {
      let needsUpdate = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) { // Element node
              needsUpdate = true;
            }
          });
        }
      });
      
      if (needsUpdate) {
        setTimeout(enforceTheme, 50);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false
    });

    return () => {
      observer.disconnect();
    };
  }, [darkMode, mounted]);
};

export default useThemeEnforcer;
