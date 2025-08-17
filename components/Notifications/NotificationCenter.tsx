'use client';

import React, { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { 
  Bell, 
  X, 
  Check, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle,
  Clock,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Notification } from '@/lib/services/NotificationService';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  className = ''
}) => {
  const {
    notifications,
    stats,
    remove,
    markAsRead,
    markAllAsRead,
    clear,
    clearByType
  } = useNotifications();

  const [selectedTab, setSelectedTab] = useState<'all' | 'unread' | 'errors'>('all');

  // تصفية الإشعارات حسب التبويب المحدد
  const getFilteredNotifications = () => {
    switch (selectedTab) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'errors':
        return notifications.filter(n => n.type === 'error');
      default:
        return notifications;
    }
  };

  // الحصول على أيقونة نوع الإشعار
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  // الحصول على لون خلفية الإشعار
  const getNotificationBgColor = (type: Notification['type'], read: boolean) => {
    const opacity = read ? 'bg-opacity-30' : 'bg-opacity-50';
    switch (type) {
      case 'success':
        return `bg-green-50 dark:bg-green-900 ${opacity}`;
      case 'warning':
        return `bg-yellow-50 dark:bg-yellow-900 ${opacity}`;
      case 'error':
        return `bg-red-50 dark:bg-red-900 ${opacity}`;
      default:
        return `bg-blue-50 dark:bg-blue-900 ${opacity}`;
    }
  };

  // تنسيق الوقت
  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `منذ ${days} يوم`;
    if (hours > 0) return `منذ ${hours} ساعة`;
    if (minutes > 0) return `منذ ${minutes} دقيقة`;
    return 'الآن';
  };

  // تنفيذ إجراء الإشعار
  const executeAction = async (action: any) => {
    try {
      await action.action();
    } catch (error) {
      console.error('Failed to execute notification action:', error);
    }
  };

  const filteredNotifications = getFilteredNotifications();

  if (!isOpen) return null;

  return (
    <div className={`fixed top-16 left-4 w-96 max-h-[80vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            الإشعارات
          </h3>
          {stats.unread > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {stats.unread}
            </span>
          )}
        </div>
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'all', label: 'الكل', count: stats.total },
          { id: 'unread', label: 'غير مقروءة', count: stats.unread },
          { id: 'errors', label: 'أخطاء', count: stats.byType.error || 0 }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              selectedTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Actions */}
      {notifications.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <div className="flex gap-2">
            <Button
              onClick={markAllAsRead}
              variant="ghost"
              size="sm"
              className="text-xs"
              disabled={stats.unread === 0}
            >
                              <Check className="w-3 h-3 mr-1" />
              تمييز الكل كمقروء
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => clearByType('error')}
              variant="ghost"
              size="sm"
              className="text-xs text-red-600"
              disabled={!stats.byType.error}
            >
              مسح الأخطاء
            </Button>
            <Button
              onClick={clear}
              variant="ghost"
              size="sm"
              className="text-xs text-red-600"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              مسح الكل
            </Button>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">
              {selectedTab === 'unread' && 'لا توجد إشعارات غير مقروءة'}
              {selectedTab === 'errors' && 'لا توجد أخطاء'}
              {selectedTab === 'all' && 'لا توجد إشعارات'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  !notification.read ? 'border-r-4 border-blue-500' : ''
                } ${getNotificationBgColor(notification.type, notification.read)}`}
              >
                <div className="flex items-start gap-3">
                  {/* أيقونة نوع الإشعار */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* محتوى الإشعار */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {notification.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(notification.timestamp)}
                        </span>
                        <Button
                          onClick={() => remove(notification.id)}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {notification.message}
                    </p>

                    {/* معلومات إضافية */}
                    {notification.metadata?.component && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        المكون: {notification.metadata.component}
                      </div>
                    )}

                    {/* إجراءات الإشعار */}
                    {notification.actions && notification.actions.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {notification.actions.map((action) => (
                          <Button
                            key={action.id}
                            onClick={() => executeAction(action)}
                            size="sm"
                            variant={action.style === 'primary' ? 'default' : 'outline'}
                            className={`text-xs ${
                              action.style === 'danger' 
                                ? 'text-red-600 border-red-300 hover:bg-red-50' 
                                : ''
                            }`}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}

                    {/* تمييز كمقروء */}
                    {!notification.read && (
                      <div className="mt-2">
                        <Button
                          onClick={() => markAsRead(notification.id)}
                          variant="ghost"
                          size="sm"
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          تمييز كمقروء
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            إجمالي {stats.total} إشعار • {stats.unread} غير مقروء
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;