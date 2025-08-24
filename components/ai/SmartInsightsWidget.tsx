"use client";

import { useState, useEffect } from 'react';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
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

interface SmartInsightsWidgetProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export default function SmartInsightsWidget({ variant = 'default', className = '' }: SmartInsightsWidgetProps) {
  const { darkMode } = useDarkModeContext();
  const [insights, setInsights] = useState<ArticleInsight[]>([]);
  const [accentActive, setAccentActive] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isCompact = variant === 'compact';

  const fetchInsights = async () => {
    try {
      const response = await fetch('/api/ai-insights', { next: { revalidate: 120 } });
      
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
    // تحديث كل 5 دقائق
    const interval = setInterval(fetchInsights, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // رصد تفعيل نظام الألوان (accent) عبر data-theme لدعم خيار "بلا لون"
  useEffect(() => {
    try {
      const updateAccent = () => {
        const dt = document.documentElement.getAttribute('data-theme');
        setAccentActive(Boolean(dt) && dt !== 'none');
      };
      updateAccent();
      const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (m.type === 'attributes' && m.attributeName === 'data-theme') {
            updateAccent();
          }
        }
      });
      observer.observe(document.documentElement, { attributes: true });
      return () => observer.disconnect();
    } catch {}
  }, []);

  // دوران تلقائي للمؤشرات
  useEffect(() => {
    if (insights.length > 1) {
      const carousel = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % Math.min(5, insights.length));
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
        color: 'text-yellow-600', 
        bg: 'bg-yellow-50', 
        icon: '💰',
        accent: 'border-l-yellow-500'
      },
      'سياسي بارز': { 
        color: 'text-purple-600', 
        bg: 'bg-purple-50', 
        icon: '🏛️',
        accent: 'border-l-purple-500'
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
      icon: '💬',
      accent: 'border-l-gray-500'
    };
  };

  const chartMaxHeight = isCompact ? 12 : 16;
  const generateMiniChart = (score: number): JSX.Element => {
    const bars = 6;
    
    return (
      <div className="flex items-end gap-0.5 h-4">
        {Array.from({ length: bars }, (_, i) => {
          const height = Math.max(2, (score * (i + 1)) / (bars * 50));
          const barHeight = Math.min(chartMaxHeight, height);
          
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
      <div className={`max-w-6xl mx-auto ${isCompact ? 'mb-6' : 'mb-8'} ${className}`} aria-busy="true" aria-live="polite">
        <div
          className={`relative overflow-hidden border rounded-xl border-[#f0f0ef] dark:border-gray-700 ${isCompact ? 'p-3' : 'p-5'} h-full flex flex-col transition-colors hover:border-[hsl(var(--accent))]`}
          style={{ background: darkMode ? 'hsl(var(--bg-elevated))' : (accentActive ? 'hsl(var(--accent) / 0.06)' : '#ffffff') }}
        >
          <div className="animate-pulse space-y-4 flex-1">
            <div className="space-y-2">
              <div className="h-3 w-20 bg-slate-300/60 dark:bg-slate-600/60 rounded"></div>
              <div className="h-6 w-40 bg-slate-300/60 dark:bg-slate-600/60 rounded"></div>
              <div className="h-3 w-32 bg-slate-300/60 dark:bg-slate-600/60 rounded"></div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="h-12 bg-blue-200/40 dark:bg-blue-800/40 rounded-lg"></div>
              <div className="h-12 bg-green-200/40 dark:bg-green-800/40 rounded-lg"></div>
              <div className="h-12 bg-purple-200/40 dark:bg-purple-800/40 rounded-lg"></div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-slate-300/60 dark:bg-slate-600/60 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-full bg-slate-300/60 dark:bg-slate-600/60 rounded"></div>
                  <div className="h-4 w-3/4 bg-slate-300/60 dark:bg-slate-600/60 rounded"></div>
                </div>
              </div>
              <div className="h-16 bg-slate-300/40 dark:bg-slate-600/40 rounded-xl"></div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-[#f0f0ef] dark:border-slate-600/50">
                        <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 bg-red-500/90 dark:bg-red-500/80 rounded-full animate-pulse"></div>
              <div className="w-2.5 h-2.5 bg-blue-500/90 dark:bg-blue-500/80 rounded-full animate-pulse delay-100"></div>
              <div className="w-2.5 h-2.5 bg-green-500/90 dark:bg-green-500/80 rounded-full animate-pulse delay-200"></div>
              <div className="w-2.5 h-2.5 bg-yellow-500/90 dark:bg-yellow-500/80 rounded-full animate-pulse delay-300"></div>
              <div className="w-2.5 h-2.5 bg-purple-500/90 dark:bg-purple-500/80 rounded-full animate-pulse delay-500"></div>
            </div>
              <div className="text-xs text-slate-400 dark:text-slate-500">جاري التحميل...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || insights.length === 0) {
    return (
      <div className={`max-w-6xl mx-auto ${isCompact ? 'mb-6' : 'mb-8'} ${className}`}>
        <div
          className={`relative overflow-hidden border rounded-xl border-[#f0f0ef] dark:border-gray-700 ${isCompact ? 'p-3' : 'p-5'} h-full flex flex-col items-center justify-center text-center transition-colors hover:border-[hsl(var(--accent))]`}
          style={{ background: darkMode ? 'hsl(var(--bg-elevated))' : (accentActive ? 'hsl(var(--accent) / 0.06)' : '#ffffff') }}
        >
          <div className="space-y-4">
            <div className={`${isCompact ? 'text-4xl' : 'text-5xl'} animate-bounce`}>🤖</div>
            <div className="space-y-2">
              <div className="text-slate-600 dark:text-slate-300 text-base font-medium">
                🎯 مؤشرات ذكية
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-sm">
                جاري تحليل الاتجاهات...
              </div>
              <div className="text-xs text-slate-400 dark:text-slate-500">
                المؤشرات الذكية ستظهر قريباً
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-[#f0f0ef] dark:border-slate-600/50 mt-4">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 bg-red-500/80 dark:bg-red-500/60 rounded-full"></div>
                <div className="w-2.5 h-2.5 bg-blue-500/80 dark:bg-blue-500/60 rounded-full"></div>
                <div className="w-2.5 h-2.5 bg-green-500/80 dark:bg-green-500/60 rounded-full"></div>
                <div className="w-2.5 h-2.5 bg-yellow-500/80 dark:bg-yellow-500/60 rounded-full"></div>
                <div className="w-2.5 h-2.5 bg-purple-500/80 dark:bg-purple-500/60 rounded-full"></div>
              </div>
              <div className="text-xs text-slate-400 dark:text-slate-500">قريباً...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentInsight = insights[currentIndex];
  const config = getInsightConfig(currentInsight.insightTag);

  return (
    <div className={`max-w-6xl mx-auto ${isCompact ? 'mb-6' : 'mb-8'} ${className}`}>
      <div
        className={`relative overflow-hidden border rounded-xl border-[#f0f0ef] dark:border-gray-700 ${isCompact ? 'p-3' : 'p-5'} transition-all duration-300 h-full flex flex-col hover:border-[hsl(var(--accent))]`}
        style={{ background: darkMode ? 'hsl(var(--bg-elevated))' : '#ffffff' }}
      >
      {/* خط جانبي ملون ديناميكي */}
      <div className={`absolute top-0 right-0 w-1 h-full ${config.accent.replace('border-l-', 'bg-')} transition-colors duration-500`}></div>
      {/* Header مع عنوان أكبر */}
      <div className={`${isCompact ? 'mb-3' : 'mb-4'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              مباشر الآن
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <Clock className="w-2.5 h-2.5" />
            <span>تحديث مستمر</span>
          </div>
        </div>
        
        <h2 className={`${isCompact ? 'text-lg' : 'text-xl'} font-bold text-slate-800 dark:text-slate-200`}>
          🎯 مؤشرات ذكية
        </h2>
        
        {/* 3 بطاقات صغيرة بخلفية رمادية وحدود خفيفة */}
        <div className={`grid grid-cols-3 ${isCompact ? 'gap-1.5 mt-2' : 'gap-2 mt-3'}`}>
          <div className={`bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-lg ${isCompact ? 'p-1.5' : 'p-2'} text-center`}>
            <div className="text-sm mb-1">🧠</div>
            <div className="text-xs font-medium text-slate-700 dark:text-slate-100">اتجاه فوري</div>
          </div>
          <div className={`bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-lg ${isCompact ? 'p-1.5' : 'p-2'} text-center`}>
            <div className="text-sm mb-1">📊</div>
            <div className="text-xs font-medium text-slate-700 dark:text-slate-100">اتجاهات ذكية</div>
          </div>
          <div className={`bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-lg ${isCompact ? 'p-1.5' : 'p-2'} text-center`}>
            <div className="text-sm mb-1">⚡</div>
            <div className="text-xs font-medium text-slate-700 dark:text-slate-100">تحديث مستمر</div>
          </div>
        </div>
      </div>

      {/* المؤشر الحالي - flex-1 ليملأ المساحة */}
      <div className="flex-1 flex flex-col">
        <Link href={`/news/${currentInsight.slug}`} className="block group flex-1">
          <div className="space-y-3 h-full flex flex-col">
            {/* العنوان مع المؤشر */}
            <div className="flex items-start gap-3">
              <span className={`${isCompact ? 'text-xl' : 'text-2xl'} leading-none`}>{config.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className={`${isCompact ? 'text-sm' : 'text-base'} font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-3 transition-colors leading-relaxed`}>
                  {currentInsight.title}
                </h3>
              </div>
            </div>
            
            {/* التصنيف والمقاييس */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`${config.bg} ${config.color} text-sm font-medium ${isCompact ? 'px-2.5 py-1' : 'px-3 py-1.5'} rounded-full border border-current/20`}>
                  {currentInsight.insightTag}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                {/* Mini Chart */}
                <div style={{ color: "hsl(var(--accent))" }}>{generateMiniChart(currentInsight.trendingScore)}</div>
                
                {/* المقياس الرئيسي */}
                <div className="flex items-center gap-1.5">
                  {currentInsight.insightTag === 'الأكثر جدلاً' && (
                    <>
                      <MessageCircle className={`${isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
                      <span className="font-medium">{formatMetric(currentInsight.commentCount)}</span>
                    </>
                  )}
                  {currentInsight.insightTag === 'صاعد الآن' && (
                    <>
                      <TrendingUp className={`${isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
                      <span className="font-medium">+{currentInsight.growthRate.toFixed(0)}%</span>
                    </>
                  )}
                  {(currentInsight.insightTag === 'الأكثر تداولاً' || 
                    !['الأكثر جدلاً', 'صاعد الآن'].includes(currentInsight.insightTag)) && (
                    <>
                      <Eye className={`${isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
                      <span className="font-medium">{formatMetric(currentInsight.viewCount)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* التحليل الذكي - flex-1 للمساحة المتبقية */}
            <div className="flex-1 flex flex-col justify-center">
              <div className={`${isCompact ? 'text-xs p-3' : 'text-sm p-4'} text-slate-600 dark:text-slate-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700`}>
                <div className="flex items-start gap-2">
                  <span className={`${isCompact ? 'text-base' : 'text-lg'}`}>💡</span>
                  <div className="leading-relaxed">
                    {currentInsight.aiAnalysis}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* مؤشرات النقاط والتحكم - 5 نقاط ملونة دائماً */}
      <div className={`flex items-center justify-between ${isCompact ? 'mt-3' : 'mt-4'} pt-3 border-t border-[#f0f0ef] dark:border-slate-600/50`}>
        <div className="flex gap-1.5">
          {Array.from({ length: 5 }, (_, index) => {
            const insight = insights[index];
            const dotConfig = insight ? getInsightConfig(insight.insightTag) : getInsightConfig('');
            const isActive = index === currentIndex && insight;
            const hasData = !!insight;
            
            // ألوان افتراضية للنقاط حسب الترتيب
            const defaultColors = [
              'bg-red-400/40 dark:bg-red-500/40',
              'bg-blue-400/40 dark:bg-blue-500/40',
              'bg-green-400/40 dark:bg-green-500/40',
              'bg-yellow-400/40 dark:bg-yellow-500/40',
              'bg-purple-400/40 dark:bg-purple-500/40'
            ];
            
            let dotClasses = '';
            if (hasData) {
              const dotColor = dotConfig.color.replace('text-', 'bg-');
              const dotColorMuted = dotColor.replace('-600', '-400/70');
              const dotColorMutedDark = dotColor.replace('-600', '-500/50');
              
              dotClasses = isActive 
                ? `${dotColor} shadow-sm ring-2 ring-white/50 dark:ring-slate-800/50`
                : `${dotColorMuted} dark:${dotColorMutedDark} hover:scale-105`;
            } else {
              const lightColors = [
                'bg-red-400/70 dark:bg-red-500/40',
                'bg-blue-400/70 dark:bg-blue-500/40',
                'bg-green-400/70 dark:bg-green-500/40',
                'bg-yellow-400/70 dark:bg-yellow-500/40',
                'bg-purple-400/70 dark:bg-purple-500/40'
              ];
              dotClasses = lightColors[index] || 'bg-slate-400/60 dark:bg-slate-600/40';
            }
            
            return (
              <button
                key={index}
                onClick={() => hasData && setCurrentIndex(index)}
                disabled={!hasData}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  hasData ? 'hover:scale-110 cursor-pointer' : 'cursor-default'
                } ${dotClasses}`}
                title={insight?.insightTag || `المؤشر ${index + 1}`}
              />
            );
          })}
        </div>
        
        <Link 
          href="/ai-insights" 
          className={`text-xs transition-colors font-medium ${accentActive ? 'text-[hsl(var(--accent))] hover:text-[hsl(var(--accent-hover))]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          عرض الكل ←
        </Link>
      </div>
    </div>
    </div>
  );
}
