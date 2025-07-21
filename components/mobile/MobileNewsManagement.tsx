'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { toast } from 'react-hot-toast';
import MobileDashboardLayout from '@/components/mobile/MobileDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, Trash2, Eye, Clock, Calendar, Zap, 
  TrendingUp, MessageSquare, MoreVertical,
  ChevronRight, AlertTriangle, CheckCircle,
  Loader2, RefreshCw, Plus
} from 'lucide-react';
import { formatRelativeDate } from '@/lib/date-utils';

interface NewsItem {
  id: string;
  title: string;
  excerpt?: string;
  author_name?: string;
  category_name?: string;
  category_color?: string;
  published_at?: string;
  viewCount?: number;
  status: 'published' | 'draft' | 'pending' | 'deleted' | 'scheduled';
  isBreaking?: boolean;
  isFeatured?: boolean;
  featured_image?: string;
}

type FilterTab = 'all' | 'published' | 'draft' | 'breaking' | 'pending' | 'deleted';

export default function MobileNewsManagement() {
  const router = useRouter();
  const { darkMode } = useDarkModeContext();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // الحصول على البيانات
  const fetchNews = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      else setRefreshing(true);
      
      const response = await fetch('/api/articles?limit=100&sortBy=updated_at&order=desc');
      if (response.ok) {
        const data = await response.json();
        setNews(data.articles || []);
      } else {
        throw new Error('فشل في جلب الأخبار');
      }
    } catch (error) {
      console.error('خطأ في جلب الأخبار:', error);
      toast.error('خطأ في جلب الأخبار');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // تصفية الأخبار
  useEffect(() => {
    let filtered = news;

    // تصفية حسب التاب
    if (activeTab !== 'all') {
      if (activeTab === 'breaking') {
        filtered = filtered.filter(item => item.isBreaking && item.status !== 'deleted');
      } else {
        filtered = filtered.filter(item => item.status === activeTab);
      }
    } else {
      filtered = filtered.filter(item => item.status !== 'deleted');
    }

    // تصفية حسب البحث
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredNews(filtered);
  }, [news, activeTab, searchQuery]);

  // تغيير حالة الخبر العاجل
  const toggleBreaking = async (id: string, isBreaking: boolean) => {
    try {
      const response = await fetch(`/api/articles/${id}/breaking`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBreaking: !isBreaking })
      });

      if (response.ok) {
        toast.success(isBreaking ? 'تم إلغاء الخبر العاجل' : 'تم تفعيل الخبر العاجل');
        fetchNews(false);
      } else {
        throw new Error('فشل في تحديث الحالة');
      }
    } catch (error) {
      console.error('خطأ في تحديث الحالة:', error);
      toast.error('فشل في تحديث الحالة');
    }
  };

  // حذف المقال
  const deleteNews = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المقال؟')) return;

    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('تم حذف المقال بنجاح');
        fetchNews(false);
      } else {
        throw new Error('فشل في الحذف');
      }
    } catch (error) {
      console.error('خطأ في الحذف:', error);
      toast.error('فشل في حذف المقال');
    }
  };

  const tabs = [
    { id: 'all', label: 'الكل', icon: null },
    { id: 'published', label: 'منشور', icon: <CheckCircle className="w-4 h-4" /> },
    { id: 'draft', label: 'مسودة', icon: <Edit className="w-4 h-4" /> },
    { id: 'breaking', label: 'عاجل', icon: <Zap className="w-4 h-4" /> },
    { id: 'pending', label: 'انتظار', icon: <Clock className="w-4 h-4" /> },
    { id: 'deleted', label: 'محذوف', icon: <Trash2 className="w-4 h-4" /> }
  ];

  // مكون بطاقة الخبر للموبايل
  const NewsCard = ({ item }: { item: NewsItem }) => (
    <Card className={`
      mb-4 transition-all duration-200 hover:shadow-md
      ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
    `}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* الصورة المصغرة */}
          {item.featured_image && (
            <div className="flex-shrink-0">
              <img
                src={item.featured_image}
                alt={item.title}
                className="w-16 h-16 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* المحتوى */}
          <div className="flex-1 min-w-0">
            {/* العنوان والحالة */}
            <div className="flex items-start justify-between mb-2">
              <h3 className={`
                font-semibold text-sm leading-tight line-clamp-2
                ${darkMode ? 'text-white' : 'text-gray-900'}
              `}>
                {item.title}
              </h3>
              
              <div className="flex items-center gap-1 ml-2">
                {item.isBreaking && (
                  <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5">
                    <Zap className="w-3 h-3 mr-1" />
                    عاجل
                  </Badge>
                )}
                
                <Badge 
                  variant={
                    item.status === 'published' ? 'default' :
                    item.status === 'draft' ? 'secondary' :
                    item.status === 'pending' ? 'outline' : 'destructive'
                  }
                  className="text-xs"
                >
                  {item.status === 'published' ? 'منشور' :
                   item.status === 'draft' ? 'مسودة' :
                   item.status === 'pending' ? 'انتظار' :
                   item.status === 'deleted' ? 'محذوف' : 'مجدول'}
                </Badge>
              </div>
            </div>

            {/* الملخص */}
            {item.excerpt && (
              <p className={`
                text-xs leading-relaxed line-clamp-2 mb-2
                ${darkMode ? 'text-gray-300' : 'text-gray-600'}
              `}>
                {item.excerpt}
              </p>
            )}

            {/* المعلومات السفلية */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* المؤلف والتصنيف */}
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {item.author_name && (
                    <span className="font-medium">{item.author_name}</span>
                  )}
                  {item.author_name && item.category_name && ' • '}
                  {item.category_name && (
                    <span
                      className="px-1.5 py-0.5 rounded text-white text-xs"
                      style={{ backgroundColor: item.category_color || '#6b7280' }}
                    >
                      {item.category_name}
                    </span>
                  )}
                </div>

                {/* الإحصائيات */}
                {item.viewCount !== undefined && (
                  <div className={`flex items-center gap-1 text-xs ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <Eye className="w-3 h-3" />
                    {item.viewCount}
                  </div>
                )}
              </div>

              {/* التاريخ */}
              {item.published_at && (
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {formatRelativeDate(item.published_at)}
                </span>
              )}
            </div>

            {/* أزرار العمليات */}
            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => router.push(`/dashboard/news/edit/${item.id}`)}
                className="flex-1 h-8 text-xs"
              >
                <Edit className="w-3 h-3 mr-1" />
                تحرير
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => router.push(`/articles/${item.id}`)}
                className="flex-1 h-8 text-xs"
              >
                <Eye className="w-3 h-3 mr-1" />
                عرض
              </Button>

              {item.status !== 'deleted' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleBreaking(item.id, item.isBreaking || false)}
                  className={`h-8 text-xs ${
                    item.isBreaking ? 'text-red-600' : 'text-gray-600'
                  }`}
                >
                  <Zap className="w-3 h-3" />
                </Button>
              )}

              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteNews(item.id)}
                className="h-8 text-xs text-red-600"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <MobileDashboardLayout title="إدارة الأخبار">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`
              h-32 rounded-lg animate-pulse
              ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}
            `} />
          ))}
        </div>
      </MobileDashboardLayout>
    );
  }

  return (
    <MobileDashboardLayout
      title="إدارة الأخبار"
      showSearch={true}
      showAdd={true}
      onAdd={() => router.push('/dashboard/news/unified')}
      onSearch={setSearchQuery}
    >
      <div className="space-y-4">
        {/* شريط الإحصائيات السريعة */}
        <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {news.filter(item => item.status === 'published').length}
                </div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  منشور
                </div>
              </div>
              
              <div className="text-center">
                <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {news.filter(item => item.status === 'draft').length}
                </div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  مسودة
                </div>
              </div>
              
              <div className="text-center">
                <div className={`text-lg font-bold text-red-600`}>
                  {news.filter(item => item.isBreaking && item.status !== 'deleted').length}
                </div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  عاجل
                </div>
              </div>
              
              <button
                onClick={() => fetchNews(false)}
                disabled={refreshing}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* تبويبات التصفية */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as FilterTab)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                whitespace-nowrap transition-colors
                ${activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {tab.icon}
              {tab.label}
              <Badge variant="secondary" className="text-xs">
                {tab.id === 'all' 
                  ? news.filter(item => item.status !== 'deleted').length
                  : tab.id === 'breaking'
                    ? news.filter(item => item.isBreaking && item.status !== 'deleted').length
                    : news.filter(item => item.status === tab.id).length
                }
              </Badge>
            </button>
          ))}
        </div>

        {/* قائمة الأخبار */}
        {filteredNews.length === 0 ? (
          <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardContent className="p-8 text-center">
              <AlertTriangle className={`w-12 h-12 mx-auto mb-4 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <h3 className={`text-lg font-semibold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                لا توجد أخبار
              </h3>
              <p className={`text-sm mb-4 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {searchQuery 
                  ? 'لم يتم العثور على نتائج للبحث'
                  : 'لا توجد أخبار في هذا التصنيف'
                }
              </p>
              
              <Button
                onClick={() => router.push('/dashboard/news/unified')}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                إنشاء خبر جديد
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-0">
            {filteredNews.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* مساحة إضافية للتنقل السفلي */}
        <div className="h-16"></div>
      </div>
    </MobileDashboardLayout>
  );
}
