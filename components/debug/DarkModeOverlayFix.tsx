'use client';

import { useEffect } from 'react';

export default function DarkModeOverlayFix() {

  useEffect(() => {
    if (!mounted) return;

    // فحص وإزالة أي طبقات سوداء غير مرغوبة
    const removeBlackOverlays = () => {
      // البحث عن عناصر بخلفية سوداء مباشرة
      const blackElements = document.querySelectorAll(
        '[style*="background-color: #000"],' +
        '[style*="background-color:#000"],' +
        '[style*="background-color: rgb(0,0,0)"],' +
        '[style*="background-color:rgb(0,0,0)"],' +
        '[style*="background: #000"],' +
        '[style*="background:#000"]'
      );

      blackElements.forEach(element => {
        if (element instanceof HTMLElement) {
          console.log('🔧 إزالة خلفية سوداء مباشرة من عنصر:', element.tagName);
          element.style.removeProperty('background-color');
          element.style.removeProperty('background');
        }
      });

      // البحث عن عناصر overlay أو backdrop
      const overlayElements = document.querySelectorAll(
        '.overlay,' +
        '.backdrop,' +
        '[class*="overlay"],' +
        '[class*="backdrop"]'
      );

      overlayElements.forEach(element => {
        const computedStyle = getComputedStyle(element);
        if (computedStyle.backgroundColor === 'rgb(0, 0, 0)' || 
            computedStyle.backgroundColor === 'rgba(0, 0, 0, 1)') {
          console.log('🔧 إزالة overlay أسود:', element.className);
          if (element instanceof HTMLElement) {
            element.style.display = 'none';
          }
        }
      });

      // إزالة أي عنصر position:fixed بخلفية سوداء
      const fixedElements = document.querySelectorAll('[style*="position: fixed"], [style*="position:fixed"]');
      fixedElements.forEach(element => {
        const computedStyle = getComputedStyle(element);
        if ((computedStyle.backgroundColor === 'rgb(0, 0, 0)' || 
             computedStyle.backgroundColor === 'rgba(0, 0, 0, 1)') &&
            computedStyle.zIndex !== 'auto') {
          console.log('🔧 إخفاء عنصر fixed أسود:', element.tagName);
          if (element instanceof HTMLElement) {
            element.style.display = 'none';
          }
        }
      });
    };

    // تطبيق فوري
    removeBlackOverlays();

    // تطبيق بعد تأخير قصير للتأكد
    const timeoutId = setTimeout(removeBlackOverlays, 100);

    // مراقب للعناصر الجديدة
    const observer = new MutationObserver(() => {
      removeBlackOverlays();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [darkMode, mounted]);

  return null;
}
