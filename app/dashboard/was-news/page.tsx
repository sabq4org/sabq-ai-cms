'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { 
  Globe, RefreshCw, AlertTriangle, CheckCircle, 
  Clock, ExternalLink, Filter, Search, Newspaper,
  TrendingUp, Calendar, Tag, Eye, Share2,
  Download, FileText, Zap, Star
} from 'lucide-react';

interface WasNewsItem {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  publishDate: string;
  category?: string;
  imageUrl?: string;
  priority?: string;
  language?: string;
}

interface ApiResponse {
  success: boolean;
  count?: number;
  data?: WasNewsItem[];
  message?: string;
  error?: string;
  timestamp?: string;
}

export default function WasNewsPage() {
  const { darkMode } = useDarkModeContext();
  const [news, setNews] = useState<WasNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('date');

  // جلب الأخبار من API
  const fetchNews = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setRefreshing(true);
      setError(null);

      const response = await fetch('/api/was-news', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        setNews(data.data || []);
        setLastUpdate(new Date().toLocaleString('ar-SA'));
        console.log(`✅ تم جلب ${data.count} خبر من واس`);
      } else {
        setError(data.error || 'فشل في جلب الأخبار');
      }
    } catch (err: any) {
      console.error('خطأ في جلب الأخبار:', err);
      setError('حدث خطأ في الاتصال بالخدمة');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
    
    // تحديث تلقائي كل 10 دقائق
    const interval = setInterval(() => {
      fetchNews(false);
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // فلترة الأخبار
  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.summary && item.summary.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // ترتيب الأخبار
  const sortedNews = [...filteredNews].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
      case 'title':
        return a.title.localeCompare(b.title, 'ar');
      case 'category':
        return (a.category || '').localeCompare(b.category || '', 'ar');
      default:
        return 0;
    }
  });

  // الحصول على التصنيفات الفريدة
  const categories = Array.from(new Set(news.map(item => item.category).filter(Boolean)));

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getTimeAgo = (dateString: string) => {
    try {
      const now = new Date();
      const date = new Date(dateString);
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
      if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`;
      return `منذ ${Math.floor(diffInMinutes / 1440)} يوم`;
    } catch {
      return 'منذ وقت قصير';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  if (loading && news.length === 0) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-500" />
              <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                جاري جلب الأخبار من واس...
              </h3>
              <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                قد تستغرق هذه العملية بضع ثوانٍ
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  أخبار واس
                </h1>
                <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  آخر الأخبار من وكالة الأنباء السعودية
                </p>
              </div>
            </div>
            
            <button
              onClick={() => fetchNews(false)}
              disabled={refreshing}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 ${
                refreshing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg'
              }`}
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'جاري التحديث...' : 'تحديث'}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className={`p-6 rounded-2xl border ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    إجمالي الأخبار
                  </p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {news.length}
                  </p>
                </div>
                <Newspaper className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className={`p-6 rounded-2xl border ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    التصنيفات
                  </p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {categories.length}
                  </p>
                </div>
                <Tag className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <div className={`p-6 rounded-2xl border ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    آخر تحديث
                  </p>
                  <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {lastUpdate || 'لم يتم التحديث'}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            
            <div className={`p-6 rounded-2xl border ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    الحالة
                  </p>
                  <div className="flex items-center gap-2">
                    {error ? (
                      <>
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-red-500">خطأ</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-500">متصل</span>
                      </>
                    )}
                  </div>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <h3 className="font-medium text-red-900">خطأ في جلب الأخبار</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  {error.includes('500') && (
                    <div className="mt-2 text-xs text-red-600">
                      <p>⚠️ خدمة واس تواجه مشاكل تقنية حالياً</p>
                      <p>• يُرجى المحاولة لاحقاً</p>
                      <p>• أو التواصل مع الدعم الفني لواس</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className={`p-6 rounded-2xl border mb-8 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  البحث
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث في الأخبار..."
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-blue-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  />
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  التصنيف
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                >
                  <option value="">جميع التصنيفات</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  ترتيب حسب
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                >
                  <option value="date">التاريخ</option>
                  <option value="title">العنوان</option>
                  <option value="category">التصنيف</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* News Grid */}
        {sortedNews.length === 0 ? (
          <div className={`text-center py-16 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } rounded-2xl`}>
            <Newspaper className={`w-16 h-16 mx-auto mb-4 ${
              darkMode ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <h3 className={`text-xl font-medium mb-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {error 
                ? 'خدمة واس غير متاحة حالياً'
                : searchTerm || selectedCategory 
                  ? 'لا توجد نتائج' 
                  : 'لا توجد أخبار حالياً'
              }
            </h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {error 
                ? 'يُرجى المحاولة لاحقاً أو التواصل مع الدعم الفني'
                : searchTerm || selectedCategory 
                  ? 'جرب البحث بكلمات مختلفة أو غير الفلاتر'
                  : 'تأكد من الاتصال بالإنترنت وحاول مرة أخرى'
              }
            </p>
            {error && error.includes('500') && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md mx-auto">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-yellow-600" />
                  <h4 className="text-sm font-semibold text-yellow-900">معلومات مهمة</h4>
                </div>
                <ul className="text-xs text-yellow-800 space-y-1 text-right">
                  <li>• خدمة واس API تواجه مشاكل من جهة السيرفر</li>
                  <li>• الكود جاهز وسيعمل عند استقرار الخدمة</li>
                  <li>• يمكنك محاولة التحديث بعد فترة</li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedNews.map((item) => (
              <div key={item.id} className={`rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02] ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                {/* Priority Indicator */}
                {item.priority && item.priority !== 'normal' && (
                  <div className={`h-1 ${getPriorityColor(item.priority)}`}></div>
                )}
                
                {/* Image */}
                {item.imageUrl && (
                  <div className="aspect-video relative">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="p-6">
                  {/* Category and Date */}
                  <div className="flex items-center justify-between mb-3">
                    {item.category && (
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        darkMode 
                          ? 'bg-blue-900/50 text-blue-300 border border-blue-700' 
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {item.category}
                      </span>
                    )}
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {getTimeAgo(item.publishDate)}
                    </span>
                  </div>
                  
                  {/* Title */}
                  <h3 className={`text-lg font-bold mb-3 line-clamp-2 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {item.title}
                  </h3>
                  
                  {/* Summary */}
                  {item.summary && (
                    <p className={`text-sm mb-4 line-clamp-3 ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {item.summary}
                    </p>
                  )}
                  
                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatDate(item.publishDate)}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {item.language && item.language !== 'ar' && (
                        <span className={`px-2 py-1 text-xs rounded ${
                          darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {item.language.toUpperCase()}
                        </span>
                      )}
                      <button className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 