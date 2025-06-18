'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/Header';
import { 
  ArrowRight, Calendar, Clock, User, Eye, Tag, 
  ThumbsUp, Share2, Volume2, VolumeX, Loader2,
  BookOpen, Heart, MessageCircle, Bookmark, Twitter,
  Facebook, Send, Copy, ChevronRight, Award, Hash,
  Zap, Globe, BookOpen as BookOpenIcon, PenTool, RefreshCw,
  Sparkles, TrendingUp, Check, Brain, Bot
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  subtitle?: string;
  summary?: string;
  content: string;
  featured_image?: string;
  image_caption?: string;
  category_id: number;
  category_name?: string;
  author_id?: string;
  author_name?: string;
  author_avatar?: string;
  views_count: number;
  likes_count?: number;
  shares_count?: number;
  created_at: string;
  published_at?: string;
  updated_at?: string;
  reading_time?: number;
  is_breaking?: boolean;
  is_featured?: boolean;
  seo_keywords?: string;
  related_articles?: RelatedArticle[];
}

interface RelatedArticle {
  id: string;
  title: string;
  featured_image?: string;
  reading_time?: number;
  published_at?: string;
  created_at?: string;
}

interface RecommendedArticle extends RelatedArticle {
  excerpt?: string;
  category_name?: string;
  recommendation_score?: number;
  recommendation_reason?: string;
  views_count?: number;
  likes_count?: number;
  image_url?: string;
  category_id?: number;
  created_at?: string;
}

interface UserInteraction {
  liked: boolean;
  saved: boolean;
  shared: boolean;
}

// ألوان التصنيفات
const categoryColors: { [key: string]: string } = {
  'تقنية': 'from-purple-500 to-purple-600',
  'اقتصاد': 'from-green-500 to-green-600',
  'رياضة': 'from-blue-500 to-blue-600',
  'سياسة': 'from-red-500 to-red-600',
  'ثقافة': 'from-yellow-500 to-yellow-600',
  'صحة': 'from-pink-500 to-pink-600',
  'محلي': 'from-indigo-500 to-indigo-600',
  'دولي': 'from-cyan-500 to-cyan-600',
  'منوعات': 'from-orange-500 to-orange-600',
  'default': 'from-gray-500 to-gray-600'
};

interface PageProps {
  params: Promise<{ id: string }>
}

export default function NewsDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [interaction, setInteraction] = useState<UserInteraction>({
    liked: false,
    saved: false,
    shared: false
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const [articleId, setArticleId] = useState<string>('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDataLoaded, setUserDataLoaded] = useState(false);

  useEffect(() => {
    async function loadArticle() {
      const resolvedParams = await params;
      if (resolvedParams?.id) {
        setArticleId(resolvedParams.id);
        fetchArticle(resolvedParams.id);
        trackView(resolvedParams.id);
      }
    }
    loadArticle();
  }, []);

  useEffect(() => {
    // التحقق من تسجيل الدخول بشكل أكثر دقة
    const checkLoginStatus = () => {
      const userId = localStorage.getItem('user_id');
      const userData = localStorage.getItem('user');
      
      // التحقق من وجود user_id صالح وبيانات المستخدم
      const isValidLogin = !!(userId && userId !== 'anonymous' && userData);
      
      setIsLoggedIn(isValidLogin);
      setUserDataLoaded(true);
    };
    
    // التحقق الأولي
    checkLoginStatus();
    
    // الاستماع لتغييرات localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user_id' || e.key === 'user') {
        checkLoginStatus();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // إعادة التحقق بعد تحميل الصفحة بالكامل
    const timeoutId = setTimeout(checkLoginStatus, 100);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearTimeout(timeoutId);
    };
  }, []);

  // إعادة جلب التوصيات عند تغيير حالة تسجيل الدخول
  useEffect(() => {
    if (userDataLoaded && isLoggedIn && articleId) {
      fetchRecommendations(articleId);
    }
  }, [isLoggedIn, userDataLoaded, articleId]);

  useEffect(() => {
    // تتبع تقدم القراءة
    const handleScroll = () => {
      if (contentRef.current) {
        const windowHeight = window.innerHeight;
        const documentHeight = contentRef.current.offsetHeight;
        const scrollTop = window.scrollY;
        const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
        setReadProgress(Math.min(100, Math.max(0, progress)));
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // تتبع وقت القراءة عند مغادرة الصفحة
    const handleBeforeUnload = () => {
      if (article && articleId) {
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        if (duration > 10) { // تسجيل القراءة فقط إذا كانت أكثر من 10 ثواني
          // استخدام sendBeacon لضمان إرسال البيانات قبل إغلاق الصفحة
          const data = {
            type: 'read',
            article_id: articleId,
            user_id: localStorage.getItem('user_id') || 'anonymous',
            category_id: article.category_id,
            duration,
            scroll_percentage: readProgress
          };
          navigator.sendBeacon('/api/interactions/track', JSON.stringify(data));
        }
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload(); // تسجيل القراءة عند unmount
    };
  }, [article, readProgress, articleId]);

  const fetchArticle = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/articles/${id}`);
      
      if (!response.ok) {
        // معالجة أفضل للأخطاء بدون console.error في production
        if (response.status === 404) {
          console.log('Article not found:', id);
        } else {
          console.log('Error loading article:', response.status);
        }
        // إعادة التوجيه إلى الصفحة الرئيسية بدلاً من /news
        router.push('/');
        return;
      }
      
      const data = await response.json();
      
      // التعامل مع البيانات المباشرة (API يرجع المقال مباشرة)
      setArticle(data);
      
      // جلب التفاعلات المحفوظة
      const savedInteractions = localStorage.getItem(`article_${id}_interactions`);
      if (savedInteractions) {
        setInteraction(JSON.parse(savedInteractions));
      }
      
      // التوصيات سيتم جلبها في useEffect منفصل بعد التحقق من تسجيل الدخول
    } catch (error) {
      console.log('Network error while fetching article:', error);
      // إعادة التوجيه إلى الصفحة الرئيسية في حالة خطأ الشبكة
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async (currentArticleId: string) => {
    try {
      setLoadingRecommendations(true);
      const userId = localStorage.getItem('user_id');
      const userData = localStorage.getItem('user');
      
      if (!userId || userId === 'anonymous' || !userData) {
        // إذا لم يكن المستخدم مسجل دخول بشكل صحيح، لا نعرض التوصيات
        return;
      }
      
      const response = await fetch(`/api/content/recommendations?user_id=${userId}&current_article_id=${currentArticleId}&limit=6`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.recommendations) {
          setRecommendations(data.data.recommendations);
        }
      } else {
        console.error('Failed to fetch recommendations:', response.status);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const trackView = async (articleId: string) => {
    try {
      const userId = localStorage.getItem('user_id') || 'anonymous';
      
      // لا نتتبع المشاهدات للمستخدمين غير المسجلين
      if (userId === 'anonymous') {
        return;
      }
      
      const response = await fetch('/api/interactions/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'view',
          article_id: articleId,
          user_id: userId,
          category_id: article?.category_id,
          source: 'article_detail'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
      }
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const trackInteraction = async (type: string, articleId: string, additionalData?: any) => {
    try {
      const userId = localStorage.getItem('user_id') || 'anonymous';
      
      // التحقق من تسجيل الدخول
      if (userId === 'anonymous') {
        alert('يرجى تسجيل الدخول لبدء رحلتك الذكية وكسب النقاط 🎯');
        return;
      }
      
      const response = await fetch('/api/interactions/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          article_id: articleId,
          user_id: userId,
          category_id: article?.category_id,
          ...additionalData
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.message) {
          // استخدام alert بدلاً من toast مؤقتاً
          alert(data.message);
        }
        // تحديث نقاط الولاء في localStorage
        if (data.data?.loyalty) {
          localStorage.setItem('user_loyalty_points', data.data.loyalty.total_points.toString());
          // إطلاق حدث تحديث النقاط
          window.dispatchEvent(new Event('loyalty-points-updated'));
        }
      } else {
        const error = await response.json();
        if (response.status === 401) {
          alert(error.message || 'يرجى تسجيل الدخول لبدء رحلتك الذكية وكسب النقاط 🎯');
        }
      }
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  };

  const handleLike = async () => {
    if (!article) return;
    
    const newLiked = !interaction.liked;
    setInteraction(prev => ({ ...prev, liked: newLiked }));
    
    // حفظ التفاعل محلياً
    localStorage.setItem(`article_${article.id}_interactions`, JSON.stringify({
      ...interaction,
      liked: newLiked
    }));
    
    // تتبع التفاعل
    await trackInteraction(newLiked ? 'like' : 'unlike', article.id);
  };

  const handleSave = async () => {
    if (!article) return;
    
    const newSaved = !interaction.saved;
    setInteraction(prev => ({ ...prev, saved: newSaved }));
    
    localStorage.setItem(`article_${article.id}_interactions`, JSON.stringify({
      ...interaction,
      saved: newSaved
    }));
    
    await trackInteraction(newSaved ? 'save' : 'unsave', article.id);
  };

  const handleShare = async (platform: string) => {
    if (!article) return;
    
    const url = window.location.href;
    const text = article.title;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        await navigator.clipboard.writeText(url);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
        alert('تم نسخ الرابط');
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    
    setInteraction(prev => ({ ...prev, shared: true }));
    await trackInteraction('share', article.id, { platform });
  };

  const speakSummary = () => {
    if (!article) return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(article.summary || article.title);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.9;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getCategoryColor = (categoryName?: string) => {
    return categoryColors[categoryName || ''] || categoryColors['default'];
  };

  const generatePlaceholderImage = (title: string) => {
    const colors = ['#8B5CF6', '#10B981', '#3B82F6', '#EF4444', '#F59E0B'];
    const colorIndex = title.charCodeAt(0) % colors.length;
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colors[colorIndex]};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${colors[(colorIndex + 1) % colors.length]};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="800" height="400" fill="url(#grad)"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="32" fill="white" text-anchor="middle" dominant-baseline="middle" opacity="0.8">
          ${title.substring(0, 30)}
        </text>
      </svg>
    `)}`;
  };

  const renderArticleContent = (content: string) => {
    try {
      // محاولة تحليل المحتوى كـ JSON blocks
      const blocks = JSON.parse(content);
      
      if (Array.isArray(blocks)) {
        return blocks.map((block: any, index: number) => {
          switch (block.type) {
            case 'paragraph':
              return (
                <p key={index} className="mb-6 text-gray-800 leading-loose text-lg">
                  {block.content || block.text}
                </p>
              );
            
            case 'heading':
              return (
                <h3 key={index} className="text-2xl font-bold text-gray-900 mb-4 mt-8">
                  {block.content || block.text}
                </h3>
              );
            
            case 'quote':
            case 'blockquote':
              return (
                <blockquote key={index} className="border-r-4 border-blue-500 pr-6 my-8 text-gray-700 italic">
                  <p className="text-lg leading-relaxed">
                    {block.content || block.text}
                  </p>
                  {block.author && (
                    <cite className="block mt-2 text-sm text-gray-600">
                      — {block.author}
                    </cite>
                  )}
                </blockquote>
              );
            
            case 'list':
              return (
                <ul key={index} className="list-disc list-inside mb-6 space-y-2 text-gray-800">
                  {(block.items || []).map((item: string, i: number) => (
                    <li key={i} className="text-lg leading-relaxed">{item}</li>
                  ))}
                </ul>
              );
            
            case 'ordered-list':
              return (
                <ol key={index} className="list-decimal list-inside mb-6 space-y-2 text-gray-800">
                  {(block.items || []).map((item: string, i: number) => (
                    <li key={i} className="text-lg leading-relaxed">{item}</li>
                  ))}
                </ol>
              );
            
            case 'image':
              return (
                <figure key={index} className="my-8">
                  <img
                    src={block.url || block.src}
                    alt={block.alt || ''}
                    className="w-full rounded-2xl shadow-lg"
                  />
                  {block.caption && (
                    <figcaption className="text-center text-sm text-gray-600 mt-2">
                      {block.caption}
                    </figcaption>
                  )}
                </figure>
              );
            
            default:
              return (
                <p key={index} className="mb-6 text-gray-800 leading-loose text-lg">
                  {block.content || block.text || ''}
                </p>
              );
          }
        });
      }
    } catch (e) {
      // إذا فشل التحليل، المحتوى ليس JSON، نعرضه كـ HTML عادي
    }
    
    // عرض المحتوى كـ HTML إذا لم يكن JSON
    return (
      <div 
        dangerouslySetInnerHTML={{ __html: content }}
        className="prose-p:mb-6 prose-p:text-gray-800 prose-p:leading-loose prose-p:text-lg
                   prose-h3:text-2xl prose-h3:font-bold prose-h3:text-gray-900 prose-h3:mb-4 prose-h3:mt-8
                   prose-blockquote:border-r-4 prose-blockquote:border-blue-500 prose-blockquote:pr-6 
                   prose-blockquote:my-8 prose-blockquote:text-gray-700 prose-blockquote:italic
                   prose-ul:list-disc prose-ul:list-inside prose-ul:mb-6 prose-ul:space-y-2
                   prose-ol:list-decimal prose-ol:list-inside prose-ol:mb-6 prose-ol:space-y-2
                   prose-li:text-lg prose-li:leading-relaxed prose-li:text-gray-800
                   prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-8"
      />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-500">جاري تحميل المقال...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6 shadow-lg">
              <BookOpenIcon className="w-12 h-12 text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">المقال غير موجود</h3>
            <p className="text-gray-600 mb-8 text-lg">عذراً، لم نتمكن من العثور على المقال المطلوب</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <ArrowRight className="w-5 h-5" />
                العودة إلى الرئيسية
              </Link>
              <Link 
                href="/categories" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-2xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 border border-gray-200"
              >
                <Tag className="w-5 h-5" />
                تصفح التصنيفات
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300" ref={contentRef}>
      <Header />
      
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
          style={{ width: `${readProgress}%` }}
        />
      </div>

      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              الرئيسية
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <Link href="/" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              الأخبار
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span className="text-gray-900 dark:text-gray-100 font-medium">{article.category_name || 'عام'}</span>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Article Content */}
        <article className="w-full">
          {/* Header Info */}
          <div className="mb-8">
            {/* Category & Badges */}
            <div className="flex items-center gap-3 mb-6">
              <span className={`inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r ${getCategoryColor(article.category_name)} text-white text-sm font-bold rounded-full shadow-md`}>
                <Tag className="w-4 h-4" />
                {article.category_name || 'عام'}
              </span>
              {article.is_breaking && (
                <span className="inline-flex items-center gap-1 px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-full animate-pulse shadow-md">
                  <Zap className="w-4 h-4" />
                  عاجل
                </span>
              )}
              {article.is_featured && (
                <span className="inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold rounded-full shadow-md">
                  <Award className="w-4 h-4" />
                  مميز
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              {article.title}
            </h1>

            {/* Subtitle */}
            {article.subtitle && (
              <h2 className="text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                {article.subtitle}
              </h2>
            )}

            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400 pb-8 border-b dark:border-gray-700">
              {/* Author */}
              {article.author_name && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{article.author_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">كاتب</p>
                  </div>
                </div>
              )}

              {/* Date & Time */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <span>{formatDate(article.published_at || article.created_at)}</span>
                <span className="text-gray-400 dark:text-gray-600">•</span>
                <span>{formatTime(article.published_at || article.created_at)}</span>
              </div>

              {/* Updated */}
              {article.updated_at && article.updated_at !== article.created_at && (
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-500">
                  <RefreshCw className="w-4 h-4" />
                  <span>آخر تحديث: {formatDate(article.updated_at)}</span>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 mr-auto">
                {article.reading_time && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span>{article.reading_time} دقائق قراءة</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <span>{article.views_count || 0} مشاهدة</span>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          {(article.featured_image || article.title) && (
            <div className="mb-12">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={article.featured_image || generatePlaceholderImage(article.title)}
                  alt={article.title}
                  className="w-full h-auto"
                />
                {article.is_breaking && (
                  <div className="absolute top-6 right-6 px-4 py-2 bg-red-500 text-white font-bold rounded-full animate-pulse backdrop-blur-sm">
                    خبر عاجل
                  </div>
                )}
              </div>
              {article.image_caption && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center italic">
                  {article.image_caption}
                </p>
              )}
            </div>
          )}

          {/* Smart Summary */}
          {article.summary && (
            <div className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-3xl p-8 mb-12 border border-blue-200 dark:border-gray-700 shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 dark:bg-blue-900 rounded-full blur-3xl opacity-30" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-200 dark:bg-purple-900 rounded-full blur-3xl opacity-30" />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full shadow-md">
                      <Sparkles className="w-4 h-4" />
                      <span className="font-bold text-sm">الملخص الذكي</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">ملخص تم توليده بواسطة الذكاء الاصطناعي</p>
                  </div>
                  <button
                    onClick={speakSummary}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all font-medium text-sm ${
                      isSpeaking 
                        ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800' 
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-md hover:shadow-lg'
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
                        <span>🔊 استمع للملخص</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-loose text-lg">
                  {article.summary}
                </p>
              </div>
            </div>
          )}

          {/* Article Content - مع الحفاظ على قابلية القراءة */}
          <div className="max-w-4xl mx-auto mb-12">
            <div 
              className="prose prose-lg prose-gray dark:prose-invert max-w-none"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {renderArticleContent(article.content)}
            </div>
          </div>

          {/* Keywords */}
          {article.seo_keywords && (
            <div className="flex items-center gap-3 flex-wrap mb-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl">
              <Hash className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              {article.seo_keywords.split(',').map((keyword, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium shadow-sm"
                >
                  {keyword.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Interaction Buttons */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-8 px-8 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800 rounded-3xl mb-12">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all transform hover:scale-105 ${
                  interaction.liked
                    ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-md'
                }`}
              >
                <Heart className={`w-5 h-5 ${interaction.liked ? 'fill-current' : ''}`} />
                <span>{interaction.liked ? 'أعجبني' : 'إعجاب'}</span>
                {article.likes_count && article.likes_count > 0 && (
                  <span className="mr-1">({article.likes_count})</span>
                )}
              </button>

              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all transform hover:scale-105 ${
                  interaction.saved
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-md'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${interaction.saved ? 'fill-current' : ''}`} />
                <span>{interaction.saved ? 'محفوظ' : 'حفظ'}</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">شارك المقال:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleShare('twitter')}
                  className="p-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-2xl transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                  title="شارك على تويتر"
                >
                  <Twitter className="w-5 h-5 text-[#1DA1F2]" />
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="p-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-2xl transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                  title="شارك على فيسبوك"
                >
                  <Facebook className="w-5 h-5 text-[#4267B2]" />
                </button>
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="p-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-2xl transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                  title="شارك على واتساب"
                >
                  <MessageCircle className="w-5 h-5 text-[#25D366]" />
                </button>
                <button
                  onClick={() => handleShare('telegram')}
                  className="p-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-2xl transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                  title="شارك على تيليجرام"
                >
                  <Send className="w-5 h-5 text-[#0088cc]" />
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="p-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-2xl transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                  title="نسخ الرابط"
                >
                  {copySuccess ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </article>

        {/* AI Recommendations - محتوى مخصص لك */}
        {!userDataLoaded ? (
          // عرض حالة التحميل أثناء التحقق من تسجيل الدخول
          <div className="mt-16 mb-16">
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>جاري التحقق من حالة تسجيل الدخول...</span>
              </div>
            </div>
          </div>
        ) : isLoggedIn ? (
          recommendations.length > 0 ? (
            <div className="mt-16 mb-16">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-xl shadow-md">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">محتوى مخصص لك 🤖</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">اخترنا لك هذا المحتوى بناءً على اهتماماتك</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-[10px] font-medium rounded-full">
                  <Brain className="w-3 h-3" />
                  مقترح ذكي
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.slice(0, 6).map((rec: any) => (
                  <Link key={rec.id} href={`/article/${rec.id}`}>
                    <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden h-full">
                      {/* AI Badge */}
                      {rec.recommendation_reason && (
                        <div className="absolute top-2 right-2 z-10 px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-medium rounded-full shadow-md backdrop-blur-sm">
                          {rec.recommendation_reason}
                        </div>
                      )}
                      
                      <div className="flex flex-col h-full">
                        {/* Image */}
                        <div className="relative h-32 overflow-hidden">
                          <img
                            src={rec.featured_image || rec.image_url || generatePlaceholderImage(rec.title)}
                            alt={rec.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 p-3">
                          {/* Category */}
                          {rec.category_name && (
                            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 mb-2 text-[10px] font-bold text-white rounded-full bg-gradient-to-r ${getCategoryColor(rec.category_name)}`}>
                              <Tag className="w-2.5 h-2.5" />
                              {rec.category_name}
                            </span>
                          )}
                          
                          {/* Title */}
                          <h4 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2 mb-2">
                            {rec.title}
                          </h4>
                          
                          {/* Meta - simplified */}
                          <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                              {rec.created_at && (
                                <span>{formatDate(rec.created_at)}</span>
                              )}
                              {rec.reading_time && (
                                <span>{rec.reading_time} د</span>
                              )}
                            </div>
                            
                            {/* Stats */}
                            <div className="flex items-center gap-2">
                              {rec.views_count > 0 && (
                                <div className="flex items-center gap-0.5">
                                  <Eye className="w-3 h-3" />
                                  <span>{rec.views_count}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              {/* Loading State */}
              {loadingRecommendations && (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>جاري تحميل التوصيات المخصصة...</span>
                  </div>
                </div>
              )}
            </div>
          ) : loadingRecommendations ? (
            <div className="mt-16 mb-16">
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري تحميل التوصيات المخصصة...</span>
                </div>
              </div>
            </div>
          ) : null
        ) : (
          <div className="mt-16 mb-16">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-800 rounded-3xl p-8 text-center border border-purple-200 dark:border-gray-700">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-full mb-4">
                <Bot className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">احصل على توصيات مخصصة لك 🤖</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">سجل دخولك لتحصل على محتوى مختار خصيصاً بناءً على اهتماماتك</p>
              <Link 
                href="/login" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl hover:shadow-lg transition-all transform hover:scale-105"
              >
                <Sparkles className="w-5 h-5" />
                سجل دخولك الآن
              </Link>
            </div>
          </div>
        )}

        {/* Related Articles */}
        {article.related_articles && article.related_articles.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl shadow-md">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">مقالات ذات صلة</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {article.related_articles.map((related) => (
                <Link key={related.id} href={`/article/${related.id}`}>
                  <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="flex gap-4">
                      <img
                        src={related.featured_image || generatePlaceholderImage(related.title)}
                        alt={related.title}
                        className="w-40 h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="flex-1 p-4">
                        <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
                          {related.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <span>{formatDate(related.published_at || related.created_at || '')}</span>
                          {related.reading_time && (
                            <>
                              <span>•</span>
                              <span>{related.reading_time} دقائق</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 