'use client';

import Image from 'next/image';
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/Footer';
import toast from 'react-hot-toast';
import { useDarkMode } from "@/hooks/useDarkMode";
import { 
  Brain, 
  Eye, 
  Clock, 
  Share2, 
  Bookmark, 
  Download, 
  Printer, 
  Heart,
  Calendar,
  User,
  Star,
  ChevronRight,
  Sparkles,
  FileText,
  Hash,
  ChevronUp,
  Menu,
  X,
  ExternalLink,
  Copy,
  Lightbulb,
  TrendingUp,
  ListFilter,
  MessageCircle,
  Award,
  Layers,
  Globe,
  Target,
  Zap,
  BarChart3,
  BookOpen,
  ChevronDown,
  ArrowUp,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  RotateCcw
} from 'lucide-react';

interface DeepAnalysisPageProps {
  id: string;
  title: string;
  lead?: string;
  summary?: string;
  contentHtml?: string;
  rawContent?: string;
  content?: any;
  tags: string[];
  author?: string;
  authorName?: string;
  authorRole?: string;
  authorAvatar?: string;
  publishedAt: string;
  publishedAtHijri?: string;
  readTime?: number;
  readingTime?: number;
  views: number;
  likes: number;
  shares: number;
  rating?: number;
  category?: string;
  categorySlug?: string;
  aiSummary?: string;
  aiQuestions?: string[];
  relatedArticles?: RelatedArticle[];
  featuredImage?: string;
}

interface RelatedArticle {
  id: string;
  title: string;
  summary: string;
  readTime: number;
  category: string;
}

interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
  wordCount?: number;
}

// دالة debounce محلية
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

export default function DeepAnalysisPage() {
  const { darkMode } = useDarkMode();
  const params = useParams();
const [analysis, setAnalysis] = useState<DeepAnalysisPageProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [tableOfContents, setTableOfContents] = useState<TableOfContentsItem[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showMobileToc, setShowMobileToc] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [readingSpeed, setReadingSpeed] = useState(1);
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const tocRef = useRef<HTMLDivElement>(null);

  // تحديث dark mode بعد التحميل لتجنب مشكلة Hydration
  useEffect(() => {
    setDarkMode(contextDarkMode);
  }, [contextDarkMode]);

  useEffect(() => {
    fetchAnalysisDetails();
  }, [params?.id]);

  useEffect(() => {
    if (analysis?.rawContent || analysis?.contentHtml) {
      generateTableOfContents();
    }
  }, [analysis?.rawContent, analysis?.contentHtml]);

  useEffect(() => {
    const handleScroll = () => {
      // تحديث زر العودة للأعلى
      setShowScrollTop(window.pageYOffset > 300);
      
      // حساب نسبة التقدم في القراءة
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrollTop = window.pageYOffset;
      const progress = (scrollTop / documentHeight) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
      
      // حساب الوقت المتبقي للقراءة
      if (analysis && readingProgress > 0) {
        const totalTime = analysis.readTime || 5;
        const remainingTime = Math.max(0, totalTime - (totalTime * readingProgress / 100));
        setEstimatedTimeLeft(Math.ceil(remainingTime));
      }
      
      // تحديث القسم النشط في الفهرس
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
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tableOfContents, activeSection, analysis, readingProgress]);

  // باقي الدوال... (سأضعها في الجزء التالي)
  const fetchAnalysisDetails = async () => {
    try {
      const response = await fetch(`/api/deep-analyses/${params?.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analysis');
      }
      const data = await response.json();

      const analysisData: DeepAnalysisPageProps = {
        id: data.id,
        title: data.title,
        lead: data.summary,
        summary: data.summary,
        contentHtml: data.rawContent || data.content,
        rawContent: data.rawContent || data.content,
        content: data.content,
        tags: data.tags || [],
        author: data.authorName || 'فريق التحرير',
        authorName: data.authorName || 'فريق التحرير',
        authorRole: data.authorRole || 'محرر أول',
        authorAvatar: data.authorAvatar || '/images/default-avatar.jpg',
        publishedAt: data.publishedAt ? new Date(data.publishedAt).toLocaleDateString('ar-SA') : new Date().toLocaleDateString('ar-SA'),
        publishedAtHijri: data.publishedAtHijri,
        readTime: data.readTime || Math.ceil((data.rawContent || data.content || '').length / 1000) || 5,
        views: data.views || 0,
        likes: data.likes || 0,
        shares: data.shares || 0,
        rating: data.rating || 4.5,
        category: data.category || 'تحليل عام',
        categorySlug: data.categorySlug || 'general',
        aiSummary: data.aiSummary,
        aiQuestions: data.aiQuestions || [],
        relatedArticles: data.relatedArticles || [],
        featuredImage: data.featuredImage || '/images/default-analysis.jpg'
      };

      setAnalysis(analysisData);
    } catch (error) {
      console.error('Error fetching analysis:', error);
      toast.error('حدث خطأ في تحميل التحليل');
    } finally {
      setLoading(false);
    }
  };

  const generateTableOfContents = () => {
    if (!analysis?.contentHtml && !analysis?.rawContent) return;

    const content = analysis.contentHtml || analysis.rawContent || '';
    const headings = content.match(/<h[1-6][^>]*>.*?<\/h[1-6]>/gi) || [];
    
    const toc: TableOfContentsItem[] = headings.map((heading, index) => {
      const level = parseInt(heading.match(/<h([1-6])/)?.[1] || '2');
      const text = heading.replace(/<[^>]*>/g, '').trim();
      const id = `heading-${index}`;
      
      return {
        id,
        title: text,
        level,
        wordCount: text.split(' ').length
      };
    });

    setTableOfContents(toc);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: analysis?.title,
          text: analysis?.lead,
          url: window.location.href,
        });
        if (analysis) {
          setAnalysis({ ...analysis, shares: analysis.shares + 1 });
        }
        toast.success('تم المشاركة بنجاح');
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('تم نسخ الرابط');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleSave = () => {
    setSaved(!saved);
    toast.success(saved ? 'تم إزالة من المحفوظات' : 'تم الحفظ في المحفوظات');
  };

  const handleLike = () => {
    setLiked(!liked);
    if (analysis) {
      setAnalysis({
        ...analysis,
        likes: liked ? analysis.likes - 1 : analysis.likes + 1
      });
    }
  };

  const toggleReading = () => {
    setIsReading(!isReading);
    if (!isReading) {
      toast.success('تم تفعيل وضع القراءة المركزة');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="relative">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
              <Brain className="absolute inset-0 m-auto w-6 h-6 text-blue-600 animate-pulse" />
            </div>
            <p className={`mt-6 text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              جاري تحميل التحليل العميق...
            </p>
            <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              يتم تحضير المحتوى والتحليلات
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="mb-6">
              <FileText className={`w-20 h-20 mx-auto ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            </div>
            <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              لم يتم العثور على التحليل
            </h2>
            <p className={`text-lg mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              التحليل المطلوب غير متوفر أو تم حذفه
            </p>
            <Link 
              href="/insights/deep" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
            >
              <Brain className="w-5 h-5" />
              تصفح التحليلات العميقة
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div dir="rtl" className={`min-h-screen transition-all duration-300 ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      } ${isReading ? 'bg-amber-50 dark:bg-gray-800' : ''}`}>
        
        {/* شريط التقدم المحسن */}
        <div className="fixed top-0 left-0 right-0 z-50 h-2 bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-gray-700/50 dark:to-gray-600/50">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 relative"
            style={{ width: `${readingProgress}%` }}
          >
            <div className="absolute right-0 top-0 h-full w-2 bg-white dark:bg-gray-200 opacity-80 animate-pulse"></div>
          </div>
          
          {/* معلومات التقدم */}
          <div className={`absolute top-2 right-4 text-xs font-medium px-2 py-1 rounded-md ${
            darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'
          } shadow-sm`}>
            {Math.round(readingProgress)}% • {estimatedTimeLeft} دقائق متبقية
          </div>
        </div>

        {/* أدوات التحكم العائمة */}
        <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-40 space-y-2">
          <div className={`flex flex-col gap-2 p-2 rounded-xl backdrop-blur ${
            darkMode ? 'bg-gray-800/90 border border-gray-700' : 'bg-white/90 border border-gray-200'
          } shadow-lg`}>
            
            {/* وضع القراءة */}
            <button
              onClick={toggleReading}
              className={`p-2 rounded-lg transition-all ${
                isReading
                  ? 'bg-orange-500 text-white'
                  : darkMode
                    ? 'text-gray-400 hover:text-orange-400 hover:bg-gray-700'
                    : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
              }`}
              title="وضع القراءة المركزة"
            >
              <BookOpen className="w-5 h-5" />
            </button>

            {/* ملء الشاشة */}
            <button
              onClick={toggleFullscreen}
              className={`p-2 rounded-lg transition-all ${
                darkMode
                  ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-700'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
              title="ملء الشاشة"
            >
              <Maximize2 className="w-5 h-5" />
            </button>

            {/* لوحة التحليل */}
            <button
              onClick={() => setShowAnalysisPanel(!showAnalysisPanel)}
              className={`p-2 rounded-lg transition-all ${
                showAnalysisPanel
                  ? 'bg-purple-500 text-white'
                  : darkMode
                    ? 'text-gray-400 hover:text-purple-400 hover:bg-gray-700'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
              }`}
              title="لوحة التحليل الذكي"
            >
              <Brain className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hero Section محسن */}
        <div className={`relative overflow-hidden ${
          darkMode 
            ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-black' 
            : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
        }`}>
          
          {/* خلفية متحركة */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-blue-400/20 dark:bg-blue-600/20 animate-pulse"></div>
            <div className="absolute top-20 -left-40 w-60 h-60 rounded-full bg-purple-400/20 dark:bg-purple-600/20 animate-pulse delay-1000"></div>
            <div className="absolute bottom-20 right-1/3 w-40 h-40 rounded-full bg-pink-400/20 dark:bg-pink-600/20 animate-pulse delay-2000"></div>
            
            {/* شبكة النقاط */}
            <div className="absolute inset-0 opacity-5 dark:opacity-10">
              <div className="grid grid-cols-12 gap-4 h-full">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div key={i} className="w-1 h-1 bg-current rounded-full animate-pulse" style={{ 
                    animationDelay: `${i * 100}ms` 
                  }}></div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            
            {/* شريط التنقل المحسن */}
            <nav className="flex flex-wrap items-center gap-2 text-sm mb-10">
              <Link href="/" className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all hover:scale-105 ${
                darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700/50' : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
              }`}>
                <span>الرئيسية</span>
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              
              <Link href="/insights/deep" className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all hover:scale-105 ${
                darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700/50' : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
              }`}>
                <Brain className="w-4 h-4" />
                <span>تحليلات عميقة</span>
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              
              <span className={`px-3 py-2 rounded-lg ${
                darkMode ? 'bg-blue-900/60 text-blue-300' : 'bg-blue-100 text-blue-800'
              }`}>
                {analysis.category}
              </span>
            </nav>

            {/* شارة التحليل العميق */}
            <div className="flex items-center gap-3 mb-8">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                darkMode ? 'bg-gradient-to-r from-blue-900/80 to-purple-900/80 text-blue-300' : 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800'
              } border ${darkMode ? 'border-blue-800/50' : 'border-blue-200/50'}`}>
                <Sparkles className="w-4 h-4" />
                <span className="font-bold text-sm">تحليل عميق مدعوم بالذكاء الاصطناعي</span>
              </div>
              
              <div className={`flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium ${
                darkMode ? 'bg-green-900/60 text-green-300' : 'bg-green-100 text-green-800'
              }`}>
                <Star className="w-3 h-3 fill-current" />
                <span>{analysis.rating || 4.8}</span>
              </div>
            </div>

            {/* العنوان الرئيسي */}
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-8 ${
              darkMode ? 'text-white' : 'text-gray-900'
            } tracking-tight`}>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                {analysis.title}
              </span>
            </h1>

            {/* المقدمة */}
            {analysis.lead && (
              <div className={`text-xl md:text-2xl leading-relaxed mb-10 max-w-4xl ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              } font-medium`}>
                <div className={`border-r-4 pr-6 ${
                  darkMode ? 'border-purple-500/70' : 'border-purple-500/70'
                } italic`}>
                  {analysis.lead}
                </div>
              </div>
            )}

            {/* شريط المعلومات المحسن */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10`}>
              
              {/* الكاتب */}
              <div className={`flex items-center gap-3 p-4 rounded-xl backdrop-blur ${
                darkMode ? 'bg-gray-800/60 border border-gray-700' : 'bg-white/80 border border-gray-200'
              }`}>
                {analysis.authorAvatar ? (
                  <Image 
                    src={analysis.authorAvatar} 
                    alt={analysis.author || ''}
                    width={48} 
                    height={48}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-600"
                  />
                ) : (
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    darkMode ? 'bg-gray-700' : 'bg-blue-100'
                  }`}>
                    <User className={`w-6 h-6 ${darkMode ? 'text-gray-300' : 'text-blue-700'}`} />
                  </div>
                )}
                <div>
                  <p className="font-bold text-sm">{analysis.author}</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {analysis.authorRole || 'محرر'}
                  </p>
                </div>
              </div>

              {/* التاريخ */}
              <div className={`flex items-center gap-3 p-4 rounded-xl backdrop-blur ${
                darkMode ? 'bg-gray-800/60 border border-gray-700' : 'bg-white/80 border border-gray-200'
              }`}>
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                  <Calendar className={`w-5 h-5 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`} />
                </div>
                <div>
                  <p className="font-bold text-sm">{analysis.publishedAt}</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    تاريخ النشر
                  </p>
                </div>
              </div>

              {/* وقت القراءة */}
              <div className={`flex items-center gap-3 p-4 rounded-xl backdrop-blur ${
                darkMode ? 'bg-gray-800/60 border border-gray-700' : 'bg-white/80 border border-gray-200'
              }`}>
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
                  <Clock className={`w-5 h-5 ${darkMode ? 'text-purple-300' : 'text-purple-600'}`} />
                </div>
                <div>
                  <p className="font-bold text-sm">{analysis.readTime} دقيقة</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    وقت القراءة
                  </p>
                </div>
              </div>

              {/* الإحصائيات */}
              <div className={`flex items-center gap-3 p-4 rounded-xl backdrop-blur ${
                darkMode ? 'bg-gray-800/60 border border-gray-700' : 'bg-white/80 border border-gray-200'
              }`}>
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
                  <Eye className={`w-5 h-5 ${darkMode ? 'text-green-300' : 'text-green-600'}`} />
                </div>
                <div>
                  <p className="font-bold text-sm">{analysis.views.toLocaleString()}</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    مشاهدة
                  </p>
                </div>
              </div>
            </div>

            {/* الصورة الرئيسية المحسنة */}
            {analysis.featuredImage && (
              <div className="relative group mb-10">
                <div className="relative overflow-hidden rounded-2xl">
                  <Image 
                    src={analysis.featuredImage} 
                    alt={analysis.title}
                    width={1200} 
                    height={600}
                    className="w-full h-auto object-cover rounded-2xl transform group-hover:scale-105 transition-transform duration-700"
                    style={{ maxHeight: '500px' }}
                    priority
                  />
                  
                  {/* تدرج علوي */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* معلومات الصورة */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-sm font-medium">صورة توضيحية للتحليل</p>
                    <p className="text-xs opacity-80">© {new Date().getFullYear()} سبق AI - جميع الحقوق محفوظة</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* المحتوى الرئيسي */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* الشريط الجانبي الأيمن - فهرس المحتويات */}
            <aside className="lg:col-span-3 lg:order-2">
              <div className="sticky top-8 space-y-6">
                
                {/* أدوات التفاعل السريع */}
                <div className={`p-4 rounded-2xl backdrop-blur ${
                  darkMode ? 'bg-gray-800/80 border border-gray-700' : 'bg-white/90 border border-gray-200'
                } shadow-lg`}>
                  
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    تفاعل مع التحليل
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    
                    {/* إعجاب */}
                    <button
                      onClick={handleLike}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl transition-all ${
                        liked
                          ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                          : darkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-red-600 hover:text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                      <span className="text-xs font-medium">{analysis.likes}</span>
                    </button>

                    {/* مشاركة */}
                    <button
                      onClick={handleShare}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl transition-all ${
                        darkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-blue-600 hover:text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="text-xs font-medium">{analysis.shares}</span>
                    </button>

                    {/* حفظ */}
                    <button
                      onClick={handleSave}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl transition-all ${
                        saved
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                          : darkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-green-600 hover:text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-600'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                      <span className="text-xs font-medium">حفظ</span>
                    </button>

                    {/* طباعة */}
                    <button
                      onClick={() => window.print()}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl transition-all ${
                        darkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-purple-600 hover:text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                      }`}
                    >
                      <Printer className="w-4 h-4" />
                      <span className="text-xs font-medium">طباعة</span>
                    </button>
                  </div>
                </div>

                {/* فهرس المحتويات */}
                {tableOfContents.length > 0 && (
                  <div className={`p-4 rounded-2xl backdrop-blur ${
                    darkMode ? 'bg-gray-800/80 border border-gray-700' : 'bg-white/90 border border-gray-200'
                  } shadow-lg`}>
                    
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <ListFilter className="w-5 h-5 text-purple-500" />
                      فهرس المحتويات
                    </h3>
                    
                    <nav className="space-y-2">
                      {tableOfContents.map((item, index) => (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          className={`block p-2 rounded-lg transition-all text-sm ${
                            activeSection === item.id
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                              : darkMode
                                ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                          }`}
                          style={{ paddingRight: `${item.level * 8 + 8}px` }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="line-clamp-2">{item.title}</span>
                            {item.wordCount && (
                              <span className={`text-xs opacity-70 ${
                                activeSection === item.id ? 'text-white' : 'text-gray-400'
                              }`}>
                                {item.wordCount} كلمة
                              </span>
                            )}
                          </div>
                        </a>
                      ))}
                    </nav>
                  </div>
                )}

                {/* إحصائيات القراءة */}
                <div className={`p-4 rounded-2xl backdrop-blur ${
                  darkMode ? 'bg-gray-800/80 border border-gray-700' : 'bg-white/90 border border-gray-200'
                } shadow-lg`}>
                  
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-500" />
                    إحصائيات القراءة
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">التقدم</span>
                      <span className="font-bold text-blue-500">{Math.round(readingProgress)}%</span>
                    </div>
                    
                    <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2`}>
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${readingProgress}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span>الوقت المتبقي</span>
                      <span className="font-bold text-purple-500">{estimatedTimeLeft} دقيقة</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* المحتوى الرئيسي */}
            <main className="lg:col-span-9 lg:order-1">
              <article className={`prose prose-lg max-w-none ${
                darkMode ? 'prose-invert' : ''
              } ${isReading ? 'prose-xl' : ''}`}>
                
                <div 
                  ref={contentRef}
                  className={`${isReading ? 'leading-relaxed' : ''}`}
                  dangerouslySetInnerHTML={{ __html: analysis.contentHtml || analysis.rawContent || '' }}
                />
              </article>

              {/* العلامات والكلمات المفتاحية */}
              {analysis.tags.length > 0 && (
                <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Hash className="w-5 h-5 text-blue-500" />
                    الكلمات المفتاحية
                  </h3>
                  
                  <div className="flex flex-wrap gap-2">
                    {analysis.tags.map((tag, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          darkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        } border transition-colors cursor-pointer`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* تقييم التحليل */}
              <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  قيّم هذا التحليل
                </h3>
                
                <div className="flex items-center gap-4">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        className="text-2xl text-amber-400 hover:text-amber-500 transition-colors"
                      >
                        <Star className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>
                  
                  <span className="text-sm font-medium">
                    {analysis.rating} من 5 ({Math.floor(analysis.views / 10)} تقييم)
                  </span>
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* زر العودة للأعلى */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className={`fixed bottom-6 left-6 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
              darkMode
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            } border border-gray-200 dark:border-gray-600 z-40`}
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}

        {/* لوحة التحليل الذكي المنبثقة */}
        {showAnalysisPanel && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className={`max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-2xl p-6 ${
              darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            } shadow-2xl`}>
              
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Brain className="w-6 h-6 text-purple-500" />
                  التحليل الذكي
                </h2>
                
                <button
                  onClick={() => setShowAnalysisPanel(false)}
                  className={`p-2 rounded-lg transition-all ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* ملخص الذكاء الاصطناعي */}
              {analysis.aiSummary && (
                <div className="mb-6">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    ملخص ذكي
                  </h3>
                  <p className={`p-4 rounded-xl ${
                    darkMode ? 'bg-gray-700' : 'bg-blue-50'
                  } leading-relaxed`}>
                    {analysis.aiSummary}
                  </p>
                </div>
              )}

              {/* أسئلة ذكية */}
              {analysis.aiQuestions && analysis.aiQuestions.length > 0 && (
                <div>
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-green-500" />
                    أسئلة للتفكير
                  </h3>
                  <div className="space-y-3">
                    {analysis.aiQuestions.map((question, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-xl ${
                          darkMode ? 'bg-gray-700' : 'bg-green-50'
                        } border-r-4 border-green-500`}
                      >
                        <p className="font-medium">س{index + 1}: {question}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
