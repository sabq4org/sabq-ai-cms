/**
 * صفحة إدارة التنبيهات
 * Notifications Management Page
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// تم إزالة DashboardLayout - تستخدم الصفحة layout.tsx الأساسي
import {
  Bell,
  Plus,
  Search,
  Settings,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  targetUsers: string[];
}

const notificationsData: Notification[] = [
  {
    id: '1',
    title: 'تحديث النظام',
    message: 'تم تطبيق تحديث جديد على منصة سبق الذكية',
    type: 'info',
    isRead: false,
    priority: 'medium',
    createdAt: '2024-01-26T10:30:00Z',
    targetUsers: ['جميع المستخدمين']
  },
  {
    id: '2',
    title: 'مقال جديد منشور',
    message: 'تم نشر مقال جديد في قسم الاقتصاد',
    type: 'success',
    isRead: true,
    priority: 'low',
    createdAt: '2024-01-26T09:15:00Z',
    targetUsers: ['المحررين']
  },
  {
    id: '3',
    title: 'تحذير أمني',
    message: 'محاولة دخول غير مصرح بها من IP غريب',
    type: 'warning',
    priority: 'high',
    isRead: false,
    createdAt: '2024-01-26T08:45:00Z',
    targetUsers: ['الإدارة']
  }
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(notificationsData);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'error': return AlertCircle;
      default: return Info;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-blue-500';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge variant="destructive">عالية</Badge>;
      case 'medium': return <Badge variant="default">متوسطة</Badge>;
      case 'low': return <Badge variant="secondary">منخفضة</Badge>;
      default: return <Badge variant="outline">عادية</Badge>;
    }
  };

  return (
    <>
      <link rel="stylesheet" href="/manus-ui.css" />
      <div className="p-6 space-y-6">
        {/* رسالة الترحيب */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                <Bell className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-1">إدارة الإشعارات 🔔</h2>
                <p className="text-blue-100 text-lg">
                  إدارة وإرسال الإشعارات للمستخدمين
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-100 mb-1">إجمالي الإشعارات</div>
              <div className="text-lg font-semibold">{notifications.length} إشعار</div>
            </div>
          </div>
        </div>

        {/* شريط الأدوات العلوي */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              تنبيه جديد
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              إعدادات التنبيهات
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="البحث في التنبيهات..."
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
            { title: 'إجمالي التنبيهات', value: notifications.length.toString(), icon: Bell },
            { title: 'غير مقروءة', value: notifications.filter(n => !n.isRead).length.toString(), icon: Eye },
            { title: 'عالية الأولوية', value: notifications.filter(n => n.priority === 'high').length.toString(), icon: AlertCircle },
            { title: 'اليوم', value: '3', icon: Clock }
          ].map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* قائمة التنبيهات */}
        <div className="space-y-4">
          {filteredNotifications.map((notification) => {
            const TypeIcon = getTypeIcon(notification.type);
            return (
              <Card key={notification.id} className={`hover:shadow-lg transition-all duration-200 ${!notification.isRead ? 'border-l-4 border-l-blue-500' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 ${getTypeColor(notification.type)}`}>
                        <TypeIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{notification.title}</h3>
                          {!notification.isRead && (
                            <Badge variant="secondary" className="text-xs">جديد</Badge>
                          )}
                          {getPriorityBadge(notification.priority)}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(notification.createdAt).toLocaleDateString('ar-SA')}
                          </span>
                          <span>المستهدفون: {notification.targetUsers.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* إضافة تنبيه جديد */}
        <Card className="border-dashed border-2 border-gray-300 hover:border-blue-400 transition-colors">
          <CardContent className="p-8 text-center">
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Plus className="h-6 w-6 text-gray-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium">إرسال تنبيه جديد</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  قم بإنشاء وإرسال تنبيه للمستخدمين
                </p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                إنشاء تنبيه
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
