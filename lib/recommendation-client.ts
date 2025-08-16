/**
 * محرك التوصيات الذكي - سبق الذكية
 * عميل ربط مع Next.js
 * Sabq AI Recommendation Engine - Next.js Client
 */

import { z } from 'zod';

// ===== أنواع البيانات =====

// نوع التوصية
export const RecommendationSchema = z.object({
  article_id: z.string(),
  title: z.string(),
  category: z.string(),
  author: z.string().optional(),
  publish_date: z.string(),
  score: z.number(),
  confidence: z.number(),
  reasoning: z.string().optional(),
  thumbnail: z.string().optional(),
  reading_time_estimate: z.number().optional(),
  tags: z.array(z.string()).default([]),
  sentiment_score: z.number().optional()
});

export type Recommendation = z.infer<typeof RecommendationSchema>;

// نوع استجابة التوصيات
export const RecommendationsResponseSchema = z.object({
  recommendations: z.array(RecommendationSchema),
  total_count: z.number(),
  user_id: z.string(),
  model_used: z.string(),
  generation_time: z.number(),
  cache_hit: z.boolean(),
  explanation: z.string().optional(),
  diversity_score: z.number().optional(),
  novelty_score: z.number().optional()
});

export type RecommendationsResponse = z.infer<typeof RecommendationsResponseSchema>;

// نوع التفاعل
export const InteractionSchema = z.object({
  user_id: z.string(),
  article_id: z.string(),
  interaction_type: z.enum(['view', 'like', 'share', 'comment', 'read', 'bookmark']),
  rating: z.number().min(0).max(5).optional(),
  reading_time: z.number().optional(),
  scroll_depth: z.number().min(0).max(100).optional(),
  context: z.record(z.any()).optional()
});

export type Interaction = z.infer<typeof InteractionSchema>;

// نوع السياق
export const ContextSchema = z.object({
  device_type: z.enum(['mobile', 'tablet', 'desktop']).optional(),
  time_of_day: z.enum(['morning', 'afternoon', 'evening', 'night']).optional(),
  day_of_week: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']).optional(),
  location: z.string().optional(),
  weather: z.string().optional(),
  mood: z.enum(['happy', 'sad', 'excited', 'calm', 'focused', 'tired']).optional(),
  session_duration: z.number().optional(),
  previous_articles: z.array(z.string()).default([])
});

export type Context = z.infer<typeof ContextSchema>;

// نوع ملف المستخدم
export const UserProfileSchema = z.object({
  user_id: z.string(),
  interests: z.array(z.string()),
  reading_preferences: z.record(z.number()),
  behavior_pattern: z.string(),
  engagement_level: z.number(),
  preferred_categories: z.array(z.string()),
  reading_time_preference: z.enum(['short', 'medium', 'long']).optional(),
  content_depth_preference: z.enum(['light', 'detailed', 'technical']).optional(),
  update_frequency: z.enum(['realtime', 'hourly', 'daily']).default('hourly')
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

// ===== إعدادات العميل =====

interface RecommendationClientConfig {
  baseUrl: string;
  apiKey?: string;
  timeout: number;
  retries: number;
  cacheEnabled: boolean;
  debug: boolean;
}

const defaultConfig: RecommendationClientConfig = {
  baseUrl: process.env.NEXT_PUBLIC_ML_ENGINE_URL || 'http://localhost:8000',
  timeout: 5000,
  retries: 3,
  cacheEnabled: true,
  debug: process.env.NODE_ENV === 'development'
};

// ===== عميل التوصيات =====

export class RecommendationClient {
  private config: RecommendationClientConfig;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }>;

  constructor(config: Partial<RecommendationClientConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.cache = new Map();
  }

  // ===== الطرق الخاصة =====

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    schema?: z.ZodSchema<T>
  ): Promise<T> {
    const url = `${this.config.baseUrl}/api/v1${endpoint}`;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (this.config.apiKey) {
      defaultHeaders['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      },
      signal: AbortSignal.timeout(this.config.timeout)
    };

    let lastError: Error;

    for (let attempt = 1; attempt <= this.config.retries; attempt++) {
      try {
        if (this.config.debug) {
          console.log(`[RecommendationClient] ${options.method || 'GET'} ${url} (attempt ${attempt})`);
        }

        const response = await fetch(url, requestOptions);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // التحقق من صحة البيانات إذا تم توفير schema
        if (schema) {
          return schema.parse(data);
        }

        return data;

      } catch (error) {
        lastError = error as Error;
        
        if (this.config.debug) {
          console.error(`[RecommendationClient] Attempt ${attempt} failed:`, error);
        }

        // لا نعيد المحاولة في حالة الأخطاء غير القابلة للاسترداد
        if (error instanceof z.ZodError || 
            (error as any)?.name === 'AbortError' ||
            attempt === this.config.retries) {
          break;
        }

        // انتظار قبل المحاولة التالية
        await this.delay(Math.pow(2, attempt - 1) * 1000);
      }
    }

    throw lastError!;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getCacheKey(endpoint: string, params?: any): string {
    const paramsStr = params ? JSON.stringify(params) : '';
    return `${endpoint}:${paramsStr}`;
  }

  private getFromCache<T>(key: string): T | null {
    if (!this.config.cacheEnabled) return null;

    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.timestamp + cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache<T>(key: string, data: T, ttl: number): void {
    if (!this.config.cacheEnabled) return;

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  // ===== الطرق العامة =====

  /**
   * الحصول على توصيات شخصية للمستخدم
   */
  async getUserRecommendations(
    userId: string,
    options: {
      limit?: number;
      categories?: string[];
      excludeRead?: boolean;
      diversityFactor?: number;
      noveltyFactor?: number;
    } = {}
  ): Promise<RecommendationsResponse> {
    const cacheKey = this.getCacheKey(`/recommendations/user/${userId}`, options);
    
    // التحقق من التخزين المؤقت
    const cached = this.getFromCache<RecommendationsResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.categories) params.append('categories', options.categories.join(','));
    if (options.excludeRead) params.append('exclude_read', 'true');
    if (options.diversityFactor) params.append('diversity', options.diversityFactor.toString());
    if (options.noveltyFactor) params.append('novelty', options.noveltyFactor.toString());

    const endpoint = `/recommendations/user/${userId}?${params.toString()}`;
    
    const result = await this.makeRequest(endpoint, {}, RecommendationsResponseSchema);
    
    // حفظ في التخزين المؤقت لمدة 10 دقائق
    this.setCache(cacheKey, result, 10 * 60 * 1000);
    
    return result;
  }

  /**
   * الحصول على توصيات سياقية
   */
  async getContextualRecommendations(
    userId: string,
    context: Context,
    options: {
      limit?: number;
      categories?: string[];
    } = {}
  ): Promise<RecommendationsResponse> {
    const endpoint = `/recommendations/contextual/${userId}`;
    
    const body = {
      context,
      ...options
    };

    return await this.makeRequest(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify(body)
      },
      RecommendationsResponseSchema
    );
  }

  /**
   * الحصول على المقالات المماثلة
   */
  async getSimilarArticles(
    articleId: string,
    options: {
      limit?: number;
      similarityThreshold?: number;
    } = {}
  ): Promise<RecommendationsResponse> {
    const cacheKey = this.getCacheKey(`/recommendations/similar/${articleId}`, options);
    
    const cached = this.getFromCache<RecommendationsResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.similarityThreshold) {
      params.append('threshold', options.similarityThreshold.toString());
    }

    const endpoint = `/recommendations/similar/${articleId}?${params.toString()}`;
    
    const result = await this.makeRequest(endpoint, {}, RecommendationsResponseSchema);
    
    // حفظ في التخزين المؤقت لمدة 30 دقيقة
    this.setCache(cacheKey, result, 30 * 60 * 1000);
    
    return result;
  }

  /**
   * الحصول على التوصيات الشائعة
   */
  async getTrendingRecommendations(options: {
    timeRange?: 'hour' | 'day' | 'week' | 'month';
    category?: string;
    limit?: number;
  } = {}): Promise<RecommendationsResponse> {
    const cacheKey = this.getCacheKey('/recommendations/trending', options);
    
    const cached = this.getFromCache<RecommendationsResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    const params = new URLSearchParams();
    if (options.timeRange) params.append('time_range', options.timeRange);
    if (options.category) params.append('category', options.category);
    if (options.limit) params.append('limit', options.limit.toString());

    const endpoint = `/recommendations/trending?${params.toString()}`;
    
    const result = await this.makeRequest(endpoint, {}, RecommendationsResponseSchema);
    
    // حفظ في التخزين المؤقت لمدة 5 دقائق
    this.setCache(cacheKey, result, 5 * 60 * 1000);
    
    return result;
  }

  /**
   * تسجيل تفاعل المستخدم
   */
  async recordInteraction(interaction: Interaction): Promise<{ success: boolean; message: string }> {
    const endpoint = '/interactions/record';
    
    return await this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(interaction)
    });
  }

  /**
   * تحديث ملف المستخدم
   */
  async updateUserProfile(profile: UserProfile): Promise<{ success: boolean; message: string }> {
    const endpoint = `/users/profile/${profile.user_id}`;
    
    return await this.makeRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(profile)
    });
  }

  /**
   * الحصول على ملف المستخدم
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    const cacheKey = this.getCacheKey(`/users/profile/${userId}`);
    
    const cached = this.getFromCache<UserProfile>(cacheKey);
    if (cached) {
      return cached;
    }

    const endpoint = `/users/profile/${userId}`;
    
    const result = await this.makeRequest(endpoint, {}, UserProfileSchema);
    
    // حفظ في التخزين المؤقت لمدة 15 دقيقة
    this.setCache(cacheKey, result, 15 * 60 * 1000);
    
    return result;
  }

  /**
   * الحصول على إحصائيات التوصيات
   */
  async getRecommendationStats(userId: string): Promise<{
    total_recommendations: number;
    clicked_recommendations: number;
    click_through_rate: number;
    preferred_categories: string[];
    engagement_score: number;
  }> {
    const endpoint = `/analytics/user/${userId}/recommendations`;
    
    return await this.makeRequest(endpoint);
  }

  /**
   * البحث في التوصيات
   */
  async searchRecommendations(
    query: string,
    userId?: string,
    options: {
      limit?: number;
      categories?: string[];
      searchType?: 'semantic' | 'keyword' | 'hybrid';
    } = {}
  ): Promise<RecommendationsResponse> {
    const endpoint = '/recommendations/search';
    
    const body = {
      query,
      user_id: userId,
      ...options
    };

    return await this.makeRequest(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify(body)
      },
      RecommendationsResponseSchema
    );
  }

  /**
   * تنظيف التخزين المؤقت
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * فحص صحة الاتصال
   */
  async healthCheck(): Promise<{
    status: string;
    services: Record<string, string>;
    timestamp: number;
  }> {
    const endpoint = '/health';
    return await this.makeRequest(endpoint);
  }
}

// ===== مثيل افتراضي =====
export const recommendationClient = new RecommendationClient();

// ===== دوال مساعدة =====

/**
 * تحويل نوع التفاعل إلى نقاط
 */
export function getInteractionScore(type: Interaction['interaction_type']): number {
  const scores = {
    view: 1,
    like: 2,
    share: 3,
    comment: 4,
    bookmark: 4,
    read: 5
  };
  return scores[type] || 1;
}

/**
 * تحويل السياق إلى وقت اليوم
 */
export function getCurrentTimeOfDay(): Context['time_of_day'] {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

/**
 * تحويل السياق إلى يوم الأسبوع
 */
export function getCurrentDayOfWeek(): Context['day_of_week'] {
  const days: Context['day_of_week'][] = [
    'sunday', 'monday', 'tuesday', 'wednesday', 
    'thursday', 'friday', 'saturday'
  ];
  return days[new Date().getDay()];
}

/**
 * كشف نوع الجهاز
 */
export function detectDeviceType(): Context['device_type'] {
  if (typeof window === 'undefined') return 'desktop';
  
  const userAgent = window.navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
    return 'mobile';
  }
  return 'desktop';
}

/**
 * إنشاء سياق تلقائي
 */
export function createAutoContext(previousArticles: string[] = []): Context {
  return {
    device_type: detectDeviceType(),
    time_of_day: getCurrentTimeOfDay(),
    day_of_week: getCurrentDayOfWeek(),
    previous_articles: previousArticles
  };
}
