import { ReactNode, useEffect, useState } from 'react';

interface SafeHydrationProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * مكون لحل مشاكل Hydration Mismatch
 * يؤخر عرض المحتوى الديناميكي حتى يكتمل التحميل
 */
export default function SafeHydration({ children, fallback = null }: SafeHydrationProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Hook للتحقق من حالة Hydration
 */
export function useIsHydrated() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
} 