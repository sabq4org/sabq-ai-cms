/**
 * Hook محسن لجلب البيانات مع caching وتحسين الأداء
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface UseDataFetchOptions<T> {
  endpoint: string;
  initialData?: T | null;
  dependencies?: any[];
  cacheKey?: string;
  cacheTime?: number; // بالميلي ثانية
  retryAttempts?: number;
  retryDelay?: number;
}

interface UseDataFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setData: (data: T) => void;
}

// Cache بسيط في الذاكرة
const cache = new Map<
  string,
  { data: any; timestamp: number; expiry: number }
>();

export function useDataFetch<T>({
  endpoint,
  initialData,
  dependencies = [],
  cacheKey,
  cacheTime = 5 * 60 * 1000, // 5 دقائق افتراضي
  retryAttempts = 3,
  retryDelay = 1000,
}: UseDataFetchOptions<T>): UseDataFetchResult<T> {
  const [data, setData] = useState<T | null>(initialData ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);

  // تنظيف Cache منتهي الصلاحية
  const cleanExpiredCache = useCallback(() => {
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
      if (value.expiry <= now) {
        cache.delete(key);
      }
    }
  }, []);

  // جلب البيانات مع retry
  const fetchData = useCallback(
    async (retryCount = 0): Promise<void> => {
      // إلغاء الطلب السابق إذا كان موجوداً
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // التحقق من الـ cache أولاً (مباشرة بدون function call)
      if (cacheKey) {
        const cached = cache.get(cacheKey);
        if (cached && cached.expiry > Date.now()) {
          setData(cached.data);
          setError(null);
          return;
        }
      }

      abortControllerRef.current = new AbortController();
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(endpoint, {
          signal: abortControllerRef.current.signal,
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // حفظ في الـ cache (مباشرة بدون function call)
        if (cacheKey) {
          cache.set(cacheKey, {
            data: result,
            timestamp: Date.now(),
            expiry: Date.now() + cacheTime,
          });
        }

        setData(result);
        setError(null);
        retryCountRef.current = 0;
      } catch (err: any) {
        if (err.name === "AbortError") {
          return; // تم إلغاء الطلب
        }

        console.error("Fetch error:", err);

        // إعادة المحاولة
        if (retryCount < retryAttempts) {
          retryCountRef.current = retryCount + 1;
          setTimeout(() => {
            fetchData(retryCount + 1);
          }, retryDelay * (retryCount + 1)); // تأخير متزايد
        } else {
          setError(err.message || "حدث خطأ أثناء جلب البيانات");
        }
      } finally {
        setLoading(false);
      }
    },
    [endpoint, cacheKey, cacheTime, retryAttempts, retryDelay]
  );

  // إعادة جلب البيانات
  const refetch = useCallback(async () => {
    // مسح الـ cache للـ key الحالي
    if (cacheKey) {
      cache.delete(cacheKey);
    }
    await fetchData();
  }, [cacheKey, fetchData]);

  // تحديث البيانات يدوياً
  const updateData = useCallback(
    (newData: T) => {
      setData(newData);
      // تحديث الـ cache أيضاً (مباشرة)
      if (cacheKey) {
        cache.set(cacheKey, {
          data: newData,
          timestamp: Date.now(),
          expiry: Date.now() + cacheTime,
        });
      }
    },
    [cacheKey, cacheTime]
  );

  // جلب البيانات عند تغيير المعاملات
  useEffect(() => {
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    setData: updateData,
  };
}

// Hook لجلب المقالات محسن
export function useArticles(filters: any = {}) {
  const queryParams = useMemo(() => {
    return new URLSearchParams(filters).toString();
  }, [filters]);
  
  const endpoint = useMemo(() => {
    return `/api/articles${queryParams ? `?${queryParams}` : ""}`;
  }, [queryParams]);
  
  const cacheKey = useMemo(() => {
    return `articles-${queryParams}`;
  }, [queryParams]);

  return useDataFetch({
    endpoint,
    cacheKey,
    cacheTime: 2 * 60 * 1000, // 2 دقائق للمقالات
    dependencies: [queryParams],
  });
}

// Hook لجلب مقال واحد
export function useArticle(id: string) {
  return useDataFetch({
    endpoint: `/api/articles/${id}`,
    cacheKey: `article-${id}`,
    cacheTime: 10 * 60 * 1000, // 10 دقائق للمقال الواحد
    dependencies: [id],
  });
}

// تنظيف الـ cache (يمكن استدعاؤها عند logout مثلاً)
export function clearCache() {
  cache.clear();
}

// تنظيف الـ cache المنتهي الصلاحية
export function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now >= value.expiry) {
      cache.delete(key);
    }
  }
}

// تشغيل تنظيف الـ cache كل 5 دقائق
if (typeof window !== "undefined") {
  setInterval(cleanExpiredCache, 5 * 60 * 1000);
}
