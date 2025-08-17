/**
 * محرك التوصيات الذكي - سبق الذكية
 * React Hooks للتوصيات
 * Sabq AI Recommendation Engine - React Hooks
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  recommendationClient, 
  type Recommendation, 
  type RecommendationsResponse,
  type Interaction,
  type Context,
  type UserProfile,
  createAutoContext,
  getInteractionScore
} from '../lib/recommendation-client';

// ===== خطافات التوصيات الأساسية =====

/**
 * خطاف للحصول على توصيات المستخدم
 */
export function useUserRecommendations(
  userId: string | null,
  options: {
    limit?: number;
    categories?: string[];
    excludeRead?: boolean;
    diversityFactor?: number;
    noveltyFactor?: number;
    enabled?: boolean;
    refetchInterval?: number;
  } = {}
) {
  const { enabled = true, refetchInterval = 5 * 60 * 1000, ...requestOptions } = options;

  return useQuery({
    queryKey: ['recommendations', 'user', userId, requestOptions],
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      return recommendationClient.getUserRecommendations(userId, requestOptions);
    },
    enabled: enabled && !!userId,
    refetchInterval,
    staleTime: 2 * 60 * 1000, // بيانات طازجة لدقيقتين
    cacheTime: 10 * 60 * 1000, // تخزين مؤقت لـ 10 دقائق
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * خطاف للحصول على توصيات سياقية
 */
export function useContextualRecommendations(
  userId: string | null,
  context?: Context,
  options: {
    limit?: number;
    categories?: string[];
    autoContext?: boolean;
    enabled?: boolean;
  } = {}
) {
  const { autoContext = true, enabled = true, ...requestOptions } = options;
  
  // إنشاء سياق تلقائي إذا لم يتم توفيره
  const finalContext = useMemo(() => {
    if (context) return context;
    if (autoContext) return createAutoContext();
    return {};
  }, [context, autoContext]);

  return useQuery({
    queryKey: ['recommendations', 'contextual', userId, finalContext, requestOptions],
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      return recommendationClient.getContextualRecommendations(userId, finalContext, requestOptions);
    },
    enabled: enabled && !!userId,
    staleTime: 1 * 60 * 1000, // بيانات طازجة لدقيقة واحدة
    cacheTime: 5 * 60 * 1000, // تخزين مؤقت لـ 5 دقائق
    retry: 1,
  });
}

/**
 * خطاف للحصول على المقالات المماثلة
 */
export function useSimilarArticles(
  articleId: string | null,
  options: {
    limit?: number;
    similarityThreshold?: number;
    enabled?: boolean;
  } = {}
) {
  const { enabled = true, ...requestOptions } = options;

  return useQuery({
    queryKey: ['recommendations', 'similar', articleId, requestOptions],
    queryFn: () => {
      if (!articleId) throw new Error('Article ID is required');
      return recommendationClient.getSimilarArticles(articleId, requestOptions);
    },
    enabled: enabled && !!articleId,
    staleTime: 15 * 60 * 1000, // بيانات طازجة لـ 15 دقيقة
    cacheTime: 60 * 60 * 1000, // تخزين مؤقت لساعة واحدة
    retry: 2,
  });
}

/**
 * خطاف للحصول على التوصيات الشائعة
 */
export function useTrendingRecommendations(
  options: {
    timeRange?: 'hour' | 'day' | 'week' | 'month';
    category?: string;
    limit?: number;
    enabled?: boolean;
    refetchInterval?: number;
  } = {}
) {
  const { enabled = true, refetchInterval = 2 * 60 * 1000, ...requestOptions } = options;

  return useQuery({
    queryKey: ['recommendations', 'trending', requestOptions],
    queryFn: () => recommendationClient.getTrendingRecommendations(requestOptions),
    enabled,
    refetchInterval,
    staleTime: 1 * 60 * 1000, // بيانات طازجة لدقيقة واحدة
    cacheTime: 5 * 60 * 1000, // تخزين مؤقت لـ 5 دقائق
    retry: 2,
  });
}

// ===== خطافات التفاعل =====

/**
 * خطاف لتسجيل التفاعلات
 */
export function useRecordInteraction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (interaction: Interaction) => 
      recommendationClient.recordInteraction(interaction),
    
    onSuccess: (_, interaction) => {
      // إبطال cache للتوصيات المتعلقة بالمستخدم
      queryClient.invalidateQueries({
        queryKey: ['recommendations', 'user', interaction.user_id]
      });
      
      // إبطال ملف المستخدم
      queryClient.invalidateQueries({
        queryKey: ['user', 'profile', interaction.user_id]
      });
    },
    
    onError: (error) => {
      console.error('فشل في تسجيل التفاعل:', error);
    }
  });
}

/**
 * خطاف لتتبع التفاعلات التلقائية
 */
export function useAutoInteractionTracking(userId: string | null) {
  const recordInteraction = useRecordInteraction();

  const trackView = useCallback((articleId: string, context?: Partial<Context>) => {
    if (!userId) return;
    
    recordInteraction.mutate({
      user_id: userId,
      article_id: articleId,
      interaction_type: 'view',
      context: {
        ...createAutoContext(),
        ...context
      }
    });
  }, [userId, recordInteraction]);

  const trackRead = useCallback((
    articleId: string, 
    readingTime: number, 
    scrollDepth: number,
    context?: Partial<Context>
  ) => {
    if (!userId) return;
    
    recordInteraction.mutate({
      user_id: userId,
      article_id: articleId,
      interaction_type: 'read',
      reading_time: readingTime,
      scroll_depth: scrollDepth,
      rating: Math.min(5, Math.max(1, scrollDepth / 20)), // تقييم بناءً على عمق القراءة
      context: {
        ...createAutoContext(),
        ...context
      }
    });
  }, [userId, recordInteraction]);

  const trackLike = useCallback((articleId: string, context?: Partial<Context>) => {
    if (!userId) return;
    
    recordInteraction.mutate({
      user_id: userId,
      article_id: articleId,
      interaction_type: 'like',
      rating: 4,
      context: {
        ...createAutoContext(),
        ...context
      }
    });
  }, [userId, recordInteraction]);

  const trackShare = useCallback((articleId: string, context?: Partial<Context>) => {
    if (!userId) return;
    
    recordInteraction.mutate({
      user_id: userId,
      article_id: articleId,
      interaction_type: 'share',
      rating: 5,
      context: {
        ...createAutoContext(),
        ...context
      }
    });
  }, [userId, recordInteraction]);

  const trackBookmark = useCallback((articleId: string, context?: Partial<Context>) => {
    if (!userId) return;
    
    recordInteraction.mutate({
      user_id: userId,
      article_id: articleId,
      interaction_type: 'bookmark',
      rating: 4,
      context: {
        ...createAutoContext(),
        ...context
      }
    });
  }, [userId, recordInteraction]);

  return {
    trackView,
    trackRead,
    trackLike,
    trackShare,
    trackBookmark,
    isLoading: recordInteraction.isPending
  };
}

// ===== خطافات ملف المستخدم =====

/**
 * خطاف للحصول على ملف المستخدم
 */
export function useUserProfile(userId: string | null) {
  return useQuery({
    queryKey: ['user', 'profile', userId],
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      return recommendationClient.getUserProfile(userId);
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // بيانات طازجة لـ 10 دقائق
    cacheTime: 30 * 60 * 1000, // تخزين مؤقت لـ 30 دقيقة
    retry: 1,
  });
}

/**
 * خطاف لتحديث ملف المستخدم
 */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profile: UserProfile) => 
      recommendationClient.updateUserProfile(profile),
    
    onSuccess: (_, profile) => {
      // تحديث cache للملف الشخصي
      queryClient.setQueryData(['user', 'profile', profile.user_id], profile);
      
      // إبطال التوصيات لإعادة حسابها
      queryClient.invalidateQueries({
        queryKey: ['recommendations', 'user', profile.user_id]
      });
    },
    
    onError: (error) => {
      console.error('فشل في تحديث ملف المستخدم:', error);
    }
  });
}

// ===== خطافات البحث =====

/**
 * خطاف للبحث في التوصيات
 */
export function useSearchRecommendations() {
  return useMutation({
    mutationFn: ({
      query,
      userId,
      options
    }: {
      query: string;
      userId?: string;
      options?: {
        limit?: number;
        categories?: string[];
        searchType?: 'semantic' | 'keyword' | 'hybrid';
      };
    }) => recommendationClient.searchRecommendations(query, userId, options),
    
    onError: (error) => {
      console.error('فشل في البحث:', error);
    }
  });
}

// ===== خطافات الإحصائيات =====

/**
 * خطاف لإحصائيات التوصيات
 */
export function useRecommendationStats(userId: string | null) {
  return useQuery({
    queryKey: ['recommendations', 'stats', userId],
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      return recommendationClient.getRecommendationStats(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // بيانات طازجة لـ 5 دقائق
    cacheTime: 15 * 60 * 1000, // تخزين مؤقت لـ 15 دقيقة
    retry: 1,
  });
}

// ===== خطافات متقدمة =====

/**
 * خطاف ذكي للتوصيات المختلطة
 */
export function useSmartRecommendations(
  userId: string | null,
  options: {
    includePersonal?: boolean;
    includeTrending?: boolean;
    includeSimilar?: string; // article ID
    categories?: string[];
    limit?: number;
    enabled?: boolean;
  } = {}
) {
  const { 
    includePersonal = true, 
    includeTrending = true, 
    includeSimilar,
    categories,
    limit = 20,
    enabled = true
  } = options;

  // توصيات شخصية
  const personalQuery = useUserRecommendations(userId, {
    limit: Math.ceil(limit * 0.6), // 60% شخصية
    categories,
    enabled: enabled && includePersonal
  });

  // توصيات شائعة
  const trendingQuery = useTrendingRecommendations({
    limit: Math.ceil(limit * 0.3), // 30% شائعة
    category: categories?.[0],
    enabled: enabled && includeTrending
  });

  // مقالات مماثلة
  const similarQuery = useSimilarArticles(includeSimilar || null, {
    limit: Math.ceil(limit * 0.1), // 10% مماثلة
    enabled: enabled && !!includeSimilar
  });

  // دمج النتائج
  const recommendations = useMemo(() => {
    const allRecommendations: Recommendation[] = [];
    const seenIds = new Set<string>();

    // إضافة التوصيات الشخصية أولاً
    if (personalQuery.data?.recommendations) {
      personalQuery.data.recommendations.forEach(rec => {
        if (!seenIds.has(rec.article_id)) {
          allRecommendations.push({ ...rec, source: 'personal' as any });
          seenIds.add(rec.article_id);
        }
      });
    }

    // إضافة التوصيات الشائعة
    if (trendingQuery.data?.recommendations) {
      trendingQuery.data.recommendations.forEach(rec => {
        if (!seenIds.has(rec.article_id)) {
          allRecommendations.push({ ...rec, source: 'trending' as any });
          seenIds.add(rec.article_id);
        }
      });
    }

    // إضافة المقالات المماثلة
    if (similarQuery.data?.recommendations) {
      similarQuery.data.recommendations.forEach(rec => {
        if (!seenIds.has(rec.article_id)) {
          allRecommendations.push({ ...rec, source: 'similar' as any });
          seenIds.add(rec.article_id);
        }
      });
    }

    // ترتيب حسب النقاط مع تنويع المصادر
    return allRecommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }, [personalQuery.data, trendingQuery.data, similarQuery.data, limit]);

  const isLoading = personalQuery.isLoading || trendingQuery.isLoading || similarQuery.isLoading;
  const isError = personalQuery.isError || trendingQuery.isError || similarQuery.isError;
  const error = personalQuery.error || trendingQuery.error || similarQuery.error;

  return {
    recommendations,
    isLoading,
    isError,
    error,
    refetch: () => {
      personalQuery.refetch();
      trendingQuery.refetch();
      similarQuery.refetch();
    }
  };
}

/**
 * خطاف لتتبع الأداء والتحليلات
 */
export function useRecommendationAnalytics(userId: string | null) {
  const [analytics, setAnalytics] = useState({
    viewedRecommendations: 0,
    clickedRecommendations: 0,
    clickThroughRate: 0,
    averageReadingTime: 0,
    favoriteCategories: [] as string[]
  });

  const recordInteraction = useRecordInteraction();

  const trackRecommendationView = useCallback((recommendationIds: string[]) => {
    if (!userId) return;
    
    setAnalytics(prev => ({
      ...prev,
      viewedRecommendations: prev.viewedRecommendations + recommendationIds.length
    }));
  }, [userId]);

  const trackRecommendationClick = useCallback((
    articleId: string, 
    recommendationSource: string
  ) => {
    if (!userId) return;
    
    setAnalytics(prev => ({
      ...prev,
      clickedRecommendations: prev.clickedRecommendations + 1,
      clickThroughRate: (prev.clickedRecommendations + 1) / prev.viewedRecommendations
    }));

    // تسجيل في النظام
    recordInteraction.mutate({
      user_id: userId,
      article_id: articleId,
      interaction_type: 'view',
      context: {
        recommendation_source: recommendationSource,
        ...createAutoContext()
      }
    });
  }, [userId, recordInteraction]);

  return {
    analytics,
    trackRecommendationView,
    trackRecommendationClick
  };
}

// ===== خطاف شامل للتوصيات =====

/**
 * خطاف شامل يجمع كل الوظائف المطلوبة
 */
export function useRecommendationSystem(userId: string | null) {
  const tracking = useAutoInteractionTracking(userId);
  const analytics = useRecommendationAnalytics(userId);
  const search = useSearchRecommendations();
  const updateProfile = useUpdateUserProfile();

  // فحص صحة النظام
  const healthCheck = useQuery({
    queryKey: ['recommendations', 'health'],
    queryFn: () => recommendationClient.healthCheck(),
    refetchInterval: 60 * 1000, // كل دقيقة
    retry: 1,
  });

  return {
    // التوصيات
    getUserRecommendations: (options = {}) => useUserRecommendations(userId, options),
    getContextualRecommendations: (context?: Context, options = {}) => 
      useContextualRecommendations(userId, context, options),
    getSmartRecommendations: (options = {}) => useSmartRecommendations(userId, options),
    
    // التتبع
    ...tracking,
    
    // التحليلات
    ...analytics,
    
    // البحث
    search: search.mutate,
    isSearching: search.isPending,
    searchResults: search.data,
    
    // ملف المستخدم
    updateProfile: updateProfile.mutate,
    isUpdatingProfile: updateProfile.isPending,
    
    // الصحة
    isSystemHealthy: healthCheck.data?.status === 'healthy',
    systemStatus: healthCheck.data,
    
    // المساعدات
    userId,
    isAuthenticated: !!userId
  };
}
