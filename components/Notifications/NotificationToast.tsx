'use client';

import React, { useEffect, useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { editorNotificationManager } from '@/lib/services/EditorNotificationFilter';
import { 
  X, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Notification, NotificationAction } from '@/lib/services/NotificationService';

interface NotificationToastProps {
  maxVisible?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  className?: string;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  maxVisible = 5,
  position = 'top-right',
  className = ''
}) => {
  const { notifications, remove } = useNotifications();
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([]);

  // تحديث الإشعارات المرئية
  useEffect(() => {
    // إظهار الإشعارات الجديدة فقط (غير المقروءة والتي لها مدة محددة)
    // وتطبيق فلترة الرسائل المزعجة
    const newNotifications = notifications
      .filter(n => !n.read && n.duration !== 0)
      .filter(n => editorNotificationManager.shouldShowMessage(n.message, n.type))
      .slice(0, maxVisible);
    
    setVisibleNotifications(newNotifications);
  }, [notifications, maxVisible]);

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

  // الحصول على ألوان الإشعار
  const getNotificationColors = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          text: 'text-green-800 dark:text-green-200'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          text: 'text-yellow-800 dark:text-yellow-200'
        };
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          text: 'text-red-800 dark:text-red-200'
        };
      default:
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          text: 'text-blue-800 dark:text-blue-200'
        };
    }
  };

  // الحصول على موقع الإشعارات
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      default:
        return 'top-4 right-4';
    }
  };

  // تنفيذ إجراء الإشعار
  const executeAction = async (action: NotificationAction, notificationId: string) => {
    try {
      if (!action) {
        console.warn('No action provided for notification');
        return;
      }

      // التحقق من وجود دالة الإجراء وتنفيذها
      if (typeof action.action === 'function') {
        await action.action();
      } else {
        console.warn('Action does not contain a valid function:', action);
        return;
      }

      // إزالة الإشعار بعد تنفيذ الإجراء بنجاح
      remove(notificationId);
    } catch (error) {
      console.error('Failed to execute notification action:', error);
      // عدم إزالة الإشعار في حالة الخطأ للسماح للمستخدم بالمحاولة مرة أخرى
    }
  };

  if (visibleNotifications.length === 0) return null;

  return (
    <div className={`fixed ${getPositionClasses()} z-50 space-y-3 ${className}`}>
      {visibleNotifications.map((notification, index) => {
        const colors = getNotificationColors(notification.type);
        
        return (
          <div
            key={notification.id}
            className={`
              w-80 p-4 rounded-lg shadow-lg border-2 transition-all duration-300 ease-in-out
              ${colors.bg} ${colors.border}
              animate-in slide-in-from-right-full
            `}
            style={{
              animationDelay: `${index * 100}ms`,
              animationDuration: '300ms'
            }}
          >
            <div className="flex items-start gap-3">
              {/* أيقونة نوع الإشعار */}
              <div className="flex-shrink-0 mt-0.5">
                {getNotificationIcon(notification.type)}
              </div>

              {/* محتوى الإشعار */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`text-sm font-semibold ${colors.text} truncate`}>
                    {notification.title}
                  </h4>
                  <Button
                    onClick={() => remove(notification.id)}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <p className={`text-sm ${colors.text} opacity-90 mb-2`}>
                  {notification.message}
                </p>

                {/* معلومات إضافية */}
                {notification.metadata?.component && (
                  <div className={`text-xs ${colors.text} opacity-70 mb-2`}>
                    المكون: {notification.metadata.component}
                  </div>
                )}

                {/* إجراءات الإشعار */}
                {notification.actions && notification.actions.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {notification.actions.slice(0, 2).map((action, actionIndex) => (
                      <Button
                        key={action.id || `action-${actionIndex}`}
                        onClick={() => {
                          if (action) {
                            executeAction(action, notification.id);
                          }
                        }}
                        size="sm"
                        variant={action.style === 'primary' ? 'default' : 'outline'}
                        className={`text-xs ${
                          action.style === 'danger' 
                            ? 'text-red-600 border-red-300 hover:bg-red-50' 
                            : action.style === 'primary'
                            ? 'bg-white text-gray-900 hover:bg-gray-100'
                            : 'border-current text-current hover:bg-white hover:bg-opacity-20'
                        }`}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}

                {/* شريط التقدم للإشعارات المؤقتة */}
                {notification.duration && notification.duration > 0 && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                      <div 
                        className="bg-current h-1 rounded-full transition-all ease-linear"
                        style={{
                          width: '100%',
                          animation: `shrink ${notification.duration}ms linear forwards`
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* وقت الإشعار */}
                <div className={`flex items-center gap-1 mt-2 text-xs ${colors.text} opacity-60`}>
                  <Clock className="w-3 h-3" />
                  <span>{notification.timestamp.toLocaleTimeString('ar')}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* CSS للأنيميشن */}
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        @keyframes slide-in-from-right-full {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-in {
          animation-fill-mode: both;
        }
        
        .slide-in-from-right-full {
          animation-name: slide-in-from-right-full;
        }
      `}</style>
    </div>
  );
};

export default NotificationToast;