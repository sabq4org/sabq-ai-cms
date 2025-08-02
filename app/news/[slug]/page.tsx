/**
 * صفحة عرض الخبر الفردي - /news/[slug]
 * تستخدم جدول news_articles الجديد
 */

'use client';

import { useParams, notFound } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Calendar, 
  User, 
  Eye, 
  Heart, 
  Share2, 
  MessageCircle, 
  Clock,
  Tag,
  ArrowRight,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { useToast } from '@/hooks/use-toast';

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: string;
  published_at?: string;
  scheduled_for?: string;
  
  // معلومات التصنيف والكاتب
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
  gallery?: any;
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
  metadata?: any;
  created_at: string;
  updated_at: string;
  
  // العلاقات
  categories?: {
    id: string;
    name: string;
    slug: string;
    color?: string;
  };
  author: {
    id: string;
    name: string;
    email: string;
  };
}

export default function NewsArticlePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { darkMode } = useDarkModeContext();
  const { toast } = useToast();
  
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedNews, setRelatedNews] = useState<NewsArticle[]>([]);

  // جلب الخبر بواسطة slug
  useEffect(() => {
    if (!slug) return;
    
    fetchArticle();
  }, [slug]);

  const fetchArticle = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 جلب الخبر:', slug);
      
      // جلب الخبر من API الجديد
      const response = await fetch(`/api/news?search=${encodeURIComponent(slug)}&limit=1`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'فشل في جلب الخبر');
      }
      
      // البحث عن الخبر بواسطة slug
      const foundArticle = data.data?.find((article: NewsArticle) => 
        article.slug === slug || article.slug.includes(slug)
      );
      
      if (!foundArticle) {
        // محاولة البحث في العنوان
        const titleMatch = data.data?.find((article: NewsArticle) => 
          article.title.toLowerCase().includes(slug.toLowerCase()) ||
          slug.toLowerCase().includes(article.title.toLowerCase().substring(0, 20))
        );
        
        if (titleMatch) {
          setArticle(titleMatch);
        } else {
          setError('الخبر غير موجود');
          return;
        }
      } else {
        setArticle(foundArticle);
      }
      
      // تحديث عدد المشاهدات
      incrementViews(foundArticle?.id || titleMatch?.id);
      
      // جلب الأخبار المرتبطة
      if (foundArticle?.categories?.id || titleMatch?.categories?.id) {
        fetchRelatedNews(foundArticle?.categories?.id || titleMatch?.categories?.id, foundArticle?.id || titleMatch?.id);
      }
      
    } catch (error) {
      console.error('❌ خطأ في جلب الخبر:', error);
      setError(error instanceof Error ? error.message : 'خطأ غير معروف');
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async (articleId?: string) => {
    if (!articleId) return;
    
    try {
      // تحديث المشاهدات (يمكن إضافة API مخصص لهذا لاحقاً)
      console.log('👁️ تحديث المشاهدات للخبر:', articleId);
    } catch (error) {
      console.error('خطأ في تحديث المشاهدات:', error);
    }
  };

  const fetchRelatedNews = async (categoryId: string, currentArticleId: string) => {
    try {
      const response = await fetch(`/api/news?category_id=${categoryId}&limit=5`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // استبعاد الخبر الحالي
          const related = data.data.filter((news: NewsArticle) => news.id !== currentArticleId);
          setRelatedNews(related.slice(0, 4));
        }
      }
    } catch (error) {
      console.error('خطأ في جلب الأخبار المرتبطة:', error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'تاريخ غير صحيح';
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: article?.title,
          text: article?.excerpt || article?.ai_summary,
          url: window.location.href
        });
      } else {
        // نسخ الرابط للحافظة
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: 'تم نسخ الرابط',
          description: 'تم نسخ رابط الخبر إلى الحافظة'
        });
      }
    } catch (error) {
      console.error('خطأ في المشاركة:', error);
    }
  };

  if (loading) {
    return (
      <div className={cn('min-h-screen', darkMode ? 'bg-gray-900' : 'bg-gray-50')}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className={cn('h-8 rounded', darkMode ? 'bg-gray-800' : 'bg-gray-200')}></div>
            <div className={cn('h-64 rounded-lg', darkMode ? 'bg-gray-800' : 'bg-gray-200')}></div>
            <div className="space-y-4">
              <div className={cn('h-4 rounded', darkMode ? 'bg-gray-800' : 'bg-gray-200')}></div>
              <div className={cn('h-4 rounded w-3/4', darkMode ? 'bg-gray-800' : 'bg-gray-200')}></div>
              <div className={cn('h-4 rounded w-1/2', darkMode ? 'bg-gray-800' : 'bg-gray-200')}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className={cn('min-h-screen flex items-center justify-center', darkMode ? 'bg-gray-900' : 'bg-gray-50')}>
        <div className="text-center max-w-md mx-auto px-4">
          <AlertTriangle className={cn('w-16 h-16 mx-auto mb-4', darkMode ? 'text-red-400' : 'text-red-500')} />
          <h1 className={cn('text-2xl font-bold mb-2', darkMode ? 'text-white' : 'text-gray-900')}>
            الخبر غير موجود
          </h1>
          <p className={cn('mb-6', darkMode ? 'text-gray-400' : 'text-gray-600')}>
            {error || 'عذراً، لم نتمكن من العثور على الخبر المطلوب.'}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className={cn('min-h-screen', darkMode ? 'bg-gray-900' : 'bg-gray-50')}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* التنقل العلوي */}
        <nav className="mb-6">
          <div className="flex items-center gap-2 text-sm">
            <Link 
              href="/" 
              className={cn('hover:underline', darkMode ? 'text-gray-400' : 'text-gray-600')}
            >
              الرئيسية
            </Link>
            <ArrowRight className="w-4 h-4" />
            <Link 
              href="/news" 
              className={cn('hover:underline', darkMode ? 'text-gray-400' : 'text-gray-600')}
            >
              الأخبار
            </Link>
            {article.categories && (
              <>
                <ArrowRight className="w-4 h-4" />
                <span className={cn('', darkMode ? 'text-gray-300' : 'text-gray-700')}>
                  {article.categories.name}
                </span>
              </>
            )}
          </div>
        </nav>

        {/* شارات الخبر */}
        <div className="flex flex-wrap gap-2 mb-4">
          {article.breaking && (
            <Badge variant="destructive" className="bg-red-600 text-white">
              🔴 عاجل
            </Badge>
          )}
          {article.urgent && (
            <Badge variant="destructive" className="bg-orange-600 text-white">
              ⚡ عاجل جداً
            </Badge>
          )}
          {article.featured && (
            <Badge variant="secondary" className="bg-blue-600 text-white">
              ⭐ مميز
            </Badge>
          )}
          {article.categories && (
            <Badge 
              variant="outline" 
              style={{ 
                backgroundColor: article.categories.color || '#gray', 
                color: 'white',
                borderColor: article.categories.color || '#gray'
              }}
            >
              {article.categories.name}
            </Badge>
          )}
        </div>

        {/* عنوان الخبر */}
        <header className="mb-6">
          <h1 className={cn('text-3xl lg:text-4xl font-bold leading-tight mb-4', darkMode ? 'text-white' : 'text-gray-900')}>
            {article.title}
          </h1>
          
          {article.excerpt && (
            <p className={cn('text-lg leading-relaxed', darkMode ? 'text-gray-300' : 'text-gray-700')}>
              {article.excerpt}
            </p>
          )}
        </header>

        {/* معلومات الخبر */}
        <div className={cn('flex flex-wrap items-center gap-4 py-4 border-y', darkMode ? 'border-gray-700' : 'border-gray-200')}>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className={cn('text-sm', darkMode ? 'text-gray-400' : 'text-gray-600')}>
              {article.author.name}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className={cn('text-sm', darkMode ? 'text-gray-400' : 'text-gray-600')}>
              {formatDate(article.published_at || article.created_at)}
            </span>
          </div>
          
          {article.reading_time && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className={cn('text-sm', darkMode ? 'text-gray-400' : 'text-gray-600')}>
                {article.reading_time} دقيقة قراءة
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span className={cn('text-sm', darkMode ? 'text-gray-400' : 'text-gray-600')}>
              {article.views.toLocaleString('ar-SA')} مشاهدة
            </span>
          </div>

          {article.source && (
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              <span className={cn('text-sm', darkMode ? 'text-gray-400' : 'text-gray-600')}>
                المصدر: {article.source}
              </span>
            </div>
          )}

          {article.location && (
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <span className={cn('text-sm', darkMode ? 'text-gray-400' : 'text-gray-600')}>
                {article.location}
              </span>
            </div>
          )}
        </div>

        {/* الصورة المميزة */}
        {article.featured_image && (
          <div className="my-8">
            <div className="relative w-full h-96 lg:h-[500px] rounded-lg overflow-hidden">
              <Image
                src={article.featured_image}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        )}

        {/* الملخص الذكي */}
        {article.ai_summary && (
          <div className={cn('p-4 rounded-lg mb-6', darkMode ? 'bg-gray-800' : 'bg-blue-50')}>
            <h3 className={cn('font-semibold mb-2', darkMode ? 'text-white' : 'text-gray-900')}>
              📝 ملخص الخبر
            </h3>
            <p className={cn('text-sm leading-relaxed', darkMode ? 'text-gray-300' : 'text-gray-700')}>
              {article.ai_summary}
            </p>
          </div>
        )}

        {/* محتوى الخبر */}
        <div className={cn('prose prose-lg max-w-none mb-8', darkMode ? 'prose-invert' : '')}>
          <div 
            className={cn('leading-relaxed', darkMode ? 'text-gray-300' : 'text-gray-800')}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        {/* الكلمات المفتاحية */}
        {article.seo_keywords.length > 0 && (
          <div className="mb-6">
            <h3 className={cn('font-semibold mb-3', darkMode ? 'text-white' : 'text-gray-900')}>
              🏷️ كلمات مفتاحية
            </h3>
            <div className="flex flex-wrap gap-2">
              {article.seo_keywords.map((keyword, index) => (
                <Badge key={index} variant="outline">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* أزرار التفاعل */}
        <div className="flex items-center gap-4 py-6">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            إعجاب ({article.likes})
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleShare} className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            مشاركة ({article.shares})
          </Button>
          
          {article.allow_comments && (
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              تعليقات
            </Button>
          )}
        </div>

        <Separator className="my-8" />

        {/* الأخبار المرتبطة */}
        {relatedNews.length > 0 && (
          <section className="mt-12">
            <h2 className={cn('text-2xl font-bold mb-6', darkMode ? 'text-white' : 'text-gray-900')}>
              أخبار مرتبطة
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedNews.map((news) => (
                <Link 
                  key={news.id} 
                  href={`/news/${news.slug}`}
                  className={cn(
                    'block p-4 rounded-lg border transition-colors hover:border-blue-500',
                    darkMode ? 'border-gray-700 bg-gray-800 hover:bg-gray-750' : 'border-gray-200 bg-white hover:bg-gray-50'
                  )}
                >
                  {news.featured_image && (
                    <div className="relative w-full h-32 mb-3 rounded overflow-hidden">
                      <Image
                        src={news.featured_image}
                        alt={news.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  
                  <h3 className={cn('font-semibold mb-2 line-clamp-2', darkMode ? 'text-white' : 'text-gray-900')}>
                    {news.title}
                  </h3>
                  
                  {news.excerpt && (
                    <p className={cn('text-sm line-clamp-2', darkMode ? 'text-gray-400' : 'text-gray-600')}>
                      {news.excerpt}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span>{formatDate(news.published_at || news.created_at)}</span>
                    <span>{news.views} مشاهدة</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}