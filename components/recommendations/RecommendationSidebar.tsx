/**
 * محرك التوصيات الذكي - سبق الذكية
 * شريط التوصيات الجانبي
 * Sabq AI Recommendation Engine - Recommendation Sidebar Component
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  RefreshCwIcon,
  TrendingUpIcon,
  ClockIcon,
  EyeIcon,
  StarIcon,
  BrainIcon,
  XIcon,
  SettingsIcon
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  useTrendingRecommendations, 
  useUserRecommendations,
  useRecommendationSystem 
} from '../../hooks/use-recommendations';
import { type Recommendation } from '../../lib/recommendation-client';
import { cn } from '../../lib/utils';

interface RecommendationSidebarProps {
  userId?: string;
  position?: 'left' | 'right';
  collapsible?: boolean;
  showTrending?: boolean;
  showPersonal?: boolean;
  limit?: number;
  className?: string;
}

export function RecommendationSidebar({
  userId,
  position = 'right',
  collapsible = true,
  showTrending = true,
  showPersonal = true,
  limit = 5,
  className
}: RecommendationSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'trending'>('personal');

  // جلب التوصيات الشخصية
  const personalRecommendations = useUserRecommendations(userId, {
    limit,
    enabled: showPersonal && !!userId
  });

  // جلب التوصيات الرائجة
  const trendingRecommendations = useTrendingRecommendations({
    limit,
    timeRange: 'day',
    enabled: showTrending
  });

  // نظام التوصيات للتتبع
  const { trackView } = useRecommendationSystem(userId);

  // معالجة النقر على التوصية
  const handleRecommendationClick = (recommendation: Recommendation) => {
    if (userId) {
      trackView(recommendation.article_id);
    }
  };

  // الحصول على التوصيات النشطة
  const getActiveRecommendations = () => {
    if (activeTab === 'personal' && personalRecommendations.data) {
      return personalRecommendations.data.recommendations;
    }
    if (activeTab === 'trending' && trendingRecommendations.data) {
      return trendingRecommendations.data.recommendations;
    }
    return [];
  };

  // حالة التحميل
  const isLoading = personalRecommendations.isLoading || trendingRecommendations.isLoading;

  // مكون التوصية المصغرة
  const MiniRecommendationCard = ({ recommendation, index }: { 
    recommendation: Recommendation; 
    index: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, x: position === 'right' ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: position === 'right' ? 20 : -20 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link 
        href={`/article/${recommendation.article_id}`}
        onClick={() => handleRecommendationClick(recommendation)}
        className="block group"
      >
        <div className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
          {/* صورة مصغرة */}
          {recommendation.thumbnail && (
            <div className="relative w-16 h-12 rounded overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
              <Image
                src={recommendation.thumbnail}
                alt={recommendation.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="64px"
              />
            </div>
          )}

          {/* المحتوى */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {recommendation.title}
            </h4>
            
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                {recommendation.category}
              </span>
              
              {recommendation.reading_time_estimate && (
                <div className="flex items-center gap-1">
                  <ClockIcon className="w-3 h-3" />
                  <span>{Math.ceil(recommendation.reading_time_estimate)}د</span>
                </div>
              )}
            </div>

            {/* نقاط التوصية */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <StarIcon className="w-3 h-3 fill-current text-yellow-500" />
                <span>{(recommendation.score * 100).toFixed(0)}%</span>
              </div>
              
              {recommendation.source && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  {recommendation.source === 'personal' && <BrainIcon className="w-3 h-3 text-blue-500" />}
                  {recommendation.source === 'trending' && <TrendingUpIcon className="w-3 h-3 text-orange-500" />}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );

  // مكون الهيكل العظمي للتحميل
  const SkeletonCard = ({ index }: { index: number }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.1 }}
      className="flex gap-3 p-3"
    >
      <div className="w-16 h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
        <div className="flex gap-2">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse" />
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-8 animate-pulse" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ width: isCollapsed ? 60 : 320 }}
      animate={{ width: isCollapsed ? 60 : 320 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden',
        position === 'left' && 'border-r border-l-0',
        className
      )}
    >
      {/* زر الطي/التوسيع */}
      {collapsible && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            'absolute top-4 z-10 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-md hover:shadow-lg transition-all',
            position === 'right' ? '-left-6' : '-right-6'
          )}
          aria-label={isCollapsed ? 'توسيع الشريط الجانبي' : 'طي الشريط الجانبي'}
        >
          {position === 'right' ? (
            isCollapsed ? <ChevronLeftIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />
          ) : (
            isCollapsed ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />
          )}
        </motion.button>
      )}

      <AnimatePresence mode="wait">
        {isCollapsed ? (
          // الوضع المطوي
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 space-y-4"
          >
            <div className="flex flex-col items-center gap-3">
              <BrainIcon className="w-6 h-6 text-blue-500" />
              <TrendingUpIcon className="w-6 h-6 text-orange-500" />
              <SettingsIcon className="w-6 h-6 text-gray-400" />
            </div>
          </motion.div>
        ) : (
          // الوضع الموسع
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full flex flex-col"
          >
            {/* الرأس */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                التوصيات الذكية
              </h3>

              {/* تبويبات */}
              <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                {showPersonal && userId && (
                  <button
                    onClick={() => setActiveTab('personal')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      activeTab === 'personal'
                        ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    )}
                  >
                    <BrainIcon className="w-4 h-4" />
                    لك
                  </button>
                )}
                
                {showTrending && (
                  <button
                    onClick={() => setActiveTab('trending')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      activeTab === 'trending'
                        ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    )}
                  >
                    <TrendingUpIcon className="w-4 h-4" />
                    رائج
                  </button>
                )}
              </div>
            </div>

            {/* المحتوى */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2"
                  >
                    {Array.from({ length: limit }, (_, i) => (
                      <SkeletonCard key={i} index={i} />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key={`content-${activeTab}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-1"
                  >
                    {getActiveRecommendations().map((recommendation, index) => (
                      <MiniRecommendationCard
                        key={recommendation.article_id}
                        recommendation={recommendation}
                        index={index}
                      />
                    ))}

                    {getActiveRecommendations().length === 0 && (
                      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                        <EyeIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">
                          {activeTab === 'personal' 
                            ? 'لا توجد توصيات شخصية حالياً'
                            : 'لا توجد توصيات رائجة حالياً'
                          }
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* التذييل */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    if (activeTab === 'personal') {
                      personalRecommendations.refetch();
                    } else {
                      trendingRecommendations.refetch();
                    }
                  }}
                  disabled={isLoading}
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <RefreshCwIcon className={cn('w-4 h-4', isLoading && 'animate-spin')} />
                  تحديث
                </button>

                <Link
                  href="/recommendations"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  عرض الكل
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// مكون مبسط للشريط الجانبي
export function SimpleRecommendationSidebar({ 
  userId, 
  className 
}: { 
  userId?: string; 
  className?: string; 
}) {
  return (
    <RecommendationSidebar
      userId={userId}
      limit={3}
      collapsible={false}
      showTrending={!userId} // عرض الرائج فقط للمستخدمين غير المسجلين
      showPersonal={!!userId} // عرض الشخصي فقط للمستخدمين المسجلين
      className={className}
    />
  );
}

// مكون الشريط الجانبي العائم
export function FloatingRecommendationSidebar({ 
  userId,
  isVisible = true,
  onClose,
  className 
}: { 
  userId?: string; 
  isVisible?: boolean;
  onClose?: () => void;
  className?: string; 
}) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 320 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 320 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={cn(
            'fixed top-20 right-4 bottom-4 w-80 z-50 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700',
            className
          )}
        >
          {/* زر الإغلاق */}
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="إغلاق"
            >
              <XIcon className="w-5 h-5" />
            </button>
          )}

          <RecommendationSidebar
            userId={userId}
            collapsible={false}
            className="border-0 shadow-none rounded-xl"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
