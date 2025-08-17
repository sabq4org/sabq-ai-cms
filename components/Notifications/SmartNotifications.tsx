'use client';

import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

interface Notification {
  id: string;
  type: 'error' | 'success' | 'info' | 'warning';
  message: string;
  duration?: number;
  actionable?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// قائمة الرسائل التي يجب تجاهلها
const IGNORED_MESSAGES = [
  'Invalid src prop',
  'upstream image response failed',
  'Failed to fetch',
  'NetworkError',
  'ChunkLoadError',
  'خطأ في الخادم',
  'خطأ في المحرر',
];

// رسائل بديلة ذكية
const SMART_MESSAGES: Record<string, string> = {
  'Session expired': 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى',
  'File too large': 'حجم الملف كبير جداً، الحد الأقصى 10 ميجابايت',
  'Invalid file type': 'نوع الملف غير مدعوم، يرجى استخدام JPG, PNG, أو PDF',
  'Network error': 'تحقق من اتصالك بالإنترنت',
  'Permission denied': 'ليس لديك صلاحية للقيام بهذا الإجراء',
  'Data saved': 'تم حفظ البيانات بنجاح',
  'Article published': 'تم نشر المقال بنجاح',
  'Changes saved': 'تم حفظ التغييرات',
};

export const SmartNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const message = event.message || event.error?.message || '';
      
      // تجاهل الأخطاء غير المهمة
      if (IGNORED_MESSAGES.some(ignored => message.includes(ignored))) {
        event.preventDefault();
        return;
      }

      // تحويل للرسالة الذكية إن وجدت
      const smartMessage = Object.entries(SMART_MESSAGES).find(([key]) => 
        message.toLowerCase().includes(key.toLowerCase())
      )?.[1] || null;

      if (smartMessage || message.includes('انتهت') || message.includes('حجم') || message.includes('صلاحية')) {
        addNotification({
          type: 'error',
          message: smartMessage || message,
          actionable: true,
        });
        event.preventDefault();
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const message = event.reason?.message || String(event.reason);
      
      // تجاهل الأخطاء غير المهمة
      if (IGNORED_MESSAGES.some(ignored => message.includes(ignored))) {
        event.preventDefault();
        return;
      }

      // فقط اعرض أخطاء مهمة
      if (message.includes('401') || message.includes('403')) {
        addNotification({
          type: 'error',
          message: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول',
          actionable: true,
          action: {
            label: 'تسجيل الدخول',
            onClick: () => window.location.href = '/login',
          },
        });
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    // إزالة تلقائية بعد المدة المحددة
    const duration = notification.duration || 5000;
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // وظيفة عامة لإضافة تنبيهات من أي مكان
  useEffect(() => {
    (window as any).showNotification = addNotification;
  }, []);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = (type: Notification['type']) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800';
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 left-4 z-50 space-y-2 max-w-md">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`${getStyles(notification.type)} p-4 rounded-lg border shadow-lg transform transition-all duration-300 animate-slide-in`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {getIcon(notification.type)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                {notification.message}
              </p>
              {notification.action && (
                <button
                  onClick={notification.action.onClick}
                  className="mt-2 text-sm font-medium underline hover:no-underline"
                >
                  {notification.action.label}
                </button>
              )}
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 hover:opacity-70 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// أنماط الحركة
const styles = `
@keyframes slide-in {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
`;

// إضافة الأنماط للصفحة
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
} 