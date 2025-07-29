/**
 * مكون محسن لعرض المقالات مع التصميم الاحترافي الجديد
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner, SkeletonCard } from '@/components/ui/loading';
import { useArticles } from '@/hooks/useDataFetch';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar, 
  User,
  ExternalLink,
  RefreshCw,
  Plus,
  FileText,
  TrendingUp,
  BarChart3,
  SortDesc,
  CheckCircle,
  Clock,
  Activity,
  Sparkles,
  Target,
  Award,
  Lightbulb,
  HelpCircle,
  Copy,
  Archive,
  Bookmark,
  Share2,
  Download,
  Hash,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  ThumbsUp,
  Globe,
  Zap,
  Star,
  PenTool,
  Newspaper
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  status: 'published' | 'draft' | 'archived';
  views: number;
  category: string;
  tags: string[];
  featuredImage?: string;
  comments_count?: number;
  likes_count?: number;
  shares_count?: number;
  reading_time?: number;
}

interface ArticleListProps {
  searchable?: boolean;
  filterable?: boolean;
  pageSize?: number;
  showActions?: boolean;
}

export const ArticleList: React.FC<ArticleListProps> = ({
  searchable = true,
  filterable = true,
  pageSize = 10,
  showActions = true
}) => {
  const { darkMode } = useDarkModeContext();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('publishedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);

  // إعداد فلاتر البحث
  const filters = useMemo(() => ({
    page,
    limit: pageSize,
    search: search.trim(),
    status: statusFilter === 'all' ? undefined : statusFilter,
    category: categoryFilter === 'all' ? undefined : categoryFilter,
    sortBy,
    sortOrder
  }), [search, statusFilter, categoryFilter, page, pageSize, sortBy, sortOrder]);

  // جلب المقالات باستخدام Hook محسن
  const { data: articlesData, loading, error, refetch } = useArticles(filters);
  
  const articles = (articlesData as any)?.articles || [];
  const totalPages = Math.ceil(((articlesData as any)?.total || 0) / pageSize);

  // معالج البحث مع debounce
  const handleSearchChange = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (value: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setSearch(value);
        setPage(1); // العودة للصفحة الأولى عند البحث
      }, 300);
    };
  }, []);

  // حذف مقال
  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المقال؟')) return;
    
    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast.success('تم حذف المقال بنجاح');
        refetch();
      } else {
        toast.error('فشل في حذف المقال');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('حدث خطأ في حذف المقال');
    }
  };

  // تحديث حالة المقال
  const handleStatusUpdate = async (id: string, status: 'published' | 'draft' | 'archived') => {
    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        toast.success('تم تحديث حالة المقال');
        refetch();
      } else {
        toast.error('فشل في تحديث الحالة');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('حدث خطأ في تحديث الحالة');
    }
  };

  // حساب الإحصائيات
  const stats = {
    total: (articlesData as any)?.total || 0,
    published: articles.filter((a: Article) => a.status === 'published').length,
    draft: articles.filter((a: Article) => a.status === 'draft').length,
    totalViews: articles.reduce((acc: number, a: Article) => acc + a.views, 0),
    totalComments: articles.reduce((acc: number, a: Article) => acc + (a.comments_count || 0), 0),
    totalLikes: articles.reduce((acc: number, a: Article) => acc + (a.likes_count || 0), 0),
    trending: articles.filter((a: Article) => a.views > 1000).length,
    recentlyPublished: articles.filter((a: Article) => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      return new Date(a.publishedAt) > threeDaysAgo;
    }).length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700';
      case 'draft':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700';
      case 'archived':
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return 'منشور';
      case 'draft':
        return 'مسودة';
      case 'archived':
        return 'مؤرشف';
      default:
        return 'غير محدد';
    }
  };

  // مكون بطاقة الإحصائية
  const StatsCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    bgColor,
    iconColor
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: any;
    bgColor: string;
    iconColor: string;
  }) => (
    <div className={`rounded-2xl p-4 sm:p-6 shadow-sm border transition-all duration-300 hover:shadow-md ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-100'
    }`}>
      <div className="flex items-center gap-3 sm:gap-4">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${bgColor} rounded-full flex items-center justify-center`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`} />
        </div>
        <div className="flex-1">
          <p className={`text-xs sm:text-sm mb-1 transition-colors duration-300 ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>{title}</p>
          <div className="flex items-baseline gap-1 sm:gap-2">
            <span className={`text-lg sm:text-2xl font-bold transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>{loading ? '...' : value}</span>
            <span className={`text-xs sm:text-sm transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>{subtitle}</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className={`rounded-2xl p-8 text-center border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}>
        <div className="text-red-600 mb-4">خطأ في تحميل المقالات: {error}</div>
        <Button onClick={refetch} variant="outline">
          <RefreshCw className="w-4 h-4 ml-2" />
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className={`transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : ''
    }`}>
      {/* عنوان وتعريف الصفحة المحسن */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold mb-2 transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              📰 إدارة المقالات المتقدمة
            </h1>
            <p className={`text-sm sm:text-base transition-colors duration-300 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              إدارة شاملة للمحتوى الإخباري مع إحصائيات متقدمة
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700">
              <Newspaper className="w-3 h-3 mr-1" />
              {stats.total} مقال
            </Badge>
            <Badge variant="outline" className={darkMode ? 'border-gray-600' : ''}>
              <Eye className="w-3 h-3 mr-1" />
              {stats.totalViews.toLocaleString()} مشاهدة
            </Badge>
          </div>
        </div>
        
        {/* شريط المؤشرات السريعة */}
        <div className={`rounded-xl p-3 border ${
          darkMode 
            ? 'bg-gray-800/50 border-gray-700' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <CheckCircle className={`w-4 h-4 ${stats.published > 0 ? 'text-green-500' : 'text-gray-400'}`} />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {stats.published} منشور
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className={`w-4 h-4 ${stats.draft > 0 ? 'text-yellow-500' : 'text-gray-400'}`} />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {stats.draft} مسودة
                </span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className={`w-4 h-4 ${stats.trending > 0 ? 'text-blue-500' : 'text-gray-400'}`} />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {stats.trending} شائع
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard/articles/analytics')}
                className={`${darkMode ? 'border-gray-600 hover:bg-gray-700' : ''}`}
              >
                <BarChart3 className="h-4 w-4 ml-2" />
                التحليلات
              </Button>
              <Button
                onClick={() => router.push('/dashboard/articles/create')}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg"
              >
                <Plus className="h-4 w-4 ml-2" />
                مقال جديد
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* بطاقات الإحصائيات المحسنة */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <StatsCard
          title="إجمالي المقالات"
          value={stats.total}
          subtitle="مقال"
          icon={FileText}
          bgColor="bg-gradient-to-br from-blue-100 to-blue-200"
          iconColor="text-blue-600"
        />
        <StatsCard
          title="منشور"
          value={stats.published}
          subtitle="مقال نشط"
          icon={CheckCircle}
          bgColor="bg-gradient-to-br from-green-100 to-green-200"
          iconColor="text-green-600"
        />
        <StatsCard
          title="المشاهدات"
          value={stats.totalViews.toLocaleString()}
          subtitle="مشاهدة"
          icon={Eye}
          bgColor="bg-gradient-to-br from-purple-100 to-purple-200"
          iconColor="text-purple-600"
        />
        <StatsCard
          title="التعليقات"
          value={stats.totalComments}
          subtitle="تعليق"
          icon={MessageSquare}
          bgColor="bg-gradient-to-br from-orange-100 to-orange-200"
          iconColor="text-orange-600"
        />
        <StatsCard
          title="الإعجابات"
          value={stats.totalLikes}
          subtitle="إعجاب"
          icon={ThumbsUp}
          bgColor="bg-gradient-to-br from-pink-100 to-pink-200"
          iconColor="text-pink-600"
        />
        <StatsCard
          title="شائع"
          value={stats.trending}
          subtitle="مقال شائع"
          icon={TrendingUp}
          bgColor="bg-gradient-to-br from-indigo-100 to-indigo-200"
          iconColor="text-indigo-600"
        />
      </div>

      {/* الفلاتر والبحث المحسن */}
      {(searchable || filterable) && (
        <div className={`rounded-2xl p-4 sm:p-6 shadow-sm border mb-6 transition-colors duration-300 ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-100'
        }`}>
          <div className="flex flex-col lg:flex-row gap-4">
            {searchable && (
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="🔍 البحث في المقالات، العناوين، المحتوى..."
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className={`pr-10 ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                  />
                </div>
              </div>
            )}
            
            {filterable && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`${darkMode ? 'border-gray-600 hover:bg-gray-700' : ''} ${
                    showFilters ? 'bg-blue-50 border-blue-300' : ''
                  }`}
                >
                  <Filter className="h-4 w-4 ml-2" />
                  فلاتر {showFilters ? '🔽' : '🔼'}
                </Button>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className={`px-3 py-1 text-sm rounded-md border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="all">📋 جميع الحالات</option>
                  <option value="published">✅ منشور</option>
                  <option value="draft">⏳ مسودة</option>
                  <option value="archived">📦 مؤرشف</option>
                </select>
                
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`px-3 py-1 text-sm rounded-md border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="publishedAt">📅 تاريخ النشر</option>
                  <option value="views">👁️ المشاهدات</option>
                  <option value="comments_count">💬 التعليقات</option>
                  <option value="likes_count">👍 الإعجابات</option>
                </select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className={`${darkMode ? 'border-gray-600 hover:bg-gray-700' : ''}`}
                >
                  <SortDesc className={`h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''} transition-transform`} />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* جدول المقالات المحسن */}
      <div className={`rounded-2xl shadow-lg border overflow-hidden transition-colors duration-300 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${darkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100'}`}>
                <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider w-2/5 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  📋 المقال والمحتوى
                </th>
                <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  📊 الحالة
                </th>
                <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  📈 الإحصائيات
                </th>
                <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  👤 الكاتب
                </th>
                <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  📅 التاريخ
                </th>
                {showActions && (
                  <th className={`px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    ⚙️ الإجراءات
                  </th>
                )}
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {loading ? (
                <tr>
                  <td colSpan={showActions ? 6 : 5} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        جاري تحميل المقالات...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : articles.length === 0 ? (
                <tr>
                  <td colSpan={showActions ? 6 : 5} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="w-16 h-16 text-gray-300 mb-4" />
                      <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        لا توجد مقالات
                      </h3>
                      <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        ابدأ بإنشاء أول مقال
                      </p>
                      <Button 
                        onClick={() => router.push('/dashboard/articles/create')}
                        className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
                      >
                        <Plus className="h-4 w-4 ml-2" />
                        إنشاء مقال جديد
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                articles.map((article: Article) => (
                  <tr key={article.id} className={`transition-all duration-200 hover:scale-[1.01] ${
                    darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-blue-50/50'
                  }`}>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-md ${
                          darkMode ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          {article.featuredImage ? (
                            <Image
                              src={article.featuredImage}
                              alt={article.title}
                              width={56}
                              height={56}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600">
                              <FileText className="w-7 h-7 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className={`font-semibold text-sm line-clamp-1 mb-1 ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {article.title}
                          </h3>
                          <p className={`text-xs mt-1 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {article.excerpt}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            {article.category && (
                              <Badge variant="outline" className="text-xs">
                                {article.category}
                              </Badge>
                            )}
                            {article.views > 1000 && (
                              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                                🔥 شائع
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <Badge className={`${getStatusColor(article.status)}`}>
                        {article.status === 'published' ? '✅' : article.status === 'draft' ? '⏳' : '📦'} {getStatusText(article.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Eye className={`w-3 h-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {article.views.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className={`w-3 h-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {article.comments_count || 0}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className={`w-3 h-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {article.likes_count || 0}
                            </span>
                          </div>
                        </div>
                        {article.reading_time && (
                          <div className="flex items-center gap-1">
                            <Clock className={`w-3 h-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {article.reading_time} دقيقة قراءة
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <User className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {article.author}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <Calendar className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {new Date(article.publishedAt).toLocaleDateString('ar-SA', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </td>
                    {showActions && (
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => router.push(`/dashboard/articles/${article.id}`)}
                                  className={`hover:bg-blue-100 dark:hover:bg-blue-900/20`}
                                >
                                  <Eye className="h-4 w-4 text-blue-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>👁️ عرض</p>
                              </TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => router.push(`/dashboard/articles/${article.id}/edit`)}
                                  className={`hover:bg-purple-100 dark:hover:bg-purple-900/20`}
                                >
                                  <Edit className="h-4 w-4 text-purple-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>✏️ تحرير</p>
                              </TooltipContent>
                            </Tooltip>
                            
                            {article.status === 'published' && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(`/article/${article.id}`, '_blank')}
                                    className={`hover:bg-green-100 dark:hover:bg-green-900/20`}
                                  >
                                    <ExternalLink className="h-4 w-4 text-green-600" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>🔗 عرض في الموقع</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                            
                            <DropdownMenu>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <DropdownMenuTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className={`hover:bg-gray-100 dark:hover:bg-gray-700`}
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>⚙️ المزيد</p>
                                </TooltipContent>
                              </Tooltip>
                              <DropdownMenuContent align="end">
                                {article.status === 'draft' && (
                                  <DropdownMenuItem
                                    onClick={() => handleStatusUpdate(article.id, 'published')}
                                  >
                                    <CheckCircle className="h-4 w-4 ml-2 text-green-600" />
                                    <span>📤 نشر المقال</span>
                                  </DropdownMenuItem>
                                )}
                                {article.status === 'published' && (
                                  <DropdownMenuItem
                                    onClick={() => handleStatusUpdate(article.id, 'draft')}
                                  >
                                    <Clock className="h-4 w-4 ml-2 text-yellow-600" />
                                    <span>⏳ تحويل لمسودة</span>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}/article/${article.id}`)}
                                >
                                  <Copy className="h-4 w-4 ml-2 text-gray-600" />
                                  <span>📋 نسخ الرابط</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {article.status !== 'archived' && (
                                  <DropdownMenuItem
                                    onClick={() => handleStatusUpdate(article.id, 'archived')}
                                  >
                                    <Archive className="h-4 w-4 ml-2 text-gray-600" />
                                    <span>📦 أرشفة</span>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => handleDelete(article.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4 ml-2" />
                                  <span>🗑️ حذف</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TooltipProvider>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* التصفح المحسن */}
        {totalPages > 1 && (
          <div className={`flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t gap-4 ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              📊 عرض <span className="font-semibold">{(page - 1) * pageSize + 1}</span> إلى{' '}
              <span className="font-semibold">{Math.min(page * pageSize, stats.total)}</span> من{' '}
              <span className="font-semibold">{stats.total}</span> مقال
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`${darkMode ? 'border-gray-600 hover:bg-gray-700' : ''} transition-all duration-200`}
              >
                <ChevronRight className="h-4 w-4 ml-1" />
                السابق
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className={`w-9 h-9 p-0 transition-all duration-200 ${
                        page === pageNum
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg scale-110'
                          : darkMode
                            ? 'hover:bg-gray-700'
                            : 'hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className={`px-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>...</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPage(totalPages)}
                      className={`w-9 h-9 p-0 transition-all duration-200 ${
                        darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className={`${darkMode ? 'border-gray-600 hover:bg-gray-700' : ''} transition-all duration-200`}
              >
                التالي
                <ChevronLeft className="h-4 w-4 mr-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleList;
