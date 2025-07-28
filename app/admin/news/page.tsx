'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Search,
  Edit,
  Trash2,
  Eye,
  Clock,
  Zap,
  Users,
  Plus,
  MoreVertical,
  FileText,
  CheckCircle,
  XCircle,
  PauseCircle,
  PlayCircle,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";

// دالة تنسيق الأرقام (إبقاؤها بالإنجليزية)
const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US');
};

// دالة تنسيق التاريخ والوقت
const formatDateTime = (date: string | Date) => {
  const publishDate = new Date(date);
  const dateStr = publishDate.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const timeStr = publishDate.toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit'
  });
  return { date: dateStr, time: timeStr };
};

interface Article {
  id: string;
  title: string;
  status: 'published' | 'draft' | 'archived';
  author?: { name: string };
  author_name?: string;
  category?: { name: string; id: string };
  category_id?: string;
  created_at: string;
  published_at?: string;
  views?: number;
  breaking?: boolean;
  image?: string;
  featured_image?: string;
  reactions?: { like?: number; share?: number };
}

export default function AdminNewsPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // إحصائيات
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    archived: 0,
    breaking: 0,
  });

  // جلب المقالات
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: filterStatus === 'all' ? 'all' : filterStatus,
        limit: '200',
        sort: 'published_at',
        order: 'desc'
      });

      if (selectedCategory !== 'all') {
        params.append('category_id', selectedCategory);
      }

      const response = await fetch(`/api/articles?${params}`);
      const data = await response.json();
      
      if (data.articles) {
        // فلترة المقالات التجريبية والمجدولة والمؤرشفة (إلا إذا تم اختيار عرض المؤرشفة)
        const realArticles = data.articles.filter((article: any) => {
          const title = article.title.toLowerCase();
          const isTestArticle = title.includes('test') || 
                                title.includes('تجربة') || 
                                title.includes('demo') ||
                                title.includes('example');
          
          // إذا كان الفلتر "all" لا نعرض المؤرشفة
          if (filterStatus === 'all' && article.status === 'archived') {
            return false;
          }
          
          return !isTestArticle && article.status !== 'scheduled';
        });
        
        // ترتيب المقالات حسب التاريخ (الأحدث أولاً)
        const sortedArticles = realArticles.sort((a: any, b: any) => {
          const dateA = new Date(a.published_at || a.created_at).getTime();
          const dateB = new Date(b.published_at || b.created_at).getTime();
          return dateB - dateA; // الأحدث أولاً
        });
        
        setArticles(sortedArticles);
        calculateStats(data.articles.filter((article: any) => {
          const title = article.title.toLowerCase();
          return !title.includes('test') && 
                 !title.includes('تجربة') && 
                 !title.includes('demo') &&
                 !title.includes('example') &&
                 article.status !== 'scheduled';
        }));
      }
    } catch (error) {
      console.error('خطأ في جلب المقالات:', error);
      toast.error('حدث خطأ في جلب المقالات');
    } finally {
      setLoading(false);
    }
  };

  // جلب التصنيفات
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('خطأ في جلب التصنيفات:', error);
    }
  };

  // حساب الإحصائيات
  const calculateStats = (articles: Article[]) => {
    const stats = {
      total: articles.length,
      published: articles.filter(a => a.status === 'published').length,
      draft: articles.filter(a => a.status === 'draft').length,
      archived: articles.filter(a => a.status === 'archived').length,
      breaking: articles.filter(a => a.breaking).length,
    };
    setStats(stats);
  };

  useEffect(() => {
    fetchCategories();
    fetchArticles();
  }, [filterStatus, selectedCategory]);

  // تبديل حالة الخبر العاجل
  const toggleBreakingNews = async (articleId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/toggle-breaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          isBreaking: !currentStatus
        })
      });

      if (response.ok) {
        toast.success(!currentStatus ? '✅ تم تفعيل الخبر العاجل' : '⏸️ تم إلغاء الخبر العاجل');
        fetchArticles();
      } else {
        toast.error('حدث خطأ في تحديث حالة الخبر');
      }
    } catch (error) {
      console.error('خطأ في تبديل الخبر العاجل:', error);
      toast.error('حدث خطأ في تحديث حالة الخبر');
    }
  };

  // حذف مقال
  const deleteArticle = async (articleId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المقال؟')) return;

    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('✅ تم حذف المقال بنجاح');
        fetchArticles();
      } else {
        toast.error('فشل حذف المقال - تحقق من الصلاحيات');
      }
    } catch (error) {
      console.error('خطأ في حذف المقال:', error);
      toast.error('حدث خطأ في حذف المقال');
    }
  };

  // نشر مقال
  const publishArticle = async (articleId: string) => {
    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'published',
          published_at: new Date().toISOString()
        })
      });

      if (response.ok) {
        toast.success('✅ تم نشر المقال بنجاح');
        fetchArticles();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || 'فشل نشر المقال');
      }
    } catch (error) {
      console.error('خطأ في نشر المقال:', error);
      toast.error('حدث خطأ في نشر المقال');
    }
  };

  // أرشفة مقال
  const archiveArticle = async (articleId: string) => {
    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' })
      });

      if (response.ok) {
        toast.success('📦 تم أرشفة المقال بنجاح');
        fetchArticles();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || 'فشل أرشفة المقال');
      }
    } catch (error) {
      console.error('خطأ في أرشفة المقال:', error);
      toast.error('حدث خطأ في أرشفة المقال');
    }
  };

  // فلترة المقالات
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // الحصول على التصنيف الحقيقي
  const getCategoryName = (article: Article) => {
    if (article.category?.name) return article.category.name;
    if (article.category_id) {
      const cat = categories.find(c => c.id === article.category_id);
      return cat?.name || 'غير مصنف';
    }
    return 'غير مصنف';
  };

  return (
    <DashboardLayout>
      <TooltipProvider>
        <div className="space-y-6 p-6">
          {/* العنوان والإجراءات */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">إدارة الأخبار</h1>
              <p className="text-sm text-gray-600 mt-1">
                إدارة وتحرير المحتوى الإخباري
              </p>
            </div>
            
            <Link href="/dashboard/news/unified">
              <Button className="bg-green-600 hover:bg-green-700" size="lg">
                <Plus className="w-5 h-5 ml-2" />
                مقال جديد
              </Button>
            </Link>
          </div>

          {/* بطاقات الإحصائيات */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilterStatus('all')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">نشط</p>
                    <p className="text-2xl font-bold">{formatNumber(stats.published + stats.draft)}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilterStatus('published')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">منشور</p>
                    <p className="text-2xl font-bold text-green-600">{formatNumber(stats.published)}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilterStatus('draft')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">مسودة</p>
                    <p className="text-2xl font-bold text-yellow-600">{formatNumber(stats.draft)}</p>
                  </div>
                  <PauseCircle className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilterStatus('archived')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">مؤرشف</p>
                    <p className="text-2xl font-bold text-gray-600">{formatNumber(stats.archived)}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-gray-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">عاجل</p>
                    <p className="text-2xl font-bold text-red-600">{formatNumber(stats.breaking)}</p>
                  </div>
                  <Zap className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* شريط البحث والفلاتر */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="البحث في المقالات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">جميع التصنيفات</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* جدول المقالات */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  <p className="mt-2 text-gray-600">جاري التحميل...</p>
                </div>
              ) : filteredArticles.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-600">لا توجد مقالات</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right w-12">#</TableHead>
                        <TableHead className="text-right">العنوان</TableHead>
                        <TableHead className="text-center">عاجل</TableHead>
                        <TableHead className="text-center">الحالة</TableHead>
                        <TableHead className="text-center">التصنيف</TableHead>
                        <TableHead className="text-center">المشاهدات</TableHead>
                        <TableHead className="text-center">تاريخ النشر</TableHead>
                        <TableHead className="text-center">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredArticles.map((article, index) => {
                        const dateTime = formatDateTime(article.published_at || article.created_at);
                        return (
                          <TableRow key={article.id}>
                            <TableCell className="text-right font-medium">
                              {index + 1}
                            </TableCell>
                            
                            <TableCell className="text-right">
                              <div className="flex items-start gap-3">
                                {(article.image || article.featured_image) && (
                                  <img 
                                    src={article.image || article.featured_image} 
                                    alt="" 
                                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                  />
                                )}
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900 line-clamp-2">{article.title}</p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    <Users className="w-3 h-3 inline-block ml-1" />
                                    {article.author?.name || article.author_name || 'غير محدد'}
                                  </p>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className="text-center">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="inline-flex">
                                    <Switch
                                      checked={article.breaking || false}
                                      onCheckedChange={() => toggleBreakingNews(article.id, article.breaking || false)}
                                      className="data-[state=checked]:bg-red-600"
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{article.breaking ? 'إلغاء العاجل' : 'تفعيل كعاجل'}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>

                            <TableCell className="text-center">
                              <Badge
                                variant={
                                  article.status === 'published' ? 'default' :
                                  article.status === 'draft' ? 'secondary' :
                                  'outline'
                                }
                                className={
                                  article.status === 'published' ? 'bg-green-100 text-green-800 border-green-200' :
                                  article.status === 'draft' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                  'bg-gray-100 text-gray-800 border-gray-200'
                                }
                              >
                                {article.status === 'published' ? 'منشور' :
                                 article.status === 'draft' ? 'مسودة' :
                                 'مؤرشف'}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-center">
                              <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                                {getCategoryName(article)}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Eye className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium">
                                  {formatNumber(article.views || 0)}
                                </span>
                              </div>
                            </TableCell>

                            <TableCell className="text-center">
                              <div className="text-sm">
                                <div className="font-medium text-gray-900">{dateTime.date}</div>
                                <div className="text-gray-500 text-xs mt-0.5">{dateTime.time}</div>
                              </div>
                            </TableCell>

                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm" className="h-9 px-3">
                                    <MoreVertical className="w-4 h-4 ml-1" />
                                    إجراءات
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                  <DropdownMenuItem onClick={() => router.push(`/article/${article.id}`)} className="py-3">
                                    <Eye className="w-4 h-4 ml-3 text-blue-600" />
                                    <span className="font-medium">عرض المقال</span>
                                  </DropdownMenuItem>
                                  
                                  <DropdownMenuItem onClick={() => router.push(`/dashboard/news/unified?id=${article.id}`)} className="py-3">
                                    <Edit className="w-4 h-4 ml-3 text-yellow-600" />
                                    <span className="font-medium">تعديل المقال</span>
                                  </DropdownMenuItem>

                                  {article.status === 'draft' && (
                                    <DropdownMenuItem onClick={() => publishArticle(article.id)} className="py-3">
                                      <PlayCircle className="w-4 h-4 ml-3 text-green-600" />
                                      <span className="font-medium text-green-600">نشر المقال</span>
                                    </DropdownMenuItem>
                                  )}

                                  {article.status === 'published' && (
                                    <DropdownMenuItem onClick={() => archiveArticle(article.id)} className="py-3">
                                      <PauseCircle className="w-4 h-4 ml-3 text-orange-600" />
                                      <span className="font-medium text-orange-600">أرشفة المقال</span>
                                    </DropdownMenuItem>
                                  )}

                                  <DropdownMenuSeparator />
                                  
                                  <DropdownMenuItem 
                                    onClick={() => deleteArticle(article.id)}
                                    className="py-3 text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4 ml-3" />
                                    <span className="font-medium">حذف المقال</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
}
