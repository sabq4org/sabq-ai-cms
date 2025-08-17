'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

const ErrorTestComponent: React.FC = () => {
  const [hasError, setHasError] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // مراقبة الأخطاء في الكونسول
    const originalError = console.error;
    console.error = (...args: any[]) => {
      const message = args.join(' ');
      
      // فحص إذا كان خطأ React Server Components
      if (message.includes('options.factory') || 
          message.includes('react-server-dom-webpack') ||
          message.includes('performUnitOfWork')) {
        setHasError(true);
        setErrorCount(prev => prev + 1);
        setIsVisible(true);
        
        // إخفاء التنبيه بعد 5 ثوانٍ
        setTimeout(() => {
          setIsVisible(false);
        }, 5000);
      }
      
      originalError.apply(console, args);
    };

    // فحص إذا كان هناك أخطاء محفوظة
    const savedErrors = sessionStorage.getItem('rsc_errors');
    if (savedErrors) {
      const errors = JSON.parse(savedErrors);
      if (errors.length > 0) {
        setHasError(true);
        setErrorCount(errors.length);
      }
    }

    // عرض الحالة في وضع التطوير
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        setIsVisible(true);
      }, 2000);
    }

    return () => {
      console.error = originalError;
    };
  }, []);

  const handleRefresh = () => {
    sessionStorage.removeItem('rsc_errors');
    sessionStorage.removeItem('rsc_fix_applied');
    window.location.reload();
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  // عدم عرض أي شيء في الإنتاج إذا لم تكن هناك أخطاء
  if (process.env.NODE_ENV === 'production' && !hasError) {
    return null;
  }

  return (
    <>
      {isVisible && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md">
          <div className={`p-4 rounded-lg shadow-lg border ${
            hasError 
              ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' 
              : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {hasError ? (
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                )}
                <h3 className={`font-semibold ${
                  hasError 
                    ? 'text-yellow-800 dark:text-yellow-200' 
                    : 'text-green-800 dark:text-green-200'
                }`}>
                  {hasError ? 'تم اكتشاف أخطاء' : 'النظام يعمل بشكل طبيعي'}
                </h3>
              </div>
              <button
                onClick={handleDismiss}
                className={`${
                  hasError 
                    ? 'text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200' 
                    : 'text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200'
                }`}
              >
                ×
              </button>
            </div>

            <p className={`text-sm mb-3 ${
              hasError 
                ? 'text-yellow-700 dark:text-yellow-300' 
                : 'text-green-700 dark:text-green-300'
            }`}>
              {hasError 
                ? `تم اكتشاف ${errorCount} خطأ React Server Components. النظام يعمل على إصلاحها تلقائياً.`
                : 'جميع الأنظمة تعمل بشكل طبيعي. لا توجد أخطاء مكتشفة.'
              }
            </p>

            {hasError && (
              <div className="flex gap-2">
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-1 px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  إعادة تحميل
                </button>
                
                <button
                  onClick={handleDismiss}
                  className="px-3 py-1 border border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 rounded text-sm hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                >
                  إخفاء
                </button>
              </div>
            )}

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                وضع التطوير - يتم عرض جميع الأخطاء
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ErrorTestComponent;