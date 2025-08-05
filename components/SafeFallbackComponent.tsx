'use client';

import React from 'react';

/**
 * مكون احتياطي آمن يُستخدم عندما يفشل تحميل المكونات الأخرى
 */
export default function SafeFallbackComponent({ 
  componentName = 'Component',
  error = null,
  showError = false 
}: {
  componentName?: string;
  error?: any;
  showError?: boolean;
}) {
  // في الإنتاج، لا نعرض تفاصيل الأخطاء
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction && !showError) {
    // إرجاع null بهدوء في الإنتاج
    return null;
  }
  
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2">
        <svg 
          className="w-5 h-5 text-gray-400" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path 
            fillRule="evenodd" 
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
            clipRule="evenodd" 
          />
        </svg>
        <span className="text-sm text-gray-600 dark:text-gray-300">
          جاري تحميل {componentName}...
        </span>
      </div>
      
      {showError && error && !isProduction && (
        <details className="mt-2">
          <summary className="text-xs text-gray-500 cursor-pointer">
            تفاصيل تقنية
          </summary>
          <pre className="mt-1 text-xs text-gray-400 overflow-auto">
            {error.toString()}
          </pre>
        </details>
      )}
    </div>
  );
}

/**
 * مكون فارغ آمن للاستخدام كـ fallback
 */
export function EmptyFallback() {
  return null;
}

/**
 * مكون تحميل بسيط
 */
export function LoadingFallback({ text = 'جاري التحميل...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-600 dark:text-gray-400">{text}</span>
      </div>
    </div>
  );
}

/**
 * HOC لحماية أي مكون من الأخطاء
 */
export function withSafeFallback<P extends object>(
  Component: React.ComponentType<P>,
  fallback: React.ReactNode = <EmptyFallback />
) {
  return React.memo((props: P) => {
    try {
      if (!Component) {
        console.warn('Component is undefined, using fallback');
        return <>{fallback}</>;
      }
      
      return <Component {...props} />;
    } catch (error) {
      console.error('Component render error:', error);
      return <>{fallback}</>;
    }
  });
}