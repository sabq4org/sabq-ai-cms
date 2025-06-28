'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Bookmark, Share2, Eye, Clock, Calendar,
  User, MessageCircle, TrendingUp, Hash, ChevronRight, Home,
  Twitter, Copy, Check, X, Menu
} from 'lucide-react';
import { useInteractions } from '../../../hooks/useInteractions';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { formatFullDate, formatRelativeDate } from '@/lib/date-utils';
import { getImageUrl } from '@/lib/utils';
import ArticleJsonLd from '@/components/ArticleJsonLd';
import Footer from '@/components/Footer';
import './article-redesign.css';
import { marked } from 'marked';
import Header from '@/components/Header';

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
      body: JSON.stringify({
        user_id: data.userId,
        article_id: data.articleId,
        interaction_type: data.interactionType,
        source: data.source,
        duration: data.duration,
        completed: data.completed
      }),
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
  category_name?: string;
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

export default function ArticlePage({ params }: PageProps) {
  const router = useRouter();
  const { recordInteraction, trackReadingProgress } = useInteractions();
  const { darkMode, toggleDarkMode } = useDarkModeContext();
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
  const [copySuccess, setCopySuccess] = useState(false);
  const [articleId, setArticleId] = useState<string>('');
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [readProgress, setReadProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showFloatingActions, setShowFloatingActions] = useState(false);
  const [isNewArticle, setIsNewArticle] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [tableOfContents, setTableOfContents] = useState<{id: string; title: string; level: number}[]>([]);
  const [activeSection, setActiveSection] = useState('');
  const [showMobileToc, setShowMobileToc] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // إنشاء معرف ثابت للضيف عند تحميل الصفحة
  useEffect(() => {
    // نقل كل منطق العميل إلى useEffect لتجنب مشاكل SSR
    let guestId = localStorage.getItem('guestId');
    
    if (!guestId) {
      // استخدام معرف ثابت بدلاً من Date.now() و Math.random()
      const timestamp = new Date().getTime();
      const randomPart = Math.floor(Math.random() * 1000000).toString(36);
      guestId = `guest-${timestamp}-${randomPart}`;
      localStorage.setItem('guestId', guestId);
    }
    
    // التحقق من تسجيل الدخول
    const storedUserId = localStorage.getItem('user_id');
    const userData = localStorage.getItem('user');
    
    const isValidLogin = !!(storedUserId && storedUserId !== 'anonymous' && userData);
    setUserId(isValidLogin ? storedUserId : guestId);
  }, []);

  useEffect(() => {
    async function loadArticle() {
      const resolvedParams = await params;
      
      if (resolvedParams?.id) {
        const cleanArticleId = resolvedParams.id.trim();
        setArticleId(cleanArticleId);
        fetchArticle(cleanArticleId);
      }
    }
    loadArticle();
  }, []);

  // تتبع المشاهدة والقراءة
  useEffect(() => {
    if (article && articleId && userId) {
      trackInteraction({
        userId: userId,
        articleId,
        interactionType: 'view',
        source: 'article_page'
      });
    }
  }, [article, articleId, userId]);

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
        
        // تتبع التقدم
        if (userId && articleId) {
          trackReadingProgress(userId, articleId, progress, duration);
        }
        
        // تحديد القسم النشط
        if (tableOfContents.length > 0) {
          const scrollPosition = window.scrollY + 150;
          let currentSection = '';
          
          for (let i = tableOfContents.length - 1; i >= 0; i--) {
            const section = document.getElementById(tableOfContents[i].id);
            if (section && section.offsetTop <= scrollPosition) {
              currentSection = tableOfContents[i].id;
              break;
            }
          }
          
          if (currentSection && currentSection !== activeSection) {
            setActiveSection(currentSection);
          }
        }
      }
      
      // إظهار/إخفاء الأزرار العائمة
      setShowFloatingActions(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [userId, articleId, tableOfContents, activeSection]);
  
  // جلب التفاعلات المحفوظة
  useEffect(() => {
    async function fetchUserInteractions() {
      if (!articleId || !userId) return;

      const { getUserArticleInteraction, migrateOldData } = await import('@/lib/interactions-localStorage');
      
      // ترحيل البيانات القديمة إن وجدت
      migrateOldData();
      
      // جلب التفاعلات من localStorage
      const localInteractions = getUserArticleInteraction(userId, articleId);
      
      setInteraction(prev => ({
        ...prev,
        liked: localInteractions.liked,
        saved: localInteractions.saved,
        shared: localInteractions.shared
      }));

      // محاولة جلب من الخادم للمستخدمين المسجلين
      if (userId && !userId.startsWith('guest-')) {
        try {
          const interactionsResponse = await fetch(`/api/interactions/user-article?userId=${userId}&articleId=${articleId}`);
          if (interactionsResponse.ok) {
            const interactionsData = await interactionsResponse.json();
            if (interactionsData.success && interactionsData.data) {
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
        const categoryId = article.category?.id || article.category_id;
        if (categoryId) {
          const response = await fetch(`/api/articles?status=published&category_id=${categoryId}&limit=6`);
          
          if (response.ok) {
            const resJson = await response.json();
            const list: any[] = Array.isArray(resJson) ? resJson : resJson.articles || resJson.data || [];
            
            if (Array.isArray(list)) {
              const filtered = list.filter((a: any) => a.id !== article.id);
              setRelatedArticles(filtered.slice(0, 4));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching related articles:', error);
      }
    }
    
    fetchRelatedArticles();
  }, [article]);

  // جلب التوصيات الذكية
  useEffect(() => {
    async function fetchRecommendations() {
      if (!userId || userId.startsWith('guest-') || !articleId) return;
      
      try {
        const response = await fetch(`/api/content/personalized?user_id=${userId}&limit=3`);
        
        if (response.ok) {
          const data = await response.json();
          const articlesData = data.articles || (data.data && data.data.articles) || [];
          if (data.success && articlesData.length > 0) {
            const filtered = articlesData.filter((a: any) => a.id !== articleId);
            setRecommendations(filtered.slice(0, 3));
          }
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      }
    }
    
    fetchRecommendations();
  }, [userId, articleId]);

  // استخراج فهرس المحتويات عند تحديث المقال
  useEffect(() => {
    if (article && contentRef.current) {
      setTimeout(() => {
        generateTableOfContents();
      }, 100);
    }
  }, [article]);

  const fetchArticle = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/articles/${id}`, {
        next: { revalidate: 60 },
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=59'
        }
      });
      
      if (!response.ok) {
        router.push('/');
        return;
      }
      
      const data = await response.json();
      
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
      
      // التحقق من أن المقال جديد (نُشر خلال آخر 24 ساعة)
      // تأجيل هذا الحساب لتجنب اختلاف التوقيت بين الخادم والعميل
      if (data.published_at || data.created_at) {
        setTimeout(() => {
          const publishDate = new Date(data.published_at || data.created_at);
          const now = new Date();
          const hoursDiff = (now.getTime() - publishDate.getTime()) / (1000 * 60 * 60);
          setIsNewArticle(hoursDiff <= 24);
        }, 0);
      }
      
    } catch (error) {
      console.log('Network error while fetching article:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  // إيقاف توليد فهرس المحتويات (تم إلغاء البلوك بناءً على طلب العميل)
  const generateTableOfContents = () => {
    // مسح أي بيانات سابقة لضمان عدم ظهور البلوك
    setTableOfContents([]);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setShowMobileToc(false);
      setActiveSection(id);
    }
  };

  const handleLike = async () => {
    if (!article || !userId) return;
    
    const { updateUserArticleInteraction } = await import('@/lib/interactions-localStorage');
    
    const newLikedState = !interaction.liked;
    const newLikesCount = newLikedState ? interaction.likesCount + 1 : Math.max(0, interaction.likesCount - 1);
    
    // تحديث الحالة المحلية فوراً
    setInteraction(prev => ({
      ...prev,
      liked: newLikedState,
      likesCount: newLikesCount
    }));
    
    // حفظ في localStorage
    updateUserArticleInteraction(userId, article.id, {
      liked: newLikedState
    });
    
    // تسجيل التفاعل
    trackInteraction({
      userId,
      articleId: article.id,
      interactionType: newLikedState ? 'like' : 'unlike',
      source: 'article_page'
    });
    
    // إرسال إلى الخادم للمستخدمين المسجلين
    if (!userId.startsWith('guest-')) {
      try {
        await fetch('/api/interactions/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            article_id: article.id,
            interaction_type: newLikedState ? 'like' : 'unlike',
            source: 'article_page'
          })
        });
      } catch (error) {
        console.error('Error tracking like:', error);
      }
    }
  };

  const handleSave = async () => {
    if (!article || !userId) return;
    
    const { updateUserArticleInteraction } = await import('@/lib/interactions-localStorage');
    
    const newSavedState = !interaction.saved;
    const newSavesCount = newSavedState ? interaction.savesCount + 1 : Math.max(0, interaction.savesCount - 1);
    
    // تحديث الحالة المحلية فوراً
    setInteraction(prev => ({
      ...prev,
      saved: newSavedState,
      savesCount: newSavesCount
    }));
    
    // حفظ في localStorage
    updateUserArticleInteraction(userId, article.id, {
      saved: newSavedState
    });
    
    // تسجيل التفاعل
    trackInteraction({
      userId,
      articleId: article.id,
      interactionType: newSavedState ? 'save' : 'unsave',
      source: 'article_page'
    });
    
    // إرسال إلى الخادم للمستخدمين المسجلين
    if (!userId.startsWith('guest-')) {
      try {
        await fetch('/api/interactions/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            article_id: article.id,
            interaction_type: newSavedState ? 'save' : 'unsave',
            source: 'article_page'
          })
        });
      } catch (error) {
        console.error('Error tracking save:', error);
      }
    }
  };

  const handleShare = async (platform: string) => {
    if (!article) return;
    
    const url = window.location.href;
    const title = article.title;
    
    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    } else {
      shareOnSocial(platform, title, url);
    }
    
    // تسجيل المشاركة
    if (userId) {
      trackInteraction({
        userId,
        articleId: article.id,
        interactionType: 'share',
        source: platform
      });
    }
    
    setShowShareMenu(false);
  };

  const getCategoryColor = (category?: any) => {
    if (category?.color_hex) return category.color_hex;
    if ((category as any)?.color) return (category as any).color;
    
    const colors = ['#1a73e8', '#ea4335', '#34a853', '#fbbc04', '#673ab7', '#e91e63'];
    const index = Math.abs(category?.id || 0) % colors.length;
    return colors[index];
  };

  const generatePlaceholderImage = (title: string) => {
    const colors = ['#1a73e8', '#ea4335', '#34a853', '#fbbc04', '#673ab7'];
    const colorIndex = Math.abs(title.charCodeAt(0) - 65) % colors.length;
    
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
    if (!content) return null;
    
    // محاولة معالجة المحتوى كـ JSON blocks
    try {
      const blocks = JSON.parse(content);
      if (Array.isArray(blocks)) {
        return (
          <div className="space-y-6">
            {blocks.map((block, index) => {
              switch (block.type) {
                case 'paragraph':
                  return (
                    <p key={block.id || index} className="text-lg leading-[1.9] text-gray-700 dark:text-gray-300">
                      {block.text}
                    </p>
                  );
                
                case 'heading':
                  const level = block.level || 2;
                  const headingClasses: Record<number, string> = {
                    1: 'text-3xl',
                    2: 'text-2xl', 
                    3: 'text-xl',
                    4: 'text-lg',
                    5: 'text-base',
                    6: 'text-sm'
                  };
                  const headingClass = headingClasses[level] || 'text-xl';
                  
                  return React.createElement(
                    `h${level}`,
                    {
                      key: block.id || index,
                      className: `font-bold mt-8 mb-4 text-gray-900 dark:text-white ${headingClass}`
                    },
                    block.text
                  );
                
                case 'list':
                  return (
                    <ul key={block.id || index} className="list-disc list-inside space-y-2">
                      {block.items?.map((item: string, i: number) => (
                        <li key={i} className="text-lg text-gray-700 dark:text-gray-300">{item}</li>
                      ))}
                    </ul>
                  );
                
                case 'quote':
                  return (
                    <blockquote key={block.id || index} className="border-r-4 border-blue-600 pr-4 italic text-lg text-gray-600 dark:text-gray-400">
                      {block.text}
                      {block.caption && <cite className="block mt-2 text-sm not-italic">— {block.caption}</cite>}
                    </blockquote>
                  );
                
                case 'image':
                  return (
                    <figure key={block.id || index} className="my-8">
                      <img 
                        src={block.url} 
                        alt={block.alt || ''} 
                        className="w-full rounded-lg shadow-lg"
                      />
                      {block.caption && (
                        <figcaption className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {block.caption}
                        </figcaption>
                      )}
                    </figure>
                  );
                
                default:
                  return null;
              }
            })}
          </div>
        );
      }
    } catch (e) {
      // ليس JSON، نتابع للمعالجات الأخرى
      console.log('Content is not JSON blocks, trying Markdown...');
    }
    
    // معالجة المحتوى كـ Markdown
    // تحسين الكشف عن المحتوى Markdown
    const markdownIndicators = ['#', '**', '*', '![', '[', '|', '>', '-', '```'];
    const hasMarkdown = markdownIndicators.some(indicator => content.includes(indicator));
    
    if (hasMarkdown) {
      console.log('Processing as Markdown content...');
      // تكوين marked للغة العربية
      marked.setOptions({
        breaks: true,
        gfm: true
      });
      
      // معالجة المحتوى وتحويله إلى HTML
      let htmlContent = marked(content) as string;
      
      // إضافة أنماط للجداول
      htmlContent = htmlContent.replace(/<table>/g, '<div class="table-container"><table>');
      htmlContent = htmlContent.replace(/<\/table>/g, '</table></div>');
      
      return (
        <div 
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          className="prose prose-lg max-w-none dark:prose-invert 
            prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
            prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-6
            prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-4 prose-h3:mb-3
            prose-p:text-lg prose-p:leading-[1.9] prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:mb-4
            prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-bold
            prose-em:italic
            prose-img:rounded-lg prose-img:shadow-lg prose-img:mx-auto prose-img:my-8
            prose-blockquote:border-r-4 prose-blockquote:border-blue-600 prose-blockquote:pr-4 prose-blockquote:italic prose-blockquote:my-6
            prose-ul:list-disc prose-ul:list-inside prose-ul:space-y-2 prose-ul:my-4
            prose-ol:list-decimal prose-ol:list-inside prose-ol:space-y-2 prose-ol:my-4
            prose-li:text-lg prose-li:text-gray-700 dark:prose-li:text-gray-300
            prose-table:w-full prose-table:my-8
            prose-th:bg-gray-100 dark:prose-th:bg-gray-800 prose-th:p-3 prose-th:font-bold prose-th:text-right prose-th:border prose-th:border-gray-300 dark:prose-th:border-gray-600
            prose-td:p-3 prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-600
            prose-tr:even:bg-gray-50 dark:prose-tr:even:bg-gray-800/50
            space-y-4"
        />
      );
    }
    
    // معالجة المحتوى النصي العادي
    const paragraphs = content
      .split(/\n\s*\n|\r\n\s*\r\n|(?:\. )(?=[A-Z\u0600-\u06FF])/)
      .map(p => p.trim())
      .filter(p => p.length > 0);
    
    if (paragraphs.length > 0) {
      return (
        <div className="space-y-6">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="text-lg leading-[1.9] text-gray-700 dark:text-gray-300">
              {paragraph}
            </p>
          ))}
        </div>
      );
    }
    
    // عرض المحتوى كـ HTML كخيار أخير
    return (
      <div 
        dangerouslySetInnerHTML={{ __html: content }}
        className="prose prose-lg max-w-none dark:prose-invert"
      />
    );
  };

  // عرض مؤشر تحميل موحد قبل تحميل الصفحة بالكامل في المتصفح لتجنب أخطاء Hydration
  if (!isMounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">جاري تحميل المقال...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">المقال غير موجود</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8">عذراً، لم نتمكن من العثور على المقال المطلوب</p>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
            >
              <Home className="w-5 h-5" />
              العودة إلى الرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
      {article && <ArticleJsonLd article={article} />}
      
      {/* Header */}
      <Header />

      {/* مؤشر تقدم القراءة */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 z-50">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
          style={{ width: `${readProgress}%` }}
        />
      </div>

      {/* Hero Image + Meta */}
      <section className="relative hero-image-container">
        <div className="w-full h-[50vh] md:h-[60vh] overflow-hidden">
          {isNewArticle && (
            <div className="new-badge z-10">
              جديد
            </div>
          )}
          <img
            src={getImageUrl(article.featured_image) || generatePlaceholderImage(article.title)}
            alt={article.featured_image_alt || article.title}
            className="w-full h-full object-cover hero-image"
            onError={(e) => {
              e.currentTarget.src = generatePlaceholderImage(article.title);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
      </section>

      {/* Article Title & Meta */}
      <section className="px-4 md:px-8 py-6 max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold leading-tight article-title">
          {article.title}
        </h1>
        {article.subtitle && (
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            {article.subtitle}
          </p>
        )}
        
        {/* معلومات المقال */}
        <div className="article-meta-info">
          <div className="article-meta-item">
            <span
              className="px-3 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: getCategoryColor(article.category) }}
            >
              {article.category?.name_ar || (article.category as any)?.name || article.category_name || 'غير مصنف'}
            </span>
          </div>
          <div className="article-meta-item">
            <User className="w-5 h-5" />
            <Link href={`/author/${article.author_id || (article.author as any)?.id || ''}`} className="hover:text-blue-600">{article.author_name || (article.author && (article.author as any).name) || '—'}</Link>
          </div>
          <div className="article-meta-item">
            <Calendar className="w-5 h-5" />
            <span>{formatFullDate(article.published_at || article.created_at)}</span>
          </div>
          <div className="article-meta-item">
            <Clock className="w-5 h-5" />
            <span>{calculateReadingTime(article.content)} دقائق قراءة</span>
          </div>
          <div className="article-meta-item">
            <Eye className="w-5 h-5" />
            <span>{article.views_count || 0} مشاهدة</span>
          </div>
        </div>
        
        {/* شريط التفاعل السريع */}
        <div className="quick-interaction-bar">
          <button 
            title="أعجبني"
            onClick={handleLike}
            className={`quick-interaction-button ripple-effect ${
              interaction.liked ? 'active liked' : ''
            }`}
          >
            <Heart className={`w-5 h-5 ${interaction.liked ? 'fill-current' : ''}`} />
            <span>إعجاب</span>
          </button>
          
          <button 
            title="احفظ لوقت لاحق"
            onClick={handleSave}
            className={`quick-interaction-button ripple-effect ${
              interaction.saved ? 'active' : ''
            }`}
          >
            <Bookmark className={`w-5 h-5 ${interaction.saved ? 'fill-current' : ''}`} />
            <span>حفظ</span>
          </button>
          
          <button 
            title="شارك هذا المقال"
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="quick-interaction-button ripple-effect relative"
          >
            <Share2 className="w-5 h-5" />
            <span>مشاركة</span>
            
            {/* قائمة المشاركة */}
            {showShareMenu && (
              <div className="absolute top-full mt-2 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 min-w-[200px] z-10">
                <button
                  onClick={() => handleShare('twitter')}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                  <span>تويتر</span>
                </button>
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>واتساب</span>
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {copySuccess ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copySuccess ? 'تم النسخ!' : 'نسخ الرابط'}</span>
                </button>
              </div>
            )}
          </button>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12" ref={contentRef}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Article Content */}
          <section className="lg:col-span-2">
            <div className="prose prose-lg max-w-none">
              {renderArticleContent(article.content)}
            </div>

            {/* Interaction Bar */}
            <div className="flex items-center gap-4 my-8 py-4 border-t border-b">
              <button 
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  interaction.liked 
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Heart className={`w-5 h-5 ${interaction.liked ? 'fill-current' : ''}`} />
                <span>{interaction.likesCount || 0} إعجاب</span>
              </button>
              
              <button 
                onClick={handleSave}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  interaction.saved 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${interaction.saved ? 'fill-current' : ''}`} />
                <span>حفظ</span>
              </button>
              
              <button 
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all relative"
              >
                <Share2 className="w-5 h-5" />
                <span>مشاركة</span>
              </button>

              {/* Share Menu */}
              {showShareMenu && (
                <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 min-w-[200px] z-10">
                  <button
                    onClick={() => handleShare('twitter')}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                    <span>تويتر</span>
                  </button>
                  <button
                    onClick={() => handleShare('whatsapp')}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>واتساب</span>
                  </button>
                  <button
                    onClick={() => handleShare('copy')}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {copySuccess ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copySuccess ? 'تم النسخ!' : 'نسخ الرابط'}</span>
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Article Stats */}
            <div className="sidebar-card">
              <div className="trend-badge text-sm text-green-600 mb-2">↑ نمو كبير اليوم</div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                إحصائيات المقال
              </h3>
              <div className="article-info-grid">
                <div className="article-info-item">
                  <Eye className="w-5 h-5" />
                  <div>
                    <div className="article-info-label">المشاهدات</div>
                    <div className="article-info-value">{article.views_count || 0}</div>
                  </div>
                </div>
                <div className="article-info-item">
                  <Clock className="w-5 h-5" />
                  <div>
                    <div className="article-info-label">وقت القراءة</div>
                    <div className="article-info-value">{calculateReadingTime(article.content)} دقائق</div>
                  </div>
                </div>
                <div className="article-info-item">
                  <Heart className="w-5 h-5" />
                  <div>
                    <div className="article-info-label">الإعجابات</div>
                    <div className="article-info-value">{interaction.likesCount || 0}</div>
                  </div>
                </div>
                <div className="article-info-item">
                  <MessageCircle className="w-5 h-5" />
                  <div>
                    <div className="article-info-label">التعليقات</div>
                    <div className="article-info-value">{article.stats?.comments || 0}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* فهرس المحتويات */}
            {tableOfContents.length > 0 && (
              <div className="sidebar-card sticky top-20">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Hash className="w-5 h-5 text-blue-600" />
                  فهرس المحتويات
                </h3>
                <nav className="space-y-2">
                  {tableOfContents.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`block w-full text-right py-2 px-3 rounded-lg transition-all ${
                        activeSection === item.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-4 border-blue-600'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                      } ${item.level === 3 ? 'mr-4 text-sm' : ''}`}
                    >
                      {item.title}
                    </button>
                  ))}
                </nav>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    تقدم القراءة: {Math.round(readProgress)}%
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${readProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* AI Recommendations */}
            {recommendations.length > 0 && (
              <div className="sidebar-card">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Hash className="w-5 h-5 text-purple-600" />
                  ربما يعجبك أيضاً
                </h3>
                <div className="space-y-4">
                  {recommendations.map((item) => (
                    <Link 
                      key={item.id} 
                      href={`/article/${item.id}`}
                      className="block group"
                    >
                      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
                        <div className="aspect-video relative overflow-hidden">
                          <img
                            src={getImageUrl(item.featured_image) || generatePlaceholderImage(item.title)}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = generatePlaceholderImage(item.title);
                            }}
                          />
                        </div>
                        <div className="p-4">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {item.category_name || 'عام'}
                          </span>
                          <h4 className="font-semibold mt-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {item.title}
                          </h4>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div className="sidebar-card">
                <h3 className="text-lg font-bold mb-4">
                  📎 مواضيع مقترحة لك
                </h3>
                <div className="related-articles-container">
                  {relatedArticles.map((related) => (
                    <Link
                      key={related.id}
                      href={`/article/${related.id}`}
                      className="related-article-card"
                    >
                      <img
                        src={getImageUrl(related.featured_image) || generatePlaceholderImage(related.title)}
                        alt={related.title}
                        className="related-article-image"
                        onError={(e) => {
                          e.currentTarget.src = generatePlaceholderImage(related.title);
                        }}
                      />
                      <div className="related-article-content">
                        <h4 className="related-article-title">
                          {related.title}
                        </h4>
                        <div className="related-article-meta">
                          <span>{formatRelativeDate(related.published_at || related.created_at || '')}</span>
                          {related.reading_time && (
                            <>
                              <span>•</span>
                              <span>{related.reading_time} دقائق قراءة</span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* الأزرار العائمة */}
      {showFloatingActions && (
        <div className="floating-actions">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="floating-action-button"
            title="العودة للأعلى"
          >
            <ChevronRight className="w-6 h-6 rotate-90" />
          </button>
          <button 
            onClick={handleLike}
            className={`floating-action-button ${interaction.liked ? 'bg-red-600' : ''}`}
            title="إعجاب"
          >
            <Heart className={`w-6 h-6 ${interaction.liked ? 'fill-current' : ''}`} />
          </button>
          <button 
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="floating-action-button"
            title="مشاركة"
          >
            <Share2 className="w-6 h-6" />
          </button>
          {tableOfContents.length > 0 && (
            <button 
              onClick={() => setShowMobileToc(!showMobileToc)}
              className="floating-action-button lg:hidden"
              title="فهرس المحتويات"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}
        </div>
      )}

      {/* Modal فهرس المحتويات للموبايل */}
      {showMobileToc && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={() => setShowMobileToc(false)} 
          />
          <div className={`relative min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <div className={`sticky top-0 p-4 border-b ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">فهرس المحتويات</h3>
                <button 
                  onClick={() => setShowMobileToc(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <nav className="p-4 space-y-2">
              {tableOfContents.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`block w-full text-right py-3 px-4 rounded-lg ${
                    activeSection === item.id
                      ? darkMode 
                        ? 'bg-blue-900/30 text-blue-400' 
                        : 'bg-blue-50 text-blue-600'
                      : darkMode
                        ? 'text-gray-300 hover:bg-gray-800'
                        : 'text-gray-700 hover:bg-gray-100'
                  } ${item.level === 3 ? 'mr-4 text-sm' : ''}`}
                >
                  {item.title}
                </button>
              ))}
            </nav>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                تقدم القراءة: {Math.round(readProgress)}%
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${readProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
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