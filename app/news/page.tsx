'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { getArticleLink } from '@/lib/utils';
import './news-styles.css';
import '../categories/categories-fixes.css';
import { 
  Newspaper, Search, Loader2, Tag, ArrowRight, Calendar, Clock, Eye, Heart,
  Grid, List, ChevronRight, Sparkles, Zap, User, ArrowLeft
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  excerpt?: string;
  summary?: string;
  featured_image?: string;
  category_id: number;
  category?: {
    id: number;
    name: string;
    slug: string;
    color?: string;
  };
  category_name?: string;
  author_name?: string;
  author_id?: string;
  views_count?: number;
  views?: number;
  likes_count?: number;
  created_at: string;
  published_at?: string;
  reading_time?: number;
  is_breaking?: boolean;
  breaking?: boolean;
  is_featured?: boolean;
  featured?: boolean;
  status?: string;
}

interface Category {
  id: number;
  name?: string;
  name_ar: string;
  name_en?: string;
  slug: string;
  icon?: string;
  color?: string;
  color_hex?: string;
  articles_count?: number;
  is_active?: boolean;
}

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'views' | 'likes'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // جلب التصنيفات
  useEffect(() => {
    fetchCategories();
  }, []);
  
  // جلب المقالات
  useEffect(() => {
    fetchArticles();
  }, [selectedCategory, page]);

  // فلترة وترتيب المقالات
  useEffect(() => {
    const filtered = articles.filter(article =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (article.excerpt && article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (article.summary && article.summary.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // ترتيب المقالات
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'views':
          return ((b.views_count || b.views || 0) - (a.views_count || a.views || 0));
        case 'likes':
          return ((b.likes_count || 0) - (a.likes_count || 0));
        case 'newest':
        default:
          return new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime();
      }
    });

    setFilteredArticles(sorted);
  }, [articles, sortBy, searchTerm]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      let categoriesArray: Category[] = [];
      if (Array.isArray(data)) {
        categoriesArray = data;
      } else if (data.categories && Array.isArray(data.categories)) {
        categoriesArray = data.categories;
      } else if (data.data && Array.isArray(data.data)) {
        categoriesArray = data.data;
      }
      setCategories(categoriesArray);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      let url = '/api/articles?status=published&limit=20';
      if (selectedCategory) {
        url += `&category_id=${selectedCategory}`;
      }
      if (page > 1) {
        url += `&page=${page}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      let articlesArray: Article[] = [];
      if (data && data.data && Array.isArray(data.data)) {
        articlesArray = data.data;
      } else if (data && data.articles && Array.isArray(data.articles)) {
        articlesArray = data.articles;
      } else if (Array.isArray(data)) {
        articlesArray = data;
      }
      
      // تحويل البيانات
      const transformedArticles = articlesArray.map((article: any) => ({
        ...article,
        views_count: article.views_count || article.views || 0,
        likes_count: article.likes_count || 0,
        category_name: article.category_name || article.category?.name || getCategoryName(article.category_id),
        author_name: article.author_name || article.author?.name || 'غير محدد',
        published_at: article.published_at || article.created_at,
        is_featured: article.featured || article.is_featured || false,
        is_breaking: article.breaking === true || article.is_breaking === true || false,
        excerpt: article.excerpt || article.summary
      }));
      
      if (page === 1) {
        setArticles(transformedArticles);
      } else {
        setArticles(prev => [...prev, ...transformedArticles]);
      }
      setHasMore(transformedArticles.length === 20);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name_ar || category?.name_en || 'عام';
  };

  const getCategoryColor = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || category?.color_hex || '#3B82F6';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      calendar: 'gregory',
      numberingSystem: 'latn'
    });
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-16">
          <div className="absolute inset-0 bg-black/20" />
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
            <div className="inline-flex items-center justify-center p-8 mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full blur-xl opacity-70 animate-pulse" />
              <div className="relative bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full p-6 shadow-2xl">
                <Newspaper className="w-12 h-12 text-white drop-shadow-lg" />
              </div>
            </div>
            <h1 className="text-5xl font-black text-white mb-6 drop-shadow-lg">
              أخبار سبق
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto mb-8">
              تابع آخر الأخبار والمستجدات المحلية والعالمية لحظة بلحظة
            </p>
            {/* Stats */}
            <div className="inline-flex flex-row items-center gap-4 sm:gap-8 bg-black bg-opacity-20 backdrop-blur-md rounded-2xl px-6 sm:px-8 py-4 shadow-xl border border-white border-opacity-20">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1 drop-shadow-lg">{articles.length}</div>
                <div className="text-xs sm:text-sm text-white">مقال منشور</div>
              </div>
              <div className="w-px h-12 bg-white bg-opacity-50"></div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1 drop-shadow-lg">{categories.length}</div>
                <div className="text-xs sm:text-sm text-white">تصنيف متنوع</div>
              </div>
              <div className="w-px h-12 bg-white bg-opacity-50"></div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1 drop-shadow-lg">24/7</div>
                <div className="text-xs sm:text-sm text-white">تغطية مستمرة</div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Search and Filters Section */}
        <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-10 shadow-md">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative w-full md:w-96">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث في الأخبار..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-12 pl-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 focus:border-transparent transition-all text-gray-900 dark:text-white"
                />
              </div>
              {/* Sort and View Options */}
              <div className="flex items-center gap-4">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">الأحدث</option>
                  <option value="views">الأكثر مشاهدة</option>
                  <option value="likes">الأكثر إعجاباً</option>
                </select>
                {/* View Mode */}
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                    title="عرض شبكة"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                    title="عرض قائمة"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Articles Section */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
          {loading && page === 1 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">جاري تحميل الأخبار...</p>
            </div>
          ) : filteredArticles.length > 0 ? (
            <>
              {/* Mobile View */}
              <div className="md:hidden space-y-4">
                  {filteredArticles.map((article) => (
                  <Link key={article.id} href={getArticleLink(article)} className="block">
                    <article className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden active:scale-[0.98] transition-transform">
                      {/* Mobile Card Layout */}
                      <div className="flex p-4 gap-3">
                        {/* Thumbnail */}
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                          {article.featured_image ? (
                            <Image
                              src={article.featured_image}
                              alt={article.title || 'صورة المقال'}
                              fill
                              className="object-cover"
                              sizes="96px"
                              priority={false}
                              unoptimized={article.featured_image.includes('cloudinary.com')}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Newspaper className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                            </div>
                          )}
                          {/* Urgent Badge */}
                          {article.is_breaking && (
                            <div className="absolute top-1 right-1">
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded">
                                <Zap className="w-2.5 h-2.5" />
                                عاجل
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Title - 2 lines max */}
                          <h3 className={`text-[15px] font-semibold leading-tight mb-2 line-clamp-2 ${
                            article.is_breaking 
                              ? 'text-red-700 dark:text-red-400' 
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {article.title}
                          </h3>
                          
                          {/* Meta Info */}
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                            {/* Category */}
                            {article.category_name && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium text-white"
                                style={{ backgroundColor: getCategoryColor(article.category_id) }}>
                                <Tag className="w-2.5 h-2.5" />
                                {article.category_name}
                              </span>
                            )}
                            {/* Date */}
                            <span className="flex items-center gap-0.5">
                              <Calendar className="w-3 h-3" />
                              {formatDate(article.published_at || article.created_at)}
                            </span>
                            {/* Views */}
                            <span className="flex items-center gap-0.5">
                              <Eye className="w-3 h-3" />
                              {(article.views_count || 0) > 0 ? (article.views_count || 0).toLocaleString('ar-SA') : 'جديد'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Arrow */}
                        <div className="flex items-center">
                          <ArrowLeft className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </article>
                  </Link>
                  ))}
                </div>

              {/* Desktop View - Keep existing code */}
              <div className="hidden md:block">
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredArticles.map((article) => (
                      <Link key={article.id} href={getArticleLink(article)} className="group block">
                        <article className={`article-card h-full rounded-3xl overflow-hidden shadow-xl dark:shadow-gray-900/50 transition-all duration-300 ${
                          article.is_breaking 
                            ? 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800'
                            : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700'
                        }`}>
                          {/* Keep existing desktop card content */}
                          {/* صورة المقال */}
                          <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
                            {article.featured_image ? (
                              <Image
                                src={article.featured_image}
                                alt={article.title || 'صورة المقال'}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                priority={false}
                                unoptimized={article.featured_image.includes('cloudinary.com')}
                                onError={(e) => {
                                  console.error('خطأ في تحميل الصورة:', article.featured_image);
                                  const target = e.currentTarget as HTMLImageElement;
                                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZDEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojRTVFN0VCO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNEMUQ1REI7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCNncmFkMSkiLz4KICA8cGF0aCBkPSJNMzAwIDIwMCBMNTAwIDIwMCBMNTAwIDQwMCBMMzAwIDQwMCBaIiBmaWxsPSIjOUNBM0FGIiBvcGFjaXR5PSIwLjUiLz4KICA8Y2lyY2xlIGN4PSI0MDAiIGN5PSIzMDAiIHI9IjUwIiBmaWxsPSIjOUNBM0FGIiBvcGFjaXR5PSIwLjUiLz4KICA8dGV4dCB4PSI0MDAiIHk9IjQ1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSIjNkI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBvcGFjaXR5PSIwLjgiPgogICAgINi12YjYsdipINin2YTZhNmC2KfZhAogIDwvdGV4dD4KPC9zdmc+';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                                <Newspaper className="w-16 h-16 text-gray-400 dark:text-gray-600" />
                              </div>
                            )}
                            {/* Category Badge */}
                            {article.category_name && (
                              <div className="absolute top-3 right-3">
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white backdrop-blur-sm"
                                  style={{ backgroundColor: getCategoryColor(article.category_id) + 'ee' }}>
                                  <Tag className="w-3 h-3" />
                                  {article.category_name}
                                </span>
                              </div>
                            )}
                            {/* معلومات أسفل الصورة */}
                            <div className="absolute bottom-3 right-3 left-3 flex gap-2">
                              {/* وقت القراءة */}
                              {article.reading_time && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-black/70 text-white backdrop-blur-sm">
                                  <Clock className="w-3 h-3" />
                                  {article.reading_time} دقيقة
                                </span>
                              )}
                              {/* اسم الكاتب */}
                              {article.author_name && article.author_name !== 'غير محدد' && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-black/70 text-white backdrop-blur-sm">
                                  <User className="w-3 h-3" />
                                  {article.author_name}
                                </span>
                              )}
                            </div>
                            {/* شارة عاجل */}
                            {article.is_breaking && (
                              <div className="absolute top-3 left-3">
                                <span className="urgent-badge inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white backdrop-blur-sm">
                                  <Zap className="w-3 h-3" />
                                  عاجل
                                </span>
                              </div>
                            )}
                            {/* شارة مميز */}
                            {article.is_featured && (
                              <div className="absolute top-12 left-3">
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-white backdrop-blur-sm">
                                  <Sparkles className="w-3 h-3" />
                                  مميز
                                </span>
                              </div>
                            )}
                          </div>
                          {/* محتوى البطاقة */}
                          <div className="p-5">
                            {/* العنوان */}
                            <h4 className={`font-bold text-[15px] leading-[1.4] mb-3 line-clamp-3 ${
                              article.is_breaking 
                                ? 'text-red-700 dark:text-red-400' 
                                : 'text-gray-900 dark:text-white'
                            } group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}>
                              {article.title}
                            </h4>
                            {/* الملخص */}
                            {article.excerpt && (
                              <p className="text-[13px] leading-relaxed mb-4 line-clamp-2 text-gray-600 dark:text-gray-400">
                                {article.excerpt}
                              </p>
                            )}
                            {/* التفاصيل السفلية */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                              {/* المعلومات */}
                              <div className="flex flex-col gap-1">
                                {/* التاريخ */}
                                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(article.published_at || article.created_at)}
                                </div>
                                {/* المشاهدات */}
                                <div className="flex items-center gap-3 text-xs">
                                  <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                    <Eye className="w-3 h-3" />
                                    {(article.views_count || 0) > 0 ? (article.views_count || 0).toLocaleString('ar-SA') : 'جديد'}
                                  </span>
                                  {article.likes_count && article.likes_count > 0 && (
                                    <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                      <Heart className="w-3 h-3" />
                                      {article.likes_count.toLocaleString('ar-SA')}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {/* زر القراءة */}
                              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                                <ArrowLeft className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              </div>
                            </div>
                          </div>
                        </article>
                      </Link>
                  ))}
                </div>
              ) : (
                  <div className="space-y-4">
                    {filteredArticles.map((article) => (
                      <Link key={article.id} href={getArticleLink(article)} className="group block">
                        <article className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 flex gap-6 ${
                          article.is_breaking 
                            ? 'border-2 border-red-200 dark:border-red-800'
                            : 'border border-gray-100 dark:border-gray-700'
                        }`}>
                          {/* Image */}
                          <div className="relative w-48 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                            {article.featured_image ? (
                              <Image
                                src={article.featured_image}
                                alt={article.title || 'صورة المقال'}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                sizes="200px"
                                priority={false}
                                unoptimized={article.featured_image.includes('cloudinary.com')}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                                <Newspaper className="w-12 h-12 text-gray-400 dark:text-gray-600" />
                              </div>
                            )}
                            {article.is_breaking && (
                              <div className="absolute top-2 right-2">
                                <span className="urgent-badge inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                                  <Zap className="w-3 h-3" />
                                  عاجل
                                </span>
                              </div>
                            )}
                          </div>
                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className={`text-[17px] font-bold leading-[1.4] ${
                                article.is_breaking 
                                  ? 'text-red-700 dark:text-red-400' 
                                  : 'text-gray-900 dark:text-white'
                              } group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-3`}>
                                {article.title}
                              </h3>
                              {article.is_featured && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-white flex-shrink-0 ml-3">
                                  <Sparkles className="w-3 h-3" />
                                  مميز
                                </span>
                              )}
                            </div>
                            {article.excerpt && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
                                {article.excerpt}
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                {/* التصنيف */}
                                {article.category_name && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white"
                                    style={{ backgroundColor: getCategoryColor(article.category_id) }}>
                                    <Tag className="w-3 h-3" />
                                    {article.category_name}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {formatDate(article.published_at || article.created_at)}
                                </span>
                                {article.reading_time && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {article.reading_time} دقيقة
                                  </span>
                                )}
                                {article.author_name && (
                                  <span className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    {article.author_name}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                  <Eye className="w-4 h-4" />
                                  {(article.views_count || 0) > 0 ? (article.views_count || 0).toLocaleString('ar-SA') : 'جديد'}
                                </span>
                                {article.likes_count && article.likes_count > 0 && (
                                  <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                    <Heart className="w-4 h-4" />
                                    {article.likes_count.toLocaleString('ar-SA')}
                                  </span>
                                )}
                                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                                  <ArrowLeft className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </article>
                      </Link>
                  ))}
                </div>
              )}
              </div>
              {/* Load More */}
              {hasMore && (
                <div className="text-center mt-16">
                  <button
                    onClick={() => setPage(prev => prev + 1)}
                    disabled={loading}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-xl dark:shadow-gray-900/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
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
          ) : (
            <div className="text-center py-20 bg-transparent">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
                <Newspaper className="w-12 h-12 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">لا توجد أخبار متاحة</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? 'لم يتم العثور على أي مقالات تطابق البحث' : 'لم يتم العثور على أي مقالات منشورة حالياً'}
              </p>
            </div>
          )}
        </section>
      </div>
      <Footer />
      <style jsx>{`
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
      `}</style>
    </>
  );
}