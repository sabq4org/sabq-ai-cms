/**
 * صفحة عرض مقال الرأي الفردي - /opinion/[slug]
 * تستخدم جدول opinion_articles الجديد
 */

'use client';

import { useParams, notFound } from 'next/navigation';
import { useState, useEffect } from 'react';
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
  Star,
  Award,
  BookOpen,
  Quote,
  AlertTriangle,
  CheckCircle,
  Volume2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface OpinionArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: string;
  published_at?: string;
  scheduled_for?: string;
  
  // معلومات الكاتب المتخصص
  writer_id: string;
  writer_role?: string;
  writer_specialty?: string;
  
  // نوع المقال
  article_type: string;
  opinion_category?: string;
  
  // خصائص المقال
  featured: boolean;
  is_leader_opinion: boolean;
  difficulty_level: string;
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
  metadata?: any;
  created_at: string;
  updated_at: string;
  
  // العلاقات
  writer: {
    id: string;
    full_name: string;
    slug: string;
    title?: string;
    bio?: string;
    avatar_url?: string;
    social_links?: any;
    role?: string;
    specializations?: any;
    total_articles: number;
    total_views: number;
    total_likes: number;
    ai_score?: number;
    is_active: boolean;
  };
}

export default function OpinionArticlePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { toast } = useToast();
  
  const [article, setArticle] = useState<OpinionArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedOpinions, setRelatedOpinions] = useState<OpinionArticle[]>([]);
  const [userRating, setUserRating] = useState<number>(0);

  // جلب مقال الرأي بواسطة slug
  useEffect(() => {
    if (!slug) return;
    
    fetchArticle();
  }, [slug]);

  const fetchArticle = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 جلب مقال الرأي:', slug);
      
      // جلب مقال الرأي من API الجديد
      const response = await fetch(`/api/opinions?search=${encodeURIComponent(slug)}&limit=1`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'فشل في جلب مقال الرأي');
      }
      
      // البحث عن المقال بواسطة slug
      const foundArticle = data.data?.find((article: OpinionArticle) => 
        article.slug === slug || article.slug.includes(slug)
      );
      
      if (!foundArticle) {
        // محاولة البحث في العنوان
        const titleMatch = data.data?.find((article: OpinionArticle) => 
          article.title.toLowerCase().includes(slug.toLowerCase()) ||
          slug.toLowerCase().includes(article.title.toLowerCase().substring(0, 20))
        );
        
        if (titleMatch) {
          setArticle(titleMatch);
        } else {
          setError('مقال الرأي غير موجود');
          return;
        }
      } else {
        setArticle(foundArticle);
      }
      
      // تحديث عدد المشاهدات
      incrementViews(foundArticle?.id || titleMatch?.id);
      
      // جلب مقالات الرأي المرتبطة
      if (foundArticle?.writer_id || titleMatch?.writer_id) {
        fetchRelatedOpinions(foundArticle?.writer_id || titleMatch?.writer_id, foundArticle?.id || titleMatch?.id);
      }
      
    } catch (error) {
      console.error('❌ خطأ في جلب مقال الرأي:', error);
      setError(error instanceof Error ? error.message : 'خطأ غير معروف');
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async (articleId?: string) => {
    if (!articleId) return;
    
    try {
      console.log('👁️ تحديث المشاهدات لمقال الرأي:', articleId);
    } catch (error) {
      console.error('خطأ في تحديث المشاهدات:', error);
    }
  };

  const fetchRelatedOpinions = async (writerId: string, currentArticleId: string) => {
    try {
      const response = await fetch(`/api/opinions?writer_id=${writerId}&limit=5`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // استبعاد المقال الحالي
          const related = data.data.filter((opinion: OpinionArticle) => opinion.id !== currentArticleId);
          setRelatedOpinions(related.slice(0, 4));
        }
      }
    } catch (error) {
      console.error('خطأ في جلب مقالات الرأي المرتبطة:', error);
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

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return 'text-green-600 bg-green-50 border-green-200';
      case 'advanced': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getDifficultyText = (level: string) => {
    switch (level) {
      case 'easy': return 'سهل';
      case 'advanced': return 'متقدم';
      default: return 'متوسط';
    }
  };

  const getArticleTypeText = (type: string) => {
    switch (type) {
      case 'analysis': return 'تحليل';
      case 'interview': return 'مقابلة';
      case 'editorial': return 'افتتاحية';
      case 'column': return 'عمود';
      default: return 'رأي';
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
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: 'تم نسخ الرابط',
          description: 'تم نسخ رابط مقال الرأي إلى الحافظة'
        });
      }
    } catch (error) {
      console.error('خطأ في المشاركة:', error);
    }
  };

  const handleRating = (rating: number) => {
    if (!article?.allow_rating) return;
    setUserRating(rating);
    toast({
      title: 'تم التقييم',
      description: `تم تقييم المقال بـ ${rating} نجوم`
    });
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
            مقال الرأي غير موجود
          </h1>
          <p className={cn('mb-6', darkMode ? 'text-gray-400' : 'text-gray-600')}>
            {error || 'عذراً، لم نتمكن من العثور على مقال الرأي المطلوب.'}
          </p>
          <Link
            href="/opinion"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            تصفح مقالات الرأي
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className={cn('min-h-screen', darkMode ? 'bg-gray-900' : 'bg-gray-50')}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        
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
              href="/opinion" 
              className={cn('hover:underline', darkMode ? 'text-gray-400' : 'text-gray-600')}
            >
              مقالات الرأي
            </Link>
            <ArrowRight className="w-4 h-4" />
            <span className={cn('', darkMode ? 'text-gray-300' : 'text-gray-700')}>
              {getArticleTypeText(article.article_type)}
            </span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* المحتوى الرئيسي */}
          <div className="lg:col-span-3">
            
            {/* شارات ومعلومات المقال */}
            <div className="flex flex-wrap gap-2 mb-4">
              {article.is_leader_opinion && (
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white">
                  👑 قائد الرأي
                </Badge>
              )}
              {article.featured && (
                <Badge className="bg-blue-600 text-white">
                  ⭐ مميز
                </Badge>
              )}
              <Badge variant="outline" className={getDifficultyColor(article.difficulty_level)}>
                <BookOpen className="w-3 h-3 ml-1" />
                {getDifficultyText(article.difficulty_level)}
              </Badge>
              <Badge variant="outline">
                {getArticleTypeText(article.article_type)}
              </Badge>
              {article.opinion_category && (
                <Badge variant="secondary">
                  {article.opinion_category}
                </Badge>
              )}
            </div>

            {/* عنوان المقال */}
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

            {/* معلومات المقال */}
            <div className={cn('flex flex-wrap items-center gap-4 py-4 border-y', darkMode ? 'border-gray-700' : 'border-gray-200')}>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className={cn('text-sm', darkMode ? 'text-gray-400' : 'text-gray-600')}>
                  {formatDate(article.published_at || article.created_at)}
                </span>
              </div>
              
              {article.estimated_read && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className={cn('text-sm', darkMode ? 'text-gray-400' : 'text-gray-600')}>
                    {article.estimated_read} دقيقة قراءة
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span className={cn('text-sm', darkMode ? 'text-gray-400' : 'text-gray-600')}>
                  {article.views.toLocaleString('ar-SA')} مشاهدة
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span className={cn('text-sm', darkMode ? 'text-gray-400' : 'text-gray-600')}>
                  {article.quality_score}/10 جودة
                </span>
              </div>
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
              <Card className={cn('mb-6', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50')}>
                <CardContent className="p-4">
                  <h3 className={cn('font-semibold mb-2 flex items-center gap-2', darkMode ? 'text-white' : 'text-gray-900')}>
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    ملخص ذكي
                  </h3>
                  <p className={cn('text-sm leading-relaxed', darkMode ? 'text-gray-300' : 'text-gray-700')}>
                    {article.ai_summary}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* النقاط الرئيسية */}
            {article.main_points.length > 0 && (
              <Card className={cn('mb-6', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-green-50')}>
                <CardContent className="p-4">
                  <h3 className={cn('font-semibold mb-3 flex items-center gap-2', darkMode ? 'text-white' : 'text-gray-900')}>
                    <Award className="w-4 h-4 text-green-600" />
                    النقاط الرئيسية
                  </h3>
                  <ul className="space-y-2">
                    {article.main_points.map((point, index) => (
                      <li key={index} className={cn('flex items-start gap-2 text-sm', darkMode ? 'text-gray-300' : 'text-gray-700')}>
                        <span className="text-green-600 font-bold">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* محتوى المقال */}
            <div className={cn('prose prose-lg max-w-none mb-8', darkMode ? 'prose-invert' : '')}>
              <div 
                className={cn('leading-relaxed', darkMode ? 'text-gray-300' : 'text-gray-800')}
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>

            {/* الاقتباسات المهمة */}
            {article.key_quotes.length > 0 && (
              <div className="mb-6">
                <h3 className={cn('font-semibold mb-4 flex items-center gap-2', darkMode ? 'text-white' : 'text-gray-900')}>
                  <Quote className="w-4 h-4" />
                  اقتباسات مهمة
                </h3>
                <div className="space-y-4">
                  {article.key_quotes.map((quote, index) => (
                    <blockquote 
                      key={index}
                      className={cn(
                        'border-r-4 border-blue-500 pr-4 py-2 italic text-lg',
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      )}
                    >
                      "{quote}"
                    </blockquote>
                  ))}
                </div>
              </div>
            )}

            {/* الخلاصة */}
            {article.conclusion && (
              <Card className={cn('mb-6', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-yellow-50')}>
                <CardContent className="p-4">
                  <h3 className={cn('font-semibold mb-2', darkMode ? 'text-white' : 'text-gray-900')}>
                    🎯 خلاصة المقال
                  </h3>
                  <p className={cn('leading-relaxed', darkMode ? 'text-gray-300' : 'text-gray-700')}>
                    {article.conclusion}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* الكلمات المفتاحية والمواضيع */}
            <div className="mb-6 space-y-4">
              {article.tags.length > 0 && (
                <div>
                  <h3 className={cn('font-semibold mb-3', darkMode ? 'text-white' : 'text-gray-900')}>
                    🏷️ كلمات مفتاحية
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {article.topics.length > 0 && (
                <div>
                  <h3 className={cn('font-semibold mb-3', darkMode ? 'text-white' : 'text-gray-900')}>
                    📚 مواضيع
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {article.topics.map((topic, index) => (
                      <Badge key={index} variant="secondary">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* أزرار التفاعل */}
            <div className="flex items-center gap-4 py-6">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                إعجاب ({article.likes})
              </Button>
              
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                حفظ ({article.saves})
              </Button>
              
              {article.allow_sharing && (
                <Button variant="outline" size="sm" onClick={handleShare} className="flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  مشاركة ({article.shares})
                </Button>
              )}
              
              {article.allow_comments && (
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  تعليقات ({article.comments_count})
                </Button>
              )}

              {/* الملف الصوتي */}
              {(article.audio_summary_url || article.podcast_url) && (
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  استماع
                </Button>
              )}
            </div>

            {/* تقييم المقال */}
            {article.allow_rating && (
              <Card className={cn('mt-8', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50')}>
                <CardContent className="p-4">
                  <h3 className={cn('font-semibold mb-3', darkMode ? 'text-white' : 'text-gray-900')}>
                    قيم هذا المقال
                  </h3>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleRating(rating)}
                        className={cn(
                          'p-1 rounded transition-colors',
                          userRating >= rating ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                        )}
                      >
                        <Star className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* الشريط الجانبي */}
          <div className="lg:col-span-1">
            
            {/* بروفايل الكاتب */}
            <Card className={cn('mb-6', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white')}>
              <CardContent className="p-4">
                <div className="text-center">
                  {article.writer.avatar_url && (
                    <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden">
                      <Image
                        src={article.writer.avatar_url}
                        alt={article.writer.full_name}
                        width={80}
                        height={80}
                        className="object-cover"
                      />
                    </div>
                  )}
                  
                  <h3 className={cn('font-bold text-lg mb-1', darkMode ? 'text-white' : 'text-gray-900')}>
                    {article.writer.full_name}
                  </h3>
                  
                  {article.writer.title && (
                    <p className={cn('text-sm mb-2', darkMode ? 'text-gray-400' : 'text-gray-600')}>
                      {article.writer.title}
                    </p>
                  )}

                  {article.writer_role && (
                    <Badge variant="outline" className="mb-3">
                      {article.writer_role}
                    </Badge>
                  )}
                  
                  {article.writer.bio && (
                    <p className={cn('text-xs leading-relaxed mb-3', darkMode ? 'text-gray-400' : 'text-gray-600')}>
                      {article.writer.bio}
                    </p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-center">
                    <div>
                      <div className={cn('font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>
                        {article.writer.total_articles}
                      </div>
                      <div className={cn('', darkMode ? 'text-gray-400' : 'text-gray-600')}>
                        مقال
                      </div>
                    </div>
                    <div>
                      <div className={cn('font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>
                        {article.writer.total_views.toLocaleString('ar-SA')}
                      </div>
                      <div className={cn('', darkMode ? 'text-gray-400' : 'text-gray-600')}>
                        مشاهدة
                      </div>
                    </div>
                  </div>

                  {article.writer.ai_score && (
                    <div className="mt-3">
                      <div className={cn('text-xs mb-1', darkMode ? 'text-gray-400' : 'text-gray-600')}>
                        تقييم الذكاء الاصطناعي
                      </div>
                      <Progress value={article.writer.ai_score * 10} className="h-2" />
                      <div className="text-xs mt-1 font-semibold">
                        {article.writer.ai_score}/10
                      </div>
                    </div>
                  )}
                  
                  <Link
                    href={`/author/${article.writer.slug}`}
                    className="mt-3 inline-block w-full px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    عرض البروفايل
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* إحصائيات المقال */}
            <Card className={cn('mb-6', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white')}>
              <CardContent className="p-4">
                <h3 className={cn('font-semibold mb-3', darkMode ? 'text-white' : 'text-gray-900')}>
                  📊 إحصائيات المقال
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className={cn('', darkMode ? 'text-gray-400' : 'text-gray-600')}>جودة المحتوى</span>
                    <span className={cn('font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>
                      {article.quality_score}/10
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className={cn('', darkMode ? 'text-gray-400' : 'text-gray-600')}>مستوى التفاعل</span>
                    <span className={cn('font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>
                      {article.engagement_score.toFixed(1)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className={cn('', darkMode ? 'text-gray-400' : 'text-gray-600')}>تقييم الذكاء الاصطناعي</span>
                    <span className={cn('font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>
                      {article.ai_rating.toFixed(1)}/10
                    </span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between">
                    <span className={cn('', darkMode ? 'text-gray-400' : 'text-gray-600')}>المشاهدات</span>
                    <span className={cn('font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>
                      {article.views.toLocaleString('ar-SA')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className={cn('', darkMode ? 'text-gray-400' : 'text-gray-600')}>الإعجابات</span>
                    <span className={cn('font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>
                      {article.likes.toLocaleString('ar-SA')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className={cn('', darkMode ? 'text-gray-400' : 'text-gray-600')}>المشاركات</span>
                    <span className={cn('font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>
                      {article.shares.toLocaleString('ar-SA')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-8" />

        {/* مقالات الرأي المرتبطة */}
        {relatedOpinions.length > 0 && (
          <section className="mt-12">
            <h2 className={cn('text-2xl font-bold mb-6', darkMode ? 'text-white' : 'text-gray-900')}>
              مقالات أخرى للكاتب
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedOpinions.map((opinion) => (
                <Link 
                  key={opinion.id} 
                  href={`/opinion/${opinion.slug}`}
                  className={cn(
                    'block p-4 rounded-lg border transition-colors hover:border-blue-500',
                    darkMode ? 'border-gray-700 bg-gray-800 hover:bg-gray-750' : 'border-gray-200 bg-white hover:bg-gray-50'
                  )}
                >
                  <div className="flex gap-2 mb-2">
                    {opinion.is_leader_opinion && (
                      <Badge className="bg-yellow-600 text-white text-xs">
                        👑 قائد رأي
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {getArticleTypeText(opinion.article_type)}
                    </Badge>
                  </div>
                  
                  <h3 className={cn('font-semibold mb-2 line-clamp-2', darkMode ? 'text-white' : 'text-gray-900')}>
                    {opinion.title}
                  </h3>
                  
                  {opinion.excerpt && (
                    <p className={cn('text-sm line-clamp-2 mb-3', darkMode ? 'text-gray-400' : 'text-gray-600')}>
                      {opinion.excerpt}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatDate(opinion.published_at || opinion.created_at)}</span>
                    <div className="flex items-center gap-3">
                      <span>{opinion.views} مشاهدة</span>
                      <span>⭐ {opinion.quality_score}/10</span>
                    </div>
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