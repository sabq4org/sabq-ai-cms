"use client";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/EnhancedAuthContextWithSSR';

const LOYALTY_QUERY_KEY = ['loyalty', 'me'];

export function useLoyalty() {
  const { isLoggedIn, user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  
  const { data, error, isLoading } = useQuery({
    queryKey: LOYALTY_QUERY_KEY,
    queryFn: async () => {
      // Skip during SSR
      if (typeof window === 'undefined') {
        return { points: 0, level: 'برونزي', nextLevelThreshold: 100 };
      }

      console.log('🎯 useLoyalty queryFn called with:', { 
        isLoggedIn, 
        userId: user?.id,
        authLoading
      });
      
      if (!isLoggedIn || !user?.id) {
        console.log('⚠️ useLoyalty: المستخدم غير مسجل دخول - إرجاع قيم افتراضية');
        return { points: 0, level: 'برونزي', nextLevelThreshold: 100 };
      }
      
      try {
        return await api.get('/profile/me/loyalty');
      } catch (error: any) {
        console.warn('⚠️ useLoyalty: فشل في جلب نقاط الولاء، استخدام قيم افتراضية:', error.message);
        // إرجاع قيم افتراضية بدلاً من رمي خطأ
        return { points: 0, level: 'برونزي', nextLevelThreshold: 100 };
      }
    },
    enabled: typeof window !== 'undefined' && !authLoading && isLoggedIn && !!user?.id, // Only run when auth is ready and on client
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    // منع إعادة المحاولة عند فشل الطلب
    retry: false,
  });

  return {
    points: data?.points ?? 0,
    level: data?.level ?? 'برونزي',
    nextLevelThreshold: data?.nextLevelThreshold ?? 100,
    lastUpdatedAt: data?.lastUpdatedAt ?? null,
    isLoading: isLoading || authLoading, // Include auth loading
    error,
    mutate: () => queryClient.invalidateQueries({ queryKey: LOYALTY_QUERY_KEY }),
    LOYALTY_QUERY_KEY,
  };
}


