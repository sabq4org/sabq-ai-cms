/**
 * مكون سحابة الكلمات للصفحة الرئيسية
 * يظهر أسفل الأخبار المميزة مباشرة
 */

'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, RefreshCw, Hash, Eye } from 'lucide-react';
import { useDarkModeContext } from '@/contexts/DarkModeContext';

interface KeywordData {
  id: string;
  text: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  url?: string;
  size: number; // 1-5 للحجم
}

interface HomeWordCloudProps {
  className?: string;
  maxKeywords?: number;
  showTitle?: boolean;
}

// ألوان تتماشى مع تصميم الموقع
const KEYWORD_COLORS = [
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#06B6D4', // cyan-500
  '#EC4899', // pink-500
  '#84CC16', // lime-500
];

// بيانات تجريبية للكلمات الشائعة
const mockKeywords: KeywordData[] = [
  { id: '1', text: 'السعودية', count: 156, trend: 'up', size: 5, url: '/search?q=السعودية' },
  { id: '2', text: 'الرياض', count: 134, trend: 'up', size: 4, url: '/search?q=الرياض' },
  { id: '3', text: 'اقتصاد', count: 98, trend: 'stable', size: 4, url: '/search?q=اقتصاد' },
  { id: '4', text: 'تقنية', count: 87, trend: 'up', size: 3, url: '/search?q=تقنية' },
  { id: '5', text: 'رؤية 2030', count: 76, trend: 'up', size: 3, url: '/search?q=رؤية+2030' },
  { id: '6', text: 'نيوم', count: 65, trend: 'up', size: 3, url: '/search?q=نيوم' },
  { id: '7', text: 'الذكاء الاصطناعي', count: 54, trend: 'up', size: 2, url: '/search?q=ذكاء+اصطناعي' },
  { id: '8', text: 'الطاقة المتجددة', count: 43, trend: 'stable', size: 2, url: '/search?q=طاقة+متجددة' },
  { id: '9', text: 'المملكة', count: 89, trend: 'stable', size: 3, url: '/search?q=المملكة' },
  { id: '10', text: 'جدة', count: 67, trend: 'down', size: 2, url: '/search?q=جدة' },
  { id: '11', text: 'الدمام', count: 45, trend: 'stable', size: 2, url: '/search?q=الدمام' },
  { id: '12', text: 'القمة العربية', count: 38, trend: 'up', size: 2, url: '/search?q=قمة+عربية' },
  { id: '13', text: 'الاستثمار', count: 56, trend: 'up', size: 2, url: '/search?q=استثمار' },
  { id: '14', text: 'التحول الرقمي', count: 41, trend: 'up', size: 2, url: '/search?q=تحول+رقمي' },
  { id: '15', text: 'البيئة', count: 33, trend: 'stable', size: 1, url: '/search?q=البيئة' },
];

export default function HomeWordCloud({
  className = '',
  maxKeywords = 15,
  showTitle = true
}: HomeWordCloudProps) {
  const { darkMode } = useDarkModeContext();
  const [keywords, setKeywords] = useState<KeywordData[]>([]);
  const [loading, setLoading] = useState(false);
  const [hoveredKeyword, setHoveredKeyword] = useState<string | null>(null);

  // تحميل الكلمات المفتاحية
  const loadKeywords = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics/trending-keywords', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        setKeywords(data.keywords?.slice(0, maxKeywords) || mockKeywords.slice(0, maxKeywords));
      } else {
        // استخدام البيانات التجريبية في حالة فشل API
        setKeywords(mockKeywords.slice(0, maxKeywords));
      }
    } catch (error) {
      console.log('استخدام البيانات التجريبية لسحابة الكلمات');
      setKeywords(mockKeywords.slice(0, maxKeywords));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadKeywords();
  }, [maxKeywords]);

  // الحصول على حجم النص بناءً على size - محسن للجوال
  const getTextSize = (size: number) => {
    switch (size) {
      case 5: return 'text-lg sm:text-2xl md:text-3xl lg:text-4xl';
      case 4: return 'text-base sm:text-xl md:text-2xl lg:text-3xl';
      case 3: return 'text-sm sm:text-lg md:text-xl lg:text-2xl';
      case 2: return 'text-sm sm:text-base md:text-lg lg:text-xl';
      default: return 'text-xs sm:text-sm md:text-base';
    }
  };

  // الحصول على وزن النص
  const getFontWeight = (size: number) => {
    return size >= 4 ? 'font-bold' : size >= 3 ? 'font-semibold' : 'font-medium';
  };

  // الحصول على لون عشوائي
  const getRandomColor = (index: number) => {
    return KEYWORD_COLORS[index % KEYWORD_COLORS.length];
  };

  // التعامل مع النقر على الكلمة
  const handleKeywordClick = (keyword: KeywordData) => {
    if (keyword.url) {
      window.open(keyword.url, '_blank');
    }
  };

  return (
    <div className={`w-full home-word-cloud mobile-optimized ${className}`}>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <div
          className={`word-cloud-container rounded-2xl transition-all duration-300 ${
            darkMode
              ? 'bg-gray-800/50 border border-gray-700/50'
              : 'bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200/50'
          }`}
          style={{
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* العنوان */}
          {showTitle && (
            <div className="p-6 pb-3 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    darkMode ? 'bg-blue-600' : 'bg-blue-500'
                  }`}>
                    <Hash className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      الكلمات الرائجة
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      أكثر المواضيع بحثاً وتفاعلاً اليوم
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={loadKeywords}
                  disabled={loading}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    darkMode
                      ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
                      : 'hover:bg-white/60 text-gray-600 hover:text-gray-700'
                  }`}
                  title="تحديث"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          )}

          {/* سحابة الكلمات */}
          <div className="p-6 word-cloud-container">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full w-8 h-8 border-2 border-blue-500 border-t-transparent"></div>
                <span className="mr-3 text-gray-600 dark:text-gray-400">جارٍ التحميل...</span>
              </div>
            ) : (
              <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 md:gap-6 py-6">
                {keywords.map((keyword, index) => (
                  <button
                    key={keyword.id}
                    onClick={() => handleKeywordClick(keyword)}
                    onMouseEnter={() => setHoveredKeyword(keyword.id)}
                    onMouseLeave={() => setHoveredKeyword(null)}
                    className={`
                      word-cloud-keyword size-${keyword.size}
                      inline-flex items-center gap-2 px-3 py-2 rounded-full
                      transition-all duration-300 transform cursor-pointer
                      ${getTextSize(keyword.size)} ${getFontWeight(keyword.size)}
                      ${hoveredKeyword === keyword.id ? 'scale-105' : ''}
                      ${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-white/50'}
                    `}
                    style={{ 
                      color: getRandomColor(index),
                      textShadow: hoveredKeyword === keyword.id ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
                    }}
                    data-trend={keyword.trend}
                    title={`${keyword.text} - ${keyword.count} مقال`}
                  >
                    <span>{keyword.text}</span>
                    
                    {/* أيقونة الاتجاه */}
                    {keyword.trend === 'up' && (
                      <TrendingUp className="trend-icon up w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                    
                    {/* عداد المقالات للكلمات الكبيرة */}
                    {keyword.size >= 3 && (
                      <span className="keyword-count-badge">
                        {keyword.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* تذييل بالإحصائيات */}
          <div className={`px-6 py-3 rounded-b-2xl ${
            darkMode 
              ? 'bg-gray-800/30 border-t border-gray-700/50' 
              : 'bg-white/30 border-t border-blue-200/50'
          }`}>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <Eye className="w-4 h-4" />
                  <span>{keywords.length} كلمة مفتاحية</span>
                </span>
                <span className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>{keywords.filter(k => k.trend === 'up').length} صاعدة</span>
                </span>
              </div>
              
              <div className="text-gray-500 dark:text-gray-400 text-xs">
                آخر تحديث: منذ دقائق
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
