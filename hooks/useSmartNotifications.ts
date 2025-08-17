'use client';

// Hook للإشعارات الذكية في الهيدر - سبق الذكية
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { getAuthHeaders } from '@/lib/utils/auth-headers';

interface SmartNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
  read_at: string | null;
  created_at: string;
  metadata?: any;
}

interface NotificationStats {
  [key: string]: number;
}

interface UseSmartNotificationsReturn {
  notifications: SmartNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  stats: NotificationStats;
  hasMore: boolean;
  page: number;
  // Actions
  fetchNotifications: (pageNum?: number, reset?: boolean) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  sendNotification: (notification: {
    targetUserId: string;
    type: string;
    title: string;
    message: string;
    priority?: string;
    metadata?: any;
  }) => Promise<boolean>;
  clearError: () => void;
  loadMore: () => Promise<void>;
  // Connection
  isConnected: boolean;
  connectToNotifications: () => Promise<void>;
  disconnectFromNotifications: () => void;
}

export function useSmartNotifications(): UseSmartNotificationsReturn {
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<NotificationStats>({});
  const [isConnected, setIsConnected] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const notificationManager = useRef<any>(null);
  const isInitialized = useRef(false);

  /**
   * مسح رسائل الخطأ
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * جلب الإشعارات من API
   */
  const fetchNotifications = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/notifications?page=${pageNum}&limit=20`, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
        }
        throw new Error(`خطأ HTTP: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        let newNotifications = result.data.notifications;
        // توحيد الحقول: ضمان وجود data حتى لو أُرسلت كـ metadata
        newNotifications = newNotifications.map((n: any) => ({
          ...n,
          data: n.data || n.metadata || {},
        }));
        
        setNotifications(prev => 
          reset ? newNotifications : [...prev, ...newNotifications]
        );
        
        setUnreadCount(result.data.unreadCount);
        setStats(result.data.stats || {});
        setPage(pageNum);
        setHasMore(result.data.pagination.hasMore);
        
      } else {
        throw new Error(result.error || 'فشل في جلب الإشعارات');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ غير معروف';
      console.error('❌ خطأ في جلب الإشعارات:', err);
      setError(errorMessage);
      
      // إشعار المستخدم بالخطأ فقط إذا لم يكن خطأ مصادقة
      if (!errorMessage.includes('تسجيل الدخول')) {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * تحميل المزيد من الإشعارات
   */
  const loadMore = useCallback(async () => {
    if (hasMore && !loading) {
      await fetchNotifications(page + 1, false);
    }
  }, [hasMore, loading, page, fetchNotifications]);

  /**
   * تحديد إشعار واحد كمقروء
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notificationIds: [notificationId]
        })
      });

      if (!response.ok) {
        throw new Error(`خطأ HTTP: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // تحديث الحالة المحلية
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === notificationId
              ? { ...notification, read_at: new Date().toISOString(), status: 'read' }
              : notification
          )
        );
        
        setUnreadCount(
          typeof result.data?.totalUnread === 'number'
            ? result.data.totalUnread
            : (typeof result.data?.remainingUnread === 'number' ? result.data.remainingUnread : Math.max(0, unreadCount - 1))
        );
        
      } else {
        throw new Error(result.error || 'فشل في تحديث الإشعار');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في تحديث الإشعار';
      console.error('❌ خطأ في تحديد الإشعار كمقروء:', err);
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, []);

  /**
   * تحديد جميع الإشعارات كمقروءة
   */
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          markAll: true
        })
      });

      if (!response.ok) {
        throw new Error(`خطأ HTTP: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // تحديث جميع الإشعارات كمقروءة
        setNotifications(prev =>
          prev.map(notification => ({
            ...notification,
            read_at: notification.read_at || new Date().toISOString(),
            status: 'read'
          }))
        );
        
        setUnreadCount(0);
        
        const updated = result.data?.updatedCount ?? result.data?.markedCount ?? 0;
        if (updated > 0) {
          toast.success(`تم تحديد ${updated} إشعار كمقروء`);
        }
        
      } else {
        throw new Error(result.error || 'فشل في تحديث الإشعارات');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في تحديث الإشعارات';
      console.error('❌ خطأ في تحديد جميع الإشعارات كمقروءة:', err);
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, []);

  /**
   * إرسال إشعار جديد
   */
  const sendNotification = useCallback(async (notificationData: {
    targetUserId: string;
    type: string;
    title: string;
    message: string;
    priority?: string;
    metadata?: any;
  }): Promise<boolean> => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...notificationData,
          sendImmediate: true
        })
      });

      if (!response.ok) {
        throw new Error(`خطأ HTTP: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        toast.success('تم إرسال الإشعار بنجاح');
        return true;
      } else {
        throw new Error(result.error || 'فشل في إرسال الإشعار');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في إرسال الإشعار';
      console.error('❌ خطأ في إرسال الإشعار:', err);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  }, []);

  /**
   * الاتصال بنظام الإشعارات
   */
  const connectToNotifications = useCallback(async () => {
    try {
      // استيراد مدير الإشعارات
      const { default: manager } = await import('@/lib/notifications/websocket-manager');
      notificationManager.current = manager;

      // مصادقة المستخدم
      const auth = manager.authenticateUser(undefined, (data: any) => {
        try {
          switch (data.type) {
            case 'new_notification':
              // إشعار جديد
              const newNotification = data.data;
              setNotifications(prev => [newNotification, ...prev]);
              setUnreadCount(prev => prev + 1);
              
              // إشعار المستخدم
              toast.success(newNotification.title, {
                duration: 4000,
                icon: getNotificationIcon(newNotification.type)
              });
              break;

            case 'pending_notifications':
              // إشعارات معلقة
              const pendingData = data.data;
              if (pendingData.count > 0) {
                toast(`لديك ${pendingData.count} إشعار جديد`, {
                  duration: 3000,
                  icon: '🔔'
                });
              }
              break;

            case 'notifications_updated':
              // تحديث عدد الإشعارات
              setUnreadCount(data.data.unreadCount);
              break;

            case 'broadcast_notification':
              // إشعار عام
              const broadcastNotification = data.data;
              setNotifications(prev => [broadcastNotification, ...prev]);
              setUnreadCount(prev => prev + 1);
              
              toast.success(broadcastNotification.title, {
                duration: 5000,
                icon: '📢'
              });
              break;
          }
        } catch (handleError) {
          console.error('❌ خطأ في معالجة الإشعار:', handleError);
        }
      });

      if (auth.success) {
        setIsConnected(true);
        console.log('✅ تم الاتصال بنظام الإشعارات');
      } else {
        setIsConnected(false);
        console.error('❌ فشل في الاتصال بنظام الإشعارات:', auth.error);
      }

    } catch (error) {
      setIsConnected(false);
      console.error('❌ خطأ في الاتصال بنظام الإشعارات:', error);
    }
  }, []);

  /**
   * قطع الاتصال عن نظام الإشعارات
   */
  const disconnectFromNotifications = useCallback(() => {
    if (notificationManager.current) {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const decoded = JSON.parse(atob(token.split('.')[1]));
          const userId = decoded.userId || decoded.id;
          notificationManager.current.disconnectUser(userId);
        }
      } catch (error) {
        console.error('❌ خطأ في فك تشفير Token:', error);
      }
    }
    
    setIsConnected(false);
    notificationManager.current = null;
    console.log('🔌 تم قطع الاتصال عن نظام الإشعارات');
  }, []);

  /**
   * تهيئة النظام عند التحميل
   */
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      connectToNotifications();
    }

    return () => {
      disconnectFromNotifications();
    };
  }, [connectToNotifications, disconnectFromNotifications]);

  /**
   * تنسيق أيقونة نوع الإشعار
   */
  const getNotificationIcon = (type: string): string => {
    const icons: { [key: string]: string } = {
      breaking_news: '🚨',
      article_recommendation: '📰',
      user_engagement: '👤',
      comment_reply: '💬',
      author_follow: '✨',
      daily_digest: '📊',
      system_announcement: '📢',
      security_alert: '🔒'
    };
    return icons[type] || '🔔';
  };

  /**
   * تنظيف جميع الإشعارات (عند تسجيل الخروج)
   */
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    setStats({});
    setError(null);
    setPage(1);
    setHasMore(false);
    // قطع الاتصال بـ WebSocket
    if (wsRef.current) {
      disconnectFromNotifications();
    }
  }, [disconnectFromNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    stats,
    hasMore,
    page,
    // Actions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    sendNotification,
    clearError,
    loadMore,
    clearAllNotifications,
    // Connection
    isConnected,
    connectToNotifications,
    disconnectFromNotifications
  };
}
