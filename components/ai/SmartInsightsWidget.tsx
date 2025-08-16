"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, TrendingUp, Eye, MessageCircle } from 'lucide-react';

interface ArticleInsight {
  id: string;
  title: string;
  slug: string;
  category: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  growthRate: number;
  trendingScore: number;
  insightTag: string;
  insightColor: string;
  icon: string;
  publishedAt: string;
  aiAnalysis: string;
}

export default function SmartInsightsWidget() {
  const [insights, setInsights] = useState<ArticleInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchInsights = async () => {
    try {
      const response = await fetch('/api/ai-insights', {
        cache: 'no-store'
      });
      
      if (!response.ok) throw new Error('Failed to fetch insights');
      
      const data = await response.json();
      if (data.success && data.data) {
        setInsights(data.data);
        setError(null);
      } else {
        setError('فشل في تحميل المؤشرات');
      }
    } catch (err) {
      console.error('Error fetching insights:', err);
      setError('فشل في تحميل المؤشرات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
    
    // تحديث كل 10 دقائق
    const interval = setInterval(fetchInsights, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // دوران تلقائي للمؤشرات
  useEffect(() => {
    if (insights.length > 1) {
      const carousel = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % Math.min(3, insights.length));
      }, 8000); // كل 8 ثواني
      
      return () => clearInterval(carousel);
    }
  }, [insights.length]);

  const getInsightConfig = (tag: string) => {
    const configs = {
      'الأكثر جدلاً': { 
        color: 'text-red-600', 
        bg: 'bg-red-50', 
        icon: '🔥',
        accent: 'border-l-red-500'
      },
      'صاعد الآن': { 
        color: 'text-blue-600', 
        bg: 'bg-blue-50', 
        icon: '📈',
        accent: 'border-l-blue-500'
      },
      'الأكثر تداولاً': { 
        color: 'text-green-600', 
        bg: 'bg-green-50', 
        icon: '📢',
        accent: 'border-l-green-500'
      },
      'اقتصادي مهم': { 
        color: 'text-amber-600', 
        bg: 'bg-amber-50', 
        icon: '💰',
        accent: 'border-l-amber-500'
      },
      'سياسي بارز': { 
        color: 'text-purple-600', 
        bg: 'bg-purple-50', 
        icon: '🏛️',
        accent: 'border-l-purple-500'
      },
      'صحي متطور': { 
        color: 'text-emerald-600', 
        bg: 'bg-emerald-50', 
        icon: '⚕️',
        accent: 'border-l-emerald-500'
      },
      'محل نقاش': { 
        color: 'text-orange-600', 
        bg: 'bg-orange-50', 
        icon: '💬',
        accent: 'border-l-orange-500'
      }
    };
    
    return configs[tag as keyof typeof configs] || {
      color: 'text-gray-600', 
      bg: 'bg-gray-50', 
      icon: '⭐',
      accent: 'border-l-gray-500'
    };
  };

  const generateMiniChart = (score: number): JSX.Element => {
    const bars = 6;
    const maxHeight = 16;
    
    return (
      <div className="flex items-end gap-0.5 h-4">
        {Array.from({ length: bars }, (_, i) => {
          const height = Math.max(2, (score * (i + 1)) / (bars * 50));
          const barHeight = Math.min(maxHeight, height);
          
          return (
            <div
              key={i}
              className="w-1 bg-current opacity-60 rounded-sm transition-all duration-300"
              style={{ height: `${barHeight}px` }}
            />
          );
        })}
      </div>
    );
  };

  const formatMetric = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}م`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}ك`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-24 bg-slate-300 dark:bg-slate-600 rounded"></div>
          <div className="h-3 w-full bg-slate-300 dark:bg-slate-600 rounded"></div>
          <div className="h-3 w-3/4 bg-slate-300 dark:bg-slate-600 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || insights.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 text-center">
        <div className="text-slate-500 dark:text-slate-400 text-sm">
          🤖 جاري تحليل الاتجاهات...
        </div>
      </div>
    );
  }

  const currentInsight = insights[currentIndex];
  const config = getInsightConfig(currentInsight.insightTag);

  return (
    <div className={`${config.bg} dark:bg-slate-800 rounded-2xl p-5 border-l-4 ${config.accent} shadow-sm transition-all duration-500 hover:shadow-md`}>
      {/* Header مضغوط */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
            مؤشرات ذكية
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <Clock className="w-2.5 h-2.5" />
          <span>مباشر</span>
        </div>
      </div>

      {/* المؤشر الحالي */}
      <Link href={`/article/${currentInsight.slug}`} className="block group">
        <div className="space-y-2">
          {/* العنوان مع المؤشر */}
          <div className="flex items-start gap-2">
            <span className="text-lg leading-none">{config.icon}</span>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 transition-colors">
                {currentInsight.title}
              </h3>
            </div>
          </div>
          
          {/* التصنيف والمقاييس */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${config.bg} ${config.color} border border-current/20`}>
                {currentInsight.insightTag}
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              {/* Mini Chart */}
              <div className={`${config.color}`}>
                {generateMiniChart(currentInsight.trendingScore)}
              </div>
              
              {/* المقياس الرئيسي */}
              <div className="flex items-center gap-1">
                {currentInsight.insightTag === 'الأكثر جدلاً' && (
                  <>
                    <MessageCircle className="w-3 h-3" />
                    <span>{formatMetric(currentInsight.commentCount)}</span>
                  </>
                )}
                {currentInsight.insightTag === 'صاعد الآن' && (
                  <>
                    <TrendingUp className="w-3 h-3" />
                    <span>+{currentInsight.growthRate.toFixed(0)}%</span>
                  </>
                )}
                {(currentInsight.insightTag === 'الأكثر تداولاً' || 
                  !['الأكثر جدلاً', 'صاعد الآن'].includes(currentInsight.insightTag)) && (
                  <>
                    <Eye className="w-3 h-3" />
                    <span>{formatMetric(currentInsight.viewCount)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* التحليل الذكي */}
          <div className="text-xs text-slate-600 dark:text-slate-400 bg-white/50 dark:bg-slate-700/50 rounded-lg p-2 border border-slate-200/50 dark:border-slate-600/50">
            💡 {currentInsight.aiAnalysis}
          </div>
        </div>
      </Link>

      {/* مؤشرات النقاط والتحكم */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-600/50">
        <div className="flex gap-1">
          {insights.slice(0, 3).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                index === currentIndex 
                  ? `${config.color.replace('text-', 'bg-')}` 
                  : 'bg-slate-300 dark:bg-slate-600'
              }`}
            />
          ))}
        </div>
        
        <Link 
          href="/trending" 
          className="text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          عرض الكل ←
        </Link>
      </div>
    </div>
  );
}
