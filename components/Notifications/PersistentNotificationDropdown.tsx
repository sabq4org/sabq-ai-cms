// مكون محسّن لعرض الإشعارات مع ضمان الثبات
'use client';

import React, { useState } from 'react';
import { Bell, Check, CheckCheck, X, Trash2, AlertCircle } from 'lucide-react';
import { useDatabaseNotifications } from '@/hooks/useDatabaseNotifications';

interface NotificationDropdownProps {
  className?: string;
}

export const PersistentNotificationDropdown: React.FC<NotificationDropdownProps> = ({
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const {
    notifications,
    stats,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    hasUnreadNotifications,
    lastRefresh
  } = useDatabaseNotifications();

  const handleMarkAsRead = async (notificationId: string) => {
    setActionLoading(notificationId);
    try {
      await markAsRead(notificationId);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    setActionLoading('mark-all');
    try {
      await markAllAsRead();
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefresh = async () => {
    setActionLoading('refresh');
    try {
      await fetchNotifications(true);
    } finally {
      setActionLoading(null);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'error':
      case 'system_error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      case 'info':
      case 'system':
        return 'ℹ️';
      case 'breaking_news':
        return '🚨';
      case 'recommendation':
        return '⭐';
      case 'comment':
        return '💬';
      case 'author_follow':
        return '✍️';
      case 'new_article':
        return '📰';
      default:
        return '🔔';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 border-red-500';
      case 'high':
        return 'text-orange-600 border-orange-500';
      case 'medium':
        return 'text-blue-600 border-blue-500';
      case 'low':
        return 'text-gray-600 border-gray-400';
      default:
        return 'text-blue-600 border-blue-500';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'منذ لحظات';
    if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
    if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
    return `منذ ${Math.floor(diffInSeconds / 86400)} يوم`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* زر الإشعارات */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg transition-all duration-200 ${
          hasUnreadNotifications 
            ? 'text-red-600 bg-red-50 hover:bg-red-100' 
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
        }`}
        title={`الإشعارات (${stats.unread} غير مقروءة)`}
      >
        <Bell className="w-5 h-5" />
        
        {/* عداد الإشعارات غير المقروءة */}
        {hasUnreadNotifications && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {stats.unread > 99 ? '99+' : stats.unread}
          </span>
        )}
      </button>

      {/* القائمة المنسدلة */}
      {isOpen && (
        <>
          {/* خلفية شفافة لإغلاق القائمة */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* محتوى القائمة */}
          <div className="absolute left-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden">
            
            {/* رأس القائمة */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  الإشعارات ({stats.total})
                </h3>
                
                <div className="flex items-center gap-2">
                  {/* زر التحديث */}
                  <button
                    onClick={handleRefresh}
                    disabled={actionLoading === 'refresh'}
                    className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    title="تحديث"
                  >
                    <AlertCircle className={`w-4 h-4 ${actionLoading === 'refresh' ? 'animate-spin' : ''}`} />
                  </button>
                  
                  {/* زر تحديد الكل كمقروء */}
                  {hasUnreadNotifications && (
                    <button
                      onClick={handleMarkAllAsRead}
                      disabled={actionLoading === 'mark-all'}
                      className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded hover:bg-blue-200 disabled:opacity-50 flex items-center gap-1"
                    >
                      <CheckCheck className="w-3 h-3" />
                      {actionLoading === 'mark-all' ? 'جاري...' : 'تحديد الكل'}
                    </button>
                  )}
                  
                  {/* زر الإغلاق */}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* إحصائيات سريعة */}
              <div className="flex items-center justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
                <span>{stats.unread} غير مقروءة • {stats.read} مقروءة</span>
                <span>آخر تحديث: {lastRefresh}</span>
              </div>
            </div>

            {/* حالة التحميل */}
            {loading && (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                جاري التحميل...
              </div>
            )}

            {/* حالة الخطأ */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">حدث خطأ</p>
                    <p className="text-xs text-red-600 dark:text-red-300 mt-1">{error}</p>
                  </div>
                </div>
                <button
                  onClick={handleRefresh}
                  className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                >
                  إعادة المحاولة
                </button>
              </div>
            )}

            {/* قائمة الإشعارات */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 && !loading ? (
                <div className="p-4 text-center text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">لا توجد إشعارات</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notification) => {
                    const isUnread = !notification.read_at;
                    const isLoading = actionLoading === notification.id;
                    
                    return (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          isUnread ? 'bg-blue-50 dark:bg-blue-900/10 border-r-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* أيقونة نوع الإشعار */}
                          <div className="text-lg flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          {/* محتوى الإشعار */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h4 className={`text-sm font-medium ${
                                isUnread 
                                  ? 'text-gray-900 dark:text-gray-100' 
                                  : 'text-gray-700 dark:text-gray-300'
                              } line-clamp-2`}>
                                {notification.title}
                              </h4>
                              
                              {/* زر تحديد كمقروء */}
                              {isUnread && (
                                <button
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  disabled={isLoading}
                                  className="flex-shrink-0 p-1 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                                  title="تحديد كمقروء"
                                >
                                  {isLoading ? (
                                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Check className="w-4 h-4" />
                                  )}
                                </button>
                              )}
                            </div>
                            
                            <p className={`text-sm mt-1 ${
                              isUnread 
                                ? 'text-gray-700 dark:text-gray-300' 
                                : 'text-gray-600 dark:text-gray-400'
                            } line-clamp-2`}>
                              {notification.message}
                            </p>
                            
                            {/* معلومات إضافية */}
                            <div className="flex items-center justify-between mt-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(notification.priority)} bg-opacity-10`}>
                                {notification.priority === 'urgent' ? 'عاجل' :
                                 notification.priority === 'high' ? 'عالي' :
                                 notification.priority === 'medium' ? 'متوسط' : 'منخفض'}
                              </span>
                              
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{formatTimeAgo(notification.created_at)}</span>
                                {notification.read_at && (
                                  <span className="text-green-600">• مقروء</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
