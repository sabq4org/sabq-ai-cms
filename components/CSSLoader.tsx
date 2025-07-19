'use client';

import { useEffect } from 'react';

export function CSSLoader() {
  useEffect(() => {
    // تحميل CSS بشكل ديناميكي لتجنب تحذيرات preload
    const loadCSS = async () => {
      // قائمة ملفات CSS للتحميل
      const cssFiles = [
        '/styles/fix-layout.css',
        '/styles/dashboard-enhanced.css',
        '/styles/article-card.css'
      ];

      cssFiles.forEach((href) => {
        // تحقق من عدم وجود الرابط مسبقاً
        if (!document.querySelector(`link[href="${href}"]`)) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = href;
          link.media = 'all';
          
          // إضافة معالج للأخطاء لتجنب رسائل الخطأ
          link.onerror = () => {
            console.warn(`Failed to load CSS: ${href}`);
          };
          
          document.head.appendChild(link);
        }
      });
    };

    // تأخير قليل للسماح بتحميل الصفحة أولاً
    const timer = setTimeout(loadCSS, 10);
    
    return () => clearTimeout(timer);
  }, []);

  return null;
} 