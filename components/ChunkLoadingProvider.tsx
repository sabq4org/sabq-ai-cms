'use client';

import React, { useEffect, useRef } from 'react';
import { ChunkLoadingManager } from '@/lib/recovery/ChunkLoadingManager';

interface ChunkLoadingProviderProps {
  children: React.ReactNode;
  config?: {
    maxRetries?: number;
    retryDelay?: number;
    exponentialBackoff?: boolean;
    fallbackCDN?: string;
    enableServiceWorkerCleanup?: boolean;
    enableCacheCleanup?: boolean;
  };
}

const ChunkLoadingProvider: React.FC<ChunkLoadingProviderProps> = ({
  children,
  config = {}
}) => {
  const managerRef = useRef<ChunkLoadingManager | null>(null);

  useEffect(() => {
    // تهيئة مدير تحميل الـ chunks
    managerRef.current = ChunkLoadingManager.getInstance({
      maxRetries: 3,
      retryDelay: 1000,
      exponentialBackoff: true,
      enableServiceWorkerCleanup: true,
      enableCacheCleanup: true,
      ...config
    });

    // إضافة معالج للأخطاء غير المتوقعة
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      
      // فحص إذا كان الخطأ متعلق بتحميل الـ chunks
      if (error && typeof error === 'object' && error.message) {
        const message = error.message.toLowerCase();
        if (
          message.includes('loading chunk') ||
          message.includes('failed to fetch') ||
          message.includes('loading css chunk')
        ) {
          console.error('🚨 خطأ غير معالج في تحميل chunk:', error);
          
          // محاولة الاسترداد
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      }
    };

    // إضافة معالج الأخطاء العامة
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // تنظيف عند إلغاء التحميل
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [config]);

  // إضافة معلومات التشخيص في وضع التطوير
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && managerRef.current) {
      // إضافة واجهة للتحكم في وضع التطوير
      (window as any).chunkManager = {
        getStats: () => managerRef.current?.getChunkStats(),
        resetFailedChunks: () => managerRef.current?.resetFailedChunks(),
        updateConfig: (newConfig: any) => managerRef.current?.updateConfig(newConfig)
      };

      console.log('🔧 ChunkLoadingManager متاح في window.chunkManager');
    }
  }, []);

  return <>{children}</>;
};

export default ChunkLoadingProvider;