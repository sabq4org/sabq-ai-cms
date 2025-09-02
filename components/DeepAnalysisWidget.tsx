'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Clock3, Brain, Share2, Eye, TrendingUp, Award, BookOpen, ChevronLeft, Heart, BookmarkPlus, ExternalLink, User, ChevronRight, Plus, Bot, UserCheck, Users } from "lucide-react";
import toast from 'react-hot-toast';
import AnalysisTypeIcon from './deep-analysis/AnalysisTypeIcon';
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

  // جلب البيانات الحقيقية فقط إذا لم يتم تمريرها كـ props
  useEffect(() => {
    const fetchAnalyses = async () => {
      // إذا كانت البيانات متوفرة كـ props، استخدمها
      if (insights && insights.length > 0) {
        setRealAnalyses(insights);
        setLoading(false);
        return;
      }

      // وإلا، جلب البيانات من API
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
  }, [insights]);

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
    <div id="deep-analysis-highlight" className="py-8 relative overflow-hidden bg-[#f8f8f7] dark:bg-gradient-to-br dark:from-blue-900 dark:via-indigo-800 dark:to-purple-900">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* العنوان والوصف */}
        <div className="text-center mb-8 max-w-3xl mx-auto">
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-full shadow-2xl ring-2 ring-white/30">
              <Brain className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg card-title" style={{ wordSpacing: 'normal', letterSpacing: 'normal' }}>
              التحليل العميق من سبق
            </h2>
          </div>
          <p className="text-base sm:text-lg mt-2 text-blue-50 drop-shadow card-description" style={{ wordSpacing: 'normal', letterSpacing: 'normal' }}>
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
                  سيتم تحديث التحليلات العميقة قريباً
                </h3>
                <p className={`text-center mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  نحن نعمل على إعداد تحليلات عميقة بالذكاء الاصطناعي لأحدث الأخبار
                </p>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <Bot className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-700">قيد المعالجة بواسطة الذكاء الاصطناعي</span>
                </div>
              </div>
            ) : (
              displayInsights.slice(0, 3).map((item, index) => {
                const isUnread = !readItems.includes(item.id);
                const hasAI = item.ai_summary;
                const isNew = isNewInsight(item.analyzed_at);
                const tags = item.tags || [];
                const visibleTags = showAllTags[item.id] ? tags : tags.slice(0, 2);
                const remainingTags = tags.length - 2;
                const title = item.metadata?.title || item.article?.title || 'تحليل عميق';
                const summary = item.ai_summary || item.metadata?.summary || item.article?.summary || 'سيتم تحديث الملخص قريباً بواسطة الذكاء الاصطناعي';
                const authorName = item.metadata?.authorName || item.article?.author?.name || 'مجهول';
                const categoryName = item.metadata?.categories?.[0] || item.article?.categories?.[0]?.name || 'عام';
                const url = `/insights/deep/${item.id}`;
                const readTime = item.metadata?.readingTime || item.article?.read_time || 10;
                const views = item.metadata?.views || item.article?.views_count || 0;
                const analysisScore = item.readability_score ? Math.round(Number(item.readability_score) * 100) : null;
                
                // تحديد نوع التحليل الدقيق
                const getAnalysisType = () => {
                  if (hasAI && item.updated_at !== item.analyzed_at) {
                    return { type: 'mixed', label: 'تحليل مشترك', icon: 'user-robot' };
                  } else if (hasAI) {
                    return { type: 'ai', label: 'تحليل AI', icon: 'robot' };
                  } else {
                    return { type: 'human', label: 'تحليل بشري', icon: 'user' };
                  }
                };
                
                const analysisType = getAnalysisType();
                
                return (
                  <Link
                    key={item.id}
                    href={url}
                    onClick={() => markAsRead(item.id)}
                    className={`group block ${
                      darkMode 
                        ? 'bg-gray-800/90 backdrop-blur-sm hover:bg-gray-800/95 border-gray-700 hover:border-gray-600' 
                        : 'bg-white/95 backdrop-blur-sm hover:bg-white border-white/20 hover:border-white/40'
                    } rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden border transition-all duration-300 transform hover:scale-[1.01] hover:translate-y-[-2px]`}
                  >
                    <div className="relative p-5">
                      {/* رأس البطاقة - مضغوط */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {/* أيقونة نوع التحليل */}
                          <div className={`p-1.5 rounded-lg ${
                            analysisType.type === 'ai' 
                              ? darkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-50 text-purple-600'
                              : analysisType.type === 'mixed'
                              ? darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-600'  
                              : darkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-50 text-green-600'
                          }`}>
                            {analysisType.type === 'ai' && <Bot className="w-4 h-4" />}
                            {analysisType.type === 'mixed' && <Users className="w-4 h-4" />}
                            {analysisType.type === 'human' && <User className="w-4 h-4" />}
                          </div>
                          
                          {/* نوع التحليل */}
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            analysisType.type === 'ai' 
                              ? darkMode ? 'bg-purple-900/30 text-purple-300 border border-purple-700/50' : 'bg-purple-50 text-purple-700 border border-purple-200'
                              : analysisType.type === 'mixed'
                              ? darkMode ? 'bg-blue-900/30 text-blue-300 border border-blue-700/50' : 'bg-blue-50 text-blue-700 border border-blue-200'
                              : darkMode ? 'bg-green-900/30 text-green-300 border border-green-700/50' : 'bg-green-50 text-green-700 border border-green-200'
                          }`}>
                            {analysisType.label}
                          </span>
                          
                          {isNew && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-green-100 text-green-700 border border-green-200">
                              جديد
                            </span>
                          )}
                        </div>
                        
                        {/* نقطة القراءة */}
                        {isUnread && (
                          <div className="w-2.5 h-2.5 bg-purple-500 rounded-full"></div>
                        )}
                      </div>

                      {/* التصنيف الفعلي */}
                      <div className="mb-2">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md ${
                            darkMode 
                              ? 'text-orange-300 bg-orange-900/20 border border-orange-700/50' 
                              : 'text-orange-700 bg-orange-50 border border-orange-200'
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // استخدام slug الفئة بدلاً من الاسم
                            const categorySlug = article.category?.slug || 'general';
                            router.push(`/categories/${categorySlug}`);
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          📁 {categoryName}
                        </span>
                      </div>

                      {/* العنوان - مضغوط */}
                      <h3 className={`text-base font-bold mb-2 leading-tight line-clamp-2 min-h-[2.5rem] ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      } group-hover:text-purple-600 transition-colors`}>
                        {title}
                      </h3>

                      {/* الملخص - سطرين فقط */}
                      <p className={`text-sm leading-relaxed line-clamp-2 mb-4 ${
                        darkMode ? 'text-gray-200' : 'text-gray-600'
                      }`}>
                        {summary}
                      </p>

                      {/* الوسوم - مضغوطة */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1.5">
                          {visibleTags.slice(0, 2).map((tag, idx) => (
                            <span 
                              key={idx} 
                              className={`text-xs px-2 py-0.5 rounded-md ${
                                darkMode 
                                  ? 'bg-gray-700/50 text-gray-400 border border-gray-600/50' 
                                  : 'bg-gray-100 text-gray-600 border border-gray-200'
                              }`}
                            >
                              #{tag}
                            </span>
                          ))}
                          {tags.length > 2 && (
                            <span className={`text-xs px-2 py-0.5 rounded-md ${
                              darkMode 
                                ? 'bg-purple-900/30 text-purple-400' 
                                : 'bg-purple-50 text-purple-600'
                            }`}>
                              +{tags.length - 2}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* معلومات سفلية مع أزرار فعالة */}
                      <div className={`flex items-center justify-between pt-3 border-t ${
                        darkMode ? 'border-gray-700/50' : 'border-gray-200/50'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Clock3 className={`w-3.5 h-3.5 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`} />
                            <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              {readTime} د
                            </span>
                          </div>
                          
                          <span className="flex items-center gap-1 text-xs text-blue-600 transition-colors">
                            <Eye className="w-3.5 h-3.5" />
                            {String(views).toLocaleString()}
                          </span>
                          
                          {analysisScore && (
                            <span className="flex items-center gap-1 text-xs text-green-600 transition-colors">
                              <Award className="w-3.5 h-3.5" />
                              {String(analysisScore)}%
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-400'}`}>
                            {item.analyzed_at ? formatDate(item.analyzed_at) : 'التاريخ غير محدد'}
                          </span>
                          <ChevronRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-1 ${
                            darkMode ? 'text-gray-300' : 'text-gray-500'
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