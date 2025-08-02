'use client';

import React, { useState, useEffect, useCallback, useMemo, memo, Suspense } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Brain } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import PageWrapper from '@/components/PageWrapper';
import DeepAnalysisBlock from '@/components/DeepAnalysisBlock';
import FooterDashboard from '@/components/FooterDashboard';
import Footer from '@/components/Footer';
import { useTheme } from '@/contexts/ThemeContext';
import { getCookie, setCookie } from '@/lib/cookies';
import { getImageUrl } from '@/lib/image-utils';
import OptimizedImage from '@/components/OptimizedImage';
import CloudImage from '@/components/ui/CloudImage';
import { getArticleLink, formatDate } from '@/lib/utils';
import { SafeDate } from '@/lib/safe-date';
import CategoryBadge from './components/CategoryBadge';
import { SmartSlot } from '@/components/home/SmartSlot';
import SmartDigestBlock from '@/components/smart-blocks/SmartDigestBlock';
import MobileArticleCard from '@/components/mobile/MobileArticleCard';
import EnhancedMobileNewsCard from '@/components/mobile/EnhancedMobileNewsCard';
import MobileStatsBar from '@/components/mobile/MobileStatsBar';
import CompactStatsBar from '@/components/mobile/CompactStatsBar';
import SmartContentNewsCard from '@/components/mobile/SmartContentNewsCard';
import { generatePersonalizedRecommendations } from '@/lib/ai-recommendations';
import type { RecommendedArticle } from '@/lib/ai-recommendations';

import { useDarkModeContext } from '@/contexts/DarkModeContext';
import ArticleViews from '@/components/ui/ArticleViews';
import { Skeleton } from '@/components/ui/skeleton';
import SafeHydration from '@/components/SafeHydration';

// Dynamic imports for components that appear below the fold
const TodayOpinionsSection = dynamic(() => import('@/components/TodayOpinionsSection'), {
  ssr: true,
  loading: () => <Skeleton className="w-full h-96 rounded-lg" />
});

const SmartAudioBlock = dynamic(() => import('@/components/home/SmartAudioBlock'), {
  ssr: true,
  loading: () => <Skeleton className="w-full h-40 rounded-lg" />
});

const MuqtarabBlock = dynamic(() => import('@/components/home/MuqtarabBlock'), {
  ssr: true,
  loading: () => <Skeleton className="w-full h-96 rounded-lg" />
});

const SmartDoseBlock = dynamic(() => import('@/components/smart-doses/SmartDoseBlock'), {
  ssr: true,
  loading: () => <Skeleton className="w-full h-64 rounded-lg" />
});

const FeaturedNewsCarousel = dynamic(() => import('@/components/FeaturedNewsCarousel'), {
  ssr: true,
  loading: () => <Skeleton className="w-full h-80 rounded-lg" />
});

const BreakingNewsBar = dynamic(() => import('@/components/BreakingNewsBar'), {
  ssr: false,
  loading: () => <div className="w-full h-24 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse mx-4 mb-6" />
});

import { DeepAnalysis } from '@/types/deep-analysis';
import { 
  Share2, 
  Eye, 
  Clock, 
  Calendar,
  TrendingUp,
  Brain,
  Award,
  Target,
  Users,
  MapPin,
  Play,
  Volume2,
  Star,
  Trophy,
  Sparkles,
  Newspaper,
  BarChart3,
  Zap,
  ArrowRight,
  X,
  MessageSquare,
  Beaker,
  Briefcase,
  Palette,
  Plane,
  Heart,
  Building2,
  CloudRain,
  Tag,
  BookOpen,
  User,
  ArrowLeft,
  Settings,
} from 'lucide-react';

const categoryIcons: { [key: string]: React.ElementType } = {
  'تقنية': Beaker,
  'اقتصاد': Briefcase,
  'رياضة': Trophy,
  'ثقافة': Palette,
  'سفر': Plane,
  'صحة': Heart,
  'علوم': Beaker,
  'سياسة': Building2,
  'طقس': CloudRain,
  'default': Tag,
};

interface PageClientProps {
  initialArticles?: any[];
  initialCategories?: any[];
  initialStats?: {
    activeReaders: number | null;
    dailyArticles: number | null;
    loading: boolean;
  };
  initialDeepAnalyses?: DeepAnalysis[];
  stats?: {
    activeReaders: number | null;
    dailyArticles: number | null;
    loading: boolean;
  };
}

function NewspaperHomePage({ 
  initialArticles = [], 
  initialCategories = [], 
  initialStats,
  initialDeepAnalyses = [],
  stats
}: PageClientProps) {
  const { user, loading: authLoading } = useAuth();
  const { darkMode } = useDarkModeContext();
  // حالة الجهاز - نبدأ بقيمة undefined لتجنب مشاكل hydration
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);
  const isLoggedIn = !!user;

  // فحص نوع الجهاز
  useEffect(() => {
    const checkDevice = () => {
      if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
      
      try {
        const userAgent = navigator.userAgent || '';
        const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        const isSmallScreen = window.innerWidth <= 768;
        setIsMobile(isMobileDevice || isSmallScreen);
      } catch (error) {
        console.warn('Error detecting device type:', error);
        setIsMobile(false);
      }
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // استخدم false كقيمة افتراضية فقط عند العرض
  const isMobileView = isMobile ?? false;

  // =============================
  // المتغيرات المساعدة لمنع الأخطاء أثناء التشغيل (قابلة للتحديث مستقبلاً)
  // =============================
  // إعدادات البلوكات الديناميكية
  const blocksConfig: Record<string, { enabled: boolean }> = {};
  // إرجاع قائمة البلوكات المرتبة (حاليًا لا يوجد بلوكات مفعّلة)
  const getOrderedBlocks = () => {
    return [] as Array<{ key: string; component: React.ReactNode }>;
  };
  
  // التصنيفات
  const [categories, setCategories] = useState<any[]>(initialCategories);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(initialCategories.length === 0);
  const [selectedCategory, setSelectedCategory] = useState<string | number | null>(null);
  const [categoryArticles, setCategoryArticles] = useState<any[]>([]);
  const [categoryArticlesLoading, setCategoryArticlesLoading] = useState<boolean>(false);
  // متغيرات إضافية مطلوبة
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(false);
  const [articlesLoading, setArticlesLoading] = useState<boolean>(initialArticles.length === 0);
  const [personalizedLoading, setPersonalizedLoading] = useState<boolean>(false);
  const [userInterests, setUserInterests] = useState<any[]>([]);
  const [showPersonalized, setShowPersonalized] = useState<boolean>(false);
  const [articles, setArticles] = useState<any[]>(initialArticles);
  const [personalizedArticles, setPersonalizedArticles] = useState<any[]>([]);
  const [smartRecommendations, setSmartRecommendations] = useState<RecommendedArticle[]>([]);
  const [featuredArticle, setFeaturedArticle] = useState<any[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState<boolean>(true);
  
  console.log('🔧 NewspaperHomePage: تحضير useEffects...');
  
  // دوال مؤقتة
  const handleInterestClick = (interestId: string) => {
    /* TODO: تنفيذ فعل عند اختيار الاهتمام */
  };
  const handleTogglePersonalized = () => {
    setShowPersonalized(prev => !prev);
  };
  // مكون بطاقة الأخبار
  const NewsCard = ({ news }: { news: any }) => {
    const [imageLoading, setImageLoading] = useState(true);
    
    return (
      <Link href={getArticleLink(news)} className="group block">
        <article className={`h-full rounded-3xl overflow-hidden shadow-xl dark:shadow-gray-900/50 transition-all duration-300 transform ${
          news.breaking || news.is_breaking
            ? (darkMode 
                ? 'bg-red-950/30 border-2 border-red-800/70' 
                : 'bg-red-50 border-2 border-red-200')
            : (darkMode 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700')
        } group-hover:scale-[1.02] group-hover:shadow-2xl`}>
          {/* صورة المقال */}
          <div className="relative h-40 sm:h-48 overflow-hidden">
            <CloudImage
              src={news?.featured_image || null}
              alt={news?.title || 'صورة المقال'}
              fill
              className="w-full h-full object-cover transition-transform duration-500"
              fallbackType="article"
              priority={false}
            />
            {/* شارة عاجل */}
            {(news.breaking || news.is_breaking) && (
              <div className="absolute top-3 right-3">
                <span className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse shadow-lg">
                  ⚡ عاجل
                </span>
              </div>
            )}
          </div>
          {/* محتوى البطاقة */}
          <div className="p-4 sm:p-5">
            {/* العنوان - محدود بثلاث أسطر */}
            <h4 className={`font-semibold text-base sm:text-lg mb-3 line-clamp-3 ${
              darkMode 
                ? 'text-white' 
                : 'text-gray-900 dark:text-white'
            } transition-colors`} title={news.title}>
              {news.title}
            </h4>
            {/* الملخص */}
            {news.summary && (
              <p className={`text-sm mb-4 line-clamp-2 transition-colors duration-300 text-gray-600 dark:text-gray-400 dark:text-gray-500`}>
                {news.summary}
              </p>
            )}
            {/* التفاصيل السفلية */}
            <div className={`flex items-center justify-between pt-3 sm:pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100 dark:border-gray-700'}`}>
              {/* المعلومات */}
              <div className="flex flex-col gap-1">
                {/* التاريخ والوقت */}
                <div className="flex items-center gap-2 sm:gap-3 text-xs">
                                      <div className="text-sm text-gray-500 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                                                <SafeDate date={news.published_at || news.created_at} />
                    </div>
                  {news.reading_time && (
                    <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>
                      <Clock className="w-3 h-3" />
                      {news.reading_time} د
                    </span>
                  )}
                </div>
                {/* الكاتب والمشاهدات */}
                <div className="flex items-center gap-2 sm:gap-3 text-xs">
                  {news.author_name && (
                    <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>
                      <User className="w-3 h-3" />
                      {news.author_name}
                    </span>
                  )}
                  <ArticleViews 
                    count={news.views_count || news.views || 0} 
                    className={darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'} 
                  />
                </div>
              </div>
              {/* زر القراءة */}
              <div className={`p-2 rounded-xl transition-all ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                <ArrowLeft className={`w-4 h-4 transition-transform ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  };
  // =============================
  // جلب التصنيفات عند التحميل
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        console.log('🔄 جلب التصنيفات من العميل...');
        const res = await fetch('/api/categories?is_active=true');
        const json = await res.json();
        // 💡 FIX: The API returns { data: [...] } or just [...]
        const list = Array.isArray(json) ? json : (json.data ?? json.categories ?? []);
        console.log('✅ التصنيفات المُحدثة من العميل:', list.length);
        setCategories(list);
        if (list.length === 0) {
          console.warn("No categories were fetched from the API.");
        }
      } catch (err) {
        console.error('خطأ في جلب التصنيفات:', err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    
    // جلب التصنيفات فقط إذا لم تكن هناك تصنيفات أولية
    if (initialCategories.length === 0) {
      console.log('⚠️ لا توجد تصنيفات أولية، جاري الجلب من العميل...');
      fetchCategories();
    } else {
      console.log('✅ استخدام التصنيفات الأولية:', initialCategories.length);
      setCategoriesLoading(false);
    }
  }, [initialCategories]);
  
  // =============================
  // جلب المقالات الأحدث (للاستخدام في البلوكات لاحقاً)
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setArticlesLoading(true);
        const res = await fetch('/api/news?status=published&limit=20&sort=published_at&order=desc');
        const json = await res.json();
        // 💡 API الجديد يرجع { success: true, data: [...] }
        const list = json.success ? (json.data || []) : [];
        // تعيين المقالات للعرض في بلوك "محتوى مخصص لك"
        setArticles(list);
        if (list.length === 0) {
          console.warn("No articles were fetched from the API.");
        }
      } catch (err) {
        console.error('خطأ في جلب المقالات:', err);
      } finally {
        setArticlesLoading(false);
      }
    };
    
    // جلب المقالات فقط إذا لم تكن هناك مقالات أولية
    if (initialArticles.length === 0) {
      fetchArticles();
    } else {
      setArticlesLoading(false);
    }
  }, [initialArticles]);
  
  // =============================
  // جلب التوصيات الذكية
  // جلب الخبر المميز
  useEffect(() => {
    const fetchFeaturedArticle = async () => {
      try {
        setFeaturedLoading(true);
        // إضافة timestamp لكسر التخزين المؤقت
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/featured-news-carousel?t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.articles && data.articles.length > 0) {
            // نأخذ جميع الأخبار المميزة
            setFeaturedArticle(data.articles);
          }
        }
      } catch (error) {
        console.error('خطأ في جلب الخبر المميز:', error);
      } finally {
        setFeaturedLoading(false);
      }
    };
    
    fetchFeaturedArticle();
  }, []);

  useEffect(() => {
    const fetchSmartRecommendations = async () => {
      try {
        // نحتاج مقال واحد على الأقل كمرجع
        if (articles.length === 0) return;
        
        const currentArticle = articles[0];
        const recommendations = await generatePersonalizedRecommendations({
          currentArticleId: currentArticle.id,
          userId: user?.id || 'anonymous',
          currentCategory: currentArticle.categories?.name || currentArticle.category,
          currentTags: currentArticle.tags || [],
          limit: 10
        });
        
        setSmartRecommendations(recommendations.slice(0, 10)); // نحتاج 10 توصيات للتوزيع المتوازن
      } catch (error) {
        console.error('خطأ في جلب التوصيات الذكية:', error);
      }
    };
    
    if (articles.length > 0) {
      fetchSmartRecommendations();
    }
  }, [articles, user]);
  
  // =============================
  // دالة خلط البطاقات المخصصة مع بطاقات الأخبار
  const renderMixedContent = useCallback((articlesToRender: any[]) => {
    const mixedContent: JSX.Element[] = [];
    let smartCardIndex = 0;
    
    articlesToRender.forEach((article, index) => {
      // إضافة بطاقة الخبر العادية
      if (isMobileView) {
        mixedContent.push(
          <EnhancedMobileNewsCard key={article.id} news={article} darkMode={darkMode} variant="full-width" />
        );
      } else {
        mixedContent.push(
          <NewsCard key={article.id} news={article} />
        );
      }
      
      // إضافة البطاقات المخصصة بتوزيع متوازن
      // توزيع البطاقات المخصصة: بعد الأخبار 3، 6، 9، 13، 17
      const smartCardPositions = [3, 6, 9, 13, 17];
      const currentPosition = index + 1;
      
      if (smartCardPositions.includes(currentPosition)) {
        // إضافة 1-2 بطاقة مخصصة في كل موضع
        const cardsToAdd = currentPosition === 9 ? 2 : 1; // إضافة 2 بطاقة في المنتصف
        
        for (let i = 0; i < cardsToAdd && smartCardIndex < smartRecommendations.length; i++) {
          const recommendation = smartRecommendations[smartCardIndex];
          if (recommendation) {
            // تنويع العبارات التحفيزية
            const excerpts = [
              'اكتشف هذا المحتوى المميز الذي اخترناه لك بعناية بناءً على اهتماماتك',
              'محتوى مختار خصيصاً لك لإثراء تجربتك القرائية',
              'قد يعجبك هذا المحتوى المميز المختار بذكاء',
              'محتوى يتماشى مع ذوقك واهتماماتك',
              'اقتراح ذكي يناسب قراءاتك السابقة'
            ];
            
            mixedContent.push(
              <SmartContentNewsCard
                key={`smart-${recommendation.id}`}
                article={{
                  ...recommendation,
                  slug: recommendation.url.replace('/article/', ''),
                  featured_image: recommendation.thumbnail,
                  category_name: recommendation.category,
                  excerpt: excerpts[smartCardIndex % excerpts.length],
                  image_caption: `محتوى ${recommendation.type === 'تحليل' ? 'تحليلي عميق' : 
                    recommendation.type === 'رأي' ? 'رأي متخصص' : 
                    recommendation.type === 'تقرير' ? 'تقرير شامل' : 
                    'مميز'} - ${recommendation.readingTime} دقائق قراءة`
                }}
                darkMode={darkMode}
                variant={isMobileView ? 'full' : 'desktop'}
                position={smartCardIndex}
              />
            );
            smartCardIndex++;
          }
        }
      }
    });
    
    return mixedContent;
  }, [smartRecommendations, darkMode, isMobileView]);
  
  // دالة اختيار التصنيف
  const handleCategoryClick = async (categoryId: number | string) => {
    setSelectedCategory(categoryId);
    setCategoryArticlesLoading(true);
    try {
      console.log(`🔍 جلب مقالات التصنيف ID: ${categoryId}`);
              const res = await fetch(`/api/news?status=published&category_id=${categoryId}&limit=20&sort=published_at&order=desc`);
      const json = await res.json();
      
      console.log(`📊 استجابة API الجديد للتصنيف ${categoryId}:`, json);
      
      if (json.success) {
        const list = json.data || [];
        console.log(`✅ تم جلب ${list.length} مقال للتصنيف ${categoryId}`);
        setCategoryArticles(list);
      } else {
        console.error(`❌ فشل جلب مقالات التصنيف ${categoryId}:`, json.error);
        setCategoryArticles([]);
      }
    } catch (err) {
      console.error('خطأ في جلب مقالات التصنيف:', err);
      setCategoryArticles([]);
    } finally {
      setCategoryArticlesLoading(false);
    }
  };
  return (
    <PageWrapper 
      pageName="الصفحة الرئيسية" 
      showPerformanceMonitor={process.env.NODE_ENV === 'development'}
    >
      <div 
        className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
        style={{
          direction: 'rtl'
        }}
      >

              {/* شريط الإحصائيات المحسن للموبايل */}
        <SafeHydration>
          {isMobileView && (
            <div className="mb-4">
              <CompactStatsBar darkMode={darkMode} />
            </div>
          )}
        </SafeHydration>
      
      {/* 🔥 الترتيب الجديد المحدث للواجهة الرئيسية */}
      
      {/* 1. الهيدر ⬆️ - تم تأكيده أنه في المقدمة عبر Layout */}
      
      {/* 1.5. الخبر العاجل (Breaking News) 🔴 - فوق الأخبار المميزة */}
      <BreakingNewsBar />
      
      {/* 2. الأخبار المميزة (Featured Articles) 🌟 */}
      {!featuredLoading && featuredArticle.length > 0 && (
        <div className="pt-8 pb-6">
          <FeaturedNewsCarousel articles={featuredArticle} />
        </div>
      )}
      
      {/* 3. الجرعات الذكية (Smart Doses) 💊 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Suspense fallback={
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center animate-pulse">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <p className="text-gray-600 dark:text-gray-400">جاري تحضير الجرعة الذكية...</p>
            </div>
          </div>
        }>
          <SmartDoseBlock userId={undefined} />
        </Suspense>
      </div>
      
      {/* 4. النشرة الصوتية (Audio Briefing) 🎧 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <SmartAudioBlock />
      </div>

      {/* 5. بلوك التصنيفات (Categories Block) 🏷️ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
        <div className={`rounded-3xl p-4 sm:p-6 lg:p-8 transition-all duration-500 shadow-lg dark:shadow-gray-900/50 ${darkMode ? 'bg-blue-900/10 border border-blue-800/30' : 'bg-blue-50 dark:bg-blue-900/20/50 border border-blue-200/50'}`} style={{ 
          backdropFilter: 'blur(10px)',
          background: darkMode 
            ? 'linear-gradient(135deg, rgba(30, 64, 175, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)' 
            : 'linear-gradient(135deg, rgba(219, 234, 254, 0.5) 0%, rgba(191, 219, 254, 0.3) 100%)'
        }}>
          <div className="text-center mb-6 sm:mb-8">
            {/* أيقونة كبيرة وواضحة */}
            <div className="mb-4">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl flex items-center justify-center shadow-xl ${
                darkMode 
                  ? 'bg-gradient-to-br from-blue-600 to-blue-800' 
                  : 'bg-gradient-to-br from-blue-500 to-blue-700'
              }`}>
                <Tag className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            </div>
            {/* العنوان */}
            <h2 className={`text-xl sm:text-2xl font-bold mb-3 transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-800 dark:text-gray-100'
            }`}>
              {isLoggedIn ? 'استكشف بحسب اهتماماتك' : 'استكشف بحسب التصنيفات'}
            </h2>
            {/* الوصف */}
            <p className={`text-sm transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {isLoggedIn 
                ? 'التصنيفات المختارة لك بناءً على تفضيلاتك وتفاعلاتك'
                : 'اختر التصنيف الذي يهمك لتصفح الأخبار المتخصصة'
              }
            </p>
            <div className={`text-xs mt-2 transition-colors duration-300 ${
              darkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>
              {isLoggedIn ? (
                <div className="flex items-center gap-1 justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="opacity-75">مخصص لك بناءً على تفضيلاتك</span>
                </div>
              ) : (
                <span className="opacity-75">التصنيفات مرتبطة بنظام إدارة المحتوى</span>
              )}
            </div>
          </div>
          {categoriesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : categories.length > 0 ? (
            <>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                {categories.map((category: any) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`group px-3 py-2 sm:px-4 md:px-6 sm:py-3 rounded-xl font-medium text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 relative ${ selectedCategory === category.id ? darkMode ? 'bg-blue-600 text-white border-2 border-blue-500 shadow-lg dark:shadow-gray-900/50' : 'bg-blue-500 text-white border-2 border-blue-400 shadow-lg dark:shadow-gray-900/50' : darkMode ? 'bg-blue-800/20 hover:bg-blue-700/30 text-blue-100 hover:text-blue-50 border border-blue-700/30 hover:border-blue-600/50' : 'bg-white dark:bg-gray-800/80 hover:bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-blue-600 border border-blue-200/50 hover:border-blue-300 shadow-sm dark:shadow-gray-900/50 hover:shadow-lg dark:shadow-gray-900/50 backdrop-blur-sm' }`}
                  >
                    {/* شارة "مخصص" للتصنيفات المخصصة */}
                    {isLoggedIn && category.is_personalized && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
                    )}
                    <div className="flex items-center gap-1 sm:gap-2">
                      {(() => {
                        const IconComponent = categoryIcons[category.name_ar] || categoryIcons['default'];
                        return category.icon ? (
                          <span className="text-sm sm:text-lg group-hover:scale-110 transition-transform duration-300">{category.icon}</span>
                        ) : (
                          <IconComponent className="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform duration-300" />
                        );
                      })()}
                      <span className="whitespace-nowrap">{category.name_ar || category.name}</span>
                      <span className={`text-xs ${ selectedCategory === category.id ? 'text-white/90' : darkMode ? 'text-blue-200 opacity-60' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500 opacity-60' }`}>
                        ({category.articles_count || 0})
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              {/* عرض المقالات المرتبطة بالتصنيف المختار */}
              {selectedCategory && (
                <div className={`mt-8 p-6 rounded-3xl shadow-lg dark:shadow-gray-900/50 ${darkMode ? 'bg-gray-800/50' : 'bg-white dark:bg-gray-800/70'} backdrop-blur-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200 dark:border-gray-700'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      مقالات {categories.find(c => c.id === selectedCategory)?.name_ar}
                    </h3>
                    <button
                      onClick={() => {
                        setSelectedCategory(null);
                        setCategoryArticles([]);
                      }}
                      className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800'}`}
                    >
                      <X className={`w-5 h-5 ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400 dark:text-gray-500'}`} />
                    </button>
                  </div>
                  {categoryArticlesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                  ) : categoryArticles.length > 0 ? (
                    <>
                      {/* Grid Layout for Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {categoryArticles.map((article: any) => (
                          <Link key={article.id} href={getArticleLink(article)} className="group">
                            <article className={`h-full rounded-3xl overflow-hidden shadow-xl dark:shadow-gray-900/50 transition-all duration-300 transform ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700'}`}>
                              {/* صورة المقال */}
                              <div className="relative h-40 sm:h-48 overflow-hidden">
                                <CloudImage
                                  src={article?.featured_image || null}
                                  alt={article?.title || 'صورة المقال'}
                                  fill
                                  className="w-full h-full object-cover transition-transform duration-500"
                                  fallbackType="article"
                                  priority={false}
                                />
                                {/* تم حذف طبقة التدرج فوق الصورة */}
                                {/* Category Badge */}
                                <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                                  <span className={`inline-flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-bold ${darkMode ? 'bg-blue-900/80 text-blue-200 backdrop-blur-sm' : 'bg-blue-500/90 text-white backdrop-blur-sm'}`}>
                                    <Tag className="w-2 h-2 sm:w-3 sm:h-3" />
                                    {categories.find(c => c.id === selectedCategory)?.name_ar}
                                  </span>
                                </div>
                              </div>
                              {/* محتوى البطاقة */}
                              <div className="p-4 sm:p-5">
                                {/* العنوان */}
                                <h4 className={`font-bold text-base sm:text-lg mb-3 line-clamp-2 ${
                                  darkMode 
                                    ? 'text-white' 
                                    : 'text-gray-900 dark:text-white'
                                } transition-colors`} title={article.title}>
                                  {article.title}
                                </h4>
                                {/* الملخص */}
                                {article.summary && (
                                  <p className={`text-sm mb-4 line-clamp-2 transition-colors duration-300 text-gray-600 dark:text-gray-400 dark:text-gray-500`}>
                                    {article.summary}
                                  </p>
                                )}
                                {/* التفاصيل السفلية */}
                                <div className={`flex items-center justify-between pt-3 sm:pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100 dark:border-gray-700'}`}>
                                  {/* المعلومات */}
                                  <div className="flex flex-col gap-1">
                                    {/* التاريخ والوقت */}
                                    <div className="flex items-center gap-2 sm:gap-3 text-xs">
                                                                              <div className="text-sm text-gray-500 flex items-center gap-2">
                                          <Clock className="w-4 h-4" />
                                          <SafeDate date={article.published_at || article.created_at} />
                                        </div>
                                      {article.reading_time && (
                                        <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>
                                          <Clock className="w-3 h-3" />
                                          {article.reading_time} د
                                        </span>
                                      )}
                                    </div>
                                    {/* الكاتب والمشاهدات */}
                                    <div className="flex items-center gap-2 sm:gap-3 text-xs">
                                      {article.author_name && (
                                        <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>
                                          <User className="w-3 h-3" />
                                          {article.author_name}
                                        </span>
                                      )}
                                      <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>
                                        <Eye className="w-3 h-3" />
                                        {article.views_count || 0}
                                      </span>
                                    </div>
                                  </div>
                                  {/* زر القراءة */}
                                  <div className={`p-2 rounded-xl transition-all ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                                    <ArrowLeft className={`w-4 h-4 transition-transform ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                  </div>
                                </div>
                              </div>
                            </article>
                          </Link>
                        ))}
                      </div>
                      {/* زر عرض جميع المقالات */}
                      <div className="text-center mt-8">
                        <Link 
                          href={`/categories/${categories.find(c => c.id === selectedCategory)?.slug || 'general'}`}
                          className={`group inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-base transition-all duration-300 transform hover:scale-105 shadow-lg dark:shadow-gray-900/50 hover:shadow-xl dark:shadow-gray-900/50 ${darkMode ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white' : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'}`}>
                          <span>عرض جميع مقالات {categories.find(c => c.id === selectedCategory)?.name_ar}</span>
                          <ArrowLeft className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div className={`text-center py-8 ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>
                      <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>لا توجد مقالات منشورة في هذا التصنيف حالياً</p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className={`text-center py-8 ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>
              <p className="text-sm">لا توجد تصنيفات متاحة حالياً</p>
            </div>
          )}
        </div>
      </section>
      
      {/* 6. بطاقات الأخبار المخصصة (Featured Cards) 📰 */}
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {/* Enhanced News Section */}
        <section className={`${isMobileView ? 'mb-8 sm:mb-12' : 'mb-10 sm:mb-20'}`}>
          <div className={`text-center smart-section-header ${isMobileView ? 'mb-8 pt-4 pb-2' : 'mb-12'}`}>
            {isCheckingAuth ? (
              // عرض حالة تحميل أثناء التحقق من تسجيل الدخول
              <div className="animate-pulse">
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gray-200 dark:bg-gray-700 mb-6">
                  <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="w-32 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
                <div className="w-96 h-10 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-4"></div>
                <div className="w-full max-w-2xl h-6 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
              </div>
            ) : (
              <>
                {/* رأس القسم مع شرط حالة تسجيل الدخول */}
                {!isCheckingAuth && (
                  isLoggedIn ? (
                    // للمستخدم المسجل
                    <>
                      {/* للهواتف الصغيرة جداً: دمج النص التعريفي مع العنوان */}
                      <div className="block sm:hidden">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 mb-3 smart-ai-label">
                          <Brain className="w-3.5 h-3.5 text-blue-600" />
                          <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-xs`}>
                            ذكي ومخصص
                          </span>
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        </div>
                        <h2 className={`font-bold mb-2 smart-section-title ${darkMode ? 'text-white' : 'text-gray-800'} text-xl leading-tight`}>
                          🎯 محتوى مختار خصيصاً لك
                        </h2>
                        <p className={`smart-section-subtext ${darkMode ? 'text-gray-300' : 'text-gray-600'} text-xs mb-4`}>
                          مقالات مخصصة بالذكاء الاصطناعي
                        </p>
                      </div>
                      
                      {/* للشاشات المتوسطة والكبيرة: التصميم الكامل */}
                      <div className="hidden sm:block">
                        <div className={`inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 mb-6 ${
                          isMobileView ? 'px-4 py-2 smart-ai-label' : 'px-6 py-3'
                        }`}>
                          <Brain className={`${isMobileView ? 'w-4 h-4' : 'w-5 h-5'} text-blue-600`} />
                          <span className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} ${
                            isMobileView ? 'text-sm' : 'text-base'
                          }`}>
                            نسخة مطورة بالذكاء الاصطناعي
                          </span>
                          <Sparkles className={`${isMobileView ? 'w-4 h-4' : 'w-5 h-5'} text-purple-600`} />
                        </div>
                        <h2 className={`font-bold mb-4 smart-section-title ${darkMode ? 'text-white' : 'text-gray-800'} ${
                          isMobileView ? 'text-2xl sm:text-3xl leading-tight' : 'text-4xl'
                        }`}>
                          🎯 محتوى ذكي مخصص لاهتماماتك
                        </h2>
                        <p className={`max-w-2xl mx-auto smart-section-subtext ${darkMode ? 'text-gray-300' : 'text-gray-600'} ${
                          isMobileView ? 'text-sm sm:text-base mb-6' : 'text-xl mb-8'
                        }`}>
                          {isMobileView 
                            ? 'مقالات مختارة خصيصاً لك'
                            : 'نقدم لك أفضل المقالات المختارة خصيصاً بناءً على اهتماماتك المحددة'
                          }
                        </p>
                      </div>
                    </>
                  ) : (
                    // للزائر غير المسجل
                    <>
                      <div className={`inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 mb-6 dark:bg-gray-800/40 dark:border-gray-700 ${
                        isMobileView ? 'px-4 py-2' : 'px-6 py-3'
                      }`}>
                        <Newspaper className={`${isMobileView ? 'w-4 h-4' : 'w-5 h-5'} text-gray-600 dark:text-gray-300`} />
                        <span className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} ${
                          isMobileView ? 'text-xs sm:text-sm' : 'text-base'
                        }`}>
                          أحدث المقالات
                        </span>
                      </div>
                      <h2 className={`font-bold mb-4 smart-section-title ${darkMode ? 'text-white' : 'text-gray-800'} ${
                        isMobileView ? 'text-2xl sm:text-3xl leading-tight' : 'text-4xl'
                      }`}>
                        📰 آخر الأخبار
                      </h2>
                      <p className={`max-w-2xl mx-auto smart-section-subtext ${darkMode ? 'text-gray-300' : 'text-gray-600'} ${
                        isMobileView ? 'text-sm sm:text-base mb-6' : 'text-xl mb-8'
                      }`}>
                        {isMobileView
                          ? 'أحدث المقالات المنشورة'
                          : 'تابع أحدث المقالات المنشورة من جميع التصنيفات'
                        }
                      </p>
                    </>
                  )
                )}
              </>
            )}
          </div>
          {/* Enhanced News Grid - مع دعم المحتوى المخصص */}
          {articlesLoading || personalizedLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className={`text-sm ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400 dark:text-gray-500'}`}>جاري تحميل المقالات...</p>
              </div>
            </div>
          ) : (
            <>
              {/* رسالة للمستخدمين المسجلين مع اهتمامات */}
              {isLoggedIn && userInterests.length > 0 && showPersonalized && (
                <div className={`mb-6 p-4 rounded-xl flex items-center justify-between ${
                  darkMode 
                    ? 'bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-800/30' 
                    : 'bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <Sparkles className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      يتم عرض المحتوى بناءً على اهتماماتك: {userInterests.map(interestId => {
                        // البحث عن اسم الفئة من قائمة الفئات المحملة
                        const category = categories.find(cat => cat.id === interestId);
                        return category ? (category.name_ar || category.name) : '';
                      }).filter(name => name).join(' • ')}
                    </p>
                  </div>
                  <Link 
                    href="/welcome/preferences"
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      darkMode 
                        ? 'bg-purple-800/30 hover:bg-purple-700/40 text-purple-300' 
                        : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
                    }`}
                  >
                    <Settings className="w-3 h-3" />
                    تعديل
                  </Link>
                </div>
              )}
              {/* رسالة للمستخدمين غير المسجلين */}
              {!isLoggedIn && (
                <div className={`mb-6 p-4 rounded-xl text-center ${
                  darkMode 
                    ? 'bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-800/30' 
                    : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'
                }`}>
                  <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    🎯 سجل دخولك للحصول على محتوى مخصص حسب اهتماماتك
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <Link 
                      href="/register"
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-all transform hover:scale-105"
                    >
                      إنشاء حساب
                    </Link>
                    <Link 
                      href="/login"
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                        darkMode 
                          ? 'border-gray-600 hover:border-gray-500 text-gray-300 hover:bg-gray-800' 
                          : 'border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      تسجيل دخول
                    </Link>
                  </div>
                </div>
              )}

              {/* عرض المقالات - مع البطاقات المخصصة الذكية */}
              {(showPersonalized && personalizedArticles.length > 0) ? (
                // عرض المقالات المخصصة للمستخدمين المسجلين مع البطاقات الذكية
                isMobileView ? (
                  // عرض الموبايل - قائمة عمودية مع البطاقات المخصصة
                  <div className="space-y-3">
                    {renderMixedContent(personalizedArticles.slice(0, 15)).map((element, idx) => {
                      // إضافة شارة "مخصص" للبطاقات العادية فقط
                      if (element.key && !element.key.toString().includes('smart')) {
                        return (
                          <div key={element.key} className="relative">
                            {element}
                            {/* شارة "مخصص لك" */}
                            <div className="absolute top-2 left-2 z-10">
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-bold bg-purple-500/90 text-white">
                                <Sparkles className="w-3 h-3" />
                                مخصص
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return element;
                    })}
                  </div>
                ) : (
                  // عرض الديسكتوب - شبكة مع البطاقات المخصصة
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                    {renderMixedContent(personalizedArticles.slice(0, 16)).map((element, idx) => {
                      // إضافة شارة "مخصص" للبطاقات العادية فقط
                      if (element.key && !element.key.toString().includes('smart')) {
                        return (
                          <div key={element.key} className="relative">
                            {/* شارة "مخصص لك" */}
                            <div className="absolute top-2 left-2 z-10">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${
                                darkMode 
                                  ? 'bg-purple-900/80 text-purple-200' 
                                  : 'bg-purple-500/90 text-white'
                              }`}>
                                <Sparkles className="w-3 h-3" />
                                مخصص
                              </span>
                            </div>
                            {element}
                          </div>
                        );
                      }
                      return element;
                    })}
                  </div>
                )
              ) : articles.length > 0 ? (
                // عرض آخر المقالات للزوار أو المستخدمين بدون تفضيلات - مع البطاقات المخصصة
                isMobileView ? (
                  // عرض الموبايل - قائمة عمودية مع البطاقات المخصصة
                  <div className="space-y-3">
                    {renderMixedContent(articles.slice(0, 15))}
                  </div>
                ) : (
                  // عرض الديسكتوب - شبكة مع البطاقات المخصصة
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                    {renderMixedContent(articles.slice(0, 16))}
                  </div>
                )
              ) : (
                // لا توجد مقالات
                <div className={`text-center py-20 ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>
                  <Newspaper className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">لا توجد مقالات منشورة حالياً</p>
                  <p className="text-sm">تحقق لاحقاً للحصول على آخر الأخبار والمقالات</p>
                </div>
              )}
              
              {/* زر عرض الكل في الأسفل - جديد */}
              {((showPersonalized && personalizedArticles.length > 0) || articles.length > 0) && (
                <div className="flex items-center justify-center mt-12">
                  <Link 
                    href="/for-you"
                    className="group inline-flex items-center gap-2 px-8 py-3 rounded-full text-base font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                    <span>المزيد من الأخبار</span>
                    <ArrowLeft className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* 7. مقترب (زاوية تحليلية) 📝 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <MuqtarabBlock />
      </div>

      {/* 8. التحليل العميق (Deep Analysis) 🧠 */}
      {/* Deep Analysis Block - بلوك التحليل العميق - خارج main للامتداد الكامل */}
      <section className="relative w-full bg-[#1a365d] dark:bg-[#0d1b2a] py-16 mb-16">
        {/* خلفية متدرجة overlay تمتد بالكامل */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 via-indigo-900/90 to-purple-900/95 dark:from-gray-900/95 dark:via-blue-900/90 dark:to-indigo-900/95"></div>
        
        {/* المحتوى داخل container محدود */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
              🧠 تحليل عميق بالذكاء الاصطناعي
            </h2>
            <p className="text-lg sm:text-xl max-w-2xl mx-auto text-blue-100">
              استكشف تحليلات عميقة ومتطورة للموضوعات المهمة مدعومة بالذكاء الاصطناعي
            </p>
          </div>
        </div>
        
        {/* بلوك المحتوى - خلفية ممتدة بالكامل */}
        <div className="relative z-10 w-full">
          <DeepAnalysisBlock 
            maxItems={3} 
            showTitle={false} 
            insights={initialDeepAnalyses as any}
          />
        </div>
      </section>

      {/* 9. قادة الرأي (Opinion Leaders) 👥 */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <TodayOpinionsSection darkMode={darkMode} />
      </main>

      {/* 10. الرحلة المعرفية (Knowledge Journey) 🎓 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <SmartSlot position="below_personalized" />
      </div>
      
      {/* Smart Blocks إضافية */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SmartSlot position="above_footer" />
      </div>
      
      {/* بلوك "ليلة هادئة" - فوق الـ footer */}
      <FooterDashboard />

      {/* 11. الفوتر (Footer) 🏁 */}
      <Footer />
      </div>
    </PageWrapper>
  );
}

// Export with client-side wrapper to ensure ThemeProvider is available
export default function PageClient({ 
  initialArticles = [], 
  initialCategories = [],
  initialStats = {
    activeReaders: null,
    dailyArticles: null,
    loading: false
  },
  initialDeepAnalyses = []
}: PageClientProps) {
  const [stats, setStats] = useState(initialStats);

  // استخدام الإحصائيات الأولية
  useEffect(() => {
    if (initialStats && initialStats.loading === false) {
      setStats(initialStats);
    }
  }, [initialStats]);

  return <NewspaperHomePage 
    stats={stats} 
    initialArticles={initialArticles}
    initialCategories={initialCategories}
    initialDeepAnalyses={initialDeepAnalyses}
  />;
}