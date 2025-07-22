'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDateGregorian, formatRelativeDate } from '@/lib/date-utils';
import { generatePersonalizedRecommendations, type RecommendedArticle, type UserBehavior } from '@/lib/ai-recommendations';
import { 
  Clock, User, Eye, Brain, Edit, Newspaper, TrendingUp, 
  ChevronRight, Sparkles, BarChart3, MessageCircle, CheckCircle,
  Zap, BookOpen, Star, ArrowRight
} from 'lucide-react';

interface SmartPersonalizedContentProps {
  articleId: string;
  categoryId?: string;
  categoryName?: string;
  tags?: string[];
  darkMode?: boolean;
  userId?: string;
}

// دالة للحصول على أيقونة نوع المقال
const getTypeIcon = (type: RecommendedArticle['type']) => {
  switch (type) {
    case 'تحليل': return <Brain className="w-4 h-4" />;
    case 'رأي': return <Edit className="w-4 h-4" />;
    case 'ملخص': return <BarChart3 className="w-4 h-4" />;
    case 'عاجل': return <Zap className="w-4 h-4" />;
    case 'تقرير': return <Newspaper className="w-4 h-4" />;
    default: return <BookOpen className="w-4 h-4" />;
  }
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

// مكون البطاقة الذكية المخصصة
const SmartRecommendationCard: React.FC<{ 
  article: RecommendedArticle; 
  darkMode: boolean;
  index: number;
}> = ({ article, darkMode, index }) => (
  <Link href={article.url} className="group block">
    <div className={`flex gap-4 p-4 rounded-xl border transition-all duration-300 hover:shadow-lg relative ${
      darkMode 
        ? 'bg-gray-800 border-gray-700 hover:border-gray-600 hover:bg-gray-750' 
        : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-gray-50'
    }`}>
      
      {/* مؤشر الترتيب */}
      <div className={`absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
        index === 0 ? 'bg-gold text-white' : 
        index === 1 ? 'bg-gray-400 text-white' :
        'bg-gray-300 text-gray-700'
      }`}>
        {index + 1}
      </div>
      
      {/* الصورة المصغرة */}
      {article.thumbnail && (
        <div className="flex-shrink-0 relative w-20 h-20 rounded-lg overflow-hidden">
          <Image
            src={article.thumbnail}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      {/* المحتوى */}
      <div className="flex-1 min-w-0">
        {/* شارة النوع ومؤشر الثقة */}
        <div className="flex items-center justify-between mb-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getTypeColors(article.type)}`}>
            {getTypeIcon(article.type)}
            {article.type}
          </span>
          
          {/* مؤشر الثقة */}
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${getConfidenceColor(article.confidence)}`}></div>
            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {article.confidence}%
            </span>
          </div>
        </div>
        
        {/* العنوان */}
        <h3 className={`font-semibold leading-tight mb-2 line-clamp-2 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {article.title}
        </h3>
        
        {/* سبب التوصية */}
        <div className={`mb-2 text-xs ${darkMode ? 'text-blue-300' : 'text-blue-600'} bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded`}>
          <CheckCircle className="w-3 h-3 inline mr-1" />
          {article.reason}
        </div>
        
        {/* المعلومات الإضافية */}
        <div className={`flex items-center gap-3 text-xs ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{article.readingTime} د</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{article.viewsCount.toLocaleString('ar-SA')}</span>
          </div>
          <span>{formatRelativeDate(article.publishedAt)}</span>
        </div>
      </div>
      
      {/* سهم الانتقال */}
      <div className={`flex-shrink-0 flex items-center ${darkMode ? 'text-gray-500' : 'text-gray-400'} group-hover:text-blue-500`}>
        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </Link>
);

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

  useEffect(() => {
    const fetchPersonalizedRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🧠 توليد التوصيات الذكية للمقال:', articleId);
        
        // توليد التوصيات المخصصة
        const personalizedRecommendations = await generatePersonalizedRecommendations({
          userId,
          currentArticleId: articleId,
          currentTags: tags,
          currentCategory: categoryName || '',
          limit: 4
        });
        
        console.log('✅ تم توليد التوصيات:', personalizedRecommendations);
        setRecommendations(personalizedRecommendations);
        
      } catch (err) {
        console.error('❌ خطأ في توليد التوصيات الذكية:', err);
        setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
        
        // بيانات تجريبية في حالة الخطأ
        setRecommendations([
          {
            id: 'ai-future-work-backup',
            title: 'تحليل مباشر: مستقبل العمل مع الذكاء الاصطناعي',
            url: '/article/ai-future-work-backup',
            type: 'تحليل',
            reason: 'بناءً على اهتمامك بالتقنية',
            confidence: 92,
            thumbnail: '/images/ai-future.jpg',
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
            publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            category: 'اقتصاد',
            readingTime: 4,
            viewsCount: 8930,
            engagement: 0.18
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonalizedRecommendations();
  }, [articleId, categoryId, tags, userId]);

  // حالة التحميل
  if (loading) {
    return (
      <section className={`w-full py-8 px-4 ${
        darkMode ? 'bg-gray-800' : 'bg-gray-50'
      }`}>
        <div className="max-w-2xl mx-auto">
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
    <section className={`w-full py-8 px-4 ${
      darkMode ? 'bg-gray-800' : 'bg-gray-50'
    }`}>
      <div className="max-w-2xl mx-auto">
        
        {/* عنوان القسم الذكي */}
        <div className="flex items-center gap-3 mb-6">
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

        {/* البطاقات الذكية */}
        {recommendations.length > 0 && (
          <div className="space-y-4 mb-6">
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

        {/* رسالة التوضيح */}
        <div className={`text-center pt-4 border-t ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <p className={`text-xs ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            🎯 يتحسن نظام التوصيات كلما تفاعلت أكثر مع المحتوى
          </p>
        </div>

      </div>
    </section>
  );
}
