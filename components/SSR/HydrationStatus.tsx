'use client';

import React from 'react';
import { useSSRFallback } from '@/hooks/useSSRFallback';
import { AlertTriangle, CheckCircle, Loader, Wifi, WifiOff } from 'lucide-react';

interface HydrationStatusProps {
  showDetails?: boolean;
  className?: string;
}

const HydrationStatus: React.FC<HydrationStatusProps> = ({
  showDetails = false,
  className = ''
}) => {
  const {
    isHydrated,
    fallbackMode,
    hasErrors,
    errorsCount,
    isLoading,
    isReady,
    hasIssues,
    getDetailedStats
  } = useSSRFallback({
    onHydrationComplete: () => {
      console.log('✅ Hydration completed successfully');
    },
    onSSRError: (error) => {
      console.error('🚨 SSR Error detected:', error);
    },
    onFallbackActivated: () => {
      console.log('🔄 Fallback to CSR activated');
    }
  });

  // عدم عرض أي شيء في وضع الإنتاج إذا كان كل شيء يعمل بشكل طبيعي
  if (process.env.NODE_ENV === 'production' && isReady && !hasIssues) {
    return null;
  }

  const getStatusIcon = () => {
    if (isLoading) {
      return <Loader className="w-4 h-4 animate-spin text-blue-500" />;
    }
    
    if (hasErrors || fallbackMode) {
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
    
    if (isHydrated) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    
    return <WifiOff className="w-4 h-4 text-gray-400" />;
  };

  const getStatusText = () => {
    if (isLoading) {
      return 'جارٍ التحميل...';
    }
    
    if (fallbackMode) {
      return 'وضع العميل فقط';
    }
    
    if (hasErrors) {
      return `أخطاء SSR (${errorsCount})`;
    }
    
    if (isHydrated) {
      return 'تم التحميل';
    }
    
    return 'في الانتظار';
  };

  const getStatusColor = () => {
    if (isLoading) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (hasErrors || fallbackMode) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (isHydrated) return 'text-green-600 bg-green-50 border-green-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <div className={`${className}`}>
      {/* مؤشر الحالة الأساسي */}
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </div>

      {/* التفاصيل المتقدمة (في وضع التطوير فقط) */}
      {showDetails && process.env.NODE_ENV === 'development' && (
        <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Hydrated:</span>
              <span className={isHydrated ? 'text-green-600' : 'text-red-600'}>
                {isHydrated ? 'Yes' : 'No'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Fallback Mode:</span>
              <span className={fallbackMode ? 'text-yellow-600' : 'text-green-600'}>
                {fallbackMode ? 'Yes' : 'No'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Errors:</span>
              <span className={hasErrors ? 'text-red-600' : 'text-green-600'}>
                {errorsCount}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Ready:</span>
              <span className={isReady ? 'text-green-600' : 'text-yellow-600'}>
                {isReady ? 'Yes' : 'No'}
              </span>
            </div>
          </div>

          {/* تفاصيل الأخطاء */}
          {hasErrors && (
            <details className="mt-2">
              <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                عرض تفاصيل الأخطاء
              </summary>
              <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs">
                <pre className="whitespace-pre-wrap overflow-auto max-h-32">
                  {JSON.stringify(getDetailedStats()?.errors, null, 2)}
                </pre>
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
};

export default HydrationStatus;