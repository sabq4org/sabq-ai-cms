'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import MobileNewsManagement from '@/components/mobile/MobileNewsManagement';
import NewsBarTest from '@/components/NewsBarTest';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  HelpCircle,
  Bell,
  User
} from 'lucide-react';

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

type Category = {
  id: string;
  name: string;
  slug: string;
  color?: string;
};

export default function NewsManagementPageEnhanced() {
  const { darkMode } = useDarkModeContext();
  const router = useRouter();
  
  // الحالات الأساسية
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isMobile, setIsMobile] = useState(false);

  // تحديد حجم الشاشة
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // دالة لتحويل الوقت النسبي
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'الآن';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} دقيقة`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ساعة`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} يوم`;
    
    return date.toLocaleDateString('ar-SA');
  };

  // استرجاع البيانات الحقيقية من API
  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 بدء جلب البيانات...');
        const startTime = Date.now();
        
        // جلب البيانات مع الترتيب من الأحدث
        const response = await fetch('/api/articles?status=all&limit=100&sort=created_at&order=desc', {
          cache: 'no-store', // تجنب التخزين المؤقت
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error('فشل في تحميل البيانات');
        }
        
        const result = await response.json();
        console.log('📦 البيانات المستلمة:', result);
        
        if (!result.success || !Array.isArray(result.articles)) {
          throw new Error('تنسيق البيانات غير صحيح');
        }
        
        // تحويل البيانات للتنسيق المطلوب
        const mapped: NewsItem[] = result.articles.map((a: any) => {
          const status: NewsStatus = a.status === 'published' ? 'published' :
                                   a.status === 'draft' ? 'draft' :
                                   a.status === 'pending' ? 'pending' :
                                   a.status === 'scheduled' ? 'scheduled' : 'draft';
          
          return {
            id: a.id || '',
            title: a.title || 'بدون عنوان',
            author: a.author_id || '',
            author_name: a.author?.name || a.author_name || 'غير محدد',
            category: a.category_id || '',
            category_name: a.categories?.name || a.category_name || 'عام',
            category_color: a.categories?.color || a.category_color || '#3B82F6',
            publishTime: a.published_at || a.created_at || new Date().toISOString(),
            publishAt: a.published_at,
            viewCount: a.views || 0,
            lastModified: a.updated_at || a.created_at || new Date().toISOString(),
            lastModifiedBy: a.author?.name || 'النظام',
            isPinned: a.is_pinned || false,
            isBreaking: a.is_breaking || false,
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
        
        // إظهار إشعار نجاح
        toast.success(`تم تحديث ${sortedData.length} مقال بنجاح`);
        
      } catch (err) {
        console.error('❌ خطأ في جلب البيانات:', err);
        setError(err instanceof Error ? err.message : 'حدث خطأ في تحميل البيانات');
        toast.error('فشل في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };
    fetchNewsData();
  }, []); // إزالة dependency لجعل التحديث يدوي

  // جلب التصنيفات
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.categories)) {
            setCategories(data.categories);
          }
        }
      } catch (error) {
        console.error('خطأ في جلب التصنيفات:', error);
      }
    };
    
    fetchCategories();
  }, []);

  if (isMobile) {
    return <MobileNewsManagement />;
  }

  // دوال المساعدة للأزرار
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'deleted' })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل في حذف المقال');
      }

      const result = await response.json();
      if (result.success) {
        setNewsData(prev => prev.map(n => n.id === id ? { ...n, status: 'deleted' as NewsStatus } : n));
        toast.success('تم حذف المقال');
      } else {
        throw new Error(result.error || 'فشل في حذف المقال');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'فشل في حذف المقال');
      console.error('خطأ في حذف المقال:', e);
    }
  };

  const handleToggleBreaking = async (articleId: string, currentBreakingStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/toggle-breaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ articleId })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`فشل HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      if (result.success) {
        setNewsData(prev => prev.map(n => 
          n.id === articleId ? { ...n, isBreaking: !currentBreakingStatus } : n
        ));
        
        toast.success(currentBreakingStatus ? 'تم إلغاء الخبر العاجل' : 'تم تفعيل الخبر العاجل');
      } else {
        throw new Error(result.error || 'فشل تحديث حالة الخبر العاجل');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'فشل تحديث حالة الخبر العاجل');
      console.error('خطأ في تحديث حالة الخبر العاجل:', e);
    }
  };

  const handleCopy = (slugOrId: string) => {
    navigator.clipboard.writeText(`https://sabq.org/articles/${slugOrId}`)
      .then(() => toast.success('تم نسخ الرابط'))
      .catch(() => toast.error('لم يتم نسخ الرابط'));
  };

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
        
        const statusText = {
          published: 'نشر',
          draft: 'نقل إلى المسودات',
          pending: 'وضع في الانتظار',
          scheduled: 'جدولة',
          deleted: 'حذف'
        };
        
        toast.success(`تم ${statusText[status]} المقال`);
      } else {
        throw new Error(result.error || 'فشل في تحديث الحالة');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'فشل في تحديث الحالة');
      console.error('خطأ في تحديث الحالة:', e);
    }
  };

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
    return searchInTitle || searchInAuthor || searchInCategory;
  }).filter(item => {
    // تصفية بناءً على التصنيف
    if (selectedCategory === 'all') return true;
    return item.category_name === selectedCategory;
  });

  // التبويبات مع الأيقونات والعدادات
  const tabs = [
    { id: 'all', label: 'الكل', count: stats.total, icon: FileText, color: 'text-blue-600' },
    { id: 'published', label: 'منشور', count: stats.published, icon: CheckCircle, color: 'text-green-600' },
    { id: 'draft', label: 'مسودة', count: stats.draft, icon: Edit, color: 'text-yellow-600' },
    { id: 'pending', label: 'انتظار', count: stats.pending, icon: Clock, color: 'text-blue-600' },
    { id: 'scheduled', label: 'مجدول', count: stats.scheduled, icon: Calendar, color: 'text-purple-600' },
    { id: 'breaking', label: 'عاجل', count: stats.breaking, icon: Zap, color: 'text-red-600' },
  ];

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* عنوان القسم وأزرار الإجراءات */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              إدارة الأخبار المتقدمة
            </h1>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              إدارة وتحرير المحتوى الإعلامي بكفاءة عالية
            </p>
          </div>
          
          <Link href="/dashboard/news/unified">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 ml-2" />
              مقال جديد
            </Button>
          </Link>
        </div>

        {/* المحتوى الرئيسي */}
        <div className="space-y-6">
          {/* مكون اختبار الشريط الإخباري */}
          <NewsBarTest />

          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <div className={`rounded-xl p-4 border ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>إجمالي</p>
                  <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats.total}
                  </p>
                </div>
              </div>
            </div>

            <div className={`rounded-xl p-4 border ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>منشور</p>
                  <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats.published}
                  </p>
                </div>
              </div>
            </div>

            <div className={`rounded-xl p-4 border ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>عاجل</p>
                  <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats.breaking}
                  </p>
                </div>
              </div>
            </div>

            <div className={`rounded-xl p-4 border ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>مشاهدات</p>
                  <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats.totalViews.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className={`rounded-xl p-4 border ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Edit className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>مسودات</p>
                  <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats.draft}
                  </p>
                </div>
              </div>
            </div>

            <div className={`rounded-xl p-4 border ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>هذا الأسبوع</p>
                  <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats.thisWeek}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* تبويبات الحالة */}
          <div className={`rounded-xl border mb-6 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                        isActive
                          ? `${tab.color} bg-opacity-10`
                          : darkMode 
                            ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        isActive
                          ? 'bg-current bg-opacity-20'
                          : darkMode
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-gray-200 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* أدوات البحث والتصفية */}
          <div className={`rounded-xl border p-4 mb-6 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="البحث في العناوين والكتاب والتصنيفات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      التصنيف
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="p-2">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm"
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

                <Button
                  onClick={() => {
                    // إعادة تحميل البيانات يدوياً
                    setLoading(true);
                    window.location.reload();
                  }}
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  تحديث فوري
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                عرض {filteredData.length} من {stats.total} مقال
              </p>
            </div>
          </div>

          {/* جدول الأخبار المحسن */}
          <div className={`rounded-xl border overflow-hidden ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
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
                      <th className={`px-6 py-4 text-right text-xs font-medium uppercase tracking-wider ${
                        darkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        العنوان والكاتب
                      </th>
                      <th className={`px-6 py-4 text-right text-xs font-medium uppercase tracking-wider ${
                        darkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        التصنيف والحالة
                      </th>
                      <th className={`px-6 py-4 text-right text-xs font-medium uppercase tracking-wider ${
                        darkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        الإحصائيات
                      </th>
                      <th className={`px-6 py-4 text-right text-xs font-medium uppercase tracking-wider ${
                        darkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        التاريخ
                      </th>
                      <th className={`px-6 py-4 text-right text-xs font-medium uppercase tracking-wider ${
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
                        {/* العنوان والكاتب */}
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start gap-2 mb-2">
                                <h3 className={`font-medium text-sm leading-tight ${
                                  darkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {news.title}
                                </h3>
                                {news.isBreaking && (
                                  <Badge className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full">
                                    <Zap className="w-3 h-3 ml-1" />
                                    عاجل
                                  </Badge>
                                )}
                                {news.isPinned && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Star className="w-3 h-3 ml-1" />
                                    مثبت
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`text-sm font-medium ${
                                  darkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                  {news.author_name}
                                </div>
                                <div className={`text-xs ${
                                  darkMode ? 'text-gray-500' : 'text-gray-500'
                                }`}>
                                  •
                                </div>
                                <div className={`text-xs ${
                                  darkMode ? 'text-gray-500' : 'text-gray-500'
                                }`}>
                                  {getRelativeTime(news.publishTime)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        {/* التصنيف والحالة */}
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <Badge 
                              style={{
                                backgroundColor: news.category_color + '20',
                                color: news.category_color,
                                borderColor: news.category_color + '40'
                              }}
                              className="border text-xs"
                            >
                              {news.category_name}
                            </Badge>
                            <div>
                              <Badge className={`${getStatusBadge(news.status).color} text-xs`}>
                                {getStatusBadge(news.status).text}
                              </Badge>
                            </div>
                          </div>
                        </td>
                        
                        {/* الإحصائيات */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4 text-gray-400" />
                              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                {news.viewCount.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </td>
                        
                        {/* التاريخ */}
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {new Date(news.publishTime).toLocaleDateString('ar-SA')}
                            </p>
                            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                              {new Date(news.publishTime).toLocaleTimeString('ar-SA', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </td>
                        
                        {/* الإجراءات المدمجة في صف واحد */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            {/* تحرير */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => router.push(`/dashboard/news/edit/${news.id}`)}
                                  className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>تحرير</p>
                              </TooltipContent>
                            </Tooltip>

                            {/* معاينة */}
                            {news.slug && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(`/article/${news.slug}`, '_blank')}
                                    className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>معاينة</p>
                                </TooltipContent>
                              </Tooltip>
                            )}

                            {/* نسخ الرابط */}
                            {news.slug && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopy(news.slug!)}
                                    className="h-8 w-8 p-0 hover:bg-gray-100 hover:text-gray-600"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>نسخ الرابط</p>
                                </TooltipContent>
                              </Tooltip>
                            )}

                            {/* عاجل */}
                            {!news.isBreaking && news.status === 'published' && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleToggleBreaking(news.id, news.isBreaking)}
                                    className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                                  >
                                    <Zap className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>جعل عاجل</p>
                                </TooltipContent>
                              </Tooltip>
                            )}

                            {/* إلغاء عاجل */}
                            {news.isBreaking && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleToggleBreaking(news.id, news.isBreaking)}
                                    className="h-8 w-8 p-0 hover:bg-orange-100 hover:text-orange-600"
                                  >
                                    <Zap className="h-4 w-4 text-red-600" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>إلغاء عاجل</p>
                                </TooltipContent>
                              </Tooltip>
                            )}

                            {/* أرشفة */}
                            {news.status !== 'draft' && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleStatusUpdate(news.id, 'draft')}
                                    className="h-8 w-8 p-0 hover:bg-yellow-100 hover:text-yellow-600"
                                  >
                                    <Archive className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>أرشفة</p>
                                </TooltipContent>
                              </Tooltip>
                            )}

                            {/* حذف */}
                            {news.status !== 'deleted' && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(news.id)}
                                    className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>حذف</p>
                                </TooltipContent>
                              </Tooltip>
                            )}

                            {/* المزيد */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                {news.status !== 'published' && (
                                  <DropdownMenuItem onClick={() => handleStatusUpdate(news.id, 'published')}>
                                    <Send className="w-4 h-4 ml-2" />
                                    نشر
                                  </DropdownMenuItem>
                                )}
                                
                                {news.status === 'deleted' ? (
                                  <DropdownMenuItem onClick={() => handleRestore(news.id)}>
                                    <RefreshCw className="w-4 h-4 ml-2" />
                                    استعادة
                                  </DropdownMenuItem>
                                ) : null}
                                
                                <DropdownMenuSeparator />
                                
                                <DropdownMenuItem>
                                  <Share2 className="w-4 h-4 ml-2" />
                                  مشاركة
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem>
                                  <Download className="w-4 h-4 ml-2" />
                                  تصدير
                                </DropdownMenuItem>
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
      </div>
    </TooltipProvider>
  );
}
