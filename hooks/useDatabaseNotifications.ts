// Hook محسّن لإدارة إشعارات قاعدة البيانات مع ضمان الثبات
import { useState, useEffect, useCallback } from 'react';

interface DatabaseNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  status: string;
  read_at?: string | null;
  created_at: string;
  data?: any;
}

interface DatabaseNotificationStats {
  total: number;
  unread: number;
  read: number;
}

export const useDatabaseNotifications = () => {
  const [notifications, setNotifications] = useState<DatabaseNotification[]>([]);
  const [stats, setStats] = useState<DatabaseNotificationStats>({ total: 0, unread: 0, read: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<number>(0);

  // جلب الإشعارات من API
  const fetchNotifications = useCallback(async (refresh = false) => {
    try {
      if (!refresh) setLoading(true);
      setError(null);

      // منع الطلبات المتكررة السريعة
      const now = Date.now();
      if (refresh && now - lastRefresh < 2000) {
        return;
      }
      setLastRefresh(now);

      const response = await fetch('/api/notifications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setNotifications(result.data.notifications || []);
        setStats({
          total: result.data.total || 0,
          unread: result.data.unread || 0,
          read: result.data.read || 0
        });
      } else {
        throw new Error(result.error || 'فشل في جلب الإشعارات');
      }

    } catch (err) {
      console.error('❌ خطأ في جلب الإشعارات:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  }, [lastRefresh]);

  // تحديد إشعار واحد كمقروء مع ضمان الثبات
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      // تحديث الحالة المحلية فوراً للاستجابة السريعة
      const readTime = new Date().toISOString();
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId && !notification.read_at
            ? { ...notification, read_at: readTime, status: 'read' }
            : notification
        )
      );

      // تحديث الإحصائيات محلياً
      setStats(prevStats => {
        const wasUnread = notifications.find(n => n.id === notificationId && !n.read_at);
        return wasUnread ? {
          ...prevStats,
          unread: Math.max(0, prevStats.unread - 1),
          read: prevStats.read + 1
        } : prevStats;
      });

      // إرسال الطلب للخادم
      const response = await fetch('/api/notifications/mark-as-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ notificationId })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ تم تحديد الإشعار ${notificationId} كمقروء نهائياً`);
        
        // تحديث الإحصائيات من الخادم للتأكد
        setTimeout(() => {
          fetchNotifications(true);
        }, 1000);
        
        return true;
      } else {
        // إعادة تعيين الحالة في حالة الفشل
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read_at: null, status: 'sent' }
              : notification
          )
        );
        
        throw new Error(result.error || 'فشل في تحديد الإشعار كمقروء');
      }

    } catch (err) {
      console.error('❌ خطأ في تحديد الإشعار كمقروء:', err);
      setError(err instanceof Error ? err.message : 'فشل في تحديد الإشعار كمقروء');
      
      // إعادة تحميل البيانات للتأكد من الحالة الصحيحة
      fetchNotifications(true);
      return false;
    }
  }, [notifications, fetchNotifications]);

  // تحديد جميع الإشعارات كمقروءة مع ضمان الثبات
  const markAllAsRead = useCallback(async () => {
    try {
      // تحديد الإشعارات غير المقروءة
      const unreadNotifications = notifications.filter(n => !n.read_at);
      
      if (unreadNotifications.length === 0) {
        console.log('ℹ️ لا توجد إشعارات غير مقروءة');
        return 0;
      }

      // تحديث الحالة المحلية فوراً
      const readTime = new Date().toISOString();
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          !notification.read_at 
            ? { ...notification, read_at: readTime, status: 'read' }
            : notification
        )
      );

      // تحديث الإحصائيات محلياً
      setStats(prevStats => ({
        ...prevStats,
        unread: 0,
        read: prevStats.total
      }));

      // إرسال الطلب للخادم
      const response = await fetch('/api/notifications/mark-as-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ markAll: true })
      });

      const result = await response.json();
      
      if (result.success) {
        const updatedCount = result.data.updatedCount || 0;
        console.log(`✅ تم تحديد جميع الإشعارات كمقروءة نهائياً (${updatedCount} إشعار)`);
        
        // تحديث من الخادم للتأكد
        setTimeout(() => {
          fetchNotifications(true);
        }, 1000);
        
        return updatedCount;
      } else {
        throw new Error(result.error || 'فشل في تحديد جميع الإشعارات كمقروءة');
      }

    } catch (err) {
      console.error('❌ خطأ في تحديد جميع الإشعارات كمقروءة:', err);
      setError(err instanceof Error ? err.message : 'فشل في تحديد جميع الإشعارات كمقروءة');
      
      // إعادة تحميل البيانات للتأكد من الحالة الصحيحة
      fetchNotifications(true);
      return 0;
    }
  }, [notifications, fetchNotifications]);

  // التحقق من حالة إشعار محدد مع الخادم
  const verifyNotificationStatus = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/mark-as-read?id=${notificationId}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });

      const result = await response.json();
      
      if (result.success) {
        // تحديث الحالة المحلية بناءً على الخادم
        const serverStatus = result.data;
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => 
            notification.id === notificationId
              ? { 
                  ...notification, 
                  read_at: serverStatus.readAt, 
                  status: serverStatus.status 
                }
              : notification
          )
        );
        
        return serverStatus;
      }
      
      return null;
    } catch (err) {
      console.error('❌ خطأ في التحقق من حالة الإشعار:', err);
      return null;
    }
  }, []);

  // مزامنة دورية مع الخادم
  useEffect(() => {
    fetchNotifications();

    // تحديث كل دقيقة للتأكد من التزامن
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // استمع للتغييرات في النافذة
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 النافذة عادت للتركيز - تحديث الإشعارات');
      fetchNotifications(true);
    };

    const handleOnline = () => {
      console.log('🌐 عودة الاتصال - تحديث الإشعارات');
      fetchNotifications(true);
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
    };
  }, [fetchNotifications]);

  return {
    notifications,
    stats,
    loading,
    error,
    
    // العمليات
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    verifyNotificationStatus,
    
    // مساعدات
    unreadNotifications: notifications.filter(n => !n.read_at),
    readNotifications: notifications.filter(n => !!n.read_at),
    hasUnreadNotifications: stats.unread > 0,
    
    // معلومات إضافية
    lastRefresh: new Date(lastRefresh).toLocaleString('ar-SA')
  };
};
