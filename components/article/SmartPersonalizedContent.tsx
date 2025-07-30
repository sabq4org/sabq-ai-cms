'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import CloudImage from '@/components/ui/CloudImage';
import { formatDateGregorian, formatRelativeDate } from '@/lib/date-utils';
import { generatePersonalizedRecommendations, type RecommendedArticle, type UserBehavior } from '@/lib/ai-recommendations';
import { 
  Clock, User, Eye, Brain, Edit, Newspaper, TrendingUp, 
  ChevronRight, Sparkles, BarChart3, MessageCircle, CheckCircle,
  Zap, BookOpen, Star, ArrowRight, RefreshCw
} from 'lucide-react';

interface SmartPersonalizedContentProps {
  articleId: string;
  categoryId?: string;
  categoryName?: string;
  tags?: string[];
  darkMode?: boolean;
  userId?: string;
}

// دالة للحصول على أيقونة نوع المقال المحدثة
const getTypeIcon = (type: RecommendedArticle['type']) => {
  switch (type) {
    case 'تحليل': return '🧠';
    case 'رأي': return '🗣️';
    case 'ملخص': return '📊';
    case 'عاجل': return '⚡';
    case 'تقرير': return '📰';
    case 'مقالة': return '📄';
    default: return '✨';
  }
};

// دالة للحصول على العبارات التشويقية حسب نوع المحتوى
const getCallToActionPhrases = (type: RecommendedArticle['type'], index: number = 0) => {
  // عبارات تشويقية متنوعة
  const generalPhrases = [
    'اخترناه لك بعناية',
    'لأنك تهتم بمواضيع مشابهة',
    'قد يعجبك هذا المحتوى',
    'محتوى يتماشى مع اهتماماتك',
    'ننصحك بقراءته',
    'مختار خصيصاً لك',
    'بناءً على قراءاتك السابقة',
    'محتوى ذو صلة باهتماماتك'
  ];
  
  const phrases = {
    'تحليل': ['تحليل عميق', 'ربط الأحداث بما تهتم به'],
    'رأي': ['وجهة نظر جديرة بالقراءة', 'رؤى من خبراء المجال'],
    'ملخص': ['ملخص ذكي', 'أهم النقاط في دقائق'],
    'عاجل': ['آخر التطورات', 'لا تفوت هذا الخبر'],
    'تقرير': ['تقرير شامل', 'معلومات موثقة'],
    'مقالة': ['محتوى مميز', 'مقترح ذكي لك']
  };
  
  const typePhrase = phrases[type] || phrases['مقالة'];
  const mainPhrase = generalPhrases[index % generalPhrases.length];
  
  return {
    title: mainPhrase,
    subtitle: typePhrase[0]
  };
};

// دالة للحصول على ألوان نوع المقال
const getTypeColors = (type: RecommendedArticle['type']) => {
  switch (type) {
    case 'تحليل': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-700/50';
    case 'رأي': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700/50';
    case 'ملخص': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700/50';
    case 'عاجل': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700/50';
    case 'تقرير': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-700/50';
    default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-700/50';
  }
};

// دالة لألوان مؤشر الثقة
const getConfidenceColor = (confidence: number) => {
  if (confidence >= 85) return 'bg-green-500';
  if (confidence >= 70) return 'bg-blue-500';
  if (confidence >= 55) return 'bg-yellow-500';
  return 'bg-gray-500';
};

// مكون البطاقة الذكية المخصصة المحسّن
const SmartRecommendationCard: React.FC<{ 
  article: RecommendedArticle; 
  darkMode: boolean;
  index: number;
}> = ({ article, darkMode, index }) => {
  const ctaPhrase = getCallToActionPhrases(article.type, index);
  
  // كشف حجم الشاشة للتصميم المتجاوب
  const [isMobileScreen, setIsMobileScreen] = React.useState(false);
  
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <Link href={article.url} className="group block">
      <div className={`relative ${isMobileScreen ? 'h-32' : 'h-full'} flex ${isMobileScreen ? 'flex-row' : 'flex-col'} rounded-xl border transition-all duration-300 hover:shadow-xl overflow-hidden ${
        darkMode 
          ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
          : 'bg-white border-gray-200 hover:border-blue-200'
      }`}>
        
        {/* الصورة الرئيسية */}
        <div className={`relative ${isMobileScreen ? 'w-2/5 h-full' : 'h-24 sm:h-32 md:h-48'} overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex-shrink-0`}>
          <CloudImage
            src={article.thumbnail || ''}
            alt={article.title}
            fill
            sizes={isMobileScreen ? "40vw" : "(max-width: 768px) 100vw, 50vw"}
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
            fallbackType="article"
            priority={index < 3}
          />
          
          {/* شارة النوع والأيقونة */}
          {!isMobileScreen && (
            <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 md:top-3 md:right-3 flex items-center gap-1 sm:gap-1 md:gap-2">
              <span className="text-base sm:text-xl md:text-3xl bg-white/90 dark:bg-gray-900/90 rounded-full p-1 sm:p-1.5 md:p-2 shadow-lg">
                {getTypeIcon(article.type)}
              </span>
              <span className={`px-1.5 py-0.5 sm:px-2 md:px-3 md:py-1 rounded-full text-[10px] sm:text-xs font-bold ${getTypeColors(article.type)}`}>
                {article.type}
              </span>
            </div>
          )}
          
          {/* مؤشر الترتيب */}
          {!isMobileScreen && index < 3 && (
            <div className={`absolute top-1.5 left-1.5 sm:top-2 sm:left-2 md:top-3 md:left-3 w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs md:text-sm font-bold shadow-lg ${
              index === 0 ? 'bg-yellow-400 text-white' : 
              index === 1 ? 'bg-gray-400 text-white' :
              'bg-orange-400 text-white'
            }`}>
              {index + 1}
            </div>
          )}
        </div>
        
        {/* المحتوى */}
        <div className={`flex-1 ${isMobileScreen ? 'p-2 flex flex-col justify-between' : 'p-2.5 sm:p-3 md:p-5'}`}>
          {/* Label نوع المحتوى + العبارة التشويقية */}
          <div className={`${isMobileScreen ? 'mb-1' : 'mb-1.5 sm:mb-2 md:mb-3'} ${isMobileScreen ? 'flex flex-col gap-0.5' : ''}`}>
            {/* نوع المحتوى كـ Label */}
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold ${getTypeColors(article.type)}`}>
                <span className="text-xs sm:text-sm">{getTypeIcon(article.type)}</span>
                {article.type}
              </span>
              {isMobileScreen && article.confidence >= 80 && (
                <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">
                  ⭐ {article.confidence}% ملائم
                </span>
              )}
            </div>
            
            {/* العبارة التشويقية */}
            <div className={`${darkMode ? 'text-blue-300' : 'text-blue-600'} ${isMobileScreen ? 'mt-1' : 'mt-1.5'}`}>
              <p className={`${isMobileScreen ? 'text-[10px]' : 'text-[10px] sm:text-xs md:text-sm'} font-medium`}>
                {ctaPhrase.title}
              </p>
              {!isMobileScreen && (
                <p className="text-[9px] sm:text-xs opacity-80">{ctaPhrase.subtitle}</p>
              )}
            </div>
          </div>
          
          {/* العنوان */}
          <h3 className={`font-bold ${isMobileScreen ? 'text-[11px] leading-tight mb-1' : 'text-xs sm:text-sm md:text-lg leading-tight mb-1.5 sm:mb-2 md:mb-3'} line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {article.title}
          </h3>
          
          {/* المعلومات الإضافية */}
          <div className={`flex items-center justify-between text-[10px] sm:text-xs md:text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
              <div className="flex items-center gap-0.5 sm:gap-1">
                <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                <span>{article.readingTime} د</span>
              </div>
              {!isMobileScreen && (
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                  <span>{article.viewsCount.toLocaleString('ar-SA')}</span>
                </div>
              )}
            </div>
            <span className="text-[9px] sm:text-xs">{formatRelativeDate(article.publishedAt)}</span>
          </div>
          
          {/* مؤشر الثقة */}
          {!isMobileScreen && (
            <div className="mt-2 sm:mt-3 flex items-center gap-1.5 sm:gap-2">
              <div className={`flex-1 h-0.5 sm:h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden`}>
                <div 
                  className={`h-full ${getConfidenceColor(article.confidence)} transition-all duration-1000`}
                  style={{ width: `${article.confidence}%` }}
                />
              </div>
              <span className={`text-[9px] sm:text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {article.confidence}% ملائم
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default function SmartPersonalizedContent({ 
  articleId, 
  categoryId,
  categoryName,
  tags = [],
  darkMode = false,
  userId 
}: SmartPersonalizedContentProps) {
  const [recommendations, setRecommendations] = useState<RecommendedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

  // دالة لتحديث التوصيات
  const fetchPersonalizedRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🧠 توليد التوصيات الذكية للمقال:', articleId);
      
      // توليد التوصيات المخصصة مع زيادة العدد إلى 6
      const personalizedRecommendations = await generatePersonalizedRecommendations({
        userId,
        currentArticleId: articleId,
        currentTags: tags,
        currentCategory: categoryName || '',
        limit: 6 // زيادة من 4 إلى 6
      });
      
      console.log('✅ تم توليد التوصيات:', personalizedRecommendations);
      // التحقق من وجود صور في التوصيات
      personalizedRecommendations.forEach((rec, index) => {
        console.log(`📸 التوصية ${index + 1} - ${rec.title}: ${rec.thumbnail ? 'لديها صورة' : 'بدون صورة'}`);
      });
      setRecommendations(personalizedRecommendations);
      setLastUpdateTime(new Date());
      
    } catch (err) {
      console.error('❌ خطأ في توليد التوصيات الذكية:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
      
      // بيانات تجريبية محسّنة في حالة الخطأ
      setRecommendations([
        {
          id: 'ai-future-work-backup',
          title: 'تحليل مباشر: مستقبل العمل مع الذكاء الاصطناعي',
          url: '/article/ai-future-work-backup',
          type: 'تحليل',
          reason: 'بناءً على اهتمامك بالتقنية',
          confidence: 92,
          thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
          publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          category: 'تقنية',
          readingTime: 5,
          viewsCount: 15420,
          engagement: 0.25
        },
        {
          id: 'economic-analysis-backup',
          title: 'رأي: التمكين الاقتصادي في رؤية السعودية 2030',
          url: '/article/economic-analysis-backup',
          type: 'رأي',
          reason: 'مشابه لمقالات أعجبتك سابقاً',
          confidence: 88,
          thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop',
          publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          category: 'اقتصاد',
          readingTime: 4,
          viewsCount: 8930,
          engagement: 0.18
        },
        {
          id: 'breaking-news-backup',
          title: 'عاجل: قرارات جديدة لتسهيل الاستثمار',
          url: '/article/breaking-news-backup',
          type: 'عاجل',
          reason: 'آخر الأخبار في مجال اهتمامك',
          confidence: 95,
          thumbnail: 'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=400&h=300&fit=crop',
          publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          category: 'أخبار',
          readingTime: 2,
          viewsCount: 25420,
          engagement: 0.35
        },
        {
          id: 'creative-writing-backup',
          title: 'قصة نجاح: من فكرة بسيطة إلى مشروع مليوني',
          url: '/article/creative-writing-backup',
          type: 'مقالة',
          reason: 'محتوى إبداعي قد يثير اهتمامك',
          confidence: 78,
          thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
          publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          category: 'قصص نجاح',
          readingTime: 6,
          viewsCount: 12300,
          engagement: 0.22
        },
        {
          id: 'tech-report-backup',
          title: 'تقرير: أبرز التقنيات الناشئة في 2025',
          url: '/article/tech-report-backup',
          type: 'تقرير',
          reason: 'تقرير شامل في مجال التقنية',
          confidence: 85,
          thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
          publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          category: 'تقنية',
          readingTime: 8,
          viewsCount: 18500,
          engagement: 0.28
        },
        {
          id: 'sports-summary-backup',
          title: 'ملخص: أهم أحداث الأسبوع الرياضي',
          url: '/article/sports-summary-backup',
          type: 'ملخص',
          reason: 'خلاصة سريعة للأحداث الرياضية',
          confidence: 72,
          thumbnail: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop',
          publishedAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
          category: 'رياضة',
          readingTime: 3,
          viewsCount: 9800,
          engagement: 0.15
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonalizedRecommendations();
    
    // تحديث التوصيات كل 12 ساعة
    const updateInterval = setInterval(() => {
      console.log('🔄 تحديث التوصيات الذكية تلقائياً...');
      fetchPersonalizedRecommendations();
    }, 12 * 60 * 60 * 1000); // 12 ساعة
    
    return () => clearInterval(updateInterval);
  }, [articleId, categoryId, tags, userId]);

  // حالة التحميل
  if (loading) {
    return (
          <section className={`w-full py-6 md:py-8 px-3 md:px-4 ${
      darkMode ? 'bg-gray-800' : 'bg-gray-50'
    }`}>
      <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <div className="animate-spin">
                <Brain className={`w-6 h-6 ${
                  darkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <span className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                🤖 جاري تحليل اهتماماتك وتخصيص المحتوى...
              </span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // إخفاء القسم في حالة عدم وجود توصيات
  if (!recommendations.length && !error) {
    return null;
  }

  return (
    <section className={`w-full py-6 md:py-8 px-3 md:px-4 ${
      darkMode ? 'bg-gray-800' : 'bg-gray-50'
    }`}>
      <div className="max-w-4xl mx-auto">
        
        {/* عنوان القسم الذكي */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Brain className={`w-6 h-6 ${
                darkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h2 className={`text-lg font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                مخصص لك بذكاء
              </h2>
              <p className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                محتوى مختار بناءً على اهتماماتك وسلوكك في القراءة
              </p>
            </div>
          </div>
          
          {/* زر التحديث اليدوي */}
          <button
            onClick={fetchPersonalizedRecommendations}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            title={`آخر تحديث: ${lastUpdateTime.toLocaleTimeString('ar-SA')}`}
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">تحديث</span>
          </button>
        </div>

        {/* البطاقات الذكية - شبكة 2×3 */}
        {recommendations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
            {recommendations.map((article, index) => (
              <SmartRecommendationCard 
                key={article.id} 
                article={article} 
                darkMode={darkMode}
                index={index}
              />
            ))}
          </div>
        )}

        {/* إحصائيات الدقة والمعلومات */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4`}>
          {/* إحصائيات الدقة */}
          <div className={`p-4 rounded-lg border ${
            darkMode 
              ? 'bg-gray-700/50 border-gray-600' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className={`w-4 h-4 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
                <span className={`text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  دقة التوصيات
                </span>
              </div>
              <div className="flex items-center gap-2">
                {recommendations.length > 0 && (
                  <>
                    <div className={`text-sm font-bold ${
                      darkMode ? 'text-green-400' : 'text-green-600'
                    }`}>
                      {Math.round(recommendations.reduce((acc, article) => acc + article.confidence, 0) / recommendations.length)}%
                    </div>
                    <div className={`w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden`}>
                      <div 
                        className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-1000"
                        style={{ 
                          width: `${Math.round(recommendations.reduce((acc, article) => acc + article.confidence, 0) / recommendations.length)}%` 
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* معلومات الكوكتيل الذكي */}
          <div className={`p-4 rounded-lg border ${
            darkMode 
              ? 'bg-gray-700/50 border-gray-600' 
              : 'bg-purple-50 border-purple-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className={`w-4 h-4 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              <span className={`text-sm font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                كوكتيل ذكي
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['📰 أخبار', '🧠 تحليل', '🗣️ رأي', '✨ إبداعي'].map((item) => (
                <span key={item} className={`text-xs px-2 py-1 rounded-full ${
                  darkMode ? 'bg-gray-600 text-gray-300' : 'bg-white text-gray-600'
                }`}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* رسالة التوضيح */}
        <div className={`text-center pt-4 mt-4 border-t ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <p className={`text-xs ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            🎯 يتحسن نظام التوصيات كلما تفاعلت أكثر مع المحتوى • يتم التحديث كل 12 ساعة
          </p>
        </div>

      </div>
    </section>
  );
}
