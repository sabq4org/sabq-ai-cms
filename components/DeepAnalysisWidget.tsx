'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Clock3, Brain, Share2, Eye, TrendingUp, Award, BookOpen, ChevronLeft, Heart, BookmarkPlus, ExternalLink, User, ChevronRight, Plus } from "lucide-react";
import toast from 'react-hot-toast';
import AnalysisTypeIcon from './deep-analysis/AnalysisTypeIcon';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MobileDeepAnalysisCard from './mobile/MobileDeepAnalysisCard';

interface DeepInsight {
  id: string;
  title: string;
  summary: string;
  author: string;
  createdAt: string;
  readTime: number;
  views: number;
  aiConfidence: number;
  tags: string[];
  type: 'AI' | 'تحليل عميق';
  analysisType?: 'manual' | 'ai' | 'mixed';
  url: string;
  isNew?: boolean;
  qualityScore?: number;
  category?: string;
}

interface DeepAnalysisWidgetProps {
  insights: DeepInsight[];
}

export default function DeepAnalysisWidget({ insights }: DeepAnalysisWidgetProps) {
  const [readItems, setReadItems] = useState<string[]>([]);
  const { resolvedTheme, mounted } = useTheme();
  const darkMode = resolvedTheme === 'dark';
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAllTags, setShowAllTags] = useState<{ [key: string]: boolean }>({});
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  // تحديد نوع الجهاز
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // بيانات افتراضية للعرض
  const defaultInsights: DeepInsight[] = [
    {
      id: 'default-1',
      title: 'تحليل عميق: مستقبل الذكاء الاصطناعي في المملكة',
      summary: 'دراسة شاملة حول تطور تقنيات الذكاء الاصطناعي وتأثيرها على الاقتصاد السعودي',
      author: 'فريق التحليل',
      createdAt: new Date().toISOString(),
      readTime: 15,
      views: 1250,
      aiConfidence: 95,
      tags: ['ذكاء اصطناعي', 'اقتصاد', 'تقنية'],
      type: 'AI',
      analysisType: 'ai',
      url: '/insights/deep/ai-future-ksa',
      isNew: true,
      qualityScore: 92,
      category: 'تقنية'
    },
    {
      id: 'default-2',
      title: 'رؤية 2030: تحليل التقدم والإنجازات',
      summary: 'تقييم شامل للمشاريع المنجزة والأهداف المحققة في إطار رؤية المملكة 2030',
      author: 'د. عبدالله السالم',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      readTime: 20,
      views: 3200,
      aiConfidence: 88,
      tags: ['رؤية 2030', 'اقتصاد', 'تنمية'],
      type: 'تحليل عميق',
      analysisType: 'manual',
      url: '/insights/deep/vision-2030-progress',
      qualityScore: 89,
      category: 'اقتصاد'
    },
    {
      id: 'default-3',
      title: 'التحول الرقمي في القطاع الحكومي',
      summary: 'كيف تسهم التقنيات الحديثة في تطوير الخدمات الحكومية وتحسين تجربة المواطن',
      author: 'م. سارة الأحمد',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      readTime: 12,
      views: 890,
      aiConfidence: 91,
      tags: ['حكومة رقمية', 'تقنية', 'خدمات'],
      type: 'AI',
      analysisType: 'mixed',
      url: '/insights/deep/digital-transformation',
      qualityScore: 87,
      category: 'تقنية'
    }
  ];

  // استخدام البيانات الافتراضية إذا لم تكن هناك insights
  const displayInsights = insights.length > 0 ? insights : defaultInsights;

  useEffect(() => {
    // قراءة العناصر المقروءة من localStorage
    const read = localStorage.getItem('readAnalysis');
    if (read) {
      setReadItems(JSON.parse(read));
    }
  }, []);

  const handleShare = (item: DeepInsight) => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: item.summary,
        url: window.location.origin + item.url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.origin + item.url);
      toast.success('تم نسخ الرابط');
    }
  };

  const markAsRead = (id: string) => {
    const newReadItems = [...readItems, id];
    setReadItems(newReadItems);
    localStorage.setItem('readAnalysis', JSON.stringify(newReadItems));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `منذ ${diffInMinutes} دقيقة`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `منذ ${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `منذ ${days} ${days === 1 ? 'يوم' : 'أيام'}`;
    }
  };

  // تحديد ما إذا كان التحليل جديد (خلال آخر 24 ساعة)
  const isNewInsight = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    return diffInHours < 24;
  };

  // التعامل مع التمرير
  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340; // عرض البطاقة + المسافة
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const targetScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  // تتبع التمرير الحالي
  useEffect(() => {
    const handleScrollUpdate = () => {
      if (scrollContainerRef.current) {
        const scrollLeft = scrollContainerRef.current.scrollLeft;
        const cardWidth = 340; // عرض البطاقة + المسافة
        const index = Math.round(scrollLeft / cardWidth);
        setCurrentIndex(index);
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScrollUpdate);
      return () => scrollContainer.removeEventListener('scroll', handleScrollUpdate);
    }
  }, []);

  return (
    <div id="deep-analysis-highlight" className="py-8 relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* العنوان والوصف */}
        <div className="text-center mb-8 max-w-3xl mx-auto">
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-full shadow-2xl ring-2 ring-white/30">
              <Brain className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
              التحليل العميق من سبق
            </h2>
          </div>
          <p className="text-base sm:text-lg mt-2 text-white/90 drop-shadow">
            رؤى استراتيجية ودراسات معمقة بالذكاء الاصطناعي
          </p>
        </div>

        {/* البطاقات - صف أفقي قابل للتمرير */}
        {isMobile ? (
          // عرض الموبايل - قائمة عمودية
          <div className="space-y-3 mb-6">
            {displayInsights.slice(0, 5).map((item) => (
              <MobileDeepAnalysisCard 
                key={item.id} 
                insight={item} 
                darkMode={darkMode} 
              />
            ))}
          </div>
        ) : (
        <div className="relative mb-6">
          {/* أزرار التمرير للشاشات الكبيرة */}
          {displayInsights.length > 3 && (
            <>
              <button 
                onClick={() => handleScroll('right')}
                className={`hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full shadow-lg backdrop-blur-sm transition-all ${
                  darkMode 
                    ? 'bg-gray-800/90 hover:bg-gray-700 text-white' 
                    : 'bg-white/90 hover:bg-gray-100 text-gray-800'
                } ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={currentIndex === 0}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => handleScroll('left')}
                className={`hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full shadow-lg backdrop-blur-sm transition-all ${
                  darkMode 
                    ? 'bg-gray-800/90 hover:bg-gray-700 text-white' 
                    : 'bg-white/90 hover:bg-gray-100 text-gray-800'
                } ${currentIndex >= displayInsights.length - 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={currentIndex >= displayInsights.length - 3}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </>
          )}

          <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-4 pb-4" style={{ 
              width: displayInsights.length <= 3 ? '100%' : 'max-content',
              justifyContent: displayInsights.length <= 3 ? 'center' : 'flex-start'
            }}>
              {displayInsights.slice(0, 6).map((item, index) => {
                const isUnread = !readItems.includes(item.id);
                const isAI = item.type === 'AI';
                const isNew = isNewInsight(item.createdAt);
                const visibleTags = showAllTags[item.id] ? item.tags : item.tags.slice(0, 2);
                const remainingTags = item.tags.length - 2;
                
                return (
                  <div 
                    key={item.id} 
                    className={`cursor-pointer w-80 lg:w-96 flex-shrink-0 ${
                      darkMode 
                        ? 'bg-gray-800/90 backdrop-blur-sm hover:bg-gray-800 border-gray-700' 
                        : 'bg-white/95 backdrop-blur-sm hover:bg-white border-white/20'
                    } rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden border transition-all duration-300 transform hover:scale-[1.02] group relative`}
                  >
                    {/* خلفية فاتحة للبطاقة - محذوفة لأنها تتعارض مع التصميم */}

                    <div className="relative p-5">
                      {/* رأس البطاقة - مبسط */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {/* نوع التحليل */}
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${
                            isAI 
                              ? darkMode 
                                ? 'bg-purple-900/30 text-purple-300' 
                                : 'bg-purple-100 text-purple-700'
                              : darkMode 
                                ? 'bg-blue-900/30 text-blue-300' 
                                : 'bg-blue-100 text-blue-700'
                          }`}>
                            <Brain className="w-3.5 h-3.5" />
                            {isAI ? 'تحليل AI' : 'تحليل عميق'}
                          </span>
                          {/* التصنيف */}
                          {item.category && (
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {item.category}
                            </span>
                          )}
                        </div>
                        {/* أيقونة صغيرة للتفاعل */}
                        <Link 
                          href={item.url}
                          onClick={(e) => { e.stopPropagation(); markAsRead(item.id); }}
                          className={`p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 ${
                            darkMode 
                              ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                              : 'bg-purple-600 hover:bg-purple-700 text-white'
                          } shadow-lg hover:shadow-xl transform hover:scale-110`}
                          title="عرض التحليل"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>

                      {/* العنوان - محسن للرؤية ومحسن لـ Safari */}
                      <Link href={item.url} onClick={() => markAsRead(item.id)}>
                        <h3 className={`
                          text-xl font-bold mb-3 transition-colors cursor-pointer leading-tight
                          line-clamp-2 min-h-[3.5rem] deep-analysis-title arabic-text
                        `} 
                        title={item.title}
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          color: darkMode ? '#ffffff' : '#1a202c',
                          fontWeight: '700',
                          textShadow: darkMode ? '0 1px 2px rgba(0, 0, 0, 0.3)' : '0 1px 2px rgba(0, 0, 0, 0.1)',
                          textOverflow: 'ellipsis',
                          lineHeight: '1.3'
                        }}
                        >
                          {item.title || 'تحليل عميق'}
                        </h3>
                      </Link>

                      {/* الملخص - محسن لـ Safari */}
                      <p className="text-sm line-clamp-2 mb-4 deep-analysis-summary arabic-text"
                         style={{
                           color: darkMode ? '#e2e8f0' : '#4a5568',
                           display: '-webkit-box',
                           WebkitLineClamp: 2,
                           WebkitBoxOrient: 'vertical',
                           overflow: 'hidden',
                           lineHeight: '1.6'
                         }}
                         title={item.summary}>
                        {item.summary || 'ملخص التحليل غير متوفر'}
                      </p>

                      {/* الوسوم - بحد أقصى سطرين */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1.5">
                          {visibleTags.map((tag, idx) => (
                            <span 
                              key={idx} 
                              className={`text-xs px-2 py-1 rounded-md ${
                                darkMode 
                                  ? 'bg-gray-700/50 text-gray-400' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              #{tag}
                            </span>
                          ))}
                          {remainingTags > 0 && !showAllTags[item.id] && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowAllTags(prev => ({ ...prev, [item.id]: true }));
                              }}
                              className={`text-xs px-2 py-1 rounded-md flex items-center gap-1 transition-colors ${
                                darkMode 
                                  ? 'bg-purple-900/30 text-purple-400 hover:bg-purple-900/50' 
                                  : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                              }`}
                            >
                              <Plus className="w-3 h-3" />
                              {remainingTags}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* معلومات سفلية - مبسطة */}
                      <div className={`flex items-center justify-between text-xs pt-4 border-t ${
                        darkMode ? 'border-gray-700/50 text-gray-400' : 'border-gray-100 text-gray-500'
                      }`}>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Clock3 className="w-3.5 h-3.5 opacity-60" />
                            {item.readTime} د
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 opacity-60" />
                            {item.views > 999 ? `${(item.views / 1000).toFixed(1)}k` : item.views}
                          </span>
                        </div>
                        {item.qualityScore && (
                          <span className={`text-xs font-bold ${
                            item.qualityScore >= 90 ? 'text-green-600' : 
                            item.qualityScore >= 80 ? 'text-yellow-600' : 'text-gray-500'
                          }`}>
                            {item.qualityScore}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* مؤشرات التمرير للموبايل */}
          {displayInsights.length > 1 && (
            <div className="flex justify-center gap-2 mt-4 lg:hidden">
              {displayInsights.slice(0, 6).map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (scrollContainerRef.current) {
                      const cardWidth = 320;
                      scrollContainerRef.current.scrollTo({
                        left: index * (cardWidth + 16),
                        behavior: 'smooth'
                      });
                    }
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentIndex === index 
                      ? darkMode ? 'bg-purple-400 w-6' : 'bg-purple-600 w-6'
                      : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                  }`}
                  aria-label={`الذهاب إلى البطاقة ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
        )}

        {/* زر استكشاف المزيد - محسّن */}
        <div className="text-center">
          <Link 
            href="/insights/deep" 
            className={`inline-flex items-center gap-2 px-6 py-3 font-medium text-sm rounded-full transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg group ${
              darkMode 
                ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>جميع التحليلات العميقة</span>
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <style jsx>{`
        /* إخفاء شريط التمرير */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}