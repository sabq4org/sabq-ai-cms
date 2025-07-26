/**
 * صفحة مكافآت برنامج الولاء مع التصميم الحديث RTL
 */

'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Gift,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  Star,
  Calendar,
  Users,
  TrendingUp,
  Award,
  Coins,
  Package,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Reward {
  id: string;
  title: string;
  description: string;
  type: 'physical' | 'digital' | 'discount' | 'points';
  pointsCost: number;
  originalPrice?: number;
  discountPercent?: number;
  image?: string;
  status: 'active' | 'inactive' | 'outofstock';
  category: string;
  redeemedCount: number;
  availableQuantity?: number;
  validUntil?: string;
  createdAt: string;
}

export default function AdminLoyaltyRewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'outofstock'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'physical' | 'digital' | 'discount' | 'points'>('all');

  // بيانات وهمية للاختبار
  useEffect(() => {
    const mockRewards: Reward[] = [
      {
        id: '1',
        title: 'قسيمة خصم 50 ريال',
        description: 'قسيمة خصم بقيمة 50 ريال سعودي قابلة للاستخدام في جميع المتاجر الشريكة',
        type: 'discount',
        pointsCost: 500,
        originalPrice: 50,
        discountPercent: 10,
        status: 'active',
        category: 'خصومات',
        redeemedCount: 125,
        validUntil: '2024-12-31',
        createdAt: '2024-01-15'
      },
      {
        id: '2',
        title: 'سماعات لاسلكية',
        description: 'سماعات بلوتوث عالية الجودة مع تقنية إلغاء الضوضاء',
        type: 'physical',
        pointsCost: 2000,
        originalPrice: 299,
        status: 'active',
        category: 'إلكترونيات',
        redeemedCount: 45,
        availableQuantity: 15,
        createdAt: '2024-02-10'
      },
      {
        id: '3',
        title: 'اشتراك نتفليكس شهري',
        description: 'اشتراك مجاني لمدة شهر في منصة نتفليكس',
        type: 'digital',
        pointsCost: 800,
        originalPrice: 56,
        status: 'active',
        category: 'ترفيه',
        redeemedCount: 89,
        validUntil: '2024-11-30',
        createdAt: '2024-03-05'
      },
      {
        id: '4',
        title: 'نقاط إضافية مضاعفة',
        description: 'احصل على نقاط إضافية مضاعفة لمدة أسبوع كامل',
        type: 'points',
        pointsCost: 300,
        status: 'active',
        category: 'نقاط',
        redeemedCount: 234,
        validUntil: '2024-09-30',
        createdAt: '2024-01-20'
      },
      {
        id: '5',
        title: 'ساعة ذكية',
        description: 'ساعة ذكية متطورة مع مراقب اللياقة البدنية',
        type: 'physical',
        pointsCost: 5000,
        originalPrice: 899,
        status: 'outofstock',
        category: 'إلكترونيات',
        redeemedCount: 23,
        availableQuantity: 0,
        createdAt: '2024-02-28'
      }
    ];
    
    setTimeout(() => {
      setRewards(mockRewards);
      setLoading(false);
    }, 1000);
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'physical':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'digital':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'discount':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'points':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'outofstock':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'physical':
        return 'منتج مادي';
      case 'digital':
        return 'منتج رقمي';
      case 'discount':
        return 'خصم';
      case 'points':
        return 'نقاط';
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
      case 'outofstock':
        return 'نفدت الكمية';
      default:
        return 'غير محدد';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'physical':
        return <Package className="w-4 h-4" />;
      case 'digital':
        return <Star className="w-4 h-4" />;
      case 'discount':
        return <TrendingUp className="w-4 h-4" />;
      case 'points':
        return <Coins className="w-4 h-4" />;
      default:
        return <Gift className="w-4 h-4" />;
    }
  };

  const filteredRewards = rewards.filter(reward => {
    const matchesSearch = reward.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reward.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || reward.status === statusFilter;
    const matchesType = typeFilter === 'all' || reward.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalRewards = rewards.length;
  const activeRewards = rewards.filter(r => r.status === 'active').length;
  const totalRedeemed = rewards.reduce((sum, r) => sum + r.redeemedCount, 0);
  const totalPointsUsed = rewards.reduce((sum, r) => sum + (r.redeemedCount * r.pointsCost), 0);

  return (
    <DashboardLayout
      pageTitle="مكافآت برنامج الولاء"
      pageDescription="إدارة المكافآت والهدايا في برنامج الولاء"
    >
      <div className="space-y-6" dir="rtl">
        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">إجمالي المكافآت</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalRewards.toLocaleString()}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Gift className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">المكافآت النشطة</p>
                  <p className="text-2xl font-bold text-green-600">
                    {activeRewards}
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
                  <p className="text-sm text-gray-600 mb-1">إجمالي الاستبدالات</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {totalRedeemed.toLocaleString()}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">النقاط المستخدمة</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {totalPointsUsed.toLocaleString()}
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <Coins className="w-6 h-6 text-orange-600" />
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
                    placeholder="البحث في المكافآت..."
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
                  <option value="outofstock">نفدت الكمية</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">جميع الأنواع</option>
                  <option value="physical">منتج مادي</option>
                  <option value="digital">منتج رقمي</option>
                  <option value="discount">خصم</option>
                  <option value="points">نقاط</option>
                </select>

                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 ml-2" />
                  مكافأة جديدة
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* قائمة المكافآت */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              قائمة المكافآت ({filteredRewards.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">جاري تحميل المكافآت...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRewards.map((reward) => (
                  <div key={reward.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="space-y-4">
                      {/* رأس البطاقة */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${getTypeColor(reward.type)} border`}>
                            {getTypeIcon(reward.type)}
                          </div>
                          <div>
                            <Badge className={`${getTypeColor(reward.type)} border text-xs`}>
                              {getTypeText(reward.type)}
                            </Badge>
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
                              عرض التفاصيل
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 ml-2" />
                              تحرير المكافأة
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {reward.status === 'active' ? (
                              <DropdownMenuItem className="text-gray-600">
                                <XCircle className="w-4 h-4 ml-2" />
                                إلغاء التفعيل
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="text-green-600">
                                <CheckCircle className="w-4 h-4 ml-2" />
                                تفعيل المكافأة
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 ml-2" />
                              حذف المكافأة
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* محتوى البطاقة */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">{reward.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{reward.description}</p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1">
                            <Coins className="w-4 h-4 text-orange-500" />
                            <span className="font-bold text-orange-600">{reward.pointsCost.toLocaleString()}</span>
                            <span className="text-xs text-gray-500">نقطة</span>
                          </div>
                          
                          {reward.originalPrice && (
                            <div className="text-left">
                              <span className="text-sm font-semibold text-gray-900">
                                {reward.originalPrice} ر.س
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          <Badge className={`${getStatusColor(reward.status)} border text-xs`}>
                            {getStatusText(reward.status)}
                          </Badge>
                          
                          <div className="text-left">
                            <p className="text-xs text-gray-500">تم الاستبدال</p>
                            <p className="font-semibold text-sm">{reward.redeemedCount} مرة</p>
                          </div>
                        </div>

                        {/* معلومات إضافية */}
                        <div className="space-y-2 text-xs text-gray-600">
                          {reward.availableQuantity !== undefined && (
                            <div className="flex items-center justify-between">
                              <span>الكمية المتاحة:</span>
                              <span className={reward.availableQuantity === 0 ? 'text-red-600 font-semibold' : 'font-semibold'}>
                                {reward.availableQuantity}
                              </span>
                            </div>
                          )}
                          
                          {reward.validUntil && (
                            <div className="flex items-center justify-between">
                              <span>صالح حتى:</span>
                              <span className="font-semibold">
                                {new Date(reward.validUntil).toLocaleDateString('ar-SA')}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <span>التصنيف:</span>
                            <span className="font-semibold">{reward.category}</span>
                          </div>
                        </div>
                      </div>

                      {/* حالة التحذير للكمية */}
                      {reward.status === 'outofstock' && (
                        <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <span className="text-xs text-red-700">نفدت الكمية المتاحة</span>
                        </div>
                      )}
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
  title: 'مكافآت برنامج الولاء - لوحة الإدارة',
  description: 'إدارة المكافآت والهدايا في برنامج الولاء'
};
