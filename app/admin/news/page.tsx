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
  Calendar,
  Clock,
  Zap,
  Users,
  MessageSquare,
  Plus,
  MoreVertical,
  FileText,
  AlertTriangle,
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

// دالة تحويل الأرقام إلى العربية
const toArabicNumbers = (num: number | string): string => {
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().replace(/[0-9]/g, (digit) => arabicNumbers[parseInt(digit)]);
};

// دالة حساب الوقت
const getRelativeTime = (date: string | Date) => {
  const now = new Date();
  const publishDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - publishDate.getTime()) / 1000);
  
  if (diffInSeconds < 3600) return `منذ ${toArabicNumbers(Math.floor(diffInSeconds / 60))} دقيقة`;
  if (diffInSeconds < 86400) return `منذ ${toArabicNumbers(Math.floor(diffInSeconds / 3600))} ساعة`;
  if (diffInSeconds < 2592000) return `منذ ${toArabicNumbers(Math.floor(diffInSeconds / 86400))} يوم`;
  
  return publishDate.toLocaleDateString('ar-SA');
};

interface Article {
  id: string;
  title: string;
  status: 'published' | 'draft' | 'archived' | 'scheduled';
  author?: { name: string };
  author_name?: string;
  category?: { name: string };
  created_at: string;
  published_at?: string;
  views?: number;
  comments?: any[];
  breaking?: boolean;
  image?: string;
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
    scheduled: 0,
    breaking: 0,
  });

  // جلب المقالات
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: filterStatus === 'all' ? 'all' : filterStatus,
        limit: '100',
        sort: 'created_at',
        order: 'desc'
      });

      if (selectedCategory !== 'all') {
        params.append('category_id', selectedCategory);
      }

      const response = await fetch(`/api/articles?${params}`);
      const data = await response.json();
      
      if (data.articles) {
        setArticles(data.articles);
        calculateStats(data.articles);
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
      scheduled: articles.filter(a => a.status === 'scheduled').length,
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
      }
    } catch (error) {
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
      }
    } catch (error) {
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
      }
    } catch (error) {
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
      }
    } catch (error) {
      toast.error('حدث خطأ في أرشفة المقال');
    }
  };

  // فلترة المقالات
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 ml-2" />
                مقال جديد
              </Button>
            </Link>
          </div>

          {/* بطاقات الإحصائيات */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilterStatus('all')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">إجمالي</p>
                    <p className="text-2xl font-bold">{toArabicNumbers(stats.total)}</p>
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
                    <p className="text-2xl font-bold text-green-600">{toArabicNumbers(stats.published)}</p>
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
                    <p className="text-2xl font-bold text-yellow-600">{toArabicNumbers(stats.draft)}</p>
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
                    <p className="text-2xl font-bold text-gray-600">{toArabicNumbers(stats.archived)}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-gray-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilterStatus('scheduled')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">مجدول</p>
                    <p className="text-2xl font-bold text-purple-600">{toArabicNumbers(stats.scheduled)}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">عاجل</p>
                    <p className="text-2xl font-bold text-red-600">{toArabicNumbers(stats.breaking)}</p>
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
                        <TableHead className="text-center">الكاتب</TableHead>
                        <TableHead className="text-center">المشاهدات</TableHead>
                        <TableHead className="text-center">التعليقات</TableHead>
                        <TableHead className="text-center">التاريخ</TableHead>
                        <TableHead className="text-center">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredArticles.map((article, index) => (
                        <TableRow key={article.id}>
                          <TableCell className="text-right font-medium">
                            {toArabicNumbers(index + 1)}
                          </TableCell>
                          
                          <TableCell className="text-right">
                            <div className="flex items-center gap-2">
                              {article.image && (
                                <img 
                                  src={article.image} 
                                  alt="" 
                                  className="w-10 h-10 rounded object-cover"
                                />
                              )}
                              <div>
                                <p className="font-medium line-clamp-1">{article.title}</p>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="text-center">
                            <Switch
                              checked={article.breaking || false}
                              onCheckedChange={() => toggleBreakingNews(article.id, article.breaking || false)}
                              className="data-[state=checked]:bg-red-500"
                            />
                          </TableCell>

                          <TableCell className="text-center">
                            <Badge
                              variant={
                                article.status === 'published' ? 'default' :
                                article.status === 'draft' ? 'secondary' :
                                article.status === 'archived' ? 'outline' :
                                'destructive'
                              }
                              className={
                                article.status === 'published' ? 'bg-green-100 text-green-800' :
                                article.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                article.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                                'bg-purple-100 text-purple-800'
                              }
                            >
                              {article.status === 'published' ? 'منشور' :
                               article.status === 'draft' ? 'مسودة' :
                               article.status === 'archived' ? 'مؤرشف' :
                               'مجدول'}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-center">
                            <Badge variant="outline">
                              {article.category?.name || 'بدون تصنيف'}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">
                                {article.author?.name || article.author_name || 'غير محدد'}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Eye className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium">
                                {toArabicNumbers(article.views || 0)}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <MessageSquare className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium">
                                {toArabicNumbers(article.comments?.length || 0)}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {getRelativeTime(article.published_at || article.created_at)}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => router.push(`/article/${article.id}`)}>
                                  <Eye className="w-4 h-4 ml-2" />
                                  عرض
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem onClick={() => router.push(`/dashboard/news/unified?id=${article.id}`)}>
                                  <Edit className="w-4 h-4 ml-2" />
                                  تعديل
                                </DropdownMenuItem>

                                {article.status === 'draft' && (
                                  <DropdownMenuItem onClick={() => publishArticle(article.id)}>
                                    <PlayCircle className="w-4 h-4 ml-2 text-green-600" />
                                    نشر
                                  </DropdownMenuItem>
                                )}

                                {article.status === 'published' && (
                                  <DropdownMenuItem onClick={() => archiveArticle(article.id)}>
                                    <PauseCircle className="w-4 h-4 ml-2 text-yellow-600" />
                                    أرشفة
                                  </DropdownMenuItem>
                                )}

                                <DropdownMenuSeparator />
                                
                                <DropdownMenuItem 
                                  onClick={() => deleteArticle(article.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 ml-2" />
                                  حذف
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
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
