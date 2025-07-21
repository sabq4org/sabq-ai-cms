'use client';

/**
 * 🎯 نظام التوصيات الذكي المتطور - SmartRecommendationBlock
 * 
 * النظام الجديد يكسر الرتابة البصرية من خلال:
 * 
 * 🔄 نمط التبديل الذكي:
 * - دورة تكرار كل 6 عناصر (index % 6)
 * - العناصر 0,1,2 = بطاقات كاملة مع صور
 * - العناصر 3,4,5 = روابط سريعة مدمجة
 * 
 * 🏷️ تصنيف المحتوى المتقدم:
 * - 📰 أخبار عادية: تتبع دورة التبديل
 * - 🧠 تحليلات عميقة: بطاقات كاملة دائماً (أولوية عالية)
 * - ✍️ مقالات رأي: بطاقات كاملة دائماً (أولوية عالية)
 * 
 * 📱💻 استجابة متقدمة:
 * - الهواتف: تنويع مُحسَّن مع الحفاظ على الأداء
 * - الديسكتوب: تنويع كامل مع إبراز المحتوى المميز
 * 
 * 🧠 ذكاء اصطناعي:
 * - تحليل العناوين والمحتوى لتصنيف نوع المقال
 * - كلمات مفتاحية ذكية للتمييز بين الأنواع
 * - عرض تفضيلات المستخدم ديناميكياً
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, User, TrendingUp, Lightbulb, FileText, Eye, Edit, Loader2, AlertCircle } from 'lucide-react';

interface SmartRecommendation {
  id: string;
  title: string;
  summary?: string;
  slug: string;
  type: 'news' | 'analysis' | 'opinion' | 'question' | 'tip';
  badge: string;
  featuredImage?: string;
  author?: string;
  readTime?: number;
  views?: number;
  category?: string;
  publishedAt?: string;
}

interface SmartRecommendationBlockProps {
  articleId: string;
  category?: string;
  tags?: string[];
  className?: string;
}

const getBadgeIcon = (type: string) => {
  switch (type) {
    case 'news':
      return '📰';
    case 'analysis':
      return '🧠';
    case 'opinion':
      return '✍️';
    case 'question':
      return '💬';
    case 'tip':
      return '💡';
    default:
      return '📝';
  }
};

const getBadgeColor = (type: string) => {
  switch (type) {
    case 'news':
      return 'bg-blue-100 text-blue-800';
    case 'analysis':
      return 'bg-purple-100 text-purple-800';
    case 'opinion':
      return 'bg-green-100 text-green-800';
    case 'question':
      return 'bg-orange-100 text-orange-800';
    case 'tip':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatTimeAgo = (publishedAt: string): string => {
  try {
    const date = new Date(publishedAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `منذ ${diffInMinutes} دقيقة`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `منذ ${hours} ساعة`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `منذ ${days} يوم`;
    }
  } catch {
    return 'حديثاً';
  }
};

// بطاقة كاملة للأخبار (للعرض العادي)
const RecommendationCard: React.FC<{ recommendation: SmartRecommendation; isMobile: boolean }> = ({ recommendation, isMobile }) => (
  <Link href={`/article/${recommendation.slug}`} className="group block">
    <article className={`recommendation-card bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-blue-200 ${
      isMobile ? 'mx-4 mb-4' : 'mb-6'
    }`}>
      {recommendation.featuredImage && (
        <div className={`relative overflow-hidden ${isMobile ? 'h-40' : 'h-48'}`}>
          <Image
            src={recommendation.featuredImage}
            alt={recommendation.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(recommendation.type)}`}>
              <span className="ml-1">{getBadgeIcon(recommendation.type)}</span>
              {recommendation.badge}
            </span>
          </div>
        </div>
      )}
      
      <div className={`${isMobile ? 'p-3' : 'p-4'}`}>
        <h3 className={`font-bold text-gray-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors ${
          isMobile ? 'text-base' : 'text-lg'
        }`}>
          {recommendation.title}
        </h3>
        
        {recommendation.summary && (
          <p className={`text-gray-600 leading-relaxed mb-3 line-clamp-2 ${
            isMobile ? 'text-sm' : 'text-sm'
          }`}>
            {recommendation.summary}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-reverse space-x-4">
            {recommendation.author && (
              <div className="flex items-center">
                <User className="w-3 h-3 ml-1" />
                <span>{recommendation.author}</span>
              </div>
            )}
            {recommendation.readTime && (
              <div className="flex items-center">
                <Clock className="w-3 h-3 ml-1" />
                <span>{recommendation.readTime} دقائق</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-reverse space-x-3">
            {recommendation.views && (
              <div className="flex items-center">
                <Eye className="w-3 h-3 ml-1" />
                <span>{recommendation.views.toLocaleString()}</span>
              </div>
            )}
            {recommendation.publishedAt && (
              <span>{formatTimeAgo(recommendation.publishedAt)}</span>
            )}
          </div>
        </div>
      </div>
    </article>
  </Link>
);

// رابط سريع للموبايل (بدون صورة)
const QuickLinkMobile: React.FC<{ recommendation: SmartRecommendation }> = ({ recommendation }) => (
  <Link href={`/article/${recommendation.slug}`} className="group block mx-4 mb-3">
    <div className="quick-link-mobile bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 border-r-4 border-blue-400 hover:from-blue-50 hover:to-blue-100 hover:border-blue-600 transition-all duration-300 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <span className="text-lg ml-2">{getBadgeIcon(recommendation.type)}</span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(recommendation.type)}`}>
              {recommendation.badge}
            </span>
          </div>
          <h4 className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-blue-600 transition-colors mb-2">
            {recommendation.title}
          </h4>
          <div className="flex items-center space-x-reverse space-x-4 text-xs text-gray-500">
            {recommendation.author && (
              <div className="flex items-center">
                <User className="w-3 h-3 ml-1" />
                <span>{recommendation.author}</span>
              </div>
            )}
            {recommendation.readTime && (
              <div className="flex items-center">
                <Clock className="w-3 h-3 ml-1" />
                <span>{recommendation.readTime} د</span>
              </div>
            )}
            {recommendation.category && (
              <span className="bg-gray-200 px-2 py-1 rounded text-xs">{recommendation.category}</span>
            )}
          </div>
        </div>
        <div className="flex items-center text-blue-600 group-hover:text-blue-800 transition-colors">
          <TrendingUp className="w-4 h-4" />
        </div>
      </div>
    </div>
  </Link>
);

// رابط سريع للديسكتوب (النسخة الأصلية)
const QuickLinkDesktop: React.FC<{ recommendation: SmartRecommendation }> = ({ recommendation }) => (
  <Link href={`/article/${recommendation.slug}`} className="group block">
    <div className="quick-link bg-gray-50 rounded-lg p-4 border-r-4 border-blue-400 hover:bg-blue-50 hover:border-blue-600 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <span className="text-lg ml-2">{getBadgeIcon(recommendation.type)}</span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(recommendation.type)}`}>
              {recommendation.badge}
            </span>
          </div>
          <h4 className="font-semibold text-gray-900 text-base leading-tight group-hover:text-blue-600 transition-colors mb-2">
            {recommendation.title}
          </h4>
          <div className="flex items-center space-x-reverse space-x-4 text-xs text-gray-500">
            {recommendation.author && (
              <div className="flex items-center">
                <User className="w-3 h-3 ml-1" />
                <span>{recommendation.author}</span>
              </div>
            )}
            {recommendation.readTime && (
              <div className="flex items-center">
                <Clock className="w-3 h-3 ml-1" />
                <span>{recommendation.readTime} دقائق</span>
              </div>
            )}
            {recommendation.category && (
              <span className="bg-gray-200 px-2 py-1 rounded">{recommendation.category}</span>
            )}
          </div>
        </div>
        <div className="flex items-center text-blue-600 group-hover:text-blue-800 transition-colors">
          <TrendingUp className="w-4 h-4" />
        </div>
      </div>
    </div>
  </Link>
);

const SmartRecommendationBlock: React.FC<SmartRecommendationBlockProps> = ({ 
  articleId, 
  category,
  tags = [],
  className = '' 
}) => {
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // التحقق من حجم الشاشة
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [articleId, category, tags]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/articles/${articleId}/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          tags,
          limit: 8
        })
      });

      if (!response.ok) {
        throw new Error('فشل في جلب التوصيات');
      }

      const data = await response.json();
      
      if (data.success && data.recommendations) {
        const formattedRecommendations: SmartRecommendation[] = data.recommendations.map((item: any) => ({
          id: item.id,
          title: item.title,
          summary: item.excerpt || item.summary,
          slug: item.slug,
          type: determineType(item),
          badge: getBadgeText(item),
          featuredImage: item.featured_image || item.featuredImage,
          author: item.author?.name || item.author_name,
          readTime: item.reading_time || calculateReadTime(item.content),
          views: item.views || item.views_count,
          category: item.category?.name || item.category_name,
          publishedAt: item.published_at || item.created_at
        }));

        setRecommendations(formattedRecommendations);
      } else {
        setRecommendations([]);
      }
    } catch (err) {
      console.error('خطأ في جلب التوصيات:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const determineType = (item: any): SmartRecommendation['type'] => {
    // 🏷️ تصنيف ذكي للمحتوى حسب أولويات مختلفة
    const title = item.title?.toLowerCase() || '';
    const category = item.category_name?.toLowerCase() || item.category?.name?.toLowerCase() || '';
    const content = item.content?.toLowerCase() || item.excerpt?.toLowerCase() || '';
    
    // أولوية أولى: نوع صريح محدد
    if (item.type === 'analysis' || item.type === 'opinion') return item.type;
    
    // أولوية ثانية: اسم الفئة
    if (category.includes('تحليل') || category.includes('عميق')) return 'analysis';
    if (category.includes('رأي') || category.includes('مقال')) return 'opinion';
    
    // أولوية ثالثة: كلمات مفتاحية في العنوان والمحتوى
    const analysisKeywords = ['تحليل', 'دراسة', 'بحث', 'تقرير', 'إحصائية', 'استطلاع'];
    const opinionKeywords = ['رأي', 'وجهة نظر', 'تعليق', 'مقال', 'كاتب'];
    
    if (analysisKeywords.some(keyword => title.includes(keyword) || content.includes(keyword))) {
      return 'analysis';
    }
    
    if (opinionKeywords.some(keyword => title.includes(keyword) || content.includes(keyword))) {
      return 'opinion';
    }
    
    // افتراضي: أخبار عادية
    return 'news';
  };

  const getBadgeText = (item: any): string => {
    const type = determineType(item);
    switch (type) {
      case 'analysis': 
        return '🧠 تحليل عميق';
      case 'opinion': 
        return '✍️ مقال رأي';
      default: 
        return '📰 أخبار مشابهة';
    }
  };

  const calculateReadTime = (content: string): number => {
    if (!content) return 3;
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  // 🎯 نظام التنويع البصري المتطور - يكسر الرتابة ويحسن التفاعل
  const renderItem = (recommendation: SmartRecommendation, index: number) => {
    const cyclePosition = index % 6;
    const isSpecialContent = recommendation.type === 'analysis' || recommendation.type === 'opinion';
    
    if (isMobile) {
      // 📱 نمط الهواتف: تنويع ذكي مع إعطاء أولوية للمحتوى الخاص
      if (isSpecialContent) {
        // المحتوى الخاص (تحليل/رأي) يظهر دائماً كبطاقة كاملة
        return (
          <div key={recommendation.id}>
            <RecommendationCard recommendation={recommendation} isMobile={true} />
          </div>
        );
      }
      
      // للأخبار العادية: دورة التنويع (3 بطاقات كاملة + 3 روابط سريعة)
      if (cyclePosition < 3) {
        return (
          <div key={recommendation.id}>
            <RecommendationCard recommendation={recommendation} isMobile={true} />
          </div>
        );
      } else {
        return (
          <div key={recommendation.id}>
            <QuickLinkMobile recommendation={recommendation} />
          </div>
        );
      }
    } else {
      // 🖥️ نمط الديسكتوب: تنويع متقدم مع توزيع ذكي
      if (isSpecialContent) {
        // المحتوى الخاص يظهر كبطاقة كاملة لجذب الانتباه
        return (
          <div key={recommendation.id} className="mb-6">
            <RecommendationCard recommendation={recommendation} isMobile={false} />
          </div>
        );
      }
      
      // للأخبار العادية: نمط التبديل الذكي
      // العناصر 0,1,2 = بطاقات كاملة | العناصر 3,4,5 = روابط سريعة
      if (cyclePosition < 3) {
        return (
          <div key={recommendation.id} className="mb-6">
            <RecommendationCard recommendation={recommendation} isMobile={false} />
          </div>
        );
      } else {
        return (
          <div key={recommendation.id} className="mb-4">
            <QuickLinkDesktop recommendation={recommendation} />
          </div>
        );
      }
    }
  };

  const containerClasses = isMobile 
    ? 'smart-recommendation-block bg-white border-0 shadow-lg mx-0 rounded-2xl' 
    : `smart-recommendation-block bg-white rounded-xl border border-gray-200 p-6 ${className}`;

  const headerClasses = isMobile
    ? 'text-center mb-4 pt-6 px-4'
    : 'text-center mb-6';

  if (loading) {
    return (
      <section className={containerClasses}>
        <div className={headerClasses}>
          <div className="flex items-center justify-center mb-3">
            <Lightbulb className="w-6 h-6 text-blue-600 ml-2 animate-pulse" />
            <h2 className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
              🎯 محتوى مخصص لك
            </h2>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 rounded-xl border border-blue-100">
            <p className="text-sm text-gray-700 text-center flex items-center justify-center">
              <span className="ml-2">🧠</span>
              <span className="font-medium">يتم توليد هذا المحتوى بناءً على اهتماماتك وتفاعلاتك</span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="text-gray-600">جاري تحليل تفضيلاتك...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={containerClasses}>
        <div className={headerClasses}>
          <div className="flex items-center justify-center mb-3">
            <Lightbulb className="w-6 h-6 text-blue-600 ml-2" />
            <h2 className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
              🎯 محتوى مخصص لك
            </h2>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <button
            onClick={fetchRecommendations}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            <span>🔄</span>
            إعادة المحاولة
          </button>
        </div>
      </section>
    );
  }

  if (recommendations.length === 0) {
    return (
      <section className={containerClasses}>
        <div className={headerClasses}>
          <div className="flex items-center justify-center mb-3">
            <Lightbulb className="w-6 h-6 text-blue-600 ml-2" />
            <h2 className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
              🎯 محتوى مخصص لك
            </h2>
          </div>
        </div>

        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">لا توجد توصيات متاحة حالياً</p>
          <p className="text-sm text-gray-500">تفاعل مع المزيد من المحتوى لتحسين توصياتك 📈</p>
        </div>
      </section>
    );
  }

  return (
    <section className={containerClasses}>
      <div className={headerClasses}>
        <div className="flex items-center justify-center mb-3">
          <Lightbulb className="w-6 h-6 text-blue-600 ml-2 animate-pulse" />
          <h2 className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            🎯 محتوى مخصص لك
          </h2>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 rounded-xl border border-blue-100">
          <p className="text-sm text-gray-700 text-center flex items-center justify-center">
            <span className="ml-2">🧠</span>
            <span className="font-medium">يتم توليد هذا المحتوى بناءً على اهتماماتك وتفاعلاتك</span>
          </p>
          <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
            <span className="flex items-center ml-3">
              📰 <span className="mr-1">أخبار</span>
            </span>
            <span className="flex items-center ml-3">
              🧠 <span className="mr-1">تحليلات</span>
            </span>
            <span className="flex items-center">
              ✍️ <span className="mr-1">آراء</span>
            </span>
          </div>
        </div>
      </div>

      <div className={isMobile ? 'space-y-0 pb-6' : 'space-y-0'}>
        {recommendations.map((recommendation, index) => 
          renderItem(recommendation, index)
        )}
      </div>

      {!isMobile && (
        <div className="text-center mt-8 pt-6 border-t border-gray-200">
          <Link 
            href="/for-you" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <FileText className="w-4 h-4 ml-2" />
            عرض المزيد من التوصيات
            <TrendingUp className="w-4 h-4 mr-2" />
          </Link>
        </div>
      )}
    </section>
  );
};

export default SmartRecommendationBlock; 