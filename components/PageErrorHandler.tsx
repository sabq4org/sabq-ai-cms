'use client';

import React, { useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';

interface PageErrorHandlerProps {
  children: React.ReactNode;
  pageName: string;
}

const PageErrorHandler: React.FC<PageErrorHandlerProps> = ({
  children,
  pageName
}) => {
  const { showEditorError, showPerformanceWarning } = useNotifications();

  useEffect(() => {
    // مراقبة أداء الصفحة
    const startTime = performance.now();

    const checkPerformance = () => {
      const loadTime = performance.now() - startTime;
      if (loadTime > 3000) { // إذا استغرق التحميل أكثر من 3 ثوانٍ
        showPerformanceWarning(pageName, Math.round(loadTime));
      }
    };

    // فحص الأداء بعد تحميل الصفحة
    const timer = setTimeout(checkPerformance, 100);

    // معالج الأخطاء العام للصفحة
    const handleError = (event: ErrorEvent) => {
      showEditorError(
        new Error(event.message || 'خطأ غير معروف'),
        pageName,
        `${pageName}-${Date.now()}`
      );
    };

    // معالج أخطاء Promise غير المعالجة
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      showEditorError(
        new Error(`Promise Rejection: ${event.reason}`),
        pageName,
        `${pageName}-promise-${Date.now()}`
      );
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [pageName, showEditorError, showPerformanceWarning]);

  return <>{children}</>;
};

export default PageErrorHandler;