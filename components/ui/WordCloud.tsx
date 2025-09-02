/**
 * مكون Word Cloud المتطور للكلمات الشائعة
 * Advanced Word Cloud Component for Trending Keywords
 */

"use client";

import React, { useMemo, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, RotateCcw, ExternalLink } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { WordItem, WordCloudProps, ColorCategory } from '@/types/word-cloud';

// خريطة الألوان الدلالية
const colorMap: Record<ColorCategory, string> = {
  politics: '#F59E0B',    // amber - سياسة
  conflict: '#EC4899',    // pink - صراعات/حروب
  economy: '#10B981',     // emerald - اقتصاد
  geo: '#60A5FA',         // blue - دول/مدن
  sports: '#8B5CF6',      // violet - رياضة
  tech: '#06B6D4',        // cyan - تكنولوجيا
  misc: '#A78BFA',        // purple - متفرقات
};

// دالة تطبيع حجم الخط
const scaleFont = (weight: number, minSize: number, maxSize: number): number => {
  const clamped = Math.max(1, Math.min(100, weight));
  return Math.round(minSize + (clamped - 1) * (maxSize - minSize) / 99);
};

// دالة الحصول على أحجام الخط حسب الشاشة
const getFontSizes = () => {
  if (typeof window === 'undefined') return { min: 20, max: 64 };
  
  const width = window.innerWidth;
  if (width < 480) return { min: 14, max: 36 };      // جوال صغير
  if (width < 768) return { min: 16, max: 42 };      // جوال عادي
  if (width < 1024) return { min: 18, max: 54 };     // تابلت
  return { min: 20, max: 64 };                       // ديسكتوب
};

// دالة تسميات الاتجاه
const getTrendLabel = (trend: WordItem['trend']): string => {
  switch (trend) {
    case 'up': return 'صاعد';
    case 'down': return 'هابط';
    case 'flat': return 'ثابت';
    default: return '';
  }
};

// دالة أيقونة الاتجاه
const TrendIcon: React.FC<{ trend: WordItem['trend']; className?: string }> = ({ trend, className = '' }) => {
  const iconProps = { className: `w-3 h-3 ${className}`, strokeWidth: 2.5 };
  
  switch (trend) {
    case 'up': return <TrendingUp {...iconProps} className={`${iconProps.className} text-green-500`} />;
    case 'down': return <TrendingDown {...iconProps} className={`${iconProps.className} text-red-500`} />;
    case 'flat': return <Minus {...iconProps} className={`${iconProps.className} text-gray-500`} />;
    default: return null;
  }
};

// مكون الكلمة المفردة
const WordCloudItem: React.FC<{
  word: WordItem;
  fontSize: number;
  color: string;
  index: number;
  onSelect: (word: WordItem) => void;
  enableTooltip: boolean;
  showTrends: boolean;
}> = ({ word, fontSize, color, index, onSelect, enableTooltip, showTrends }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback(() => {
    if (word.href) {
      window.open(word.href, '_blank', 'noopener,noreferrer');
    } else {
      onSelect(word);
    }

    // تسجيل التفاعل (اختياري)
    if (typeof window !== 'undefined') {
      fetch('/api/analytics/word-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wordId: word.id,
          clickedAt: new Date().toISOString(),
          userAgent: navigator.userAgent,
          source: 'word-cloud'
        })
      }).catch(() => {}); // تجاهل الأخطاء
    }
  }, [word, onSelect]);

  const wordElement = (
    <motion.button
      type="button"
      role="listitem"
      initial={{ opacity: 0, y: 8, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ 
        delay: index * 0.02, 
        duration: 0.25,
        type: "spring",
        stiffness: 400,
        damping: 25
      }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative group font-medium cursor-pointer select-none
        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
        focus-visible:ring-offset-2 rounded-lg px-2 py-1
        transition-all duration-200 ease-out
        hover:drop-shadow-lg active:drop-shadow-sm
        ${isHovered ? 'z-10' : 'z-0'}
      `}
      style={{ 
        fontSize: `${fontSize}px`, 
        color,
        lineHeight: 1.1,
        textShadow: isHovered ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
      }}
      aria-label={`${word.text}، وزن ${word.weight}${word.trend ? `، اتجاه ${getTrendLabel(word.trend)}` : ''}${word.count ? `، ${word.count} مقال` : ''}`}
    >
      {/* أيقونة الاتجاه */}
      {showTrends && word.trend && (
        <span className="absolute -top-2 -left-2 opacity-70 pointer-events-none">
          <TrendIcon trend={word.trend} className="w-2.5 h-2.5" />
        </span>
      )}
      
      {/* النص */}
      <span className="relative z-10">{word.text}</span>
      
      {/* أيقونة الرابط الخارجي */}
      {word.href && (
        <ExternalLink className="inline-block w-2.5 h-2.5 ml-1 opacity-60" />
      )}
      
      {/* تأثير الخلفية عند الـ hover */}
      <motion.div
        className="absolute inset-0 bg-white/20 dark:bg-gray-800/20 rounded-lg backdrop-blur-sm"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: isHovered ? 1 : 0, 
          scale: isHovered ? 1 : 0.8 
        }}
        transition={{ duration: 0.2 }}
        style={{ zIndex: -1 }}
      />
    </motion.button>
  );

  if (!enableTooltip) return wordElement;

  return (
    <Tooltip.Root delayDuration={300}>
      <Tooltip.Trigger asChild>
        {wordElement}
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-xl z-50 max-w-xs"
          side="top"
          align="center"
          sideOffset={5}
        >
          <div className="text-center">
            <div className="font-semibold">{word.text}</div>
            {word.count && (
              <div className="text-gray-300 text-xs mt-0.5">
                {word.count} مقال
              </div>
            )}
            {word.trend && (
              <div className="flex items-center justify-center gap-1 mt-1 text-xs">
                <TrendIcon trend={word.trend} className="w-3 h-3" />
                <span>اتجاه {getTrendLabel(word.trend)}</span>
              </div>
            )}
          </div>
          <Tooltip.Arrow className="fill-gray-900" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
};

// مكون Loading Skeleton
const WordCloudSkeleton: React.FC = () => (
  <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
    <div className="flex flex-wrap gap-x-4 gap-y-3 justify-center items-center">
      {Array.from({ length: 18 }).map((_, i) => (
        <div
          key={i}
          className="h-6 sm:h-8 md:h-10 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"
          style={{ 
            width: `${40 + Math.random() * 120}px`,
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
    </div>
  </div>
);

// مكون عرض الخطأ
const WordCloudError: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="w-full max-w-5xl mx-auto p-6 text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800">
    <div className="text-center">
      <p className="mb-3">تعذّر تحميل الكلمات الشائعة</p>
      <p className="text-sm opacity-80 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          إعادة المحاولة
        </button>
      )}
    </div>
  </div>
);

// مكون البيانات الفارغة
const WordCloudEmpty: React.FC = () => (
  <div className="w-full max-w-5xl mx-auto p-6 text-gray-500 bg-gray-50 dark:bg-gray-800 dark:text-gray-400 rounded-xl border border-gray-200 dark:border-gray-700">
    <p className="text-center">لا توجد كلمات شائعة حالياً</p>
  </div>
);

// المكون الرئيسي
const WordCloud: React.FC<WordCloudProps> = ({
  words = [],
  onSelect = () => {},
  loading = false,
  error = null,
  maxWords = 50,
  showTrends = true,
  enableTooltip = true,
  className = ''
}) => {
  
  // معالجة البيانات وتطبيع الألوان والأحجام
  const normalizedWords = useMemo(() => {
    if (!words?.length) return [];
    
    const { min, max } = getFontSizes();
    const limitedWords = words.slice(0, maxWords);
    
    return limitedWords.map(word => ({
      ...word,
      fontSize: scaleFont(word.weight, min, max),
      color: colorMap[(word.colorKey as ColorCategory) ?? 'misc'] ?? colorMap.misc,
    }));
  }, [words, maxWords]);

  // حالات العرض المختلفة
  if (loading) return <WordCloudSkeleton />;
  if (error) return <WordCloudError message={error} />;
  if (!normalizedWords.length) return <WordCloudEmpty />;

  return (
    <Tooltip.Provider>
      <div 
        dir="rtl" 
        role="list"
        aria-label="سحابة الكلمات الشائعة"
        className={`
          relative w-full max-w-5xl mx-auto p-4 sm:p-6 
          bg-white dark:bg-gray-800 rounded-2xl shadow-sm
          border border-gray-100 dark:border-gray-700
          transition-all duration-300
          ${className}
        `}
      >
        {/* العنوان */}
        <div className="text-center mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
            الكلمات الشائعة
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            أكثر الكلمات تداولاً في الأخبار
          </p>
        </div>

        {/* سحابة الكلمات */}
        <div className="flex flex-wrap gap-x-3 gap-y-2 sm:gap-x-4 sm:gap-y-3 justify-center items-center min-h-[120px]">
          <AnimatePresence mode="popLayout">
            {normalizedWords.map((word, index) => (
              <WordCloudItem
                key={word.id}
                word={word}
                fontSize={word.fontSize}
                color={word.color}
                index={index}
                onSelect={onSelect}
                enableTooltip={enableTooltip}
                showTrends={showTrends}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* معلومات إضافية */}
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            اضغط على أي كلمة للبحث عن الأخبار المرتبطة بها
          </p>
        </div>
      </div>
    </Tooltip.Provider>
  );
};

export default WordCloud;
