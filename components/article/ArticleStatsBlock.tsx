import React from 'react';
import { Eye, Heart, Bookmark, Share2, TrendingUp, Tag } from 'lucide-react';

interface ArticleStatsBlockProps {
  views: number;
  likes: number;
  saves: number;
  shares: number;
  category?: {
    name: string;
    color?: string;
    icon?: string;
  };
  growthRate?: number;
  className?: string;
}

export default function ArticleStatsBlock({
  views,
  likes,
  saves,
  shares,
  category,
  growthRate,
  className = ""
}: ArticleStatsBlockProps) {
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'م';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'ك';
    }
    return num.toString();
  };

  const getGrowthText = (rate: number) => {
    if (rate > 50) return 'نمو استثنائي';
    if (rate > 20) return 'نمو مرتفع';
    if (rate > 0) return 'نمو جيد';
    return 'مستقر';
  };

  const getGrowthColor = (rate: number) => {
    if (rate > 50) return 'text-green-600 dark:text-green-400';
    if (rate > 20) return 'text-blue-600 dark:text-blue-400';
    if (rate > 0) return 'text-purple-600 dark:text-purple-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className={`mobile-stats-container bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-3 sm:p-6 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
      {/* العنوان */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          📊 إحصائيات المقال
        </h3>
      </div>

      {/* الإحصائيات الرئيسية */}
      <div className="mobile-stats-grid grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-3">
        {/* المشاهدات */}
        <div className="flex flex-col items-center p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-600 hover:scale-105 transition-transform">
          <Eye className="mobile-stats-icon w-4 h-4 text-blue-500 mb-0.5" />
          <span className="mobile-stats-number text-base font-bold text-gray-800 dark:text-gray-200 leading-tight">
            {formatNumber(views)}
          </span>
          <span className="mobile-stats-label text-xs text-gray-500 dark:text-gray-400">مشاهدة</span>
        </div>

        {/* الإعجابات */}
        <div className="flex flex-col items-center p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-600 hover:scale-105 transition-transform">
          <Heart className="mobile-stats-icon w-4 h-4 text-red-500 mb-0.5" />
          <span className="mobile-stats-number text-base font-bold text-gray-800 dark:text-gray-200 leading-tight">
            {formatNumber(likes)}
          </span>
          <span className="mobile-stats-label text-xs text-gray-500 dark:text-gray-400">إعجاب</span>
        </div>

        {/* الحفظ */}
        <div className="flex flex-col items-center p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-600 hover:scale-105 transition-transform">
          <Bookmark className="mobile-stats-icon w-4 h-4 text-green-500 mb-0.5" />
          <span className="mobile-stats-number text-base font-bold text-gray-800 dark:text-gray-200 leading-tight">
            {formatNumber(saves)}
          </span>
          <span className="mobile-stats-label text-xs text-gray-500 dark:text-gray-400">حفظ</span>
        </div>

        {/* المشاركات */}
        <div className="flex flex-col items-center p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-600 hover:scale-105 transition-transform">
          <Share2 className="mobile-stats-icon w-4 h-4 text-purple-500 mb-0.5" />
          <span className="mobile-stats-number text-base font-bold text-gray-800 dark:text-gray-200 leading-tight">
            {formatNumber(shares)}
          </span>
          <span className="mobile-stats-label text-xs text-gray-500 dark:text-gray-400">مشاركة</span>
        </div>
      </div>

      {/* المعلومات الإضافية */}
      <div className="mobile-stats-footer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
        {/* نسبة النمو */}
        {growthRate !== undefined && (
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-4 h-4 ${getGrowthColor(growthRate)}`} />
            <span className={`text-sm font-medium ${getGrowthColor(growthRate)}`}>
              {getGrowthText(growthRate)}
              {growthRate > 0 && (
                <span className="text-xs mr-1">
                  (+{growthRate}%)
                </span>
              )}
            </span>
          </div>
        )}

        {/* التصنيف */}
        {category && (
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span 
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: category.color || '#6B7280' }}
            >
              {category.icon && <span>{category.icon}</span>}
              {category.name}
            </span>
          </div>
        )}
      </div>

      {/* مؤشر الشعبية - للنسخة المحمولة */}
      <div className="mobile-popularity-indicator sm:hidden mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 dark:text-gray-400">مؤشر الشعبية</span>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`mobile-popularity-dot w-2 h-2 rounded-full ${
                  i < Math.min(5, Math.ceil((likes + saves + shares) / 10))
                    ? 'bg-yellow-400'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 