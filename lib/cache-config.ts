/**
 * إعدادات التخزين المؤقت الذكية للصحف الإخبارية
 * 
 * نظام متدرج للكاش حسب أهمية وحداثة المحتوى
 */

// أوقات التخزين المؤقت (بالثواني)
export const SMART_CACHE_TTL = {
  // الأخبار العاجلة - بدون كاش تقريباً
  BREAKING_NEWS: 30, // 30 ثانية فقط
  
  // الأخبار الحديثة (آخر ساعة)
  FRESH_NEWS: 60, // دقيقة واحدة
  
  // الأخبار العادية
  REGULAR_NEWS: 60 * 2, // دقيقتين
  
  // المقالات الشائعة/الأكثر قراءة
  POPULAR_ARTICLES: 60 * 5, // 5 دقائق
  
  // المحتوى الثابت
  STATIC_CONTENT: {
    CATEGORIES: 60 * 60 * 24, // يوم كامل
    AUTHORS: 60 * 60 * 12, // 12 ساعة
    PAGES: 60 * 60, // ساعة واحدة
  },
  
  // الإحصائيات والتحليلات
  ANALYTICS: {
    REALTIME: 30, // 30 ثانية للإحصائيات الفورية
    HOURLY: 60 * 5, // 5 دقائق للإحصائيات بالساعة
    DAILY: 60 * 30, // 30 دقيقة للإحصائيات اليومية
  },
  
  // البحث
  SEARCH: {
    TRENDING: 60, // دقيقة للبحث الشائع
    REGULAR: 60 * 2, // دقيقتين للبحث العادي
  }
};

/**
 * تحديد مدة الكاش حسب نوع المحتوى
 */
export function getCacheTTL(contentType: string, metadata?: any): number {
  // الأخبار العاجلة
  if (metadata?.isBreaking || metadata?.breaking) {
    return SMART_CACHE_TTL.BREAKING_NEWS;
  }
  
  // الأخبار الحديثة (منشورة خلال الساعة الماضية)
  if (metadata?.publishedAt) {
    const publishTime = new Date(metadata.publishedAt).getTime();
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);
    
    if (publishTime > hourAgo) {
      return SMART_CACHE_TTL.FRESH_NEWS;
    }
  }
  
  // حسب نوع المحتوى
  switch (contentType) {
    case 'articles':
    case 'news':
      return SMART_CACHE_TTL.REGULAR_NEWS;
      
    case 'popular':
    case 'trending':
      return SMART_CACHE_TTL.POPULAR_ARTICLES;
      
    case 'categories':
      return SMART_CACHE_TTL.STATIC_CONTENT.CATEGORIES;
      
    case 'authors':
    case 'users':
      return SMART_CACHE_TTL.STATIC_CONTENT.AUTHORS;
      
    case 'stats':
    case 'analytics':
      return SMART_CACHE_TTL.ANALYTICS.HOURLY;
      
    case 'search':
      return SMART_CACHE_TTL.SEARCH.REGULAR;
      
    default:
      return SMART_CACHE_TTL.FRESH_NEWS; // افتراضي: دقيقة واحدة
  }
}

/**
 * تحديد ما إذا كان المحتوى يجب تجاوز الكاش
 */
export function shouldBypassCache(request: Request, metadata?: any): boolean {
  // تجاوز الكاش للأخبار العاجلة جداً
  if (metadata?.priority === 'urgent' || metadata?.breaking === true) {
    return true;
  }
  
  // تجاوز الكاش إذا طُلب ذلك
  const url = new URL(request.url);
  if (url.searchParams.get('nocache') === 'true' || 
      url.searchParams.get('refresh') === 'true') {
    return true;
  }
  
  // تجاوز الكاش للمحررين والمدراء
  const userRole = request.headers.get('x-user-role');
  if (userRole === 'admin' || userRole === 'editor') {
    return true;
  }
  
  return false;
} 