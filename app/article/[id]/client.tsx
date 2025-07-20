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
import { marked } from 'marked';
import Header from '@/components/Header';
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
import '@/styles/mobile-article.css';
import '@/styles/image-optimizations.css';

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
    saves: number;
    shares: number;
  };
  comments_count?: number;
}

interface ArticleClientPageProps {
  initialArticle: Article;
  articleId: string;
}

export function ArticleClientPage({ initialArticle, articleId }: ArticleClientPageProps) {
  const router = useRouter();
  const { darkMode } = useDarkModeContext();
  const [article, setArticle] = useState<Article | null>(initialArticle);
  const [loading, setLoading] = useState(false);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'not_found' | 'not_published' | 'server_error' | null>(null);

  // نظام تتبع التفاعل الذكي
  const interactionTracking = useUserInteractionTracking(articleId);

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
        return article.seo_keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
      }
      if (Array.isArray(article.seo_keywords)) {
        return article.seo_keywords;
      }
    }
    return [];
  };

  if (!article) {
    return <div>المقال غير موجود</div>;
  }

  const keywords = getKeywords();

  return (
    <>
      <Header />
      
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
                href={`/categories/${String(article.category.slug || '')}`}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium text-white mb-3 sm:mb-4"
                style={{ backgroundColor: article.category.color || '#1a73e8' }}
              >
                {article.category.icon && <span className="text-sm sm:text-base">{String(article.category.icon)}</span>}
                <span>{String(article.category.name || 'غير محدد')}</span>
              </Link>
            )}

            {/* العنوان */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-gray-900 dark:text-white leading-tight">
              {String(article.title || 'عنوان غير محدد')}
            </h1>

            {/* المعلومات الأساسية */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {article.author && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate max-w-[120px] sm:max-w-none">{String(article.author.name || 'كاتب غير محدد')}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden sm:inline">{String(formatFullDate(article.published_at || article.created_at) || 'غير محدد')}</span>
                <span className="sm:hidden">{String(formatRelativeDate(article.published_at || article.created_at) || 'غير محدد')}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>{String(article.reading_time || calculateReadingTime(article.content) || 0)} د</span>
              </div>
              {article.views !== undefined && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{String(article.views || 0)} مشاهدة</span>
                  <span className="sm:hidden">{String(article.views || 0)}</span>
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
                    {String(article.excerpt || article.summary || article.ai_summary || '')}
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
              articleId={String(article.id)}
              initialStats={{
                likes: Number(article.likes || article.stats?.likes || 0),
                saves: Number(article.saves || article.stats?.saves || 0),
                shares: Number(article.shares || article.stats?.shares || 0),
                comments: Number(article.comments_count || 0)
              }}
              onComment={() => {
                // التمرير لقسم التعليقات
                const commentsSection = document.getElementById('comments-section');
                commentsSection?.scrollIntoView({ behavior: 'smooth' });
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
                    href={`/tags/${encodeURIComponent(String(keyword))}`}
                    className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-medium rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                  >
                    <Hash className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span>{String(keyword)}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* محتوى المقال */}
          <div 
            className="prose prose-lg max-w-none dark:prose-invert
              prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
              prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
              prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-bold
              prose-blockquote:border-r-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20 prose-blockquote:p-4 prose-blockquote:rounded-lg prose-blockquote:not-italic
              prose-ul:text-gray-700 dark:prose-ul:text-gray-300 prose-ol:text-gray-700 dark:prose-ol:text-gray-300
              prose-li:mb-2 prose-li:leading-relaxed
              text-base sm:text-lg leading-relaxed"
            style={{ 
              direction: 'rtl', 
              textAlign: 'right',
              fontFamily: 'var(--font-ibm-plex-arabic), IBM Plex Sans Arabic, system-ui, sans-serif'
            }}
            dangerouslySetInnerHTML={{ __html: marked(article.content) }}
          />

          {/* البيانات المنظمة JSON-LD */}
          <ArticleJsonLd
            article={{
              id: article.id,
              title: article.title,
              summary: article.excerpt || article.summary || article.ai_summary,
              content: article.content,
              featured_image: article.featured_image,
              author: article.author?.name || 'فريق التحرير',
              published_at: article.published_at || article.created_at,
              created_at: article.created_at,
            }}
          />
        </article>

        <Footer />
      </main>
    </>
  );
}
