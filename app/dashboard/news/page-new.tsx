'use client';

import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useDarkModeContext } from '@/contexts/DarkModeContext'
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout'
import MobileNewsManagement from '@/components/mobile/MobileNewsManagement'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectOption } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  ChevronDown, 
  Search,
  Edit,
  Trash2,
  Copy,
  Eye,
  Calendar,
  Clock,
  Zap,
  Users,
  TrendingUp,
  MessageSquare,
  AlertTriangle,
  ArrowUp,
  Newspaper,
  PenTool,
  FileText,
  BarChart3,
  Sparkles,
  Image as ImageIcon,
  Layers,
  Plus,
  MoreHorizontal,
  Target,
  Activity,
  ChevronLeft,
  ChevronRight,
  Send,
  Archive,
  RefreshCw,
  ExternalLink,
  Bookmark,
  Share2,
  Download,
  Filter,
  SortDesc,
  ThumbsUp,
  Star,
  Globe,
  Award,
  Lightbulb,
  Settings,
  CheckCircle,
  Gauge,
  Timer,
  TrendingDown,
  HelpCircle
} from 'lucide-react'
import { formatFullDate, formatDateTime, formatRelativeDate } from '@/lib/date-utils'

type NewsStatus = 'published' | 'draft' | 'pending' | 'deleted' | 'scheduled';

type NewsItem = {
  id: string;
  title: string;
  author: string;
  author_name?: string;
  category: string | number;
  category_name?: string;
  category_color?: string;
  publishTime: string;
  publishAt?: string;
  viewCount: number;
  lastModified: string;
  lastModifiedBy: string;
  isPinned: boolean;
  isBreaking: boolean;
  status: NewsStatus;
  rating: number;
  slug?: string;
  createdAt?: string;
};

// دالة لتحديد لون النص بناءً على لون الخلفية
function getContrastColor(hexColor: string): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

// دالة لحساب الوقت النسبي
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'قبل لحظات';
  if (diffInSeconds < 3600) return `قبل ${Math.floor(diffInSeconds / 60)} دقيقة`;
  if (diffInSeconds < 86400) return `قبل ${Math.floor(diffInSeconds / 3600)} ساعة`;
  if (diffInSeconds < 604800) return `قبل ${Math.floor(diffInSeconds / 86400)} يوم`;
  if (diffInSeconds < 2592000) return `قبل ${Math.floor(diffInSeconds / 604800)} أسبوع`;
  if (diffInSeconds < 31536000) return `قبل ${Math.floor(diffInSeconds / 2592000)} شهر`;
  return `قبل ${Math.floor(diffInSeconds / 31536000)} سنة`;
}

export default function NewsManagementPage() {
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [categories, setCategories] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedNews, setSelectedNews] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const { darkMode } = useDarkModeContext();
  const router = useRouter();

  // اكتشاف الموبايل
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // عرض نسخة الموبايل المحسنة
  if (isMobile) {
    return <MobileNewsManagement />;
  }

  // جلب التصنيفات
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories?status=active');
        if (response.ok) {
          const result = await response.json();
          setCategories(result.categories || result.data || []);
        }
      } catch (err) {
        console.error('خطأ في جلب التصنيفات:', err);
      }
    };
    fetchCategories();
  }, []);

  // جلب الأخبار
  const fetchNewsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy,
        sortOrder,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        ...(selectedCategory !== 'all' && { category: selectedCategory })
      });

      const response = await fetch(`/api/articles?${params}`);
      
      if (!response.ok) {
        throw new Error('فشل في تحميل البيانات');
      }

      const data = await response.json();
      
      const mapped: NewsItem[] = (data.articles || []).map((a: any) => {
        let status = a.status as NewsStatus;
        const publishAt = a.publish_at || a.published_at;
        
        if (status === 'published' && publishAt) {
          const publishDate = new Date(publishAt);
          const now = new Date();
          if (publishDate > now) {
            status = 'scheduled';
          }
        }

        const formatSafeDate = (dateString: any) => {
          if (!dateString) return null;
          try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
              return null;
            }
            return date.toLocaleString('ar-SA', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });
          } catch (error) {
            return null;
          }
        };

        const getAuthorName = () => {
          if (a.author && a.author.name) return a.author.name;
          if (a.author_name) return a.author_name;
          if (a.created_by && a.created_by.name) return a.created_by.name;
          if (a.user && a.user.name) return a.user.name;
          if (a.author && a.author.email) return a.author.email.split('@')[0];
          if (a.created_by && a.created_by.email) return a.created_by.email.split('@')[0];
          return 'غير محدد';
        };

        return {
          id: a.id,
          title: a.title,
          author: a.author_id || a.created_by_id || a.user_id || '—',
          author_name: getAuthorName(),
          category: a.category_id || 0,
          category_name: a.category?.name || a.category_name || 'غير مصنف',
          category_color: a.category?.color || a.category_color || '#6B7280',
          publishTime: formatSafeDate(a.published_at) || formatSafeDate(a.created_at) || '—',
          publishAt: a.published_at || a.created_at,
          viewCount: a.views_count || 0,
          lastModified: formatSafeDate(a.updated_at) || formatSafeDate(a.created_at) || '—',
          lastModifiedBy: getAuthorName(),
          isPinned: a.is_pinned || false,
          isBreaking: a.is_breaking || false,
          status: status,
          rating: a.rating || 0,
          slug: a.slug,
          createdAt: a.created_at
        };
      });

      setNewsData(mapped);
      const totalPages = Math.ceil((data.total || 0) / 10);
      setTotalPages(totalPages);
      
    } catch (err) {
      console.error('خطأ في جلب البيانات:', err);
      setError('فشل في تحميل البيانات');
      toast.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsData();
  }, [page, sortBy, sortOrder, selectedStatus, selectedCategory]);

  // مكون بطاقة الإحصائية
  const StatsCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    bgColor,
    iconColor,
    trend,
    trendValue
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: any;
    bgColor: string;
    iconColor: string;
    trend?: 'up' | 'down';
    trendValue?: string;
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
          {trend && trendValue && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`w-3 h-3 ${trend === 'down' ? 'rotate-180' : ''}`} />
              <span>{trendValue}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // حساب الإحصائيات
  const stats = {
    total: newsData.length,
    published: newsData.filter(n => n.status === 'published').length,
    draft: newsData.filter(n => n.status === 'draft').length,
    pending: newsData.filter(n => n.status === 'pending').length,
    scheduled: newsData.filter(n => n.status === 'scheduled').length,
    totalViews: newsData.reduce((acc, n) => acc + n.viewCount, 0),
    avgRating: newsData.length > 0 
      ? Math.round(newsData.reduce((acc, n) => acc + n.rating, 0) / newsData.length * 10) / 10
      : 0,
    breaking: newsData.filter(n => n.isBreaking).length,
    pinned: newsData.filter(n => n.isPinned).length,
    thisWeek: newsData.filter(n => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return new Date(n.publishTime) > oneWeekAgo;
    }).length,
    topPerforming: newsData.filter(n => n.viewCount > 1000).length,
    recentlyUpdated: newsData.filter(n => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      return new Date(n.lastModified) > threeDaysAgo;
    }).length
  };

  // دوال مساعدة
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700';
      case 'draft':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700';
      case 'pending':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700';
      case 'scheduled':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'منشور';
      case 'draft': return 'مسودة';
      case 'pending': return 'معلق';
      case 'scheduled': return 'مجدول';
      default: return 'غير محدد';
    }
  };

  // حذف خبر
  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الخبر؟')) return;
    
    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast.success('تم حذف الخبر بنجاح');
        fetchNewsData();
      } else {
        toast.error('فشل في حذف الخبر');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('حدث خطأ في حذف الخبر');
    }
  };

  // تحديث حالة الخبر
  const handleStatusUpdate = async (id: string, status: NewsStatus) => {
    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        toast.success('تم تحديث حالة الخبر');
        fetchNewsData();
      } else {
        toast.error('فشل في تحديث الحالة');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('حدث خطأ في تحديث الحالة');
    }
  };

  return (
    <DashboardLayout 
      pageTitle="إدارة الأخبار المتقدمة"
      pageDescription="منصة متكاملة لإدارة ونشر المحتوى الإخباري مع أدوات تحليل الأداء وتتبع التفاعل"
    >
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
                📰 إدارة الأخبار المتقدمة
              </h1>
              <p className={`text-sm sm:text-base transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                منصة متكاملة لإدارة ونشر المحتوى الإخباري مع أدوات تحليل الأداء وتتبع التفاعل
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700">
                <Sparkles className="w-3 h-3 mr-1" />
                Smart CMS
              </Badge>
              <Badge variant="outline" className={darkMode ? 'border-gray-600' : ''}>
                <Globe className="w-3 h-3 mr-1" />
                {stats.published} منشور
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
                  <TrendingUp className={`w-4 h-4 ${stats.thisWeek > 0 ? 'text-blue-500' : 'text-gray-400'}`} />
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {stats.thisWeek} هذا الأسبوع
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-16 h-1.5 rounded-full overflow-hidden ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                    style={{ width: `${stats.avgRating * 20}%` }}
                  />
                </div>
                <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {stats.avgRating}/5 تقييم
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatsCard
            title="إجمالي الأخبار"
            value={stats.total}
            subtitle="خبر"
            icon={Newspaper}
            bgColor="bg-gradient-to-br from-blue-500 to-blue-600"
            iconColor="text-white"
            trend="up"
            trendValue="+12%"
          />
          
          <StatsCard
            title="المشاهدات الكلية"
            value={stats.totalViews.toLocaleString()}
            subtitle="مشاهدة"
            icon={Eye}
            bgColor="bg-gradient-to-br from-green-500 to-green-600"
            iconColor="text-white"
            trend="up"
            trendValue="+23%"
          />
          
          <StatsCard
            title="أخبار عاجلة"
            value={stats.breaking}
            subtitle="نشط"
            icon={Zap}
            bgColor="bg-gradient-to-br from-red-500 to-red-600"
            iconColor="text-white"
          />
          
          <StatsCard
            title="متوسط التقييم"
            value={stats.avgRating}
            subtitle="من 5"
            icon={Star}
            bgColor="bg-gradient-to-br from-yellow-500 to-yellow-600"
            iconColor="text-white"
            trend="up"
            trendValue="+0.3"
          />
        </div>

        {/* قسم النظام التحريري المحسن */}
        <div className="mb-6 sm:mb-8">
          <div className={`rounded-2xl p-4 sm:p-6 border transition-colors duration-300 ${
            darkMode 
              ? 'bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border-blue-700/50' 
              : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Newspaper className="text-white w-6 h-6" />
                </div>
                <div>
                  <h2 className={`text-lg sm:text-xl font-bold transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    🚀 مركز النشر الذكي
                  </h2>
                  <p className={`text-xs sm:text-sm transition-colors duration-300 ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    أدوات متقدمة لإنشاء ونشر المحتوى الإخباري مع تحليل الأداء
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard/news/unified"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    darkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <Plus className="w-4 h-4 mr-1 inline" />
                  إنشاء خبر جديد
                </Link>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <Button
                onClick={() => router.push('/dashboard/news/unified')}
                className={`p-3 rounded-xl flex flex-col items-center gap-2 text-center transition-all duration-300 ${
                  darkMode
                    ? 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 border border-gray-600'
                    : 'bg-white/70 hover:bg-white text-gray-700 border border-gray-200'
                }`}
              >
                <PenTool className="w-5 h-5 text-blue-500" />
                <span className="text-xs font-medium">كتابة سريعة</span>
              </Button>
              
              <Button
                onClick={() => router.push('/admin/news/create-new')}
                className={`p-3 rounded-xl flex flex-col items-center gap-2 text-center transition-all duration-300 ${
                  darkMode
                    ? 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 border border-gray-600'
                    : 'bg-white/70 hover:bg-white text-gray-700 border border-gray-200'
                }`}
              >
                <Layers className="w-5 h-5 text-green-500" />
                <span className="text-xs font-medium">إنشاء متقدم</span>
              </Button>
              
              <Button
                onClick={() => setActiveTab('draft')}
                className={`p-3 rounded-xl flex flex-col items-center gap-2 text-center transition-all duration-300 ${
                  darkMode
                    ? 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 border border-gray-600'
                    : 'bg-white/70 hover:bg-white text-gray-700 border border-gray-200'
                }`}
              >
                <FileText className="w-5 h-5 text-yellow-500" />
                <span className="text-xs font-medium">المسودات ({stats.draft})</span>
              </Button>
              
              <Button
                onClick={() => router.push('/dashboard/analytics')}
                className={`p-3 rounded-xl flex flex-col items-center gap-2 text-center transition-all duration-300 ${
                  darkMode
                    ? 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 border border-gray-600'
                    : 'bg-white/70 hover:bg-white text-gray-700 border border-gray-200'
                }`}
              >
                <BarChart3 className="w-5 h-5 text-purple-500" />
                <span className="text-xs font-medium">تحليل الأداء</span>
              </Button>
            </div>
          </div>
        </div>

        {/* شريط البحث والفلترة */}
        <div className={`rounded-xl p-4 border mb-6 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <Input
                  type="text"
                  placeholder="البحث في الأخبار..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pr-10 ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={`px-3 py-2 rounded-lg border text-sm ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                }`}
              >
                <option value="all">كل الحالات</option>
                <option value="published">منشور</option>
                <option value="draft">مسودة</option>
                <option value="pending">معلق</option>
                <option value="scheduled">مجدول</option>
              </select>
              
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`px-3 py-2 rounded-lg border text-sm ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                }`}
              >
                <option value="all">كل التصنيفات</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              
              <Button
                onClick={fetchNewsData}
                className={`px-4 ${
                  darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* قائمة الأخبار */}
        <div className={`rounded-xl border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                جاري تحميل الأخبار...
              </p>
            </div>
          ) : newsData.length === 0 ? (
            <div className="p-8 text-center">
              <Newspaper className={`w-12 h-12 mx-auto mb-4 ${
                darkMode ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <p className={`text-lg font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                لا توجد أخبار
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                ابدأ بإنشاء أول خبر لك
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {newsData.map((news) => (
                <div
                  key={news.id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    selectedNews.includes(news.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`text-sm font-medium truncate ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {news.title}
                        </h3>
                        
                        {news.isBreaking && (
                          <Badge className="bg-red-100 text-red-700 text-xs">
                            عاجل
                          </Badge>
                        )}
                        
                        {news.isPinned && (
                          <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                            مثبت
                          </Badge>
                        )}
                        
                        <Badge className={`text-xs ${getStatusColor(news.status)}`}>
                          {getStatusText(news.status)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {news.author_name}
                        </span>
                        
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {getRelativeTime(news.publishAt || news.createdAt || '')}
                        </span>
                        
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {news.viewCount.toLocaleString()}
                        </span>
                        
                        <span 
                          className="px-2 py-0.5 rounded text-xs"
                          style={{
                            backgroundColor: news.category_color,
                            color: getContrastColor(news.category_color || '#6B7280')
                          }}
                        >
                          {news.category_name}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => router.push(`/dashboard/news/edit/${news.id}`)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>تعديل</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(`/news/${news.slug}`, '_blank')}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>عرض</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStatusUpdate(news.id, 'published')}>
                            <Send className="w-4 h-4 mr-2" />
                            نشر
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(news.id, 'draft')}>
                            <FileText className="w-4 h-4 mr-2" />
                            حفظ كمسودة
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(news.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* التنقل بين الصفحات */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              صفحة {page} من {totalPages}
            </div>
            
            <div className="flex gap-2">
              <Button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                variant="outline"
                size="sm"
              >
                <ChevronRight className="w-4 h-4" />
                السابق
              </Button>
              
              <Button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                variant="outline"
                size="sm"
              >
                التالي
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
