/**
 * صفحة إدارة المستخدمين الحديثة - التصميم الاحترافي
 * Modern Users Management Page - Professional Design
 */

'use client';

import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import { DesignComponents } from '@/components/design-system/DesignSystemGuide';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
    Activity,
    ArrowUpRight,
    Calendar,
    Crown,
    Download,
    Edit,
    Eye,
    Filter,
    Phone,
    Plus,
    Search,
    Settings,
    Shield,
    Sparkles,
    User,
    UserCheck,
    Users
} from 'lucide-react';
import { useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'editor' | 'author' | 'subscriber';
  status: 'active' | 'inactive' | 'suspended';
  joinDate: Date;
  lastLogin: Date;
  articlesCount: number;
  avatar?: string;
  verified: boolean;
}

const usersData: User[] = [
  {
    id: '1',
    name: 'أحمد محمد علي',
    email: 'ahmed@sabq.com',
    phone: '+966501234567',
    role: 'admin',
    status: 'active',
    joinDate: new Date('2023-01-15'),
    lastLogin: new Date(Date.now() - 1000 * 60 * 30),
    articlesCount: 45,
    verified: true
  },
  {
    id: '2',
    name: 'سارة أحمد الحسن',
    email: 'sara@sabq.com',
    phone: '+966507654321',
    role: 'editor',
    status: 'active',
    joinDate: new Date('2023-02-10'),
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2),
    articlesCount: 38,
    verified: true
  },
  {
    id: '3',
    name: 'محمد علي السالم',
    email: 'mohamed@sabq.com',
    phone: '+966509876543',
    role: 'author',
    status: 'active',
    joinDate: new Date('2023-03-05'),
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24),
    articlesCount: 28,
    verified: true
  },
  {
    id: '4',
    name: 'فاطمة سالم أحمد',
    email: 'fatima@sabq.com',
    role: 'author',
    status: 'inactive',
    joinDate: new Date('2023-04-12'),
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    articlesCount: 15,
    verified: false
  },
  {
    id: '5',
    name: 'عبدالله خالد',
    email: 'abdullah@example.com',
    role: 'subscriber',
    status: 'suspended',
    joinDate: new Date('2023-05-20'),
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    articlesCount: 0,
    verified: false
  }
];

export default function ModernUsersNew() {
  const [selectedTab, setSelectedTab] = useState('all');

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}ك`;
    return num.toString();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'red';
      case 'editor': return 'blue';
      case 'author': return 'green';
      case 'subscriber': return 'gray';
      default: return 'gray';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'مدير';
      case 'editor': return 'محرر';
      case 'author': return 'كاتب';
      case 'subscriber': return 'مشترك';
      default: return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Crown;
      case 'editor': return Shield;
      case 'author': return Edit;
      case 'subscriber': return User;
      default: return User;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'suspended': return 'destructive';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'inactive': return 'غير نشط';
      case 'suspended': return 'معلق';
      default: return status;
    }
  };

  const getUserStats = () => {
    const total = usersData.length;
    const active = usersData.filter(user => user.status === 'active').length;
    const admins = usersData.filter(user => user.role === 'admin').length;
    const verified = usersData.filter(user => user.verified).length;

    return { total, active, admins, verified };
  };

  const stats = getUserStats();

  const statsCards = [
    {
      title: 'إجمالي المستخدمين',
      value: stats.total.toString(),
      icon: Users,
      change: '+3',
      changeType: 'increase' as const,
      color: 'blue'
    },
    {
      title: 'المستخدمين النشطين',
      value: stats.active.toString(),
      icon: UserCheck,
      change: '+2',
      changeType: 'increase' as const,
      color: 'green'
    },
    {
      title: 'المدراء',
      value: stats.admins.toString(),
      icon: Crown,
      change: '0',
      changeType: 'increase' as const,
      color: 'red'
    },
    {
      title: 'المحققين',
      value: stats.verified.toString(),
      icon: Shield,
      change: '+1',
      changeType: 'increase' as const,
      color: 'purple'
    }
  ];

  const filteredUsers = selectedTab === 'all'
    ? usersData
    : usersData.filter(user =>
        selectedTab === 'active' ? user.status === 'active' :
        selectedTab === 'admins' ? user.role === 'admin' :
        selectedTab === 'verified' ? user.verified :
        false
      );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days} يوم`;
    if (hours > 0) return `${hours} ساعة`;
    if (minutes > 0) return `${minutes} دقيقة`;
    return 'الآن';
  };

  return (
    <DashboardLayout
      pageTitle="إدارة المستخدمين"
      pageDescription="إدارة المستخدمين والصلاحيات"
    >
      <div className="space-y-8">
        {/* رسالة الترحيب الاحترافية */}
        <DesignComponents.StandardCard className="p-6 bg-gradient-to-l from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                إدارة المستخدمين
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                إدارة شاملة للمستخدمين والأدوار والصلاحيات
              </p>
              <div className="flex gap-3">
                <DesignComponents.StatusIndicator
                  status="success"
                  text={`${stats.active} مستخدم نشط`}
                />
                <DesignComponents.StatusIndicator
                  status="info"
                  text={`${stats.verified} محقق`}
                />
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">آخر تحديث</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </DesignComponents.StandardCard>

        {/* الإحصائيات الرئيسية */}
        <div>
          <DesignComponents.SectionHeader
            title="إحصائيات المستخدمين"
            description="نظرة سريعة على المستخدمين والأدوار"
            action={
              <DesignComponents.ActionBar>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 ml-2" />
                  تصفية
                </Button>
                <Button size="sm">
                  <Plus className="w-4 h-4 ml-2" />
                  مستخدم جديد
                </Button>
              </DesignComponents.ActionBar>
            }
          />

          <DesignComponents.DynamicGrid minItemWidth="280px" className="mb-8">
            {statsCards.map((stat, index) => {
              const Icon = stat.icon;
              const ChangeIcon = ArrowUpRight;
              return (
                <DesignComponents.StandardCard key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.title}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {stat.value}
                        </p>
                        {stat.change !== '0' && (
                          <div className="flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400">
                            <ChangeIcon className="w-3 h-3" />
                            {stat.change}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center",
                      stat.color === 'blue' && "bg-blue-100 dark:bg-blue-900/30",
                      stat.color === 'green' && "bg-green-100 dark:bg-green-900/30",
                      stat.color === 'red' && "bg-red-100 dark:bg-red-900/30",
                      stat.color === 'purple' && "bg-purple-100 dark:bg-purple-900/30"
                    )}>
                      <Icon className={cn(
                        "w-6 h-6",
                        stat.color === 'blue' && "text-blue-600 dark:text-blue-400",
                        stat.color === 'green' && "text-green-600 dark:text-green-400",
                        stat.color === 'red' && "text-red-600 dark:text-red-400",
                        stat.color === 'purple' && "text-purple-600 dark:text-purple-400"
                      )} />
                    </div>
                  </div>
                </DesignComponents.StandardCard>
              );
            })}
          </DesignComponents.DynamicGrid>
        </div>

        {/* التبويبات والمستخدمين */}
        <div>
          <DesignComponents.SectionHeader
            title="قائمة المستخدمين"
            description="جميع المستخدمين المسجلين في النظام"
            action={
              <DesignComponents.ActionBar>
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4 ml-2" />
                  بحث
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 ml-2" />
                  تصدير
                </Button>
              </DesignComponents.ActionBar>
            }
          />

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">الكل ({usersData.length})</TabsTrigger>
              <TabsTrigger value="active">النشطين ({stats.active})</TabsTrigger>
              <TabsTrigger value="admins">المدراء ({stats.admins})</TabsTrigger>
              <TabsTrigger value="verified">المحققين ({stats.verified})</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="space-y-4">
              <DesignComponents.DynamicGrid minItemWidth="400px">
                {filteredUsers.map((user) => {
                  const RoleIcon = getRoleIcon(user.role);
                  return (
                    <DesignComponents.StandardCard key={user.id} className="p-6 hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                {user.name}
                              </h3>
                              {user.verified && (
                                <Shield className="w-4 h-4 text-blue-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <DesignComponents.ActionBar>
                          <button className="text-gray-400 hover:text-blue-600 p-1">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-gray-400 hover:text-green-600 p-1">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-gray-400 hover:text-red-600 p-1">
                            <Settings className="w-4 h-4" />
                          </button>
                        </DesignComponents.ActionBar>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <Badge
                          variant={getStatusColor(user.status) as any}
                          className="text-xs"
                        >
                          {getStatusText(user.status)}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs flex items-center gap-1",
                            getRoleColor(user.role) === 'red' && "border-red-200 text-red-700 bg-red-50",
                            getRoleColor(user.role) === 'blue' && "border-blue-200 text-blue-700 bg-blue-50",
                            getRoleColor(user.role) === 'green' && "border-green-200 text-green-700 bg-green-50",
                            getRoleColor(user.role) === 'gray' && "border-gray-200 text-gray-700 bg-gray-50"
                          )}
                        >
                          <RoleIcon className="w-3 h-3" />
                          {getRoleText(user.role)}
                        </Badge>
                      </div>

                      {user.phone && (
                        <div className="flex items-center gap-2 mb-3 text-sm text-gray-600 dark:text-gray-400">
                          <Phone className="w-4 h-4" />
                          <span>{user.phone}</span>
                        </div>
                      )}

                      <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>انضم في: {user.joinDate.toLocaleDateString('ar-SA')}</span>
                          </div>
                          {user.articlesCount > 0 && (
                            <div className="flex items-center gap-1">
                              <Edit className="w-4 h-4" />
                              <span>{user.articlesCount} مقال</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t dark:border-gray-700">
                          <div className="flex items-center gap-1">
                            <Activity className="w-4 h-4" />
                            <span>آخر نشاط: {getTimeAgo(user.lastLogin)}</span>
                          </div>
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            user.status === 'active' ? "bg-green-500" :
                            user.status === 'inactive' ? "bg-yellow-500" : "bg-red-500"
                          )} />
                        </div>
                      </div>
                    </DesignComponents.StandardCard>
                  );
                })}
              </DesignComponents.DynamicGrid>
            </TabsContent>
          </Tabs>
        </div>

        {/* رسالة النجاح */}
        <DesignComponents.StandardCard className="p-6 bg-gradient-to-l from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                فريق متميز ومنظم!
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                مجتمع نشط من المستخدمين والكتاب بأدوار وصلاحيات محددة
              </p>
            </div>
            <DesignComponents.StatusIndicator status="success" text="فريق متكامل" />
          </div>
        </DesignComponents.StandardCard>
      </div>
    </DashboardLayout>
  );
}
