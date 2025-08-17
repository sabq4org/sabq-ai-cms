// 🎯 أنواع البيانات لنظام مُقترب
// تصميم معماري متكامل للزوايا والمقالات

export interface CreateAngleForm {
  title: string; // عنوان الزاوية
  slug?: string; // رابط الزاوية (يُولد تلقائيًا من العنوان)
  description: string; // وصف مختصر للزاوية
  icon?: string; // أيقونة الزاوية (من مكتبة Lucide)
  themeColor: string; // اللون البارز للزاوية (hex)
  authorId: string; // صاحب الزاوية (user.id)
  isFeatured: boolean; // هل الزاوية مميزة؟
  isPublished: boolean; // حالة النشر
  coverImage?: string; // صورة غلاف الزاوية (Cloudinary)
}

export interface Angle {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon?: string;
  themeColor: string;
  authorId: string;
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
  coverImage?: string;
  audio_summary_url?: string; // رابط الصوت للزاوية
  isFeatured: boolean;
  isPublished: boolean;
  articlesCount?: number;
  totalViews?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MuqtarabArticleForm {
  angleId: string; // معرف الزاوية
  title: string;
  excerpt?: string; // ملخص اختياري
  content: string; // باستخدام محرر Tiptap
  tags?: string[]; // وسوم اختيارية
  readingTime?: number;
  authorId: string;
  sentiment?: "neutral" | "positive" | "critical"; // اتجاه المقال
  coverImage?: string;
  isPublished: boolean;
  publishDate?: Date;
}

export interface AngleArticle {
  id: string;
  angleId: string;
  angle?: Angle;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  authorId: string;
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
  sentiment?: "neutral" | "positive" | "critical";
  tags?: string[];
  coverImage?: string;
  isPublished: boolean;
  publishDate?: Date;
  readingTime?: number;
  views?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AngleStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalViews: number;
  avgReadingTime: number;
  mostViewedArticle?: {
    id: string;
    title: string;
    views: number;
  };
  recentActivity?: {
    type: "article_created" | "article_published" | "article_updated";
    title: string;
    timestamp: Date;
  }[];
}

export interface AngleFilterOptions {
  sortBy: "newest" | "popular" | "trending";
  timeRange: "all" | "week" | "month" | "year";
  sentiment?: "neutral" | "positive" | "critical";
  tags?: string[];
}
