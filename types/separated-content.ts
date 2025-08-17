/**
 * أنواع البيانات الجديدة للمحتوى المنفصل
 * تعريف النماذج المختلفة للأخبار ومقالات الرأي
 */

// ═══════════════════════════════════════════════════════════════════════════
// 📰 أنواع الأخبار
// ═══════════════════════════════════════════════════════════════════════════

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  
  // معلومات النشر
  status: 'draft' | 'published' | 'archived';
  published_at?: Date;
  scheduled_for?: Date;
  
  // التصنيف والكاتب
  category_id?: string;
  author_id: string;
  
  // خصائص الخبر
  breaking: boolean;
  featured: boolean;
  urgent: boolean;
  source?: string;
  location?: string;
  
  // المحتوى المرئي
  featured_image?: string;
  gallery?: NewsGallery;
  video_url?: string;
  
  // SEO
  seo_title?: string;
  seo_description?: string;
  seo_keywords: string[];
  social_image?: string;
  
  // إحصائيات
  views: number;
  likes: number;
  shares: number;
  reading_time?: number;
  
  // تفاعل
  allow_comments: boolean;
  
  // ملخص ذكي
  ai_summary?: string;
  audio_summary_url?: string;
  
  // معلومات النظام
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  
  // العلاقات
  categories?: Category;
  author: User;
  analytics?: NewsAnalytics;
}

export interface NewsGallery {
  images: Array<{
    url: string;
    caption?: string;
    alt?: string;
    credits?: string;
  }>;
}

export interface NewsAnalytics {
  id: string;
  news_article_id: string;
  total_views: number;
  unique_views: number;
  bounce_rate: number;
  avg_time_spent: number;
  social_shares?: Record<string, number>;
  peak_hour?: number;
  peak_day?: string;
  top_countries?: Record<string, number>;
  top_cities?: Record<string, number>;
  created_at: Date;
  updated_at: Date;
}

// ═══════════════════════════════════════════════════════════════════════════
// 📝 أنواع مقالات الرأي
// ═══════════════════════════════════════════════════════════════════════════

export interface OpinionArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  
  // معلومات النشر
  status: 'draft' | 'published' | 'archived';
  published_at?: Date;
  scheduled_for?: Date;
  
  // معلومات الكاتب المتخصص
  writer_id: string;
  writer_role?: WriterRole;
  writer_specialty?: string;
  
  // نوع المقال
  article_type: OpinionType;
  opinion_category?: OpinionCategory;
  
  // خصائص المقال
  featured: boolean;
  is_leader_opinion: boolean;
  difficulty_level: DifficultyLevel;
  estimated_read?: number;
  
  // التقييم والجودة
  quality_score: number;
  engagement_score: number;
  ai_rating: number;
  
  // المحتوى المرئي
  featured_image?: string;
  quote_image?: string;
  author_image?: string;
  
  // كلمات مفتاحية ومواضيع
  tags: string[];
  topics: string[];
  related_entities: string[];
  
  // SEO
  seo_title?: string;
  seo_description?: string;
  seo_keywords: string[];
  social_image?: string;
  
  // إحصائيات
  views: number;
  likes: number;
  saves: number;
  shares: number;
  comments_count: number;
  reading_time?: number;
  
  // تفاعل متقدم
  allow_comments: boolean;
  allow_rating: boolean;
  allow_sharing: boolean;
  
  // محتوى ذكي
  ai_summary?: string;
  key_quotes: string[];
  main_points: string[];
  conclusion?: string;
  
  // ملفات صوتية
  audio_summary_url?: string;
  podcast_url?: string;
  
  // معلومات النظام
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  
  // العلاقات
  writer: ArticleAuthor;
  analytics?: OpinionAnalytics;
}

export interface OpinionAnalytics {
  id: string;
  opinion_article_id: string;
  total_views: number;
  unique_views: number;
  repeat_visits: number;
  scroll_depth: number;
  completion_rate: number;
  reading_pattern?: ReadingPattern;
  interaction_heat?: InteractionHeat;
  avg_rating: number;
  total_ratings: number;
  sentiment_score: number;
  created_at: Date;
  updated_at: Date;
}

// ═══════════════════════════════════════════════════════════════════════════
// 📊 أنواع مساعدة
// ═══════════════════════════════════════════════════════════════════════════

export type WriterRole = 
  | 'محلل' 
  | 'خبير' 
  | 'كاتب رأي' 
  | 'محرر أول' 
  | 'مراسل متخصص'
  | 'أكاديمي'
  | 'باحث';

export type OpinionType = 
  | 'opinion'      // مقال رأي
  | 'analysis'     // تحليل
  | 'interview'    // مقابلة
  | 'editorial'    // افتتاحية
  | 'column';      // عمود

export type OpinionCategory = 
  | 'سياسي' 
  | 'اقتصادي' 
  | 'اجتماعي' 
  | 'ثقافي'
  | 'تقني'
  | 'رياضي'
  | 'صحي';

export type DifficultyLevel = 'easy' | 'medium' | 'advanced';

export interface ReadingPattern {
  speed: 'fast' | 'medium' | 'slow';
  pauses: number[];
  revisits: number[];
}

export interface InteractionHeat {
  sections: Array<{
    position: number;
    engagement: number;
    time_spent: number;
  }>;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🔄 أنواع API الجديدة
// ═══════════════════════════════════════════════════════════════════════════

// استجابات API للأخبار
export interface NewsApiResponse {
  success: boolean;
  news: NewsArticle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface SingleNewsResponse {
  success: boolean;
  news: NewsArticle;
}

// استجابات API لمقالات الرأي
export interface OpinionApiResponse {
  success: boolean;
  opinions: OpinionArticle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface SingleOpinionResponse {
  success: boolean;
  opinion: OpinionArticle;
}

// ═══════════════════════════════════════════════════════════════════════════
// 📝 نماذج الإنشاء والتحديث
// ═══════════════════════════════════════════════════════════════════════════

export interface CreateNewsRequest {
  title: string;
  content: string;
  excerpt?: string;
  category_id?: string;
  breaking?: boolean;
  featured?: boolean;
  urgent?: boolean;
  source?: string;
  location?: string;
  featured_image?: string;
  gallery?: NewsGallery;
  video_url?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  social_image?: string;
  allow_comments?: boolean;
  scheduled_for?: Date;
  metadata?: Record<string, any>;
}

export interface UpdateNewsRequest extends Partial<CreateNewsRequest> {
  id: string;
  status?: 'draft' | 'published' | 'archived';
}

export interface CreateOpinionRequest {
  title: string;
  content: string;
  excerpt?: string;
  writer_id: string;
  writer_role?: WriterRole;
  writer_specialty?: string;
  article_type: OpinionType;
  opinion_category?: OpinionCategory;
  featured?: boolean;
  is_leader_opinion?: boolean;
  difficulty_level?: DifficultyLevel;
  featured_image?: string;
  quote_image?: string;
  author_image?: string;
  tags?: string[];
  topics?: string[];
  related_entities?: string[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  social_image?: string;
  allow_comments?: boolean;
  allow_rating?: boolean;
  allow_sharing?: boolean;
  key_quotes?: string[];
  main_points?: string[];
  conclusion?: string;
  podcast_url?: string;
  scheduled_for?: Date;
  metadata?: Record<string, any>;
}

export interface UpdateOpinionRequest extends Partial<CreateOpinionRequest> {
  id: string;
  status?: 'draft' | 'published' | 'archived';
}

// ═══════════════════════════════════════════════════════════════════════════
// 🔍 أنواع البحث والفلترة
// ═══════════════════════════════════════════════════════════════════════════

export interface NewsSearchFilters {
  status?: 'draft' | 'published' | 'archived' | 'all';
  category_id?: string;
  author_id?: string;
  breaking?: boolean;
  featured?: boolean;
  urgent?: boolean;
  date_from?: Date;
  date_to?: Date;
  search?: string;
  sort?: 'published_at' | 'created_at' | 'views' | 'likes' | 'title';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface OpinionSearchFilters {
  status?: 'draft' | 'published' | 'archived' | 'all';
  writer_id?: string;
  article_type?: OpinionType;
  opinion_category?: OpinionCategory;
  featured?: boolean;
  is_leader_opinion?: boolean;
  difficulty_level?: DifficultyLevel;
  tags?: string[];
  topics?: string[];
  min_quality_score?: number;
  date_from?: Date;
  date_to?: Date;
  search?: string;
  sort?: 'published_at' | 'created_at' | 'views' | 'likes' | 'quality_score' | 'title';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// 📊 إحصائيات وتقارير
// ═══════════════════════════════════════════════════════════════════════════

export interface ContentStats {
  news: {
    total: number;
    published: number;
    draft: number;
    breaking: number;
    featured: number;
    today_views: number;
    week_views: number;
    month_views: number;
  };
  opinions: {
    total: number;
    published: number;
    draft: number;
    featured: number;
    leader_opinions: number;
    avg_quality_score: number;
    today_views: number;
    week_views: number;
    month_views: number;
  };
}