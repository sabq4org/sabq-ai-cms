"use client";
import { useQuery, useQueryClient } from '@tanstack/react-query';

const LOYALTY_QUERY_KEY = ['loyalty', 'me'];

export function useLoyalty() {
  const queryClient = useQueryClient();
  const { data, error, isLoading } = useQuery({
    queryKey: LOYALTY_QUERY_KEY,
    queryFn: async () => {
      const res = await fetch('/api/profile/me/loyalty', { cache: 'no-store', credentials: 'include' });
      if (!res.ok) throw new Error('failed');
      return res.json();
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  return {
    points: data?.points ?? 0,
    level: data?.level ?? 'برونزي',
    nextLevelThreshold: data?.nextLevelThreshold ?? 100,
    lastUpdatedAt: data?.lastUpdatedAt ?? null,
    isLoading,
    error,
    mutate: () => queryClient.invalidateQueries({ queryKey: LOYALTY_QUERY_KEY }),
    LOYALTY_QUERY_KEY,
  };
}


