'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { 
  Plus, Search, Filter, Eye, Edit, Trash2, Clock, 
  TrendingUp, FileText, Calendar, User, Tag, 
  Sparkles, Zap, ChevronRight, Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Article {
  id: string;
  title: string;
  excerpt?: string;
  summary?: string;
  status: string;
  author?: {
    name: string;
  };
  category?: {
    name: string;
    name_ar?: string;
    color?: string;
  };
  created_at: string;
  published_at?: string;
  views?: number;
  is_featured?: boolean;
  is_breaking?: boolean;
}

export default function ArticlesListPage() {
  const router = useRouter();
  const { darkMode } = useDarkModeContext();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // جلب المقالات
  useEffect(() => {
    fetchArticles();
  }, []);
  
  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/articles?limit=50&sort=created_at&order=desc');
      
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles || data.data || []);
      } else {
        toast.error('فشل في جلب المقالات');
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error('حدث خطأ في جلب المقالات');
    } finally {
      setLoading(false);
    }
  };
  
  // حذف مقال
  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المقال؟')) return;
    
    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast.success('تم حذف المقال بنجاح');
        fetchArticles();
      } else {
        toast.error('فشل في حذف المقال');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('حدث خطأ في حذف المقال');
    }
  };
  
  // فلترة المقالات
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || article.status === filterStatus;
    return matchesSearch && matchesStatus;
  });
  
  // حالة النص للحالة
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { label: 'منشور', color: 'bg-green-100 text-green-800' },
      draft: { label: 'مسودة', color: 'bg-gray-100 text-gray-800' },
      pending_review: { label: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <Badge className={cn('text-xs', config.color)}>
        {config.label}
      </Badge>
    );
  };
  
  return (
    <div className={cn(
      "min-h-screen p-6 transition-colors duration-200",
      darkMode ? "bg-gray-900" : "bg-gray-50"
    )}>
      {/* رأس الصفحة */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={cn(
              "text-3xl font-bold mb-2",
              darkMode ? "text-white" : "text-gray-800"
            )}>
              إدارة المقالات
            </h1>
            <p className={cn(
              "text-sm",
              darkMode ? "text-gray-400" : "text-gray-600"
            )}>
              إنشاء وتحرير وإدارة جميع المقالات
            </p>
          </div>
          
          {/* أزرار الإجراءات */}
          <div className="flex items-center gap-3">
            {/* زر واجهة موحدة جديد */}
            <Button
              onClick={() => router.push('/dashboard/article/unified/new')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white gap-2"
            >
              <Sparkles className="w-4 h-4" />
              واجهة موحدة
            </Button>
            
            {/* زر إنشاء عادي */}
            <Button
              onClick={() => router.push('/dashboard/article/new-enhanced')}
              className="bg-green-600 hover:bg-green-700 text-white gap-2"
            >
              <Plus className="w-4 h-4" />
              مقال جديد
            </Button>
          </div>
        </div>
        
        {/* شريط معلومات الواجهة الجديدة */}
        <div className={cn(
          "p-4 rounded-lg border mb-6",
          darkMode 
            ? "bg-purple-900/20 border-purple-700" 
            : "bg-purple-50 border-purple-200"
        )}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-purple-600/20">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className={cn(
                "font-semibold mb-1",
                darkMode ? "text-purple-300" : "text-purple-900"
              )}>
                جرّب الواجهة الموحدة الجديدة! 🚀
              </h3>
              <p className={cn(
                "text-sm",
                darkMode ? "text-purple-400" : "text-purple-700"
              )}>
                واجهة نشر ذكية تجمع كل الخطوات في صفحة واحدة لتجربة أسرع وأسهل
              </p>
            </div>
            <Link
              href="/dashboard/article/unified/new"
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                "bg-purple-600 hover:bg-purple-700 text-white"
              )}
            >
              جرب الآن
            </Link>
          </div>
        </div>
      </div>
      
      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">إجمالي المقالات</p>
                <p className="text-2xl font-bold">{articles.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">منشور</p>
                <p className="text-2xl font-bold">
                  {articles.filter(a => a.status === 'published').length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">مسودات</p>
                <p className="text-2xl font-bold">
                  {articles.filter(a => a.status === 'draft').length}
                </p>
              </div>
              <Edit className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">إجمالي المشاهدات</p>
                <p className="text-2xl font-bold">
                  {articles.reduce((sum, a) => sum + (a.views || 0), 0).toLocaleString('ar-SA')}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* الفلاتر والبحث */}
      <Card className={cn(
        "mb-6",
        darkMode ? 'bg-gray-800 border-gray-700' : ''
      )}>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="البحث عن مقال..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={cn(
                    "pr-10",
                    darkMode ? "bg-gray-700 border-gray-600" : ""
                  )}
                />
              </div>
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={cn(
                "px-4 py-2 rounded-lg border text-sm",
                darkMode 
                  ? "bg-gray-700 border-gray-600 text-white" 
                  : "bg-white border-gray-300"
              )}
            >
              <option value="all">جميع الحالات</option>
              <option value="published">منشور</option>
              <option value="draft">مسودة</option>
              <option value="pending_review">قيد المراجعة</option>
            </select>
          </div>
        </CardContent>
      </Card>
      
      {/* قائمة المقالات */}
      <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
        <CardHeader>
          <CardTitle>جميع المقالات</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">جاري تحميل المقالات...</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">لا توجد مقالات</p>
              <Button
                onClick={() => router.push('/dashboard/article/unified/new')}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                إنشاء أول مقال
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredArticles.map((article) => (
                <div
                  key={article.id}
                  className={cn(
                    "p-4 rounded-lg border transition-all hover:shadow-md",
                    darkMode 
                      ? "bg-gray-700 border-gray-600 hover:bg-gray-600" 
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={cn(
                          "font-semibold text-lg",
                          darkMode ? "text-white" : "text-gray-800"
                        )}>
                          {article.title}
                        </h3>
                        {article.is_featured && (
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                            مميز
                          </Badge>
                        )}
                        {article.is_breaking && (
                          <Badge className="bg-red-100 text-red-800 text-xs">
                            عاجل
                          </Badge>
                        )}
                        {getStatusBadge(article.status)}
                      </div>
                      
                      {(article.excerpt || article.summary) && (
                        <p className={cn(
                          "text-sm mb-3 line-clamp-2",
                          darkMode ? "text-gray-400" : "text-gray-600"
                        )}>
                          {article.excerpt || article.summary}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {article.author && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {article.author.name}
                          </span>
                        )}
                        {article.category && (
                          <span className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {article.category.name_ar || article.category.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(article.created_at).toLocaleDateString('ar-SA')}
                        </span>
                        {article.views !== undefined && (
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {article.views} مشاهدة
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mr-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/dashboard/article/unified/${article.id}`)}
                        className="gap-1 text-purple-600 hover:text-purple-700"
                      >
                        <Sparkles className="w-4 h-4" />
                        واجهة موحدة
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/dashboard/article/edit/${article.id}`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(`/article/${article.id}`, '_blank')}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(article.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 