"use client";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

const LOYALTY_QUERY_KEY = ['loyalty', 'me'];

export function useLoyalty() {
  const { isLoggedIn, user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  
  const { data, error, isLoading } = useQuery({
    queryKey: LOYALTY_QUERY_KEY,
    queryFn: async () => {
      console.log('🎯 useLoyalty queryFn called with:', { 
        isLoggedIn, 
        userId: user?.id,
        authLoading
      });
      
      if (!isLoggedIn || !user?.id) {
        throw new Error('User not authenticated for loyalty data');
      }
      
      return api.get('/profile/me/loyalty');
    },
    enabled: !authLoading && isLoggedIn && !!user?.id, // Only run when auth is ready
    staleTime: 30_000,
    refetchOnWindowFocus: false,
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


