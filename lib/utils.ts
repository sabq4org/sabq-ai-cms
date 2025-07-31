import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { generateUniqueId, getArticleIdentifier } from './slug-utils'

/**
 * دالة مساعدة لدمج فئات CSS مع دعم Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * تنسيق التاريخ باللغة العربية
 */
export function formatDate(date: Date | string, locale: string = 'ar-SA'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(dateObj)
}

/**
 * تنسيق التاريخ باللغة العربية
 */
export function formatDateAr(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Intl.DateTimeFormat('ar-SA', options).format(date);
}

/**
 * تنسيق الوقت النسبي باللغة العربية
 */
export function getRelativeTimeAr(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'قبل لحظات';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `قبل ${minutes} ${minutes === 1 ? 'دقيقة' : minutes === 2 ? 'دقيقتين' : minutes <= 10 ? 'دقائق' : 'دقيقة'}`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `قبل ${hours} ${hours === 1 ? 'ساعة' : hours === 2 ? 'ساعتين' : hours <= 10 ? 'ساعات' : 'ساعة'}`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `قبل ${days} ${days === 1 ? 'يوم' : days === 2 ? 'يومين' : days <= 10 ? 'أيام' : 'يوم'}`;
  } else {
    return formatDateAr(date);
  }
}

/**
 * اختصار النص مع إضافة ...
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * تنسيق الأرقام بالعربية
 */
export function formatNumberAr(num: number): string {
  return new Intl.NumberFormat('ar-SA').format(num);
}

/**
 * تحويل الأرقام الكبيرة إلى صيغة مختصرة
 */
export function formatCompactNumberAr(num: number): string {
  if (num < 1000) return formatNumberAr(num);
  if (num < 1000000) return `${formatNumberAr(Math.floor(num / 1000))} ألف`;
  if (num < 1000000000) return `${formatNumberAr(Math.floor(num / 1000000))} مليون`;
  return `${formatNumberAr(Math.floor(num / 1000000000))} مليار`;
}

export function getImageUrl(imagePath: string | undefined | null): string {
  console.log('🔍 getImageUrl called with:', imagePath);
  
  if (!imagePath) {
    console.log('⚠️ No image path provided, using placeholder');
    return '/images/placeholder-featured.jpg';
  }
  
  // إذا كان المسار URL كامل، أرجعه كما هو
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log('✅ Using full URL:', imagePath);
    return imagePath;
  }
  
  // إذا كان المسار يبدأ بـ /uploads، تحقق من البيئة
  if (imagePath.startsWith('/uploads/')) {
    // في بيئة الإنتاج، استخدم URL الكامل
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      const siteUrl = 'https://sabq.me';
      const fullUrl = `${siteUrl}${imagePath}`;
      console.log('🌐 Production URL:', fullUrl);
      return fullUrl;
    }
    // في بيئة التطوير، أرجع المسار كما هو
    console.log('🛠️ Development mode, using original path:', imagePath);
    return imagePath;
  }
  
  // إذا كان المسار نسبي، أضف / في البداية
  if (!imagePath.startsWith('/')) {
    const fullPath = `/${imagePath}`;
    console.log('🔧 Adding leading slash:', fullPath);
    return fullPath;
  }
  
  console.log('📁 Using path as-is:', imagePath);
  return imagePath;
}

// دالة مساعدة لإنشاء صور مصغرة محسنة
export function getOptimizedImageUrl(
  imagePath: string | undefined | null, 
  width: number = 800, 
  quality: number = 85
): string {
  const baseUrl = getImageUrl(imagePath);
  
  if (!baseUrl || baseUrl === '/images/placeholder-article.jpg') {
    return baseUrl;
  }
  
  // إذا كان URL خارجي، أرجعه كما هو (Next.js سيحسنه تلقائياً)
  if (baseUrl.startsWith('http')) {
    return baseUrl;
  }
  
  // للصور المحلية، يمكن إضافة معاملات تحسين
  return baseUrl;
}

/**
 * 🔷 دالة مركزية لتحديد المسار المناسب للمقال
 * 
 * منطق صارم وحصري لتوزيع المسارات:
 * • المقالات العادية (أخبار، تقارير، تغطيات) → /article/[id]
 * • مقالات الرأي (كتّاب، زوايا رأي) → /opinion/[id]
 * 
 * @param article - المقال المراد تحديد مساره
 * @returns المسار المناسب للمقال
 */
export function getArticleLink(article: any): string {
  // 🛡️ Guard Clause: التحقق من وجود المقال
  if (!article) {
    console.warn('getArticleLink: Article is missing. Returning fallback link.', { article });
    return '/'; // إرجاع رابط احتياطي آمن
  }

  // استخدام ID فقط - لا روابط عربية
  const identifier = getArticleIdentifier(article);
  
  if (!identifier) {
    console.warn('getArticleLink: Could not generate identifier. Returning fallback link.', { article });
    return '/'; // إرجاع رابط احتياطي آمن
  }

  // التحقق من نوع المقال بعدة طرق
  const isOpinionArticle = (
    // 1. فحص category slug
    article.category?.slug === 'opinion' ||
    article.category?.slug === 'راي' ||
    article.category?.slug === 'رأي' ||
    
    // 2. فحص category name
    article.category?.name === 'رأي' ||
    article.category?.name === 'راي' ||
    article.category?.name === 'Opinion' ||
    article.category?.name_ar === 'رأي' ||
    article.category?.name_ar === 'راي' ||
    
    // 3. فحص category_name المرفقة مع المقال
    article.category_name === 'رأي' ||
    article.category_name === 'راي' ||
    article.category_name === 'Opinion' ||
    
    // 4. فحص type field إذا كان موجود
    article.type === 'OPINION' ||
    article.type === 'opinion' ||
    
    // 5. فحص metadata أو خصائص إضافية
    article.metadata?.type === 'opinion' ||
    article.is_opinion === true ||
    
    // 6. فحص category_id المعروف لمقالات الرأي (إذا كان هناك ID محدد)
    article.category_id === 'opinion' ||
    
    // 7. فحص العنوان أو المحتوى للكلمات المفتاحية (احتياطي)
    article.title?.includes('رأي') ||
    article.title?.includes('وجهة نظر') ||
    article.tags?.some((tag: string) => ['رأي', 'راي', 'opinion'].includes(tag?.toLowerCase()))
  );

  // إرجاع المسار المناسب بناءً على النوع
  if (isOpinionArticle) {
    return `/opinion/${identifier}`;
  }
  
  // جميع المقالات الأخرى تذهب لمسار المقالات العادية
  return `/article/${identifier}`;
}

// Force rebuild - 2025-01-04 