/**
 * صفحة إدارة المستخدمين مع التصميم الحديث RTL
 */

'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Shield,
  Settings,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Star
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'admin' | 'editor' | 'user';
  status: 'active' | 'inactive' | 'banned';
  joinDate: string;
  lastLogin?: string;
  articlesCount: number;
  commentsCount: number;
  isVerified: boolean;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'banned'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'editor' | 'user'>('all');

  // بيانات وهمية للاختبار
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'أحمد محمد الأحمد',
        email: 'ahmed@example.com',
        phone: '+966501234567',
        avatar: '',
        role: 'admin',
        status: 'active',
        joinDate: '2023-01-15',
        lastLogin: '2024-07-26',
        articlesCount: 25,
        commentsCount: 120,
        isVerified: true
      },
      {
        id: '2',
        name: 'فاطمة علي السالم',
        email: 'fatima@example.com',
        phone: '+966501234568',
        avatar: '',
        role: 'editor',
        status: 'active',
        joinDate: '2023-03-20',
        lastLogin: '2024-07-25',
        articlesCount: 15,
        commentsCount: 85,
        isVerified: true
      },
      {
        id: '3',
        name: 'محمد عبدالله النجار',
        email: 'mohammed@example.com',
        phone: '+966501234569',
        avatar: '',
        role: 'user',
        status: 'active',
        joinDate: '2023-06-10',
        lastLogin: '2024-07-24',
        articlesCount: 0,
        commentsCount: 45,
        isVerified: false
      }
    ];
    
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'editor':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'user':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'banned':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'مدير';
      case 'editor':
        return 'محرر';
      case 'user':
        return 'مستخدم';
      default:
        return 'غير محدد';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'inactive':
        return 'غير نشط';
      case 'banned':
        return 'محظور';
      default:
        return 'غير محدد';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  return (
    <DashboardLayout
      pageTitle="إدارة المستخدمين"
      pageDescription="إدارة حسابات المستخدمين والصلاحيات"
    >
      <div className="space-y-6" dir="rtl">
        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">إجمالي المستخدمين</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.length.toLocaleString()}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">المستخدمين النشطين</p>
                  <p className="text-2xl font-bold text-green-600">
                    {users.filter(u => u.status === 'active').length}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">المحررين</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {users.filter(u => u.role === 'editor').length}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Edit className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">المدراء</p>
                  <p className="text-2xl font-bold text-red-600">
                    {users.filter(u => u.role === 'admin').length}
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* البحث والفلاتر */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="البحث في المستخدمين..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                  <option value="banned">محظور</option>
                </select>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">جميع الأدوار</option>
                  <option value="admin">مدير</option>
                  <option value="editor">محرر</option>
                  <option value="user">مستخدم</option>
                </select>

                <Button className="bg-blue-600 hover:bg-blue-700">
                  <UserPlus className="w-4 h-4 ml-2" />
                  مستخدم جديد
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* قائمة المستخدمين */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              قائمة المستخدمين ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">جاري تحميل المستخدمين...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{user.name}</h3>
                            {user.isVerified && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {user.phone}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              انضم في {new Date(user.joinDate).toLocaleDateString('ar-SA')}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <p className="text-sm font-semibold text-gray-900">{user.articlesCount}</p>
                          <p className="text-xs text-gray-600">مقال</p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm font-semibold text-gray-900">{user.commentsCount}</p>
                          <p className="text-xs text-gray-600">تعليق</p>
                        </div>

                        <Badge className={`${getRoleColor(user.role)} border`}>
                          {getRoleText(user.role)}
                        </Badge>

                        <Badge className={`${getStatusColor(user.status)} border`}>
                          {getStatusText(user.status)}
                        </Badge>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 ml-2" />
                              عرض الملف الشخصي
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 ml-2" />
                              تحرير المستخدم
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Settings className="w-4 h-4 ml-2" />
                              إدارة الصلاحيات
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.status === 'active' ? (
                              <DropdownMenuItem className="text-yellow-600">
                                <XCircle className="w-4 h-4 ml-2" />
                                إلغاء التفعيل
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="text-green-600">
                                <CheckCircle className="w-4 h-4 ml-2" />
                                تفعيل الحساب
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-red-600">
                              <Ban className="w-4 h-4 ml-2" />
                              حظر المستخدم
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 ml-2" />
                              حذف الحساب
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export const metadata = {
  title: 'إدارة المستخدمين - لوحة الإدارة',
  description: 'إدارة حسابات المستخدمين والصلاحيات'
};
