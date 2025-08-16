/**
 * محرك التوصيات الذكي - سبق الذكية
 * قائمة التوصيات
 * Sabq AI Recommendation Engine - Recommendation List Component
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCwIcon, 
  FilterIcon, 
  SortAscIcon,
  GridIcon,
  ListIcon,
  SearchIcon,
  TrendingUpIcon,
  BrainIcon,
  StarIcon,
  AlertCircleIcon
} from 'lucide-react';
import { RecommendationCard, RecommendationCardSkeleton } from './RecommendationCard';
import { useSmartRecommendations, useRecommendationAnalytics } from '../../hooks/use-recommendations';
import { type Recommendation } from '../../lib/recommendation-client';
import { cn } from '../../lib/utils';

interface RecommendationListProps {
  userId?: string;
  categories?: string[];
  limit?: number;
  showFilters?: boolean;
  showAnalytics?: boolean;
  layout?: 'grid' | 'list';
  variant?: 'default' | 'compact' | 'featured';
  title?: string;
  subtitle?: string;
  onRecommendationClick?: (recommendation: Recommendation) => void;
  className?: string;
}

type SortOption = 'score' | 'date' | 'popularity' | 'reading_time';
type FilterOption = 'all' | 'personal' | 'trending' | 'similar';

export function RecommendationList({
  userId,
  categories,
  limit = 12,
  showFilters = true,
  showAnalytics = false,
  layout: initialLayout = 'grid',
  variant = 'default',
  title = 'التوصيات الذكية',
  subtitle = 'مقالات مختارة خصيصاً لك',
  onRecommendationClick,
  className
}: RecommendationListProps) {
  const [layout, setLayout] = useState(initialLayout);
  const [sortBy, setSortBy] = useState<SortOption>('score');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // جلب التوصيات
  const {
    recommendations,
    isLoading,
    isError,
    error,
    refetch
  } = useSmartRecommendations(userId, {
    limit,
    categories,
    includePersonal: filterBy === 'all' || filterBy === 'personal',
    includeTrending: filterBy === 'all' || filterBy === 'trending',
    enabled: !!userId
  });

  // تحليلات التوصيات
  const {
    analytics,
    trackRecommendationView,
    trackRecommendationClick
  } = useRecommendationAnalytics(userId);

  // تتبع عرض التوصيات
  useEffect(() => {
    if (recommendations && recommendations.length > 0 && userId) {
      const recommendationIds = recommendations.map(r => r.article_id);
      trackRecommendationView(recommendationIds);
    }
  }, [recommendations, userId, trackRecommendationView]);

  // تصفية وترتيب التوصيات
  const processedRecommendations = React.useMemo(() => {
    if (!recommendations) return [];

    let filtered = [...recommendations];

    // البحث النصي
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(rec => 
        rec.title.toLowerCase().includes(query) ||
        rec.category.toLowerCase().includes(query) ||
        rec.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // تصفية حسب المصدر
    if (filterBy !== 'all') {
      filtered = filtered.filter(rec => rec.source === filterBy);
    }

    // الترتيب
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.score - a.score;
        case 'date':
          return new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime();
        case 'popularity':
          return (b.confidence || 0) - (a.confidence || 0);
        case 'reading_time':
          return (a.reading_time_estimate || 0) - (b.reading_time_estimate || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [recommendations, searchQuery, filterBy, sortBy]);

  // معالجة النقر على التوصية
  const handleRecommendationClick = (recommendation: Recommendation) => {
    if (userId) {
      trackRecommendationClick(
        recommendation.article_id, 
        recommendation.source || 'unknown'
      );
    }
    onRecommendationClick?.(recommendation);
  };

  // أنماط التخطيط
  const getLayoutStyles = () => {
    if (layout === 'list') {
      return 'space-y-4';
    }
    
    switch (variant) {
      case 'compact':
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4';
      case 'featured':
        return 'grid grid-cols-1 lg:grid-cols-2 gap-6';
      default:
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';
    }
  };

  // عرض الخطأ
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircleIcon className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          خطأ في تحميل التوصيات
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {error?.message || 'حدث خطأ غير متوقع'}
        </p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCwIcon className="w-4 h-4" />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* الرأس */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {subtitle}
          </p>
        </div>

        {/* أدوات التحكم */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-3">
            {/* البحث */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="البحث في التوصيات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* التصفية */}
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as FilterOption)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">جميع التوصيات</option>
              <option value="personal">شخصية</option>
              <option value="trending">رائجة</option>
              <option value="similar">مماثلة</option>
            </select>

            {/* الترتيب */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="score">الأعلى تقييماً</option>
              <option value="date">الأحدث</option>
              <option value="popularity">الأكثر شعبية</option>
              <option value="reading_time">وقت القراءة</option>
            </select>

            {/* تخطيط العرض */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <button
                onClick={() => setLayout('grid')}
                className={cn(
                  'p-2 rounded transition-colors',
                  layout === 'grid' 
                    ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                )}
                aria-label="عرض شبكي"
              >
                <GridIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayout('list')}
                className={cn(
                  'p-2 rounded transition-colors',
                  layout === 'list' 
                    ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                )}
                aria-label="عرض قائمة"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>

            {/* تحديث */}
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label="تحديث"
            >
              <RefreshCwIcon className={cn('w-4 h-4', isLoading && 'animate-spin')} />
            </button>
          </div>
        )}
      </div>

      {/* الإحصائيات */}
      {showAnalytics && userId && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {analytics.viewedRecommendations}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              توصيات مُشاهدة
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {analytics.clickedRecommendations}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              توصيات مُختارة
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {(analytics.clickThroughRate * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              معدل النقر
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {Math.round(analytics.averageReadingTime)}م
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              متوسط القراءة
            </div>
          </div>
        </div>
      )}

      {/* المحتوى */}
      <div className="space-y-4">
        {/* عداد النتائج */}
        {!isLoading && processedRecommendations.length > 0 && (
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              {processedRecommendations.length} من {recommendations?.length || 0} توصية
              {searchQuery && ` • البحث عن "${searchQuery}"`}
            </span>
            
            {/* مؤشرات المصادر */}
            <div className="flex items-center gap-4">
              {recommendations && (
                <>
                  <div className="flex items-center gap-1">
                    <BrainIcon className="w-4 h-4 text-blue-500" />
                    <span>{recommendations.filter(r => r.source === 'personal').length} شخصية</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUpIcon className="w-4 h-4 text-orange-500" />
                    <span>{recommendations.filter(r => r.source === 'trending').length} رائجة</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <StarIcon className="w-4 h-4 text-purple-500" />
                    <span>{recommendations.filter(r => r.source === 'similar').length} مماثلة</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* قائمة التوصيات */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={getLayoutStyles()}
            >
              {Array.from({ length: limit }, (_, i) => (
                <RecommendationCardSkeleton key={i} variant={variant} />
              ))}
            </motion.div>
          ) : processedRecommendations.length > 0 ? (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={getLayoutStyles()}
            >
              {processedRecommendations.map((recommendation, index) => (
                <RecommendationCard
                  key={recommendation.article_id}
                  recommendation={recommendation}
                  userId={userId}
                  variant={layout === 'list' ? 'compact' : variant}
                  showSource={true}
                  showScore={true}
                  onView={() => handleRecommendationClick(recommendation)}
                  className={cn(
                    layout === 'list' && 'flex gap-4 items-start',
                    'transition-all duration-300'
                  )}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <SearchIcon className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                لا توجد توصيات
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchQuery 
                  ? `لم نجد نتائج تطابق "${searchQuery}"`
                  : 'لم نتمكن من إيجاد توصيات مناسبة في الوقت الحالي'
                }
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  مسح البحث
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// مكون مبسط للاستخدام السريع
export function SimpleRecommendationList({ 
  userId, 
  limit = 6, 
  title = "قد يعجبك أيضاً",
  className 
}: {
  userId?: string;
  limit?: number;
  title?: string;
  className?: string;
}) {
  return (
    <RecommendationList
      userId={userId}
      limit={limit}
      title={title}
      subtitle=""
      showFilters={false}
      showAnalytics={false}
      variant="compact"
      className={className}
    />
  );
}
