'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// تم إزالة DashboardLayout - تستخدم الصفحة layout.tsx الأساسي
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit3, 
  Trash2, 
  Filter,
  FileText,
  Users,
  Calendar,
  MoreHorizontal,
  Lightbulb
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Corner {
  id: string;
  name: string;
  slug: string;
  author_name: string;
  description: string;
  is_active: boolean;
  is_featured: boolean;
  articles_count: number;
  followers_count: number;
  category_name: string;
  creator_name: string;
  created_at: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function CornersManagementPage() {
  const router = useRouter();
  const [corners, setCorners] = useState<Corner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchCorners();
  }, [pagination.page, searchTerm, statusFilter]);

  const fetchCorners = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
        status: statusFilter
      });

      const response = await fetch(`/api/admin/muqtarab/corners?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCorners(data.data.corners || []);
        setPagination(data.data.pagination);
      } else {
        console.error('خطأ في جلب الزوايا');
      }
    } catch (error) {
      console.error('خطأ في جلب الزوايا:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCorner = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف زاوية "${name}"؟`)) return;

    try {
      const response = await fetch(`/api/admin/muqtarab/corners/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setCorners(corners.filter(corner => corner.id !== id));
      } else {
        const error = await response.json();
        alert(error.error || 'حدث خطأ في حذف الزاوية');
      }
    } catch (error) {
      console.error('خطأ في حذف الزاوية:', error);
      alert('حدث خطأ في حذف الزاوية');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const goToPage = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  return (
    <div className="space-y-6" dir="rtl">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">إدارة الزوايا</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              إدارة وتنظيم زوايا المحتوى الإبداعي في منصة مُقترَب
            </p>
          </div>
          <Button onClick={() => router.push('/admin/muqtarab/corners/create')}>
            <Plus className="w-4 h-4 ml-2" />
            إنشاء زاوية جديدة
          </Button>
        </div>

        {/* شريط البحث والفلاتر */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="البحث في الزوايا..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="فلترة حسب الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الزوايا</SelectItem>
                  <SelectItem value="active">نشطة</SelectItem>
                  <SelectItem value="inactive">غير نشطة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* جدول الزوايا */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              الزوايا ({pagination.total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="mr-3">جاري التحميل...</span>
              </div>
            ) : corners.length === 0 ? (
              <div className="text-center py-12">
                <Lightbulb className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">لا توجد زوايا</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  لم يتم العثور على زوايا تطابق البحث المحدد
                </p>
                <Button onClick={() => router.push('/admin/muqtarab/corners/create')}>
                  <Plus className="w-4 h-4 ml-2" />
                  إنشاء زاوية جديدة
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* هيدر الجدول */}
                <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg font-medium text-sm text-gray-600 dark:text-gray-400">
                  <div className="col-span-3">اسم الزاوية</div>
                  <div className="col-span-2">الكاتب</div>
                  <div className="col-span-2">المقالات</div>
                  <div className="col-span-2">المتابعون</div>
                  <div className="col-span-2">تاريخ الإنشاء</div>
                  <div className="col-span-1">الإجراءات</div>
                </div>

                {/* صفوف البيانات */}
                {corners.map((corner) => (
                  <div 
                    key={corner.id}
                    className="grid grid-cols-12 gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="col-span-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                          {corner.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {corner.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            /{corner.slug}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant={corner.is_active ? 'default' : 'secondary'}>
                              {corner.is_active ? 'نشط' : 'غير نشط'}
                            </Badge>
                            {corner.is_featured && (
                              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                                مميز
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {corner.author_name}
                        </p>
                        {corner.category_name && (
                          <p className="text-gray-500 dark:text-gray-400 mt-1">
                            {corner.category_name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium">
                          {corner.articles_count}
                        </span>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium">
                          {corner.followers_count}
                        </span>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">
                          {formatDate(corner.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="col-span-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => router.push(`/admin/muqtarab/corners/${corner.id}`)}
                          >
                            <Eye className="w-4 h-4 ml-2" />
                            عرض التفاصيل
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/admin/muqtarab/corners/${corner.id}/edit`)}
                          >
                            <Edit3 className="w-4 h-4 ml-2" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteCorner(corner.id, corner.name)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 ml-2" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* الترقيم */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  عرض {((pagination.page - 1) * pagination.limit) + 1} إلى {Math.min(pagination.page * pagination.limit, pagination.total)} من {pagination.total} زاوية
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    السابق
                  </Button>
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    const page = i + Math.max(1, pagination.page - 2);
                    return (
                      <Button
                        key={page}
                        variant={page === pagination.page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => goToPage(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                  >
                    التالي
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
}