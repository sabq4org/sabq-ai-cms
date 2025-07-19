'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, Settings, X } from 'lucide-react';

interface DevToolsError {
  message: string;
  timestamp: number;
  stack?: string;
}

const DevToolsErrorHandler: React.FC = () => {
  const [errors, setErrors] = useState<DevToolsError[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAppliedFix, setHasAppliedFix] = useState(false);

  useEffect(() => {
    // فحص إذا كان هناك أخطاء DevTools محفوظة
    const savedErrors = localStorage.getItem('devtools_errors');
    if (savedErrors) {
      try {
        const parsedErrors = JSON.parse(savedErrors);
        setErrors(parsedErrors);
        if (parsedErrors.length > 0) {
          setIsVisible(true);
        }
      } catch (error) {
        console.warn('فشل في قراءة أخطاء DevTools المحفوظة:', error);
      }
    }

    // مراقبة أخطاء DevTools الجديدة
    const handleError = (event: ErrorEvent) => {
      const message = event.message || '';
      
      if (isDevToolsError(message)) {
        const newError: DevToolsError = {
          message,
          timestamp: Date.now(),
          stack: event.error?.stack
        };

        setErrors(prev => {
          const updated = [...prev, newError];
          // الاحتفاظ بآخر 10 أخطاء فقط
          const trimmed = updated.slice(-10);
          
          // حفظ في localStorage
          localStorage.setItem('devtools_errors', JSON.stringify(trimmed));
          
          return trimmed;
        });

        setIsVisible(true);

        // تطبيق الإصلاح تلقائياً
        if (!hasAppliedFix) {
          applyDevToolsFix();
        }
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const message = event.reason?.message || event.reason?.toString() || '';
      
      if (isDevToolsError(message)) {
        const newError: DevToolsError = {
          message,
          timestamp: Date.now(),
          stack: event.reason?.stack
        };

        setErrors(prev => {
          const updated = [...prev, newError];
          const trimmed = updated.slice(-10);
          localStorage.setItem('devtools_errors', JSON.stringify(trimmed));
          return trimmed;
        });

        setIsVisible(true);

        if (!hasAppliedFix) {
          applyDevToolsFix();
        }
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [hasAppliedFix]);

  const isDevToolsError = (message: string): boolean => {
    const devToolsPatterns = [
      'webpack-internal',
      'next-devtools',
      'tr@webpack-internal',
      'o6@webpack-internal',
      'iP@webpack-internal',
      'i$@webpack-internal',
      'sv@webpack-internal',
      'sm@webpack-internal',
      'sa@webpack-internal',
      'sZ@webpack-internal',
      '_@webpack-internal'
    ];

    return devToolsPatterns.some(pattern => message.includes(pattern));
  };

  const applyDevToolsFix = () => {
    console.log('🔧 تطبيق إصلاح DevTools...');
    
    // تعطيل DevTools
    localStorage.setItem('__NEXT_DEVTOOLS_DISABLED__', 'true');
    (window as any).__NEXT_DEVTOOLS_DISABLED__ = true;
    
    // تنظيف أخطاء DevTools من الكونسول
    const originalError = console.error;
    console.error = (...args: any[]) => {
      const message = args.join(' ');
      if (!isDevToolsError(message)) {
        originalError.apply(console, args);
      }
    };

    setHasAppliedFix(true);
    
    // إعادة تحميل بعد ثانيتين
    setTimeout(() => {
      if (!sessionStorage.getItem('devtools_fix_applied')) {
        sessionStorage.setItem('devtools_fix_applied', 'true');
        window.location.reload();
      }
    }, 2000);
  };

  const clearErrors = () => {
    setErrors([]);
    localStorage.removeItem('devtools_errors');
    setIsVisible(false);
  };

  const dismissNotification = () => {
    setIsVisible(false);
  };

  const enableDevTools = () => {
    localStorage.removeItem('__NEXT_DEVTOOLS_DISABLED__');
    delete (window as any).__NEXT_DEVTOOLS_DISABLED__;
    sessionStorage.removeItem('devtools_fix_applied');
    clearErrors();
    window.location.reload();
  };

  // عدم عرض أي شيء في الإنتاج
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  // عدم عرض أي شيء إذا لم تكن هناك أخطاء
  if (!isVisible || errors.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-50 max-w-md">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg shadow-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
              مشكلة في DevTools
            </h3>
          </div>
          <button
            onClick={dismissNotification}
            className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
          تم اكتشاف {errors.length} خطأ في Next.js DevTools. 
          {hasAppliedFix ? ' تم تطبيق الإصلاح.' : ' جارٍ تطبيق الإصلاح...'}
        </p>

        <div className="flex gap-2 flex-wrap">
          {!hasAppliedFix && (
            <button
              onClick={applyDevToolsFix}
              className="flex items-center gap-1 px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors"
            >
              <Settings className="w-3 h-3" />
              إصلاح الآن
            </button>
          )}

          <button
            onClick={clearErrors}
            className="px-3 py-1 border border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 rounded text-sm hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
          >
            مسح الأخطاء
          </button>

          <button
            onClick={enableDevTools}
            className="px-3 py-1 border border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 rounded text-sm hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
          >
            إعادة تفعيل DevTools
          </button>
        </div>

        {/* تفاصيل الأخطاء */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-3">
            <summary className="text-xs text-yellow-600 dark:text-yellow-400 cursor-pointer">
              عرض تفاصيل الأخطاء ({errors.length})
            </summary>
            <div className="mt-2 max-h-32 overflow-y-auto">
              {errors.slice(-3).map((error, index) => (
                <div key={index} className="text-xs text-yellow-700 dark:text-yellow-300 mb-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded">
                  <div className="font-mono break-all">
                    {error.message.substring(0, 100)}...
                  </div>
                  <div className="text-yellow-600 dark:text-yellow-400 mt-1">
                    {new Date(error.timestamp).toLocaleTimeString('ar-SA')}
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

export default DevToolsErrorHandler;