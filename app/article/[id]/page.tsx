'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Calendar, Clock, Eye, Heart, Share2, MessageCircle, 
  Bookmark, ChevronLeft, User, Tag, TrendingUp,
  Volume2, VolumeX, Sparkles, Zap, Award, BookOpen,
  ArrowRight, Hash, AlertCircle, CheckCircle
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ArticleContentRenderer from '@/components/ArticleContentRenderer';
import AuthorInfo from './AuthorInfo';
import SmartRecommendations from '@/components/article/SmartRecommendations';
import RelatedArticles from './related-articles';
import dynamic from 'next/dynamic';
import './article-styles.css';

// Dynamic imports للتحسين
const InteractionBar = dynamic(() => import('./InteractionBar'), {
  loading: () => <div className="animate-pulse h-12 bg-gray-200 rounded-lg" />
});

const ArticleStats = dynamic(() => import('@/components/article/ArticleStats'), {
  loading: () => <div className="animate-pulse h-20 bg-gray-200 rounded-lg" />
});

interface Article {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  excerpt?: string;
  summary?: string;
  featured_image?: string;
  featured_image_alt?: string;
  image_caption?: string;
  category_id: number;
  category_name: string;
  category?: {
    id: number;
    name_ar: string;
    color_hex: string;
    icon?: string;
  };
  author_id: number;
  author_name: string;
  author_avatar?: string;
  author?: {
    id: number;
    name: string;
    avatar?: string;
    bio?: string;
  };
  published_at?: string;
  created_at: string;
  updated_at?: string;
  views_count: number;
  likes_count: number;
  shares_count: number;
  comments_count?: number;
  reading_time?: number;
  seo_keywords?: string | string[];
  is_featured?: boolean;
  is_breaking?: boolean;
  stats?: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
    saves: number;
  };
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'اليوم';
  } else if (diffDays === 1) {
    return 'أمس';
  } else if (diffDays < 7) {
    return `منذ ${diffDays} أيام`;
  } else {
    return new Intl.DateTimeFormat('ar-SA', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  }
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
}

function getCategoryColor(category: any): string {
  if (category?.color_hex) return category.color_hex;
  
  const colors: { [key: string]: string } = {
    'العالم': '#6366F1',
    'السياسة': '#8B5CF6',
    'الاقتصاد': '#10B981',
    'الرياضة': '#F59E0B',
    'التكنولوجيا': '#3B82F6',
    'الثقافة': '#EC4899',
    'الصحة': '#EF4444'
  };
  
  return colors[category?.name_ar || ''] || '#6B7280';
}

function generatePlaceholderImage(title: string): string {
  const encodedTitle = encodeURIComponent(title);
  return `https://via.placeholder.com/800x400/6366F1/FFFFFF?text=${encodedTitle}`;
}

export default function ArticlePage() {
  const params = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interaction, setInteraction] = useState({
    liked: false,
    saved: false,
    shared: false,
    likesCount: 0,
    sharesCount: 0,
    savesCount: 0
  });
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function loadArticle() {
      try {
        const resolvedParams = await params;
        if (resolvedParams?.id) {
          const articleId = Array.isArray(resolvedParams.id) ? resolvedParams.id[0] : resolvedParams.id;
          await fetchArticle(articleId);
        }
      } catch (err) {
        setError('حدث خطأ في تحميل المقال');
        setLoading(false);
      }
    }
    loadArticle();
  }, [params]);

  useEffect(() => {
    // التحقق من حالة تسجيل الدخول
    const checkLoginStatus = () => {
      const storedUserId = localStorage.getItem('user_id');
      const userData = localStorage.getItem('user');
      
      const isValidLogin = !!(storedUserId && storedUserId !== 'anonymous' && userData);
      
      setIsLoggedIn(isValidLogin);
      setUserId(isValidLogin ? storedUserId : null);
    };
    
    checkLoginStatus();
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user_id' || e.key === 'user') {
        checkLoginStatus();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // تتبع تقدم القراءة
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const windowHeight = window.innerHeight;
        const documentHeight = contentRef.current.offsetHeight;
        const scrollTop = window.scrollY;
        const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
        setReadProgress(Math.min(100, Math.max(0, progress)));
        
        // حساب وقت القراءة
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setReadingTime(duration);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchArticle = async (slug: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/articles/${slug}`);
      
      if (!response.ok) {
        setError('المقال غير موجود');
        return;
      }
      
      const data = await response.json();
      
      // التحقق من وجود المقال - البيانات قد تكون مباشرة أو داخل خاصية article
      const articleData = data.article || data;
      
      if (articleData && articleData.id) {
        setArticle(articleData);
        
        // تحديث الإحصائيات
        setInteraction(prev => ({
          ...prev,
          likesCount: articleData.likes_count || articleData.likes || 0,
          sharesCount: articleData.shares_count || articleData.shares || 0,
          savesCount: articleData.stats?.saves || articleData.saves || 0
        }));

        // جلب المقالات ذات الصلة
        fetchRelatedArticles(articleData.category_id);
        
        // تسجيل المشاهدة
        recordView(slug);
      } else {
        setError('المقال غير موجود');
      }
    } catch (err) {
      setError('حدث خطأ في تحميل المقال');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedArticles = async (categoryId: number) => {
    try {
      const response = await fetch(`/api/articles?category_id=${categoryId}&limit=4&exclude=${article?.id || ''}`);
      if (response.ok) {
        const data = await response.json();
        setRelatedArticles(data.articles || []);
      }
    } catch (err) {
      console.error('Error fetching related articles:', err);
    }
  };

  const recordView = async (articleId: string) => {
    try {
      await fetch('/api/analytics/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          articleId,
          userId: userId || 'anonymous',
          timestamp: new Date().toISOString()
        })
      });
    } catch (err) {
      console.error('Error recording view:', err);
    }
  };

  const handleLike = async () => {
    if (!isLoggedIn) {
      alert('يجب تسجيل الدخول للتفاعل مع المقالات');
      return;
    }

    const newLiked = !interaction.liked;
    setInteraction(prev => ({
      ...prev,
      liked: newLiked,
      likesCount: newLiked ? prev.likesCount + 1 : Math.max(0, prev.likesCount - 1)
    }));

    try {
      await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          articleId: article?.id,
          type: 'like',
          action: newLiked ? 'add' : 'remove'
        })
      });
    } catch (err) {
      // إعادة الحالة السابقة في حالة الخطأ
      setInteraction(prev => ({
        ...prev,
        liked: !newLiked,
        likesCount: !newLiked ? prev.likesCount + 1 : Math.max(0, prev.likesCount - 1)
      }));
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleSpeakSummary = () => {
    if (!article) return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(article.summary || article.excerpt || '');
      utterance.lang = 'ar-SA';
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleSave = async () => {
    if (!isLoggedIn) {
      alert('يجب تسجيل الدخول للتفاعل مع المقالات');
      return;
    }

    const newSaved = !interaction.saved;
    setInteraction(prev => ({
      ...prev,
      saved: newSaved,
      savesCount: newSaved ? prev.savesCount + 1 : Math.max(0, prev.savesCount - 1)
    }));

    try {
      await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          itemId: article?.id,
          itemType: 'article'
        })
      });
    } catch (err) {
      // إعادة الحالة السابقة في حالة الخطأ
      setInteraction(prev => ({
        ...prev,
        saved: !newSaved,
        savesCount: !newSaved ? prev.savesCount + 1 : Math.max(0, prev.savesCount - 1)
      }));
    }
  };

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const title = article?.title || '';

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`);
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        break;
    }
    
    // تسجيل المشاركة
    setInteraction(prev => ({
      ...prev,
      shared: true,
      sharesCount: prev.sharesCount + 1
    }));

    try {
      await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || 'anonymous',
          articleId: article?.id,
          type: 'share',
          platform
        })
      });
    } catch (err) {
      console.error('Error recording share:', err);
    }
  };

  const speakSummary = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(article?.summary || article?.title || '');
      utterance.lang = 'ar-SA';
      utterance.rate = 0.9;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const scrollToComments = () => {
    const commentsSection = document.getElementById('comments');
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6 shadow-lg">
              <BookOpen className="w-12 h-12 text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {error || 'المقال غير موجود'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              عذراً، لم نتمكن من العثور على المقال المطلوب
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              <ArrowRight className="w-5 h-5" />
              العودة إلى الرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6 shadow-lg">
              <BookOpen className="w-12 h-12 text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {error || 'المقال غير موجود'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              عذراً، لم نتمكن من العثور على المقال المطلوب
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              <ArrowRight className="w-5 h-5" />
              العودة إلى الرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // استخدام بيانات التصنيف الحقيقية
  const categoryData = article.category || {
    name_ar: article.category_name || 'عام',
    color_hex: getCategoryColor(article.category)
  };

  // استخدام بيانات المؤلف الموحدة
  const authorData = article.author || {
    name: article.author_name || 'فريق التحرير',
    avatar: article.author_avatar
  };

  // استخدام الإحصائيات الموحدة
  const statsData = {
    views: article.stats?.views || article.views_count || 0,
    likes: interaction.likesCount || article.stats?.likes || article.likes_count || 0,
    shares: interaction.sharesCount || article.stats?.shares || article.shares_count || 0,
    comments: article.stats?.comments || 0,
    saves: interaction.savesCount || article.stats?.saves || 0
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header />
      
      {/* شريط التقدم الثابت */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 z-50">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-out"
          style={{ width: `${readProgress}%` }}
        />
      </div>

      {/* المحتوى الرئيسي */}
      <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8" ref={contentRef}>
        {/* معلومات المقال العلوية */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              {/* التصنيف */}
              <Link 
                href={`/news/category/${article?.category?.name_ar || article?.category_name}`}
                className="inline-flex items-center gap-2 px-4 py-2 text-white text-sm font-bold rounded-full shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                style={{ backgroundColor: getCategoryColor(article?.category) }}
              >
                {article?.category?.icon && <span className="text-lg">{article.category.icon}</span>}
                <span>{article?.category?.name_ar || article?.category_name || 'عام'}</span>
              </Link>
              
              {/* شارات خاصة */}
              {article?.is_breaking && (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-full animate-pulse shadow-md">
                  <Zap className="w-4 h-4" />
                  عاجل
                </span>
              )}
              
              {article?.is_featured && (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold rounded-full shadow-md">
                  <Award className="w-4 h-4" />
                  مميز
                </span>
              )}
            </div>

            {/* زر العودة */}
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full shadow-md hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="font-medium">العودة</span>
            </Link>
          </div>
        </div>

        {/* العنوان الرئيسي */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            {article?.title}
          </h1>
          {article?.subtitle && (
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              {article.subtitle}
            </p>
          )}
        </header>

        {/* المعلومات الوصفية */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-6 flex-wrap">
            {/* المؤلف */}
            <div className="flex items-center gap-3">
              {article?.author?.avatar ? (
                <img 
                  src={article.author.avatar} 
                  alt={article.author.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {article?.author?.name || article?.author_name || 'فريق التحرير'}
                </span>
                <span className="text-xs text-gray-500">كاتب</span>
              </div>
            </div>

            {/* التاريخ والوقت */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(article?.published_at || article?.created_at || '')}</span>
              <span className="text-gray-400">•</span>
              <span>{formatTime(article?.published_at || article?.created_at || '')}</span>
            </div>

            {/* وقت القراءة */}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{article?.reading_time || 5} دقائق قراءة</span>
            </div>
          </div>

          {/* المشاهدات */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
            <Eye className="w-4 h-4" />
            <span className="font-semibold">{(article?.views_count || 0).toLocaleString('ar-SA')} مشاهدة</span>
          </div>
        </div>

        {/* الصورة البارزة */}
        {(article?.featured_image || article?.title) && (
          <figure className="mb-10">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl group">
              <img
                src={article.featured_image || generatePlaceholderImage(article.title)}
                alt={article.featured_image_alt || article.title}
                className="w-full h-[400px] md:h-[500px] object-cover transition-all duration-700 group-hover:scale-105"
                loading="eager"
              />
              {/* تراكب العنوان على الصورة */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-lg">
                    {article.title}
                  </h2>
                  {article.is_breaking && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500 text-white font-bold rounded-full animate-pulse text-sm shadow-lg">
                      <Zap className="w-4 h-4" />
                      خبر عاجل
                    </span>
                  )}
                </div>
              </div>
            </div>
            {(article.image_caption || article.featured_image_alt) && (
              <figcaption className="text-sm text-gray-600 dark:text-gray-400 mt-3 text-center italic">
                {article.image_caption || article.featured_image_alt}
              </figcaption>
            )}
          </figure>
        )}

        {/* الملخص الذكي المحسن */}
        {article?.summary && (
          <div className="mb-10">
            <div className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 md:p-8 border border-blue-200/50 dark:border-blue-800/50 shadow-xl">
              <div className="absolute -top-3 -right-3 w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 blur-2xl"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">الملخص الذكي</h3>
                  </div>
                  <button
                    onClick={speakSummary}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium text-sm shadow-md ${
                      isSpeaking 
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50' 
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-4 h-4" />
                        <span>إيقاف</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4" />
                        <span>استمع</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg md:text-xl">
                  {article.summary}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* شريط التفاعل الجانبي والمحتوى */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* شريط التفاعل الجانبي للشاشات الكبيرة */}
          <aside className="hidden lg:block lg:w-20 lg:sticky lg:top-24 lg:self-start">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 space-y-4">
              {/* زر الإعجاب */}
              <button
                onClick={handleLike}
                className={`w-full flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                  interaction.liked 
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Heart className={`w-6 h-6 ${interaction.liked ? 'fill-current' : ''}`} />
                <span className="text-xs font-medium">{interaction.likesCount}</span>
              </button>

              {/* زر الحفظ */}
              <button
                onClick={handleSave}
                className={`w-full flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                  interaction.saved 
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Bookmark className={`w-6 h-6 ${interaction.saved ? 'fill-current' : ''}`} />
                <span className="text-xs font-medium">{interaction.savesCount}</span>
              </button>

              {/* زر المشاركة */}
              <button
                onClick={() => {
                  if (navigator.share && article) {
                    navigator.share({
                      title: article.title,
                      text: article.excerpt || article.summary,
                      url: window.location.href
                    }).then(() => {
                      setInteraction(prev => ({
                        ...prev,
                        shared: true,
                        sharesCount: prev.sharesCount + 1
                      }));
                      showToast('تم مشاركة المقال');
                    }).catch(console.error);
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    showToast('تم نسخ رابط المقال');
                  }
                }}
                className="w-full flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                <Share2 className="w-6 h-6" />
                <span className="text-xs font-medium">{interaction.sharesCount}</span>
              </button>

              {/* زر التعليق */}
              <button
                onClick={() => scrollToComments()}
                className="w-full flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                <MessageCircle className="w-6 h-6" />
                <span className="text-xs font-medium">{article?.comments_count || 0}</span>
              </button>
            </div>
          </aside>

          {/* المحتوى الرئيسي */}
          <div className="flex-1">
            {/* محتوى المقال */}
            <div className="prose prose-lg max-w-none dark:prose-invert mb-12">
              <ArticleContentRenderer contentBlocks={[]} fallbackContent={article?.content || ''} />
            </div>

            {/* شريط التفاعل السفلي للموبايل */}
            <div className="lg:hidden sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-2xl">
              <div className="flex items-center justify-around">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    interaction.liked 
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${interaction.liked ? 'fill-current' : ''}`} />
                  <span>{interaction.likesCount}</span>
                </button>

                <button
                  onClick={handleSave}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    interaction.saved 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${interaction.saved ? 'fill-current' : ''}`} />
                  <span>{interaction.savesCount}</span>
                </button>

                <button
                  onClick={() => {
                    if (navigator.share && article) {
                      navigator.share({
                        title: article.title,
                        text: article.excerpt || article.summary,
                        url: window.location.href
                      }).then(() => {
                        setInteraction(prev => ({
                          ...prev,
                          shared: true,
                          sharesCount: prev.sharesCount + 1
                        }));
                        showToast('تم مشاركة المقال');
                      }).catch(console.error);
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      showToast('تم نسخ رابط المقال');
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-gray-600 dark:text-gray-400 transition-all"
                >
                  <Share2 className="w-5 h-5" />
                  <span>{interaction.sharesCount}</span>
                </button>

                <button
                  onClick={() => scrollToComments()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-gray-600 dark:text-gray-400 transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{article?.comments_count || 0}</span>
                </button>
              </div>
            </div>

            {/* الكلمات المفتاحية */}
            {article?.seo_keywords && (
              <div className="mt-12 mb-8">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">الكلمات المفتاحية</h3>
                <div className="flex items-center gap-3 flex-wrap">
                  {(() => {
                    let keywords: string[] = [];
                    
                    if (typeof article.seo_keywords === 'string' && article.seo_keywords.trim()) {
                      keywords = article.seo_keywords.split(',').map(k => k.trim()).filter(k => k);
                    } else if (Array.isArray(article.seo_keywords)) {
                      keywords = article.seo_keywords.filter(k => typeof k === 'string' && k.trim());
                    }
                    
                    return keywords.map((keyword, index) => (
                      <Link
                        key={index}
                        href={`/search?q=${encodeURIComponent(keyword)}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700"
                      >
                        <Hash className="w-3.5 h-3.5" />
                        {keyword}
                      </Link>
                    ));
                  })()}
                </div>
              </div>
            )}

            {/* معلومات المؤلف */}
            <div className="my-12">
              <AuthorInfo 
                author={article?.author ? {
                  ...article.author,
                  id: String(article.author.id)
                } : { 
                  name: article?.author_name || 'فريق التحرير' 
                }} 
                publishedDate={article?.published_at || article?.created_at || ''}
                readingTime={article?.reading_time || 5}
                views={article?.views_count || 0}
              />
            </div>

            {/* إحصائيات المقال */}
            <div className="my-12 border-y border-gray-200 dark:border-gray-700 py-8">
              <ArticleStats 
                articleId={article?.id || ''} 
                initialStats={{
                  views: article?.views_count || 0,
                  likes: interaction.likesCount,
                  shares: interaction.sharesCount,
                  comments: article?.comments_count || 0,
                  saves: interaction.savesCount,
                  category: article?.category_name || 'عام'
                }} 
              />
            </div>

            {/* المقالات ذات الصلة */}
            {relatedArticles.length > 0 && (
              <div className="my-12">
                <RelatedArticles 
                  articles={relatedArticles}
                  onArticleClick={(articleId) => {
                    console.log('Related article clicked:', articleId);
                  }}
                />
              </div>
            )}

            {/* التوصيات الذكية */}
            <div className="my-12">
              <SmartRecommendations 
                articleId={article?.id || ''} 
                category={article?.category_name || 'عام'}
                tags={typeof article?.seo_keywords === 'string' ? article.seo_keywords.split(',').map(k => k.trim()) : (article?.seo_keywords || [])}
              />
            </div>
          </div>
        </div>

        {/* قسم التعليقات */}
        <section id="comments" className="mt-16">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">التعليقات</h3>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 text-center">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">لا توجد تعليقات حتى الآن</p>
            {!isLoggedIn && (
              <Link 
                href="/login"
                className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg"
              >
                سجل الدخول للتعليق
              </Link>
            )}
          </div>
        </section>

        {/* معلومات القراءة المثبتة */}
        {userId && readingTime > 10 && (
          <div className="fixed bottom-24 left-4 bg-black/90 backdrop-blur-sm text-white p-4 rounded-xl text-sm z-40 shadow-2xl">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-4 h-4" />
              <span>وقت القراءة: {Math.floor(readingTime / 60)}:{(readingTime % 60).toString().padStart(2, '0')}</span>
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-4 h-4" />
              <span>تقدم القراءة: {readProgress.toFixed(0)}%</span>
            </div>
          </div>
        )}
      </article>

      {/* نافذة التنبيهات */}
      {showSuccessToast && (
        <div className="fixed bottom-8 right-8 bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up z-50">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}
      
      <Footer />
    </div>
  );
}