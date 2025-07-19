'use client';

import React, { useEffect, useState } from 'react';
import { EditorErrorBoundary } from '@/components/ErrorBoundary';
import { NotificationToast } from '@/components/Notifications';
import { useNotifications } from '@/hooks/useNotifications';
import { usePagePerformance } from '@/hooks/usePagePerformance';
import PerformanceMonitor from '@/components/PerformanceMonitor';

interface PageWrapperProps {
  children: React.ReactNode;
  pageName: string;
  showPerformanceMonitor?: boolean;
  enableNotifications?: boolean;
  className?: string;
}

const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  pageName,
  showPerformanceMonitor = false,
  enableNotifications = true,
  className = ''
}) => {
  const [showPerfMonitor, setShowPerfMonitor] = useState(false);
  const { showEditorError } = useNotifications();
  const { metrics } = usePagePerformance(pageName);

  // إظهار مراقب الأداء تلقائياً للصفحات البطيئة
  useEffect(() => {
    if (metrics.isSlowPage && showPerformanceMonitor) {
      setShowPerfMonitor(true);
    }
  }, [metrics.isSlowPage, showPerformanceMonitor]);

  // معالج الأخطاء المخصص
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // تسجيل الخطأ مع معلومات الصفحة
    console.error(`Page Error in ${pageName}:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      pageName,
      timestamp: new Date().toISOString()
    });

    // إظهار إشعار للمستخدم
    if (enableNotifications) {
      showEditorError(error, pageName, `${pageName}-${Date.now()}`);
    }
  };

  return (
    <EditorErrorBoundary 
      context={pageName}
      onError={handleError}
    >
      <div className={`page-wrapper ${className}`}>
        {children}

        {/* الإشعارات المنبثقة */}
        {enableNotifications && (
          <NotificationToast 
            maxVisible={3}
            position="top-right"
          />
        )}

        {/* مراقب الأداء */}
        {showPerformanceMonitor && (
          <PerformanceMonitor
            pageName={pageName}
            isVisible={showPerfMonitor}
            onClose={() => setShowPerfMonitor(false)}
          />
        )}

        {/* زر إظهار مراقب الأداء في وضع التطوير */}
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={() => setShowPerfMonitor(!showPerfMonitor)}
            className="fixed bottom-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            title="مراقب الأداء"
          >
            📊
          </button>
        )}
      </div>
    </EditorErrorBoundary>
  );
};

export default PageWrapper;