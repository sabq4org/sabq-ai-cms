'use client';

import React, { useEffect } from 'react';
import { APIErrorHandler } from '@/lib/recovery/APIErrorHandler';

interface APIErrorProviderProps {
  children: React.ReactNode;
  config?: {
    maxRetries?: number;
    retryDelay?: number;
    exponentialBackoff?: boolean;
    enableOfflineMode?: boolean;
    enableCaching?: boolean;
    cacheTimeout?: number;
    enableFallbackData?: boolean;
  };
}

const APIErrorProvider: React.FC<APIErrorProviderProps> = ({
  children,
  config = {}
}) => {
  useEffect(() => {
    // تهيئة معالج أخطاء API
    const apiHandler = APIErrorHandler.getInstance({
      maxRetries: 3,
      retryDelay: 1000,
      exponentialBackoff: true,
      enableOfflineMode: true,
      enableCaching: true,
      cacheTimeout: 5 * 60 * 1000, // 5 دقائق
      enableFallbackData: true,
      ...config
    });

    // إضافة واجهة للتحكم في وضع التطوير
    if (process.env.NODE_ENV === 'development') {
      (window as any).apiHandler = {
        getStats: () => apiHandler.getAPIStats(),
        clearAll: () => apiHandler.clearAll()
      };

      console.log('🔧 APIErrorHandler متاح في window.apiHandler');
    }

    // تنظيف عند إلغاء التحميل
    return () => {
      // لا حاجة لتنظيف خاص حيث أن APIErrorHandler singleton
    };
  }, [config]);

  return <>{children}</>;
};

export default APIErrorProvider;