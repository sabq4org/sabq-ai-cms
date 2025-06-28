'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Brain, 
  Clock, 
  Eye, 
  TrendingUp, 
  Calendar,
  Filter,
  Search,
  ChevronRight,
  Sparkles,
  BarChart3,
  FileText,
  Star,
  Grid,
  List,
  Loader2,
  Zap,
  Hash,
  MessageCircle,
  Share2,
  Award,
  Cpu,
  Network,
  Activity
} from 'lucide-react';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import toast from 'react-hot-toast';

interface DeepAnalysis {
  id: string;
  title: string;
  slug: string;
  summary: string;
  categories: string[];
  tags: string[];
  authorName: string;
  sourceType: string;
  readingTime: number;
  views: number;
  likes: number;
  qualityScore: number;
  status: string;
  createdAt: string;
  publishedAt: string;
  featuredImage?: string;
}

export default function DeepAnalysesPage() {
  const { darkMode } = useDarkModeContext();
  const [mounted, setMounted] = useState(false);
  const [analyses, setAnalyses] = useState<DeepAnalysis[]>([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState<DeepAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categories, setCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchAnalyses();
  }, []);

  useEffect(() => {
    filterAndSortAnalyses();
  }, [analyses, searchTerm, selectedCategory, sortBy]);

  const fetchAnalyses = async () => {
    try {
      const response = await fetch('/api/deep-analyses');
      if (!response.ok) {
        throw new Error('Failed to fetch analyses');
      }
      const data = await response.json();
      
      // التحقق من هيكل البيانات المُرجعة
      const analysesArray = data.analyses || data;
      
      // استخراج الفئات الفريدة
      const uniqueCategories = [...new Set(analysesArray.flatMap((a: DeepAnalysis) => a.categories || []))];
      setCategories(uniqueCategories as string[]);
      
      setAnalyses(analysesArray);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analyses:', error);
      toast.error('حدث خطأ في تحميل التحليلات');
      setLoading(false);
    }
  };

  const filterAndSortAnalyses = () => {
    let filtered = [...analyses];

    // تصفية حسب البحث
    if (searchTerm) {
      filtered = filtered.filter(analysis => 
        analysis.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        analysis.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        analysis.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // تصفية حسب الفئة
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(analysis => 
        analysis.categories.includes(selectedCategory)
      );
    }

    // ترتيب النتائج
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
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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

  // تجنب مشكلة Hydration بعرض loader حتى يتم التحميل
  if (!mounted) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50">
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-lg text-gray-600">
                جاري تحميل الصفحة...
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                جاري تحميل التحليلات العميقة...
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div dir="rtl" className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Hero Section with AI Background */}
        <div className="relative overflow-hidden">
          {/* AI Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
            {/* Neural Network Pattern */}
            <div className="absolute inset-0 opacity-20">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="neural-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                    <circle cx="50" cy="50" r="1" fill="white" className="animate-pulse" />
                    <line x1="50" y1="50" x2="100" y2="0" stroke="white" strokeWidth="0.5" opacity="0.3" />
                    <line x1="50" y1="50" x2="0" y2="100" stroke="white" strokeWidth="0.5" opacity="0.3" />
                    <line x1="50" y1="50" x2="100" y2="100" stroke="white" strokeWidth="0.5" opacity="0.3" />
                    <line x1="50" y1="50" x2="0" y2="0" stroke="white" strokeWidth="0.5" opacity="0.3" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#neural-pattern)" />
              </svg>
            </div>
            
            {/* Floating AI Elements */}
            <div className="absolute top-10 left-10 animate-float">
              <Brain className="w-20 h-20 text-white opacity-10" />
            </div>
            <div className="absolute bottom-10 right-10 animate-float-delayed">
              <Cpu className="w-24 h-24 text-white opacity-10" />
            </div>
            <div className="absolute top-1/2 left-1/4 animate-float">
              <Network className="w-16 h-16 text-white opacity-10" />
            </div>
            <div className="absolute bottom-1/3 right-1/3 animate-float-delayed">
              <Activity className="w-18 h-18 text-white opacity-10" />
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
            <div className="text-center">
              <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-full mb-6">
                <Brain className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-6 drop-shadow-2xl">
                التحليلات العميقة
              </h1>
              <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto mb-8 font-medium leading-relaxed drop-shadow-lg">
                استكشف تحليلات معمقة ورؤى ثاقبة حول أهم القضايا والموضوعات، مدعومة بالبيانات والذكاء الاصطناعي
              </p>
              
              {/* Stats */}
              <div className="flex items-center justify-center gap-8 mt-8">
                <div className="text-center bg-white/95 backdrop-blur-lg rounded-xl p-6 min-w-[140px] border border-gray-200 shadow-lg">
                  <div className="text-4xl font-black text-gray-800 mb-2">
                    {analyses && analyses.length > 0 ? analyses.length : '0'}
                  </div>
                  <div className="text-sm font-semibold text-gray-600">تحليل عميق</div>
                </div>
                <div className="w-px h-16 bg-gradient-to-b from-transparent via-gray-300 to-transparent" />
                <div className="text-center bg-white/95 backdrop-blur-lg rounded-xl p-6 min-w-[140px] border border-gray-200 shadow-lg">
                  <div className="text-4xl font-black text-gray-800 mb-2">
                    {analyses && analyses.length > 0 
                      ? analyses.reduce((sum, a) => sum + (a.views || 0), 0).toLocaleString('ar-SA')
                      : '0'
                    }
                  </div>
                  <div className="text-sm font-semibold text-gray-600">مشاهدة</div>
                </div>
                <div className="w-px h-16 bg-gradient-to-b from-transparent via-gray-300 to-transparent" />
                <div className="text-center bg-white/95 backdrop-blur-lg rounded-xl p-6 min-w-[140px] border border-gray-200 shadow-lg">
                  <div className="text-4xl font-black text-gray-800 mb-2">
                    {analyses && analyses.length > 0 
                      ? Math.round(analyses.reduce((sum, a) => sum + (a.qualityScore || 0), 0) / analyses.length)
                      : '0'
                    }%
                  </div>
                  <div className="text-sm font-semibold text-gray-600">متوسط الجودة</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className={`sticky top-0 ${darkMode ? 'bg-gray-900' : 'bg-white'} z-40 border-b ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative w-full lg:w-96">
                <Search className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="ابحث في التحليلات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pr-10 pl-4 py-2.5 rounded-lg border focus:outline-none transition-colors text-sm ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-700 focus:border-blue-500' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-400'
                  }`}
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`px-4 py-2.5 rounded-lg border focus:outline-none transition-colors text-sm font-medium ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 text-gray-300 focus:bg-gray-700 focus:border-blue-500' 
                      : 'bg-gray-50 border-gray-200 text-gray-700 focus:bg-white focus:border-blue-400'
                  }`}
                >
                  <option value="newest">الأحدث</option>
                  <option value="oldest">الأقدم</option>
                  <option value="popular">الأكثر مشاهدة</option>
                  <option value="quality">الأعلى جودة</option>
                </select>

                {/* View Mode */}
                <div className={`flex items-center rounded-lg p-1 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'grid' 
                        ? `${darkMode ? 'bg-gray-700 text-blue-400' : 'bg-white text-blue-600'} shadow-sm` 
                        : `${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'list' 
                        ? `${darkMode ? 'bg-gray-700 text-blue-400' : 'bg-white text-blue-600'} shadow-sm` 
                        : `${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : `${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
                }`}
              >
                جميع التحليلات
              </button>
              
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : `${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          {filteredAnalyses.length === 0 ? (
            <div className="text-center py-20">
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <Brain className={`w-12 h-12 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                لا توجد تحليلات متاحة
              </h3>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                لم يتم العثور على تحليلات مطابقة لمعايير البحث
              </p>
            </div>
          ) : (
            <>
              <div className={`${
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' 
                  : 'space-y-6'
              }`}>
                {filteredAnalyses.map((analysis) => (
                  <Link
                    key={analysis.id}
                    href={`/insights/deep/${analysis.id}`}
                    className={`block group ${viewMode === 'list' ? 'flex gap-6' : ''}`}
                  >
                    <div className={`relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                      darkMode ? 'bg-gray-800' : 'bg-white'
                    } ${viewMode === 'list' ? 'flex flex-1' : ''}`}>
                      {/* Featured Image */}
                      <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-64' : 'h-48'}`}>
                        <img 
                          src={analysis.featuredImage || generatePlaceholderImage(analysis.title)} 
                          alt={analysis.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-3 right-3 flex items-center gap-2">
                          <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <Brain className="w-3 h-3" />
                            تحليل عميق
                          </span>
                        </div>
                      </div>

                      <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                        {/* Categories */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {analysis.categories.map((category, index) => (
                            <span 
                              key={index}
                              className={`text-xs px-2 py-1 rounded-full ${
                                darkMode 
                                  ? 'bg-gray-700 text-gray-300' 
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {category}
                            </span>
                          ))}
                        </div>

                        {/* Title */}
                        <h3 className={`text-xl font-bold mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {analysis.title}
                        </h3>

                        {/* Summary */}
                        <p className={`text-sm mb-4 line-clamp-3 leading-relaxed ${
                          darkMode ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          {analysis.summary}
                        </p>

                        {/* Meta Info */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            <span className={`flex items-center gap-1 font-medium ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                              <Clock className="w-4 h-4" />
                              {analysis.readingTime} دقيقة
                            </span>
                            <span className={`flex items-center gap-1 font-medium ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                              <Eye className="w-4 h-4" />
                              {analysis.views.toLocaleString('ar-SA')}
                            </span>
                          </div>
                          <span className={`flex items-center gap-1 font-bold px-2 py-1 rounded-full text-xs border ${getQualityColor(analysis.qualityScore)}`}>
                            <BarChart3 className="w-4 h-4" />
                            {analysis.qualityScore}%
                          </span>
                        </div>

                        {/* Date and Author */}
                        <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                          <div className="flex items-center justify-between text-xs">
                            <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                              {formatDate(analysis.createdAt)}
                            </span>
                            <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {analysis.sourceType === 'gpt' && <Sparkles className="w-3 h-3" />}
                              {analysis.authorName}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && filteredAnalyses.length >= 12 && (
                <div className="text-center mt-16">
                  <button
                    onClick={() => setPage(prev => prev + 1)}
                    disabled={loading}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        جاري التحميل...
                      </>
                    ) : (
                      <>
                        عرض المزيد
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />

      {/* Custom Styles for Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
} 