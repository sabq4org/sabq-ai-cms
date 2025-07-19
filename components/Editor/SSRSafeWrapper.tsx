'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { useIsClient } from '@/lib/utils/ssr-helpers';

interface SSRSafeWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  loading?: ReactNode;
}

/**
 * مكون لضمان التحميل الآمن للمكونات التي تتطلب بيئة المتصفح
 */
const SSRSafeWrapper: React.FC<SSRSafeWrapperProps> = ({
  children,
  fallback = null,
  loading = <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-96 rounded-lg" />
}) => {
  const isClient = useIsClient();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isClient) {
      // تأخير صغير للتأكد من تحميل جميع المكونات
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isClient]);

  // إذا لم نكن في المتصفح بعد، عرض loading
  if (!isClient || !isReady) {
    return <>{loading}</>;
  }

  // إذا كان هناك خطأ، عرض fallback
  try {
    return <>{children}</>;
  } catch (error) {
    console.error('SSRSafeWrapper error:', error);
    return <>{fallback}</>;
  }
};

export default SSRSafeWrapper;