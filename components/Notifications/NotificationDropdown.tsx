'use client';

// مكون الإشعارات الذكية في الهيدر - سبق الذكية
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { BellIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { useSmartNotifications } from '@/hooks/useSmartNotifications';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationDropdownProps {
  className?: string;
}

export function NotificationDropdown({ className = '' }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState<{ top: number; right: number }>({ top: 64, right: 16 });
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
    markAllAsRead,
    loadMore,
    clearError,
    clearAllNotifications,
    isConnected
  } = useSmartNotifications();

  /**
   * جلب الإشعارات عند فتح القائمة
   */
  useEffect(() => {
    if (isOpen) {
      // إعادة تعيين الإشعارات المخفية عند فتح القائمة
      setHiddenNotifications(new Set());
      
      if (notifications.length === 0) {
        fetchNotifications(1, true);
      }
    }
  }, [isOpen, notifications.length, fetchNotifications]);

  /**
   * تنظيف الإشعارات عند تسجيل الخروج
   */
  useEffect(() => {
    if (!user) {
      // المستخدم غير مسجل، امسح جميع الإشعارات
      clearAllNotifications();
      setIsOpen(false);
    }
  }, [user, clearAllNotifications]);

  /**
   * إغلاق القائمة عند النقر خارجها
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && !anchorRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const updatePosition = () => {
      if (!anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      
      // الحصول على ارتفاع الهيدر من CSS variable أو استخدام القيمة الافتراضية
      const headerHeightVar = getComputedStyle(document.documentElement).getPropertyValue('--header-height');
      const headerHeight = headerHeightVar ? parseInt(headerHeightVar) : 64;
      
      // حساب الموضع مرتبط بالهيدر الثابت
      const top = headerHeight + 8; // مسافة ثابتة من أسفل الهيدر
      const right = Math.max(16, window.innerWidth - rect.right);
      
      setPosition({ top, right });
    };

    if (isOpen) {
      updatePosition();
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', updatePosition);
      // إزالة scroll listener لتثبيت الإشعارات مع الهيدر
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', updatePosition);
      // تم إزالة scroll event cleanup
    };
  }, [isOpen]);

  /**
   * تنسيق أيقونة النوع
   */
  const getNotificationIcon = (type: string) => {
    const icons = {
      breaking_news: '🚨',
      article_recommendation: '📰',
      user_engagement: '👤',
      comment_reply: '💬',
      author_follow: '✨',
      daily_digest: '📊',
      system_announcement: '📢',
      security_alert: '🔒'
    };
    return icons[type as keyof typeof icons] || '🔔';
  };

  /**
   * تنسيق لون الأولوية
   */
  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-gray-500',
      medium: 'text-blue-500',
      high: 'text-orange-500',
      urgent: 'text-red-500'
    };
    return colors[priority as keyof typeof colors] || 'text-gray-500';
  };

  /**
   * تنسيق التاريخ
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // لا تعرض الإشعارات للمستخدمين غير المسجلين
  if (!user) {
    return null;
  }

  return (
    <div className={`notification-dropdown-container ${className}`} ref={dropdownRef}>
      {/* زر الإشعارات */}
      <button
        ref={anchorRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors duration-200"
        aria-label="الإشعارات"
        title={`الإشعارات`}
      >
        {unreadCount > 0 ? (
          <BellSolidIcon className="h-6 w-6 text-blue-600" />
        ) : (
          <BellIcon className="h-6 w-6" />
        )}
        
        {/* عداد الإشعارات غير المقروءة */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}

        {/* إخفاء مؤشر الاتصال لتفادي إرباك المستخدم */}
      </button>

      {/* قائمة الإشعارات المنسدلة عبر Portal لتجنب القص */}
      {typeof document !== 'undefined' && createPortal(
        (
          <AnimatePresence>
            {isOpen && (
              <>
                {/* طبقة إغلاق عند الضغط خارج الصندوق */}
                <motion.div
                  className="fixed inset-0 z-[9998]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsOpen(false)}
                />
                <motion.div
                  ref={dropdownRef}
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="fixed bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl z-[9999] max-h-[75vh] overflow-hidden"
                  style={{ 
                    top: position.top, 
                    right: position.right, 
                    width: '22rem', 
                    maxWidth: '90vw'
                  }}
                  role="dialog"
                  aria-label="قائمة الإشعارات"
                >
            {/* رأس القائمة */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BellIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    الإشعارات
                  </h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 text-gray-500 dark:text-gray-400"
                  aria-label="إغلاق الإشعارات"
                >
                  ✕
                </button>
              </div>
              
              {unreadCount > 0 && (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    {unreadCount} إشعار جديد
                  </span>
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    تحديد الكل كمقروء
                  </button>
                </div>
              )}
              
              {error && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-xs text-red-700 dark:text-red-300">
                    {error}
                  </p>
                </div>
              )}
            </div>

            {/* قائمة الإشعارات */}
            <div className="max-h-[60vh] overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto mb-2"></div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    جاري التحميل...
                  </p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <BellIcon className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                    لا توجد إشعارات
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    سيتم إشعارك عند توفر محتوى جديد
                  </p>
                </div>
              ) : (
                <div className="py-2">
                  {notifications
                    .filter(n => !hiddenNotifications.has(n.id))
                    .slice()
                    .sort((a, b) => {
                      // الترتيب الأساسي: الأحدث أولاً
                      const timeSort = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                      
                      // إضافة وزن إضافي للإشعارات غير المقروءة
                      if (!a.read_at && b.read_at) return -1;
                      if (a.read_at && !b.read_at) return 1;
                      
                      // ثم حسب الأولوية
                      const weights: Record<string, number> = { urgent: 3, high: 2, medium: 1, low: 0 };
                      const pa = weights[a.priority as keyof typeof weights] ?? 0;
                      const pb = weights[b.priority as keyof typeof weights] ?? 0;
                      if (pb !== pa) return pb - pa;
                      
                      return timeSort;
                    })
                    .map((notification) => (
                    <motion.div
                      key={notification.id}
                      layout
                      className={`block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer border-l-2 ${
                        !notification.read_at 
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' 
                          : 'border-transparent'
                      }`}
                      onClick={async (e) => {
                        e.preventDefault();
                        
                        // إخفاء الإشعار محلياً فوراً للاستجابة السريعة
                        setHiddenNotifications(prev => new Set([...prev, notification.id]));
                        
                        // تحديد كمقروء إذا لم يكن كذلك
                        if (!notification.read_at) {
                          try {
                            await markAsRead(notification.id);
                          } catch (error) {
                            console.error('فشل في تحديد الإشعار كمقروء:', error);
                            // إعادة الإشعار للقائمة في حالة الفشل
                            setHiddenNotifications(prev => {
                              const newSet = new Set(prev);
                              newSet.delete(notification.id);
                              return newSet;
                            });
                            return;
                          }
                        }
                        
                        // الانتقال للرابط إذا كان موجود
                        if ((notification as any).link) {
                          setTimeout(() => {
                            window.location.href = (notification as any).link;
                          }, 100);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {/* أيقونة نوع الإشعار */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          !notification.read_at 
                            ? 'bg-blue-100 dark:bg-blue-900/30' 
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          <span className="text-sm">
                            {getNotificationIcon(notification.type)}
                          </span>
                        </div>

                        {/* محتوى الإشعار */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className={`text-sm font-medium ${
                              !notification.read_at 
                                ? 'text-gray-900 dark:text-white' 
                                : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {notification.title}
                            </h4>
                            {!notification.read_at && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                            )}
                          </div>
                          
                          {/* رسالة الإشعار */}
                          <p className={`text-xs mt-1 line-clamp-2 ${
                            !notification.read_at 
                              ? 'text-gray-700 dark:text-gray-300' 
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(notification.created_at)}
                            </p>
                            {!notification.read_at && (
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    await markAsRead(notification.id);
                                    setHiddenNotifications(prev => new Set([...prev, notification.id]));
                                  } catch (error) {
                                    console.error('فشل في تحديد الإشعار كمقروء:', error);
                                  }
                                }}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                aria-label="تحديد كمقروء"
                              >
                                تحديد كمقروء
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* زر تحميل المزيد */}
                  {hasMore && (
                    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={loadMore}
                        disabled={loading}
                        className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:text-gray-400 transition-colors"
                      >
                        {loading ? 'جاري التحميل...' : 'تحميل المزيد'}
                      </button>
                    </div>
                  )}
                </div>
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
