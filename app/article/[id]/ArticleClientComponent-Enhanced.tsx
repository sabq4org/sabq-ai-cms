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
import toast from 'react-hot-toast';

import { 
  Share2, Eye, Clock, Calendar, User, MessageCircle, TrendingUp, 
  Hash, ChevronRight, Home, Twitter, Copy, Check, X, Menu, Heart, 
  Bookmark, Headphones, Play, Pause, Volume2, VolumeX, CheckCircle, 
  Sparkles, ArrowUp, Brain, BookOpen, Maximize2, RotateCcw, Star,
  Lightbulb, MessageSquare, ThumbsUp, FileText, Globe, Target,
  Zap, BarChart3, Layers, Award, ChevronDown, ExternalLink,
  Download, Printer, Send, Facebook, Linkedin, Instagram
} from 'lucide-react';

interface ArticleClientComponentProps {
  initialArticle: ArticleData;
  articleId: string;
}

// دالة debounce محلية
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

export default function ArticleClientComponentEnhanced({ 
  initialArticle, 
  articleId 
}: ArticleClientComponentProps) {
  const router = useRouter();
  const { darkMode: contextDarkMode } = useDarkModeContext();
  const [darkMode, setDarkMode] = useState(false);
  const [article, setArticle] = useState<ArticleData>(initialArticle);
  
  // حالات جديدة للميزات المحسنة
  const [readingProgress, setReadingProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);
  
  // ميزات التشغيل الصوتي
  const [textToSpeech, setTextToSpeech] = useState<SpeechSynthesis | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [speechRate, setSpeechRate] = useState(1);
  const [speechVolume, setSpeechVolume] = useState(1);
  
  // كشف الأجهزة المحمولة
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
  // وضع القراءة المحسن
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);

  // تحديث dark mode بعد التحميل
  useEffect(() => {
    setDarkMode(contextDarkMode);
  }, [contextDarkMode]);

  // كشف نوع الجهاز
  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setIsMobile(width <= 640);
      setIsTablet(width > 640 && width <= 768);
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
      
      // إضافة فئات CSS للجسم
      document.body.classList.toggle('mobile-device', width <= 640);
      document.body.classList.toggle('tablet-device', width > 640 && width <= 768);
      document.body.classList.toggle('touch-device', 'ontouchstart' in window);
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);
    window.addEventListener('orientationchange', detectDevice);

    return () => {
      window.removeEventListener('resize', detectDevice);
      window.removeEventListener('orientationchange', detectDevice);
    };
  }, []);

  // تهيئة التشغيل الصوتي
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setTextToSpeech(window.speechSynthesis);
    }
  }, []);

  // إيقاف التشغيل الصوتي عند مغادرة الصفحة
  useEffect(() => {
    return () => {
      if (currentUtterance) {
        textToSpeech?.cancel();
      }
    };
  }, [currentUtterance, textToSpeech]);

  // مراقبة التمرير
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrollTop = window.pageYOffset;
      const progress = (scrollTop / documentHeight) * 100;
      
      setReadingProgress(Math.min(100, Math.max(0, progress)));
      setShowScrollTop(window.pageYOffset > 300);
      
      // حساب الوقت المتبقي
      if (article && readingProgress > 0) {
        const totalTime = calculateReadingTime(article.content);
        const remainingTime = Math.max(0, totalTime - (totalTime * readingProgress / 100));
        setEstimatedTimeLeft(Math.ceil(remainingTime));
      }
    };

    const debouncedHandleScroll = debounce(handleScroll, 100);
    window.addEventListener('scroll', debouncedHandleScroll);
    return () => window.removeEventListener('scroll', debouncedHandleScroll);
  }, [article, readingProgress]);

  // حساب وقت القراءة
  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  };

  // دالة بدء/إيقاف التشغيل الصوتي
  const toggleTextToSpeech = () => {
    if (!textToSpeech || !article) return;

    if (isPlaying) {
      textToSpeech.pause();
      setIsPlaying(false);
    } else if (textToSpeech.paused && currentUtterance) {
      textToSpeech.resume();
      setIsPlaying(true);
    } else {
      // بدء تشغيل جديد
      const textToRead = article.content.replace(/<[^>]*>/g, ' ').substring(0, 1000) + '...';
      const utterance = new SpeechSynthesisUtterance(textToRead);
      
      utterance.rate = speechRate;
      utterance.volume = speechVolume;
      utterance.lang = 'ar-SA';
      
      utterance.onend = () => {
        setIsPlaying(false);
        setCurrentUtterance(null);
      };
      
      utterance.onerror = () => {
        setIsPlaying(false);
        toast.error('حدث خطأ في التشغيل الصوتي');
      };
      
      textToSpeech.speak(utterance);
      setCurrentUtterance(utterance);
      setIsPlaying(true);
    }
  };

  // دالة إيقاف التشغيل الصوتي
  const stopTextToSpeech = () => {
    if (textToSpeech) {
      textToSpeech.cancel();
      setIsPlaying(false);
      setCurrentUtterance(null);
    }
  };

  // تغيير وضع القراءة
  const toggleReadingMode = () => {
    setIsReadingMode(!isReadingMode);
    if (!isReadingMode) {
      document.body.classList.add('reading-mode');
      toast.success('تم تفعيل وضع القراءة المريح');
    } else {
      document.body.classList.remove('reading-mode');
    }
  };

  // تغيير الوضع الكامل للشاشة
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // مشاركة المقال
  const handleShare = async (platform?: string) => {
    const url = window.location.href;
    const title = article.title;
    const text = article.excerpt || article.summary || '';

    if (platform) {
      let shareUrl = '';
      switch (platform) {
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
          break;
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
          break;
        case 'whatsapp':
          shareUrl = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`;
          break;
      }
      if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
        return;
      }
    }

    try {
      if (navigator.share && isMobile) {
        await navigator.share({ title, text, url });
        toast.success('تم المشاركة بنجاح');
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success('تم نسخ الرابط');
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  // معالجة الإعجاب
  const handleLike = () => {
    setLiked(!liked);
    const newLikes = liked ? (article.likes || 0) - 1 : (article.likes || 0) + 1;
    setArticle({ ...article, likes: newLikes });
    toast.success(liked ? 'تم إزالة الإعجاب' : 'أعجبك هذا المقال');
  };

  // معالجة الحفظ
  const handleSave = () => {
    setSaved(!saved);
    toast.success(saved ? 'تم إزالة من المحفوظات' : 'تم حفظ المقال');
  };

  // التمرير لأعلى
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      <div dir="rtl" className={`min-h-screen transition-all duration-300 ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      } ${isReading ? 'bg-amber-50 dark:bg-gray-800' : ''}`}>
        
        {/* شريط التقدم المحسن */}
        <div className={`fixed top-0 left-0 right-0 z-50 ${
          isMobile ? 'h-3' : 'h-2'
        } bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-gray-700/50 dark:to-gray-600/50`}>
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 relative progress-bar"
            style={{ width: `${readingProgress}%` }}
          >
            <div className="absolute right-0 top-0 h-full w-2 bg-white dark:bg-gray-200 opacity-80 animate-pulse"></div>
          </div>
          
          {/* معلومات التقدم */}
          <div className={`absolute ${
            isMobile ? 'top-3 right-2 text-xs' : 'top-2 right-4 text-xs'
          } font-medium px-2 py-1 rounded-md ${
            darkMode ? 'bg-gray-800/90 text-gray-300' : 'bg-white/90 text-gray-700'
          } shadow-sm backdrop-blur-sm`}>
            {Math.round(readingProgress)}%
            {!isMobile && ` • ${estimatedTimeLeft} دقائق متبقية`}
          </div>
        </div>

        {/* صورة المقال المحسنة */}
        {article.featured_image && (
          <div className="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[70vh] w-full overflow-hidden">
            {/* خلفية متدرجة متحركة */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse"></div>
            
            <img
              src={article.featured_image}
              alt={article.title}
              className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
              onLoad={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.opacity = '1';
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/placeholder-featured.jpg';
              }}
            />
            
            {/* تدرج الخلفية */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 z-10" />
            
            {/* النقاط المتحركة */}
            <div className="absolute inset-0 overflow-hidden z-5">
              <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full bg-blue-400/20 animate-bounce"></div>
              <div className="absolute top-1/4 -left-10 w-16 h-16 rounded-full bg-purple-400/20 animate-bounce delay-1000"></div>
              <div className="absolute bottom-1/4 right-1/4 w-12 h-12 rounded-full bg-pink-400/20 animate-bounce delay-2000"></div>
            </div>

            {/* معلومات فوق الصورة */}
            <div className="absolute bottom-6 left-6 right-6 z-20">
              {/* التصنيف */}
              {article.category && (
                <div className="mb-4">
                  <span 
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-medium backdrop-blur-md shadow-lg"
                    style={{ backgroundColor: article.category.color || '#1a73e8' }}
                  >
                    {article.category.icon && <span>{article.category.icon}</span>}
                    {article.category.name}
                  </span>
                </div>
              )}
              
              {/* العنوان فوق الصورة */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight drop-shadow-lg">
                {article.title}
              </h1>
            </div>
          </div>
        )}

        {/* المحتوى الرئيسي */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          
          {/* رأس المقال (إذا لم تكن هناك صورة) */}
          {!article.featured_image && (
            <header className="mb-8 pt-16">
              {/* التصنيف */}
              {article.category && (
                <Link
                  href={`/categories/${article.category.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-medium mb-4 hover:scale-105 transition-transform"
                  style={{ backgroundColor: article.category.color || '#1a73e8' }}
                >
                  {article.category.icon && <span>{article.category.icon}</span>}
                  {article.category.name}
                </Link>
              )}

              {/* العنوان */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {article.title}
              </h1>
            </header>
          )}

          {/* معلومات المقال المحسنة */}
          <div className={`flex flex-wrap items-center gap-4 mb-8 p-4 rounded-2xl backdrop-blur-sm ${
            darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white/50 border border-gray-200'
          } shadow-lg`}>
            
            {/* معلومات الكاتب */}
            {article.author && (
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">{article.author.name}</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    كاتب وصحفي
                  </p>
                </div>
              </div>
            )}

            {/* معلومات التوقيت */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatRelativeDate(article.published_at || article.created_at)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{calculateReadingTime(article.content)} دقائق قراءة</span>
              </div>
              
              {article.views !== undefined && (
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{article.views.toLocaleString()} مشاهدة</span>
                </div>
              )}
            </div>

            {/* نجمات التقييم */}
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                />
              ))}
              <span className="text-sm ml-2">4.5 من 5</span>
            </div>
          </div>

          {/* الملخص الذكي المحسن */}
          {(article.excerpt || article.summary || article.ai_summary) && (
            <div className={`mb-8 p-6 rounded-2xl ${
              darkMode 
                ? 'bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-pink-900/30 border border-blue-700' 
                : 'bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border border-blue-200'
            } shadow-lg`}>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-full ${
                    darkMode ? 'bg-blue-800' : 'bg-blue-100'
                  }`}>
                    <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    الملخص الذكي
                  </h3>
                  <p className="text-lg leading-relaxed">
                    {article.excerpt || article.summary || article.ai_summary}
                  </p>
                  
                  {/* أزرار التفاعل السريع */}
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={toggleTextToSpeech}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        isPlaying
                          ? 'bg-red-500 text-white'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      {isPlaying ? 'إيقاف' : 'استمع'}
                    </button>
                    
                    <button
                      onClick={() => setShowShareModal(true)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        darkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Share2 className="w-4 h-4" />
                      مشاركة
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* الكلمات المفتاحية المحسنة */}
          {keywords.length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Hash className="w-5 h-5" />
                المواضيع ذات الصلة
              </h4>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                  <Link
                    key={index}
                    href={`/tags/${encodeURIComponent(keyword)}`}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:scale-105 ${
                      darkMode 
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600' 
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    } shadow-md hover:shadow-lg`}
                  >
                    <Hash className="w-3 h-3" />
                    <span>{keyword}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* محتوى المقال مع تحسينات */}
          <div 
            ref={contentRef}
            className={`prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl prose-p:leading-relaxed prose-p:text-lg content-spacing arabic-text-enhanced ${
              isReadingMode ? 'reading-mode text-xl leading-loose' : ''
            }`}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>

        {/* أزرار التفاعل العائمة للجوال */}
        {isMobile && (
          <div className="fixed bottom-4 left-4 right-4 z-40">
            <div className={`flex items-center justify-center gap-2 p-3 rounded-2xl backdrop-blur-md shadow-2xl border ${
              darkMode 
                ? 'bg-gray-800/90 border-gray-600' 
                : 'bg-white/90 border-gray-200'
            }`}>
              
              {/* إعجاب */}
              <button
                onClick={handleLike}
                className={`p-3 rounded-xl transition-all ${
                  liked 
                    ? 'bg-red-500 text-white scale-110' 
                    : darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
              </button>

              {/* حفظ */}
              <button
                onClick={handleSave}
                className={`p-3 rounded-xl transition-all ${
                  saved 
                    ? 'bg-yellow-500 text-white scale-110' 
                    : darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
              </button>

              {/* تشغيل صوتي */}
              <button
                onClick={toggleTextToSpeech}
                className={`p-3 rounded-xl transition-all ${
                  isPlaying 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Headphones className="w-5 h-5" />}
              </button>

              {/* مشاركة */}
              <button
                onClick={() => setShowShareModal(true)}
                className={`p-3 rounded-xl transition-all ${
                  darkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Share2 className="w-5 h-5" />
              </button>

              {/* وضع القراءة */}
              <button
                onClick={toggleReadingMode}
                className={`p-3 rounded-xl transition-all ${
                  isReadingMode 
                    ? 'bg-amber-500 text-white' 
                    : darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <BookOpen className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* أزرار تفاعل للشاشات الكبيرة */}
        {!isMobile && (
          <div className="fixed left-6 top-1/2 transform -translate-y-1/2 z-40">
            <div className={`flex flex-col gap-3 p-2 rounded-2xl backdrop-blur-md shadow-lg ${
              darkMode ? 'bg-gray-800/80 border border-gray-600' : 'bg-white/80 border border-gray-200'
            }`}>
              
              <button
                onClick={handleLike}
                className={`p-3 rounded-xl transition-all group ${
                  liked ? 'bg-red-500 text-white' : 'hover:bg-red-50 hover:text-red-500'
                }`}
                title="أعجبني"
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''} group-hover:scale-110`} />
              </button>

              <button
                onClick={handleSave}
                className={`p-3 rounded-xl transition-all group ${
                  saved ? 'bg-yellow-500 text-white' : 'hover:bg-yellow-50 hover:text-yellow-500'
                }`}
                title="حفظ للقراءة لاحقاً"
              >
                <Bookmark className={`w-5 h-5 ${saved ? 'fill-current' : ''} group-hover:scale-110`} />
              </button>

              <button
                onClick={toggleTextToSpeech}
                className={`p-3 rounded-xl transition-all group ${
                  isPlaying ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-blue-50 hover:text-blue-500'
                }`}
                title={isPlaying ? 'إيقاف التشغيل' : 'تشغيل صوتي'}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Headphones className="w-5 h-5 group-hover:scale-110" />}
              </button>

              <button
                onClick={() => setShowShareModal(true)}
                className="p-3 rounded-xl transition-all group hover:bg-green-50 hover:text-green-500"
                title="مشاركة المقال"
              >
                <Share2 className="w-5 h-5 group-hover:scale-110" />
              </button>

              <button
                onClick={toggleReadingMode}
                className={`p-3 rounded-xl transition-all group ${
                  isReadingMode ? 'bg-amber-500 text-white' : 'hover:bg-amber-50 hover:text-amber-500'
                }`}
                title="وضع القراءة"
              >
                <BookOpen className="w-5 h-5 group-hover:scale-110" />
              </button>

              <button
                onClick={toggleFullscreen}
                className={`p-3 rounded-xl transition-all group ${
                  isFullscreen ? 'bg-purple-500 text-white' : 'hover:bg-purple-50 hover:text-purple-500'
                }`}
                title="ملء الشاشة"
              >
                <Maximize2 className="w-5 h-5 group-hover:scale-110" />
              </button>
            </div>
          </div>
        )}

        {/* زر العودة لأعلى المحسن */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className={`fixed ${
              isMobile ? 'bottom-24 right-4' : 'bottom-8 right-8'
            } z-40 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 group ${
              darkMode 
                ? 'bg-gray-800 text-white border border-gray-600' 
                : 'bg-white text-gray-800 border border-gray-200'
            }`}
            style={{
              background: darkMode 
                ? 'linear-gradient(135deg, #1f2937 0%, #374151 100%)' 
                : 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)'
            }}
          >
            <ArrowUp className="w-6 h-6 group-hover:animate-bounce" />
          </button>
        )}

        {/* نافذة المشاركة المحسنة */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className={`w-full max-w-md rounded-3xl shadow-2xl overflow-hidden ${
              darkMode ? 'bg-gray-800 border border-gray-600' : 'bg-white border border-gray-200'
            }`}>
              
              {/* رأس النافذة */}
              <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Share2 className="w-6 h-6" />
                    مشاركة المقال
                  </h3>
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="p-2 rounded-full hover:bg-white/20 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-white/80 mt-2">شارك هذا المقال مع أصدقائك</p>
              </div>

              {/* خيارات المشاركة */}
              <div className="p-6 space-y-4">
                
                {/* منصات التواصل */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleShare('twitter')}
                    className="flex items-center gap-3 p-4 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                    <span>تويتر</span>
                  </button>

                  <button
                    onClick={() => handleShare('facebook')}
                    className="flex items-center gap-3 p-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    <Facebook className="w-5 h-5" />
                    <span>فيسبوك</span>
                  </button>

                  <button
                    onClick={() => handleShare('linkedin')}
                    className="flex items-center gap-3 p-4 rounded-xl bg-blue-700 text-white hover:bg-blue-800 transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                    <span>لينكدإن</span>
                  </button>

                  <button
                    onClick={() => handleShare('whatsapp')}
                    className="flex items-center gap-3 p-4 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>واتساب</span>
                  </button>
                </div>

                {/* نسخ الرابط */}
                <div className={`p-4 rounded-xl border-2 border-dashed ${
                  darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={typeof window !== 'undefined' ? window.location.href : ''}
                      readOnly
                      className={`flex-1 p-2 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-800 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                    <button
                      onClick={() => handleShare()}
                      className={`p-2 rounded-lg transition-colors ${
                        copied 
                          ? 'bg-green-500 text-white' 
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    انقر لنسخ رابط المقال
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* إحصائيات المقال المحسنة */}
        <div className={`mt-12 p-8 rounded-3xl ${
          darkMode 
            ? 'bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 border border-gray-600' 
            : 'bg-gradient-to-r from-gray-50 via-white to-gray-50 border border-gray-200'
        } shadow-2xl max-w-4xl mx-auto mb-8`}>
          
          <h3 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-3">
            <BarChart3 className="w-7 h-7 text-blue-500" />
            إحصائيات المقال
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            
            {/* المشاهدات */}
            <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/10">
              <div className="inline-flex p-3 rounded-full bg-blue-500/20 mb-3">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {(article.views || 0).toLocaleString()}
              </div>
              <div className="text-sm opacity-70">مشاهدة</div>
            </div>

            {/* الإعجابات */}
            <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-600/10">
              <div className="inline-flex p-3 rounded-full bg-red-500/20 mb-3">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-600">
                {(article.likes || 0).toLocaleString()}
              </div>
              <div className="text-sm opacity-70">إعجاب</div>
            </div>

            {/* التعليقات */}
            <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-600/10">
              <div className="inline-flex p-3 rounded-full bg-green-500/20 mb-3">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                {commentsCount.toLocaleString()}
              </div>
              <div className="text-sm opacity-70">تعليق</div>
            </div>

            {/* المشاركات */}
            <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/10">
              <div className="inline-flex p-3 rounded-full bg-purple-500/20 mb-3">
                <Share2 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {Math.floor((article.views || 0) * 0.1).toLocaleString()}
              </div>
              <div className="text-sm opacity-70">مشاركة</div>
            </div>
          </div>

          {/* معلومات إضافية */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold">وقت القراءة</div>
                <div className="text-sm opacity-70">{calculateReadingTime(article.content)} دقائق</div>
              </div>
              <div>
                <div className="text-lg font-semibold">تاريخ النشر</div>
                <div className="text-sm opacity-70">{formatFullDate(article.published_at || article.created_at)}</div>
              </div>
              <div>
                <div className="text-lg font-semibold">آخر تحديث</div>
                <div className="text-sm opacity-70">{formatRelativeDate(article.updated_at || article.created_at)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* أزرار العمل النهائية */}
        <div className="max-w-4xl mx-auto px-4 mb-12">
          <div className={`p-6 rounded-3xl ${
            darkMode 
              ? 'bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600' 
              : 'bg-gradient-to-r from-white to-gray-50 border border-gray-200'
          } shadow-2xl`}>
            
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold mb-2">هل أعجبك هذا المقال؟</h3>
              <p className="opacity-70">ساعدنا في نشر المحتوى المفيد</p>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  liked
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600'
                }`}
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                {liked ? 'أعجبني' : 'أعجبني'}
              </button>

              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-blue-500 text-white hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/25"
              >
                <Share2 className="w-5 h-5" />
                مشاركة
              </button>

              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  saved
                    ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/25'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-600'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
                {saved ? 'محفوظ' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
        
        {/* JSON-LD للمحركات */}
        <ArticleJsonLd article={article} />
      </div>

      {/* أنماط CSS مخصصة */}
      <style jsx global>{`
        .progress-bar::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          height: 100%;
          width: 8px;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.3), transparent);
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }

        .reading-mode {
          font-size: 1.25rem !important;
          line-height: 1.8 !important;
          color: #2d3748;
        }

        .dark .reading-mode {
          color: #e2e8f0;
        }

        .arabic-text-enhanced {
          font-feature-settings: "liga" 1, "calt" 1, "kern" 1;
          text-rendering: optimizeLegibility;
        }

        .content-spacing > * + * {
          margin-top: 1.5rem;
        }

        .content-spacing h2 {
          margin-top: 3rem;
          margin-bottom: 1.5rem;
        }

        .content-spacing h3 {
          margin-top: 2.5rem;
          margin-bottom: 1rem;
        }

        .mobile-device .fixed {
          z-index: 9999;
        }

        .touch-device button {
          min-height: 44px;
          min-width: 44px;
        }

        @media (max-width: 640px) {
          .prose {
            font-size: 1.1rem;
            line-height: 1.7;
          }

          .prose h2 {
            font-size: 1.5rem;
          }

          .prose h3 {
            font-size: 1.3rem;
          }
        }
      `}</style>
    </>
  );
}
