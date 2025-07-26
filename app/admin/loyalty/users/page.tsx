/**
 * صفحة مستخدمي برنامج الولاء مع التصميم الحديث RTL
 */

'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  Star,
  Gift,
  TrendingUp,
  Award,
  Crown,
  Eye,
  Settings
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LoyaltyUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  points: number;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  joinDate: string;
  lastActivity: string;
  totalEarned: number;
  totalRedeemed: number;
  referrals: number;
  status: 'active' | 'inactive' | 'suspended';
}

export default function AdminLoyaltyUsersPage() {
  const [users, setUsers] = useState<LoyaltyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | 'bronze' | 'silver' | 'gold' | 'platinum'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');

  useEffect(() => {
    // بيانات وهمية للاختبار
    const mockUsers: LoyaltyUser[] = [
      {
        id: '1',
        name: 'أحمد محمد الأحمد',
        email: 'ahmed@example.com',
        phone: '+966501234567',
        avatar: '',
        points: 15420,
        level: 'gold',
        joinDate: '2023-01-15',
        lastActivity: '2024-07-26',
        totalEarned: 25420,
        totalRedeemed: 10000,
        referrals: 8,
        status: 'active'
      },
      {
        id: '2',
        name: 'فاطمة علي السالم',
        email: 'fatima@example.com',
        phone: '+966501234568',
        avatar: '',
        points: 12350,
        level: 'silver',
        joinDate: '2023-03-20',
        lastActivity: '2024-07-25',
        totalEarned: 18350,
        totalRedeemed: 6000,
        referrals: 5,
        status: 'active'
      },
      {
        id: '3',
        name: 'محمد عبدالله النجار',
        email: 'mohammed@example.com',
        phone: '+966501234569',
        avatar: '',
        points: 8750,
        level: 'bronze',
        joinDate: '2023-06-10',
        lastActivity: '2024-07-20',
        totalEarned: 12750,
        totalRedeemed: 4000,
        referrals: 2,
        status: 'active'
      },
      {
        id: '4',
        name: 'سارة أحمد المطيري',
        email: 'sara@example.com',
        phone: '+966501234570',
        avatar: '',
        points: 28900,
        level: 'platinum',
        joinDate: '2022-11-05',
        lastActivity: '2024-07-26',
        totalEarned: 45900,
        totalRedeemed: 17000,
        referrals: 15,
        status: 'active'
      }
    ];
    
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'platinum':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'gold':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'silver':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'bronze':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'platinum':
        return 'بلاتيني';
      case 'gold':
        return 'ذهبي';
      case 'silver':
        return 'فضي';
      case 'bronze':
        return 'برونزي';
      default:
        return 'غير محدد';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'platinum':
        return '💎';
      case 'gold':
        return '👑';
      case 'silver':
        return '🥈';
      case 'bronze':
        return '🥉';
      default:
        return '⭐';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'suspended':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'inactive':
        return 'غير نشط';
      case 'suspended':
        return 'معلق';
      default:
        return 'غير محدد';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'all' || user.level === levelFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesLevel && matchesStatus;
  });

  return (
    <DashboardLayout
      pageTitle="مستخدمو برنامج الولاء"
      pageDescription="إدارة المستخدمين المشتركين في برنامج الولاء"
    >
      <div className="space-y-6" dir="rtl">
        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">إجمالي الأعضاء</p>
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
                  <p className="text-sm text-gray-600 mb-1">أعضاء ذهبيون</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {users.filter(u => u.level === 'gold').length}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Crown className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">أعضاء بلاتينيون</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {users.filter(u => u.level === 'platinum').length}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">إجمالي النقاط</p>
                  <p className="text-2xl font-bold text-green-600">
                    {users.reduce((total, user) => total + user.points, 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Star className="w-6 h-6 text-green-600" />
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
                    placeholder="البحث في الأعضاء..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">جميع المستويات</option>
                  <option value="platinum">بلاتيني</option>
                  <option value="gold">ذهبي</option>
                  <option value="silver">فضي</option>
                  <option value="bronze">برونزي</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                  <option value="suspended">معلق</option>
                </select>

                <Button className="bg-blue-600 hover:bg-blue-700">
                  <UserPlus className="w-4 h-4 ml-2" />
                  إضافة عضو
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
              أعضاء برنامج الولاء ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">جاري تحميل الأعضاء...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Avatar className="w-16 h-16">
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                              {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-1 -right-1 text-lg">
                            {getLevelIcon(user.level)}
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900 text-lg">{user.name}</h3>
                            <Badge className={`${getLevelColor(user.level)} border`}>
                              {getLevelText(user.level)}
                            </Badge>
                            <Badge className={`${getStatusColor(user.status)} border`}>
                              {getStatusText(user.status)}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
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
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              آخر نشاط: {new Date(user.lastActivity).toLocaleDateString('ar-SA')}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        {/* إحصائيات العضو */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                          <div>
                            <p className="text-lg font-bold text-blue-600">{user.points.toLocaleString()}</p>
                            <p className="text-xs text-gray-600">النقاط الحالية</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-green-600">{user.totalEarned.toLocaleString()}</p>
                            <p className="text-xs text-gray-600">إجمالي المكتسب</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-purple-600">{user.totalRedeemed.toLocaleString()}</p>
                            <p className="text-xs text-gray-600">إجمالي المستبدل</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-orange-600">{user.referrals}</p>
                            <p className="text-xs text-gray-600">الإحالات</p>
                          </div>
                        </div>

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
                              تحرير النقاط
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Gift className="w-4 h-4 ml-2" />
                              إرسال مكافأة
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Settings className="w-4 h-4 ml-2" />
                              إعدادات العضوية
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 ml-2" />
                              إزالة من البرنامج
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
  title: 'مستخدمو برنامج الولاء - لوحة الإدارة',
  description: 'إدارة المستخدمين المشتركين في برنامج الولاء'
};
