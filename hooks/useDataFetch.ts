/**
 * Hook محسن لجلب البيانات مع caching وتحسين الأداء
 */

import { useCallback, useEffect, useRef, useState } from "react";

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

  // التحقق من الـ cache
  const getCachedData = useCallback((key: string) => {
    if (!key) return null;
    const cached = cache.get(key);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }
    cache.delete(key);
    return null;
  }, []);

  // حفظ البيانات في الـ cache
  const setCachedData = useCallback(
    (key: string, data: any) => {
      if (!key) return;
      cache.set(key, {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + cacheTime,
      });
    },
    [cacheTime]
  );

  // جلب البيانات مع retry
  const fetchData = useCallback(
    async (retryCount = 0): Promise<void> => {
      // إلغاء الطلب السابق إذا كان موجوداً
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // التحقق من الـ cache أولاً
      if (cacheKey) {
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
          setData(cachedData);
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

        // حفظ في الـ cache
        if (cacheKey) {
          setCachedData(cacheKey, result);
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
    [
      endpoint,
      cacheKey,
      getCachedData,
      setCachedData,
      retryAttempts,
      retryDelay,
    ]
  );

  // إعادة جلب البيانات
  const refetch = useCallback(async () => {
    // مسح الـ cache للـ key الحالي
    if (cacheKey) {
      cache.delete(cacheKey);
    }
    await fetchData();
  }, [cacheKey]);

  // تحديث البيانات يدوياً
  const updateData = useCallback(
    (newData: T) => {
      setData(newData);
      // تحديث الـ cache أيضاً
      if (cacheKey) {
        setCachedData(cacheKey, newData);
      }
    },
    [cacheKey, setCachedData]
  );

  // جلب البيانات عند تغيير المعاملات
  useEffect(() => {
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [endpoint, cacheKey, retryAttempts, retryDelay, ...dependencies]);

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
  const queryParams = new URLSearchParams(filters).toString();
  const endpoint = `/api/articles${queryParams ? `?${queryParams}` : ""}`;
  const cacheKey = `articles-${queryParams}`;

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
