/**
 * أنواع البيانات الموحدة لنماذج المقالات
 * يوحد جميع التنسيقات المختلفة المستخدمة في الواجهات المختلفة
 */

// نموذج البيانات الأساسي للمقال
export interface BaseArticleData {
  id?: string;
  title: string;
  content: string;
  excerpt?: string;
  summary?: string; // مرادف لـ excerpt
  subtitle?: string;
  featured_image?: string;
  status?: 'draft' | 'published' | 'scheduled';
  featured?: boolean;
  is_featured?: boolean; // مرادف
  breaking?: boolean;
  is_breaking?: boolean; // مرادف
  keywords?: string | string[];
  tags?: string | string[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  metadata?: Record<string, any>;
  published_at?: Date | string;
  scheduled_for?: Date | string;
  slug?: string;
}

// أنواع مختلفة لحقول المؤلف (للتوافق مع الواجهات المختلفة)
export interface AuthorFieldVariants {
  author_id?: string;           // التنسيق الأساسي
  authorId?: string;           // التنسيق الحديث
  article_author_id?: string;  // التنسيق القديم
}

// أنواع مختلفة لحقول التصنيف
export interface CategoryFieldVariants {
  category_id?: string;  // التنسيق الأساسي
  categoryId?: string;   // التنسيق الحديث
}

// نموذج النموذج الموحد للمقال
export interface UnifiedArticleForm extends 
  BaseArticleData, 
  AuthorFieldVariants, 
  CategoryFieldVariants {
  
  // حقول إضافية للواجهات المتقدمة
  publishType?: 'immediate' | 'scheduled';
  scheduledDate?: Date | string;
  isFeatured?: boolean;
  isBreaking?: boolean;
  
  // حقول خاصة بالذكاء الاصطناعي
  ai_sentiment?: string;
  ai_compatibility_score?: number;
  ai_summary?: string;
  ai_keywords?: string[];
  ai_mood?: string;
  
  // حقول أخرى
  allow_comments?: boolean;
  article_type?: string;
  reading_time?: number;
  cover_image?: string; // مرادف لـ featured_image
}

// نموذج البيانات المرسلة للـ API (منقاة)
export interface ApiArticleData {
  id?: string;
  title: string;
  content: string;
  excerpt?: string;
  subtitle?: string;
  author_id: string;     // منقاة إلى التنسيق الموحد
  category_id?: string;  // منقاة إلى التنسيق الموحد
  status: 'draft' | 'published' | 'scheduled';
  featured: boolean;
  breaking: boolean;
  featured_image?: string;
  keywords?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  metadata?: Record<string, any>;
  published_at?: Date | string;
  scheduled_for?: Date | string;
  slug?: string;
}

// دالة تحويل النموذج الموحد إلى بيانات API
export function normalizeArticleForm(form: UnifiedArticleForm): ApiArticleData {
  // استخراج معرف المؤلف من أي من التنسيقات المختلفة
  const author_id = form.author_id || form.authorId || form.article_author_id;
  
  if (!author_id) {
    throw new Error('معرف المؤلف مطلوب');
  }
  
  // استخراج معرف التصنيف
  const category_id = form.category_id || form.categoryId;
  
  // تحويل الكلمات المفتاحية إلى نص
  const keywords = Array.isArray(form.keywords) 
    ? form.keywords.join(', ') 
    : form.keywords || Array.isArray(form.tags)
    ? form.tags.join(', ')
    : form.tags;
  
  // توحيد الحقول المنطقية
  const featured = form.featured || form.is_featured || form.isFeatured || false;
  const breaking = form.breaking || form.is_breaking || form.isBreaking || false;
  
  // توحيد الصورة المميزة
  const featured_image = form.featured_image || form.cover_image;
  
  // توحيد الملخص
  const excerpt = form.excerpt || form.summary;
  
  return {
    id: form.id,
    title: form.title.trim(),
    content: form.content,
    excerpt,
    subtitle: form.subtitle,
    author_id,
    category_id,
    status: form.status || 'draft',
    featured,
    breaking,
    featured_image,
    keywords,
    seo_title: form.seo_title,
    seo_description: form.seo_description,
    seo_keywords: form.seo_keywords,
    metadata: form.metadata,
    published_at: form.published_at,
    scheduled_for: form.scheduled_for || form.scheduledDate,
    slug: form.slug
  };
}

// دالة التحقق من صحة البيانات
export function validateArticleForm(form: UnifiedArticleForm): string[] {
  const errors: string[] = [];
  
  // التحقق من العنوان
  if (!form.title?.trim()) {
    errors.push('عنوان المقال مطلوب');
  } else if (form.title.length > 200) {
    errors.push('عنوان المقال طويل جداً (أقصى حد 200 حرف)');
  }
  
  // التحقق من المحتوى
  if (!form.content?.trim()) {
    errors.push('محتوى المقال مطلوب');
  } else if (form.content.length < 10) {
    errors.push('محتوى المقال قصير جداً (أدنى حد 10 أحرف)');
  }
  
  // التحقق من المؤلف
  const author_id = form.author_id || form.authorId || form.article_author_id;
  if (!author_id) {
    errors.push('معرف المؤلف مطلوب');
  }
  
  // التحقق من التصنيف (اختياري للمسودات)
  const category_id = form.category_id || form.categoryId;
  if (form.status === 'published' && !category_id) {
    errors.push('التصنيف مطلوب للمقالات المنشورة');
  }
  
  return errors;
}

// أنواع الاستجابة من الـ API
export interface ArticleApiResponse {
  success: boolean;
  article?: any;
  message?: string;
  summary?: {
    id: string;
    title: string;
    author?: string;
    category?: string;
    status: string;
    created_at: Date | string;
  };
  error?: string;
  details?: string;
  validation_errors?: string[];
}

// نوع للمؤلفين
export interface Author {
  id: string;
  name?: string;
  email?: string;
  full_name?: string;
  title?: string;
}

// نوع للتصنيفات
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

// نوع لخيارات النموذج
export interface ArticleFormOptions {
  authors: Author[];
  categories: Category[];
  allowDrafts?: boolean;
  allowScheduling?: boolean;
  enableAI?: boolean;
}