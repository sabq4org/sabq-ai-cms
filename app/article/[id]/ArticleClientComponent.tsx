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

import { Share2, Eye, Clock, Calendar,
  User, MessageCircle, TrendingUp, Hash, ChevronRight, Home,
  Twitter, Copy, Check, X, Menu, Heart, Bookmark, Headphones,
  Play, Pause, Volume2, CheckCircle, Sparkles
} from 'lucide-react';
import { SmartInteractionButtons } from '@/components/article/SmartInteractionButtons';
// import { useUserInteractionTracking } from '@/hooks/useUserInteractionTracking';
import { ReadingProgressBar } from '@/components/article/ReadingProgressBar';
import ArticleAISummary from '@/components/article/ArticleAISummary';
import ArticleStatsBlock from '@/components/article/ArticleStatsBlock';
import SmartPersonalizedContent from '@/components/article/SmartPersonalizedContent';
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
  const [article] = useState<ArticleData>(initialArticle);
  const [loading, setLoading] = useState(false);
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
            dangerouslySetInnerHTML={{ __html: contentHtml }}
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
