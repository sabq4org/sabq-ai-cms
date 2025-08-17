'use client';

import { useEffect } from 'react';
import { useUserInteractions } from '@/stores/userInteractions';
import { useAuth } from '@/hooks/useAuth';

/**
 * مكون لتهيئة تفاعلات المستخدم عند بدء التطبيق
 */
export default function UserInteractionInitializer() {
  const { user, isLoggedIn } = useAuth();
  const { initializeUserInteractions, lastSyncTime } = useUserInteractions();

  useEffect(() => {
    if (isLoggedIn && user?.id) {
      // تحقق من الحاجة لإعادة المزامنة
      const timeSinceLastSync = lastSyncTime ? Date.now() - lastSyncTime : Infinity;
      const shouldSync = timeSinceLastSync > 5 * 60 * 1000; // 5 دقائق

      if (shouldSync) {
        console.log('🔄 تهيئة تفاعلات المستخدم...');
        initializeUserInteractions();
      }
    }
  }, [isLoggedIn, user?.id, initializeUserInteractions, lastSyncTime]);

  // مزامنة عند العودة للتطبيق
  useEffect(() => {
    if (typeof window !== 'undefined' && isLoggedIn && user?.id) {
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          const timeSinceLastSync = lastSyncTime ? Date.now() - lastSyncTime : Infinity;
          if (timeSinceLastSync > 2 * 60 * 1000) { // 2 دقيقة
            console.log('👁️ إعادة مزامنة التفاعلات بعد العودة للتطبيق');
            initializeUserInteractions();
          }
        }
      };

      const handleFocus = () => {
        const timeSinceLastSync = lastSyncTime ? Date.now() - lastSyncTime : Infinity;
        if (timeSinceLastSync > 30 * 1000) { // 30 ثانية
          initializeUserInteractions();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleFocus);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [isLoggedIn, user?.id, initializeUserInteractions, lastSyncTime]);

  return null; // هذا المكون لا يعرض شيئاً
}
