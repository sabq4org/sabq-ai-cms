/**
 * صفحة فهرس مقالات الرأي - /opinion
 * عرض جميع مقالات الرأي من جدول opinion_articles
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
  Loader2,
  Star,
  Crown,
  BookOpen,
  Award,
  Heart
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface OpinionArticle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  status: string;
  published_at?: string;
  writer_id: string;
  article_type: string;
  opinion_category?: string;
  featured: boolean;
  is_leader_opinion: boolean;
  difficulty_level: string;
  estimated_read?: number;
  quality_score: number;
  engagement_score: number;
  ai_rating: number;
  featured_image?: string;
  tags: string[];
  topics: string[];
  views: number;
  likes: number;
  saves: number;
  shares: number;
  comments_count: number;
  reading_time?: number;
  created_at: string;
  writer: {
    id: string;
    full_name: string;
    slug: string;
    title?: string;
    avatar_url?: string;
    role?: string;
    total_articles: number;
    total_views: number;
    is_active: boolean;
  };
}

interface OpinionFilters {
  search: string;
  writer_id: string;
  article_type: string;
  difficulty_level: string;
  is_leader_opinion: string;
  featured: string;
  quality_score: string;
  sort: string;
  order: string;
}

export default function OpinionIndexPage() {
  
  const [opinions, setOpinions] = useState<OpinionArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [writers, setWriters] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 18,
    total: 0,
    totalPages: 0,
    hasMore: false
  });
  
  const [filters, setFilters] = useState<OpinionFilters>({
    search: '',
    writer_id: 'all',
    article_type: 'all',
    difficulty_level: 'all',
    is_leader_opinion: 'all',
    featured: 'all',
    quality_score: 'all',
    sort: 'published_at',
    order: 'desc'
  });

  // جلب مقالات الرأي
  useEffect(() => {
    fetchOpinions();
  }, [filters, pagination.page]);

  // جلب الكتاب
  useEffect(() => {
    fetchWriters();
  }, []);

  const fetchOpinions = async () => {
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
      if (filters.writer_id !== 'all') params.append('writer_id', filters.writer_id);
      if (filters.article_type !== 'all') params.append('article_type', filters.article_type);
      if (filters.difficulty_level !== 'all') params.append('difficulty_level', filters.difficulty_level);
      if (filters.is_leader_opinion !== 'all') params.append('is_leader_opinion', filters.is_leader_opinion);
      if (filters.featured !== 'all') params.append('featured', filters.featured);
      if (filters.quality_score !== 'all') params.append('quality_score_min', filters.quality_score);

      console.log('🔍 جلب مقالات الرأي:', params.toString());

      const response = await fetch(`/api/opinions?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'فشل في جلب مقالات الرأي');
      }
      
      setOpinions(data.data || []);
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 0,
        hasMore: data.pagination?.hasMore || false
      }));
      
    } catch (error) {
      console.error('❌ خطأ في جلب مقالات الرأي:', error);
      setError(error instanceof Error ? error.message : 'خطأ غير معروف');
    } finally {
      setLoading(false);
    }
  };

  const fetchWriters = async () => {
    try {
      const response = await fetch('/api/writers');
      if (response.ok) {
        const data = await response.json();
        setWriters(data.writers || []);
      }
    } catch (error) {
      console.error('خطأ في جلب الكتاب:', error);
    }
  };

  const handleFilterChange = (key: keyof OpinionFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // إعادة تعيين الصفحة
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOpinions();
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

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return 'text-green-600 bg-green-50 border-green-200';
      case 'advanced': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getDifficultyText = (level: string) => {
    switch (level) {
      case 'easy': return 'سهل';
      case 'advanced': return 'متقدم';
      default: return 'متوسط';
    }
  };

  const getArticleTypeText = (type: string) => {
    switch (type) {
      case 'analysis': return 'تحليل';
      case 'interview': return 'مقابلة';
      case 'editorial': return 'افتتاحية';
      case 'column': return 'عمود';
      default: return 'رأي';
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
              مقالات الرأي
            </span>
          </div>
          
          <h1 className={cn('text-3xl lg:text-4xl font-bold mb-2', darkMode ? 'text-white' : 'text-gray-900')}>
            مقالات الرأي والتحليل
          </h1>
          <p className={cn('text-lg', darkMode ? 'text-gray-400' : 'text-gray-600')}>
            آراء وتحليلات معمقة من خبراء وكتاب متخصصين
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
                    placeholder="البحث في مقالات الرأي..."
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
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              
              {/* فلتر الكاتب */}
              <Select value={filters.writer_id} onValueChange={(value) => handleFilterChange('writer_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="الكاتب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الكتاب</SelectItem>
                  {writers.map((writer) => (
                    <SelectItem key={writer.id} value={writer.id}>
                      {writer.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* فلتر نوع المقال */}
              <Select value={filters.article_type} onValueChange={(value) => handleFilterChange('article_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="opinion">رأي</SelectItem>
                  <SelectItem value="analysis">تحليل</SelectItem>
                  <SelectItem value="interview">مقابلة</SelectItem>
                  <SelectItem value="editorial">افتتاحية</SelectItem>
                  <SelectItem value="column">عمود</SelectItem>
                </SelectContent>
              </Select>

              {/* فلتر مستوى الصعوبة */}
              <Select value={filters.difficulty_level} onValueChange={(value) => handleFilterChange('difficulty_level', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="المستوى" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المستويات</SelectItem>
                  <SelectItem value="easy">سهل</SelectItem>
                  <SelectItem value="medium">متوسط</SelectItem>
                  <SelectItem value="advanced">متقدم</SelectItem>
                </SelectContent>
              </Select>

              {/* فلتر قادة الرأي */}
              <Select value={filters.is_leader_opinion} onValueChange={(value) => handleFilterChange('is_leader_opinion', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="قادة الرأي" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="true">قادة الرأي فقط</SelectItem>
                  <SelectItem value="false">كتاب عاديون</SelectItem>
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

              {/* فلتر الجودة */}
              <Select value={filters.quality_score} onValueChange={(value) => handleFilterChange('quality_score', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="الجودة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المستويات</SelectItem>
                  <SelectItem value="8">8+ ممتاز</SelectItem>
                  <SelectItem value="7">7+ جيد جداً</SelectItem>
                  <SelectItem value="6">6+ جيد</SelectItem>
                  <SelectItem value="5">5+ مقبول</SelectItem>
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
                  <SelectItem value="quality_score">الجودة</SelectItem>
                  <SelectItem value="engagement_score">التفاعل</SelectItem>
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
            <span className="mr-2">جاري تحميل مقالات الرأي...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertTriangle className={cn('w-16 h-16 mx-auto mb-4', darkMode ? 'text-red-400' : 'text-red-500')} />
            <h3 className={cn('text-xl font-semibold mb-2', darkMode ? 'text-white' : 'text-gray-900')}>
              خطأ في تحميل مقالات الرأي
            </h3>
            <p className={cn('mb-4', darkMode ? 'text-gray-400' : 'text-gray-600')}>
              {error}
            </p>
            <Button onClick={fetchOpinions}>
              إعادة المحاولة
            </Button>
          </div>
        ) : opinions.length === 0 ? (
          <div className="text-center py-12">
            <h3 className={cn('text-xl font-semibold mb-2', darkMode ? 'text-white' : 'text-gray-900')}>
              لا توجد مقالات رأي
            </h3>
            <p className={cn('', darkMode ? 'text-gray-400' : 'text-gray-600')}>
              لم نعثر على مقالات رأي تطابق معايير البحث الخاصة بك.
            </p>
          </div>
        ) : (
          <>
            {/* إحصائيات النتائج */}
            <div className={cn('mb-6 text-sm', darkMode ? 'text-gray-400' : 'text-gray-600')}>
              عرض {opinions.length} من أصل {pagination.total.toLocaleString('ar-SA')} مقال رأي
            </div>

            {/* شبكة مقالات الرأي */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {opinions.map((article) => (
                <Link 
                  key={article.id} 
                  href={`/opinion/${article.slug}`}
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
                        {article.is_leader_opinion && (
                          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white text-xs">
                            <Crown className="w-3 h-3 ml-1" />
                            قائد رأي
                          </Badge>
                        )}
                        {article.featured && (
                          <Badge className="bg-blue-600 text-white text-xs">
                            <Star className="w-3 h-3 ml-1" />
                            مميز
                          </Badge>
                        )}
                      </div>

                      {/* تقييم الجودة */}
                      <div className="absolute bottom-2 left-2">
                        <Badge 
                          className={cn(
                            'text-xs',
                            article.quality_score >= 8 ? 'bg-green-600' : 
                            article.quality_score >= 7 ? 'bg-blue-600' : 
                            article.quality_score >= 6 ? 'bg-yellow-600' : 'bg-gray-600'
                          )}
                        >
                          <Award className="w-3 h-3 ml-1" />
                          {article.quality_score}/10
                        </Badge>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-4">
                    {/* شارات المقال */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {getArticleTypeText(article.article_type)}
                      </Badge>
                      
                      <Badge 
                        variant="outline" 
                        className={cn('text-xs', getDifficultyColor(article.difficulty_level))}
                      >
                        <BookOpen className="w-3 h-3 ml-1" />
                        {getDifficultyText(article.difficulty_level)}
                      </Badge>

                      {article.opinion_category && (
                        <Badge variant="secondary" className="text-xs">
                          {article.opinion_category}
                        </Badge>
                      )}
                    </div>
                    
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
                    
                    {/* الكلمات المفتاحية */}
                    {article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {article.tags.slice(0, 3).map((tag, index) => (
                          <span 
                            key={index}
                            className={cn(
                              'text-xs px-2 py-1 rounded',
                              darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                            )}
                          >
                            #{tag}
                          </span>
                        ))}
                        {article.tags.length > 3 && (
                          <span className={cn('text-xs', darkMode ? 'text-gray-400' : 'text-gray-500')}>
                            +{article.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* معلومات إضافية */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(article.published_at || article.created_at)}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{article.views.toLocaleString('ar-SA')}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          <span>{article.likes}</span>
                        </div>
                      </div>
                      
                      {article.estimated_read && (
                        <span>{article.estimated_read} دقيقة</span>
                      )}
                    </div>
                    
                    {/* معلومات الكاتب */}
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        {article.writer.avatar_url && (
                          <div className="w-8 h-8 rounded-full overflow-hidden">
                            <Image
                              src={article.writer.avatar_url}
                              alt={article.writer.full_name}
                              width={32}
                              height={32}
                              className="object-cover"
                            />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn('text-sm font-medium truncate', darkMode ? 'text-white' : 'text-gray-900')}>
                              {article.writer.full_name}
                            </span>
                            {article.is_leader_opinion && (
                              <Crown className="w-3 h-3 text-yellow-500" />
                            )}
                          </div>
                          
                          {article.writer.title && (
                            <span className="text-xs text-gray-500 truncate block">
                              {article.writer.title}
                            </span>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <div className="text-xs text-gray-500">
                            {article.writer.total_articles} مقال
                          </div>
                          <div className="text-xs text-gray-500">
                            {article.writer.total_views.toLocaleString('ar-SA')} مشاهدة
                          </div>
                        </div>
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