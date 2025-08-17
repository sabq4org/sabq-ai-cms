/**
 * محرك التوصيات الذكي - سبق الذكية
 * بطاقة التوصية
 * Sabq AI Recommendation Engine - Recommendation Card Component
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartIcon, 
  ShareIcon, 
  BookmarkIcon, 
  ClockIcon,
  EyeIcon,
  StarIcon,
  TrendingUpIcon,
  BrainIcon
} from 'lucide-react';
import { type Recommendation } from '../../lib/recommendation-client';
import { useRecommendationSystem } from '../../hooks/use-recommendations';
import { cn } from '../../lib/utils';

interface RecommendationCardProps {
  recommendation: Recommendation & { source?: 'personal' | 'trending' | 'similar' };
  userId?: string;
  variant?: 'default' | 'compact' | 'featured';
  showSource?: boolean;
  showScore?: boolean;
  onView?: () => void;
  onInteraction?: (type: string) => void;
  className?: string;
}

export function RecommendationCard({
  recommendation,
  userId,
  variant = 'default',
  showSource = false,
  showScore = false,
  onView,
  onInteraction,
  className
}: RecommendationCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  const { trackView, trackLike, trackShare, trackBookmark } = useRecommendationSystem(userId);

  // معالجة عرض المقال
  const handleView = () => {
    if (userId) {
      trackView(recommendation.article_id);
    }
    onView?.();
  };

  // معالجة الإعجاب
  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLiked(!isLiked);
    
    if (userId) {
      trackLike(recommendation.article_id);
    }
    
    onInteraction?.('like');
  };

  // معالجة المشاركة
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsSharing(true);
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: recommendation.title,
          url: `/article/${recommendation.article_id}`
        });
      } else {
        // نسخ الرابط للحافظة
        await navigator.clipboard.writeText(
          `${window.location.origin}/article/${recommendation.article_id}`
        );
      }
      
      if (userId) {
        trackShare(recommendation.article_id);
      }
      
      onInteraction?.('share');
    } catch (error) {
      console.error('فشل في المشاركة:', error);
    } finally {
      setIsSharing(false);
    }
  };

  // معالجة الحفظ
  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsBookmarked(!isBookmarked);
    
    if (userId) {
      trackBookmark(recommendation.article_id);
    }
    
    onInteraction?.('bookmark');
  };

  // أيقونة المصدر
  const getSourceIcon = () => {
    switch (recommendation.source) {
      case 'personal':
        return <BrainIcon className="w-4 h-4 text-blue-500" />;
      case 'trending':
        return <TrendingUpIcon className="w-4 h-4 text-orange-500" />;
      case 'similar':
        return <StarIcon className="w-4 h-4 text-purple-500" />;
      default:
        return null;
    }
  };

  // نص المصدر
  const getSourceText = () => {
    switch (recommendation.source) {
      case 'personal':
        return 'مُوصى لك';
      case 'trending':
        return 'رائج الآن';
      case 'similar':
        return 'مقالات مماثلة';
      default:
        return 'توصية';
    }
  };

  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.RelativeTimeFormat('ar', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  // تحويل وقت القراءة
  const formatReadingTime = (minutes?: number) => {
    if (!minutes) return null;
    return `${Math.ceil(minutes)} دقيقة قراءة`;
  };

  // أنماط حسب النوع
  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return 'p-3';
      case 'featured':
        return 'p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20';
      default:
        return 'p-4';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300',
        getVariantStyles(),
        className
      )}
    >
      <Link href={`/article/${recommendation.article_id}`} onClick={handleView}>
        <div className="space-y-3">
          {/* الرأس مع الصورة */}
          {recommendation.thumbnail && variant !== 'compact' && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
              <Image
                src={recommendation.thumbnail}
                alt={recommendation.title}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              
              {/* شارة المصدر */}
              {showSource && recommendation.source && (
                <div className="absolute top-2 right-2">
                  <div className="flex items-center gap-1 px-2 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full text-xs font-medium">
                    {getSourceIcon()}
                    <span>{getSourceText()}</span>
                  </div>
                </div>
              )}
              
              {/* نقاط التوصية */}
              {showScore && (
                <div className="absolute bottom-2 left-2">
                  <div className="flex items-center gap-1 px-2 py-1 bg-black/70 text-white rounded-full text-xs">
                    <StarIcon className="w-3 h-3 fill-current" />
                    <span>{(recommendation.score * 100).toFixed(0)}%</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* المحتوى */}
          <div className="space-y-2">
            {/* العنوان */}
            <h3 className={cn(
              'font-bold text-gray-900 dark:text-white line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors',
              variant === 'compact' ? 'text-sm' : 'text-lg',
              variant === 'featured' ? 'text-xl' : ''
            )}>
              {recommendation.title}
            </h3>

            {/* معلومات إضافية */}
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              {/* التصنيف */}
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                {recommendation.category}
              </span>
              
              {/* التاريخ */}
              <div className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                <span>{formatDate(recommendation.publish_date)}</span>
              </div>
              
              {/* وقت القراءة */}
              {recommendation.reading_time_estimate && (
                <div className="flex items-center gap-1">
                  <EyeIcon className="w-4 h-4" />
                  <span>{formatReadingTime(recommendation.reading_time_estimate)}</span>
                </div>
              )}
            </div>

            {/* الكاتب */}
            {recommendation.author && variant !== 'compact' && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                بقلم: {recommendation.author}
              </p>
            )}

            {/* السبب */}
            {recommendation.reasoning && variant === 'featured' && (
              <p className="text-sm text-gray-600 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                💡 {recommendation.reasoning}
              </p>
            )}

            {/* الكلمات المفتاحية */}
            {recommendation.tags.length > 0 && variant !== 'compact' && (
              <div className="flex flex-wrap gap-1">
                {recommendation.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                  >
                    #{tag}
                  </span>
                ))}
                {recommendation.tags.length > 3 && (
                  <span className="px-2 py-1 text-gray-500 text-xs">
                    +{recommendation.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* أزرار التفاعل */}
          {variant !== 'compact' && (
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                {/* الإعجاب */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLike}
                  className={cn(
                    'flex items-center gap-1 p-2 rounded-full transition-colors',
                    isLiked 
                      ? 'text-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                  )}
                  aria-label="أعجبني"
                >
                  <HeartIcon className={cn('w-4 h-4', isLiked && 'fill-current')} />
                </motion.button>

                {/* المشاركة */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  disabled={isSharing}
                  className="flex items-center gap-1 p-2 rounded-full text-gray-600 dark:text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  aria-label="مشاركة"
                >
                  <ShareIcon className={cn('w-4 h-4', isSharing && 'animate-pulse')} />
                </motion.button>

                {/* الحفظ */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBookmark}
                  className={cn(
                    'flex items-center gap-1 p-2 rounded-full transition-colors',
                    isBookmarked 
                      ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                  )}
                  aria-label="حفظ"
                >
                  <BookmarkIcon className={cn('w-4 h-4', isBookmarked && 'fill-current')} />
                </motion.button>
              </div>

              {/* معدل الثقة */}
              {recommendation.confidence && showScore && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <BrainIcon className="w-4 h-4" />
                  <span>{(recommendation.confidence * 100).toFixed(0)}% ثقة</span>
                </div>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

// مكون خاص للتحميل
export function RecommendationCardSkeleton({ variant = 'default' }: { variant?: 'default' | 'compact' | 'featured' }) {
  return (
    <div className={cn(
      'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse',
      variant === 'compact' ? 'p-3' : variant === 'featured' ? 'p-6' : 'p-4'
    )}>
      <div className="space-y-3">
        {/* صورة وهمية */}
        {variant !== 'compact' && (
          <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        )}
        
        {/* عنوان وهمي */}
        <div className="space-y-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>
        
        {/* معلومات وهمية */}
        <div className="flex gap-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        </div>
        
        {/* أزرار وهمية */}
        {variant !== 'compact' && (
          <div className="flex gap-3 pt-3">
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}
