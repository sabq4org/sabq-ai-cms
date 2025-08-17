'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { toast } from 'react-hot-toast';
import MobileDashboardLayout from '@/components/mobile/MobileDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { getArticleLink } from '@/lib/utils';
import { 
  FileText, Edit, Trash2, Eye, Clock, Calendar, 
  TrendingUp, MessageSquare, MoreVertical, Image,
  ChevronRight, AlertTriangle, CheckCircle,
  Loader2, RefreshCw, Plus, Search, Filter,
  BarChart3, Target, Users, Award, Star,
  BookOpen, Tag, ExternalLink, Share2, Archive
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  featured_image?: string;
  category?: {
    id: string;
    name: string;
    color?: string;
  };
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
  tags?: string[];
  reading_time?: number;
  views?: number;
  likes?: number;
  comments?: number;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  published_at?: string;
}

// مكون بطاقة المقال المحسنة
const ArticleCard = ({ 
  article, 
  onEdit, 
  onDelete, 
  onView 
}: { 
  article: Article;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}) => {
  const { darkMode } = useDarkModeContext();
  const [imageError, setImageError] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500';
      case 'draft': return 'bg-yellow-500';
      case 'archived': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'منشور';
      case 'draft': return 'مسودة';
      case 'archived': return 'مؤرشف';
      default: return status;
    }
  };

  const formatNumber = (num?: number) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}م`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}ك`;
    return num.toString();
  };

  return (
    <Card className={`
      mb-4 transition-all duration-200 hover:shadow-md
      ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
    `}>
      <CardContent className="p-4">
        {/* الصورة والمعلومات الأساسية */}
        <div className="flex gap-3 mb-3">
          {/* الصورة المميزة */}
          <div className="flex-shrink-0">
            {article.featured_image && !imageError ? (
              <img
                src={article.featured_image}
                alt={article.title}
                className="w-16 h-16 rounded-lg object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className={`
                w-16 h-16 rounded-lg flex items-center justify-center
                ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}
              `}>
                <Image className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>

          {/* المحتوى */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className={`
                font-semibold text-sm leading-tight line-clamp-2
                ${darkMode ? 'text-white' : 'text-gray-900'}
              `}>
                {String(article.title || '')}
              </h3>
              
              <Badge 
                className={`${getStatusColor(article.status)} text-white text-xs px-2 py-1 ml-2`}
              >
                {getStatusText(article.status)}
              </Badge>
            </div>

            {/* التصنيف والكاتب */}
            <div className="flex items-center gap-2 mb-2">
              {article.category && (
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    article.category.color ? '' : 'border-gray-400 text-gray-600'
                  }`}
                >
                  {article.category.name}
                </Badge>
              )}
              
              {article.author && (
                <span className={`text-xs ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  بواسطة {article.author.name}
                </span>
              )}
            </div>

            {/* الملخص */}
            <p className={`
              text-xs leading-relaxed line-clamp-2 mb-2
              ${darkMode ? 'text-gray-300' : 'text-gray-600'}
            `}>
              {article.excerpt}
            </p>
          </div>
        </div>

        {/* العلامات */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {article.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className={`text-xs px-2 py-1 rounded-full ${
                  darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}
              >
                #{tag}
              </span>
            ))}
            {article.tags.length > 3 && (
              <span className={`text-xs ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                +{article.tags.length - 3} أخرى
              </span>
            )}
          </div>
        )}

        {/* إحصائيات المقال */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3 text-gray-400" />
              <span className={`text-xs ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {formatNumber(article.views)}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-gray-400" />
              <span className={`text-xs ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {formatNumber(article.comments)}
              </span>
            </div>
            
            {article.reading_time && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className={`text-xs ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {article.reading_time} دقيقة
                </span>
              </div>
            )}
          </div>

          {/* التاريخ */}
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {new Date(article.created_at).toLocaleDateString('ar-SA')}
          </div>
        </div>

        {/* أزرار العمليات */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(article.id)}
            className="flex-1 h-8 text-xs"
          >
            <Edit className="w-3 h-3 mr-1" />
            تحرير
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onView(article.id)}
            className="flex-1 h-8 text-xs"
          >
            <Eye className="w-3 h-3 mr-1" />
            عرض
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => window.open(getArticleLink(article), '_blank')}
            className="flex-1 h-8 text-xs"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            معاينة
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(article.id)}
            className="h-8 text-xs text-red-600"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function MobileArticleManagement() {
  const router = useRouter();
  const { darkMode } = useDarkModeContext();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // جلب المقالات
  const fetchArticles = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      else setRefreshing(true);
      
      const response = await fetch('/api/articles');
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles || []);
      } else {
        throw new Error('فشل في جلب المقالات');
      }
    } catch (error) {
      console.error('خطأ في جلب المقالات:', error);
      toast.error('خطأ في جلب المقالات');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // تصفية المقالات
  useEffect(() => {
    let filtered = articles;

    // تصفية حسب الحالة
    if (activeFilter !== 'all') {
      filtered = filtered.filter(article => article.status === activeFilter);
    }

    // تصفية حسب البحث
    if (searchQuery) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.category?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.author?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredArticles(filtered);
  }, [articles, activeFilter, searchQuery]);

  // حذف المقال
  const handleDeleteArticle = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المقال؟')) return;

    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('تم حذف المقال بنجاح');
        fetchArticles(false);
      } else {
        throw new Error('فشل في الحذف');
      }
    } catch (error) {
      console.error('خطأ في الحذف:', error);
      toast.error('فشل في حذف المقال');
    }
  };

  const filters = [
    { id: 'all', label: 'الكل', icon: <FileText className="w-4 h-4" /> },
    { id: 'published', label: 'منشور', icon: <CheckCircle className="w-4 h-4" /> },
    { id: 'draft', label: 'مسودة', icon: <Edit className="w-4 h-4" /> },
    { id: 'archived', label: 'مؤرشف', icon: <Archive className="w-4 h-4" /> }
  ];

  if (loading) {
    return (
      <MobileDashboardLayout title="إدارة المقالات">
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`
              h-40 rounded-lg animate-pulse
              ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}
            `} />
          ))}
        </div>
      </MobileDashboardLayout>
    );
  }

  return (
    <MobileDashboardLayout
      title="إدارة المقالات"
      showSearch={true}
      showAdd={true}
      onAdd={() => router.push('/dashboard/article/create')}
      onSearch={setSearchQuery}
    >
      <div className="space-y-4">
        {/* شريط الإحصائيات */}
        <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {articles.length}
                </div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  إجمالي
                </div>
              </div>
              
              <div className="text-center">
                <div className={`text-lg font-bold text-green-600`}>
                  {articles.filter(a => a.status === 'published').length}
                </div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  منشور
                </div>
              </div>
              
              <div className="text-center">
                <div className={`text-lg font-bold text-yellow-600`}>
                  {articles.filter(a => a.status === 'draft').length}
                </div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  مسودة
                </div>
              </div>
              
              <button
                onClick={() => fetchArticles(false)}
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
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id as any)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                whitespace-nowrap transition-colors
                ${activeFilter === filter.id
                  ? 'bg-blue-500 text-white'
                  : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {filter.icon}
              {filter.label}
              <Badge variant="secondary" className="text-xs">
                {filter.id === 'all' 
                  ? articles.length
                  : articles.filter(a => a.status === filter.id).length
                }
              </Badge>
            </button>
          ))}
        </div>

        {/* قائمة المقالات */}
        {filteredArticles.length === 0 ? (
          <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardContent className="p-8 text-center">
              <FileText className={`w-12 h-12 mx-auto mb-4 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <h3 className={`text-lg font-semibold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                لا توجد مقالات
              </h3>
              <p className={`text-sm mb-4 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {searchQuery 
                  ? 'لم يتم العثور على نتائج للبحث'
                  : 'لا توجد مقالات في هذا التصنيف'
                }
              </p>
              
              <Button
                onClick={() => router.push('/dashboard/article/create')}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                إنشاء مقال جديد
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-0">
            {filteredArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onEdit={(id) => router.push(`/dashboard/article/edit/${id}`)}
                onView={(id) => router.push(`/dashboard/article/${id}`)}
                onDelete={handleDeleteArticle}
              />
            ))}
          </div>
        )}

        {/* مساحة إضافية للتنقل السفلي */}
        <div className="h-16"></div>
      </div>
    </MobileDashboardLayout>
  );
}
