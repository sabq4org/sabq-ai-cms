/**
 * مكون سحابة الكلمات المصغر - Compact Word Cloud
 * للاستخدام في الشريط الجانبي أو البطاقات الصغيرة
 */

'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';

interface CompactWordCloudProps {
  maxKeywords?: number;
  className?: string;
  showRefresh?: boolean;
}

interface KeywordData {
  id: string;
  text: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  url: string;
}

const COMPACT_COLORS = [
  '#3B82F6', // أزرق
  '#10B981', // أخضر
  '#F59E0B', // برتقالي
  '#EF4444', // أحمر
  '#8B5CF6', // بنفسجي
  '#06B6D4', // سماوي
];

export default function CompactWordCloud({
  maxKeywords = 15,
  className = '',
  showRefresh = false
}: CompactWordCloudProps) {
  const [keywords, setKeywords] = useState<KeywordData[]>([]);
  const [loading, setLoading] = useState(false);

  // تحميل الكلمات المفتاحية
  const loadKeywords = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/keywords?limit=${maxKeywords}`);
      const data = await response.json();
      
      if (data.success && data.keywords) {
        setKeywords(data.keywords);
      }
    } catch (error) {
      console.error('خطأ في تحميل الكلمات:', error);
      // بيانات تجريبية للعرض
      setKeywords([
        { id: '1', text: 'السيسي', count: 1250, trend: 'up' as const, url: '/news/keywords/السيسي' },
        { id: '2', text: 'غزة', count: 1100, trend: 'stable' as const, url: '/news/keywords/غزة' },
        { id: '3', text: 'إسرائيل', count: 980, trend: 'up' as const, url: '/news/keywords/إسرائيل' },
        { id: '4', text: 'الحرب', count: 850, trend: 'down' as const, url: '/news/keywords/الحرب' },
        { id: '5', text: 'أسد', count: 720, trend: 'up' as const, url: '/news/keywords/أسد' },
        { id: '6', text: 'تركيا', count: 650, trend: 'stable' as const, url: '/news/keywords/تركيا' },
        { id: '7', text: 'إيران', count: 580, trend: 'down' as const, url: '/news/keywords/إيران' },
        { id: '8', text: 'اقتصاد', count: 520, trend: 'up' as const, url: '/news/keywords/اقتصاد' }
      ].slice(0, maxKeywords));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKeywords();
  }, [maxKeywords]);

  // حساب الحجم النسبي
  const getSize = (count: number, maxCount: number) => {
    const ratio = count / maxCount;
    if (ratio > 0.8) return 'text-lg font-bold';
    if (ratio > 0.6) return 'text-base font-semibold';
    if (ratio > 0.4) return 'text-sm font-medium';
    return 'text-xs font-normal';
  };

  // أيقونة الاتجاه
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-2.5 h-2.5 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-2.5 h-2.5 text-red-500" />;
      default:
        return <Minus className="w-2.5 h-2.5 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...keywords.map(k => k.count));

  return (
    <div className={`compact-word-cloud ${className}`}>
      {/* رأس المكون */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">كلمات شائعة</h3>
        {showRefresh && (
          <button
            onClick={loadKeywords}
            disabled={loading}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <RefreshCw className={`w-3 h-3 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* سحابة الكلمات المصغرة */}
      <div className="flex flex-wrap gap-1.5 items-center">
        {keywords.map((keyword, index) => (
          <a
            key={keyword.id}
            href={keyword.url}
            className={`
              inline-flex items-center gap-1 px-2 py-1 rounded-full
              transition-all duration-200 hover:scale-105 hover:shadow-sm
              border border-transparent hover:border-current
              ${getSize(keyword.count, maxCount)}
            `}
            style={{ 
              color: COMPACT_COLORS[index % COMPACT_COLORS.length],
              backgroundColor: `${COMPACT_COLORS[index % COMPACT_COLORS.length]}10`
            }}
          >
            <span>{keyword.text}</span>
            {getTrendIcon(keyword.trend)}
          </a>
        ))}
      </div>

      {/* معلومات إضافية */}
      <div className="mt-3 text-xs text-gray-500 text-center">
        {keywords.length} من أصل {maxKeywords} كلمة
      </div>

      <style jsx>{`
        .compact-word-cloud {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 12px;
          padding: 16px;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </div>
  );
}
