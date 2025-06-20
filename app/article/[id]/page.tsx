'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/Header';
import { useInteractions } from '../../../hooks/useInteractions';
import { 
  ArrowRight, Calendar, Clock, User, Eye, Tag, 
  ThumbsUp, Share2, Volume2, VolumeX, Loader2,
  BookOpen, Heart, MessageCircle, Bookmark, Twitter,
  Facebook, Send, Copy, ChevronRight, Award, Hash,
  Zap, Globe, BookOpen as BookOpenIcon, PenTool, RefreshCw,
  Sparkles, TrendingUp, Check, Brain, Bot, FileText,
  Share, MessageSquare, MoreHorizontal, X, Home
} from 'lucide-react';
import './article-styles.css';
import Footer from '@/components/Footer';
import { useDarkModeContext } from '@/components/DarkModeProvider';
import { formatFullDate, formatTimeOnly } from '@/lib/date-utils';

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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const [articleId, setArticleId] = useState<string>('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDataLoaded, setUserDataLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [readingTime, setReadingTime] = useState(0);

  useEffect(() => {
    async function loadArticle() {
      const resolvedParams = await params;
      if (resolvedParams?.id) {
        setArticleId(resolvedParams.id);
        fetchArticle(resolvedParams.id);
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
      
      // جلب التفاعلات المحفوظة
      const savedInteractions = localStorage.getItem(`article_${id}_interactions`);
      if (savedInteractions) {
        const saved = JSON.parse(savedInteractions);
        setInteraction(prev => ({ ...prev, ...saved }));
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
    if (!article || !userId) {
      alert('يرجى تسجيل الدخول لبدء رحلتك الذكية وكسب النقاط 🎯');
      return;
    }
    
    const newLiked = !interaction.liked;
    
    // تحديث الحالة المحلية فوراً
    setInteraction(prev => ({ 
      ...prev, 
      liked: newLiked,
      likesCount: newLiked ? prev.likesCount + 1 : prev.likesCount - 1
    }));
    
    // حفظ التفاعل محلياً
    localStorage.setItem(`article_${article.id}_interactions`, JSON.stringify({
      liked: newLiked,
      saved: interaction.saved,
      shared: interaction.shared
    }));
    
    // تسجيل التفاعل
    await trackInteraction({
      userId,
      articleId: article.id,
      interactionType: 'like',
      source: 'article_page'
    });
  };

  const handleSave = async () => {
    if (!article || !userId) {
      alert('يرجى تسجيل الدخول لبدء رحلتك الذكية وكسب النقاط 🎯');
      return;
    }
    
    const newSaved = !interaction.saved;
    
    setInteraction(prev => ({ 
      ...prev, 
      saved: newSaved,
      savesCount: newSaved ? prev.savesCount + 1 : prev.savesCount - 1
    }));
    
    localStorage.setItem(`article_${article.id}_interactions`, JSON.stringify({
      liked: interaction.liked,
      saved: newSaved,
      shared: interaction.shared
    }));
    
    await trackInteraction({
      userId,
      articleId: article.id,
      interactionType: 'save',
      source: 'article_page'
    });
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
    
    // تسجيل التفاعل للمستخدمين المسجلين
    if (userId) {
      await trackInteraction({
        userId,
        articleId: article.id,
        interactionType: 'share',
        source: `share_${platform}`
      });
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
  const formatDate = formatFullDate;
  const formatTime = formatTimeOnly;

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
                  const paragraphText = blockData.text || block.text || block.content || '';
                  const finalParagraphText = typeof paragraphText === 'object' ? 
                    (paragraphText.text || JSON.stringify(paragraphText)) : paragraphText;
                  if (!finalParagraphText) return null;
                  return (
                    <p key={block.id || index} className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 dark:text-gray-300">
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
                    <ListTag key={block.id || index} className={`${listClass} space-y-2 text-gray-700 dark:text-gray-300 dark:text-gray-300`}>
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
                      <p className="text-lg italic text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-2">
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
                  const tweetUrl = blockData.url || block.url || '';
                  if (!tweetUrl) return null;
                  
                  // استخراج معرف التغريدة
                  const tweetId = tweetUrl.match(/status\/(\d+)/)?.[1];
                  if (!tweetId) return null;
                  
                  return (
                    <div key={block.id || index} className="my-8 flex justify-center">
                      <blockquote className="twitter-tweet" data-lang="ar">
                        <a href={tweetUrl}></a>
                      </blockquote>
                      <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>
                    </div>
                  );
                
                case 'table':
                  const tableData = blockData.table || block.table || { headers: [], rows: [] };
                  if (!tableData.rows || tableData.rows.length === 0) return null;
                  
                  return (
                    <div key={block.id || index} className="my-8 overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        {tableData.headers && tableData.headers.length > 0 && (
                          <thead className="bg-gray-50 dark:bg-gray-900 dark:bg-gray-800">
                            <tr>
                              {tableData.headers.map((header: string, i: number) => (
                                <th
                                  key={i}
                                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider"
                                >
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                        )}
                        <tbody className="bg-white dark:bg-gray-800 dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                          {tableData.rows.map((row: string[], rowIndex: number) => (
                            <tr key={rowIndex}>
                              {row.map((cell: string, cellIndex: number) => (
                                <td
                                  key={cellIndex}
                                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white dark:text-gray-100"
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
                  const linkUrl = blockData.url || block.url || '';
                  const linkText = blockData.text || block.text || linkUrl;
                  const finalLinkText = typeof linkText === 'object' ? 
                    (linkText.text || JSON.stringify(linkText)) : linkText;
                  
                  if (!linkUrl) return null;
                  
                  return (
                    <div key={block.id || index} className="my-6">
                      <a
                        href={linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
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
                    <hr key={block.id || index} className="my-8 border-gray-300 dark:border-gray-600 dark:border-gray-700" />
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
                    <p key={block.id || index} className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 dark:text-gray-300">
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
                <p key={`${index}-${chunkIndex}`} className="text-lg leading-[1.9] text-gray-700 dark:text-gray-300 dark:text-gray-300">
                  {chunk}
                </p>
              ));
            }
            
            return (
              <p key={index} className="text-lg leading-[1.9] text-gray-700 dark:text-gray-300 dark:text-gray-300">
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
                   prose-headings:font-bold prose-headings:text-gray-900 dark:text-white dark:prose-headings:text-gray-100
                   prose-p:text-gray-700 dark:text-gray-300 dark:prose-p:text-gray-300 prose-p:leading-[1.9] prose-p:mb-6
                   prose-blockquote:border-r-4 prose-blockquote:border-blue-500 prose-blockquote:pr-6
                   prose-ul:list-disc prose-ol:list-decimal
                   prose-img:rounded-lg prose-img:shadow-lg dark:shadow-gray-900/50"
      />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 dark:text-blue-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">جاري تحميل المقال...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 dark:bg-gray-900">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full mb-6 shadow-lg dark:shadow-gray-900/50">
              <BookOpenIcon className="w-12 h-12 text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white dark:text-white mb-3">المقال غير موجود</h3>
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-8 text-lg">عذراً، لم نتمكن من العثور على المقال المطلوب</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg dark:shadow-gray-900/50 hover:shadow-xl dark:shadow-gray-900/50"
              >
                <ArrowRight className="w-5 h-5" />
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
    <div className="min-h-screen bg-white dark:bg-gray-800 dark:bg-gray-900">
      <Header />
      
      {/* المحتوى الرئيسي */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500">جاري تحميل المقال...</p>
          </div>
        </div>
      ) : !article ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white dark:text-white mb-3">المقال غير موجود</h3>
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-8">عذراً، لم نتمكن من العثور على المقال المطلوب</p>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg dark:shadow-gray-900/50 transition-all"
            >
              <ArrowRight className="w-5 h-5" />
              العودة إلى الرئيسية
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* قسم البطل مع الصورة */}
          <section className="article-hero">
            <img
              src={article.featured_image || generatePlaceholderImage(article.title)}
              alt={article.featured_image_alt || article.title}
              className="article-hero-image"
            />
            
            <div className="article-hero-content">
              {/* التصنيف الرئيسي */}
              <div className="flex items-center gap-2 mb-3">
                <Link 
                  href={`/category/${article.category_id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-white text-sm font-bold rounded-full backdrop-blur-sm transition-all hover:scale-105 shadow-lg dark:shadow-gray-900/50"
                  style={{ 
                    backgroundColor: article.category?.color_hex || getCategoryColor(article.category) || '#3b82f6'
                  }}
                >
                  {article.category?.icon && <span className="text-base">{article.category.icon}</span>}
                  <span>{article.category?.name_ar || article.category_name || 'عام'}</span>
                </Link>
              </div>

              {/* العنوان والعنوان الفرعي */}
              <h1 className="article-title-hero fade-in-up">
                {article.title}
              </h1>
              {article.subtitle && (
                <p className="article-subtitle-hero fade-in-up" style={{ animationDelay: '0.1s' }}>
                  {article.subtitle}
                </p>
              )}

              {/* العلامات الخاصة */}
              {(article.is_breaking || article.is_featured) && (
                <div className="flex items-center gap-3 mt-3 mb-4 justify-center">
                  {article.is_breaking && (
                    <span className="inline-flex items-center gap-1 px-4 py-2 bg-red-500/90 backdrop-blur-sm text-white text-sm font-bold rounded-full animate-pulse shadow-lg dark:shadow-gray-900/50">
                      <Zap className="w-4 h-4" />
                      عاجل
                    </span>
                  )}
                  
                  {article.is_featured && (
                    <span className="inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-yellow-400/90 to-orange-500/90 backdrop-blur-sm text-white text-sm font-bold rounded-full shadow-lg dark:shadow-gray-900/50">
                      <Award className="w-4 h-4" />
                      مميز
                    </span>
                  )}
                </div>
              )}

              {/* شريط المعلومات */}
              <div className="article-meta-bar fade-in-up" style={{ animationDelay: '0.2s' }}>
                {(article.reporter || article.reporter_name || article.author || article.author_name) && (
                  <div className="meta-item-hero reporter-meta">
                    <PenTool className="w-5 h-5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-1">المراسل الصحفي</p>
                      <Link 
                        href={`/author/${article.author_id || 'team'}`}
                        className="text-lg font-bold text-gray-900 dark:text-white dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {typeof article.author === 'string' ? article.author : article.author?.name || article.reporter || article.reporter_name || article.author_name || 'فريق التحرير'}
                      </Link>
                    </div>
                  </div>
                )}
                
                <div className="meta-item-hero">
                  <Calendar className="w-5 h-5" />
                  <span>{formatDate(article.created_at)}</span>
                </div>
                
                <div className="meta-item-hero">
                  <Clock className="w-5 h-5" />
                  <span>{formatTime(article.created_at)}</span>
                </div>
                
                <div className="meta-item-hero">
                  <Eye className="w-5 h-5" />
                  <span>{article.views_count.toLocaleString('ar-SA')} مشاهدة</span>
                </div>
                
                {article.reading_time && (
                  <div className="meta-item-hero">
                    <BookOpen className="w-5 h-5" />
                    <span>{article.reading_time} دقيقة قراءة</span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* محتوى المقال */}
          <article className="article-body" ref={contentRef}>
            {/* شريط معلومات المراسل - بتصميم محسن */}
            <div className="my-8 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 py-5 px-6 rounded-2xl border border-gray-200 dark:border-gray-700 dark:border-gray-700">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg dark:shadow-gray-900/50">
                    <PenTool className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-1">المراسل الصحفي</p>
                    <Link 
                      href={`/author/${article.author_id || 'team'}`}
                      className="text-lg font-bold text-gray-900 dark:text-white dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {typeof article.author === 'string' ? article.author : article.author?.name || article.reporter || article.reporter_name || article.author_name || 'فريق التحرير'}
                    </Link>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleLike}
                    className={`p-2 rounded-lg transition-all ${
                      interaction.liked 
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                        : 'bg-gray-100 dark:bg-gray-800 dark:bg-gray-800 text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-700'
                    }`}
                    title={isLoggedIn ? 'أعجبني' : 'سجل دخول للتفاعل'}
                  >
                    <Heart className={`w-5 h-5 ${interaction.liked ? 'fill-current' : ''}`} />
                  </button>
                  
                  <button
                    onClick={handleSave}
                    className={`p-2 rounded-lg transition-all ${
                      interaction.saved 
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                        : 'bg-gray-100 dark:bg-gray-800 dark:bg-gray-800 text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-700'
                    }`}
                    title={isLoggedIn ? 'حفظ' : 'سجل دخول للتفاعل'}
                  >
                    <Bookmark className={`w-5 h-5 ${interaction.saved ? 'fill-current' : ''}`} />
                  </button>
                  
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 dark:bg-gray-800 text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-700 transition-all relative"
                  >
                    <Share2 className="w-5 h-5" />
                    
                    {showShareMenu && (
                      <div className="absolute left-0 top-full mt-2 bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl shadow-xl dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 dark:border-gray-700 p-2 min-w-[200px] z-50">
                        <button
                          onClick={() => handleShare('twitter')}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors text-right"
                        >
                          <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                          <span className="text-sm">تويتر</span>
                        </button>
                        
                        <button
                          onClick={() => handleShare('facebook')}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors text-right"
                        >
                          <Facebook className="w-4 h-4 text-[#1877F2]" />
                          <span className="text-sm">فيسبوك</span>
                        </button>
                        
                        <button
                          onClick={() => handleShare('whatsapp')}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors text-right"
                        >
                          <MessageCircle className="w-4 h-4 text-[#25D366]" />
                          <span className="text-sm">واتساب</span>
                        </button>
                        
                        <button
                          onClick={() => handleShare('telegram')}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors text-right"
                        >
                          <Send className="w-4 h-4 text-[#0088CC]" />
                          <span className="text-sm">تيليجرام</span>
                        </button>
                        
                        <div className="border-t border-gray-200 dark:border-gray-700 dark:border-gray-700 my-2"></div>
                        
                        <button
                          onClick={() => handleShare('copy')}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors text-right"
                        >
                          {copySuccess ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                          <span className="text-sm">{copySuccess ? 'تم النسخ!' : 'نسخ الرابط'}</span>
                        </button>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* الملخص الذكي المحسن */}
            {article.summary && (
              <div className="smart-summary fade-in-up">
                <div className="smart-summary-content">
                  <div className="smart-summary-header">
                    <div className="smart-summary-title">
                      <div className="smart-summary-icon">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <span>الملخص الذكي</span>
                    </div>
                    <button
                      onClick={speakSummary}
                      className={`p-2 rounded-lg transition-all ${
                        isSpeaking 
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                          : 'bg-gray-100 dark:bg-gray-800 dark:bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-300'
                      }`}
                    >
                      {isSpeaking ? (
                        <VolumeX className="w-5 h-5" />
                      ) : (
                        <Volume2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="smart-summary-text">
                    {article.summary}
                  </p>
                </div>
              </div>
            )}

            {/* محتوى المقال */}
            <div className="article-content-enhanced">
              {renderArticleContent(article.content)}
            </div>

            {/* الكلمات المفتاحية */}
            {article.seo_keywords && (
              <div className="mt-12 mb-8">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 dark:text-white mb-4">الكلمات المفتاحية</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {(typeof article.seo_keywords === 'string' 
                    ? article.seo_keywords.split(',') 
                    : article.seo_keywords
                  ).map((keyword: string, index: number) => (
                    <Link
                      key={index}
                      href={`/search?q=${encodeURIComponent(keyword.trim())}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 dark:bg-gray-800 text-gray-700 dark:text-gray-300 dark:text-gray-300 rounded-full text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-700 transition-all"
                    >
                      <Hash className="w-3 h-3" />
                      {keyword.trim()}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* قسم التوصيات المحسن */}
          {((article.related_articles && article.related_articles.length > 0) || 
            (isLoggedIn && recommendations.length > 0)) && (
            <section className="recommendations-section bg-gray-50 dark:bg-gray-900">
              <div className="max-w-7xl mx-auto px-4">
                <div className="recommendations-header">
                  <h2 className="recommendations-title text-gray-900 dark:text-white">
                    {isLoggedIn && recommendations.length > 0 ? 'محتوى مخصص لك' : 'أخبار ذات صلة'}
                  </h2>
                  <p className="recommendations-subtitle text-gray-600 dark:text-gray-400">
                    {isLoggedIn && recommendations.length > 0 
                      ? 'مقالات مختارة بناءً على اهتماماتك' 
                      : 'اكتشف المزيد من المحتوى المميز'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(isLoggedIn && recommendations.length > 0 ? recommendations : article.related_articles || [])
                    .slice(0, 6)
                    .map((item: any) => (
                      <Link
                        key={item.id}
                        href={`/article/${item.id}`}
                        className="recommendation-card-enhanced bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      >
                        <div className="recommendation-image-wrapper">
                          <img
                            src={item.featured_image || item.image_url || generatePlaceholderImage(item.title)}
                            alt={item.title}
                            className="recommendation-image-enhanced"
                            loading="lazy"
                          />
                        </div>
                        <div className="recommendation-content">
                          {item.category_name && (
                            <span 
                              className="recommendation-category"
                              style={{
                                backgroundColor: darkMode ? `${getCategoryColor({ name_ar: item.category_name })}30` : `${getCategoryColor({ name_ar: item.category_name })}20`,
                                color: getCategoryColor({ name_ar: item.category_name })
                              }}
                            >
                              {item.category_name}
                            </span>
                          )}
                          <h3 className="recommendation-title-enhanced text-gray-900 dark:text-white">
                            {item.title}
                          </h3>
                          <div className="recommendation-meta text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(item.created_at || item.published_at || '')}
                            </span>
                            {item.reading_time && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {item.reading_time} دقيقة
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            </section>
          )}


        </>
      )}
      
      <Footer />
    </div>
  );
} 