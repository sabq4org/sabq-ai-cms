'use client';

import React, { useEffect, ReactNode } from 'react';
import { useUserInteractions } from '@/stores/userInteractions';

interface InteractionsProviderProps {
  children: ReactNode;
  articleIds?: string[];
  autoSync?: boolean;
  syncInterval?: number; // in minutes
}

export default function InteractionsProvider({
  children,
  articleIds = [],
  autoSync = true,
  syncInterval = 5
}: InteractionsProviderProps) {
  const { initializeUserInteractions, lastSyncTime } = useUserInteractions();

  // Initialize interactions on mount
  useEffect(() => {
    if (autoSync) {
      initializeUserInteractions(articleIds);
    }
  }, [autoSync, initializeUserInteractions]); // Removed articleIds from deps to avoid frequent re-syncs

  // Auto-sync at intervals
  useEffect(() => {
    if (!autoSync || syncInterval <= 0) return;

    const intervalMs = syncInterval * 60 * 1000; // Convert to milliseconds
    
    const syncTimer = setInterval(() => {
      const timeSinceLastSync = lastSyncTime ? Date.now() - lastSyncTime : Infinity;
      
      // Only sync if we haven't synced recently
      if (timeSinceLastSync >= intervalMs) {
        initializeUserInteractions(articleIds);
      }
    }, intervalMs);

    return () => clearInterval(syncTimer);
  }, [autoSync, syncInterval, lastSyncTime, initializeUserInteractions]);

  // Sync when page becomes visible again
  useEffect(() => {
    if (!autoSync) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const timeSinceLastSync = lastSyncTime ? Date.now() - lastSyncTime : Infinity;
        const minSyncInterval = 2 * 60 * 1000; // 2 minutes minimum
        
        if (timeSinceLastSync >= minSyncInterval) {
          initializeUserInteractions(articleIds);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [autoSync, lastSyncTime, initializeUserInteractions]);

  // Sync when coming back online
  useEffect(() => {
    if (!autoSync) return;

    const handleOnline = () => {
      initializeUserInteractions(articleIds);
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [autoSync, initializeUserInteractions]);

  return <>{children}</>;
}

// Hook for getting article IDs from the current page
export function usePageArticleIds(): string[] {
  const [articleIds, setArticleIds] = React.useState<string[]>([]);

  useEffect(() => {
    // Extract article IDs from the current page
    const extractArticleIds = () => {
      const ids: string[] = [];

      // Method 1: Look for data-article-id attributes
      const elementsWithArticleId = document.querySelectorAll('[data-article-id]');
      elementsWithArticleId.forEach(element => {
        const id = element.getAttribute('data-article-id');
        if (id && !ids.includes(id)) {
          ids.push(id);
        }
      });

      // Method 2: Extract from URL patterns
      const pathname = window.location.pathname;
      
      // Single article page: /article/[id] or /news/[slug]
      const articleMatch = pathname.match(/\/article\/([^\/]+)/) || pathname.match(/\/news\/([^\/]+)/);
      if (articleMatch && articleMatch[1] && !ids.includes(articleMatch[1])) {
        ids.push(articleMatch[1]);
      }

      // Opinion article: /opinion/[slug]
      const opinionMatch = pathname.match(/\/opinion\/([^\/]+)/);
      if (opinionMatch && opinionMatch[1] && !ids.includes(opinionMatch[1])) {
        ids.push(opinionMatch[1]);
      }

      // Method 3: Look for article links in the page
      const articleLinks = document.querySelectorAll('a[href*="/article/"], a[href*="/news/"], a[href*="/opinion/"]');
      articleLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
          const match = href.match(/\/(article|news|opinion)\/([^\/\?#]+)/);
          if (match && match[2] && !ids.includes(match[2])) {
            ids.push(match[2]);
          }
        }
      });

      return ids.slice(0, 50); // Limit to prevent excessive API calls
    };

    setArticleIds(extractArticleIds());

    // Update article IDs when the page changes
    const observer = new MutationObserver(() => {
      setArticleIds(extractArticleIds());
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-article-id', 'href']
    });

    return () => observer.disconnect();
  }, []);

  return articleIds;
}

// Auto-detecting provider that finds article IDs on the page
export function AutoInteractionsProvider({ 
  children, 
  syncInterval = 5 
}: { 
  children: ReactNode; 
  syncInterval?: number; 
}) {
  const articleIds = usePageArticleIds();

  return (
    <InteractionsProvider
      articleIds={articleIds}
      autoSync={true}
      syncInterval={syncInterval}
    >
      {children}
    </InteractionsProvider>
  );
}

// Debug component to show current interaction states
export function InteractionsDebugger({ articleId }: { articleId: string }) {
  const { getInteractionState, isLoading, error, lastSyncTime } = useUserInteractions();
  const state = getInteractionState(articleId);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white text-xs rounded-lg max-w-xs">
      <h4 className="font-bold mb-2">Interactions Debug</h4>
      <div>Article: {articleId}</div>
      <div>Liked: {state.liked ? '✅' : '❌'}</div>
      <div>Saved: {state.saved ? '✅' : '❌'}</div>
      <div>Shared: {state.shared ? '✅' : '❌'}</div>
      <div>Loading: {isLoading ? '⏳' : '✅'}</div>
      <div>Error: {error || 'None'}</div>
      <div>Last Sync: {lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString() : 'Never'}</div>
    </div>
  );
}
