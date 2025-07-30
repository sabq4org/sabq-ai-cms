'use client';

import { ArticleData } from '@/lib/article-api';
import Image from 'next/image';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { formatFullDate, formatRelativeDate } from '@/lib/date-utils';
import { getImageUrl, getOptimizedImageUrl } from '@/lib/utils';
import ArticleJsonLd from '@/components/ArticleJsonLd';
import Footer from '@/components/Footer';
import OptimizedImage from '@/components/ui/optimized-image';
import ArticleFeaturedImage from '@/components/article/ArticleFeaturedImage';

import UltimateImage from '@/components/UltimateImage';
import { Share2, Eye, Clock, Calendar,
  User, MessageCircle, TrendingUp, Hash, ChevronRight, Home,
  Twitter, Copy, Check, X, Menu, Heart, Bookmark, Headphones,
  Play, Pause, Volume2, CheckCircle, Sparkles, BookOpen, Award, Star
} from 'lucide-react';
import { SmartInteractionButtons } from '@/components/article/SmartInteractionButtons';
// import { useUserInteractionTracking } from '@/hooks/useUserInteractionTracking';
import { ReadingProgressBar } from '@/components/article/ReadingProgressBar';
import ArticleAISummary from '@/components/article/ArticleAISummary';
import ArticleStatsBlock from '@/components/article/ArticleStatsBlock';
import SmartPersonalizedContent from '@/components/article/SmartPersonalizedContent';
import { useReporterProfile } from '@/lib/hooks/useReporterProfile';
import '@/styles/mobile-article.css';
import '@/styles/image-optimizations.css';
import './article-styles.css';

interface ArticleClientComponentProps {
  initialArticle: ArticleData;
  articleId: string;
}

export default function ArticleClientComponent({ 
  initialArticle,
  articleId
}: ArticleClientComponentProps) {
  const router = useRouter();
  const { darkMode } = useDarkModeContext();
  const [article, setArticle] = useState<ArticleData | null>(initialArticle || null);
  const [loading, setLoading] = useState(!initialArticle);
  const [isReading, setIsReading] = useState(false);
  
  // جلب بروفايل المراسل
  const { reporter, hasProfile, loading: reporterLoading } = useReporterProfile(article?.author?.id);
  
  // دالة لعرض أيقونة التحقق
  const getVerificationIcon = (badge: string) => {
    switch (badge) {
      case 'expert': return <Award className="w-3 h-3 text-purple-600" />;
      case 'senior': return <Star className="w-3 h-3 text-yellow-600" />;
      default: return <CheckCircle className="w-3 h-3 text-blue-600" />;
    }
  };
  
  // جلب المقال إذا لم يتم تمريره
  useEffect(() => {
    if (!initialArticle) {
      const fetchArticle = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/articles/${articleId}`);
          if (response.ok) {
            const data = await response.json();
            setArticle(data);
          } else {
            console.error('Failed to fetch article:', response.status);
          }
        } catch (error) {
          console.error('Error fetching article:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchArticle();
    }
  }, [initialArticle, articleId]);
  
  // إذا لا يوجد مقال وجاري التحميل
  if (loading || !article) {
    return (
      <div style={{
        padding: '3rem', 
        textAlign: 'center',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{color: '#6b7280'}}>جاري تحميل المقال...</p>
        </div>
      </div>
    );
  }
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // نظام تتبع التفاعل الذكي - معطل مؤقتاً لتجنب خطأ AuthProvider
  // const interactionTracking = useUserInteractionTracking(articleId);

  // إصلاح مشكلة استخدام marked
  const [contentHtml, setContentHtml] = useState('');
  
  useEffect(() => {
    // تحويل المحتوى إلى HTML مع معالجة أفضل للحالات الخاصة
    const processContent = async () => {
      // التعامل مع المحتوى الفارغ
      if (!article.content) {
        console.log('⚠️ محتوى المقال فارغ، عرض رسالة افتراضية');
        setContentHtml('<p>المحتوى غير متوفر حالياً.</p>');
        return;
      }
      
      // استخدام المحتوى كما هو إذا كان HTML
      if (article.content.includes('<p>') || article.content.includes('<div>')) {
        setContentHtml(article.content);
      } else {
        // تحويل النص العادي إلى HTML بسيط
        const paragraphs = article.content.split('\n\n');
        const html = paragraphs.map(p => `<p>${p}</p>`).join('');
        setContentHtml(html || '<p>المحتوى غير متوفر بشكل كامل.</p>');
      }
    };
    
    processContent();
  }, [article.content]);

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

  // حساب وقت القراءة - مع معالجة شاملة للحالات الخاصة
  const calculateReadingTime = (content: string | null | undefined) => {
    // معالجة الحالات الخاصة
    if (!content) {
      return 1; // قيمة افتراضية (دقيقة واحدة) للمحتوى الفارغ
    }
    
    // حساب وقت القراءة
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).filter(Boolean).length;
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

  const keywords = getKeywords();

  return (
    <>
      {/* شريط التقدم في القراءة */}
      <ReadingProgressBar />
      
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* منطقة الهيدر بخلفية مميزة */}
        <div className="relative bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 shadow-sm border-b border-gray-100 dark:border-gray-800 overflow-hidden">
          {/* Pattern خفيف في الخلفية */}
          <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
          <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-20 sm:pt-24">
            {/* رأس المقال */}
            <header className="mb-8 text-right">
            {/* التصنيف */}
            {article.category && (
              <Link
                href={`/categories/${article.category.slug}`}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300 backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/50 hover:shadow-md hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30 transition-all"
              >
                {article.category.icon && <span className="text-sm sm:text-base">{article.category.icon}</span>}
                <span>{article.category.name}</span>
              </Link>
            )}

            {/* العنوان */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-white leading-tight">
              {article.title}
            </h1>
            
            {/* العنوان الفرعي */}
            {article.subtitle && (
              <h2 className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-400 mb-6">
                {article.subtitle}
              </h2>
            )}

            {/* المعلومات الأساسية */}
            <div className="flex flex-wrap items-center justify-start gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {article.author && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  {hasProfile && reporter ? (
                    <Link 
                      href={reporter.profileUrl}
                      className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer group"
                      title={`عرض بروفايل ${reporter.full_name}`}
                    >
                      <span className="truncate max-w-[120px] sm:max-w-none group-hover:underline">
                        {article.author.name}
                      </span>
                      {reporter.is_verified && (
                        <span className="ml-1">
                          {getVerificationIcon(reporter.verification_badge)}
                        </span>
                      )}
                    </Link>
                  ) : (
                    <span className="truncate max-w-[120px] sm:max-w-none">{article.author.name}</span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden sm:inline">{formatFullDate(article.published_at || article.created_at)}</span>
                <span className="sm:hidden">{formatRelativeDate(article.published_at || article.created_at)}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>{article.reading_time || calculateReadingTime(article.content || '')} د</span>
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

            {/* صورة المقال */}
            {article.featured_image && (
              <div className="mb-8 -mx-4 sm:-mx-6 lg:-mx-8">
                <div className="max-w-4xl mx-auto">
                  <ArticleFeaturedImage
                    imageUrl={article.featured_image}
                    title={article.title}
                    category={article.category}
                  />
                </div>
              </div>
            )}
          </article>
        </div>

        {/* منطقة المحتوى */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* الملخص الذكي مع التحويل الصوتي */}
          <div className="mb-6 sm:mb-8">
            <ArticleAISummary
              articleId={article.id}
              title={article.title || 'مقال بدون عنوان'}
              content={article.content || ''}
              existingSummary={article.ai_summary || article.summary || article.excerpt || ''}
              className="shadow-lg"
            />
          </div>

          {/* شريط التفاعل الذكي */}
          <div className="mb-6 sm:mb-8">
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

          {/* زر وضع القراءة */}
          <div className="mb-6 sm:mb-8 flex justify-end">
            <button
              onClick={() => setIsReading(!isReading)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isReading
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              } hover:opacity-90`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="text-sm font-medium">
                {isReading ? 'إيقاف وضع القراءة' : 'وضع القراءة'}
              </span>
            </button>
          </div>

          {/* محتوى المقال */}
          <div className="mb-12">
            <div 
              className={`prose max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-800 dark:prose-p:text-gray-200 prose-p:leading-relaxed prose-img:rounded-lg prose-img:shadow-lg ${
                isReading ? 'prose-xl' : 'prose-lg'
              }`}
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </div>
          
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

          {/* المحتوى المخصص بذكاء - نظام التوصيات الشخصي */}
          <div className="mt-6 sm:mt-8">
            <SmartPersonalizedContent
              articleId={article.id}
              categoryId={article.category_id}
              categoryName={article.category?.name}
              tags={article.keywords || []}
              darkMode={darkMode}
              userId={undefined} // يمكن تمرير معرف المستخدم عند التسجيل
            />
          </div>
        </article>
      </main>
      
      <Footer />
    </>
  );
}
