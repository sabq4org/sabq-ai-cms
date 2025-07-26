// دوال API لجلب بيانات المقالات

export interface ArticleData {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  summary?: string;
  ai_summary?: string;
  keywords?: string[];
  seo_keywords?: string | string[];
  author?: { name: string; avatar?: string };
  likes?: number;
  saves?: number;
  shares?: number;
  author_id?: string;
  category?: { name: string; slug: string; color?: string; icon?: string };
  category_id?: string;
  featured_image?: string;
  audio_summary_url?: string;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
  slug?: string;
  views?: number;
  reading_time?: number;
  status?: string;
  allow_comments?: boolean;
  comments_count?: number;
  stats?: {
    likes: number;
    saves: number;
    shares: number;
    comments: number;
  };
}

// جلب المقال للسيرفر (SSR)
export async function getArticleData(id: string): Promise<ArticleData | null> {
  try {
    // تحديد URL بناءً على البيئة
    let baseUrl: string;
    
    if (typeof window !== 'undefined') {
      // في المتصفح - استخدم النطاق الحالي
      baseUrl = window.location.origin;
    } else {
      // في السيرفر - استخدم متغيرات البيئة أو الافتراضي
      // إضافة إصلاح مباشر لموقع sabq.io
      const isProduction = process.env.NODE_ENV === 'production';
      if (isProduction) {
        baseUrl = 'https://sabq.io';
      } else {
        // ترتيب أولوية متغيرات البيئة
        baseUrl = process.env.APP_URL || 
                  process.env.NEXT_PUBLIC_APP_URL || 
                  (process.env.VERCEL_URL && process.env.VERCEL_URL !== 'undefined' ? `https://${process.env.VERCEL_URL}` : null) ||
                  'http://localhost:3002';
      }
    }
    
    // ترميز المعرف للتأكد من صحة URL
    const encodedId = encodeURIComponent(id);
    const apiUrl = `${baseUrl}/api/articles/${encodedId}`;
    
    console.log(`[getArticleData] محاولة جلب مقال بالمعرف:`, id);
    console.log(`[getArticleData] البيئة:`, process.env.NODE_ENV);
    console.log(`[getArticleData] Base URL:`, baseUrl);
    console.log(`[getArticleData] API URL:`, apiUrl);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      // تأكد من عدم cache في حالة development
      ...(process.env.NODE_ENV === 'development' && { cache: 'no-store' })
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`[getArticleData] المقال غير موجود:`, id);
        return null;
      }
      console.error(`[getArticleData] خطأ HTTP عند جلب المقال:`, response.status, response.statusText);
      
      // في حالة فشل الاستدعاء، حاول مع localhost (للـ SSR الداخلي)
      if (typeof window === 'undefined' && !baseUrl.includes('localhost')) {
        console.log(`[getArticleData] محاولة بديلة مع localhost...`);
        try {
          const fallbackUrl = `http://localhost:3002/api/articles/${encodedId}`;
          const fallbackResponse = await fetch(fallbackUrl, {
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store'
          });
          
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            if (fallbackData && fallbackData.id) {
              console.log(`[getArticleData] تم جلب المقال بنجاح من localhost`);
              return fallbackData;
            }
          }
        } catch (fallbackError) {
          console.warn(`[getArticleData] فشلت المحاولة البديلة:`, fallbackError);
        }
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data || !data.id) {
      console.error(`[getArticleData] البيانات المستلمة للمقال فارغة أو غير صحيحة:`, data);
      return null;
    }
    return data;
  } catch (error) {
    console.error('[getArticleData] خطأ في جلب بيانات المقال:', {
      id,
      error: error instanceof Error ? error.message : 'خطأ غير معروف',
      timestamp: new Date().toISOString()
    });
    return null;
  }
}

// تحديد URL كامل للصورة
export function getFullImageUrl(imageUrl?: string): string {
  if (!imageUrl) return '';
  
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
  return `${baseUrl}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
}

// إنشاء URL كامل للمقال
export function getFullArticleUrl(id: string): string {
  let baseUrl: string;
  
  if (typeof window !== 'undefined') {
    baseUrl = window.location.origin;
  } else {
    baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
              process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
              process.env.APP_URL ||
              'https://sabq.io';
  }
  
  return `${baseUrl}/article/${id}`;
}

// تحضير الكلمات المفتاحية
export function prepareKeywords(keywords?: string | string[]): string[] {
  if (!keywords) return [];
  
  if (typeof keywords === 'string') {
    return keywords.split(',').map(k => k.trim()).filter(Boolean);
  }
  
  return Array.isArray(keywords) ? keywords : [];
}
