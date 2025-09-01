import { useState, useEffect, useCallback, useRef } from 'react';

interface LightArticle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image?: string;
  published_at: string;
  views: number;
  categories?: {
    id: string;
    name: string;
    color?: string;
  } | null;
}

interface UseRecentNewsOptions {
  limit?: number;
  priority?: 'speed' | 'mobile' | 'balanced';
  refreshInterval?: number;
  category?: string;
}

interface UseRecentNewsReturn {
  articles: LightArticle[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  hasMore: boolean;
  loadMore: () => void;
}

// Hook محسن لجلب الأخبار الحديثة
export const useRecentNews = ({
  limit = 8,
  priority = 'mobile',
  refreshInterval = 0,
  category
}: UseRecentNewsOptions = {}): UseRecentNewsReturn => {
  const [articles, setArticles] = useState<LightArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, { data: LightArticle[]; timestamp: number }>>(new Map());
  
  // تحسين حجم البيانات حسب الأولوية
  const optimizedLimit = priority === 'speed' ? Math.min(limit, 6) : limit;
  
  const fetchArticles = useCallback(async (isLoadMore = false) => {
    // إلغاء الطلب السابق
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      if (!isLoadMore) {
        setLoading(true);
        setError(null);
      }
      
      const currentOffset = isLoadMore ? offset : 0;
      const params = new URLSearchParams({
        limit: optimizedLimit.toString(),
        light: 'true',
        offset: currentOffset.toString()
      });
      
      if (category) params.set('category', category);
      
      // التحقق من الكاش
      const cacheKey = params.toString();
      const cachedData = cacheRef.current.get(cacheKey);
      const cacheTimeout = priority === 'speed' ? 300000 : 180000; // 5 دقائق للسرعة، 3 دقائق للعادي
      
      if (cachedData && Date.now() - cachedData.timestamp < cacheTimeout) {
        setArticles(isLoadMore ? [...articles, ...cachedData.data] : cachedData.data);
        setHasMore(cachedData.data.length === optimizedLimit);
        if (!isLoadMore) setLoading(false);
        return;
      }
      
      const response = await fetch(`/api/articles/recent?${params}`, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Cache-Control': 'public, max-age=300',
        }
      });
      
      if (!response.ok) {
        throw new Error('فشل في جلب الأخبار');
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'فشل في جلب الأخبار');
      }
      
      const newArticles: LightArticle[] = (result.data || []).map((article: any) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: priority === 'speed' ? undefined : article.excerpt,
        featured_image: article.featured_image,
        published_at: article.published_at,
        views: article.views || 0,
        categories: article.categories ? {
          id: article.categories.id,
          name: article.categories.name,
          color: article.categories.color
        } : null
      }));
      
      // حفظ في الكاش
      cacheRef.current.set(cacheKey, {
        data: newArticles,
        timestamp: Date.now()
      });
      
      // تنظيف الكاش القديم
      if (cacheRef.current.size > 10) {
        const oldestKey = Array.from(cacheRef.current.keys())[0];
        cacheRef.current.delete(oldestKey);
      }
      
      if (isLoadMore) {
        setArticles(prev => [...prev, ...newArticles]);
        setOffset(prev => prev + optimizedLimit);
      } else {
        setArticles(newArticles);
        setOffset(optimizedLimit);
      }
      
      setHasMore(newArticles.length === optimizedLimit);
      
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // تم إلغاء الطلب، لا نفعل شيئاً
      }
      
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      if (!isLoadMore) {
        setLoading(false);
      }
    }
  }, [optimizedLimit, priority, category, offset, articles]);
  
  const refresh = useCallback(() => {
    setOffset(0);
    cacheRef.current.clear();
    fetchArticles(false);
  }, [fetchArticles]);
  
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchArticles(true);
    }
  }, [fetchArticles, loading, hasMore]);
  
  useEffect(() => {
    fetchArticles(false);
    
    // تحديث دوري إذا تم تحديد فترة التحديث
    let intervalId: NodeJS.Timeout | null = null;
    if (refreshInterval > 0) {
      intervalId = setInterval(refresh, refreshInterval);
    }
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [priority, category, optimizedLimit]);
  
  return {
    articles,
    loading,
    error,
    refresh,
    hasMore,
    loadMore
  };
};
