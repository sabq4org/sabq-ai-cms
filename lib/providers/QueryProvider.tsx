'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

// Query client configuration
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data for 5 minutes
        staleTime: 5 * 60 * 1000,
        // Keep data in cache for 10 minutes
        gcTime: 10 * 60 * 1000,
        // Retry failed requests 3 times
        retry: 3,
        // Retry with exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Refetch on window focus
        refetchOnWindowFocus: true,
        // Refetch on reconnect
        refetchOnReconnect: true,
        // Don't refetch on mount if data is fresh
        refetchOnMount: 'always',
      },
      mutations: {
        // Retry failed mutations once
        retry: 1,
        // Retry delay for mutations
        retryDelay: 1000,
      },
    },
    logger: {
      log: (...args) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[React Query]', ...args);
        }
      },
      warn: (...args) => {
        console.warn('[React Query]', ...args);
      },
      error: (...args) => {
        console.error('[React Query]', ...args);
      },
    },
  });
};

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Create a stable query client instance
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

// Custom hooks for common queries
export { useQuery, useMutation, useInfiniteQuery, useQueries } from '@tanstack/react-query';

// Export query client for manual invalidation
export { useQueryClient } from '@tanstack/react-query';
