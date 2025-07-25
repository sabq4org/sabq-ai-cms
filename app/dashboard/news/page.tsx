'use client';

import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useDarkModeContext } from '@/contexts/DarkModeContext'
import EditorErrorBoundary from '@/components/ErrorBoundary'
import SimpleDashboardLayout from '@/components/layout/SimpleDashboardLayout'
import MobileNewsManagement from '@/components/mobile/MobileNewsManagement'
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
  Layers
} from 'lucide-react';
import { formatFullDate, formatDateTime, formatRelativeDate } from '@/lib/date-utils';
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
  publishAt?: string; // إضافة تاريخ النشر المجدول
  viewCount: number;
  lastModified: string;
  lastModifiedBy: string;
  isPinned: boolean;
  isBreaking: boolean;
  status: NewsStatus;
  rating: number;
  slug?: string;
  createdAt?: string; // إضافة تاريخ الإنشاء للترتيب
};
// دالة لتحديد لون النص بناءً على لون الخلفية
function getContrastColor(hexColor: string): string {
  // تحويل HEX إلى RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  // حساب اللمعان
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  // إرجاع أسود أو أبيض حسب اللمعان
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
  // استرجاع البيانات الحقيقية من API
  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 بدء جلب البيانات...');
        const startTime = Date.now();
        // جلب البيانات مع الترتيب من الأحدث - تحديث: إضافة status=all للداشبورد
        const response = await fetch('/api/articles?status=all&limit=100&sort=created_at&order=desc');
        if (!response.ok) {
          throw new Error('فشل في تحميل البيانات');
        }
        const data = await response.json();
        console.log(`✅ تم جلب البيانات في ${Date.now() - startTime}ms`);
        const mapped: NewsItem[] = (data.articles || []).map((a: any) => {
          // تحديد الحالة بناءً على التاريخ
          let status = a.status as NewsStatus;
          const publishAt = a.publish_at || a.published_at;
          if (status === 'published' && publishAt) {
            const publishDate = new Date(publishAt);
            const now = new Date();
            if (publishDate > now) {
              status = 'scheduled';
            }
          }
          
          // معالجة التاريخ بشكل آمن
          const formatSafeDate = (dateString: any) => {
            if (!dateString) return null;
            try {
              const date = new Date(dateString);
              // التحقق من صحة التاريخ
              if (isNaN(date.getTime())) {
                console.warn('تاريخ غير صالح:', dateString);
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
              console.error('خطأ في تحويل التاريخ:', error);
              return null;
            }
          };
          
          // الحصول على اسم الكاتب من البيانات المتاحة
          const getAuthorName = () => {
            // أولاً: محاولة الحصول على الاسم من علاقة author
            if (a.author && a.author.name) return a.author.name;
            
            // ثانياً: محاولة الحصول على الاسم من author_name
            if (a.author_name) return a.author_name;
            
            // ثالثاً: محاولة الحصول على الاسم من created_by أو user
            if (a.created_by && a.created_by.name) return a.created_by.name;
            if (a.user && a.user.name) return a.user.name;
            
            // رابعاً: استخدام البريد الإلكتروني إذا كان متاحاً
            if (a.author && a.author.email) return a.author.email.split('@')[0];
            if (a.created_by && a.created_by.email) return a.created_by.email.split('@')[0];
            
            // خامساً: إذا لم يتوفر أي شيء، إرجاع "غير محدد" بدلاً من "كاتب مجهول"
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
            publishAt: a.published_at || a.created_at, // استخدام التاريخ الخام للمعالجة في العرض
            viewCount: a.views_count || 0,
            lastModified: formatSafeDate(a.updated_at) || formatSafeDate(a.created_at) || '—',
            lastModifiedBy: a.editor?.name || a.editor_name || getAuthorName(),
            isPinned: a.is_pinned || false,
            isBreaking: a.is_breaking || 
                       (a.metadata && (
                         a.metadata.isBreakingNews || 
                         a.metadata.breaking || 
                         a.metadata.is_breaking
                       )) || false,
            status: status,
            rating: 0,
            slug: a.slug,
            createdAt: a.created_at // إضافة تاريخ الإنشاء للترتيب
          };
        });
        
        // ترتيب البيانات من الأحدث إلى الأقدم
        const sortedData = mapped.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA; // ترتيب تنازلي (الأحدث أولاً)
        });
        
        console.log(`📊 تم تحويل وترتيب ${sortedData.length} مقال`);
        setNewsData(sortedData);
      } catch (err) {
        console.error('❌ خطأ في جلب البيانات:', err);
        setError(err instanceof Error ? err.message : 'حدث خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };
    fetchNewsData();
  }, []);
  // دوال المساعدة للأزرار
  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف المقال؟')) return;
    try {
      const response = await fetch('/api/articles', {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          // إرسال رمز المصادقة من الكوكيز تلقائياً
        },
        credentials: 'include', // مهم: لإرسال الكوكيز مع الطلب
        body: JSON.stringify({ ids: [id] })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل حذف المقال');
      }

      const result = await response.json();
      
      // تحديث البيانات محلياً فقط إذا نجح الحذف
      if (result.success) {
        setNewsData(prev => prev.map(n => n.id === id ? { ...n, status: 'deleted' as NewsStatus } : n));
        toast.success(result.message || 'تم نقل المقال إلى المحذوفات');
      } else {
        throw new Error(result.error || 'فشل حذف المقال');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'فشل حذف المقال');
      console.error('خطأ في حذف المقال:', e);
    }
  };
  const handleCopy = (slugOrId: string) => {
    navigator.clipboard.writeText(`https://sabq.org/articles/${slugOrId}`)
      .then(() => toast.success('تم نسخ الرابط'))
      .catch(() => toast.error('لم يتم نسخ الرابط'));
  };
  const handleRestore = async (id: string) => {
    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // مهم: لإرسال الكوكيز مع الطلب
        body: JSON.stringify({ status: 'draft', is_deleted: false })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل استعادة المقال');
      }

      const result = await response.json();
      
      if (result.success) {
        setNewsData(prev => prev.map(n => n.id === id ? { ...n, status: 'draft' as NewsStatus } : n));
        toast.success('تم استعادة المقال إلى المسودات');
      } else {
        throw new Error(result.error || 'فشل استعادة المقال');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'فشل استعادة المقال');
      console.error('خطأ في استعادة المقال:', e);
    }
  };

  // دالة تبديل حالة الخبر العاجل
  const handleToggleBreaking = async (articleId: string, currentBreakingStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/toggle-breaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ articleId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل تحديث حالة الخبر العاجل');
      }

      const result = await response.json();
      
      if (result.success) {
        // Optimistic update - تحديث فوري للواجهة
        setNewsData(prev => prev.map(n => 
          n.id === articleId 
            ? { ...n, isBreaking: result.data.isBreakingNews }
            : // إلغاء حالة العاجل من المقالات الأخرى إذا تم تفعيل مقال جديد
              result.data.isBreakingNews 
                ? { ...n, isBreaking: false }
                : n
        ));
        
        toast.success(result.data.message || 'تم تحديث حالة الخبر العاجل');
      } else {
        throw new Error(result.error || 'فشل تحديث حالة الخبر العاجل');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'فشل تحديث حالة الخبر العاجل');
      console.error('خطأ في تحديث حالة الخبر العاجل:', e);
    }
  };
  const statusTabs = [
    { 
      id: 'all', 
      name: 'جميع الأخبار', 
      count: newsData.filter(item => item.status !== 'deleted').length,
      icon: <FileText className="w-5 h-5" />
    },
    { 
      id: 'published', 
      name: 'منشور', 
      count: newsData.filter(item => item.status === 'published').length,
      icon: <Eye className="w-5 h-5" />
    },
    { 
      id: 'scheduled', 
      name: 'مجدولة', 
      count: newsData.filter(item => item.status === 'scheduled').length,
      icon: <Calendar className="w-5 h-5" />
    },
    { 
      id: 'draft', 
      name: 'مسودة', 
      count: newsData.filter(item => item.status === 'draft').length,
      icon: <Edit className="w-5 h-5" />
    },
    { 
      id: 'pending', 
      name: 'في الانتظار', 
      count: newsData.filter(item => item.status === 'pending').length,
      icon: <Clock className="w-5 h-5" />
    },
    { 
      id: 'breaking', 
      name: 'عاجل', 
      count: newsData.filter(item => item.isBreaking && item.status !== 'deleted').length,
      icon: <Zap className="w-5 h-5" />
    },
    { 
      id: 'deleted', 
      name: 'محذوفة', 
      count: newsData.filter(item => item.status === 'deleted').length,
      icon: <Trash2 className="w-5 h-5" />
    }
  ];
  const getStatusBadge = (status: NewsStatus) => {
    const statusConfig = {
      published: { color: 'bg-green-100 text-green-700', text: 'منشور' },
      draft: { color: 'bg-yellow-100 text-yellow-700', text: 'مسودة' },
      pending: { color: 'bg-blue-100 text-blue-700', text: 'في الانتظار' },
      deleted: { color: 'bg-gray-100 text-gray-700', text: 'محذوف' },
      scheduled: { color: 'bg-purple-100 text-purple-700', text: 'مجدول' }
    };
    return statusConfig[status] || statusConfig.draft;
  };
  // مكون بطاقة الإحصائية المحسّنة
  const EnhancedStatsCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    bgGradient,
    iconColor,
    trend,
    trendValue
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: any;
    bgGradient: string;
    iconColor: string;
    trend?: 'up' | 'down';
    trendValue?: string;
  }) => (
    <div className={`rounded-2xl p-4 sm:p-6 shadow-sm border transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-100'
    }`}>
      <div className="flex items-center gap-3 sm:gap-4">
        <div className={`w-12 h-12 sm:w-14 sm:h-14 ${bgGradient} rounded-2xl flex items-center justify-center shadow-lg`}>
          <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${iconColor}`} />
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
  return (
    <SimpleDashboardLayout pageName="إدارة الأخبار">
      <div className={`p-4 sm:p-6 lg:p-8 transition-colors duration-300 ${
        darkMode ? 'bg-gray-900' : ''
      }`}>
      {/* عنوان وتعريف الصفحة */}
      <div className="mb-6 sm:mb-8">
        <h1 className={`text-2xl sm:text-3xl font-bold mb-2 transition-colors duration-300 ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>مركز إدارة المحتوى الإخباري</h1>
        <p className={`text-sm sm:text-base transition-colors duration-300 ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>منصة متكاملة لإدارة ونشر المحتوى الإخباري مع أدوات تحليل الأداء وتتبع التفاعل</p>
      </div>
      
      {/* شريط معلومات الواجهة الجديدة */}
      <div className={`p-4 rounded-lg border mb-6 ${
        darkMode 
          ? "bg-blue-900/20 border-blue-700" 
          : "bg-blue-50 border-blue-200"
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-blue-600/20">
            <Zap className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold mb-1 ${
              darkMode ? "text-blue-300" : "text-blue-900"
            }`}>
              جرّب الواجهة الموحدة الجديدة لإنشاء الأخبار! ✨
            </h3>
            <p className={`text-sm ${
              darkMode ? "text-blue-400" : "text-blue-700"
            }`}>
              دمج كل الخطوات في صفحة واحدة - أسرع بـ 70% وأسهل في الاستخدام
            </p>
          </div>
          <Link
            href="/dashboard/news/unified"
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
          >
            جرب الآن
          </Link>
        </div>
      </div>
      {/* قسم النظام التحريري - محسّن */}
      <div className="mb-6 sm:mb-8">
        <div className={`relative overflow-hidden rounded-2xl p-6 sm:p-8 shadow-lg border transition-all duration-300 ${
          darkMode 
            ? 'bg-gradient-to-br from-blue-900/40 via-indigo-900/30 to-purple-900/40 border-blue-700/50' 
            : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200'
        }`}>
          {/* خلفية متحركة */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-indigo-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-75"></div>
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform duration-300">
                  <Newspaper className="w-8 h-8 sm:w-9 sm:h-9 text-white" />
                </div>
              </div>
              <div>
                <h2 className={`text-xl sm:text-2xl font-bold transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  مركز إدارة المحتوى الإخباري
                </h2>
                <p className={`text-sm sm:text-base transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  أدوات متقدمة لإنشاء ونشر ومتابعة المحتوى الإخباري بكفاءة عالية
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Link 
                href="/dashboard/news/insights"
                className="group flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm font-medium"
              >
                <BarChart3 className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                <span className="hidden sm:inline">تحليلات متقدمة</span>
                <span className="sm:hidden">تحليلات</span>
              </Link>
              <Link 
                href="/dashboard/article/unified/new"
                className="group flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm font-medium"
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span className="hidden sm:inline">✨ واجهة موحدة</span>
                <span className="sm:hidden">موحد!</span>
              </Link>
              <Link 
                href="/dashboard/article/unified/new"
                className="group flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm font-medium"
              >
                <PenTool className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                مقال جديد
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* بطاقات الإحصائيات المحسّنة بتصميم حديث */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-6 mb-8">
        <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 ${darkMode ? 'dark:from-blue-500/20 dark:to-blue-600/20' : ''}`}></div>
          <div className={`relative p-5 ${darkMode ? 'bg-gray-800/90 backdrop-blur-sm' : 'bg-white/90 backdrop-blur-sm'}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-green-500 text-xs font-medium">
                <TrendingUp className="w-3 h-3" />
                +12%
              </div>
            </div>
            <h3 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {newsData.filter(item => item.status !== 'deleted').length}
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>إجمالي المحتوى</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className={`absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-600/10 ${darkMode ? 'dark:from-green-500/20 dark:to-emerald-600/20' : ''}`}></div>
          <div className={`relative p-5 ${darkMode ? 'bg-gray-800/90 backdrop-blur-sm' : 'bg-white/90 backdrop-blur-sm'}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-green-500 text-xs font-medium">
                <TrendingUp className="w-3 h-3" />
                +8%
              </div>
            </div>
            <h3 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {newsData.filter(item => item.status === 'published').length}
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>المحتوى المنشور</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className={`absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-600/10 ${darkMode ? 'dark:from-purple-500/20 dark:to-indigo-600/20' : ''}`}></div>
          <div className={`relative p-5 ${darkMode ? 'bg-gray-800/90 backdrop-blur-sm' : 'bg-white/90 backdrop-blur-sm'}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {newsData.filter(item => item.status === 'scheduled').length}
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>المحتوى المجدول</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className={`absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-600/10 ${darkMode ? 'dark:from-orange-500/20 dark:to-amber-600/20' : ''}`}></div>
          <div className={`relative p-5 ${darkMode ? 'bg-gray-800/90 backdrop-blur-sm' : 'bg-white/90 backdrop-blur-sm'}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg">
                <Edit className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {newsData.filter(item => item.status === 'draft').length}
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>المسودات</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className={`absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-amber-600/10 ${darkMode ? 'dark:from-yellow-500/20 dark:to-amber-600/20' : ''}`}></div>
          <div className={`relative p-5 ${darkMode ? 'bg-gray-800/90 backdrop-blur-sm' : 'bg-white/90 backdrop-blur-sm'}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl shadow-lg animate-pulse">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {newsData.filter(item => item.isBreaking && item.status !== 'deleted').length}
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>الأخبار العاجلة</p>
          </div>
        </div>
      </div>
      {/* أزرار التنقل المحسّنة بتصميم حديث */}
      <div className={`rounded-2xl p-3 shadow-md border mb-8 w-full transition-all duration-300 ${
        darkMode 
          ? 'bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700' 
          : 'bg-gradient-to-r from-white to-gray-50 border-gray-200'
      }`}>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {statusTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`min-w-[100px] sm:min-w-[120px] lg:w-44 flex flex-col items-center justify-center gap-1 sm:gap-2 py-3 sm:py-4 px-2 sm:px-3 rounded-xl font-medium text-xs sm:text-sm transition-all duration-300 relative ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                    : darkMode
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {/* خط سفلي للتاب النشط */}
                {isActive && (
                  <div className="absolute bottom-0 left-4 right-4 h-1 bg-white/30 rounded-full" />
                )}
                <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                  {React.cloneElement(tab.icon, { 
                    className: `w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-white' : ''}` 
                  })}
                </div>
                <div className="text-center">
                  <div className={`whitespace-nowrap ${isActive ? 'font-semibold' : ''}`}>
                    {tab.name}
                  </div>
                </div>
                {tab.count > 0 && (
                  <span className={`absolute -top-1 -right-1 px-2 py-0.5 text-xs rounded-full font-bold ${
                    isActive
                      ? 'bg-white text-blue-600 shadow-md'
                      : darkMode
                        ? 'bg-gray-700 text-gray-300 border border-gray-600'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      {/* شريط البحث والفلاتر المحسّن */}
      <div className={`relative overflow-hidden rounded-2xl shadow-lg border mb-8 transition-all duration-300 ${
        darkMode 
          ? 'bg-gradient-to-r from-gray-800/95 to-gray-900/95 border-gray-700/50' 
          : 'bg-gradient-to-r from-white to-gray-50 border-gray-200'
      }`}>
        {/* خلفية متحركة خفيفة */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-96 group">
                <Search className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-all duration-300 ${
                  darkMode ? 'text-gray-400 group-focus-within:text-blue-400' : 'text-gray-500 group-focus-within:text-blue-600'
                }`} />
                <input
                  type="text"
                  placeholder="البحث في المحتوى..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full px-5 py-3.5 pr-12 text-sm rounded-xl border-2 transition-all duration-300 ${
                    darkMode 
                      ? 'bg-gray-900/50 border-gray-700 text-white placeholder-gray-400 hover:border-gray-600 focus:border-blue-500 focus:bg-gray-800/50' 
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 hover:border-gray-300 focus:border-blue-500'
                  } focus:outline-none focus:ring-4 focus:ring-blue-500/20`}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative group">
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`appearance-none flex-1 lg:flex-initial px-5 py-3.5 pr-10 text-sm rounded-xl border-2 font-medium transition-all duration-300 cursor-pointer ${
                    darkMode 
                      ? 'bg-gray-900/50 border-gray-700 text-white hover:border-gray-600 focus:border-blue-500' 
                      : 'bg-white border-gray-200 text-gray-900 hover:border-gray-300 focus:border-blue-500'
                  } focus:outline-none focus:ring-4 focus:ring-blue-500/20`}
                >
                  <option value="all">جميع التصنيفات</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name_ar}
                    </option>
                  ))}
                </select>
                <ChevronDown className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
              </div>
              
              <div className="relative group">
                <select 
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className={`appearance-none flex-1 lg:flex-initial px-5 py-3.5 pr-10 text-sm rounded-xl border-2 font-medium transition-all duration-300 cursor-pointer ${
                    darkMode 
                      ? 'bg-gray-900/50 border-gray-700 text-white hover:border-gray-600 focus:border-blue-500' 
                      : 'bg-white border-gray-200 text-gray-900 hover:border-gray-300 focus:border-blue-500'
                  } focus:outline-none focus:ring-4 focus:ring-blue-500/20`}
                >
                  <option value="all">جميع الحالات</option>
                  <option value="published">منشور</option>
                  <option value="draft">مسودة</option>
                  <option value="scheduled">مجدول</option>
                  <option value="pending">في الانتظار</option>
                </select>
                <ChevronDown className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
              </div>
              
              <button className={`group px-4 py-3.5 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                darkMode 
                  ? 'border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-600' 
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
              }`}>
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Loading State محسّن */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-blue-200 rounded-full animate-pulse"></div>
            <div className="w-24 h-24 border-4 border-transparent border-t-blue-600 rounded-full animate-spin absolute top-0 left-0"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Newspaper className="w-10 h-10 text-blue-600 animate-pulse" />
            </div>
          </div>
          <h3 className={`mt-6 text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            جارٍ تحميل المحتوى الإخباري
          </h3>
          <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            يتم جلب أحدث المقالات والأخبار...
          </p>
        </div>
      )}
      {/* Error State محسّن */}
      {error && (
        <div className={`relative overflow-hidden rounded-2xl shadow-lg border-2 p-8 mb-8 ${
          darkMode 
            ? 'bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-700' 
            : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
        }`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500 rounded-full blur-3xl opacity-10"></div>
          <div className="relative flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className={`text-xl font-bold mb-2 ${
                darkMode ? 'text-red-400' : 'text-red-800'
              }`}>
                حدث خطأ في تحميل البيانات
              </h3>
              <p className={`text-sm mb-4 ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
                {error}
              </p>
              <button 
                onClick={() => window.location.reload()} 
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  darkMode 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        </div>
      )}
      {/* جدول البيانات المحسّن بتصميم حديث */}
      {!loading && !error && (
        <div className={`relative rounded-2xl shadow-lg border overflow-hidden transition-all duration-300 ${
          darkMode ? 'bg-gray-800/95 border-gray-700/50' : 'bg-white/95 border-gray-200'
        }`}>
          {/* رأس الجدول */}
          <div className={`px-6 py-5 border-b backdrop-blur-sm ${
            darkMode ? 'bg-gray-900/50 border-gray-700/50' : 'bg-gray-50/80 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <Layers className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  قائمة المحتوى الإخباري
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium px-3 py-1 rounded-lg ${
                  darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}>
                  {newsData.filter(item => {
                    if (activeTab === 'deleted') return item.status === 'deleted';
                    if (item.status === 'deleted') return false;
                    if (activeTab === 'all') return true;
                    if (activeTab === 'breaking') return item.isBreaking;
                    if (activeTab === 'scheduled') return item.status === 'scheduled';
                    return item.status === activeTab;
                  }).length} مقال
                </span>
              </div>
            </div>
          </div>
          {/* رأس الجدول المحسّن بتصميم حديث */}
          <div className={`${
            darkMode 
              ? 'bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700' 
              : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100'
          }`}>
            <div className="grid grid-cols-12 gap-4 px-6 py-5">
              <div className={`col-span-3 text-sm font-semibold flex items-center gap-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <FileText className="w-4 h-4 opacity-50" />
                العنوان
              </div>
              <div className={`col-span-1 text-sm font-semibold flex items-center gap-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <Copy className="w-4 h-4 opacity-50" />
                التصنيف
              </div>
              <div className={`col-span-2 text-sm font-semibold flex items-center gap-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <Calendar className="w-4 h-4 opacity-50" />
                تاريخ النشر
              </div>
              <div className={`col-span-1 text-sm font-semibold flex items-center gap-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <Eye className="w-4 h-4 opacity-50" />
                المشاهدات
              </div>
              <div className={`col-span-1 text-sm font-semibold flex items-center gap-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <Zap className="w-4 h-4 opacity-50" />
                عاجل؟
              </div>
              <div className={`col-span-2 text-sm font-semibold flex items-center gap-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <Clock className="w-4 h-4 opacity-50" />
                آخر تعديل
              </div>
              <div className={`col-span-1 text-sm font-semibold ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                الحالة
              </div>
              <div className={`col-span-1 text-sm font-semibold ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                الإجراءات
              </div>
            </div>
          </div>
          {/* بيانات الجدول */}
          <div style={{ borderColor: darkMode ? '#374151' : '#f4f8fe' }} className="divide-y">
            {newsData
              .filter(item => {
                // فلترة حسب التاب النشط
                if (activeTab === 'deleted') return item.status === 'deleted';
                if (item.status === 'deleted') return false;
                if (activeTab === 'all') {
                  // لا تظهر المحذوفة في "الكل"
                } else if (activeTab === 'breaking') {
                  if (!item.isBreaking) return false;
                } else if (activeTab === 'scheduled') {
                  if (item.status !== 'scheduled') return false;
                } else {
                  if (item.status !== activeTab) return false;
                }
                
                // فلترة حسب البحث
                if (searchTerm) {
                  const searchLower = searchTerm.toLowerCase();
                  const titleMatch = item.title.toLowerCase().includes(searchLower);
                  const authorMatch = item.author_name?.toLowerCase().includes(searchLower);
                  const categoryMatch = item.category_name?.toLowerCase().includes(searchLower);
                  if (!titleMatch && !authorMatch && !categoryMatch) return false;
                }
                
                // فلترة حسب التصنيف
                if (selectedCategory !== 'all' && item.category.toString() !== selectedCategory) {
                  return false;
                }
                
                // فلترة حسب الحالة
                if (selectedStatus !== 'all' && item.status !== selectedStatus) {
                  return false;
                }
                
                return true;
              })
              .map((news, index) => (
                <div 
                  key={news.id} 
                  className={`group grid grid-cols-12 gap-4 px-6 py-5 transition-all duration-300 ${
                    darkMode 
                      ? 'hover:bg-gray-700/50 hover:shadow-md' 
                      : 'hover:bg-blue-50/30 hover:shadow-md'
                  } ${
                    news.isPinned ? 'border-r-4 border-blue-500 bg-gradient-to-r from-blue-500/5 to-transparent' : ''
                  } ${
                    news.createdAt && new Date(news.createdAt).getTime() > Date.now() - 86400000 ? 'border-l-4 border-green-500' : ''
                  } relative overflow-hidden`}
                  style={{ borderBottom: index < newsData.length - 1 ? (darkMode ? '1px solid #374151' : '1px solid #e5e7eb') : 'none' }}
                >
                  {/* العنوان */}
                  <div className="col-span-3">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {news.isPinned && (
                            <span className="text-blue-500" title="مثبت">
                              📌
                            </span>
                          )}
                          {news.isBreaking && (
                            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded animate-pulse">
                              عاجل
                            </span>
                          )}
                          {news.createdAt && new Date(news.createdAt).getTime() > Date.now() - 86400000 && (
                            <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-medium rounded">
                              جديد
                            </span>
                          )}
                        </div>
                        <Link 
                          href={`/dashboard/article/edit/${news.id}`}
                          className={`font-medium text-right leading-tight transition-colors duration-300 hover:underline ${
                            darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                          }`}
                        >
                          {news.title}
                        </Link>
                        <div className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <Users className="w-3 h-3 inline-block ml-1" />
                          {news.author_name}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* التصنيف */}
                  <div className="col-span-1">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 shadow-sm"
                      style={{ 
                        backgroundColor: news.category_color || '#6B7280',
                        color: getContrastColor(news.category_color || '#6B7280')
                      }}
                    >
                      {news.category_name || 'غير مصنف'}
                    </span>
                  </div>
                  {/* تاريخ النشر */}
                  <div className="col-span-2">
                    <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {news.status === 'scheduled' && news.publishAt ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
                            <Clock className="w-3 h-3" />
                            <span>مجدول للنشر</span>
                          </div>
                          <div className="text-xs">
                            {formatFullDate(news.publishAt) || '—'}
                          </div>
                        </div>
                      ) : news.status === 'published' ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-green-600 dark:text-green-400" />
                            <span className="font-medium text-green-600 dark:text-green-400">
                              {formatFullDate(news.publishAt || news.publishTime) || 'منشور'}
                            </span>
                          </div>
                          {news.publishAt && (
                            <div className="text-xs opacity-75">
                              {getRelativeTime(news.publishAt)}
                            </div>
                          )}
                        </div>
                      ) : news.status === 'draft' ? (
                        <span className="text-yellow-600 dark:text-yellow-400">مسودة</span>
                      ) : news.status === 'pending' ? (
                        <span className="text-blue-600 dark:text-blue-400">في الانتظار</span>
                      ) : (
                        <span className="text-gray-400">غير منشور</span>
                      )}
                    </div>
                  </div>
                  {/* المشاهدات */}
                  <div className="col-span-1">
                    <div className="flex items-center gap-1">
                      <Eye className={`w-4 h-4 ${
                        news.viewCount > 1000 ? 'text-green-500' : 
                        news.viewCount > 100 ? 'text-blue-500' : 
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <span className={`font-medium ${
                        news.viewCount > 1000 ? 'text-green-600 dark:text-green-400' : 
                        news.viewCount > 100 ? 'text-blue-600 dark:text-blue-400' : 
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {news.status === 'draft' ? '—' : 
                         news.viewCount >= 1000000 ? `${(news.viewCount / 1000000).toFixed(1)}M` :
                         news.viewCount >= 1000 ? `${(news.viewCount / 1000).toFixed(1)}K` :
                         news.viewCount.toLocaleString('ar-SA')}
                      </span>
                    </div>
                  </div>

                  {/* عمود الخبر العاجل - جديد */}
                  <div className="col-span-1">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => handleToggleBreaking(news.id, news.isBreaking)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                          news.isBreaking 
                            ? 'bg-red-600 shadow-lg shadow-red-500/25' 
                            : darkMode 
                              ? 'bg-gray-600' 
                              : 'bg-gray-200'
                        }`}
                        title={news.isBreaking ? 'إلغاء الخبر العاجل' : 'تفعيل كخبر عاجل'}
                      >
                        <span className="sr-only">
                          {news.isBreaking ? 'إلغاء الخبر العاجل' : 'تفعيل كخبر عاجل'}
                        </span>
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                            news.isBreaking ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        >
                          {news.isBreaking && (
                            <span className="flex items-center justify-center h-full w-full">
                              🔥
                            </span>
                          )}
                        </span>
                      </button>
                    </div>
                  </div>
                  {/* آخر تعديل */}
                  <div className={`col-span-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div>{news.lastModified}</div>
                    <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      <Edit className="w-3 h-3 inline-block ml-1" />
                      {news.lastModifiedBy}
                    </div>
                  </div>
                  {/* الحالة */}
                  <div className="col-span-1">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full inline-flex items-center gap-1 shadow-sm ${getStatusBadge(news.status).color}`}>
                      {getStatusBadge(news.status).text}
                    </span>
                  </div>
                  {/* الإجراءات */}
                  <div className="col-span-1">
                    <div className="flex items-center gap-1">
                      <button 
                        title="تعديل" 
                        onClick={() => router.push(`/dashboard/article/edit/${news.id}`)} 
                        className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${
                          darkMode ? 'text-indigo-400 hover:bg-indigo-900/20' : 'text-indigo-600 hover:bg-indigo-50'
                        }`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {activeTab === 'deleted' ? (
                        <button
                          title="استعادة"
                          onClick={() => handleRestore(news.id)}
                          className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${
                            darkMode ? 'text-green-400 hover:bg-green-900/20' : 'text-green-600 hover:bg-green-50'
                          }`}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                      ) : (
                        <button 
                          title="حذف" 
                          onClick={() => handleDelete(news.id)} 
                          className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${
                            darkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        title="نسخ الرابط" 
                        onClick={() => handleCopy(news.slug ?? news.id)} 
                        className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${
                          darkMode ? 'text-gray-400 hover:bg-gray-900/20' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            {newsData.filter(item => {
              if (activeTab === 'deleted') return item.status === 'deleted';
              if (item.status === 'deleted') return false;
              if (activeTab === 'all') return true;
              if (activeTab === 'breaking') return item.isBreaking;
              if (activeTab === 'scheduled') return item.status === 'scheduled';
              return item.status === activeTab;
            }).length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  لا يوجد محتوى في هذا القسم
                </p>
              </div>
            )}
          </div>
          {/* تذييل الجدول */}
          <div className={`border-t px-6 py-4 transition-colors duration-300 ${
            darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-gray-50'
          }`}>
            <div className="flex items-center justify-between">
              <div className={`text-sm font-medium transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  عرض {newsData.filter(item => {
                    if (activeTab === 'deleted') return item.status === 'deleted';
                    if (item.status === 'deleted') return false;
                    if (activeTab === 'all') return true;
                    if (activeTab === 'breaking') return item.isBreaking;
                    if (activeTab === 'scheduled') return item.status === 'scheduled';
                    return item.status === activeTab;
                  }).length} من {newsData.length} مقال
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  disabled
                  className={`px-4 py-2 text-sm rounded-lg transition-all duration-300 flex items-center gap-1 ${
                    darkMode 
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ChevronDown className="w-4 h-4 rotate-90" />
                  السابق
                </button>
                <div className="flex items-center gap-1">
                  <button className="px-3 py-1.5 text-sm rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium shadow-md">
                    1
                  </button>
                  <button className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-300 hover:shadow-md ${
                    darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}>
                    2
                  </button>
                  <button className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-300 hover:shadow-md ${
                    darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}>
                    3
                  </button>
                  <span className={`px-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>...</span>
                </div>
                <button className={`px-4 py-2 text-sm rounded-lg transition-all duration-300 flex items-center gap-1 hover:shadow-md ${
                  darkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}>
                  التالي
                  <ChevronDown className="w-4 h-4 -rotate-90" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </SimpleDashboardLayout>
  );
}