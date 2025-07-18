'use client';

import Image from 'next/image';
import React, { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { formatFullDate, formatRelativeDate } from '@/lib/date-utils';
import { getImageUrl } from '@/lib/utils';
import ArticleJsonLd from '@/components/ArticleJsonLd';
import Footer from '@/components/Footer';
import { marked } from 'marked';
import Header from '@/components/Header';
import { Share2, Eye, Clock, Calendar,
  User, MessageCircle, TrendingUp, Hash, ChevronRight, Home,
  Twitter, Copy, Check, X, Menu, Heart, Bookmark, Headphones,
  Play, Pause, Volume2, CheckCircle, Sparkles
} from 'lucide-react';

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
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ArticlePageEnhanced({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const articleId = resolvedParams.id;
  const { darkMode } = useDarkModeContext();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [interaction, setInteraction] = useState({
    liked: false,
    saved: false,
    likesCount: 0,
    savesCount: 0
  });
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [error, setError] = useState<string | null>(null);

  // جلب المقال
  useEffect(() => {
    fetchArticle(articleId);
  }, [articleId]);

  const fetchArticle = async (id: string) => {
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
        } else {
          setError('حدث خطأ في جلب المقال');
        }
        
        // إظهار رسالة خطأ بدلاً من التوجيه المباشر
        setTimeout(() => {
          router.push('/');
        }, 3000);
        return;
      }
      
      const data = await response.json();
      console.log('تم جلب المقال بنجاح:', data.title);
      setArticle(data);
      
      // تحديث عدادات التفاعل
      if (data.stats) {
        setInteraction(prev => ({
          ...prev,
          likesCount: data.stats.likes || 0,
          savesCount: data.stats.saves || 0
        }));
      }
    } catch (error) {
      console.error('خطأ في جلب المقال:', error);
      setError('حدث خطأ في الاتصال بالخادم');
      // إظهار رسالة خطأ بدلاً من التوجيه المباشر
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  // معالجة الإعجاب
  const handleLike = async () => {
    setInteraction(prev => ({
      ...prev,
      liked: !prev.liked,
      likesCount: prev.liked ? prev.likesCount - 1 : prev.likesCount + 1
    }));
    
    try {
      await fetch('/api/interactions/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId })
      });
    } catch (error) {
      console.error('Error liking article:', error);
    }
  };

  // معالجة الحفظ
  const handleSave = async () => {
    setInteraction(prev => ({
      ...prev,
      saved: !prev.saved,
      savesCount: prev.saved ? prev.savesCount - 1 : prev.savesCount + 1
    }));
    
    try {
      await fetch('/api/interactions/bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId })
      });
    } catch (error) {
      console.error('Error saving article:', error);
    }
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
        <div className="text-center">
          {error ? (
            <>
              <div className="mb-4">
                <X className="w-16 h-16 text-red-500 mx-auto" />
              </div>
              <p className="text-lg font-semibold mb-2 text-red-600 dark:text-red-400">
                {error}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                سيتم توجيهك للصفحة الرئيسية...
              </p>
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
      <Header />
      <ArticleJsonLd article={article} />
      
      <main className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* صورة المقال */}
        {article.featured_image && (
          <div className="relative h-[50vh] w-full">
            <Image
              src={getImageUrl(article.featured_image)}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          </div>
        )}

        <article className="max-w-4xl mx-auto px-4 py-8">
          {/* رأس المقال */}
          <header className="mb-8">
            {/* التصنيف */}
            {article.category && (
              <Link
                href={`/categories/${article.category.slug}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white mb-4"
                style={{ backgroundColor: article.category.color || '#1a73e8' }}
              >
                {article.category.icon && <span>{article.category.icon}</span>}
                <span>{article.category.name}</span>
              </Link>
            )}

            {/* العنوان */}
            <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              {article.title}
            </h1>

            {/* معلومات المقال */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              {article.author?.name && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{article.author.name}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatFullDate(article.published_at || article.created_at || '')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{article.views || 0} مشاهدة</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{article.reading_time || calculateReadingTime(article.content)} دقائق</span>
              </div>
            </div>
          </header>

          {/* الموجز الموحد */}
          {(article.excerpt || article.summary || article.ai_summary) && (
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl border border-blue-200 dark:border-blue-700">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    💡 الملخص الذكي
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {article.excerpt || article.summary || article.ai_summary}
                  </p>
                </div>
                
                {/* أيقونة الاستماع */}
                {article.audio_summary_url && (
                  <button
                    onClick={toggleAudioPlayer}
                    className={`flex-shrink-0 p-2 rounded-lg transition-all ${
                      showAudioPlayer 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/50'
                    }`}
                    title="استمع للملخص"
                  >
                    <Headphones className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* مشغل الصوت المخفي */}
              {showAudioPlayer && article.audio_summary_url && (
                <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <audio
                    ref={audioRef}
                    src={article.audio_summary_url}
                    onEnded={() => setIsAudioPlaying(false)}
                    className="hidden"
                  />
                  
                  <div className="flex items-center gap-4">
                    <button
                      onClick={toggleAudioPlayback}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
                    >
                      {isAudioPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </button>
                    
                    <div className="flex-1 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Volume2 className="w-4 h-4" />
                      <span>الاستماع للملخص الصوتي</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* شريط التفاعل */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
            {/* أزرار التفاعل */}
            <div className="flex items-center gap-2">
              {/* زر الإعجاب */}
              <button
                onClick={handleLike}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  interaction.liked
                    ? 'text-red-500 bg-red-50 dark:bg-red-900/30 scale-105'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Heart className={`w-5 h-5 transition-all ${interaction.liked ? 'fill-current scale-110' : ''}`} />
                <span className="font-medium">{interaction.likesCount}</span>
              </button>

              {/* زر الحفظ */}
              <button
                onClick={handleSave}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  interaction.saved
                    ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/30 scale-105'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {interaction.saved ? (
                  <>
                    <CheckCircle className="w-5 h-5 fill-current" />
                    <span className="font-medium">تم الحفظ</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-5 h-5" />
                    <span className="font-medium">حفظ</span>
                  </>
                )}
                {interaction.savesCount > 0 && (
                  <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                    {interaction.savesCount}
                  </span>
                )}
              </button>

              {/* زر المشاركة */}
              <button className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                <Share2 className="w-5 h-5" />
                <span className="font-medium">مشاركة</span>
              </button>
            </div>
          </div>

          {/* الكلمات المفتاحية */}
          {keywords.length > 0 && (
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                  <Link
                    key={index}
                    href={`/tags/${encodeURIComponent(keyword)}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                  >
                    <Hash className="w-3 h-3" />
                    <span>{keyword}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* محتوى المقال */}
          <div 
            className="prose prose-lg max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>
      </main>
      
      <Footer />
    </>
  );
} 