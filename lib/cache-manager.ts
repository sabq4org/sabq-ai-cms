import { cache as redis } from "@/lib/redis";

// مفاتيح cache محسنة
export const ENHANCED_CACHE_KEYS = {
  // Articles
  ARTICLES_LIST: (params: string) => `articles:list:${params}`,
  ARTICLES_COUNT: (params: string) => `articles:count:${params}`,
  ARTICLE_DETAIL: (id: string) => `article:detail:${id}`,
  
  // Categories  
  CATEGORIES_ACTIVE: 'categories:active:list',
  CATEGORY_ARTICLES: (slug: string, params: string) => `category:${slug}:articles:${params}`,
  
  // Deep Analysis
  DEEP_ANALYSIS_LIST: (params: string) => `deep_analysis:list:${params}`,
  DEEP_ANALYSIS_DETAIL: (id: string) => `deep_analysis:detail:${id}`,
  
  // News
  NEWS_STATS: 'news:stats',
  NEWS_LIST: (params: string) => `news:list:${params}`,
  
  // Authors
  AUTHORS_BY_IDS: (ids: string[]) => `authors:${ids.sort().join(',')}`,
  
  // Static data
  STATIC_CATEGORIES: 'static:categories',
  STATIC_AUTHORS: 'static:authors'
}

// أوقات cache محسنة (بالثواني)
export const ENHANCED_CACHE_TTL = {
  // بيانات سريعة التغيير
  ARTICLES_LIST: 180,      // 3 دقائق
  NEWS_STATS: 300,         // 5 دقائق
  ARTICLE_VIEWS: 60,       // دقيقة واحدة
  
  // بيانات متوسطة التغيير  
  ARTICLE_DETAIL: 600,     // 10 دقائق
  DEEP_ANALYSIS: 900,      // 15 دقيقة
  CATEGORY_ARTICLES: 300,  // 5 دقائق
  
  // بيانات بطيئة التغيير
  CATEGORIES: 1800,        // 30 دقيقة
  AUTHORS: 3600,           // ساعة
  STATIC_DATA: 7200        // ساعتان
}

// دالة لتوليد مفتاح cache من المعاملات
export function generateCacheKey(baseKey: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      if (params[key] !== undefined && params[key] !== null) {
        acc[key] = params[key]
      }
      return acc
    }, {} as Record<string, any>)
  
  const paramString = Object.keys(sortedParams).length > 0 
    ? `:${Buffer.from(JSON.stringify(sortedParams)).toString('base64').substring(0, 20)}`
    : ''
  
  return `${baseKey}${paramString}`
}

// دالة cache محسنة مع fallback
export async function getCachedData<T>(
  key: string, 
  fallback: () => Promise<T>, 
  ttl: number = ENHANCED_CACHE_TTL.ARTICLES_LIST,
  useStaleWhileRevalidate: boolean = true
): Promise<T> {
  try {
    // محاولة الحصول على البيانات من cache
    const cached = await redis.get<string>(key)
    if (cached) {
      // إرجاع البيانات مباشرة إذا كانت موجودة
      return JSON.parse(cached) as T
    }
  } catch (cacheError) {
    console.warn('⚠️ خطأ في قراءة cache:', cacheError)
  }

  try {
    // جلب البيانات الجديدة
    const freshData = await fallback()
    
    // حفظ في cache (لا نتوقف في حالة فشل cache)
    try {
      await redis.set(key, JSON.stringify(freshData), ttl)
    } catch (cacheSetError) {
      console.warn('⚠️ خطأ في حفظ cache:', cacheSetError)
    }
    
    return freshData
  } catch (error) {
    console.error('❌ خطأ في جلب البيانات:', error)
    throw error
  }
}

// دالة لحذف cache مرتبط بالمقالات عند التحديث
export async function invalidateArticleCache(articleId?: string, categoryId?: string) {
  const keysToDelete = [
    ENHANCED_CACHE_KEYS.ARTICLES_LIST('*'),
    ENHANCED_CACHE_KEYS.NEWS_LIST('*'),
    ENHANCED_CACHE_KEYS.NEWS_STATS
  ]
  
  if (articleId) {
    keysToDelete.push(ENHANCED_CACHE_KEYS.ARTICLE_DETAIL(articleId))
  }
  
  if (categoryId) {
    keysToDelete.push(ENHANCED_CACHE_KEYS.CATEGORY_ARTICLES(categoryId, '*'))
  }
  
  try {
    await Promise.all(
      keysToDelete.map(pattern => 
        pattern.includes('*') 
          ? redis.clearPattern(pattern)
          : redis.del(pattern)
      )
    )
  } catch (error) {
    console.warn('⚠️ خطأ في حذف cache:', error)
  }
}

// دالة cache للقوائم مع pagination
export async function getCachedList<T>(
  baseKey: string,
  params: Record<string, any>,
  fetcher: () => Promise<{ data: T[], total: number }>,
  ttl: number = ENHANCED_CACHE_TTL.ARTICLES_LIST
): Promise<{ data: T[], total: number, fromCache: boolean }> {
  const cacheKey = generateCacheKey(baseKey, params)
  
  try {
    const cached = await redis.get<string>(cacheKey)
    if (cached) {
      const result = JSON.parse(cached)
      return { ...result, fromCache: true }
    }
  } catch (error) {
    console.warn('⚠️ خطأ في قراءة cache للقائمة:', error)
  }
  
  try {
    const result = await fetcher()
    
    // حفظ في cache
    try {
      await redis.set(cacheKey, JSON.stringify(result), ttl)
    } catch (cacheError) {
      console.warn('⚠️ خطأ في حفظ cache للقائمة:', cacheError)
    }
    
    return { ...result, fromCache: false }
  } catch (error) {
    console.error('❌ خطأ في جلب القائمة:', error)
    throw error
  }
}
