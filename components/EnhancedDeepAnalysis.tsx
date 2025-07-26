'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Brain, 
  Eye, 
  Clock, 
  TrendingUp, 
  Award, 
  Bookmark, 
  Share2,
  ExternalLink,
  User,
  Star,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useDarkModeContext } from '@/contexts/DarkModeContext';

interface DeepAnalysisItem {
  id: string;
  title: string;
  summary: string;
  author: string;
  createdAt: string;
  readTime: number;
  views: number;
  reactions: number;
  category: string;
  tags: string[];
  isExclusive?: boolean;
  isPremium?: boolean;
  slug: string;
  confidence?: number;
}

interface EnhancedDeepAnalysisProps {
  className?: string;
}

export default function EnhancedDeepAnalysis({ className = '' }: EnhancedDeepAnalysisProps) {
  const { darkMode } = useDarkModeContext();
  const [analyses, setAnalyses] = useState<DeepAnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchRealAnalyses = async () => {
      try {
        // جلب البيانات من API المحسن
        const response = await fetch('/api/enhanced-analysis');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.analyses?.length > 0) {
            setAnalyses(data.analyses.slice(0, 6)); // أفضل 6 تحليلات
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.log('لا توجد تحليلات متاحة حالياً:', error);
        setAnalyses([]);
      }
      
      setLoading(false);
    };

    fetchRealAnalyses();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'اقتصاد': return '📈';
      case 'تقنية': return '💻';
      case 'سياحة': return '✈️';
      case 'صحة': return '🏥';
      case 'تعليم': return '📚';
      case 'رياضة': return '⚽';
      default: return '📰';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `منذ ${diffHours} ساعة`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `منذ ${diffDays} يوم`;
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, analyses.length - 2));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, analyses.length - 2)) % Math.max(1, analyses.length - 2));
  };

  if (loading) {
    return (
      <div className={`py-8 ${className}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-200 dark:bg-gray-800 rounded-lg h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className={`py-8 ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* العنوان والتنقل */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                التحليل العميق من سبق
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                تحليلات شاملة ورؤى عميقة للأحداث المهمة
              </p>
            </div>
          </div>

          {/* أزرار التنقل */}
          {analyses.length > 3 && (
            <div className="flex items-center gap-2">
              <button
                onClick={prevSlide}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 
                           dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={nextSlide}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 
                           dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* شبكة التحليلات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analyses.slice(currentIndex, currentIndex + 3).map((analysis, index) => (
            <div
              key={analysis.id}
              className={`
                relative group rounded-xl overflow-hidden shadow-lg hover:shadow-xl 
                transition-all duration-300 transform hover:-translate-y-1
                ${darkMode 
                  ? 'bg-gray-800 border border-gray-700' 
                  : 'bg-white border border-gray-200'
                }
              `}
            >
              {/* شارات الجودة */}
              <div className="absolute top-4 left-4 z-10 flex gap-2">
                {analysis.isExclusive && (
                  <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white 
                                   text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    حصري
                  </span>
                )}
                {analysis.isPremium && (
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white 
                                   text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    مميز
                  </span>
                )}
              </div>

              {/* المحتوى */}
              <div className="p-6">
                {/* التصنيف والوقت */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getCategoryIcon(analysis.category)}</span>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {analysis.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(analysis.createdAt)}</span>
                  </div>
                </div>

                {/* العنوان */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 
                               line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 
                               transition-colors">
                  {analysis.title}
                </h3>

                {/* الملخص */}
                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">
                  {analysis.summary}
                </p>

                {/* التاجات */}
                {analysis.tags && analysis.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {analysis.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                                   text-xs px-2 py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                    {analysis.tags.length > 3 && (
                      <span className="text-gray-500 dark:text-gray-400 text-xs">
                        +{analysis.tags.length - 3} مزيداً
                      </span>
                    )}
                  </div>
                )}

                {/* الإحصائيات */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{analysis.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>{analysis.reactions}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{analysis.readTime} دقيقة</span>
                    </div>
                  </div>
                </div>

                {/* الكاتب */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <User className="w-4 h-4" />
                    <span>{analysis.author}</span>
                  </div>

                  {analysis.confidence && (
                    <div className="flex items-center gap-1">
                      <div className={`
                        w-2 h-2 rounded-full
                        ${analysis.confidence >= 90 ? 'bg-green-500' : 
                          analysis.confidence >= 80 ? 'bg-yellow-500' : 'bg-red-500'}
                      `}></div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {analysis.confidence}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* أزرار العمل */}
              <div className="px-6 pb-6">
                <div className="flex items-center gap-3">
                  <Link
                    href={`/deep-analysis/${analysis.slug}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white 
                               font-medium py-2 px-4 rounded-lg transition-colors 
                               flex items-center justify-center gap-2"
                  >
                    <span>قراءة التحليل</span>
                    <ExternalLink className="w-4 h-4" />
                  </Link>

                  <button
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                               hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    title="حفظ للقراءة لاحقاً"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>

                  <button
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                               hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    title="مشاركة"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* تأثير الـ hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent 
                              opacity-0 group-hover:opacity-100 transition-opacity 
                              pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* رابط عرض المزيد */}
        <div className="text-center mt-8">
          <Link
            href="/deep-analysis"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 
                       text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            <span>عرض جميع التحليلات</span>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
