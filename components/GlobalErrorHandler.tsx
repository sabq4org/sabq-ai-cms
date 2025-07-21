'use client';

import React, { useEffect } from 'react';

const GlobalErrorHandler: React.FC = () => {
  useEffect(() => {
    // مراقبة أخطاء JavaScript العامة
    const handleError = (event: ErrorEvent) => {
      // فلترة الأخطاء التقنية في بيئة الإنتاج
      if (process.env.NODE_ENV === 'production') {
        const technicalErrors = [
          'can\'t access property "slice"',
          'is undefined',
          'is null',
          'Cannot read property',
          'Cannot read properties',
          'Unexpected token',
          'SyntaxError',
          'TypeError: can\'t access property',
          'ReferenceError',
          'webpack-internal'
        ];

        const isTechnicalError = technicalErrors.some(error => 
          event.message.includes(error)
        );

        if (isTechnicalError) {
          // تسجيل الخطأ فقط دون إزعاج المستخدم
          console.error('Technical error filtered:', event.error);
          event.preventDefault(); // منع عرض الخطأ في Console للمستخدم
          return false;
        }
      }

      // في بيئة التطوير، اعرض جميع الأخطاء
      if (process.env.NODE_ENV === 'development') {
        console.error('JavaScript Error:', event.error);
      }
    };

    // مراقبة أخطاء Promise غير المعالجة
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (process.env.NODE_ENV === 'production') {
        // فلترة أخطاء الشبكة والأخطاء التقنية
        if (event.reason?.message?.includes('fetch') || 
            event.reason?.message?.includes('undefined') ||
            event.reason?.message?.includes('slice')) {
          console.error('Promise rejection filtered:', event.reason);
          event.preventDefault();
          return false;
        }
      }

      if (process.env.NODE_ENV === 'development') {
        console.error('Unhandled Promise Rejection:', event.reason);
      }
    };

    // تسجيل المستمعين
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // تنظيف المستمعين عند إلغاء التحميل
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null; // لا نعرض أي شيء
};

export default GlobalErrorHandler;
