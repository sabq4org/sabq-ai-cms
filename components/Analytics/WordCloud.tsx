/**
 * مكون سحابة الكلمات التفاعلية - Trending Keywords Cloud
 * تصميم متقدم ومتجاوب مع وظائف تفاعلية كاملة
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { RefreshCw, TrendingUp, TrendingDown, Minus, Clock, Eye, BarChart3 } from 'lucide-react';

// أنواع البيانات
interface KeywordData {
  id: string;
  text: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  url: string;
  category?: string;
  percentage?: number;
}

interface WordCloudProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  showHeader?: boolean;
  showFooter?: boolean;
  maxKeywords?: number;
}

// ألوان السحابة
const COLORS = [
  '#4A90E2', // أزرق فاتح
  '#50E3C2', // أخضر نعناعي
  '#F5A623', // برتقالي دافئ
  '#E91E63', // وردي حيوي
  '#9C27B0', // بنفسجي أنيق
  '#1976D2', // أزرق داكن
  '#009688', // تيل
  '#F44336', // أحمر
  '#FF9800', // برتقالي
  '#673AB7', // بنفسجي داكن
];

// أحجام الخط
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];

export default function WordCloud({
  className = '',
  autoRefresh = false,
  refreshInterval = 300000, // 5 دقائق
  showHeader = true,
  showFooter = true,
  maxKeywords = 30
}: WordCloudProps) {
  const [keywordsData, setKeywordsData] = useState<KeywordData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [hoveredKeyword, setHoveredKeyword] = useState<KeywordData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const cloudRef = useRef<HTMLDivElement>(null);

  // تحميل بيانات الكلمات المفتاحية
  const loadKeywords = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analytics/keywords', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('فشل في تحميل الكلمات المفتاحية');
      }

      const data = await response.json();
      
      // في حالة عدم وجود بيانات، استخدم البيانات التجريبية
      if (!data.keywords || data.keywords.length === 0) {
        setKeywordsData(generateMockData());
      } else {
        setKeywordsData(data.keywords.slice(0, maxKeywords));
      }
      
      setLastUpdate(new Date());
    } catch (err) {
      console.error('خطأ في تحميل الكلمات المفتاحية:', err);
      setError(err instanceof Error ? err.message : 'خطأ غير معروف');
      // استخدم البيانات التجريبية في حالة الخطأ
      setKeywordsData(generateMockData());
    } finally {
      setLoading(false);
    }
  };

  // إنشاء بيانات تجريبية
  const generateMockData = (): KeywordData[] => {
    const mockKeywords = [
      { text: 'السيسي', count: 1250, trend: 'up' as const, category: 'سياسة' },
      { text: 'إسرائيل', count: 980, trend: 'up' as const, category: 'دولي' },
      { text: 'غزة', count: 1100, trend: 'stable' as const, category: 'أخبار' },
      { text: 'الحرب', count: 850, trend: 'down' as const, category: 'عسكري' },
      { text: 'أسد', count: 720, trend: 'up' as const, category: 'سياسة' },
      { text: 'تركيا', count: 650, trend: 'stable' as const, category: 'دولي' },
      { text: 'إيران', count: 580, trend: 'down' as const, category: 'دولي' },
      { text: 'قرن', count: 520, trend: 'up' as const, category: 'اقتصاد' },
      { text: 'ضبط', count: 480, trend: 'stable' as const, category: 'أمني' },
      { text: 'الخرطوم', count: 420, trend: 'up' as const, category: 'دولي' },
      { text: 'صنعاء', count: 380, trend: 'down' as const, category: 'دولي' },
      { text: 'اقتصاد', count: 350, trend: 'stable' as const, category: 'اقتصاد' },
      { text: 'الجزائر', count: 320, trend: 'up' as const, category: 'دولي' },
      { text: 'البرهان', count: 290, trend: 'down' as const, category: 'سياسة' },
      { text: 'زلزال', count: 260, trend: 'up' as const, category: 'طبيعي' },
      { text: 'السعودية', count: 240, trend: 'stable' as const, category: 'محلي' },
      { text: 'المغرب', count: 220, trend: 'up' as const, category: 'دولي' },
      { text: 'الأردن', count: 200, trend: 'stable' as const, category: 'دولي' },
      { text: 'لبنان', count: 180, trend: 'down' as const, category: 'دولي' },
      { text: 'العراق', count: 160, trend: 'up' as const, category: 'دولي' },
      { text: 'الكويت', count: 140, trend: 'stable' as const, category: 'خليجي' },
      { text: 'قطر', count: 120, trend: 'up' as const, category: 'خليجي' },
      { text: 'الإمارات', count: 100, trend: 'stable' as const, category: 'خليجي' },
      { text: 'البحرين', count: 90, trend: 'up' as const, category: 'خليجي' },
      { text: 'عمان', count: 80, trend: 'stable' as const, category: 'خليجي' },
    ];

    return mockKeywords.slice(0, maxKeywords).map((keyword, index) => ({
      id: Math.random().toString(36).substr(2, 9),
      text: keyword.text,
      count: keyword.count,
      trend: keyword.trend,
      category: keyword.category,
      url: `/news/keywords/${encodeURIComponent(keyword.text)}`,
      percentage: Math.round((keyword.count / 1250) * 100)
    }));
  };

  // حساب حجم الكلمة
  const calculateSize = (count: number, maxCount: number): string => {
    const ratio = count / maxCount;
    if (ratio > 0.8) return 'xxl';
    if (ratio > 0.6) return 'xl';
    if (ratio > 0.4) return 'lg';
    if (ratio > 0.2) return 'md';
    if (ratio > 0.1) return 'sm';
    return 'xs';
  };

  // الحصول على لون عشوائي
  const getRandomColor = (index: number): string => {
    return COLORS[index % COLORS.length];
  };

  // رمز الاتجاه
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-red-500" />;
      default:
        return <Minus className="w-3 h-3 text-yellow-500" />;
    }
  };

  // معالج حدث التمرير
  const handleMouseEnter = (keyword: KeywordData, event: React.MouseEvent) => {
    setHoveredKeyword(keyword);
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  };

  const handleMouseLeave = () => {
    setHoveredKeyword(null);
  };

  // معالج النقر
  const handleKeywordClick = async (keyword: KeywordData) => {
    // تتبع النقرة
    try {
      await fetch('/api/analytics/keyword-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywordId: keyword.id,
          keyword: keyword.text,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('خطأ في تتبع النقر:', error);
    }

    // الانتقال للصفحة
    window.location.href = keyword.url;
  };

  // ترتيب عشوائي للكلمات
  const shuffleArray = (array: KeywordData[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // تأثيرات التحميل الأولي
  useEffect(() => {
    loadKeywords();
  }, []);

  // التحديث التلقائي
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadKeywords, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  // ترتيب الكلمات
  const sortedKeywords = keywordsData.sort((a, b) => b.count - a.count);
  const maxCount = sortedKeywords[0]?.count || 1;
  const shuffledKeywords = shuffleArray(sortedKeywords);

  return (
    <div className={`trending-keywords-container ${className}`}>
      {/* رأس القسم */}
      {showHeader && (
        <div className="trending-keywords-header">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="trending-title">
                <BarChart3 className="inline w-8 h-8 mr-3 text-blue-600" />
                الكلمات الشائعة
              </h2>
              <div className="trending-subtitle">
                الأكثر بحثاً وتداولاً في الموقع
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {autoRefresh && (
                <div className="flex items-center text-green-600 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  تحديث تلقائي
                </div>
              )}
              
              <button
                onClick={loadKeywords}
                disabled={loading}
                className="refresh-btn"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                تحديث
              </button>
            </div>
          </div>
        </div>
      )}

      {/* منطقة سحابة الكلمات */}
      <div 
        ref={cloudRef}
        className={`keywords-cloud ${loading ? 'loading' : ''}`}
      >
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-500" />
              <p className="text-gray-600">جاري تحميل الكلمات المفتاحية...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-red-600">
              <p className="mb-4">خطأ في تحميل البيانات</p>
              <p className="text-sm text-gray-600 mb-4">{error}</p>
              <button
                onClick={loadKeywords}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center items-center gap-3 min-h-[400px] p-6">
            {shuffledKeywords.map((keyword, index) => {
              const size = calculateSize(keyword.count, maxCount);
              const color = getRandomColor(index);
              
              return (
                <button
                  key={keyword.id}
                  onClick={() => handleKeywordClick(keyword)}
                  onMouseEnter={(e) => handleMouseEnter(keyword, e)}
                  onMouseLeave={handleMouseLeave}
                  className={`keyword-item size-${size}`}
                  style={{ 
                    color: color,
                    borderColor: color,
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  {keyword.text}
                  <span className="trend-arrow">
                    {getTrendIcon(keyword.trend)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* تذييل السحابة */}
      {showFooter && (
        <div className="cloud-footer">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {keywordsData.length} كلمة مفتاحية
              </span>
              <span className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
                {keywordsData.filter(k => k.trend === 'up').length} في ارتفاع
              </span>
            </div>
            
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              آخر تحديث: {format(lastUpdate, 'HH:mm - dd/MM/yyyy', { locale: ar })}
            </div>
          </div>
        </div>
      )}

      {/* نافذة المعلومات المنبثقة */}
      {hoveredKeyword && (
        <div
          className="keyword-tooltip"
          style={{
            position: 'fixed',
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translateX(-50%) translateY(-100%)',
            zIndex: 1000
          }}
        >
          <div className="tooltip-content">
            <div className="font-bold text-lg mb-2">{hoveredKeyword.text}</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>عدد المقالات:</span>
                <span className="font-medium">{hoveredKeyword.count}</span>
              </div>
              <div className="flex justify-between">
                <span>النسبة:</span>
                <span className="font-medium">{hoveredKeyword.percentage}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>الاتجاه:</span>
                <div className="flex items-center gap-1">
                  {getTrendIcon(hoveredKeyword.trend)}
                  <span className="font-medium">
                    {hoveredKeyword.trend === 'up' ? 'في ارتفاع' :
                     hoveredKeyword.trend === 'down' ? 'في انخفاض' : 'مستقر'}
                  </span>
                </div>
              </div>
              {hoveredKeyword.category && (
                <div className="flex justify-between">
                  <span>التصنيف:</span>
                  <span className="font-medium">{hoveredKeyword.category}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .trending-keywords-container {
          max-width: 1200px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          padding: 40px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .trending-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
        }

        .trending-subtitle {
          font-size: 1.1rem;
          color: #7f8c8d;
          font-weight: 400;
        }

        .keywords-cloud {
          position: relative;
          background: radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
          border-radius: 15px;
          margin-bottom: 30px;
        }

        .keyword-item {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 8px 16px;
          border-radius: 25px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
          font-weight: 600;
          border: 2px solid transparent;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(5px);
          white-space: nowrap;
          user-select: none;
          opacity: 0;
          transform: translateY(20px);
          animation: fadeInUp 0.6s ease forwards;
        }

        .keyword-item:hover {
          transform: translateY(-5px) scale(1.05);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          background: rgba(255, 255, 255, 0.95);
          border-color: currentColor;
        }

        .keyword-item:active {
          transform: translateY(-2px) scale(1.02);
        }

        .keyword-item.size-xs { font-size: 0.9rem; padding: 6px 12px; }
        .keyword-item.size-sm { font-size: 1.1rem; padding: 8px 14px; }
        .keyword-item.size-md { font-size: 1.4rem; padding: 10px 18px; }
        .keyword-item.size-lg { font-size: 1.8rem; padding: 12px 22px; }
        .keyword-item.size-xl { font-size: 2.2rem; padding: 14px 26px; }
        .keyword-item.size-xxl { font-size: 2.8rem; padding: 16px 30px; }

        .trend-arrow {
          margin-left: 4px;
          opacity: 0.7;
          transition: all 0.3s ease;
        }

        .keyword-item:hover .trend-arrow {
          opacity: 1;
          transform: translateY(-2px);
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          background: linear-gradient(135deg, #4A90E2, #50E3C2);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 25px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .refresh-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(74, 144, 226, 0.3);
        }

        .refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cloud-footer {
          padding-top: 20px;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        .loading {
          position: relative;
          overflow: hidden;
        }

        .loading::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
          animation: shimmer 1.5s infinite;
        }

        .keyword-tooltip {
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 16px;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          pointer-events: none;
          opacity: 0;
          animation: tooltipFadeIn 0.3s ease forwards;
          min-width: 220px;
        }

        .tooltip-content {
          font-size: 0.9rem;
        }

        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        @keyframes tooltipFadeIn {
          to {
            opacity: 1;
          }
        }

        /* تصميم متجاوب */
        @media (max-width: 768px) {
          .trending-keywords-container {
            padding: 20px;
            margin: 10px;
          }
          
          .trending-title {
            font-size: 2rem;
          }
          
          .keyword-item.size-xs { font-size: 0.8rem; }
          .keyword-item.size-sm { font-size: 1rem; }
          .keyword-item.size-md { font-size: 1.2rem; }
          .keyword-item.size-lg { font-size: 1.5rem; }
          .keyword-item.size-xl { font-size: 1.8rem; }
          .keyword-item.size-xxl { font-size: 2.2rem; }
        }

        @media (max-width: 480px) {
          .trending-title {
            font-size: 1.8rem;
          }
          
          .keyword-item.size-xs { font-size: 0.7rem; }
          .keyword-item.size-sm { font-size: 0.9rem; }
          .keyword-item.size-md { font-size: 1.1rem; }
          .keyword-item.size-lg { font-size: 1.3rem; }
          .keyword-item.size-xl { font-size: 1.6rem; }
          .keyword-item.size-xxl { font-size: 2rem; }
        }
      `}</style>
    </div>
  );
}
