/**
 * صفحة فهرس الأخبار - /news
 * عرض جميع الأخبار من جدول news_articles
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Eye, 
  ArrowRight,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useDarkModeContext } from '@/contexts/DarkModeContext';

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  status: string;
  published_at?: string;
  breaking: boolean;
  featured: boolean;
  urgent: boolean;
  source?: string;
  location?: string;
  featured_image?: string;
  views: number;
  likes: number;
  shares: number;
  reading_time?: number;
  allow_comments: boolean;
  created_at: string;
  categories?: {
    id: string;
    name: string;
    slug: string;
    color?: string;
  };
  author: {
    id: string;
    name: string;
    email: string;
  };
}

interface NewsFilters {
  search: string;
  category_id: string;
  breaking: string;
  featured: string;
  sort: string;
  order: string;
}

export default function NewsIndexPage() {
  const { darkMode } = useDarkModeContext();
  
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasMore: false
  });
  
  const [filters, setFilters] = useState<NewsFilters>({
    search: '',
    category_id: 'all',
    breaking: 'all',
    featured: 'all',
    sort: 'published_at',
    order: 'desc'
  });

  // جلب الأخبار
  useEffect(() => {
    fetchNews();
  }, [filters, pagination.page]);

  // جلب التصنيفات
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sort: filters.sort,
        order: filters.order
      });

      // إضافة الفلاتر
      if (filters.search) params.append('search', filters.search);
      if (filters.category_id !== 'all') params.append('category_id', filters.category_id);
      if (filters.breaking !== 'all') params.append('breaking', filters.breaking);
      if (filters.featured !== 'all') params.append('featured', filters.featured);

      console.log('🔍 جلب الأخبار:', params.toString());

      const response = await fetch(`/api/news?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'فشل في جلب الأخبار');
      }
      
      setNews(data.data || []);
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 0,
        hasMore: data.pagination?.hasMore || false
      }));
      
    } catch (error) {
      console.error('❌ خطأ في جلب الأخبار:', error);
      setError(error instanceof Error ? error.message : 'خطأ غير معروف');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('خطأ في جلب التصنيفات:', error);
    }
  };

  const handleFilterChange = (key: keyof NewsFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // إعادة تعيين الصفحة
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNews();
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'تاريخ غير صحيح';
    }
  };

  const loadMore = () => {
    if (pagination.hasMore) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }));
    }
  };

  return (
    <div className={cn('min-h-screen', darkMode ? 'bg-gray-900' : 'bg-gray-50')}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* العنوان الرئيسي */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/" className={cn('hover:underline', darkMode ? 'text-gray-400' : 'text-gray-600')}>
              الرئيسية
            </Link>
            <ArrowRight className="w-4 h-4" />
            <span className={cn('font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>
              الأخبار
            </span>
          </div>
          
          <h1 className={cn('text-3xl lg:text-4xl font-bold mb-2', darkMode ? 'text-white' : 'text-gray-900')}>
            جميع الأخبار
          </h1>
          <p className={cn('text-lg', darkMode ? 'text-gray-400' : 'text-gray-600')}>
            تابع آخر الأخبار والتطورات من مصادر موثوقة
          </p>
        </header>

        {/* شريط البحث والفلاتر */}
        <Card className={cn('mb-8', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white')}>
          <CardContent className="p-6">
            
            {/* شريط البحث */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="البحث في الأخبار..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pr-10"
                  />
                </div>
                <Button type="submit">
                  بحث
                </Button>
              </div>
            </form>

            {/* الفلاتر */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              
              {/* فلتر التصنيف */}
              <Select value={filters.category_id} onValueChange={(value) => handleFilterChange('category_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="التصنيف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع التصنيفات</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* فلتر الأخبار العاجلة */}
              <Select value={filters.breaking} onValueChange={(value) => handleFilterChange('breaking', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="عاجل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="true">عاجل فقط</SelectItem>
                  <SelectItem value="false">غير عاجل</SelectItem>
                </SelectContent>
              </Select>

              {/* فلتر المميز */}
              <Select value={filters.featured} onValueChange={(value) => handleFilterChange('featured', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="مميز" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="true">مميز فقط</SelectItem>
                  <SelectItem value="false">غير مميز</SelectItem>
                </SelectContent>
              </Select>

              {/* ترتيب حسب */}
              <Select value={filters.sort} onValueChange={(value) => handleFilterChange('sort', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="ترتيب حسب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published_at">تاريخ النشر</SelectItem>
                  <SelectItem value="created_at">تاريخ الإنشاء</SelectItem>
                  <SelectItem value="views">المشاهدات</SelectItem>
                  <SelectItem value="likes">الإعجابات</SelectItem>
                  <SelectItem value="title">العنوان</SelectItem>
                </SelectContent>
              </Select>

              {/* ترتيب تصاعدي أم تنازلي */}
              <Select value={filters.order} onValueChange={(value) => handleFilterChange('order', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="الترتيب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">الأحدث أولاً</SelectItem>
                  <SelectItem value="asc">الأقدم أولاً</SelectItem>
                </SelectContent>
              </Select>

            </div>
          </CardContent>
        </Card>

        {/* النتائج */}
        {loading && pagination.page === 1 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="mr-2">جاري تحميل الأخبار...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertTriangle className={cn('w-16 h-16 mx-auto mb-4', darkMode ? 'text-red-400' : 'text-red-500')} />
            <h3 className={cn('text-xl font-semibold mb-2', darkMode ? 'text-white' : 'text-gray-900')}>
              خطأ في تحميل الأخبار
            </h3>
            <p className={cn('mb-4', darkMode ? 'text-gray-400' : 'text-gray-600')}>
              {error}
            </p>
            <Button onClick={fetchNews}>
              إعادة المحاولة
            </Button>
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-12">
            <h3 className={cn('text-xl font-semibold mb-2', darkMode ? 'text-white' : 'text-gray-900')}>
              لا توجد أخبار
            </h3>
            <p className={cn('', darkMode ? 'text-gray-400' : 'text-gray-600')}>
              لم نعثر على أخبار تطابق معايير البحث الخاصة بك.
            </p>
          </div>
        ) : (
          <>
            {/* إحصائيات النتائج */}
            <div className={cn('mb-6 text-sm', darkMode ? 'text-gray-400' : 'text-gray-600')}>
              عرض {news.length} من أصل {pagination.total.toLocaleString('ar-SA')} خبر
            </div>

            {/* شبكة الأخبار */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {news.map((article) => (
                <Link 
                  key={article.id} 
                  href={`/news/${article.slug}`}
                  className={cn(
                    'block rounded-lg border transition-all duration-300 hover:scale-105 hover:shadow-lg',
                    darkMode ? 'border-gray-700 bg-gray-800 hover:border-blue-500' : 'border-gray-200 bg-white hover:border-blue-500'
                  )}
                >
                  {/* الصورة المميزة */}
                  {article.featured_image && (
                    <div className="relative w-full h-48 rounded-t-lg overflow-hidden">
                      <Image
                        src={article.featured_image}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-110"
                      />
                      
                      {/* شارات على الصورة */}
                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        {article.urgent && (
                          <Badge className="bg-red-600 text-white text-xs">
                            ⚡ عاجل جداً
                          </Badge>
                        )}
                        {article.breaking && !article.urgent && (
                          <Badge className="bg-red-500 text-white text-xs">
                            🔴 عاجل
                          </Badge>
                        )}
                        {article.featured && (
                          <Badge className="bg-blue-600 text-white text-xs">
                            ⭐ مميز
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="p-4">
                    {/* التصنيف */}
                    {article.categories && (
                      <Badge 
                        variant="outline" 
                        className="mb-2 text-xs"
                        style={{ 
                          borderColor: article.categories.color || '#gray',
                          color: article.categories.color || '#gray'
                        }}
                      >
                        {article.categories.name}
                      </Badge>
                    )}
                    
                    {/* العنوان */}
                    <h3 className={cn('font-bold text-lg leading-tight mb-2 line-clamp-2', darkMode ? 'text-white' : 'text-gray-900')}>
                      {article.title}
                    </h3>
                    
                    {/* المقتطف */}
                    {article.excerpt && (
                      <p className={cn('text-sm leading-relaxed mb-3 line-clamp-3', darkMode ? 'text-gray-400' : 'text-gray-600')}>
                        {article.excerpt}
                      </p>
                    )}
                    
                    {/* معلومات إضافية */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(article.published_at || article.created_at)}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{article.views.toLocaleString('ar-SA')}</span>
                        </div>
                      </div>
                      
                      {article.reading_time && (
                        <span>{article.reading_time} دقيقة</span>
                      )}
                    </div>
                    
                    {/* المؤلف والمصدر */}
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{article.author.name}</span>
                        </div>
                        
                        {article.source && (
                          <span className="text-blue-600 dark:text-blue-400">
                            {article.source}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* زر تحميل المزيد */}
            {pagination.hasMore && (
              <div className="text-center">
                <Button 
                  onClick={loadMore} 
                  disabled={loading}
                  className="px-8 py-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      جاري التحميل...
                    </>
                  ) : (
                    'تحميل المزيد'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}