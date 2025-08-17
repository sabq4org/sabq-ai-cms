'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, RefreshCw, Settings } from 'lucide-react';

interface FixStatus {
  devToolsDisabled: boolean;
  chunkErrorHandlerLoaded: boolean;
  ssrFallbackActive: boolean;
  smartErrorBoundaryActive: boolean;
  hasRecentErrors: boolean;
  lastErrorTime?: number;
}

const ErrorFixStatus: React.FC = () => {
  const [status, setStatus] = useState<FixStatus>({
    devToolsDisabled: false,
    chunkErrorHandlerLoaded: false,
    ssrFallbackActive: false,
    smartErrorBoundaryActive: false,
    hasRecentErrors: false
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // فحص حالة الإصلاحات
    const checkStatus = () => {
      const newStatus: FixStatus = {
        devToolsDisabled: 
          localStorage.getItem('__NEXT_DEVTOOLS_DISABLED__') === 'true' ||
          (window as any).__NEXT_DEVTOOLS_DISABLED__ === true,
        
        chunkErrorHandlerLoaded: 
          typeof (window as any).ChunkErrorHandler !== 'undefined',
        
        ssrFallbackActive: 
          sessionStorage.getItem('sabq_force_csr') === 'true',
        
        smartErrorBoundaryActive: true, // دائماً نشط
        
        hasRecentErrors: false
      };

      // فحص الأخطاء الحديثة
      const recentErrors = localStorage.getItem('sabq_error_logs');
      if (recentErrors) {
        try {
          const errors = JSON.parse(recentErrors);
          const oneHourAgo = Date.now() - (60 * 60 * 1000);
          const recentErrorsList = errors.filter((error: any) => 
            error.timestamp > oneHourAgo
          );
          
          newStatus.hasRecentErrors = recentErrorsList.length > 0;
          if (recentErrorsList.length > 0) {
            newStatus.lastErrorTime = Math.max(...recentErrorsList.map((e: any) => e.timestamp));
          }
        } catch (error) {
          console.warn('فشل في قراءة سجل الأخطاء:', error);
        }
      }

      setStatus(newStatus);
    };

    checkStatus();
    
    // فحص دوري كل 30 ثانية
    const interval = setInterval(checkStatus, 30000);
    
    // عرض الحالة في وضع التطوير أو عند وجود مشاكل
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true);
    }

    return () => clearInterval(interval);
  }, []);

  const resetAllFixes = () => {
    // إعادة تعيين جميع الإصلاحات
    localStorage.removeItem('__NEXT_DEVTOOLS_DISABLED__');
    localStorage.removeItem('sabq_error_logs');
    sessionStorage.removeItem('sabq_force_csr');
    sessionStorage.removeItem('devtools_fix_applied');
    
    delete (window as any).__NEXT_DEVTOOLS_DISABLED__;
    
    // مسح أخطاء الـ chunks
    if ((window as any).ChunkErrorHandler) {
      (window as any).ChunkErrorHandler.clearErrors();
    }
    
    console.log('✅ تم إعادة تعيين جميع الإصلاحات');
    window.location.reload();
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  // عدم عرض أي شيء في الإنتاج إلا إذا كانت هناك مشاكل
  if (process.env.NODE_ENV === 'production' && !status.hasRecentErrors) {
    return null;
  }

  return (
    <>
      {/* زر التبديل */}
      <button
        onClick={toggleVisibility}
        className="fixed bottom-4 right-4 z-50 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="عرض حالة الإصلاحات"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* لوحة الحالة */}
      {isVisible && (
        <div className="fixed bottom-16 right-4 z-50 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              حالة إصلاحات الأخطاء
            </h3>
            <button
              onClick={toggleVisibility}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ×
            </button>
          </div>

          <div className="space-y-3">
            {/* DevTools */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                DevTools معطل
              </span>
              {status.devToolsDisabled ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              )}
            </div>

            {/* Chunk Error Handler */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                معالج أخطاء الـ Chunks
              </span>
              {status.chunkErrorHandlerLoaded ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              )}
            </div>

            {/* SSR Fallback */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                وضع CSR القسري
              </span>
              {status.ssrFallbackActive ? (
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </div>

            {/* Smart Error Boundary */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                معالج الأخطاء الذكي
              </span>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>

            {/* Recent Errors */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                أخطاء حديثة
              </span>
              {status.hasRecentErrors ? (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </div>
          </div>

          {/* معلومات إضافية */}
          {status.hasRecentErrors && status.lastErrorTime && (
            <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-700 dark:text-red-300">
              آخر خطأ: {new Date(status.lastErrorTime).toLocaleString('ar-SA')}
            </div>
          )}

          {/* أزرار التحكم */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={resetAllFixes}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              إعادة تعيين
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              إعادة تحميل
            </button>
          </div>

          {/* معلومات للمطورين */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-700 dark:text-blue-300">
              <div>وضع التطوير نشط</div>
              <div>استخدم window.devToolsFix للتحكم</div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ErrorFixStatus;