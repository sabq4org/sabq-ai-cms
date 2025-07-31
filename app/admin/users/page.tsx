/**
 * صفحة إدارة القراء والمستخدمين المسجلين
 */

'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Mail,
  Calendar,
  Shield,
  Eye,
  Ban,
  CheckCircle,
  Activity,
  Download,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Heart,
  BookOpen,
  TrendingUp,
  Clock,
  UserCheck,
  UserX,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Reader {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'banned';
  email_verified: boolean;
  created_at: string;
  last_login?: string;
  stats: {
    articles_read: number;
    comments: number;
    likes: number;
    bookmarks: number;
  };
  subscription?: {
    type: 'free' | 'premium' | 'vip';
    expires_at?: string;
  };
}

export default function ReadersManagementPage() {
  const { darkMode } = useDarkModeContext();
  const [readers, setReaders] = useState<Reader[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReaders, setTotalReaders] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const ITEMS_PER_PAGE = 10;

  // جلب بيانات القراء
  const fetchReaders = async () => {
    try {
      const response = await fetch(`/api/users/readers?page=${currentPage}&limit=${ITEMS_PER_PAGE}&search=${searchTerm}&status=${statusFilter}&verified=${verifiedFilter}&subscription=${subscriptionFilter}`);
      
      if (!response.ok) throw new Error('فشل في جلب البيانات');
      
      const data = await response.json();
      setReaders(data.readers || []);
      setTotalPages(data.totalPages || 1);
      setTotalReaders(data.total || 0);
    } catch (error) {
      console.error('خطأ في جلب القراء:', error);
      toast.error('فشل في جلب بيانات القراء');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReaders();
  }, [currentPage, statusFilter, verifiedFilter, subscriptionFilter]);

  // البحث مع تأخير
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (currentPage === 1) {
        fetchReaders();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // حساب الإحصائيات
  const stats = {
    total: totalReaders,
    active: readers.filter(r => r.status === 'active').length,
    verified: readers.filter(r => r.email_verified).length,
    premium: readers.filter(r => r.subscription?.type === 'premium').length,
    recentlyActive: readers.filter(r => {
      if (!r.last_login) return false;
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      return new Date(r.last_login) > threeDaysAgo;
    }).length
  };

  // معالجات الإجراءات
  const handleBanReader = async (id: string) => {
    if (!confirm('هل أنت متأكد من حظر هذا القارئ؟')) return;
    
    try {
      const response = await fetch(`/api/users/${id}/ban`, { method: 'POST' });
      if (!response.ok) throw new Error('فشل في حظر القارئ');
      
      toast.success('تم حظر القارئ بنجاح');
      fetchReaders();
    } catch (error) {
      toast.error('فشل في حظر القارئ');
    }
  };

  const handleActivateReader = async (id: string) => {
    try {
      const response = await fetch(`/api/users/${id}/activate`, { method: 'POST' });
      if (!response.ok) throw new Error('فشل في تفعيل القارئ');
      
      toast.success('تم تفعيل القارئ بنجاح');
      fetchReaders();
    } catch (error) {
      toast.error('فشل في تفعيل القارئ');
    }
  };

  const handleDeleteReader = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا القارئ؟ هذا الإجراء لا يمكن التراجع عنه.')) return;
    
    try {
      const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('فشل في حذف القارئ');
      
      toast.success('تم حذف القارئ بنجاح');
      fetchReaders();
    } catch (error) {
      toast.error('فشل في حذف القارئ');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReaders();
  };

  const exportReaders = () => {
    // تصدير البيانات كـ CSV
    const csvContent = [
      ['الاسم', 'البريد الإلكتروني', 'الحالة', 'تاريخ التسجيل', 'آخر دخول'],
      ...readers.map(r => [
        r.name,
        r.email,
        r.status,
        format(new Date(r.created_at), 'yyyy-MM-dd'),
        r.last_login ? format(new Date(r.last_login), 'yyyy-MM-dd') : 'لم يسجل دخول'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `readers_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300';
      case 'inactive':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300';
      case 'banned':
        return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300';
    }
  };

  const getSubscriptionColor = (type: string) => {
    switch (type) {
      case 'premium':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300';
      case 'vip':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        pageTitle="إدارة القراء"
        pageDescription="إدارة المستخدمين المسجلين في الموقع"
      >
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">جاري تحميل البيانات...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      pageTitle="إدارة القراء"
      pageDescription="إدارة المستخدمين المسجلين في الموقع"
    >
      <div className="space-y-6">
        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">إجمالي القراء</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">نشطون</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.active.toLocaleString()}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">موثقون</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.verified.toLocaleString()}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">مشتركون</p>
                  <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.premium.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 border-cyan-200 dark:border-cyan-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-cyan-600 dark:text-cyan-400">نشطون مؤخراً</p>
                  <p className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">{stats.recentlyActive.toLocaleString()}</p>
                </div>
                <Activity className="h-8 w-8 text-cyan-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* شريط الأدوات */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* البحث */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="البحث بالاسم أو البريد الإلكتروني..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 w-full"
                  />
                </div>
              </div>

              {/* الفلاتر */}
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="inactive">غير نشط</SelectItem>
                    <SelectItem value="banned">محظور</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="التوثيق" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="verified">موثق</SelectItem>
                    <SelectItem value="unverified">غير موثق</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="الاشتراك" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الاشتراكات</SelectItem>
                    <SelectItem value="free">مجاني</SelectItem>
                    <SelectItem value="premium">مميز</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* الأزرار */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  variant="outline"
                  onClick={exportReaders}
                >
                  <Download className="h-4 w-4 ml-2" />
                  تصدير
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* جدول القراء */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      القارئ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      الإحصائيات
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      الاشتراك
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      التواريخ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {readers.map((reader) => (
                    <tr key={reader.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={reader.avatar} />
                            <AvatarFallback>
                              {reader.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="mr-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                              {reader.name}
                              {reader.email_verified && (
                                <CheckCircle className="h-4 w-4 text-blue-500" />
                              )}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {reader.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusColor(reader.status)}>
                          {reader.status === 'active' ? 'نشط' : reader.status === 'inactive' ? 'غير نشط' : 'محظور'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4 text-gray-400" />
                            <span>{reader.stats.articles_read}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4 text-gray-400" />
                            <span>{reader.stats.comments}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4 text-gray-400" />
                            <span>{reader.stats.likes}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {reader.subscription ? (
                          <Badge className={getSubscriptionColor(reader.subscription.type)}>
                            {reader.subscription.type === 'premium' ? 'مميز' : reader.subscription.type === 'vip' ? 'VIP' : 'مجاني'}
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                            مجاني
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>انضم: {format(new Date(reader.created_at), 'dd MMM yyyy', { locale: ar })}</span>
                          </div>
                          {reader.last_login && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>آخر دخول: {format(new Date(reader.last_login), 'dd MMM yyyy', { locale: ar })}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 ml-2" />
                              عرض التفاصيل
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 ml-2" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {reader.status === 'active' ? (
                              <DropdownMenuItem
                                onClick={() => handleBanReader(reader.id)}
                                className="text-red-600 dark:text-red-400"
                              >
                                <Ban className="h-4 w-4 ml-2" />
                                حظر القارئ
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleActivateReader(reader.id)}
                                className="text-green-600 dark:text-green-400"
                              >
                                <UserCheck className="h-4 w-4 ml-2" />
                                تفعيل القارئ
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleDeleteReader(reader.id)}
                              className="text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="h-4 w-4 ml-2" />
                              حذف نهائياً
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* التصفح */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    عرض {((currentPage - 1) * ITEMS_PER_PAGE) + 1} إلى {Math.min(currentPage * ITEMS_PER_PAGE, totalReaders)} من {totalReaders} قارئ
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}