/**
 * صفحة إدارة المستخدمين - التصميم الاحترافي المحسن
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
  Star,
  SortDesc,
  Clock,
  Activity,
  Sparkles,
  Target,
  Award,
  Lightbulb,
  HelpCircle,
  Copy,
  Archive,
  RefreshCw,
  ExternalLink,
  Bookmark,
  Share2,
  Download,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  FileText,
  TrendingUp,
  BarChart3,
  Globe,
  Zap,
  UserCheck,
  UserX,
  ShieldCheck,
  Hash,
  Key,
  Lock,
  Unlock
} from 'lucide-react';
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
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

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
  const { darkMode } = useDarkModeContext();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'banned'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'editor' | 'user'>('all');
  const [sortBy, setSortBy] = useState('joinDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
      },
      {
        id: '4',
        name: 'سارة أحمد القحطاني',
        email: 'sara@example.com',
        phone: '+966501234570',
        avatar: '',
        role: 'editor',
        status: 'inactive',
        joinDate: '2023-02-28',
        lastLogin: '2024-06-15',
        articlesCount: 32,
        commentsCount: 150,
        isVerified: true
      },
      {
        id: '5',
        name: 'خالد سعد المالكي',
        email: 'khalid@example.com',
        role: 'user',
        status: 'banned',
        joinDate: '2023-08-10',
        lastLogin: '2024-03-20',
        articlesCount: 0,
        commentsCount: 200,
        isVerified: false
      }
    ];
    
    setTimeout(() => {
      setUsers(mockUsers);
      setTotalPages(Math.ceil(mockUsers.length / 10));
      setLoading(false);
    }, 1000);
  }, []);

  // حساب الإحصائيات
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    banned: users.filter(u => u.status === 'banned').length,
    admins: users.filter(u => u.role === 'admin').length,
    editors: users.filter(u => u.role === 'editor').length,
    verified: users.filter(u => u.isVerified).length,
    recentlyActive: users.filter(u => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      return u.lastLogin && new Date(u.lastLogin) > threeDaysAgo;
    }).length
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700';
      case 'editor':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700';
      case 'user':
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700';
      case 'inactive':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700';
      case 'banned':
        return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
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

  // معالجات الإجراءات
  const handleDeleteUser = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    
    try {
      // محاكاة حذف المستخدم
      setUsers(users.filter(u => u.id !== id));
      toast.success('تم حذف المستخدم بنجاح');
    } catch (error) {
      toast.error('فشل في حذف المستخدم');
    }
  };

  const handleBanUser = async (id: string) => {
    try {
      setUsers(users.map(u => 
        u.id === id ? { ...u, status: 'banned' as const } : u
      ));
      toast.success('تم حظر المستخدم بنجاح');
    } catch (error) {
      toast.error('فشل في حظر المستخدم');
    }
  };

  const handleActivateUser = async (id: string) => {
    try {
      setUsers(users.map(u => 
        u.id === id ? { ...u, status: 'active' as const } : u
      ));
      toast.success('تم تفعيل المستخدم بنجاح');
    } catch (error) {
      toast.error('فشل في تفعيل المستخدم');
    }
  };

  // فلترة وترتيب المستخدمين
  const filteredUsers = users
    .filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    })
    .sort((a, b) => {
      let compareValue = 0;
      switch (sortBy) {
        case 'name':
          compareValue = a.name.localeCompare(b.name);
          break;
        case 'articlesCount':
          compareValue = b.articlesCount - a.articlesCount;
          break;
        case 'lastLogin':
          compareValue = new Date(b.lastLogin || 0).getTime() - new Date(a.lastLogin || 0).getTime();
          break;
        default:
          compareValue = new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
      }
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

  // مكون بطاقة الإحصائية
  const StatsCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    bgColor,
    iconColor
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: any;
    bgColor: string;
    iconColor: string;
  }) => (
    <div className={`rounded-2xl p-4 sm:p-6 shadow-sm border transition-all duration-300 hover:shadow-md ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-100'
    }`}>
      <div className="flex items-center gap-3 sm:gap-4">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${bgColor} rounded-full flex items-center justify-center`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`} />
        </div>
        <div className="flex-1">
          <p className={`text-xs sm:text-sm mb-1 transition-colors duration-300 ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>{title}</p>
          <div className="flex items-baseline gap-1 sm:gap-2">
            <span className={`text-lg sm:text-2xl font-bold transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>{loading ? '...' : value}</span>
            <span className={`text-xs sm:text-sm transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>{subtitle}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout
      pageTitle="إدارة المستخدمين"
      pageDescription="إدارة شاملة للمستخدمين والصلاحيات"
    >
      <div className={`transition-colors duration-300 ${
        darkMode ? 'bg-gray-900' : ''
      }`}>
        {/* عنوان وتعريف الصفحة المحسن */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className={`text-2xl sm:text-3xl font-bold mb-2 transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                👥 إدارة المستخدمين المتقدمة
              </h1>
              <p className={`text-sm sm:text-base transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                إدارة وتحكم شامل في المستخدمين والصلاحيات
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700">
                <Users className="w-3 h-3 mr-1" />
                {stats.total} مستخدم
              </Badge>
              <Badge variant="outline" className={darkMode ? 'border-gray-600' : ''}>
                <CheckCircle className="w-3 h-3 mr-1" />
                {stats.active} نشط
              </Badge>
            </div>
          </div>
          
          {/* شريط المؤشرات السريعة */}
          <div className={`rounded-xl p-3 border ${
            darkMode 
              ? 'bg-gray-800/50 border-gray-700' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <UserCheck className={`w-4 h-4 ${stats.active > 0 ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {stats.active} نشط
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheck className={`w-4 h-4 ${stats.verified > 0 ? 'text-blue-500' : 'text-gray-400'}`} />
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {stats.verified} موثق
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className={`w-4 h-4 ${stats.recentlyActive > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {stats.recentlyActive} نشط مؤخراً
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/admin/users/permissions')}
                  className={`${darkMode ? 'border-gray-600 hover:bg-gray-700' : ''}`}
                >
                  <Shield className="h-4 w-4 ml-2" />
                  الصلاحيات
                </Button>
                <Button
                  onClick={() => router.push('/admin/users/create')}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg"
                >
                  <UserPlus className="h-4 w-4 ml-2" />
                  مستخدم جديد
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* بطاقات الإحصائيات المحسنة */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <StatsCard
            title="إجمالي المستخدمين"
            value={stats.total}
            subtitle="مستخدم"
            icon={Users}
            bgColor="bg-gradient-to-br from-blue-100 to-blue-200"
            iconColor="text-blue-600"
          />
          <StatsCard
            title="نشط"
            value={stats.active}
            subtitle="مستخدم فعال"
            icon={UserCheck}
            bgColor="bg-gradient-to-br from-green-100 to-green-200"
            iconColor="text-green-600"
          />
          <StatsCard
            title="محظور"
            value={stats.banned}
            subtitle="مستخدم"
            icon={UserX}
            bgColor="bg-gradient-to-br from-red-100 to-red-200"
            iconColor="text-red-600"
          />
          <StatsCard
            title="مدراء"
            value={stats.admins}
            subtitle="مدير نظام"
            icon={Shield}
            bgColor="bg-gradient-to-br from-purple-100 to-purple-200"
            iconColor="text-purple-600"
          />
          <StatsCard
            title="محررين"
            value={stats.editors}
            subtitle="محرر محتوى"
            icon={Edit}
            bgColor="bg-gradient-to-br from-orange-100 to-orange-200"
            iconColor="text-orange-600"
          />
          <StatsCard
            title="موثق"
            value={stats.verified}
            subtitle="حساب موثق"
            icon={ShieldCheck}
            bgColor="bg-gradient-to-br from-indigo-100 to-indigo-200"
            iconColor="text-indigo-600"
          />
        </div>

        {/* الفلاتر والبحث المحسن */}
        <div className={`rounded-2xl p-4 sm:p-6 shadow-sm border mb-6 transition-colors duration-300 ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-100'
        }`}>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="🔍 البحث في المستخدمين..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pr-10 ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={`${darkMode ? 'border-gray-600 hover:bg-gray-700' : ''} ${
                  showFilters ? 'bg-blue-50 border-blue-300' : ''
                }`}
              >
                <Filter className="h-4 w-4 ml-2" />
                فلاتر {showFilters ? '🔽' : '🔼'}
              </Button>
              
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className={`px-3 py-1 text-sm rounded-md border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                }`}
              >
                <option value="all">📋 جميع الحالات</option>
                <option value="active">✅ نشط</option>
                <option value="inactive">⏸️ غير نشط</option>
                <option value="banned">🚫 محظور</option>
              </select>
              
              <select 
                value={roleFilter} 
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className={`px-3 py-1 text-sm rounded-md border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                }`}
              >
                <option value="all">👥 جميع الأدوار</option>
                <option value="admin">🛡️ مدير</option>
                <option value="editor">✏️ محرر</option>
                <option value="user">👤 مستخدم</option>
              </select>
              
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-3 py-1 text-sm rounded-md border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                }`}
              >
                <option value="joinDate">📅 تاريخ الانضمام</option>
                <option value="name">🔤 الاسم</option>
                <option value="articlesCount">📰 عدد المقالات</option>
                <option value="lastLogin">🕒 آخر دخول</option>
              </select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className={`${darkMode ? 'border-gray-600 hover:bg-gray-700' : ''}`}
              >
                <SortDesc className={`h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''} transition-transform`} />
              </Button>
            </div>
          </div>
        </div>

        {/* جدول المستخدمين المحسن */}
        <div className={`rounded-2xl shadow-lg border overflow-hidden transition-colors duration-300 ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-100'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${darkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100'}`}>
                  <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    👤 المستخدم
                  </th>
                  <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    📧 التواصل
                  </th>
                  <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    🛡️ الدور
                  </th>
                  <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    📊 الحالة
                  </th>
                  <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    📈 النشاط
                  </th>
                  <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    📅 تاريخ الانضمام
                  </th>
                  <th className={`px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    ⚙️ الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          جاري تحميل المستخدمين...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="w-16 h-16 text-gray-300 mb-4" />
                        <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          لا يوجد مستخدمون
                        </h3>
                        <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          ابدأ بإضافة أول مستخدم
                        </p>
                        <Button 
                          onClick={() => router.push('/admin/users/create')}
                          className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
                        >
                          <UserPlus className="h-4 w-4 ml-2" />
                          إضافة مستخدم
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className={`transition-all duration-200 hover:scale-[1.01] ${
                      darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-blue-50/50'
                    }`}>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className={`font-semibold text-sm ${
                              darkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {user.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              {user.isVerified && (
                                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  موثق
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {user.email}
                            </span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className={`w-3 h-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {user.phone}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <Badge className={`${getRoleColor(user.role)}`}>
                          {user.role === 'admin' ? '🛡️' : user.role === 'editor' ? '✏️' : '👤'} {getRoleText(user.role)}
                        </Badge>
                      </td>
                      <td className="px-6 py-5">
                        <Badge className={`${getStatusColor(user.status)}`}>
                          {user.status === 'active' ? '✅' : user.status === 'inactive' ? '⏸️' : '🚫'} {getStatusText(user.status)}
                        </Badge>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <FileText className={`w-3 h-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                              <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {user.articlesCount}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageSquare className={`w-3 h-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                              <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {user.commentsCount}
                              </span>
                            </div>
                          </div>
                          {user.lastLogin && (
                            <div className="flex items-center gap-1">
                              <Clock className={`w-3 h-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                آخر دخول: {new Date(user.lastLogin).toLocaleDateString('ar-SA')}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => router.push(`/admin/users/${user.id}`)}
                                  className={`hover:bg-blue-100 dark:hover:bg-blue-900/20`}
                                >
                                  <Eye className="h-4 w-4 text-blue-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>👁️ عرض التفاصيل</p>
                              </TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => router.push(`/admin/users/${user.id}/edit`)}
                                  className={`hover:bg-purple-100 dark:hover:bg-purple-900/20`}
                                >
                                  <Edit className="h-4 w-4 text-purple-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>✏️ تحرير</p>
                              </TooltipContent>
                            </Tooltip>
                            
                            <DropdownMenu>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <DropdownMenuTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className={`hover:bg-gray-100 dark:hover:bg-gray-700`}
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>⚙️ المزيد</p>
                                </TooltipContent>
                              </Tooltip>
                              <DropdownMenuContent align="end">
                                {user.status === 'banned' ? (
                                  <DropdownMenuItem
                                    onClick={() => handleActivateUser(user.id)}
                                  >
                                    <Unlock className="h-4 w-4 ml-2 text-green-600" />
                                    <span>✅ إلغاء الحظر</span>
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => handleBanUser(user.id)}
                                  >
                                    <Ban className="h-4 w-4 ml-2 text-orange-600" />
                                    <span>🚫 حظر المستخدم</span>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => toast('قريباً: إعادة تعيين كلمة المرور', { icon: '🔑' })}
                                >
                                  <Key className="h-4 w-4 ml-2 text-blue-600" />
                                  <span>🔑 إعادة تعيين كلمة المرور</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => toast('قريباً: سجل النشاط', { icon: '📊' })}
                                >
                                  <Activity className="h-4 w-4 ml-2 text-purple-600" />
                                  <span>📊 سجل النشاط</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4 ml-2" />
                                  <span>🗑️ حذف المستخدم</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TooltipProvider>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
