/**
 * صفحة إدارة المستخدمين الحديثة
 * Modern Users Management Page
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Eye,
  Ban,
  CheckCircle,
  AlertCircle,
  Star,
  TrendingUp,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isAdmin: boolean;
  status: string;
  joinDate: string;
  lastActive: string;
  location?: string;
  avatar?: string;
  verified: boolean;
  subscription: string;
  stats?: {
    episodes: number;
    programs: number;
    interactions: number;
  };
}

// البيانات الوهمية تم إزالتها - سيتم جلب البيانات من قاعدة البيانات

export default function ModernUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // جلب المستخدمين من قاعدة البيانات
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
        setTotal(data.total);
      } else {
        toast.error('فشل في جلب المستخدمين');
      }
    } catch (error) {
      console.error('خطأ في جلب المستخدمين:', error);
      toast.error('حدث خطأ في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'editor': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'author': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'subscriber': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      case 'correspondent': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case 'user': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'inactive': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      case 'banned': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getSubscriptionColor = (subscription: User['subscription']) => {
    switch (subscription) {
      case 'enterprise': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case 'premium': return 'bg-gold-100 text-gold-700 dark:bg-gold-900 dark:text-gold-300';
      case 'free': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleText = (role: User['role']) => {
    switch (role) {
      case 'admin': return 'مدير';
      case 'editor': return 'محرر';
      case 'author': return 'كاتب';
      case 'subscriber': return 'مشترك';
      case 'correspondent': return 'مراسل';
      case 'user': return 'مستخدم';
      default: return role;
    }
  };

  const getStatusText = (status: User['status']) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'inactive': return 'غير نشط';
      case 'banned': return 'محظور';
      case 'pending': return 'معلق';
      default: return status;
    }
  };

  const getSubscriptionText = (subscription: User['subscription']) => {
    switch (subscription) {
      case 'enterprise': return 'مؤسسي';
      case 'premium': return 'مميز';
      case 'free': return 'مجاني';
      default: return subscription;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `منذ ${days} يوم`;
    if (hours > 0) return `منذ ${hours} ساعة`;
    if (minutes > 0) return `منذ ${minutes} دقيقة`;
    return 'الآن';
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2);
  };

  return (
    <DashboardLayout 
      pageTitle="إدارة المستخدمين"
      pageDescription="إدارة حسابات المستخدمين والصلاحيات"
    >
      <div className="space-y-6">
        {/* شريط الأدوات العلوي */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="h-4 w-4 mr-2" />
              مستخدم جديد
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              تصفية
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="البحث في المستخدمين..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* الإحصائيات السريعة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { title: 'إجمالي المستخدمين', value: users.length.toString(), icon: Users, color: 'blue' },
            { title: 'نشط', value: users.filter(u => u.status === 'active').length.toString(), icon: CheckCircle, color: 'green' },
            { title: 'محررين', value: users.filter(u => u.role === 'editor').length.toString(), icon: Edit, color: 'purple' },
            { title: 'معلق', value: users.filter(u => u.status === 'pending').length.toString(), icon: AlertCircle, color: 'yellow' }
          ].map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={cn(
                    "h-8 w-8",
                    stat.color === 'blue' && "text-blue-500",
                    stat.color === 'green' && "text-green-500",
                    stat.color === 'purple' && "text-purple-500",
                    stat.color === 'yellow' && "text-yellow-500"
                  )} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* التبويبات والمحتوى */}
        <Tabs defaultValue="list">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="list">قائمة المستخدمين</TabsTrigger>
            <TabsTrigger value="analytics">التحليلات</TabsTrigger>
            <TabsTrigger value="permissions">الصلاحيات</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            {/* فلاتر */}
            <div className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="space-y-2">
                <Label className="text-sm">الدور</Label>
                <select 
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="all">جميع الأدوار</option>
                  <option value="admin">مدير</option>
                  <option value="editor">محرر</option>
                  <option value="author">كاتب</option>
                  <option value="subscriber">مشترك</option>
                  <option value="correspondent">مراسل</option>
                  <option value="user">مستخدم</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">الحالة</Label>
                <select 
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                  <option value="banned">محظور</option>
                  <option value="pending">معلق</option>
                </select>
              </div>
            </div>

            {/* جدول المستخدمين */}
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600 dark:text-gray-400">جارٍ تحميل بيانات المستخدمين...</p>
                    </div>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">لا يوجد مستخدمون حالياً</p>
                  </div>
                ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المستخدم
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الدور
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الحالة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الاشتراك
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          آخر نشاط
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الإجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium text-sm">
                                {getUserInitials(user.name)}
                              </div>
                              <div className="mr-4">
                                <div className="flex items-center gap-2">
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {user.name}
                                  </div>
                                  {user.verified && (
                                    <CheckCircle className="h-4 w-4 text-blue-500" />
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {user.email}
                                </div>
                                {user.location && (
                                  <div className="flex items-center gap-1 text-xs text-gray-400">
                                    <MapPin className="h-3 w-3" />
                                    <span>{user.location}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getRoleColor(user.role)}>
                              {getRoleText(user.role)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getStatusColor(user.status)}>
                              {getStatusText(user.status)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getSubscriptionColor(user.subscription)}>
                              {getSubscriptionText(user.subscription)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="space-y-1">
                              <div>{getTimeAgo(user.lastActive)}</div>
                              {user.stats && (user.stats.episodes > 0 || user.stats.programs > 0) && (
                                <div className="flex items-center gap-1 text-xs">
                                  <Edit className="h-3 w-3" />
                                  <span>{user.stats.episodes} حلقة، {user.stats.programs} برنامج</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Mail className="h-4 w-4 mr-2" />
                                    إرسال رسالة
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Shield className="h-4 w-4 mr-2" />
                                    تغيير الصلاحيات
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Ban className="h-4 w-4 mr-2" />
                                    حظر المستخدم
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    حذف الحساب
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>إحصائيات التسجيل</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">المستخدمون الجدد (هذا الشهر)</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">+15</span>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">معدل النشاط</span>
                      <span className="font-semibold">73%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">المستخدمون المميزون</span>
                      <span className="font-semibold">{users.filter(u => u.subscription === 'premium').length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>توزيع الأدوار</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['admin', 'editor', 'author', 'subscriber'].map((role) => (
                      <div key={role} className="flex justify-between items-center">
                        <span className="text-sm">{getRoleText(role as User['role'])}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ 
                                width: `${(users.filter(u => u.role === role).length / users.length) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="font-semibold text-sm w-8">
                            {users.filter(u => u.role === role).length}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إدارة الصلاحيات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { role: 'admin', name: 'مدير النظام', permissions: ['قراءة', 'كتابة', 'حذف', 'إدارة المستخدمين', 'إدارة النظام'] },
                    { role: 'editor', name: 'محرر', permissions: ['قراءة', 'كتابة', 'تحرير المحتوى', 'نشر المقالات'] },
                    { role: 'author', name: 'كاتب', permissions: ['قراءة', 'كتابة', 'إنشاء مقالات'] },
                    { role: 'subscriber', name: 'مشترك', permissions: ['قراءة', 'التعليق'] }
                  ].map((roleData) => (
                    <div key={roleData.role} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 text-blue-500" />
                          <h3 className="font-semibold">{roleData.name}</h3>
                          <Badge className={getRoleColor(roleData.role as User['role'])}>
                            {users.filter(u => u.role === roleData.role).length} مستخدم
                          </Badge>
                        </div>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          تعديل
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {roleData.permissions.map((permission) => (
                          <Badge key={permission} variant="secondary" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
