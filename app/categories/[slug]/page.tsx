'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { getArticleLink } from '@/lib/utils';
import CloudImage from '@/components/ui/CloudImage';
import { 
  Tag, ArrowRight, Calendar, Clock, Eye, Heart, 
  BookOpen, TrendingUp, Loader2, ChevronLeft,
  Trophy, Laptop, Building2, Leaf, Activity, Globe,
  Grid, List, SortDesc, Sparkles, Filter, X, Check, Search, Zap, User, ArrowLeft, Newspaper
} from 'lucide-react';
import '../categories-fixes.css';
interface Category {
  id: number;
  name: string;
  name_ar: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  cover_image?: string;
  articles_count?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  metadata?: {
    cover_image?: string;
    [key: string]: any;
  };
}
interface Article {
  id: string;
  title: string;
  subtitle?: string;
  excerpt?: string;
  featured_image?: string;
  category_id: number;
  category_name?: string;
  author_name?: string;
  views_count: number;
  likes_count?: number;
  created_at: string;
  published_at?: string;
  reading_time?: number;
  is_featured?: boolean;
  is_breaking?: boolean;
}
// أيقونات التصنيفات
const categoryIcons: { [key: string]: any } = {
  'تقنية': Laptop,
  'رياضة': Trophy,
  'اقتصاد': TrendingUp,
  'سياسة': Building2,
  'صحة': Heart,
  'بيئة': Leaf,
  'ثقافة': BookOpen,
  'محلي': Globe,
  'دولي': Globe,
  'منوعات': Activity,
  'default': Tag
};
// ألوان التصنيفات
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
  'بيئة': 'from-teal-500 to-teal-600',
  'default': 'from-gray-500 to-gray-600'
};
interface PageProps {
  params: Promise<{ slug: string }>
}
export default function CategoryDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'views' | 'likes'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [categorySlug, setCategorySlug] = useState<string>('');
  useEffect(() => {
    async function loadCategory() {
      const resolvedParams = await params;
      if (resolvedParams?.slug) {
        setCategorySlug(resolvedParams.slug);
        fetchCategoryData(resolvedParams.slug);
      }
    }
    loadCategory();
  }, []);
  useEffect(() => {
    // فلترة المقالات حسب البحث
    const filtered = articles.filter(article =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (article.excerpt && article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    // ترتيب المقالات
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'views':
          return (b.views_count || 0) - (a.views_count || 0);
        case 'likes':
          return (b.likes_count || 0) - (a.likes_count || 0);
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
    setFilteredArticles(sorted);
  }, [articles, sortBy, searchTerm]);
  const fetchCategoryData = async (slug: string) => {
    try {
      setLoading(true);
      // جلب بيانات التصنيف
      const categoriesResponse = await fetch('/api/categories');
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        const categories = categoriesData.categories || categoriesData.data || [];
        const foundCategory = categories.find((cat: Category) => 
          cat.slug === slug || cat.name_ar.toLowerCase().replace(/\s+/g, '-') === slug
        );
        if (!foundCategory) {
          console.error('التصنيف غير موجود');
          router.push('/categories');
          return;
        }
        setCategory(foundCategory);
        console.log('تم جلب التصنيف:', foundCategory.name);
        
        // جلب المقالات الخاصة بالتصنيف
        const articlesResponse = await fetch(`/api/articles?category_id=${foundCategory.id}`);
        if (articlesResponse.ok) {
          const articlesData = await articlesResponse.json();
          console.log('البيانات المستلمة:', articlesData.data?.length || 0, 'مقال');
          
          // تحويل البيانات لتطابق الواجهة
          const transformedArticles = (articlesData.data || []).map((article: any) => ({
            ...article,
            views_count: article.views_count || article.views || 0,
            likes_count: article.likes_count || 0,
            category_name: article.category_name || article.category?.name || foundCategory.name,
            author_name: article.author_name || article.author?.name || 'غير محدد',
            published_at: article.published_at || article.created_at,
            is_featured: article.featured || article.is_featured || false,
            is_breaking: article.breaking === true || article.is_breaking === true || false
          }));
          setArticles(transformedArticles);
          console.log('تم تحويل المقالات:', transformedArticles.length);
        }
      }
    } catch (error) {
      console.error('Error fetching category data:', error);
    } finally {
      setLoading(false);
    }
  };
  const getIcon = (categoryName: string) => {
    const IconComponent = categoryIcons[categoryName] || categoryIcons['default'];
    return IconComponent;
  };
  const getColor = (categoryName: string) => {
    return categoryColors[categoryName] || categoryColors['default'];
  };
  const getCategoryImage = (category: Category) => {
    // استخدام الصورة المرفوعة من لوحة التحكم إذا كانت موجودة
    const coverImage = category.cover_image || 
                      (category.metadata && typeof category.metadata === 'object' && 
                       'cover_image' in category.metadata ? 
                       (category.metadata as any).cover_image : null);
    
    // التحقق من أن الصورة ليست فارغة
    if (coverImage && coverImage.trim() !== '') {
      // إذا كانت الصورة محلية، أضف URL الأساسي
      if (coverImage.startsWith('/')) {
        return `${process.env.NEXT_PUBLIC_SITE_URL || ''}${coverImage}`;
      }
      return coverImage;
    }
    
    // استخدام صورة افتراضية بناءً على اسم التصنيف
    const categoryImages: { [key: string]: string } = {
      'تقنية': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      'تكنولوجيا': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=1200&q=80',
      'رياضة': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
      'اقتصاد': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
      'سياسة': 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80',
      'صحة': 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80',
      'بيئة': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
      'ثقافة': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80',
      'محلي': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80',
      'دولي': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      'منوعات': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
      'تعليم': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
      'فنون': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8a?auto=format&fit=crop&w=1200&q=80',
      'سفر': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
      'علوم': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
      'أخبار': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
      'default': 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=1200&q=80'
    };
    
    // البحث المباشر
    const directMatch = categoryImages[category.name_ar];
    if (directMatch) return directMatch;
    
    // البحث الجزئي في الكلمات المفتاحية
    const keywords = {
      'تقني': categoryImages['تقنية'],
      'تكنولوجي': categoryImages['تكنولوجيا'],
      'رياضي': categoryImages['رياضة'],
      'اقتصادي': categoryImages['اقتصاد'],
      'سياسي': categoryImages['سياسة'],
      'صحي': categoryImages['صحة'],
      'بيئي': categoryImages['بيئة'],
      'ثقافي': categoryImages['ثقافة'],
      'محلي': categoryImages['محلي'],
      'دولي': categoryImages['دولي'],
      'منوع': categoryImages['منوعات'],
      'تعليمي': categoryImages['تعليم'],
      'فني': categoryImages['فنون'],
      'سفر': categoryImages['سفر'],
      'علمي': categoryImages['علوم'],
      'خبر': categoryImages['أخبار']
    };
    
    for (const [keyword, image] of Object.entries(keywords)) {
      if (category.name_ar.includes(keyword)) return image;
    }
    
    return categoryImages['default'];
  };
  const generatePlaceholderImage = (title: string) => {
    const colors = ['#8B5CF6', '#10B981', '#3B82F6', '#EF4444', '#F59E0B'];
    const colorIndex = title.charCodeAt(0) % colors.length;
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colors[colorIndex]};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${colors[(colorIndex + 1) % colors.length]};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="800" height="400" fill="url(#grad)"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="32" fill="white" text-anchor="middle" dominant-baseline="middle" opacity="0.8">
          ${title.substring(0, 30)}
        </text>
      </svg>
    `)}`;
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
  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-500">جاري تحميل التصنيف...</p>
          </div>
        </div>
      </>
    );
  }
  if (!category) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">التصنيف غير موجود</h3>
            <p className="text-gray-500 mb-6">عذراً، لم نتمكن من العثور على التصنيف المطلوب</p>
            <Link 
              href="/categories" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
              العودة إلى التصنيفات
            </Link>
          </div>
        </div>
      </>
    );
  }
  const Icon = getIcon(category.name_ar);
  const colorGradient = getColor(category.name_ar);
  return (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      {/* Hero Section with Cover Image */}
      <section className="relative h-[300px] md:h-[500px] overflow-hidden">
        <Image 
          src={getCategoryImage(category)} 
          alt={category.name_ar}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0di00aC0ydjRoLTR2Mmg0djRoMnYtNGg0di0yaC00em0wLTMwVjBoLTJ2NGgtNHYyaDR2NGgyVjZoNFY0aC00ek02IDM0di00SDR2NEgwdjJoNHY0aDJ2LTRoNHYtMkg2ek02IDRWMEG0NHY0SDB2Mmg0djRoMlY2aDRWNEg2eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        </div>
        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Mobile Layout */}
            <div className="md:hidden text-center">
              <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-2xl">
                {category.name_ar}
              </h1>
              {category.description && (
                <p className="text-base text-white/90 drop-shadow-lg">
                  {category.description}
                </p>
              )}
            </div>
            {/* Desktop Layout */}
            <div className="hidden md:flex items-center gap-8 mb-8">
              <div className={`w-24 h-24 bg-gradient-to-br ${colorGradient} rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300 backdrop-blur-md`}>
                {category.icon ? (
                  <span className="text-5xl filter drop-shadow-lg">{category.icon}</span>
                ) : (
                  <Icon className="w-12 h-12 text-white filter drop-shadow-lg" />
                )}
              </div>
              <div>
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
                  {category.name_ar}
                </h1>
                {category.description && (
                  <p className="text-xl md:text-2xl text-white/90 max-w-4xl drop-shadow-lg">
                    {category.description}
                  </p>
                )}
              </div>
            </div>
            {/* Enhanced Stats - Desktop Only */}
            <div className="hidden md:flex items-center gap-8 text-white/90">
              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/30">
                <BookOpen className="w-6 h-6" />
                <span className="font-bold text-xl">{articles.length}</span>
                <span className="text-lg">مقال</span>
              </div>
              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/30">
                <Eye className="w-6 h-6" />
                <span className="font-bold text-xl">
                  {articles.reduce((acc, article) => acc + (article.views_count || 0), 0).toLocaleString()}
                </span>
                <span className="text-lg">مشاهدة</span>
              </div>
              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/30">
                <Heart className="w-6 h-6" />
                <span className="font-bold text-xl">
                  {articles.reduce((acc, article) => acc + (article.likes_count || 0), 0).toLocaleString()}
                </span>
                <span className="text-lg">إعجاب</span>
              </div>
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
                placeholder="ابحث في المقالات..."
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
        {filteredArticles.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {searchTerm ? 'لا توجد مقالات تطابق البحث' : 'لا توجد مقالات في هذا التصنيف بعد'}
            </p>
          </div>
        ) : (
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
                          <img
                            src={article.featured_image}
                            alt={article.title || 'صورة المقال'}
                            className="absolute inset-0 w-full h-full object-cover"
                            onLoad={(e) => {
                              (e.target as HTMLImageElement).style.opacity = '1';
                            }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/images/placeholder-featured.jpg';
                            }}
                            style={{ opacity: 0, transition: 'opacity 0.3s' }}
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
                          {/* Date */}
                          <span className="flex items-center gap-0.5">
                            <Calendar className="w-3 h-3" />
                            {formatDate(article.published_at || article.created_at)}
                          </span>
                          {/* Views */}
                          <span className="flex items-center gap-0.5">
                            <Eye className="w-3 h-3" />
                            {article.views_count > 0 ? article.views_count.toLocaleString('ar-SA') : 'جديد'}
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

            {/* Desktop View - Keep existing */}
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
                        {/* صورة المقال */}
                        <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
                          {article.featured_image ? (
                            <img
                              src={article.featured_image}
                              alt={article.title || 'صورة المقال'}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onLoad={(e) => {
                                (e.target as HTMLImageElement).style.opacity = '1';
                              }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/images/placeholder-featured.jpg';
                              }}
                              style={{ opacity: 0, transition: 'opacity 0.3s' }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                              <Newspaper className="w-16 h-16 text-gray-400 dark:text-gray-600" />
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
                            <div className="absolute top-3 right-3">
                              <span className="urgent-badge inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white backdrop-blur-sm">
                              <Zap className="w-3 h-3" />
                              عاجل
                            </span>
                          </div>
                        )}
                        {/* شارة مميز */}
                        {article.is_featured && (
                            <div className="absolute top-3 left-3">
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
                                  {article.views_count > 0 ? article.views_count.toLocaleString('ar-SA') : 'جديد'}
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
                            <img
                            src={article.featured_image}
                            alt={article.title || 'صورة المقال'}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onLoad={(e) => {
                                (e.target as HTMLImageElement).style.opacity = '1';
                              }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/images/placeholder-featured.jpg';
                              }}
                              style={{ opacity: 0, transition: 'opacity 0.3s' }}
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
                                {article.views_count > 0 ? article.views_count.toLocaleString('ar-SA') : 'جديد'}
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
          </>
        )}
      </section>
    </div>
  );
}