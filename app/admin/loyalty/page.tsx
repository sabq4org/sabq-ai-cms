/**
 * صفحة برنامج الولاء الرئيسية مع التصميم الحديث RTL
 */

'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  Users,
  Star,
  TrendingUp,
  Gift,
  Target,
  Award,
  Calendar,
  BarChart3,
  Plus,
  Settings,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Crown,
  Zap,
  Sparkles
} from 'lucide-react';

interface LoyaltyStats {
  totalMembers: number;
  activeMembers: number;
  totalRewards: number;
  activeCampaigns: number;
  pointsDistributed: number;
  redemptions: number;
  memberGrowth: number;
  engagementRate: number;
}

export default function AdminLoyaltyPage() {
  const [stats, setStats] = useState<LoyaltyStats>({
    totalMembers: 0,
    activeMembers: 0,
    totalRewards: 0,
    activeCampaigns: 0,
    pointsDistributed: 0,
    redemptions: 0,
    memberGrowth: 0,
    engagementRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // بيانات وهمية للاختبار
    setTimeout(() => {
      setStats({
        totalMembers: 15420,
        activeMembers: 12350,
        totalRewards: 45,
        activeCampaigns: 8,
        pointsDistributed: 2850000,
        redemptions: 1240,
        memberGrowth: 12.5,
        engagementRate: 78.3
      });
      setLoading(false);
    }, 1000);
  }, []);

  const formatNumber = (num: number) => {
    return num.toLocaleString('ar-SA');
  };

  const StatsCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    bgColor,
    iconColor,
    trend,
    trendValue
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: any;
    bgColor: string;
    iconColor: string;
    trend?: 'up' | 'down';
    trendValue?: number;
  }) => (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          {trend && trendValue && (
            <div className={`flex items-center gap-1 text-sm font-medium ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend === 'up' ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {trendValue}%
            </div>
          )}
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {loading ? '...' : value}
          </p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout
      pageTitle="برنامج الولاء"
      pageDescription="نظرة عامة شاملة على برنامج الولاء والمكافآت"
    >
      <div className="space-y-6" dir="rtl">
        {/* ترحيب وإحصائيات سريعة */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Crown className="w-8 h-8" />
                برنامج الولاء المتطور
              </h2>
              <p className="text-purple-100 mb-4">
                نظام متكامل لمكافأة المستخدمين المخلصين وزيادة التفاعل
              </p>
              <div className="flex items-center gap-4">
                <Badge className="bg-white/20 text-white border-white/30">
                  <Sparkles className="w-3 h-3 ml-1" />
                  نشط الآن
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  <Zap className="w-3 h-3 ml-1" />
                  {stats.activeCampaigns} حملة فعالة
                </Badge>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
                <Heart className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* الإحصائيات الرئيسية */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="إجمالي الأعضاء"
            value={formatNumber(stats.totalMembers)}
            subtitle="عضو مسجل"
            icon={Users}
            bgColor="bg-blue-100"
            iconColor="text-blue-600"
            trend="up"
            trendValue={stats.memberGrowth}
          />
          
          <StatsCard
            title="الأعضاء النشطين"
            value={formatNumber(stats.activeMembers)}
            subtitle="عضو نشط هذا الشهر"
            icon={Target}
            bgColor="bg-green-100"
            iconColor="text-green-600"
            trend="up"
            trendValue={8.2}
          />
          
          <StatsCard
            title="إجمالي المكافآت"
            value={stats.totalRewards}
            subtitle="مكافأة متاحة"
            icon={Gift}
            bgColor="bg-purple-100"
            iconColor="text-purple-600"
          />
          
          <StatsCard
            title="النقاط الموزعة"
            value={formatNumber(stats.pointsDistributed)}
            subtitle="نقطة هذا الشهر"
            icon={Star}
            bgColor="bg-yellow-100"
            iconColor="text-yellow-600"
            trend="up"
            trendValue={15.7}
          />
        </div>

        {/* إحصائيات إضافية */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-600" />
                عمليات الاستبدال
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600 mb-1">
                  {formatNumber(stats.redemptions)}
                </p>
                <p className="text-sm text-gray-600">عملية استبدال هذا الشهر</p>
                <div className="flex items-center justify-center gap-1 mt-2 text-green-600">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm font-medium">+22.5%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                معدل المشاركة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600 mb-1">
                  {stats.engagementRate}%
                </p>
                <p className="text-sm text-gray-600">من الأعضاء النشطين</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${stats.engagementRate}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                الحملات النشطة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600 mb-1">
                  {stats.activeCampaigns}
                </p>
                <p className="text-sm text-gray-600">حملة جارية</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 w-full"
                >
                  <Eye className="w-4 h-4 ml-2" />
                  عرض الحملات
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* إجراءات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button className="h-16 bg-blue-600 hover:bg-blue-700 text-white">
            <div className="flex flex-col items-center gap-1">
              <Users className="w-5 h-5" />
              <span className="text-sm">إدارة الأعضاء</span>
            </div>
          </Button>
          
          <Button className="h-16 bg-purple-600 hover:bg-purple-700 text-white">
            <div className="flex flex-col items-center gap-1">
              <Gift className="w-5 h-5" />
              <span className="text-sm">إدارة المكافآت</span>
            </div>
          </Button>
          
          <Button className="h-16 bg-green-600 hover:bg-green-700 text-white">
            <div className="flex flex-col items-center gap-1">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm">إدارة الحملات</span>
            </div>
          </Button>
          
          <Button className="h-16 bg-orange-600 hover:bg-orange-700 text-white">
            <div className="flex flex-col items-center gap-1">
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm">التقارير والتحليلات</span>
            </div>
          </Button>
        </div>

        {/* آخر الأنشطة */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-600" />
                  آخر عمليات الاستبدال
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4 ml-2" />
                  عرض الكل
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'أحمد محمد', reward: 'قسيمة خصم 50 ريال', points: 500, time: '5 دقائق' },
                  { name: 'فاطمة علي', reward: 'اشتراك شهري مجاني', points: 1000, time: '15 دقيقة' },
                  { name: 'محمد أحمد', reward: 'كتاب إلكتروني', points: 200, time: '30 دقيقة' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.reward}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-blue-600">{item.points} نقطة</p>
                      <p className="text-xs text-gray-500">منذ {item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  أفضل الأعضاء
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4 ml-2" />
                  عرض الكل
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'سارة أحمد', points: 15420, level: 'ذهبي', badge: '👑' },
                  { name: 'عبدالله محمد', points: 12350, level: 'فضي', badge: '🥈' },
                  { name: 'نور فاطمة', points: 9870, level: 'برونزي', badge: '🥉' }
                ].map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{member.badge}</span>
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-600">مستوى {member.level}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-purple-600">
                        {formatNumber(member.points)} نقطة
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
