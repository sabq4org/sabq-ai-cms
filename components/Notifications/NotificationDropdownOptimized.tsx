'use client';

// مكون الإشعارات الذكية المحسّن - تصميم بسيط وسريع
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { BellIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { useSmartNotifications } from '@/hooks/useSmartNotifications';
import { useAuth } from '@/hooks/useAuth';

interface NotificationDropdownProps {
  className?: string;
}

export function NotificationDropdown({ className = '' }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState<{ top: number; right: number }>({ top: 0, right: 16 });
  const [hiddenNotifications, setHiddenNotifications] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  const {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    fetchNotifications,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    loadMore,
    clearError,
    clearAllNotifications,
    isConnected
  } = useSmartNotifications();

  // جلب الإشعارات عند فتح القائمة
  useEffect(() => {
    if (isOpen && user) {
      // لا نمسح hiddenNotifications عند إعادة فتح القائمة
      if (notifications.length === 0) {
        fetchNotifications(1, true);
      }
    }
  }, [isOpen, user, notifications.length, fetchNotifications]);

  // تنظيف عند تسجيل الخروج
  useEffect(() => {
    if (!user) {
      clearAllNotifications();
      setIsOpen(false);
    }
  }, [user, clearAllNotifications]);

  // إغلاق عند النقر خارجاً
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && 
          !anchorRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const updatePosition = () => {
      if (!anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      const top = rect.bottom + window.scrollY + 8;
      const right = Math.max(8, window.innerWidth - rect.right - window.scrollX);
      setPosition({ top, right });
    };

    if (isOpen) {
      updatePosition();
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, { passive: true });
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isOpen]);

  /**
   * أيقونات محسّنة للأنواع
   */
  const getNotificationIcon = (type: string) => {
    const icons = {
      breaking_news: '⚡',
      article_recommendation: '📰',
      user_engagement: '👥',
      comment_reply: '💬',
      author_follow: '⭐',
      daily_digest: '📊',
      system_announcement: '📢',
      security_alert: '🔒'
    };
    return icons[type as keyof typeof icons] || '🔔';
  };

  /**
   * ألوان بسيطة للأولوية
   */
  const getPriorityStyle = (priority: string, isRead: boolean) => {
    if (isRead) return 'text-gray-400 bg-gray-50 dark:bg-gray-700';
    
    const styles = {
      urgent: 'text-red-600 bg-red-50 dark:bg-red-900/20',
      high: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
      medium: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
      low: 'text-gray-600 bg-gray-50 dark:bg-gray-700'
    };
    return styles[priority as keyof typeof styles] || styles.low;
  };

  /**
   * تنسيق التاريخ المبسط
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `${diffMins}د`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}س`;
    return `${Math.floor(diffMins / 1440)}ي`;
  };

  if (!user) return null;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* زر الإشعارات */}
      <button
        ref={anchorRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors duration-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-label="الإشعارات"
        title={unreadCount > 0 ? `${unreadCount} إشعار جديد` : 'الإشعارات'}
      >
        {unreadCount > 0 ? (
          <BellSolidIcon className="h-6 w-6 text-blue-600" />
        ) : (
          <BellIcon className="h-6 w-6" />
        )}
        
        {/* عداد محسّن */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* قائمة الإشعارات */}
      {typeof document !== 'undefined' && createPortal(
        (
          <AnimatePresence>
            {isOpen && (
              <>
                {/* خلفية الإغلاق */}
                <div
                  className="fixed inset-0 z-[9998]"
                  onClick={() => setIsOpen(false)}
                />
                
                {/* القائمة المنسدلة */}
                <motion.div
                  ref={dropdownRef}
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[9999] max-h-[70vh] overflow-hidden"
                  style={{ 
                    position: 'fixed', 
                    top: position.top, 
                    right: position.right, 
                    width: '24rem', 
                    maxWidth: '90vw' 
                  }}
                >
                  {/* رأس مبسط */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        الإشعارات
                      </h3>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={() => {
                              markAllAsRead();
                              setHiddenNotifications(new Set(notifications.map(n => n.id)));
                            }}
                            className="text-sm px-3 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                          >
                            تحديد الكل
                          </button>
                        )}
                        <button
                          onClick={() => setIsOpen(false)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    
                    {unreadCount > 0 && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {unreadCount} إشعار جديد
                      </p>
                    )}
                    
                    {error && (
                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        <button
                          onClick={clearError}
                          className="text-xs text-red-500 hover:text-red-700 mt-1"
                        >
                          إخفاء
                        </button>
                      </div>
                    )}
                  </div>

                  {/* قائمة الإشعارات المحسنة */}
                  <div className="max-h-[50vh] overflow-y-auto">
                    {loading && notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-3"></div>
                        <p className="text-sm text-gray-500">جاري التحميل...</p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <BellIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">لا توجد إشعارات</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">سيتم إشعارك عند وجود جديد</p>
                      </div>
                    ) : (
                      <>
                        <AnimatePresence mode="popLayout">
                        {notifications
                          .filter(n => !hiddenNotifications.has(n.id))
                          .slice(0, 10) // حدّد العدد للأداء
                          .map((notification) => (
                          <motion.div
                            key={notification.id}
                            layout
                            initial={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            className={`relative ${
                              !notification.read_at 
                                ? 'bg-blue-50/80 dark:bg-blue-900/10 border-r-4 border-r-blue-500' 
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            } transition-colors cursor-pointer`}
                            onClick={async (e) => {
                              e.preventDefault();
                              
                              // ⚡ إخفاء فوري في الواجهة للاستجابة السريعة
                              setHiddenNotifications(prev => new Set([...prev, notification.id]));
                              
                              // انتقال للرابط أولاً (حتى لو فشل الحذف)
                              const shouldNavigate = (notification as any).link || (notification as any).data?.link;
                              const link = (notification as any).link || (notification as any).data?.link;
                              
                              // حذف فعلي من قاعدة البيانات
                              try {
                                await deleteNotification(notification.id);
                                console.log('✅ تم حذف الإشعار بنجاح:', notification.id);
                              } catch (error) {
                                console.log('ℹ️ الإشعار قد يكون محذوفاً بالفعل أو فشل الحذف:', error);
                                // لا نعيد الإشعار للظهور - نتركه مخفياً
                              }
                              
                              // انتقال للرابط (بغض النظر عن نتيجة الحذف)
                              if (shouldNavigate && link) {
                                setTimeout(() => {
                                  window.location.href = link;
                                }, 50); // تأخير قصير جداً
                              }
                            }}
                          >
                            <div className="p-4">
                              <div className="flex items-start gap-3">
                                {/* أيقونة بسيطة */}
                                <div className="flex-shrink-0 text-xl">
                                  {getNotificationIcon(notification.type)}
                                </div>

                                {/* المحتوى */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className={`text-sm font-semibold line-clamp-2 ${
                                      !notification.read_at 
                                        ? 'text-gray-900 dark:text-white' 
                                        : 'text-gray-600 dark:text-gray-300'
                                    }`}>
                                      {notification.title}
                                    </h4>
                                    
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <span className="text-xs text-gray-400 whitespace-nowrap">
                                        {formatDate(notification.created_at)}
                                      </span>
                                      {/* خيارات الإشعار */}
                                      <div className="flex items-center gap-1">
                                        {!notification.read_at && (
                                          <button
                                            onClick={async (e) => {
                                              e.stopPropagation();
                                              try {
                                                await markAsRead(notification.id);
                                              } catch (error) {
                                                console.error('فشل:', error);
                                              }
                                            }}
                                            className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full transition-colors"
                                            title="تحديد كمقروء"
                                          >
                                            <CheckIcon className="h-4 w-4" />
                                          </button>
                                        )}
                                        <button
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            // ⚡ إخفاء فوري
                                            setHiddenNotifications(prev => new Set([...prev, notification.id]));
                                            // حذف في الخلفية
                                            deleteNotification(notification.id).catch(console.error);
                                          }}
                                          className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors"
                                          title="حذف نهائياً"
                                        >
                                          <XMarkIcon className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* الرسالة */}
                                  <p className={`text-sm mt-1 line-clamp-2 ${
                                    !notification.read_at 
                                      ? 'text-gray-700 dark:text-gray-200' 
                                      : 'text-gray-500 dark:text-gray-400'
                                  }`}>
                                    {notification.message}
                                  </p>
                                  
                                  {/* شارة الأولوية */}
                                  <div className="flex items-center justify-between mt-2">
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                      getPriorityStyle(notification.priority, !!notification.read_at)
                                    }`}>
                                      {notification.priority === 'urgent' ? '⚡ عاجل' :
                                       notification.priority === 'high' ? '🔥 مهم' :
                                       notification.priority === 'medium' ? '📌 متوسط' : '📋 عادي'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        </AnimatePresence>

                        {/* تحميل المزيد */}
                        {hasMore && (
                          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                              onClick={loadMore}
                              disabled={loading}
                              className="w-full py-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 disabled:opacity-50 transition-colors"
                            >
                              {loading ? 'جاري التحميل...' : 'عرض المزيد'}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        ),
        document.body
      )}
    </div>
  );
}
