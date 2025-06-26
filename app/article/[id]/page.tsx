'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/Header';
import { useInteractions } from '../../../hooks/useInteractions';
// import { 
//   ArrowRight, Calendar, Clock, User, Eye, Tag, 
//   ThumbsUp, Share2, Volume2, VolumeX, Loader2,
//   BookOpen, Heart, MessageCircle, Bookmark, Twitter,
//   Facebook, Send, Copy, ChevronRight, Award, Hash,
//   Zap, Globe, BookOpen as BookOpenIcon, PenTool, RefreshCw,
//   Sparkles, TrendingUp, Check, Brain, Bot, FileText,
//   Share, MessageSquare, MoreHorizontal, X, Home
// } from 'lucide-react';
import './article-styles.css';
import './article-dark-mode-fixes.css';
import './article-styles-improved.css';
import Footer from '@/components/Footer';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { formatFullDate, formatTimeOnly, formatRelativeDate } from '@/lib/date-utils';
import { getImageUrl } from '@/lib/utils';
import ArticleJsonLd from '@/components/ArticleJsonLd';
import { getCookie } from '@/lib/cookies';

// تعريف نوع twttr لتويتر
declare global {
  interface Window {
    twttr: any;
  }
}

// دالة لتسجيل التفاعل عبر API
async function trackInteraction(data: {
  userId: string;
  articleId: string;
  interactionType: string;
  source?: string;
  duration?: number;
  completed?: boolean;
}) {
  try {
    const response = await fetch('/api/interactions/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      console.error('Failed to track interaction');
    }
  } catch (error) {
    console.error('Error tracking interaction:', error);
  }
}

interface Article {
  id: string;
  title: string;
  subtitle?: string;
  summary?: string;
  content: string;
  featured_image?: string;
  featured_image_alt?: string;
  image_caption?: string;
  category_id: number;
  category?: {
    id: number;
    name_ar: string;
    name_en?: string;
    color_hex: string;
    icon?: string;
  };
  category_name?: string;
  author?: string | {
    id: string;
    name: string;
    avatar?: string;
  };
  author_id?: string;
  author_name?: string;
  author_avatar?: string;
  reporter?: string;
  reporter_name?: string;
  stats?: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
    saves: number;
  };
  views_count: number;
  likes_count?: number;
  shares_count?: number;
  created_at: string;
  published_at?: string;
  updated_at?: string;
  reading_time?: number;
  is_breaking?: boolean;
  is_featured?: boolean;
  seo_keywords?: string | string[];
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
  likesCount: number;
  sharesCount: number;
  savesCount: number;
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function NewsDetailPageImproved({ params }: PageProps) {
  const router = useRouter();
  const { recordInteraction, trackReadingProgress } = useInteractions();
  const { darkMode } = useDarkModeContext();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [interaction, setInteraction] = useState<UserInteraction>({
    liked: false,
    saved: false,
    shared: false,
    likesCount: 0,
    sharesCount: 0,
    savesCount: 0
  });
  const [showShareMenu, setShowShareMenu] = useState(false);
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
  const [userId, setUserId] = useState<string | null>(null);
  const [readingTime, setReadingTime] = useState(0);
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);
  
  // إنشاء معرف ثابت للضيف عند تحميل الصفحة
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('=== Guest ID Check ===');
      console.log('Before check:', localStorage.getItem('guestId'));
      
      let guestId = localStorage.getItem('guestId');
      
      if (!guestId) {
        // إنشاء معرف فريد وثابت
        guestId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('guestId', guestId);
        console.log('تم إنشاء معرف ضيف جديد:', guestId);
      } else {
        console.log('معرف الضيف الموجود:', guestId);
      }
      
      // تحقق إضافي للتأكد من الحفظ
      const savedId = localStorage.getItem('guestId');
      console.log('معرف الضيف المحفوظ:', savedId);
      
      // التحقق من وجود أي مشاكل في localStorage
      try {
        localStorage.setItem('test-key', 'test-value');
        const testValue = localStorage.getItem('test-key');
        console.log('localStorage test:', testValue === 'test-value' ? 'WORKING' : 'FAILED');
        localStorage.removeItem('test-key');
      } catch (error) {
        console.error('localStorage ERROR:', error);
      }
    }
  }, []);

  useEffect(() => {
    async function loadArticle() {
      const resolvedParams = await params;
      console.log('=== Article Loading ===');
      console.log('Resolved params:', resolvedParams);
      
      if (resolvedParams?.id) {
        const cleanArticleId = resolvedParams.id.trim();
        console.log('Article ID:', cleanArticleId);
        setArticleId(cleanArticleId);
        fetchArticle(cleanArticleId);
      } else {
        console.error('No article ID found in params!');
      }
    }
    loadArticle();
  }, []);

  useEffect(() => {
    // التحقق من تسجيل الدخول
    const checkLoginStatus = () => {
      const storedUserId = localStorage.getItem('user_id');
      const userData = localStorage.getItem('user');
      
      const isValidLogin = !!(storedUserId && storedUserId !== 'anonymous' && userData);
      
      setIsLoggedIn(isValidLogin);
      setUserId(isValidLogin ? storedUserId : null);
      setUserDataLoaded(true);
    };
    
    checkLoginStatus();
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user_id' || e.key === 'user') {
        checkLoginStatus();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    const timeoutId = setTimeout(checkLoginStatus, 100);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearTimeout(timeoutId);
    };
  }, []);

  // تتبع المشاهدة والقراءة
  useEffect(() => {
    if (article && articleId) {
      // تسجيل المشاهدة للجميع (مسجلين وزوار)
      trackInteraction({
        userId: userId || 'guest',
        articleId,
        interactionType: 'view',
        source: 'article_page'
      });
    }
  }, [article, articleId]); // إزالة userId من dependencies

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
        
        // تتبع التقدم للمستخدمين المسجلين
        if (userId && articleId) {
          trackReadingProgress(userId, articleId, progress, duration);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [userId, articleId]);

  // إعادة جلب التوصيات عند تغيير حالة تسجيل الدخول
  useEffect(() => {
    if (userDataLoaded && isLoggedIn && articleId) {
      fetchRecommendations(articleId);
    }
  }, [isLoggedIn, userDataLoaded, articleId]);

  // جلب التفاعلات المحفوظة عند تحديث userId أو articleId
  useEffect(() => {
    async function fetchUserInteractions() {
      if (!articleId) return;

      console.log('=== fetchUserInteractions ===');
      console.log('articleId:', articleId);
      console.log('userId:', userId);
      console.log('localStorage guestId:', localStorage.getItem('guestId'));

      // استخدام نظام localStorage المحسّن للجميع
      const { getUserArticleInteraction, migrateOldData } = await import('@/lib/interactions-localStorage');
      
      // ترحيل البيانات القديمة إن وجدت
      migrateOldData();
      
      const guestId = localStorage.getItem('guestId') || 'guest-anonymous';
      const currentUserId = userId || guestId;
      
      console.log('currentUserId للجلب:', currentUserId);
      
      // جلب التفاعلات من localStorage
      const localInteractions = getUserArticleInteraction(currentUserId, articleId);
      console.log('التفاعلات المحلية:', localInteractions);
      
      setInteraction(prev => ({
        ...prev,
        liked: localInteractions.liked,
        saved: localInteractions.saved,
        shared: localInteractions.shared
      }));

      // محاولة جلب من الخادم للمستخدمين المسجلين (للمزامنة)
      if (userId) {
        try {
          const interactionsResponse = await fetch(`/api/interactions/user-article?userId=${userId}&articleId=${articleId}`);
          if (interactionsResponse.ok) {
            const interactionsData = await interactionsResponse.json();
            if (interactionsData.success && interactionsData.data) {
              // دمج البيانات من الخادم إذا كانت أحدث
              const serverInteractions = interactionsData.data;
              setInteraction(prev => ({
                ...prev,
                liked: serverInteractions.liked || localInteractions.liked,
                saved: serverInteractions.saved || localInteractions.saved,
                shared: serverInteractions.shared || localInteractions.shared
              }));
            }
          }
        } catch (error) {
          console.log('استخدام البيانات المحلية فقط');
        }
      }
    }

    fetchUserInteractions();
  }, [userId, articleId]);

  // تحميل سكريبت تويتر
  useEffect(() => {
    if (article && article.content) {
      try {
        const blocks = JSON.parse(article.content);
        const hasTweets = blocks.some((block: any) => block.type === 'tweet');
        
        if (hasTweets && !window.twttr) {
          const script = document.createElement('script');
          script.src = 'https://platform.twitter.com/widgets.js';
          script.async = true;
          script.onload = () => {
            if (window.twttr && window.twttr.widgets) {
              window.twttr.widgets.load();
            }
          };
          document.body.appendChild(script);
        } else if (hasTweets && window.twttr && window.twttr.widgets) {
          // إعادة تحميل التغريدات إذا كان السكريبت محملاً بالفعل
          setTimeout(() => {
            window.twttr.widgets.load();
          }, 100);
        }
      } catch (e) {
        // ليس محتوى JSON
      }
    }
  }, [article]);

  // جلب المقالات ذات الصلة
  useEffect(() => {
    async function fetchRelatedArticles() {
      if (!article) return;
      
      try {
        // جلب مقالات من نفس التصنيف
        const categoryName = article.category?.name_ar || article.category_id;
        const response = await fetch(`/api/articles?status=published&category=${encodeURIComponent(categoryName)}&limit=6`);
        
        if (response.ok) {
          const resJson = await response.json();
          
          // بعض الـ APIs ترجع المصفوفة داخل خاصية articles أو data
          const list: any[] = Array.isArray(resJson)
            ? resJson
            : resJson.articles || resJson.data || [];
          
          if (Array.isArray(list)) {
            const filtered = list.filter((a: any) => a.id !== article.id);
            setRelatedArticles(filtered.slice(0, 4));
          }
        }
      } catch (error) {
        console.error('Error fetching related articles:', error);
      }
    }
    
    fetchRelatedArticles();
  }, [article]);

  const fetchArticle = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/articles/${id}`, {
        // إضافة cache headers لتحسين الأداء
        next: { revalidate: 60 }, // إعادة التحقق كل دقيقة
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=59'
        }
      });
      
      if (!response.ok) {
        router.push('/');
        return;
      }
      
      const data = await response.json();
      
      // طباعة البيانات للتحقق
      console.log('=== Article Data ===');
      console.log('Full article:', data);
      console.log('author field:', data.author);
      console.log('author_name field:', data.author_name);
      console.log('reporter field:', data.reporter);
      console.log('reporter_name field:', data.reporter_name);
      
      // التحقق من نوع البيانات
      console.log('Type of author:', typeof data.author);
      if (data.author && typeof data.author === 'object') {
        console.log('author.name:', data.author.name);
      }
      
      // تحضير البيانات
      if (data.content_blocks && Array.isArray(data.content_blocks) && data.content_blocks.length > 0) {
        data.content = JSON.stringify(data.content_blocks);
      }
      
      setArticle(data);
      
      // تحديث عدادات التفاعل
      if (data.stats) {
        setInteraction(prev => ({
          ...prev,
          likesCount: data.stats.likes || 0,
          sharesCount: data.stats.shares || 0,
          savesCount: data.stats.saves || 0
        }));
      }
      
    } catch (error) {
      console.log('Network error while fetching article:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async (currentArticleId: string) => {
    try {
      setLoadingRecommendations(true);
      
      if (!userId) return;
      
      const response = await fetch(`/api/content/personalized?user_id=${userId}&limit=6`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.articles) {
          // فلترة المقال الحالي
          const filtered = data.data.articles.filter((a: any) => a.id !== currentArticleId);
          setRecommendations(filtered);
        }
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleLike = async () => {
    if (!article) return;
    
    const guestId = localStorage.getItem('guestId') || 'guest-anonymous';
    const currentUserId = userId || guestId;
    
    console.log('=== handleLike ===');
    console.log('userId:', userId);
    console.log('guestId:', guestId);
    console.log('currentUserId:', currentUserId);
    console.log('articleId:', article.id);
    
    const newLiked = !interaction.liked;
    
    // تحديث الحالة المحلية فوراً
    setInteraction(prev => ({ 
      ...prev, 
      liked: newLiked,
      likesCount: newLiked ? prev.likesCount + 1 : prev.likesCount - 1
    }));
    
    // حفظ في localStorage أولاً (للاستجابة السريعة)
    const { saveLocalInteraction } = await import('@/lib/interactions-localStorage');
    const localResult = saveLocalInteraction(
      currentUserId,
      article.id,
      newLiked ? 'like' : 'unlike',
      { source: 'article_page' }
    );
    
    console.log('نتيجة الحفظ المحلي:', localResult);
    
    // إرسال إلى قاعدة البيانات (للحفظ الدائم)
    try {
      console.log('إرسال إلى API...');
      const response = await fetch('/api/interactions/track-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          articleId: article.id,
          interactionType: newLiked ? 'like' : 'unlike',
          metadata: { source: 'article_page' }
        })
      });

      console.log('حالة الاستجابة:', response.status);
      const data = await response.json();
      console.log('بيانات الاستجابة:', data);

      if (response.ok) {
        const data = await response.json();
        
        // عرض إشعار بالنقاط إذا كان هناك نقاط
        if (data.points_earned > 0) {
          const toast = document.createElement('div');
          toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse';
          toast.textContent = `🎉 ${data.message}`;
          document.body.appendChild(toast);
          setTimeout(() => document.body.removeChild(toast), 3000);
        }
      } else {
        // في حالة فشل الخادم، الاعتماد على النتيجة المحلية
        if (localResult.success && localResult.points > 0) {
          const toast = document.createElement('div');
          toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse';
          toast.textContent = `🎉 ${localResult.message}`;
          document.body.appendChild(toast);
          setTimeout(() => document.body.removeChild(toast), 3000);
        }
      }
    } catch (error) {
      console.error('خطأ في حفظ التفاعل:', error);
      // الاعتماد على النتيجة المحلية في حالة الخطأ
      if (localResult.success && localResult.points > 0) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse';
        toast.textContent = `⚠️ تم الحفظ محلياً: ${localResult.message}`;
        document.body.appendChild(toast);
        setTimeout(() => document.body.removeChild(toast), 3000);
      }
    }
  };

  const handleSave = async () => {
    if (!article) return;
    
    const guestId = localStorage.getItem('guestId') || 'guest-anonymous';
    const currentUserId = userId || guestId;
    
    const newSaved = !interaction.saved;
    
    setInteraction(prev => ({ 
      ...prev, 
      saved: newSaved,
      savesCount: newSaved ? prev.savesCount + 1 : prev.savesCount - 1
    }));
    
    // حفظ في localStorage أولاً (للاستجابة السريعة)
    const { saveLocalInteraction } = await import('@/lib/interactions-localStorage');
    const localResult = saveLocalInteraction(
      currentUserId,
      article.id,
      newSaved ? 'save' : 'unsave',
      { source: 'article_page' }
    );
    
    // إرسال إلى قاعدة البيانات (للحفظ الدائم)
    try {
      const response = await fetch('/api/interactions/track-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          articleId: article.id,
          interactionType: newSaved ? 'save' : 'unsave',
          metadata: { source: 'article_page' }
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // عرض إشعار بالنقاط إذا كان هناك نقاط
        if (data.points_earned > 0) {
          const toast = document.createElement('div');
          toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse';
          toast.textContent = `🎉 ${data.message}`;
          document.body.appendChild(toast);
          setTimeout(() => document.body.removeChild(toast), 3000);
        }
      } else {
        // في حالة فشل الخادم، الاعتماد على النتيجة المحلية
        if (localResult.success && localResult.points > 0) {
          const toast = document.createElement('div');
          toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse';
          toast.textContent = `🎉 ${localResult.message}`;
          document.body.appendChild(toast);
          setTimeout(() => document.body.removeChild(toast), 3000);
        }
      }
    } catch (error) {
      console.error('خطأ في حفظ التفاعل:', error);
      // الاعتماد على النتيجة المحلية في حالة الخطأ
      if (localResult.success && localResult.points > 0) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse';
        toast.textContent = `⚠️ تم الحفظ محلياً: ${localResult.message}`;
        document.body.appendChild(toast);
        setTimeout(() => document.body.removeChild(toast), 3000);
      }
    }
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
        alert('تم نسخ الرابط بنجاح ✅');
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    
    setShowShareMenu(false);
    setInteraction(prev => ({ 
      ...prev, 
      shared: true,
      sharesCount: prev.sharesCount + 1
    }));
    
    // حفظ التفاعل محلياً للجميع
    const { saveLocalInteraction } = await import('@/lib/interactions-localStorage');
    const guestId = localStorage.getItem('guestId') || 'guest-anonymous';
    const currentUserId = userId || guestId;
    
    const result = saveLocalInteraction(
      currentUserId,
      article.id,
      'share',
      { source: `share_${platform}`, platform }
    );
    
    if (result.success && result.points > 0) {
      // عرض إشعار بالنقاط
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse';
      toast.textContent = `🎉 ${result.message}`;
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
    }
    
    // تسجيل التفاعل لجميع المستخدمين في قاعدة البيانات
    try {
      const response = await fetch('/api/interactions/track-activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUserId,
          articleId: article.id,
          interactionType: 'share',
          metadata: {
            source: `share_${platform}`,
            platform: platform,
            timestamp: new Date().toISOString()
          }
        }),
      });
      
      const data = await response.json();
      if (data.success && data.points_earned > 0) {
        // عرض إشعار بالنقاط من الخادم
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse';
        toast.textContent = `🎉 ${data.message}`;
        document.body.appendChild(toast);
        setTimeout(() => document.body.removeChild(toast), 3000);
      }
    } catch (error) {
      console.error('خطأ في تسجيل التفاعل:', error);
    }
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

  // استخدام دوال التاريخ الموحدة


  const getCategoryColor = (category?: any) => {
    if (category?.color_hex) {
      return category.color_hex;
    }
    
    // ألوان احتياطية حسب اسم التصنيف
    const colors: { [key: string]: string } = {
      'تقنية': '#8B5CF6',
      'اقتصاد': '#10B981',
      'رياضة': '#3B82F6',
      'سياسة': '#EF4444',
      'ثقافة': '#F59E0B',
      'صحة': '#EC4899',
      'محلي': '#6366F1',
      'دولي': '#06B6D4',
      'منوعات': '#F97316'
    };
    
    return colors[category?.name_ar || ''] || '#6B7280';
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
      if (!content) {
        return <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 text-center">لا يوجد محتوى لعرضه</p>;
      }
      
      // محاولة تحليل المحتوى كـ JSON blocks
      const blocks = JSON.parse(content);
      
      if (Array.isArray(blocks)) {
        return (
          <div className="space-y-6">
            {blocks.map((block: any, index: number) => {
              if (!block || typeof block !== 'object') return null;
              
              const blockType = block.type;
              const blockData = block.data?.[blockType] || block.data || {};
              
              switch (blockType) {
                case 'paragraph':
                  // معالجة البنية المتداخلة للفقرة
                  let paragraphText = '';
                  
                  if (blockData.paragraph?.paragraph?.text) {
                    paragraphText = blockData.paragraph.paragraph.text;
                  } else if (blockData.paragraph?.text) {
                    paragraphText = blockData.paragraph.text;
                  } else if (blockData.text) {
                    paragraphText = blockData.text;
                  } else if (block.text) {
                    paragraphText = block.text;
                  } else if (block.content) {
                    paragraphText = block.content;
                  }
                  
                  const finalParagraphText = typeof paragraphText === 'object' ? 
                    ((paragraphText as any).text || JSON.stringify(paragraphText)) : paragraphText;
                    
                  if (!finalParagraphText) return null;
                  return (
                    <p key={block.id || index} className="text-lg leading-relaxed text-gray-900 dark:text-gray-100">
                      {finalParagraphText}
                    </p>
                  );
                
                case 'heading':
                  const headingText = blockData.text || block.text || '';
                  const finalHeadingText = typeof headingText === 'object' ? 
                    (headingText.text || JSON.stringify(headingText)) : headingText;
                  const level = blockData.level || 2;
                  const HeadingTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
                  const headingClasses = {
                    1: 'text-3xl font-bold mt-8 mb-4',
                    2: 'text-2xl font-bold mt-6 mb-3',
                    3: 'text-xl font-bold mt-4 mb-2',
                    4: 'text-lg font-bold mt-3 mb-2',
                    5: 'text-base font-bold mt-2 mb-1',
                    6: 'text-base font-bold mt-2 mb-1'
                  };
                  
                  if (!finalHeadingText) return null;
                  return (
                    <HeadingTag 
                      key={block.id || index} 
                      className={`${headingClasses[level as keyof typeof headingClasses]} text-gray-900 dark:text-white dark:text-gray-100`}
                    >
                      {finalHeadingText}
                    </HeadingTag>
                  );
                
                case 'list':
                  const items = blockData.items || block.items || [];
                  const listStyle = blockData.style || 'unordered';
                  
                  if (!items.length) return null;
                  
                  const ListTag = listStyle === 'ordered' ? 'ol' : 'ul';
                  const listClass = listStyle === 'ordered' 
                    ? 'list-decimal list-inside' 
                    : 'list-disc list-inside';
                  
                  return (
                    <ListTag key={block.id || index} className={`${listClass} space-y-2 text-gray-900 dark:text-gray-100`}>
                      {items.map((item: string, i: number) => (
                        <li key={i} className="text-lg leading-relaxed pr-2">
                          {item}
                        </li>
                      ))}
                    </ListTag>
                  );
                
                case 'quote':
                  const quoteText = blockData.text || block.text || '';
                  const finalQuoteText = typeof quoteText === 'object' ? 
                    (quoteText.text || JSON.stringify(quoteText)) : quoteText;
                  const quoteAuthor = blockData.caption || blockData.author || block.caption || '';
                  const finalQuoteAuthor = typeof quoteAuthor === 'object' ? 
                    (quoteAuthor.text || JSON.stringify(quoteAuthor)) : quoteAuthor;
                  
                  if (!finalQuoteText) return null;
                  return (
                    <blockquote 
                      key={block.id || index} 
                      className="border-r-4 border-blue-500 pr-6 py-4 my-6 bg-gray-50 dark:bg-gray-900 dark:bg-gray-800 rounded-lg"
                    >
                      <p className="text-lg italic text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-2">
                        "{finalQuoteText}"
                      </p>
                      {finalQuoteAuthor && (
                        <cite className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 not-italic">
                          — {finalQuoteAuthor}
                        </cite>
                      )}
                    </blockquote>
                  );
                
                case 'image':
                  const imageUrl = blockData.file?.url || blockData.url || block.url || '';
                  const imageCaption = blockData.caption || block.caption || '';
                  const imageAlt = blockData.alt || block.alt || imageCaption || 'صورة';
                  
                  if (!imageUrl) return null;
                  return (
                    <figure key={block.id || index} className="my-8">
                      <div className="overflow-hidden rounded-2xl shadow-xl dark:shadow-gray-900/50">
                        <img
                          src={imageUrl}
                          alt={imageAlt}
                          className="w-full h-auto object-cover rounded-2xl transition-transform duration-500 hover:scale-105"
                        />
                      </div>
                      {imageCaption && (
                        <figcaption className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 text-center mt-3 italic">
                          {imageCaption}
                        </figcaption>
                      )}
                    </figure>
                  );
                
                case 'tweet':
                  // معالجة البنية المتداخلة للبيانات
                  let tweetUrl = '';
                  
                  // التحقق من مختلف الأماكن المحتملة للـ URL
                  if (blockData.tweet?.tweet?.url) {
                    tweetUrl = blockData.tweet.tweet.url;
                  } else if (blockData.tweet?.url) {
                    tweetUrl = blockData.tweet.url;
                  } else if (blockData.url) {
                    tweetUrl = blockData.url;
                  } else if (block.url) {
                    tweetUrl = block.url;
                  }
                  
                  if (!tweetUrl) return null;
                  
                  // استخراج معرف التغريدة
                  const tweetId = tweetUrl.match(/status\/(\d+)/)?.[1];
                  if (!tweetId) return null;
                  
                  return (
                    <div key={block.id || index} className="my-8 flex justify-center">
                      <blockquote className="twitter-tweet" data-lang="ar">
                        <a href={tweetUrl}></a>
                      </blockquote>
                    </div>
                  );
                
                case 'table':
                  // معالجة البنية المتداخلة للجدول
                  let tableData = { headers: [], rows: [] };
                  
                  if (blockData.table?.table) {
                    tableData = blockData.table.table;
                  } else if (blockData.table) {
                    tableData = blockData.table;
                  } else if (block.table) {
                    tableData = block.table;
                  }
                  
                  if (!tableData.rows || tableData.rows.length === 0) return null;
                  
                  return (
                    <div key={block.id || index} className="my-8 overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        {tableData.headers && tableData.headers.length > 0 && (
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                              {tableData.headers.map((header: string, i: number) => (
                                <th
                                  key={i}
                                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                >
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                        )}
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                          {tableData.rows.map((row: string[], rowIndex: number) => (
                            <tr key={rowIndex}>
                              {row.map((cell: string, cellIndex: number) => (
                                <td
                                  key={cellIndex}
                                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                
                case 'link':
                  // معالجة البنية المتداخلة للرابط
                  let linkUrl = '';
                  let linkText = '';
                  
                  if (blockData.link?.link) {
                    linkUrl = blockData.link.link.url || '';
                    linkText = blockData.link.link.text || '';
                  } else if (blockData.link) {
                    linkUrl = blockData.link.url || '';
                    linkText = blockData.link.text || '';
                  } else {
                    linkUrl = blockData.url || block.url || '';
                    linkText = blockData.text || block.text || '';
                  }
                  
                  const finalLinkText = typeof linkText === 'object' ? 
                    ((linkText as any).text || JSON.stringify(linkText)) : (linkText || linkUrl);
                  
                  if (!linkUrl) return null;
                  
                  return (
                    <div key={block.id || index} className="my-6">
                      <a
                        href={linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <span>{finalLinkText}</span>
                      </a>
                    </div>
                  );
                
                case 'divider':
                  return (
                    <hr key={block.id || index} className="my-8 border-gray-300 dark:border-gray-700" />
                  );
                
                case 'video':
                  const videoUrl = blockData.url || block.url || '';
                  if (!videoUrl) return null;
                  
                  // معالجة روابط YouTube
                  let embedUrl = '';
                  if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
                    const videoId = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
                    if (videoId) {
                      embedUrl = `https://www.youtube.com/embed/${videoId}`;
                    }
                  }
                  
                  if (embedUrl) {
                    return (
                      <div key={block.id || index} className="my-8 rounded-lg overflow-hidden shadow-lg dark:shadow-gray-900/50">
                        <iframe
                          src={embedUrl}
                          className="w-full h-96"
                          allowFullScreen
                        />
                      </div>
                    );
                  }
                  return null;
                
                default:
                  const defaultText = blockData.text || block.text || block.content || '';
                  const finalDefaultText = typeof defaultText === 'object' ? 
                    (defaultText.text || JSON.stringify(defaultText)) : defaultText;
                  if (!finalDefaultText) return null;
                  return (
                    <p key={block.id || index} className="text-lg leading-relaxed text-gray-900 dark:text-gray-100">
                      {finalDefaultText}
                    </p>
                  );
              }
            })}
          </div>
        );
      }
    } catch (e) {
      console.log('Content is not JSON blocks, rendering as HTML');
    }
    
    // معالجة المحتوى النصي العادي - تحسين معالجة الفقرات
    // تقسيم المحتوى على أساس الأسطر الفارغة أو فواصل الأسطر المتعددة
    const paragraphs = content
      .split(/\n\s*\n|\r\n\s*\r\n|(?:\. )(?=[A-Z\u0600-\u06FF])/)
      .map(p => p.trim())
      .filter(p => p.length > 0);
    
    if (paragraphs.length > 0) {
      return (
        <div className="space-y-6">
          {paragraphs.map((paragraph, index) => {
            // تقسيم الفقرات الطويلة جداً
            if (paragraph.length > 500) {
              // البحث عن نقاط مناسبة للتقسيم
              const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
              const chunks: string[] = [];
              let currentChunk = '';
              
              sentences.forEach(sentence => {
                if ((currentChunk + sentence).length > 400 && currentChunk.length > 0) {
                  chunks.push(currentChunk.trim());
                  currentChunk = sentence;
                } else {
                  currentChunk += sentence;
                }
              });
              
              if (currentChunk.trim()) {
                chunks.push(currentChunk.trim());
              }
              
              return chunks.map((chunk, chunkIndex) => (
                <p key={`${index}-${chunkIndex}`} className="text-lg leading-[1.9] text-gray-900 dark:text-gray-100">
                  {chunk}
                </p>
              ));
            }
            
            return (
              <p key={index} className="text-lg leading-[1.9] text-gray-900 dark:text-gray-100">
                {paragraph}
              </p>
            );
          })}
        </div>
      );
    }
    
    // عرض المحتوى كـ HTML كخيار أخير
    return (
      <div 
        dangerouslySetInnerHTML={{ __html: content }}
        className="prose prose-lg max-w-none dark:prose-invert
                   prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-gray-100
                   prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-[1.9] prose-p:mb-6
                   prose-blockquote:border-r-4 prose-blockquote:border-blue-500 prose-blockquote:pr-6
                   prose-ul:list-disc prose-ol:list-decimal
                   prose-img:rounded-lg prose-img:shadow-lg dark:prose-img:shadow-gray-900/50
                   prose-strong:text-gray-900 dark:prose-strong:text-gray-100
                   prose-li:text-gray-700 dark:prose-li:text-gray-300"
      />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 animate-spin text-blue-500 dark:text-blue-400 mx-auto mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400">جاري تحميل المقال...</p>
        </div>
      </div>
    );
  }

  if (!article) {
      return (
    <>
      <Header />
      {article && <ArticleJsonLd article={article} />}
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full mb-6 shadow-lg dark:shadow-gray-900/50">
              <svg className="w-12 h-12 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">المقال غير موجود</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">عذراً، لم نتمكن من العثور على المقال المطلوب</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg dark:shadow-gray-900/50 hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                العودة إلى الرئيسية
              </Link>
            </div>
          </div>
        </div>
      </>
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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      
      {/* المحتوى الرئيسي */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400">جاري تحميل المقال...</p>
          </div>
        </div>
      ) : !article ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">المقال غير موجود</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8">عذراً، لم نتمكن من العثور على المقال المطلوب</p>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg dark:shadow-gray-900/50 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              العودة إلى الرئيسية
            </Link>
          </div>
        </div>
      ) : (
        <>
          <ArticleJsonLd article={article} />
          
          {/* مؤشر تقدم القراءة */}
          <div className="reading-progress">
            <div className="reading-progress-bar" id="reading-progress"></div>
          </div>
          
          {/* قسم البطل مع الصورة المحسن */}
          <section className="relative h-[75vh] max-h-[700px] overflow-hidden bg-black">
            <img
              src={getImageUrl(article.featured_image) || generatePlaceholderImage(article.title)}
              alt={article.featured_image_alt || article.title}
              className="w-full h-full object-cover opacity-75 transform scale-105 transition-transform duration-[2s] hover:scale-100"
              onError={(e) => {
                console.error('خطأ في تحميل الصورة:', article.featured_image);
                e.currentTarget.src = generatePlaceholderImage(article.title);
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12 max-w-7xl mx-auto">
                <div className="mb-6">
                  <Link 
                    href={`/categories/${article.category?.name_ar || article.category_id}`}
                    className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold text-white backdrop-blur-sm transition-all hover:scale-105"
                    style={{ 
                      backgroundColor: article.category?.color_hex ? `${article.category.color_hex}CC` : '#3b82f6CC'
                    }}
                  >
                    {article.category?.name_ar || article.category_id}
                  </Link>
                </div>
                <h1 className="text-4xl lg:text-6xl font-black text-white mb-4 leading-tight">
                  {article.title}
                </h1>
                {article.subtitle && (
                  <p className="text-xl lg:text-2xl text-gray-200 max-w-4xl">
                    {article.subtitle}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* شريط المعلومات المساعدة المحسن */}
          <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    {article.author_avatar ? (
                      <img 
                        src={article.author_avatar} 
                        alt={article.author_name || 'سبق'}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {(article.author_name || 'س')[0]}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">
                        {article.author_name || 'سبق'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {formatFullDate(article.published_at || article.created_at || '')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-8 w-px bg-gray-300 dark:bg-gray-700"></div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">{article.views_count || 0}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">{calculateReadingTime(article.content)} دقائق</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => shareOnSocial('twitter', article.title, window.location.href)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="مشاركة على تويتر"
                  >
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => shareOnSocial('whatsapp', article.title, window.location.href)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="مشاركة على واتساب"
                  >
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.89 3.488"/>
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => copyToClipboard(window.location.href)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="نسخ الرابط"
                  >
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* محتوى المقال والجزء الجانبي */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              {/* المحتوى الرئيسي */}
              <main className="lg:col-span-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 lg:p-12">
                  <article>
                    {article.content ? (
                      <div className="prose prose-lg max-w-none dark:prose-invert
                                   prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-gray-100
                                   prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:text-lg
                                   prose-blockquote:border-r-4 prose-blockquote:border-blue-500 prose-blockquote:pr-6 prose-blockquote:rounded-lg prose-blockquote:p-6
                                   prose-ul:list-disc prose-ol:list-decimal
                                   prose-img:rounded-xl prose-img:shadow-lg dark:prose-img:shadow-gray-900/50
                                   prose-strong:text-gray-900 dark:prose-strong:text-gray-100
                                   prose-li:text-gray-700 dark:prose-li:text-gray-300
                                   prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                                   prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-r-4 prose-h2:border-blue-500 prose-h2:pr-4
                                   prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4">
                        {renderArticleContent(article.content)}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">لا يوجد محتوى لعرضه</p>
                      </div>
                    )}
                  </article>
                </div>
              </main>

              {/* الشريط الجانبي */}
              <aside className="lg:col-span-4 mt-8 lg:mt-0">
                <div className="sticky top-24 space-y-6">
                  {/* مواضيع ذات صلة */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                      <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                      مواضيع ذات صلة
                    </h3>
                    <div className="space-y-4">
                      {relatedArticles.slice(0, 4).map((relatedArticle) => (
                        <Link
                          key={relatedArticle.id}
                          href={`/article/${relatedArticle.id}`}
                          className="group block"
                        >
                          <div className="flex gap-4 p-3 -m-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <img
                              src={getImageUrl(relatedArticle.featured_image) || generatePlaceholderImage(relatedArticle.title)}
                              alt={relatedArticle.title}
                              className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.src = generatePlaceholderImage(relatedArticle.title);
                              }}
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 transition-colors">
                                {relatedArticle.title}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {formatFullDate(relatedArticle.published_at || relatedArticle.created_at || '')}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* إحصائيات المقال */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                      <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                      إحصائيات المقال
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg">
                        <span className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          المشاهدات
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white px-3 py-1">{article.views_count || 0}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg">
                        <span className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          وقت القراءة
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white px-3 py-1">{calculateReadingTime(article.content)} دقائق</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg">
                        <span className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          تاريخ النشر
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white text-sm px-3 py-1">{formatFullDate(article.published_at || article.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>

          {/* شريط التفاعل العائم */}
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-2xl border border-gray-200 dark:border-gray-700 px-2 py-2 flex items-center gap-1">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  interaction.liked 
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                <svg className="w-5 h-5" fill={interaction.liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="font-medium hidden sm:inline">{interaction.likesCount || 0}</span>
              </button>
              
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  interaction.saved 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                <svg className="w-5 h-5" fill={interaction.saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <span className="font-medium hidden sm:inline">حفظ</span>
              </button>
              
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a3 3 0 10-2.684 0m2.684 0A5.972 5.972 0 0112 18c-1.99 0-3.75-.97-4.842-2.458m9.032-4.026a5.972 5.972 0 00-1.348-6.358m-9.032 4.026A5.972 5.972 0 016 5.758m9.032 4.026A5.972 5.972 0 0112 6c1.99 0 3.75.97 4.842 2.458M6 5.758a3 3 0 102.684 0" />
                </svg>
                <span className="font-medium hidden sm:inline">مشاركة</span>
              </button>
            </div>
          </div>
        </>
      )}
      
      {/* القائمة المنبثقة للمشاركة */}
      {showShareMenu && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[60] bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-2xl rounded-2xl p-4 w-80 animate-fade-in-up">
          <h4 className="text-center font-bold text-gray-900 dark:text-white mb-4">شارك عبر</h4>
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => shareOnSocial('twitter', article.title, window.location.href)} className="flex flex-col items-center gap-1 hover:opacity-90">
              <svg className="w-6 h-6 text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M23.954 4.569a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 9.93 9.93 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.096 4.067 6.13 1.639 3.161a4.822 4.822 0 00-.666 2.475 4.92 4.92 0 002.188 4.097 4.904 4.904 0 01-2.228-.617v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417A9.867 9.867 0 010 19.54a13.94 13.94 0 007.548 2.209c9.05 0 13.999-7.496 13.999-13.985 0-.209-.004-.423-.014-.635A9.935 9.935 0 0024 4.59z"/></svg>
              <span className="text-xs text-gray-700 dark:text-gray-300">تويتر</span>
            </button>
            <button onClick={() => shareOnSocial('whatsapp', article.title, window.location.href)} className="flex flex-col items-center gap-1 hover:opacity-90">
              <svg className="w-6 h-6 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/></svg>
              <span className="text-xs text-gray-700 dark:text-gray-300">واتساب</span>
            </button>
            <button onClick={() => copyToClipboard(window.location.href)} className="flex flex-col items-center gap-1 hover:opacity-90">
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
              <span className="text-xs text-gray-700 dark:text-gray-300">نسخ</span>
            </button>
          </div>
        </div>
      )}

      <Footer />
      
      {/* سكريبت مؤشر تقدم القراءة */}
      <script dangerouslySetInnerHTML={{
        __html: `
          window.addEventListener('scroll', function() {
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
            const clientHeight = document.documentElement.clientHeight || window.innerHeight;
            const scrolled = (scrollTop / (scrollHeight - clientHeight)) * 100;
            const progressBar = document.getElementById('reading-progress');
            if (progressBar) {
              progressBar.style.width = scrolled + '%';
            }
          });
        `
      }} />
    </div>
  );
}

// دوال مساعدة
function shareOnSocial(platform: string, title: string, url: string) {
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);
  
  const urls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle} ${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
  };
  
  if (urls[platform as keyof typeof urls]) {
    window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    // يمكن إضافة toast notification هنا
    alert('تم نسخ الرابط!');
  });
}

function calculateReadingTime(content: any): number {
  if (!content) return 1;
  
  let wordCount = 0;
  if (typeof content === 'string') {
    wordCount = content.split(' ').length;
  } else if (Array.isArray(content)) {
    content.forEach((block: any) => {
      if (block.text) {
        wordCount += block.text.split(' ').length;
      }
    });
  }
  
  return Math.max(1, Math.ceil(wordCount / 200)); // 200 كلمة في الدقيقة
} 