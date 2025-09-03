'use client';

import { useEffect } from 'react';
import { getDarkModeObserver } from '@/lib/dark-mode-observer';

export default function DarkModeInitializer() {
  useEffect(() => {
    // تفعيل مراقب الوضع الليلي
    const observer = getDarkModeObserver();
    observer.activate();

    // تنظيف عند إلغاء التحميل
    return () => {
      observer.deactivate();
    };
  }, []);

  // لا يحتاج لإرجاع أي عناصر
  return null;
}
