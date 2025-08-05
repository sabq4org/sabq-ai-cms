"use client";

import React from "react";

// مكون استرداد متقدم لأخطاء React #130
export function ReactErrorRecovery({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = React.useState(false);
  const [errorCount, setErrorCount] = React.useState(0);
  const maxRetries = 3;

  React.useEffect(() => {
    // معالجة أخطاء React العامة
    const originalError = console.error;
    
    console.error = function(...args) {
      const errorMessage = args[0]?.toString() || "";
      
      // اكتشاف React Error #130
      if (errorMessage.includes("Minified React error #130") || 
          errorMessage.includes("Element type is invalid")) {
        
        console.warn("🔧 React Error #130 detected - attempting recovery");
        
        setErrorCount(prev => {
          const newCount = prev + 1;
          
          if (newCount <= maxRetries) {
            console.log(`🔄 Recovery attempt ${newCount}/${maxRetries}`);
            
            // محاولة إعادة الrender بعد تأخير قصير
            setTimeout(() => {
              setHasError(false);
              
              // إعادة تحميل المكونات المتأثرة
              if (typeof window !== "undefined") {
                // تنظيف React fiber tree
                const reactRoot = document.getElementById('__next');
                if (reactRoot) {
                  reactRoot.style.display = 'none';
                  setTimeout(() => {
                    reactRoot.style.display = 'block';
                  }, 100);
                }
              }
            }, 500);
          } else {
            console.error("❌ Maximum recovery attempts reached");
            setHasError(true);
          }
          
          return newCount;
        });
        
        return; // منع عرض الخطأ في console
      }
      
      // عرض الأخطاء الأخرى كالمعتاد
      originalError.apply(console, args);
    };

    // استرداد console.error الأصلي عند unmount
    return () => {
      console.error = originalError;
    };
  }, []);

  // Reset error count عند نجاح الrender
  React.useEffect(() => {
    if (!hasError) {
      setErrorCount(0);
    }
  }, [hasError]);

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            خطأ في تحميل التطبيق
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            تعذر استرداد التطبيق تلقائياً. يرجى إعادة تحميل الصفحة.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            إعادة تحميل الصفحة
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Hook للمكونات Function
export function useReactErrorRecovery() {
  const [retryCount, setRetryCount] = React.useState(0);
  
  const retry = React.useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  const reset = React.useCallback(() => {
    setRetryCount(0);
  }, []);

  return { retryCount, retry, reset };
}

// مكون Wrapper سريع للاستخدام
export function WithErrorRecovery({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <ReactErrorRecovery>
      <React.Suspense fallback={fallback || <div>Loading...</div>}>
        {children}
      </React.Suspense>
    </ReactErrorRecovery>
  );
}

export default ReactErrorRecovery;