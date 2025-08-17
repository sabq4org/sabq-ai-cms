/**
 * مكون Word Cloud المحسن للصفحة الرئيسية
 * Enhanced Home Word Cloud Component
 */

"use client";

import React from 'react';
import WordCloud from '@/components/ui/WordCloud';
import { useWordCloud, useWordCloudInteractions } from '@/hooks/useWordCloud';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp } from 'lucide-react';

interface HomeWordCloudEnhancedProps {
  className?: string;
  showTitle?: boolean;
  maxWords?: number;
  enableAutoRefresh?: boolean;
  refreshInterval?: number;
}

const HomeWordCloudEnhanced: React.FC<HomeWordCloudEnhancedProps> = ({
  className = '',
  showTitle = true,
  maxWords = 25,
  enableAutoRefresh = true,
  refreshInterval = 5 * 60 * 1000 // 5 دقائق
}) => {
  // استخدام hook لإدارة البيانات
  const {
    words,
    loading,
    error,
    refresh,
    lastUpdated
  } = useWordCloud({
    maxWords,
    timeframe: '7d',
    enableAutoRefresh,
    refreshInterval
  });

  // استخدام hook لإدارة التفاعلات
  const { handleWordSelect } = useWordCloudInteractions({
    onWordClick: (word) => {
      console.log('تم النقر على الكلمة:', word.text);
    },
    trackAnalytics: true
  });

  // عرض العنوان إذا كان مطلوباً
  const titleSection = showTitle && (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            الكلمات الشائعة
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            أكثر المواضيع تداولاً في الأخبار
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {lastUpdated && (
          <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
            آخر تحديث: {lastUpdated.toLocaleTimeString('ar-SA', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        )}
        <Button
          onClick={refresh}
          disabled={loading}
          size="sm"
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">تحديث</span>
        </Button>
      </div>
    </div>
  );

  return (
    <section className={`w-full py-6 sm:py-8 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {titleSection}
        
        <WordCloud
          words={words}
          loading={loading}
          error={error}
          onSelect={handleWordSelect}
          showTrends={true}
          enableTooltip={true}
          maxWords={maxWords}
          className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 border-2 border-blue-100 dark:border-gray-700"
        />
        
        {/* إحصائيات سريعة */}
        {!loading && !error && words.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-gray-600 dark:text-gray-400">
            <span>إجمالي الكلمات: {words.length}</span>
            <span>صاعدة: {words.filter(w => w.trend === 'up').length}</span>
            <span>هابطة: {words.filter(w => w.trend === 'down').length}</span>
            <span>ثابتة: {words.filter(w => w.trend === 'flat').length}</span>
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeWordCloudEnhanced;
