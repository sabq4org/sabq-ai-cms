'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../../components/Header';
import { 
  Newspaper, Filter, Clock, Eye, Tag, Search, 
  TrendingUp, Calendar, User, Hash, Loader2,
  Grid, List, ChevronRight, Sparkles, BookOpen,
  Zap, Globe, Heart, MessageCircle, Share2, Award
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  summary?: string;
  featured_image?: string;
  category_id: number;
  category_name?: string;
  author_name?: string;
  author_id?: string;
  views_count: number;
  created_at: string;
  published_at?: string;
  reading_time?: number;
  is_breaking?: boolean;
  is_featured?: boolean;
  status?: string;
}

interface Category {
  id: number;
  name?: string;
  name_ar: string;
  name_en?: string;
  slug: string;
  icon?: string;
  color_hex?: string;
  articles_count?: number;
  is_active?: boolean;
}

// ألوان التصنيفات الافتراضية
const categoryColors: { [key: string]: string } = {
  'تقنية': 'from-purple-500 to-purple-600',
  'اقتصاد': 'from-green-500 to-green-600',
  'رياضة': 'from-blue-500 to-blue-600',
  'سياسة': 'from-red-500 to-red-600',
  'ثقافة': 'from-yellow-500 to-yellow-600',
  'صحة': 'from-pink-500 to-pink-600',
  'محلي': 'from-indigo-500 to-indigo-600',
  'دولي': 'from-cyan-500 to-cyan-600',
  'منوعات': 'from-orange-500 to-orange-600',
  'default': 'from-gray-500 to-gray-600'
};

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'trending'>('latest');
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
  }, [selectedCategory, sortBy, page]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      
      // التأكد من أن البيانات مصفوفة
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
      setCategories([]); // تعيين مصفوفة فارغة في حالة الخطأ
    }
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      let url = '/api/articles?status=published&limit=20';
      
      if (selectedCategory) {
        url += `&category_id=${selectedCategory}`;
      }
      
      if (sortBy === 'popular') {
        url += '&sort=views_count&order=desc';
      } else if (sortBy === 'trending') {
        url += '&sort=interactions_count&order=desc';
      } else {
        url += '&sort=created_at&order=desc';
      }
      
      if (page > 1) {
        url += `&page=${page}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      
      // التأكد من أن البيانات مصفوفة
      let articlesArray: Article[] = [];
      
      // API يُرجع البيانات في حقل data
      if (data && data.data && Array.isArray(data.data)) {
        articlesArray = data.data;
      } else if (data && data.articles && Array.isArray(data.articles)) {
        articlesArray = data.articles;
      } else if (Array.isArray(data)) {
        articlesArray = data;
      }
      
      // فلترة المقالات المنشورة فقط
      articlesArray = articlesArray.filter(article => 
        !article.status || article.status === 'published'
      );
      
      if (page === 1) {
        setArticles(articlesArray);
      } else {
        setArticles(prev => [...prev, ...articlesArray]);
      }
      
      setHasMore(articlesArray.length === 20);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(article => 
    searchQuery === '' || 
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name_ar || category?.name_en || 'عام';
  };

  const getCategoryColor = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    if (category?.color_hex) {
      return `from-[${category.color_hex}] to-[${category.color_hex}]`;
    }
    const categoryName = category?.name_ar || category?.name_en || '';
    return categoryColors[categoryName] || categoryColors['default'];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle" opacity="0.8">
          ${title.substring(0, 20)}
        </text>
      </svg>
    `)}`;
  };

  const ArticleCard = ({ article }: { article: Article }) => (
    <Link href={`/article/${article.id}`}>
      <div className={`group h-full bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-transparent transform hover:-translate-y-1 ${
        viewMode === 'list' ? 'flex gap-6' : 'flex flex-col'
      }`}>
        {/* صورة المقال */}
        <div className={`relative overflow-hidden ${
          viewMode === 'list' ? 'w-64 h-48' : 'w-full h-56'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
          <img
            src={article.featured_image || generatePlaceholderImage(article.title)}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          
          {/* شارات */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
            {article.is_breaking && (
              <div className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse flex items-center gap-1">
                <Zap className="w-3 h-3" />
                عاجل
              </div>
            )}
            {article.is_featured && (
              <div className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                <Award className="w-3 h-3" />
                مميز
              </div>
            )}
          </div>

          {/* التصنيف */}
          <div className="absolute bottom-4 right-4 z-20">
            <span className={`inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r ${getCategoryColor(article.category_id)} text-white text-xs font-bold rounded-full shadow-lg`}>
              <Tag className="w-3 h-3" />
              {getCategoryName(article.category_id)}
            </span>
          </div>
        </div>

        {/* محتوى المقال */}
        <div className={`flex-1 p-6 ${viewMode === 'list' ? 'flex flex-col justify-between' : ''}`}>
          {/* العنوان */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
              {article.title}
            </h3>

            {/* الملخص */}
            {article.summary && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                {article.summary}
              </p>
            )}
          </div>

          {/* معلومات إضافية */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4">
              {article.author_name && (
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  <span className="font-medium">{article.author_name}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(article.published_at || article.created_at)}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {article.reading_time && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{article.reading_time} د</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{article.views_count || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-6 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
              <Newspaper className="w-6 h-6" />
              <span className="text-lg font-medium">مركز الأخبار</span>
            </div>
            <h1 className="text-5xl font-bold mb-6">جميع الأخبار</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              تابع أحدث ما نُشر في سبق الذكية من أخبار محلية وعالمية
            </p>
            
            {/* إحصائيات */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">{articles.length}</div>
                <div className="text-sm text-white/80">مقال منشور</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">{categories.length}</div>
                <div className="text-sm text-white/80">تصنيف</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">24/7</div>
                <div className="text-sm text-white/80">تغطية مستمرة</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="sticky top-0 bg-white shadow-sm z-40 border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full lg:w-96">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ابحث في الأخبار..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
              >
                <option value="latest">الأحدث</option>
                <option value="popular">الأكثر مشاهدة</option>
                <option value="trending">الأكثر تفاعلاً</option>
              </select>

              {/* View Mode */}
              <div className="flex items-center gap-1 border-2 border-gray-200 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list' 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="flex items-center gap-3 mt-6 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all transform hover:scale-105 ${
                selectedCategory === null
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              جميع الأخبار
            </button>
            {Array.isArray(categories) && categories.length > 0 && categories
              .filter(category => category.is_active !== false)
              .map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all transform hover:scale-105 ${
                    selectedCategory === category.id
                      ? `bg-gradient-to-r ${getCategoryColor(category.id)} text-white shadow-lg`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.icon && <span className="mr-2">{category.icon}</span>}
                  {category.name_ar || category.name_en || category.name}
                  {category.articles_count !== undefined && (
                    <span className="mr-2 opacity-75">({category.articles_count})</span>
                  )}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading && page === 1 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
            <p className="text-gray-500">جاري تحميل الأخبار...</p>
          </div>
        ) : filteredArticles.length > 0 ? (
          <>
            <div className={`${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' 
                : 'space-y-6'
            }`}>
              {filteredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="text-center mt-16">
                <button
                  onClick={() => setPage(prev => prev + 1)}
                  disabled={loading}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
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
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <Newspaper className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد أخبار متاحة</h3>
            <p className="text-gray-500">لم يتم العثور على أي مقالات منشورة حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
} 