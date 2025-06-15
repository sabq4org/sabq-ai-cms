'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Filter, Calendar, User, FileText, Shield, Clock, Search } from 'lucide-react';
import { SabqCard } from '@/components/ui/SabqCard';
import { SabqInput } from '@/components/ui/SabqInput';
import { SabqBadge } from '@/components/ui/SabqBadge';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ActivityLog {
  id: number;
  user: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
  action: string;
  target_type: string;
  target_id: string;
  target_title: string;
  metadata?: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedTargetType, setSelectedTargetType] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [dateRange, setDateRange] = useState('today');

  useEffect(() => {
    fetchActivities();
  }, [selectedAction, selectedTargetType, selectedUser, dateRange]);

  const fetchActivities = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedAction !== 'all') params.append('action', selectedAction);
      if (selectedTargetType !== 'all') params.append('target_type', selectedTargetType);
      if (selectedUser !== 'all') params.append('user_id', selectedUser);
      
      const response = await fetch(`/api/activities?${params}`);
      const data = await response.json();
      if (data.success) {
        setActivities(data.data);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionText = (action: string) => {
    const actions: Record<string, string> = {
      CREATE_ARTICLE: 'إنشاء مقال',
      UPDATE_ARTICLE: 'تحديث مقال',
      DELETE_ARTICLE: 'حذف مقال',
      PUBLISH_ARTICLE: 'نشر مقال',
      CREATE_USER: 'إنشاء مستخدم',
      UPDATE_USER: 'تحديث مستخدم',
      DELETE_USER: 'حذف مستخدم',
      SUSPEND_USER: 'تعليق مستخدم',
      ACTIVATE_USER: 'تفعيل مستخدم'
    };
    return actions[action] || action;
  };

  const getActionColor = (action: string) => {
    if (action.startsWith('CREATE')) return 'success';
    if (action.startsWith('UPDATE')) return 'info';
    if (action.startsWith('DELETE')) return 'error';
    if (action.startsWith('SUSPEND')) return 'warning';
    return 'default';
  };

  const getTargetIcon = (targetType: string) => {
    switch (targetType) {
      case 'article':
        return <FileText className="h-4 w-4" />;
      case 'user':
        return <User className="h-4 w-4" />;
      case 'role':
        return <Shield className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getTargetTypeText = (targetType: string) => {
    const types: Record<string, string> = {
      article: 'مقال',
      user: 'مستخدم',
      role: 'دور',
      category: 'تصنيف'
    };
    return types[targetType] || targetType;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">سجل النشاطات</h1>
        <p className="text-gray-600 mt-1">تتبع جميع الأنشطة والتغييرات في النظام</p>
      </div>

      {/* Filters */}
      <SabqCard className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">جميع الإجراءات</option>
            <option value="CREATE_ARTICLE">إنشاء مقال</option>
            <option value="UPDATE_ARTICLE">تحديث مقال</option>
            <option value="DELETE_ARTICLE">حذف مقال</option>
            <option value="PUBLISH_ARTICLE">نشر مقال</option>
            <option value="CREATE_USER">إنشاء مستخدم</option>
            <option value="UPDATE_USER">تحديث مستخدم</option>
            <option value="SUSPEND_USER">تعليق مستخدم</option>
          </select>

          <select
            value={selectedTargetType}
            onChange={(e) => setSelectedTargetType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">جميع الأنواع</option>
            <option value="article">مقالات</option>
            <option value="user">مستخدمين</option>
            <option value="role">أدوار</option>
            <option value="category">تصنيفات</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">اليوم</option>
            <option value="week">آخر أسبوع</option>
            <option value="month">آخر شهر</option>
            <option value="all">الكل</option>
          </select>

          <SabqInput
            type="text"
            placeholder="البحث في النشاطات..."
            icon={<Search className="h-4 w-4" />}
          />
        </div>
      </SabqCard>

      {/* Activities Timeline */}
      <SabqCard>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">جاري التحميل...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد نشاطات مسجلة</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  {/* User Avatar */}
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {activity.user.name.charAt(0)}
                      </span>
                    </div>
                  </div>

                  {/* Activity Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{activity.user.name}</span>
                      <SabqBadge variant={getActionColor(activity.action)} size="sm">
                        {getActionText(activity.action)}
                      </SabqBadge>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {getTargetIcon(activity.target_type)}
                      <span>{getTargetTypeText(activity.target_type)}:</span>
                      <span className="font-medium text-gray-900">{activity.target_title}</span>
                    </div>

                    {activity.metadata && (
                      <div className="mt-2 text-sm text-gray-500">
                        {activity.metadata.reason && (
                          <p>السبب: {activity.metadata.reason}</p>
                        )}
                        {activity.metadata.changes && (
                          <p>التغييرات: {activity.metadata.changes.join('، ')}</p>
                        )}
                        {activity.metadata.section && (
                          <p>القسم: {activity.metadata.section}</p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(activity.created_at), { locale: ar, addSuffix: true })}
                      </span>
                      <span>IP: {activity.ip_address}</span>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="flex-shrink-0 text-left text-sm text-gray-500">
                    <div>{new Date(activity.created_at).toLocaleDateString('ar-SA')}</div>
                    <div>{new Date(activity.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SabqCard>
    </div>
  );
} 