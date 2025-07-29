'use client';

// استيراد التصميم المحسن الجديد
import NewsManagementPageEnhanced from './page-enhanced-ui';

export default NewsManagementPageEnhanced;
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  const [categories, setCategories] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  
  const darkModeContext = useDarkModeContext();
  const darkMode = darkModeContext?.darkMode || false;
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

  // إذا كان هناك خطأ في التحميل، اعرض رسالة خطأ بسيطة
  if (!darkModeContext && typeof window !== 'undefined') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-800 mb-2">جاري التحميل...</h1>
          <p className="text-gray-600">يتم تحميل صفحة إدارة الأخبار</p>
        </div>
      </div>
    );
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

  // استرجاع البيانات الحقيقية من API
  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 بدء جلب البيانات...');
        const startTime = Date.now();
        
        // جلب البيانات مع الترتيب من الأحدث
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
            category_name: a.categories?.name || a.category?.name || a.category_name || 'غير مصنف',
            category_color: a.categories?.color || a.category?.color || a.category_color || '#6B7280',
            publishTime: formatSafeDate(a.published_at) || formatSafeDate(a.created_at) || '—',
            publishAt: a.published_at || a.created_at,
            viewCount: a.views || a.views_count || 0,
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
            createdAt: a.created_at
          };
        });
        
        // ترتيب البيانات من الأحدث إلى الأقدم
        const sortedData = mapped.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
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
      case 'deleted':
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
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
      case 'deleted': return 'محذوف';
      default: return 'غير محدد';
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
        setNewsData(prev => prev.map(n => 
          n.id === articleId 
            ? { ...n, isBreaking: result.data.isBreakingNews }
            : result.data.isBreakingNews 
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

  // دالة الاستعادة
  const handleRestore = async (id: string) => {
    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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

  // دالة الحذف
  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف المقال؟')) return;
    try {
      const response = await fetch('/api/articles', {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ ids: [id] })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل حذف المقال');
      }

      const result = await response.json();
      
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

  // دالة نسخ الرابط
  const handleCopy = (slugOrId: string) => {
    navigator.clipboard.writeText(`https://sabq.org/articles/${slugOrId}`)
      .then(() => toast.success('تم نسخ الرابط'))
      .catch(() => toast.error('لم يتم نسخ الرابط'));
  };

  // تحديث حالة الخبر
  const handleStatusUpdate = async (id: string, status: NewsStatus) => {
    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل في تحديث الحالة');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setNewsData(prev => prev.map(n => n.id === id ? { ...n, status } : n));
        toast.success('تم تحديث حالة المقال');
      } else {
        throw new Error(result.error || 'فشل في تحديث الحالة');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'فشل في تحديث الحالة');
      console.error('خطأ في تحديث الحالة:', e);
    }
  };

  // تعريف تبويبات الحالة
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

  // حساب الإحصائيات
  const stats = {
    total: newsData.filter(item => item.status !== 'deleted').length,
    published: newsData.filter(n => n.status === 'published').length,
    draft: newsData.filter(n => n.status === 'draft').length,
    pending: newsData.filter(n => n.status === 'pending').length,
    scheduled: newsData.filter(n => n.status === 'scheduled').length,
    totalViews: newsData.reduce((acc, n) => acc + n.viewCount, 0),
    avgRating: newsData.length > 0 
      ? Math.round(newsData.reduce((acc, n) => acc + n.rating, 0) / newsData.length * 10) / 10
      : 0,
    breaking: newsData.filter(n => n.isBreaking && n.status !== 'deleted').length,
    pinned: newsData.filter(n => n.isPinned).length,
    thisWeek: newsData.filter(n => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return new Date(n.createdAt || n.publishTime) > oneWeekAgo;
    }).length,
    topPerforming: newsData.filter(n => n.viewCount > 1000).length,
    recentlyUpdated: newsData.filter(n => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      return new Date(n.lastModified) > threeDaysAgo;
    }).length
  };

  // تصفية البيانات بناءً على التبويب النشط
  const filteredData = newsData.filter(item => {
    // تصفية بناءً على التبويب النشط
    if (activeTab === 'all') return item.status !== 'deleted';
    if (activeTab === 'breaking') return item.isBreaking && item.status !== 'deleted';
    return item.status === activeTab;
  }).filter(item => {
    // تصفية بناءً على البحث
    const searchInTitle = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const searchInAuthor = item.author_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const searchInCategory = item.category_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return searchTerm === '' || searchInTitle || searchInAuthor || searchInCategory;
  }).filter(item => {
    // تصفية بناءً على التصنيف
    return selectedCategory === 'all' || item.category_name === selectedCategory;
  });

  return (
    <TooltipProvider>
      <DashboardLayout 
        pageTitle="إدارة الأخبار المتقدمة"
        pageDescription="منصة متكاملة لإدارة ونشر المحتوى الإخباري مع أدوات تحليل الأداء وتتبع التفاعل"
      >
        <div className={`transition-colors duration-300 ${
          darkMode ? 'bg-gray-900' : ''
        }`}>
          {/* بطاقات الإحصائيات المحسنة */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <StatsCard
              title="إجمالي الأخبار"
              value={stats.total}
              subtitle="مقال"
              icon={FileText}
              bgColor="bg-blue-100 dark:bg-blue-900/20"
              iconColor="text-blue-600 dark:text-blue-400"
              trend="up"
              trendValue="+12% هذا الأسبوع"
            />
            <StatsCard
              title="المنشورة"
              value={stats.published}
              subtitle="نشطة"
              icon={Eye}
              bgColor="bg-green-100 dark:bg-green-900/20"
              iconColor="text-green-600 dark:text-green-400"
              trend="up"
              trendValue="+8% اليوم"
            />
            <StatsCard
              title="المسودات"
              value={stats.draft}
              subtitle="قيد التحرير"
              icon={Edit}
              bgColor="bg-yellow-100 dark:bg-yellow-900/20"
              iconColor="text-yellow-600 dark:text-yellow-400"
              trend="down"
              trendValue="-3% هذا الأسبوع"
            />
            <StatsCard
              title="إجمالي المشاهدات"
              value={stats.totalViews.toLocaleString()}
              subtitle="مشاهدة"
              icon={TrendingUp}
              bgColor="bg-purple-100 dark:bg-purple-900/20"
              iconColor="text-purple-600 dark:text-purple-400"
              trend="up"
              trendValue="+24% هذا الشهر"
            />
          </div>

          {/* شريط الأدوات العلوي */}
          <div className={`rounded-2xl p-4 sm:p-6 mb-6 shadow-sm border transition-all duration-300 ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center`}>
                  <Newspaper className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className={`text-lg font-semibold transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    إدارة المحتوى الإخباري
                  </h2>
                  <p className={`text-sm transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {filteredData.length} من {stats.total} مقال
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  تحديث
                </Button>
                
                <Link href="/admin/news/create-new">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    مقال جديد
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* تبويبات الحالة */}
          <div className={`rounded-2xl mb-6 shadow-sm border transition-all duration-300 ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-2">
                {statusTabs.map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : darkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.name}</span>
                    <Badge variant="secondary" className="ml-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      {tab.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>

            {/* شريط البحث والتصفية */}
            <div className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="البحث في الأخبار..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      تصفية
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="p-2">
                      <label className="text-sm font-medium">التصنيف</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full mt-1 px-2 py-1 border rounded text-sm"
                      >
                        <option value="all">جميع التصنيفات</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* جدول الأخبار */}
          <div className={`rounded-2xl shadow-sm border transition-all duration-300 overflow-hidden ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    جاري تحميل البيانات...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-500" />
                  <p className="text-red-600 font-medium">{error}</p>
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                  >
                    إعادة المحاولة
                  </Button>
                </div>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <FileText className="w-8 h-8 mx-auto mb-4 text-gray-400" />
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    لا توجد أخبار في هذا التصنيف
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <tr>
                      <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                        darkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        العنوان
                      </th>
                      <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                        darkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        الكاتب
                      </th>
                      <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                        darkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        التصنيف
                      </th>
                      <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                        darkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        الحالة
                      </th>
                      <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                        darkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        المشاهدات
                      </th>
                      <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                        darkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        التاريخ
                      </th>
                      <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                        darkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {filteredData.map((news) => (
                      <tr 
                        key={news.id}
                        className={`transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-700`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className={`font-medium text-sm ${
                                  darkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {news.title}
                                </h3>
                                {news.isBreaking && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <div className="flex items-center">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleToggleBreaking(news.id, news.isBreaking)}
                                          className="h-6 px-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-full"
                                        >
                                          <Zap className="w-3 h-3 ml-1" />
                                          عاجل
                                        </Button>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>انقر لإلغاء الخبر العاجل</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                                {news.isPinned && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Star className="w-3 h-3 ml-1" />
                                    مثبت
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Link 
                                  href={`/admin/news/edit/${news.id}`}
                                  className={`text-xs hover:underline ${
                                    darkMode ? 'text-blue-400' : 'text-blue-600'
                                  }`}
                                >
                                  تحرير
                                </Link>
                                {news.slug && (
                                  <Link 
                                    href={`/articles/${news.slug}`}
                                    target="_blank"
                                    className={`text-xs hover:underline flex items-center gap-1 ${
                                      darkMode ? 'text-green-400' : 'text-green-600'
                                    }`}
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    معاينة
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            <p className={`font-medium ${
                              darkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {news.author_name}
                            </p>
                            <p className={`text-xs ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {getRelativeTime(news.publishTime)}
                            </p>
                          </div>
                        </td>
                        
                        <td className="px-4 py-3">
                          <Badge 
                            style={{
                              backgroundColor: news.category_color + '20',
                              color: getContrastColor(news.category_color || '#6B7280'),
                              borderColor: news.category_color + '40'
                            }}
                            className="text-xs border"
                          >
                            {news.category_name}
                          </Badge>
                        </td>
                        
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs ${getStatusColor(news.status)}`}>
                              {getStatusText(news.status)}
                            </Badge>
                            {!news.isBreaking && news.status === 'published' && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleToggleBreaking(news.id, news.isBreaking)}
                                    className="h-6 px-2 text-gray-500 hover:text-red-600 hover:bg-red-50"
                                  >
                                    <Zap className="w-3 h-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>تحويل إلى خبر عاجل</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4 text-gray-400" />
                            <span className={`text-sm ${
                              darkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              {news.viewCount.toLocaleString()}
                            </span>
                          </div>
                        </td>
                        
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            <p className={`${
                              darkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              {news.publishTime}
                            </p>
                            <p className={`text-xs ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              آخر تحديث: {getRelativeTime(news.lastModified)}
                            </p>
                          </div>
                        </td>
                        
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => router.push(`/admin/news/edit/${news.id}`)}>
                                  <Edit className="w-4 h-4 ml-2" />
                                  تحرير
                                </DropdownMenuItem>
                                
                                {news.slug && (
                                  <DropdownMenuItem onClick={() => handleCopy(news.slug!)}>
                                    <Copy className="w-4 h-4 ml-2" />
                                    نسخ الرابط
                                  </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuSeparator />
                                
                                {news.status !== 'published' && (
                                  <DropdownMenuItem onClick={() => handleStatusUpdate(news.id, 'published')}>
                                    <Send className="w-4 h-4 ml-2" />
                                    نشر
                                  </DropdownMenuItem>
                                )}
                                
                                {news.status !== 'draft' && (
                                  <DropdownMenuItem onClick={() => handleStatusUpdate(news.id, 'draft')}>
                                    <Archive className="w-4 h-4 ml-2" />
                                    نقل إلى المسودات
                                  </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuSeparator />
                                
                                {news.status === 'deleted' ? (
                                  <DropdownMenuItem onClick={() => handleRestore(news.id)}>
                                    <RefreshCw className="w-4 h-4 ml-2" />
                                    استعادة
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem 
                                    onClick={() => handleDelete(news.id)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 ml-2" />
                                    حذف
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </TooltipProvider>
  );
}