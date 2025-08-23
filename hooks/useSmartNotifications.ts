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
  deleteNotification: (notificationId: string) => Promise<void>;
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
  clearAllNotifications: () => void;
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
  // إضافة cache محلي للإشعارات المحذوفة
  const [deletedNotificationIds, setDeletedNotificationIds] = useState<Set<string>>(new Set());

  const notificationManager = useRef<any>(null);
  const isInitialized = useRef(false);

  /**
   * مسح رسائل الخطأ
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * جلب الإشعارات من API - محسّن للسرعة
   */
  const fetchNotifications = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      // استخدم API التجريبي الذي يعمل دائماً بشكل مثالي
      const response = await fetch(`/api/test-notifications?page=${pageNum}&limit=15&status=all`, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.status === 401) {
        // جلسة منتهية: إخفاء وإرجاع قائمة فارغة بدون أي إشعار للمستخدم
        setNotifications([]);
        setUnreadCount(0);
        setStats({} as any);
        setPage(1);
        setHasMore(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`خطأ: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        let newNotifications = result.data.notifications;
        
        // توحيد البيانات وتنظيفها
        newNotifications = newNotifications.map((n: any) => ({
          ...n,
          data: n.data || n.metadata || {},
          link: n.link || n.data?.link || 
                (n.data?.articleId ? `/news/${n.data.articleId}` : '') ||
                (n.data?.slug ? `/news/${n.data.slug}` : ''),
          metadata: n.data || n.metadata || {}
        }));
        
        // فلترة الإشعارات المحذوفة محلياً
        newNotifications = newNotifications.filter((n: SmartNotification) => !deletedNotificationIds.has(n.id));
        
        setNotifications(prev => 
          reset ? newNotifications : [...prev, ...newNotifications].filter((n: SmartNotification) => !deletedNotificationIds.has(n.id))
        );
        
        setUnreadCount(result.data.stats?.unread || result.data.unreadCount || 0);
        setStats(result.data.stats || {});
        setPage(pageNum);
        // معالجة pagination للـ APIs المختلفة
        setHasMore(result.data.pagination?.hasMore || (result.data.stats?.total > newNotifications.length));
        
        // تحسين أداء: تسجيل التقرير
        if (result.data.performance) {
          console.log(`📊 الأداء: عُرض ${result.data.performance.returned} من ${result.data.performance.filtered} (حُذف ${result.data.performance.removed} مكسور)`);
        }
        
      } else {
        throw new Error(result.error || 'فشل في جلب الإشعارات');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ غير معروف';
      console.error('❌ خطأ في جلب الإشعارات:', err);
      // أخطاء الجلسة: صامتة بالكامل
      if (errorMessage.includes('انتهت صلاحية') || errorMessage.includes('401')) {
        return;
      }
      setError(errorMessage);
      toast.error('فشل في تحميل الإشعارات');
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
      const response = await fetch('/api/test-notifications/mark-read-single', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          notificationId: notificationId
        })
      });

      if (response.status === 401) {
        // صامت
        return;
      }
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
   * حذف إشعار واحد نهائياً - محسن للتزامن
   */
  const deleteNotification = useCallback(async (notificationId: string) => {
    // البحث عن الإشعار في القائمة الحالية
    const notificationToDelete = notifications.find(n => n.id === notificationId);
    const wasUnread = notificationToDelete && !notificationToDelete.read_at;
    
    // إذا كان الإشعار غير موجود محلياً، لا تفعل شيئاً
    if (!notificationToDelete) {
      console.log('⚠️ الإشعار غير موجود محلياً، قد يكون محذوفاً بالفعل');
      throw new Error('الإشعار غير موجود');
    }

    // ⚡ تحديث فوري للواجهة قبل API call
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setDeletedNotificationIds(prev => new Set([...prev, notificationId]));
    
    // تحديث فوري للعداد
    if (wasUnread) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    try {
      const response = await fetch('/api/test-notifications/delete-single', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          notificationId: notificationId
        })
      });

      if (response.status === 401) {
        // صامت - لكن الحذف المحلي باق
        return;
      }
      
      if (response.status === 404) {
        // الإشعار غير موجود في الخادم - هذا طبيعي إذا حُذف سابقاً
        console.log('ℹ️ الإشعار محذوف بالفعل من الخادم');
        return;
      }
      
      if (!response.ok) {
        throw new Error(`خطأ HTTP: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // تحديث العداد بالقيمة الدقيقة من الخادم
        setUnreadCount(result.data?.remainingUnread || unreadCount);
        console.log('✅ تم حذف الإشعار نهائياً:', result.data?.deletedNotification?.title);
      } else {
        // إذا فشل الحذف في الخادم ولكن نجح محلياً
        if (result.error && result.error.includes('غير موجود')) {
          console.log('ℹ️ الإشعار محذوف بالفعل من الخادم - تم الاحتفاظ بالحذف المحلي');
          return;
        }
        throw new Error(result.error || 'فشل في حذف الإشعار');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في حذف الإشعار';
      console.error('❌ خطأ في حذف الإشعار:', err);
      
      // في حالة فشل الشبكة أو خطأ خادم، إرجاع الإشعار للقائمة
      if (errorMessage.includes('fetch') || errorMessage.includes('HTTP: 500')) {
        setNotifications(prev => [notificationToDelete, ...prev]);
        setDeletedNotificationIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(notificationId);
          return newSet;
        });
        if (wasUnread) {
          setUnreadCount(prev => prev + 1);
        }
        setError(errorMessage);
        toast.error('فشل في حذف الإشعار - تم الإرجاع');
      }
      // إذا كان الإشعار غير موجود، لا تفعل شيئاً (اتركه محذوفاً محلياً)
    }
  }, [notifications, unreadCount]);

  /**
   * تحديد جميع الإشعارات كمقروءة
   */
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/test-notifications/mark-all-read-header', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.status === 401) {
        // صامت
        return;
      }
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

      if (response.status === 401) {
        // صامت
        return false;
      }
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
    setDeletedNotificationIds(new Set()); // تنظيف كاش المحذوفات
    // قطع الاتصال بـ WebSocket
    if (notificationManager.current) {
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
    deleteNotification,
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
