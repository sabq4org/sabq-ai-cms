'use client';

import Image from 'next/image';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { formatFullDate, formatRelativeDate } from '@/lib/date-utils';
import { getImageUrl, getOptimizedImageUrl } from '@/lib/utils';
import ArticleJsonLd from '@/components/ArticleJsonLd';
import Footer from '@/components/Footer';

import UltimateImage from '@/components/UltimateImage';
import { Share2, Eye, Clock, Calendar,
  User, MessageCircle, TrendingUp, Hash, ChevronRight, Home,
  Twitter, Copy, Check, X, Menu, Heart, Bookmark, Headphones,
  Play, Pause, Volume2, CheckCircle, Sparkles
} from 'lucide-react';
import { SmartInteractionButtons } from '@/components/article/SmartInteractionButtons';
import { useUserInteractionTracking } from '@/hooks/useUserInteractionTracking';
import { ReadingProgressBar } from '@/components/article/ReadingProgressBar';
import AudioSummaryPlayer from '@/components/AudioSummaryPlayer';
import { MetaTags } from '@/components/article/MetaTags';
import ArticleStatsBlock from '@/components/article/ArticleStatsBlock';
import SmartRecommendationBlock from '@/components/article/SmartRecommendationBlock';
import '@/styles/mobile-article.css';
import '@/styles/image-optimizations.css';
import './article-styles.css';

// نوع البيانات
interface Article {
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
  views?: number;
  reading_time?: number;
  stats?: {
    likes: number;
    shares: number;
    saves: number;
  };
  comments_count?: number;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ArticlePageEnhanced({ params }: PageProps) {
  const router = useRouter();
  const [articleId, setArticleId] = useState<string>('');
  
  useEffect(() => {
    params.then(resolvedParams => {
      setArticleId(resolvedParams.id);
    });
  }, [params]);
  
  const { darkMode } = useDarkModeContext();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'not_found' | 'not_published' | 'server_error' | null>(null);

  // استخدام hook تتبع التفاعلات
  const interactionTracking = useUserInteractionTracking(articleId);

  // تعريف دالة جلب المقال
  const fetchArticle = async (id: string) => {
    if (!id) return; // التحقق من وجود id
    try {
      setLoading(true);
      console.log('جاري جلب المقال:', id);
      const response = await fetch(`/api/articles/${id}`);
      
      if (!response.ok) {
        console.error('فشل جلب المقال:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error('تفاصيل الخطأ:', errorData);
        
        if (response.status === 404) {
          setError('عذراً، المقال المطلوب غير موجود');
          setErrorType('not_found');
          // تحديث العنوان في حالة عدم وجود المقال
          if (typeof document !== 'undefined') {
            document.title = 'المقال غير متوفر | صحيفة سبق الإلكترونية';
          }
        } else if (response.status === 403 && errorData.code === 'ARTICLE_NOT_PUBLISHED') {
          setError('هذه المقالة في وضع التحرير ولا يمكن عرضها للعامة');
          setErrorType('not_published');
          // تحديث العنوان في حالة المقال غير المنشور
          if (typeof document !== 'undefined') {
            document.title = 'المقال غير متاح للعرض | صحيفة سبق الإلكترونية';
          }
        } else {
          setError('حدث خطأ في جلب المقال');
          setErrorType('server_error');
          // تحديث العنوان في حالة الخطأ
          if (typeof document !== 'undefined') {
            document.title = 'خطأ في عرض المقال | صحيفة سبق الإلكترونية';
          }
        }
        
        return;
      }
      
      const data = await response.json();
      console.log('تم جلب المقال بنجاح:', data.title);
      setArticle(data);
      
      // تحديث عنوان الصفحة في المتصفح
      if (typeof document !== 'undefined' && data.title) {
        document.title = `${data.title} | صحيفة سبق الإلكترونية`;
      }
      
      // تحديث عدادات التفاعل
      if (data.stats) {
        // interactionTracking.updateStats({
        //   likes: data.stats.likes || 0,
        //   saves: data.stats.saves || 0,
        //   shares: data.stats.shares || 0,
        //   comments: data.comments_count || 0
        // });
      }
    } catch (error) {
      console.error('خطأ في جلب المقال:', error);
      setError('حدث خطأ في الاتصال بالخادم');
      setErrorType('server_error');
    } finally {
      setLoading(false);
    }
  };

  // جلب المقال عند تغيير articleId
  useEffect(() => {
    if (articleId) {
      fetchArticle(articleId);
    }
  }, [articleId]);

  // معالجة الإعجاب
  const handleLike = async () => {
    // interactionTracking.toggleLike();
  };

  // معالجة الحفظ
  const handleSave = async () => {
    // interactionTracking.toggleSave();
  };

  // التحكم في مشغل الصوت
  const toggleAudioPlayer = () => {
    if (showAudioPlayer) {
      setShowAudioPlayer(false);
      if (audioRef.current) {
        audioRef.current.pause();
        setIsAudioPlaying(false);
      }
    } else {
      setShowAudioPlayer(true);
    }
  };

  const toggleAudioPlayback = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsAudioPlaying(!isAudioPlaying);
    }
  };

  // حساب وقت القراءة
  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  };

  // استخراج الكلمات المفتاحية
  const getKeywords = () => {
    if (article?.keywords && Array.isArray(article.keywords)) {
      return article.keywords;
    }
    if (article?.seo_keywords) {
      if (typeof article.seo_keywords === 'string') {
        return article.seo_keywords.split(',').map(k => k.trim()).filter(Boolean);
      }
      if (Array.isArray(article.seo_keywords)) {
        return article.seo_keywords;
      }
    }
    return [];
  };

  if (loading || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 max-w-md">
          {error ? (
            <>
              <div className="mb-4">
                {errorType === 'not_published' ? (
                  <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto">
                    <Clock className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
                  </div>
                ) : (
                  <X className="w-16 h-16 text-red-500 mx-auto" />
                )}
              </div>
              <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                {errorType === 'not_found' && 'المقال غير موجود'}
                {errorType === 'not_published' && 'المقال قيد التحرير'}
                {errorType === 'server_error' && 'حدث خطأ'}
              </h2>
              <p className="text-lg mb-6 text-gray-600 dark:text-gray-400">
                {error}
              </p>
              
              {/* رسالة إضافية للمقالات غير المنشورة */}
              {errorType === 'not_published' && (
                <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    هذه المقالة في وضع المسودة ولم يتم نشرها بعد. 
                    إذا كنت محرراً، يرجى تسجيل الدخول لعرض المقالة.
                  </p>
                </div>
              )}
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  العودة للرئيسية
                </button>
                {errorType === 'not_published' && (
                  <button
                    onClick={() => router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                  >
                    تسجيل الدخول
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
              <p className="text-gray-500">جاري تحميل المقال...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (!article) {
    return <div>المقال غير موجود</div>;
  }

  const keywords = getKeywords();

  return (
    <>
      {/* إضافة meta tags ديناميكية */}
      {article && (
        <MetaTags
          title={article.title}
          description={article.excerpt || article.summary || article.ai_summary}
          keywords={getKeywords()}
          image={getImageUrl(article.featured_image)}
          url={`https://sabq.org/article/${articleId}`}
          author={article.author?.name || 'فريق التحرير'}
          publishedTime={article.published_at || article.created_at}
        />
      )}
      
      {/* شريط التقدم في القراءة */}
      <ReadingProgressBar />
      
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* صورة المقال - حل مبسط ومضمون */}
        {article.featured_image && (
          <div className="article-featured-image relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[60vh] w-full bg-gray-200 dark:bg-gray-800">
            <img
              src={article.featured_image}
              alt={article.title}
              className="w-full h-full object-cover transition-opacity duration-500"
              onLoad={(e) => {
                console.log('✅ صورة المقال تم تحميلها:', article.featured_image);
                const target = e.target as HTMLImageElement;
                target.style.opacity = '1';
              }}
              onError={(e) => {
                console.error('❌ فشل تحميل صورة المقال، جاري المحاولة مع صورة بديلة:', article.featured_image);
                const target = e.target as HTMLImageElement;
                target.src = '/images/placeholder-featured.jpg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 z-10" />
          </div>
        )}

        <article className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 ${!article.featured_image ? 'pt-20 sm:pt-24' : ''}`}>
          {/* رأس المقال */}
          <header className="mb-8">
            {/* التصنيف */}
            {article.category && (
              <Link
                href={`/categories/${article.category.slug}`}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium text-white mb-3 sm:mb-4"
                style={{ backgroundColor: article.category.color || '#1a73e8' }}
              >
                {article.category.icon && <span className="text-sm sm:text-base">{article.category.icon}</span>}
                <span>{article.category.name}</span>
              </Link>
            )}

            {/* العنوان */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-gray-900 dark:text-white leading-tight">
              {article.title}
            </h1>

            {/* المعلومات الأساسية */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {article.author && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate max-w-[120px] sm:max-w-none">{article.author.name}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden sm:inline">{formatFullDate(article.published_at || article.created_at)}</span>
                <span className="sm:hidden">{formatRelativeDate(article.published_at || article.created_at)}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>{article.reading_time || calculateReadingTime(article.content)} د</span>
              </div>
              {article.views !== undefined && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{article.views} مشاهدة</span>
                  <span className="sm:hidden">{article.views}</span>
                </div>
              )}
            </div>
          </header>

          {/* الموجز الموحد */}
          {(article.excerpt || article.summary || article.ai_summary) && (
            <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl border border-blue-200 dark:border-blue-700">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    🧠 الملخص الذكي
                  </h3>
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                    {article.excerpt || article.summary || article.ai_summary}
                  </p>
                </div>
                
                {/* زر الاستماع - يظهر دائماً إذا كان هناك موجز */}
                <button
                  onClick={toggleAudioPlayer}
                  className={`flex-shrink-0 p-2 rounded-lg transition-all ${
                    showAudioPlayer 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/50'
                  }`}
                  title="استمع للملخص"
                >
                  <Headphones className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* مشغل الصوت الذكي */}
              {showAudioPlayer && (
                <div className="mt-4">
                  <AudioSummaryPlayer
                    articleId={article.id}
                    excerpt={article.excerpt || article.summary || article.ai_summary}
                    audioUrl={article.audio_summary_url}
                  />
                </div>
              )}
            </div>
          )}

          {/* شريط التفاعل الذكي */}
          <div className="mb-6 sm:mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
            <SmartInteractionButtons 
              articleId={article.id}
              initialStats={{
                likes: article.likes || article.stats?.likes || 0,
                saves: article.saves || article.stats?.saves || 0,
                shares: article.shares || article.stats?.shares || 0,
                comments: article.comments_count || 0
              }}
              onComment={() => {
                // تم إزالة قسم التعليقات
                console.log('تم النقر على التعليقات');
              }}
            />
          </div>

          {/* الكلمات المفتاحية */}
          {keywords.length > 0 && (
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {keywords.map((keyword, index) => (
                  <Link
                    key={index}
                    href={`/tags/${encodeURIComponent(keyword)}`}
                    className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-medium rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                  >
                    <Hash className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span>{keyword}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* محتوى المقال */}
          <div 
            className="prose prose-sm sm:prose-base lg:prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-800 dark:prose-p:text-gray-200 prose-p:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
          
          {/* إحصائيات المقال */}
          <div className="mt-8 sm:mt-12">
            <ArticleStatsBlock
              views={article.views || 0}
              likes={article.likes || article.stats?.likes || 0}
              saves={article.saves || article.stats?.saves || 0}
              shares={article.shares || article.stats?.shares || 0}
              category={article.category ? {
                name: article.category.name,
                color: article.category.color,
                icon: article.category.icon
              } : undefined}
              growthRate={Math.floor(Math.random() * 60)} // نسبة نمو عشوائية للعرض
            />
          </div>

          {/* التوصيات الذكية */}
          <div className="mt-6 sm:mt-8">
            <SmartRecommendationBlock
              articleId={article.id}
              category={article.category?.name}
              tags={article.keywords || []}
            />
          </div>
        </article>
      </main>
      
      <Footer />
    </>
  );
} 