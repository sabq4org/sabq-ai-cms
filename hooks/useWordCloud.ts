/**
 * React Hook لإدارة بيانات Word Cloud
 * Word Cloud Data Management Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { WordItem } from '@/types/word-cloud';

interface UseWordCloudOptions {
  maxWords?: number;
  timeframe?: '1d' | '7d' | '30d' | '90d';
  refreshInterval?: number; // بالميلي ثانية
  enableAutoRefresh?: boolean;
}

interface UseWordCloudResult {
  words: WordItem[];
  loading: boolean;
  error: string | null;
  fetchWords: () => Promise<void>;
  refresh: () => void;
  lastUpdated: Date | null;
}

export function useWordCloud(options: UseWordCloudOptions = {}): UseWordCloudResult {
  const {
    maxWords = 30,
    timeframe = '7d',
    refreshInterval = 5 * 60 * 1000, // 5 دقائق افتراضياً
    enableAutoRefresh = false
  } = options;

  const [words, setWords] = useState<WordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // دالة جلب البيانات
  const fetchWords = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: maxWords.toString(),
        timeframe
      });

      const response = await fetch(`/api/analytics/trending-keywords?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        // تحويل البيانات للتنسيق المطلوب
        const transformedWords: WordItem[] = data.keywords.map((keyword: any) => ({
          id: keyword.id,
          text: keyword.text,
          weight: keyword.weight || Math.round((keyword.count / 156) * 100),
          count: keyword.count,
          colorKey: keyword.colorKey || 'misc',
          trend: keyword.trend,
          href: keyword.href || keyword.url
        }));

        setWords(transformedWords);
        setLastUpdated(new Date());
      } else {
        throw new Error(data.error || 'فشل في جلب البيانات');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ غير معروف';
      setError(errorMessage);
      console.error('خطأ في جلب كلمات Word Cloud:', err);
    } finally {
      setLoading(false);
    }
  }, [maxWords, timeframe]);

  // دالة التحديث اليدوي
  const refresh = useCallback(() => {
    fetchWords();
  }, [fetchWords]);

  // جلب البيانات عند التحميل الأولي
  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  // التحديث التلقائي
  useEffect(() => {
    if (!enableAutoRefresh || refreshInterval <= 0) return;

    const intervalId = setInterval(() => {
      fetchWords();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [enableAutoRefresh, refreshInterval, fetchWords]);

  return {
    words,
    loading,
    error,
    fetchWords,
    refresh,
    lastUpdated
  };
}

// Hook للإحصائيات المتقدمة
interface UseWordCloudAnalyticsResult {
  totalWords: number;
  trendingUp: number;
  trendingDown: number;
  trendingFlat: number;
  topCategories: Array<{ category: string; count: number }>;
  averageWeight: number;
  maxWeight: number;
  minWeight: number;
}

export function useWordCloudAnalytics(words: WordItem[]): UseWordCloudAnalyticsResult {
  const analytics = useState(() => {
    const totalWords = words.length;
    const trendingUp = words.filter(w => w.trend === 'up').length;
    const trendingDown = words.filter(w => w.trend === 'down').length;
    const trendingFlat = words.filter(w => w.trend === 'flat').length;

    // حساب أعلى الفئات
    const categoryCount = words.reduce((acc, word) => {
      const category = word.colorKey || 'misc';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // حساب إحصائيات الوزن
    const weights = words.map(w => w.weight);
    const averageWeight = weights.length > 0 ? weights.reduce((a, b) => a + b, 0) / weights.length : 0;
    const maxWeight = weights.length > 0 ? Math.max(...weights) : 0;
    const minWeight = weights.length > 0 ? Math.min(...weights) : 0;

    return {
      totalWords,
      trendingUp,
      trendingDown,
      trendingFlat,
      topCategories,
      averageWeight: Math.round(averageWeight),
      maxWeight,
      minWeight
    };
  })[0];

  return analytics;
}

// Hook لتتبع تفاعلات المستخدم
interface UseWordCloudInteractionsOptions {
  onWordClick?: (word: WordItem) => void;
  trackAnalytics?: boolean;
}

export function useWordCloudInteractions(options: UseWordCloudInteractionsOptions = {}) {
  const { onWordClick, trackAnalytics = true } = options;

  const handleWordSelect = useCallback(async (word: WordItem) => {
    // تنفيذ callback المخصص
    onWordClick?.(word);

    // تسجيل التفاعل إذا كان مفعلاً
    if (trackAnalytics) {
      try {
        await fetch('/api/analytics/word-click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wordId: word.id,
            clickedAt: new Date().toISOString(),
            userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
            source: 'word-cloud'
          })
        });
      } catch (error) {
        console.warn('فشل في تسجيل تفاعل الكلمة:', error);
      }
    }

    // فتح الرابط إذا كان موجوداً
    if (word.href) {
      if (word.href.startsWith('http')) {
        window.open(word.href, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = word.href;
      }
    }
  }, [onWordClick, trackAnalytics]);

  return { handleWordSelect };
}
