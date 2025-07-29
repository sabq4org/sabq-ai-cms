/**
 * تحسينات الأداء للنظام
 */

// إعدادات Cache للبيانات
export const CACHE_CONFIG = {
  // مدة cache للمقالات (بالثواني)
  ARTICLES: {
    HOME_PAGE: 300,      // 5 دقائق للصفحة الرئيسية
    CATEGORY: 180,       // 3 دقائق لصفحات التصنيف
    SINGLE: 600,         // 10 دقائق للمقال الواحد
    SEARCH: 60,          // دقيقة واحدة للبحث
  },
  
  // مدة cache للتصنيفات
  CATEGORIES: 3600,      // ساعة واحدة
  
  // مدة cache للإحصائيات
  STATS: 300,            // 5 دقائق
  
  // مدة cache للتعليقات
  COMMENTS: 120,         // دقيقتان
};

// إعدادات تحسين الصور
export const IMAGE_OPTIMIZATION = {
  // الأحجام المختلفة للصور
  SIZES: {
    THUMBNAIL: { width: 150, height: 150 },
    SMALL: { width: 300, height: 200 },
    MEDIUM: { width: 600, height: 400 },
    LARGE: { width: 1200, height: 800 },
    HERO: { width: 1920, height: 1080 },
  },
  
  // جودة الصور
  QUALITY: {
    HIGH: 90,
    MEDIUM: 80,
    LOW: 60,
    THUMBNAIL: 70,
  },
  
  // صيغ الصور المدعومة
  FORMATS: ['webp', 'avif', 'jpg'],
  
  // Lazy loading configuration
  LAZY_LOADING: {
    rootMargin: '50px 0px',
    threshold: 0.01,
  },
};

// إعدادات Prefetch
export const PREFETCH_CONFIG = {
  // عدد المقالات للـ prefetch
  ARTICLES_COUNT: 5,
  
  // تأخير prefetch (بالملي ثانية)
  DELAY: 2000,
  
  // prefetch فقط على WiFi
  WIFI_ONLY: true,
};

// Headers للـ Cache
export const CACHE_HEADERS = {
  // للمحتوى الثابت (صور، CSS، JS)
  STATIC: {
    'Cache-Control': 'public, max-age=31536000, immutable',
  },
  
  // للمحتوى الديناميكي (API)
  DYNAMIC: {
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
  },
  
  // للمحتوى الخاص (user-specific)
  PRIVATE: {
    'Cache-Control': 'private, no-cache, no-store, must-revalidate',
  },
};

// دالة لتحسين استعلامات قاعدة البيانات
export const optimizeQuery = {
  // استخدام select محددة بدلاً من *
  articleFields: {
    id: true,
    title: true,
    slug: true,
    excerpt: true,
    featured_image: true,
    published_at: true,
    created_at: true,
    views: true,
    reading_time: true,
    breaking: true,
    featured: true,
    status: true,
    // العلاقات
    categories: {
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        icon: true,
      }
    },
    author: {
      select: {
        id: true,
        name: true,
        avatar: true,
      }
    },
  },
  
  // حد أقصى للنتائج
  limits: {
    HOME_PAGE: 20,
    CATEGORY: 15,
    SEARCH: 30,
    RELATED: 6,
  }
};

// دالة لتحسين أداء التحميل
export function getOptimizedLoadingStrategy(type: 'critical' | 'high' | 'normal' | 'low') {
  switch (type) {
    case 'critical':
      return {
        priority: true,
        loading: 'eager' as const,
        fetchPriority: 'high' as const,
      };
    case 'high':
      return {
        priority: false,
        loading: 'eager' as const,
        fetchPriority: 'high' as const,
      };
    case 'normal':
      return {
        priority: false,
        loading: 'lazy' as const,
        fetchPriority: 'auto' as const,
      };
    case 'low':
      return {
        priority: false,
        loading: 'lazy' as const,
        fetchPriority: 'low' as const,
      };
  }
}

// دالة للتحقق من سرعة الاتصال
export function getConnectionSpeed(): 'slow' | 'medium' | 'fast' {
  if (typeof window === 'undefined') return 'medium';
  
  const nav = navigator as any;
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
  
  if (!connection) return 'medium';
  
  // التحقق من نوع الاتصال
  if (connection.effectiveType) {
    switch (connection.effectiveType) {
      case 'slow-2g':
      case '2g':
        return 'slow';
      case '3g':
        return 'medium';
      case '4g':
      case '5g':
        return 'fast';
    }
  }
  
  // التحقق من سرعة التحميل
  if (connection.downlink) {
    if (connection.downlink < 1) return 'slow';
    if (connection.downlink < 5) return 'medium';
    return 'fast';
  }
  
  return 'medium';
}

// دالة لتحديد جودة الصورة بناءً على سرعة الاتصال
export function getAdaptiveImageQuality(): number {
  const speed = getConnectionSpeed();
  
  switch (speed) {
    case 'slow':
      return IMAGE_OPTIMIZATION.QUALITY.LOW;
    case 'medium':
      return IMAGE_OPTIMIZATION.QUALITY.MEDIUM;
    case 'fast':
      return IMAGE_OPTIMIZATION.QUALITY.HIGH;
    default:
      return IMAGE_OPTIMIZATION.QUALITY.MEDIUM;
  }
}

// دالة لتحسين روابط S3
export function optimizeS3ImageUrl(url: string): string {
  if (!url || !url.includes('amazonaws.com')) return url;
  
  try {
    const urlObj = new URL(url);
    
    // إزالة معاملات التوقيع المعقدة
    const cleanParams = new URLSearchParams();
    
    // الاحتفاظ فقط بالمعاملات الأساسية
    ['width', 'height', 'quality', 'format'].forEach(param => {
      if (urlObj.searchParams.has(param)) {
        cleanParams.set(param, urlObj.searchParams.get(param)!);
      }
    });
    
    // بناء URL نظيف
    urlObj.search = cleanParams.toString();
    return urlObj.toString();
  } catch {
    return url;
  }
}

// دالة للحصول على CloudFront URL
export function getCloudFrontUrl(s3Url: string): string {
  if (!s3Url || !s3Url.includes('s3.amazonaws.com')) return s3Url;
  
  const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN;
  if (!cloudFrontDomain) return s3Url;
  
  try {
    const url = new URL(s3Url);
    const path = url.pathname;
    return `https://${cloudFrontDomain}${path}`;
  } catch {
    return s3Url;
  }
}

// دالة لتفعيل Service Worker للـ offline support
export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  
  if (process.env.NODE_ENV === 'production') {
    navigator.serviceWorker.register('/sw.js').then(
      registration => console.log('SW registered:', registration),
      error => console.log('SW registration failed:', error)
    );
  }
}

// دالة لـ Intersection Observer للـ lazy loading
export function createLazyLoadObserver(callback: (entries: IntersectionObserverEntry[]) => void) {
  if (typeof window === 'undefined') return null;
  
  return new IntersectionObserver(callback, {
    rootMargin: IMAGE_OPTIMIZATION.LAZY_LOADING.rootMargin,
    threshold: IMAGE_OPTIMIZATION.LAZY_LOADING.threshold,
  });
}

// دالة لتحسين أداء التمرير
export function optimizeScrollPerformance() {
  if (typeof window === 'undefined') return;
  
  let ticking = false;
  
  function updateScrollPosition() {
    // تحديث موضع التمرير
    ticking = false;
  }
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateScrollPosition);
      ticking = true;
    }
  }, { passive: true });
} 