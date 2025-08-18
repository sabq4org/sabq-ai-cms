'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  notificationService, 
  Notification, 
  NotificationStats 
} from '@/lib/services/NotificationService';

/**
 * Hook لاستخدام نظام التنبيهات
 */
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    byType: {},
    recent: []
  });

  // تحديث الإحصائيات
  const updateStats = useCallback(() => {
    const newStats = notificationService.getStats();
    setStats(newStats);
  }, []);

  // الاستماع للتغييرات
  useEffect(() => {
    const unsubscribe = notificationService.addListener((newNotifications) => {
      setNotifications(newNotifications);
      updateStats();
    });

    // تحديث أولي
    setNotifications(notificationService.getAll());
    updateStats();

    return unsubscribe;
  }, [updateStats]);

  // إظهار إشعار
  const show = useCallback((
    type: Notification['type'],
    title: string,
    message: string,
    options?: Partial<Notification>
  ) => {
    return notificationService.show(type, title, message, options);
  }, []);

  // إشعارات مخصصة للمحررات
  const showEditorError = useCallback((error: Error, component: string, errorId?: string) => {
    return notificationService.showEditorError(error, component, errorId);
  }, []);

  const showAutoSaveSuccess = useCallback((lastSaved: Date) => {
    return notificationService.showAutoSaveSuccess(lastSaved);
  }, []);

  const showAutoSaveError = useCallback((error: string) => {
    return notificationService.showAutoSaveError(error);
  }, []);

  const showConflictDetected = useCallback((conflictCount: number) => {
    return notificationService.showConflictDetected(conflictCount);
  }, []);

  const showOfflineMode = useCallback(() => {
    return notificationService.showOfflineMode();
  }, []);

  const showPerformanceWarning = useCallback((component: string, loadTime: number) => {
    return notificationService.showPerformanceWarning(component, loadTime);
  }, []);

  // إدارة الإشعارات
  const remove = useCallback((id: string) => {
    notificationService.remove(id);
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      // تحديث تفاؤلي
      notificationService.markAsRead(id);
      // حفظ في الخادم
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notification_ids: [id] })
      });
    } catch (e) {
      console.error('markAsRead failed:', e);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      notificationService.markAllAsRead();
      await fetch('/api/notifications/mark-all-read', { method: 'POST', credentials: 'include' });
    } catch (e) {
      console.error('markAllAsRead failed:', e);
    }
  }, []);

  const clear = useCallback(() => {
    notificationService.clear();
  }, []);

  const clearByType = useCallback((type: Notification['type']) => {
    notificationService.clearByType(type);
  }, []);

  // الحصول على إشعارات محددة
  const getUnread = useCallback(() => {
    return notificationService.getUnread();
  }, []);

  const getByType = useCallback((type: Notification['type']) => {
    return notificationService.getByType(type);
  }, []);

  return {
    // البيانات
    notifications,
    stats,
    unreadCount: stats.unread,
    
    // إظهار الإشعارات
    show,
    showEditorError,
    showAutoSaveSuccess,
    showAutoSaveError,
    showConflictDetected,
    showOfflineMode,
    showPerformanceWarning,
    
    // إدارة الإشعارات
    remove,
    markAsRead,
    markAllAsRead,
    clear,
    clearByType,
    
    // الحصول على إشعارات محددة
    getUnread,
    getByType
  };
};

export default useNotifications;