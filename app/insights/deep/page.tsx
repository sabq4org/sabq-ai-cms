'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';

import DeepAnalysisCard from '@/components/deep-analysis/DeepAnalysisCard';
import SmartDeepAnalysisCard from '@/components/deep-analysis/SmartDeepAnalysisCard';
import DeepAnalysisHorizontalScroll from '@/components/deep-analysis/DeepAnalysisHorizontalScroll';
import toast from 'react-hot-toast';
import { 
  Brain,
  Search,
  Grid,
  List,
  Loader2,
  SlidersHorizontal,
  TrendingUp,
  Calendar,
  Eye,
  MessageCircle,
  Share2,
  ChevronRight,
  Filter
} from 'lucide-react';
import { DeepAnalysis } from '@/types/deep-analysis';

export default function DeepAnalysesPage() {
  const [mounted, setMounted] = useState(false);
  const [analyses, setAnalyses] = useState<DeepAnalysis[]>([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState<DeepAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categories, setCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all');
  const [selectedTag, setSelectedTag] = useState('');

  useEffect(() => {
    setMounted(true);
    // التحقق من وجود tag في URL
    const urlParams = new URLSearchParams(window.location.search);
    const tagFromUrl = urlParams.get('tag');
    if (tagFromUrl) {
      setSelectedTag(tagFromUrl);
      setSearchTerm(tagFromUrl);
    }
    fetchAnalyses();
  }, [filter, page]);

  useEffect(() => {
    filterAndSortAnalyses();
  }, [analyses, searchTerm, selectedCategory, sortBy]);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      let url = `/api/deep-analyses?page=${page}&limit=9`;
      
      if (filter !== 'all') {
        url += `&status=${filter}`;
      }
      
      // إضافة timeout لتجنب مشاكل انتهاء المهلة
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 ثواني

      try {
        const response = await fetch(url, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        const data = await response.json();
        
        console.log('📊 Deep Analysis Page API Response:', data); // للتشخيص
      
        if (data.success) {
          // إصلاح قراءة البيانات من API - يمكن أن تكون في data.analyses أو data.data
          const analysesArray = data.analyses || data.data || [];
          const uniqueCategories = [...new Set(analysesArray.flatMap((a: DeepAnalysis) => a.categories || []))];
          setCategories(uniqueCategories as string[]);
          setAnalyses(analysesArray);
          setTotalPages(data.pagination?.totalPages || Math.ceil((data.total || 0) / 10));
        }
      } catch (timeoutError) {
        console.error('Request timeout or error:', timeoutError);
        if (timeoutError instanceof Error && timeoutError.name === 'AbortError') {
          toast.error('انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى.');
        } else {
          toast.error('حدث خطأ في الاتصال بالخادم');
        }
      }
    } catch (error) {
      console.error('Error fetching analyses:', error);
      toast.error('حدث خطأ في تحميل التحليلات');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortAnalyses = () => {
    let filtered = [...analyses];
    if (searchTerm) {
      filtered = filtered.filter(analysis => 
        analysis.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        analysis.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (analysis.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(analysis => 
        (analysis.categories || []).includes(selectedCategory)
      );
    }
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => b.views - a.views);
        break;
      case 'quality':
        filtered.sort((a, b) => b.qualityScore - a.qualityScore);
        break;
    }
    setFilteredAnalyses(filtered);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      calendar: 'gregory',
      numberingSystem: 'latn'
    });
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/20 border-emerald-400/30';
    if (score >= 60) return 'text-amber-400 bg-amber-500/20 border-amber-400/30';
    return 'text-red-400 bg-red-500/20 border-red-400/30';
  };

  const generatePlaceholderImage = (title: string) => {
    const colors = ['#8B5CF6', '#10B981', '#3B82F6', '#EF4444', '#F59E0B'];
    const colorIndex = title.charCodeAt(0) % colors.length;
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colors[colorIndex]};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${colors[(colorIndex + 1) % colors.length]};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#grad)"/>
        <g opacity="0.2">
          <circle cx="100" cy="100" r="40" fill="white"/>
          <circle cx="300" cy="200" r="60" fill="white"/>
          <circle cx="200" cy="250" r="30" fill="white"/>
        </g>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle" opacity="0.8">
          ${title.substring(0, 20)}
        </text>
      </svg>
    `)}`;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'تقنية': 'bg-blue-100 text-blue-800',
      'اقتصاد': 'bg-green-100 text-green-800',
      'سياسة': 'bg-purple-100 text-purple-800',
      'بيئة': 'bg-emerald-100 text-emerald-800',
      'رياضة': 'bg-orange-100 text-orange-800',
      'صحة': 'bg-red-100 text-red-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (!mounted || loading) {
    return (
      <>
        <div className="min-h-screen" style={{ backgroundColor: '#f8f8f7' }}>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                جاري تحميل التحليلات العميقة...
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <div dir="rtl" className="min-h-screen" data-page="deep" data-deep="true" style={{ 
        backgroundColor: '#f8f8f7',
        minHeight: '100vh',
        position: 'relative',
        zIndex: 0
      }}>
        {/* Hero Section */}
        <section className="relative py-16 md:py-20">
          
          <div className="relative max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl shadow-2xl header-main-icon themed-gradient-bg">
                <Brain className="w-10 h-10 text-white header-icon" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                التحليلات العميقة
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
                اكتشف تحليلات معمقة ورؤى ثاقبة مدعومة بالذكاء الاصطناعي
              </p>
              
              {/* إحصائيات التحليلات العميقة */}
              {analyses.length > 0 && (
                <div className="mt-6 inline-flex flex-wrap justify-center items-center gap-4 md:gap-6 rounded-2xl px-4 md:px-6 py-3 border border-[#f0f0ef] shadow-sm stats-container" style={{ backgroundColor: 'transparent' }}>
                  <div className="text-center px-2">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400 stats-icon" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{analyses.length}</div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">تحليل عميق</div>
                  </div>
                  
                  <div className="w-px h-10 bg-gray-300 dark:bg-gray-600 hidden md:block"></div>
                  
                  <div className="text-center px-2">
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400 stats-icon" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {analyses.reduce((sum, a) => sum + a.views, 0) > 999 ? 
                          `${(analyses.reduce((sum, a) => sum + a.views, 0) / 1000).toFixed(1)}k` : 
                          analyses.reduce((sum, a) => sum + a.views, 0)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">مشاهدة</div>
                  </div>
                  
                  <div className="w-px h-10 bg-gray-300 dark:bg-gray-600 hidden md:block"></div>
                  
                  <div className="text-center px-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 stats-icon" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {analyses.length > 0 ? Math.round(analyses.reduce((sum, a) => sum + a.qualityScore, 0) / analyses.length) : 0}%
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">معدل الجودة</div>
                  </div>
                  
                  <div className="w-px h-10 bg-gray-300 dark:bg-gray-600 hidden md:block"></div>
                  
                  <div className="text-center px-2">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 stats-icon" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {analyses.reduce((sum, a) => sum + (a.commentsCount || 0), 0)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">تعليق</div>
                  </div>
                </div>
              )}
              
              {/* Loading indicator for stats */}
              {loading && (
                <div className="mt-6 inline-flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">جاري تحميل الإحصائيات...</span>
                </div>
              )}
            </div>
          </div>
        </section>
        {/* Search Section */}
        <section className="border-b border-gray-200 dark:border-gray-700 sticky top-16 z-10" style={{ backgroundColor: 'transparent' }}>
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="relative w-full max-w-md mx-auto">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث في التحليلات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-12 pl-4 py-3 dark:bg-gray-700 border-2 border-[#f0f0ef] dark:border-gray-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-opacity-50 focus:border-transparent transition-all text-gray-900 dark:text-white"
                style={{ backgroundColor: 'transparent' }}
              />
            </div>
          </div>
        </section>
        {/* Categories Grid */}
        <section className="max-w-7xl mx-auto px-6 py-12" style={{ backgroundColor: 'transparent' }}>
          {filteredAnalyses.length === 0 ? (
            <div className="text-center py-20">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
                darkMode ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                <Brain className={`w-10 h-10 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              </div>
              <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                لم نجد تحليلات تطابق بحثك
              </h3>
              <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                جرّب البحث بكلمات مختلفة أو اختر تصنيفاً آخر
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                إعادة تعيين الفلاتر
              </button>
            </div>
          ) : (
            <>
              {/* عرض الشبكة الموحد للجميع - محسن للموبايل ومحسن للنصوص */}
              <div className={`
                ${viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
                  : 'space-y-6'
                }
              `}>
                {filteredAnalyses.map((analysis) => (
                  <SmartDeepAnalysisCard 
                    key={analysis.id}
                    analysis={{
                      id: analysis.id,
                      title: analysis.title || 'تحليل عميق',
                      slug: analysis.slug,
                      summary: analysis.summary || 'ملخص التحليل غير متوفر',
                      categories: analysis.categories || [],
                      tags: analysis.tags || [],
                      authorName: analysis.authorName,
                      sourceType: analysis.sourceType,
                      analysisType: analysis.analysisType,
                      readingTime: analysis.readingTime,
                      views: analysis.views,
                      likes: analysis.likes,
                      commentsCount: analysis.commentsCount || 0,
                      qualityScore: analysis.qualityScore,
                      status: analysis.status,
                      createdAt: analysis.createdAt,
                      publishedAt: analysis.publishedAt,
                      featuredImage: analysis.featuredImage || undefined
                    }} 
                    darkMode={darkMode}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </div>
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        /* تأثيرات backdrop blur للمتصفحات المختلفة */
        .backdrop-blur-md {
          -webkit-backdrop-filter: blur(12px);
          backdrop-filter: blur(12px);
        }
        /* خلفية سوداء شفافة */
        .bg-black {
          background-color: rgb(0, 0, 0);
        }
        .bg-opacity-20 {
          --tw-bg-opacity: 0.2;
        }
        .bg-opacity-50 {
          --tw-bg-opacity: 0.5;
        }
        /* حدود بيضاء شفافة */
        .border-white {
          border-color: rgb(255, 255, 255);
        }
        .border-opacity-20 {
          --tw-border-opacity: 0.2;
        }
        /* ضمان ظهور النصوص البيضاء */
        .text-white {
          color: rgb(255, 255, 255);
        }
        /* تأثير الظل للنصوص */
        .drop-shadow-lg {
          filter: drop-shadow(0 10px 8px rgba(0, 0, 0, 0.04)) drop-shadow(0 4px 3px rgba(0, 0, 0, 0.1));
        }
        .shadow-xl {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        /* تصميم الهيدر مثل مقترب - الأيقونة بيضاء دائماً والخلفية تتغير */
        [data-page="deep"] .header-main-icon,
        [data-page="deep"] .themed-gradient-bg {
          background: linear-gradient(135deg, var(--theme-primary, #8b5cf6) 0%, var(--theme-secondary, #7c3aed) 100%) !important;
          border: 2px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }
        
        [data-page="deep"] .header-main-icon:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 30px rgba(var(--theme-primary-rgb, 59 130 246), 0.3);
        }
        
        [data-page="deep"] .header-icon {
          color: white !important;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        }
        
        [data-page="deep"] .stats-container {
          background: transparent !important;
          border: 1px solid #f0f0ef !important;
        }
        
        /* إزالة أي خلفيات بيضاء من كل الحاويات */
        [data-page="deep"] section,
        [data-page="deep"] div:not(.stats-container):not(.header-main-icon) {
          background-color: transparent !important;
        }
      `}</style>
    </>
  );
}