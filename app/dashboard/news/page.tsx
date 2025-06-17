'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronDown, 
  Search, 
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  MessageCircle,
  Copy,
  Eye,
  Calendar,
  Zap,
  Users, 
  Award,
  TrendingUp, 
  Activity,
  MessageSquare,
  AlertTriangle,
  ArrowUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

type NewsStatus = 'published' | 'draft' | 'pending' | 'deleted';
type NewsItem = {
  id: string;
  title: string;
  author: string;
  category: string | number;
  publishTime: string;
  viewCount: number;
  lastModified: string;
  lastModifiedBy: string;
  isPinned: boolean;
  isBreaking: boolean;
  status: NewsStatus;
  rating: number;
  slug?: string;
};

export default function NewsManagementPage() {
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  // استرجاع البيانات الحقيقية من API
  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/articles');
        if (!response.ok) {
          throw new Error('فشل في تحميل البيانات');
        }
        const data = await response.json();
        const mapped: NewsItem[] = (data.articles || []).map((a: any) => ({
          id: a.id,
          title: a.title,
          author: a.author_id || '—',
          category: a.category_id || '—',
          publishTime: a.published_at ? new Date(a.published_at).toLocaleString() : '-',
          viewCount: a.views_count || 0,
          lastModified: new Date(a.updated_at || a.created_at).toLocaleString(),
          lastModifiedBy: a.editor_id || a.author_id || '—',
          isPinned: a.is_pinned || false,
          isBreaking: a.is_breaking || false,
          status: a.status as NewsStatus,
          rating: 0,
          slug: a.slug
        }));
        setNewsData(mapped);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchNewsData();
  }, []);

  // استرجاع حالة الوضع الليلي من localStorage
  React.useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // دوال المساعدة للأزرار
  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف المقال؟')) return;
    try {
      await fetch('/api/articles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] })
      });
      setNewsData(prev => prev.map(n => n.id === id ? { ...n, status: 'deleted' as NewsStatus } : n));
      toast.success('تم نقل المقال إلى المحذوفات');
    } catch (e) {
      toast.error('فشل حذف المقال');
      console.error(e);
    }
  };

  const handleCopy = (slugOrId: string) => {
    navigator.clipboard.writeText(`https://sabq.org/articles/${slugOrId}`)
      .then(() => toast.success('تم نسخ الرابط'))
      .catch(() => toast.error('لم يتم نسخ الرابط'));
  };

  const handleRestore = async (id: string) => {
    try {
      await fetch(`/api/articles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'draft', is_deleted: false })
      });
      setNewsData(prev => prev.map(n => n.id === id ? { ...n, status: 'draft' as NewsStatus } : n));
      toast.success('تم استعادة المقال إلى المسودات');
    } catch (e) {
      toast.error('فشل استعادة المقال');
      console.error(e);
    }
  };

  const statusTabs = [
    { 
      id: 'all', 
      name: 'جميع الأخبار', 
      count: newsData.length,
      icon: <MessageSquare className="w-5 h-5" />
    },
    { 
      id: 'published', 
      name: 'منشور', 
      count: newsData.filter(item => item.status === 'published').length,
      icon: <Eye className="w-5 h-5" />
    },
    { 
      id: 'draft', 
      name: 'مسودة', 
      count: newsData.filter(item => item.status === 'draft').length,
      icon: <Edit className="w-5 h-5" />
    },
    { 
      id: 'breaking', 
      name: 'عاجل', 
      count: newsData.filter(item => item.isBreaking).length,
      icon: <Zap className="w-5 h-5" />
    },
    { 
      id: 'pending', 
      name: 'في الانتظار', 
      count: newsData.filter(item => item.status === 'pending').length,
      icon: <Calendar className="w-5 h-5" />
    },
    { 
      id: 'deleted', 
      name: 'المحذوفة', 
      count: newsData.filter(item => item.status === 'deleted').length,
      icon: <Trash2 className="w-5 h-5" />
    }
  ];

  const getStatusBadge = (status: NewsStatus) => {
    const statusConfig = {
      published: { color: 'bg-green-100 text-green-700', text: 'منشور' },
      draft: { color: 'bg-yellow-100 text-yellow-700', text: 'مسودة' },
      pending: { color: 'bg-blue-100 text-blue-700', text: 'في الانتظار' },
      deleted: { color: 'bg-gray-100 text-gray-700', text: 'محذوف' }
    };
    
    return statusConfig[status] || statusConfig.draft;
  };

  // مكون بطاقة الإحصائية الدائرية
  const CircularStatsCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    bgColor,
    iconColor,
    textColor = 'text-gray-700'
  }: {
    title: string;
    value: string;
    subtitle: string;
    icon: any;
    bgColor: string;
    iconColor: string;
    textColor?: string;
  }) => (
    <div className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 hover:shadow-md ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-100'
    }`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${bgColor} rounded-full flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div className="flex-1">
          <p className={`text-sm mb-1 transition-colors duration-300 ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>{title}</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>{value}</span>
            <span className={`text-sm transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>{subtitle}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`p-8 transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : ''
    }`}>
            {/* عنوان وتعريف الصفحة */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>إدارة الأخبار</h1>
          <p className={`transition-colors duration-300 ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>إدارة شاملة لمحتوى الأخبار والمقالات في صحيفة سبق - كتابة ونشر ومتابعة</p>
        </div>
        
        <Link 
          href="/dashboard/news/create"
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
        >
          <Edit className="w-5 h-5" />
          إنشاء مقال جديد
        </Link>
      </div>



      {/* Stats Cards */}
      <div className="grid grid-cols-6 gap-6 mb-8">
        <CircularStatsCard
          title="إجمالي الأخبار"
          value={newsData.length.toString()}
          subtitle="جميع المواضيع"
          icon={MessageSquare}
          bgColor="bg-cyan-100"
          iconColor="text-cyan-600"
        />
        <CircularStatsCard
          title="المنشورة"
          value={newsData.filter(item => item.status === 'published').length.toString()}
          subtitle="متاحة للقراء"
          icon={TrendingUp}
          bgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        <CircularStatsCard
          title="المسودات"
          value={newsData.filter(item => item.status === 'draft').length.toString()}
          subtitle="قيد التحرير"
          icon={Edit}
          bgColor="bg-orange-100"
          iconColor="text-orange-600"
        />
        <CircularStatsCard
          title="إجمالي المشاهدات"
          value={newsData.reduce((sum, item) => sum + item.viewCount, 0).toLocaleString()}
          subtitle="آخر 30 يوم"
          icon={Eye}
          bgColor="bg-red-100"
          iconColor="text-red-600"
        />
        <CircularStatsCard
          title="العاجل"
          value={newsData.filter(item => item.isBreaking).length.toString()}
          subtitle="أخبار عاجلة"
          icon={Zap}
          bgColor="bg-yellow-100"
          iconColor="text-yellow-600"
        />
        <CircularStatsCard
          title="في الانتظار"
          value={newsData.filter(item => item.status === 'pending').length.toString()}
          subtitle="تحت المراجعة"
          icon={Award}
          bgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
      </div>

        {/* Navigation Tabs */}
      <div className={`rounded-2xl p-2 shadow-sm border mb-8 w-full transition-colors duration-300 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        <div className="flex gap-2 justify-start pr-8">
          {statusTabs.map((tab) => {
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-48 flex flex-col items-center justify-center gap-2 py-4 pb-3 px-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-md border-b-4 border-blue-600'
                    : darkMode
                      ? 'text-gray-300 hover:bg-gray-700 border-b-4 border-transparent hover:border-gray-600'
                      : 'text-gray-600 hover:bg-gray-50 border-b-4 border-transparent hover:border-gray-200'
                }`}
              >
                {tab.icon}
                <div className="text-center">
                  <div>{tab.name}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="mr-3 text-gray-600">جارٍ تحميل البيانات...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">خطأ في تحميل البيانات</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Data Table */}
        {!loading && !error && (
      <div className={`rounded-2xl shadow-sm border overflow-hidden transition-colors duration-300 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}>

        {/* شريط البحث والفلاتر */}
        <div className={`px-6 py-4 border-b transition-colors duration-300 ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-96">
                <Search className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${
                  darkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  placeholder="البحث بالعنوان أو معرف المقال..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full px-4 py-2 pr-10 text-sm rounded-lg border transition-colors duration-300 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-blue-500 focus:bg-gray-600' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white'
                  } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-1 focus:ring-blue-500`}
              >
                <option value="all">جميع التصنيفات</option>
                <option value="tech">التكنولوجيا</option>
                <option value="economy">الاقتصاد</option>
                <option value="politics">السياسة</option>
                <option value="local">محليات</option>
                <option value="entertainment">ترفيه</option>
              </select>
              
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-1 focus:ring-blue-500`}
              >
                <option value="all">جميع الحالات</option>
                <option value="published">منشور</option>
                <option value="draft">مسودة</option>
                <option value="pending">في الانتظار</option>
              </select>
              
              <button className={`p-2 rounded-lg border transition-colors duration-300 ${
          darkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}>
                <Filter className="w-4 h-4" />
              </button>
            </div>
            </div>
          </div>
          
        {/* جدول البيانات */}
        <div className="overflow-x-auto">
          <table className="w-full">
          <thead className={`transition-colors duration-300 ${
            darkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <tr>
              <th className={`px-6 py-4 text-right text-sm font-medium transition-colors duration-300 ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`} style={{ width: '30%' }}>العنوان</th>
              <th className={`px-6 py-4 text-right text-sm font-medium transition-colors duration-300 ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>الكاتب</th>
              <th className={`px-6 py-4 text-right text-sm font-medium transition-colors duration-300 ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>التصنيف</th>
              <th className={`px-6 py-4 text-right text-sm font-medium transition-colors duration-300 ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>وقت النشر</th>
              <th className={`px-6 py-4 text-right text-sm font-medium transition-colors duration-300 ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>المشاهدات</th>
              <th className={`px-6 py-4 text-right text-sm font-medium transition-colors duration-300 ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>آخر تعديل</th>
              <th className={`px-6 py-4 text-right text-sm font-medium transition-colors duration-300 ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>الحالة</th>
              <th className={`px-6 py-4 text-right text-sm font-medium transition-colors duration-300 ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>العمليات</th>
            </tr>
          </thead>
                     <tbody>
            {newsData
              .filter(item => {
                if (activeTab === 'all') return true;
                if (activeTab === 'deleted') return item.status === 'deleted';
                if (activeTab === 'breaking') return item.isBreaking;
                return item.status === activeTab;
              })
              .map((news, index) => (
              <tr 
                key={news.id} 
                className={`transition-colors duration-200 hover:bg-gray-50 border-b ${
                  darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'
                } ${
                  news.isBreaking ? (darkMode ? 'bg-red-900/20' : 'bg-red-50') : 
                  news.isPinned ? (darkMode ? 'bg-blue-900/20' : 'bg-blue-50') : ''
                }`}
              >
                {/* العنوان */}
                <td className="px-6 py-4">
                  <div className="flex items-start">
                    <div className="flex-1">
                      <Link 
                        href={`/dashboard/news/${news.id}`}
                        className={`font-medium text-right leading-tight transition-colors duration-300 hover:underline ${
                          darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                        }`}
                      >
                        {news.title}
                      </Link>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className={`text-xs transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>#{news.id}</span>
                        {news.isPinned && (
                          <span className="badge badge-primary">مثبت</span>
                        )}
                        {news.isBreaking && (
                          <span className="badge badge-error">
                            <Zap className="w-3 h-3 mr-1" />
                            عاجل
                          </span>
                        )}
                </div>
              </div>
            </div>
                </td>

                {/* الكاتب */}
                <td className={`px-6 py-4 font-medium transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {news.author}
                </td>

                {/* التصنيف */}
                <td className="px-6 py-4">
                  <span className="badge badge-primary">
                    {news.category}
                  </span>
                </td>

                {/* وقت النشر */}
                <td className={`px-6 py-4 text-xs transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {news.publishTime || '-'}
                </td>

                {/* المشاهدات */}
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <Eye className={`w-4 h-4 ml-1 transition-colors duration-300 ${
                      darkMode ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                    <span className={`font-medium transition-colors duration-300 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {news.viewCount.toLocaleString()}
                    </span>
                </div>
                </td>

                {/* آخر تعديل */}
                <td className={`px-6 py-4 text-xs transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <div>{news.lastModified}</div>
                  <div className={`transition-colors duration-300 ${
                    darkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>بواسطة {news.lastModifiedBy}</div>
                </td>

                {/* الحالة */}
                <td className="px-6 py-4">
                  <span className={`badge ${getStatusBadge(news.status).color.includes('green') ? 'badge-success' : getStatusBadge(news.status).color.includes('yellow') ? 'badge-warning' : 'badge-primary'}`}>
                    {getStatusBadge(news.status).text}
                  </span>
                </td>

                {/* العمليات */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <button title="تعديل" onClick={() => router.push(`/dashboard/news/edit/${news.id}`)} className={`p-2 rounded-lg transition-colors duration-200 ${darkMode ? 'text-indigo-400 hover:bg-indigo-900/20' : 'text-indigo-600 hover:bg-indigo-50'}`}><Edit className="w-4 h-4" /></button>
                    {activeTab === 'deleted' ? (
                      <button
                        title="استعادة إلى المسودات"
                        onClick={() => handleRestore(news.id)}
                        className={`p-2 rounded-lg transition-colors duration-200 ${darkMode ? 'text-green-400 hover:bg-green-900/20' : 'text-green-600 hover:bg-green-50'}`}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                    ) : (
                      <button title="حذف" onClick={() => handleDelete(news.id)} className={`p-2 rounded-lg transition-colors duration-200 ${darkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'}`}> <Trash2 className="w-4 h-4" /></button>
                    )}
                    <button title="نسخ الرابط" onClick={() => handleCopy(news.slug ?? news.id)} className={`p-2 rounded-lg transition-colors duration-200 ${darkMode ? 'text-gray-400 hover:bg-gray-900/20' : 'text-gray-600 hover:bg-gray-50'}`}><Copy className="w-4 h-4" /></button>
                  </div>
                </td>
                            </tr>
            ))}
          </tbody>
        </table>
            </div>
            
        {/* تذييل الجدول */}
        <div className={`border-t px-6 py-4 transition-colors duration-300 ${
          darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div className={`text-sm font-medium transition-colors duration-300 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              عرض 1-5 من {newsData.length} خبر
            </div>
            <div className="flex items-center space-x-2">
              <button className={`px-3 py-1 text-sm rounded-lg border transition-colors duration-300 ${
                darkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}>
                السابق
              </button>
              <button className="px-3 py-1 text-sm rounded-lg bg-blue-500 text-white">
                1
              </button>
              <button className={`px-3 py-1 text-sm rounded-lg border transition-colors duration-300 ${
                darkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}>
                2
              </button>
              <button className={`px-3 py-1 text-sm rounded-lg border transition-colors duration-300 ${
              darkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}>
                التالي
              </button>
            </div>
          </div>
        </div>
      </div>
        )}
    </div>
  );
} 