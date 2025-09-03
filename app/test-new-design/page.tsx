// صفحة اختبار للمكون الجديد
// لاختبار التصميم قبل التطبيق في الصفحات الأساسية

'use client';

import React, { useState } from 'react';

// نوع البيانات للاختبار
interface Article {
  id: string;
  title: string;
  content: string;
  slug: string;
  status: string;
  featured_image?: string;
  published_at: string;
  excerpt?: string;
  breaking?: boolean;
  is_breaking?: boolean;
  featured?: boolean;
  is_featured?: boolean;
  views?: number;
  views_count?: number;
  
  // بيانات الكاتب
  author?: {
    id: string;
    name: string;
    avatar?: string;
    verified?: boolean;
    reporter_profile?: {
      full_name?: string;
      verified?: boolean;
      verification_status?: string;
    };
  };
  author_id?: string;
  author_name?: string;
  
  // بيانات التصنيف
  categories?: {
    id: string;
    name: string;
    color?: string;
    color_hex?: string;
    icon?: string;
  };
  category?: {
    id: string;
    name: string;
    color?: string;
    color_hex?: string;
    icon?: string;
  };
  category_id?: string;
  category_name?: string;
}

// مكون مؤقت للاختبار بدلاً من المكون الأصلي
function TestFeaturedNewsCard({ 
  article, 
  showCompact = false, 
  className = "h-64" 
}: { 
  article: Article; 
  showCompact?: boolean; 
  className?: string; 
}) {
  const getBadgeStyle = () => {
    if (article.breaking || article.is_breaking) {
      return "bg-red-600 text-white animate-pulse";
    }
    if (article.featured || article.is_featured) {
      return "bg-yellow-500 text-white";
    }
    return "bg-blue-600 text-white";
  };

  const getBadgeText = () => {
    if (article.breaking || article.is_breaking) return "عاجل";
    if (article.featured || article.is_featured) return "مميز";
    return "جديد";
  };

  return (
    <div className={`relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}>
      {/* الصورة */}
      <div className="relative h-40 overflow-hidden">
        {article.featured_image ? (
          <img
            src={article.featured_image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-gray-400">لا توجد صورة</span>
          </div>
        )}
        
        {/* البادج */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 text-xs font-bold rounded-full ${getBadgeStyle()}`}>
            {getBadgeText()}
          </span>
        </div>
      </div>
      
      {/* المحتوى */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {article.title}
        </h3>
        
        {!showCompact && article.excerpt && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
            {article.excerpt}
          </p>
        )}
        
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            {article.author && (
              <span>{article.author.name}</span>
            )}
            {article.categories && (
              <span>• {article.categories.name}</span>
            )}
          </div>
          {article.views && (
            <span>👁️ {article.views.toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// بيانات تجريبية للاختبار
const sampleArticles = [
  {
    id: '1',
    title: 'خبر عاجل: تطورات مهمة في الأحداث الجارية',
    content: 'محتوى المقالة الكامل هنا...',
    slug: 'breaking-news-sample',
    status: 'published',
    featured_image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop',
    published_at: new Date().toISOString(),
    excerpt: 'ملخص سريع للخبر العاجل يوضح النقاط الأساسية والتطورات المهمة التي حدثت اليوم.',
    breaking: true,
    is_breaking: true,
    featured: true,
    views: 12500,
    author: {
      id: 'author1',
      name: 'أحمد محمد',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      verified: true,
      reporter_profile: {
        full_name: 'أحمد محمد الصحفي',
        verified: true,
        verification_status: 'verified'
      }
    },
    categories: {
      id: 'politics',
      name: 'سياسة',
      color: '#ef4444',
      color_hex: '#ef4444',
      icon: '🏛️'
    }
  },
  {
    id: '2',
    title: 'تحليل اقتصادي: توقعات السوق للربع القادم',
    content: 'تحليل شامل للوضع الاقتصادي...',
    slug: 'economic-analysis',
    status: 'published',
    featured_image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop',
    published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // قبل ساعتين
    excerpt: 'تحليل معمق للاتجاهات الاقتصادية وتوقعات الخبراء للفترة المقبلة.',
    featured: true,
    views: 8900,
    author: {
      id: 'author2',
      name: 'فاطمة السعد',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b72e4a76?w=150&h=150&fit=crop&crop=face',
      verified: false
    },
    categories: {
      id: 'economy',
      name: 'اقتصاد',
      color: '#10b981',
      color_hex: '#10b981',
      icon: '💰'
    }
  },
  {
    id: '3',
    title: 'رياضة: فوز مثير في مباراة الديربي',
    content: 'تقرير شامل عن المباراة...',
    slug: 'sports-derby-match',
    status: 'published',
    featured_image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop',
    published_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // قبل 5 ساعات
    excerpt: 'مباراة مثيرة انتهت بنتيجة مفاجئة في الدقائق الأخيرة.',
    views: 15200,
    author: {
      id: 'author3',
      name: 'خالد الرياضي',
      verified: true
    },
    categories: {
      id: 'sports',
      name: 'رياضة',
      color: '#f59e0b',
      color_hex: '#f59e0b',
      icon: '⚽'
    }
  },
  {
    id: '4',
    title: 'تقنية جديدة تغير مستقبل الذكاء الاصطناعي',
    content: 'اكتشاف تقني مبهر...',
    slug: 'ai-breakthrough',
    status: 'published',
    featured_image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop',
    published_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // قبل ساعة
    excerpt: 'اختراق تقني جديد في مجال الذكاء الاصطناعي قد يغير المشهد التقني.',
    views: 6800,
    author: {
      id: 'author4',
      name: 'نورا التقنية'
    },
    categories: {
      id: 'technology',
      name: 'تقنية',
      color: '#8b5cf6',
      color_hex: '#8b5cf6',
      icon: '💻'
    }
  }
];

export default function TestFeaturedNews() {
  const [selectedMode, setSelectedMode] = useState<'compact' | 'full'>('compact');
  const [showOptions, setShowOptions] = useState({
    badge: true,
    author: true,
    excerpt: false,
    readingTime: false,
    viewCount: true
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            اختبار المكون الجديد: FeaturedNewsBlock.new
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            هذه الصفحة لاختبار التصميم الجديد للأخبار المميزة قبل التطبيق في الصفحات الأساسية
          </p>

          {/* Controls */}
          <div className="space-y-4">
            {/* Mode Selection */}
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-700 dark:text-gray-300">نوع التصميم:</span>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="mode"
                  value="compact"
                  checked={selectedMode === 'compact'}
                  onChange={(e) => setSelectedMode(e.target.value as 'compact' | 'full')}
                  className="text-blue-600"
                />
                <span className="text-sm">مضغوط (تصميم النسخة الخفيفة)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="mode"
                  value="full"
                  checked={selectedMode === 'full'}
                  onChange={(e) => setSelectedMode(e.target.value as 'compact' | 'full')}
                  className="text-blue-600"
                />
                <span className="text-sm">كامل (تصميم محسن)</span>
              </label>
            </div>

            {/* Options */}
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-medium text-gray-700 dark:text-gray-300">خيارات العرض:</span>
              {Object.entries(showOptions).map(([key, value]) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setShowOptions(prev => ({
                      ...prev,
                      [key]: e.target.checked
                    }))}
                    className="text-blue-600"
                  />
                  <span className="text-sm">
                    {key === 'badge' && 'البادجات'}
                    {key === 'author' && 'الكاتب'}
                    {key === 'excerpt' && 'الملخص'}
                    {key === 'readingTime' && 'وقت القراءة'}
                    {key === 'viewCount' && 'المشاهدات'}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            معاينة التصميم الحالي
          </h2>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <strong>النوع:</strong> {selectedMode === 'compact' ? 'مضغوط' : 'كامل'}
              </div>
              <div>
                <strong>البادجات:</strong> {showOptions.badge ? 'مفعل' : 'مُعطل'}
              </div>
              <div>
                <strong>الكاتب:</strong> {showOptions.author ? 'مفعل' : 'مُعطل'}
              </div>
              <div>
                <strong>الملخص:</strong> {showOptions.excerpt ? 'مفعل' : 'مُعطل'}
              </div>
            </div>
          </div>

          {/* Single Article Preview */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              مقالة واحدة - حجم كبير
            </h3>
            <div className="max-w-2xl">
              <TestFeaturedNewsCard
                article={sampleArticles[0]}
                showCompact={selectedMode === 'compact'}
                className="h-80"
              />
            </div>
          </div>
        </div>

        {/* Grid Layout Test */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            شبكة الأخبار - {selectedMode === 'compact' ? 'تصميم النسخة الخفيفة' : 'التصميم المحسن'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sampleArticles.map((article) => (
              <TestFeaturedNewsCard
                key={article.id}
                article={article}
                showCompact={selectedMode === 'compact'}
                className="h-64"
              />
            ))}
          </div>
        </div>

        {/* Responsive Test Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mt-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            اختبار التجاوب
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            جرب تصغير وتكبير النافذة لمشاهدة كيفية تجاوب التصميم
          </p>
          
          <div className="space-y-6">
            {/* Mobile Simulation */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                محاكي الهاتف (375px)
              </h3>
              <div className="max-w-sm mx-auto">
                <TestFeaturedNewsCard
                  article={sampleArticles[0]}
                  showCompact={selectedMode === 'compact'}
                  className="h-56"
                />
              </div>
            </div>

            {/* Tablet Simulation */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                محاكي التابلت (768px)
              </h3>
              <div className="max-w-3xl mx-auto grid grid-cols-2 gap-4">
                {sampleArticles.slice(0, 2).map((article) => (
                  <TestFeaturedNewsCard
                    key={article.id}
                    article={article}
                    showCompact={selectedMode === 'compact'}
                    className="h-56"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mt-8">
          <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-4">
            تعليمات الاستخدام
          </h2>
          <div className="space-y-3 text-blue-800 dark:text-blue-200">
            <p><strong>للتصميم المضغوط:</strong> استخدم showCompact={true} للحصول على تصميم النسخة الخفيفة</p>
            <p><strong>للتصميم الكامل:</strong> استخدم showCompact={false} للحصول على التصميم المحسن</p>
            <p><strong>للبادجات:</strong> showBadge={true} لإظهار بادجات (عاجل، مميز، جديد)</p>
            <p><strong>لمعلومات الكاتب:</strong> showAuthor={true} لإظهار اسم الكاتب والتحقق</p>
          </div>
        </div>
      </div>
    </div>
  );
}
