'use client';

import { useEffect, useState } from 'react';

interface SafeHydrationProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * مكون للتعامل مع مشاكل Hydration عن طريق تأخير عرض المحتوى الحساس
 * حتى يتم تحميل الصفحة بالكامل على جانب العميل
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
export function useHydrated() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
} 