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
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/articles/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      // تأكد من عدم cache في حالة development
      ...(process.env.NODE_ENV === 'development' && { cache: 'no-store' })
    });

    if (!response.ok) {
      console.error(`خطأ في جلب المقال ${id}:`, response.status);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('خطأ في جلب بيانات المقال:', error);
    return null;
  }
}

// تحديد URL كامل للصورة
export function getFullImageUrl(imageUrl?: string): string {
  if (!imageUrl) return '';
  
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
}

// إنشاء URL كامل للمقال
export function getFullArticleUrl(id: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
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
