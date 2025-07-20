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
  article_id: string;
  ai_summary: string;
  key_topics: string[];
  tags: string[];
  sentiment: string;
  readability_score: number;
  engagement_score: number;
  analyzed_at: string;
  updated_at: string;
  metadata?: {
    title?: string;
    summary?: string;
    authorName?: string;
    categories?: string[];
    readingTime?: number;
    views?: number;
    featuredImage?: string;
  };
  article?: {
    id: string;
    title: string;
    summary: string;
    slug: string;
    featured_image_url?: string;
    published_at: string;
    read_time?: number;
    views_count: number;
    author: {
      id: string;
      name: string;
      avatar?: string;
    };
    categories: Array<{
      id: string;
      name: string;
      slug: string;
      color?: string;
    }>;
  };
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
  const [realAnalyses, setRealAnalyses] = useState<DeepInsight[]>([]);
  const [loading, setLoading] = useState(true);

  // تحديد نوع الجهاز
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // جلب البيانات الحقيقية
  useEffect(() => {
    const fetchAnalyses = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/deep-analyses?limit=3&sortBy=analyzed_at&sortOrder=desc');
        if (response.ok) {
          const data = await response.json();
          setRealAnalyses(data.analyses || []);
        }
      } catch (error) {
        console.error('خطأ في جلب التحليلات:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, []);

  // استخدام البيانات الحقيقية أو فارغة
  const displayInsights = realAnalyses.length > 0 ? realAnalyses : [];

  useEffect(() => {
    // قراءة العناصر المقروءة من localStorage
    const read = localStorage.getItem('readAnalysis');
    if (read) {
      setReadItems(JSON.parse(read));
    }
  }, []);

  const handleShare = (item: DeepInsight) => {
    const url = `/insights/deep/${item.id}`;
    const title = item.article?.title || 'تحليل عميق';
    const summary = item.ai_summary || item.article?.summary;
    
    if (navigator.share) {
      navigator.share({
        title: title,
        text: summary,
        url: window.location.origin + url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.origin + url);
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
          <div className="space-y-4 mb-6">
            {displayInsights.slice(0, 3).map((item) => (
              <MobileDeepAnalysisCard 
                key={item.id} 
                insight={item} 
                darkMode={darkMode} 
              />
            ))}
          </div>
        ) : (
        <div className="relative mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              // عرض skeleton loader أثناء التحميل
              Array.from({ length: 3 }).map((_, index) => (
                <div 
                  key={`skeleton-${index}`}
                  className={`${
                    darkMode 
                      ? 'bg-gray-800/90 backdrop-blur-sm border-gray-700' 
                      : 'bg-white/95 backdrop-blur-sm border-white/20'
                  } rounded-2xl shadow-lg overflow-hidden border animate-pulse`}
                >
                  <div className="relative p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`h-6 w-24 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                      <div className={`h-8 w-8 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                    </div>
                    <div className={`h-6 w-full mb-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                    <div className={`h-6 w-4/5 mb-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                    <div className={`h-4 w-full mb-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                    <div className={`h-4 w-3/4 mb-6 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                    <div className="flex gap-2 mb-6">
                      <div className={`h-6 w-16 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                      <div className={`h-6 w-20 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200/20">
                      <div className="flex items-center gap-3">
                        <div className={`h-4 w-12 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                        <div className={`h-4 w-16 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                      </div>
                      <div className={`h-4 w-8 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                    </div>
                  </div>
                </div>
              ))
            ) : displayInsights.length === 0 ? (
              // عرض حالة عدم وجود بيانات
              <div className="col-span-full flex flex-col items-center justify-center py-16">
                <Brain className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  لا توجد تحليلات عميقة
                </h3>
                <p className={`text-center mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  لم يتم إنشاء أي تحليلات عميقة بعد
                </p>
                <Link 
                  href="/dashboard/deep-analysis/create"
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  إنشاء تحليل جديد
                </Link>
              </div>
            ) : (
              displayInsights.slice(0, 3).map((item, index) => {
                const isUnread = !readItems.includes(item.id);
                const hasAI = item.ai_summary;
                const isNew = isNewInsight(item.analyzed_at);
                const visibleTags = showAllTags[item.id] ? item.tags : item.tags.slice(0, 2);
                const remainingTags = item.tags.length - 2;
                const title = item.metadata?.title || item.article?.title || 'تحليل عميق';
                const summary = item.ai_summary || item.metadata?.summary || item.article?.summary || 'ملخص التحليل غير متوفر';
                const authorName = item.metadata?.authorName || item.article?.author?.name || 'مجهول';
                const categoryName = item.metadata?.categories?.[0] || item.article?.categories?.[0]?.name || 'عام';
                const url = `/insights/deep/${item.id}`;
                const readTime = item.metadata?.readingTime || item.article?.read_time || 10;
                const views = item.metadata?.views || item.article?.views_count || 0;
                const analysisScore = item.readability_score ? Math.round(Number(item.readability_score) * 100) : null;
                
                return (
                  <Link
                    key={item.id}
                    href={url}
                    onClick={() => markAsRead(item.id)}
                    className={`group block ${
                      darkMode 
                        ? 'bg-gray-800/90 backdrop-blur-sm hover:bg-gray-800 border-gray-700' 
                        : 'bg-white/95 backdrop-blur-sm hover:bg-white border-white/20'
                    } rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden border transition-all duration-300 transform hover:scale-[1.02]`}
                  >
                    <div className="relative p-6">
                      {/* رأس البطاقة */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {/* نوع التحليل */}
                          <span className={`text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 ${
                            hasAI 
                              ? darkMode 
                                ? 'bg-purple-900/30 text-purple-300 border border-purple-700/50' 
                                : 'bg-purple-50 text-purple-700 border border-purple-200'
                              : darkMode 
                                ? 'bg-blue-900/30 text-blue-300 border border-blue-700/50' 
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            <Brain className="w-3.5 h-3.5" />
                            {hasAI ? 'تحليل AI' : 'تحليل يدوي'}
                          </span>
                          {isNew && (
                            <span className="text-xs font-medium px-2 py-1 rounded-md bg-green-100 text-green-700 border border-green-200">
                              جديد
                            </span>
                          )}
                        </div>
                        
                        {/* نقطة القراءة */}
                        {isUnread && (
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        )}
                      </div>

                      {/* العنوان */}
                      <h3 className={`text-lg font-bold mb-3 leading-tight line-clamp-2 min-h-[3.5rem] ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      } group-hover:text-purple-600 transition-colors`}>
                        {title}
                      </h3>

                      {/* الملخص */}
                      <p className={`text-sm leading-relaxed line-clamp-3 mb-6 ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {summary}
                      </p>

                      {/* الوسوم */}
                      <div className="mb-6">
                        <div className="flex flex-wrap gap-2">
                          {visibleTags.map((tag, idx) => (
                            <span 
                              key={idx} 
                              className={`text-xs px-2.5 py-1 rounded-md ${
                                darkMode 
                                  ? 'bg-gray-700/50 text-gray-400 border border-gray-600/50' 
                                  : 'bg-gray-100 text-gray-600 border border-gray-200'
                              }`}
                            >
                              #{tag}
                            </span>
                          ))}
                          {remainingTags > 0 && !showAllTags[item.id] && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowAllTags(prev => ({ ...prev, [item.id]: true }));
                              }}
                              className={`text-xs px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors ${
                                darkMode 
                                  ? 'bg-purple-900/30 text-purple-400 hover:bg-purple-900/50 border border-purple-700/50' 
                                  : 'bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200'
                              }`}
                            >
                              <Plus className="w-3 h-3" />
                              +{remainingTags}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* معلومات إضافية */}
                      <div className={`flex items-center justify-between pt-4 border-t ${
                        darkMode ? 'border-gray-700/50' : 'border-gray-200/50'
                      }`}>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <Clock3 className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {readTime} د
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Eye className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {views.toLocaleString()}
                            </span>
                          </div>
                          {analysisScore && (
                            <div className="flex items-center gap-1.5">
                              <Award className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {analysisScore}%
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {formatDate(item.analyzed_at)}
                          </span>
                          <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
        )}

        {/* زر عرض جميع التحليلات */}
        <div className="text-center mt-8">
          <Link 
            href="/insights/deep" 
            className={`inline-flex items-center gap-3 px-8 py-4 font-medium text-sm rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group ${
              darkMode 
                ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' 
                : 'bg-white/90 hover:bg-white text-gray-800 border border-white/30'
            } backdrop-blur-sm`}
          >
            <BookOpen className="w-5 h-5" />
            <span>عرض جميع التحليلات العميقة</span>
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