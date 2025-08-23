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
                  className="bg-white dark:bg-gray-900 notification-dropdown-modern z-[9999] max-h-[75vh] overflow-hidden notification-dropdown-fixed notification-dropdown-shadow notification-dropdown-stable"
                  style={{ 
                    position: 'fixed', 
                    top: position.top, 
                    right: position.right, 
                    width: '26rem', 
                    maxWidth: '90vw', 
                    transform: 'none',
                    willChange: 'auto' 
                  }}
                  role="dialog"
                  aria-label="قائمة الإشعارات"
                >
            {/* رأس القائمة */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 text-right bg-white dark:bg-gray-900 backdrop-blur rtl:text-right">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <BellIcon className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      الإشعارات
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      آخر التحديثات والأخبار
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 active:scale-95 text-gray-500 dark:text-gray-400"
                  aria-label="إغلاق الإشعارات"
                >
                  ✕
                </button>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-all duration-200 font-medium"
                  >
                    تحديد الكل كمقروء
                  </button>
                )}
                <button
                  onClick={() => fetchNotifications(1, true)}
                  className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg transition-all duration-200"
                >
                  تحديث
                </button>
                {error && (
                  <button
                    onClick={clearError}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-all duration-200"
                  >
                    مسح الخطأ
                  </button>
                )}
              </div>

              {unreadCount > 0 && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/30">
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                    لديك {unreadCount} إشعار غير مقروء
                  </p>
                </div>
              )}
              
              {error && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-800/30">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {error}
                  </p>
                </div>
              )}
            </div>

            {/* قائمة الإشعارات */}
            <div className="max-h-[60vh] overflow-y-auto notification-scroll bg-white dark:bg-gray-900">
              {loading && notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-4">
                    <div className="notification-loading-pulse rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-1">
                    جاري تحميل الإشعارات
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    يرجى الانتظار قليلاً...
                  </p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                    <BellIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-1">
                    لا توجد إشعارات
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    سيتم إشعارك عند توفر محتوى جديد
                  </p>
                </div>
              ) : (
                <>
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
                      className={`mx-3 mb-2 notification-item rounded-lg border transition-all duration-200 cursor-pointer group active:scale-95 ${
                        !notification.read_at 
                          ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/30 hover:bg-blue-100 dark:hover:bg-blue-900/20' 
                          : 'bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
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
                          }, 100); // تأخير أقل للاستجابة السريعة
                        }
                      }}
                    >
                      <div className="p-4 flex items-start gap-3">
                        {/* أيقونة نوع الإشعار */}
                        <div className={`w-10 h-10 notification-icon rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200 ${
                          !notification.read_at 
                            ? 'bg-blue-500/20' 
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          <span className="text-lg">
                            {getNotificationIcon(notification.type)}
                          </span>
                        </div>

                        {/* محتوى الإشعار */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className={`text-sm font-medium leading-relaxed ${
                              !notification.read_at 
                                ? 'text-gray-900 dark:text-white' 
                                : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {!notification.read_at && (
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      await markAsRead(notification.id);
                                      // إخفاء الإشعار محلياً بعد نجاح التحديث
                                      setHiddenNotifications(prev => new Set([...prev, notification.id]));
                                    } catch (error) {
                                      console.error('فشل في تحديد الإشعار كمقروء:', error);
                                    }
                                  }}
                                  className="w-6 h-6 notification-button rounded-lg flex items-center justify-center bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 transition-all duration-200"
                                  aria-label="تحديد كمقروء"
                                  title="تحديد كمقروء"
                                >
                                  <CheckIcon className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {/* النص التوضيحي */}
                          {(notification as any).metadata?.categoryIntro && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 mb-2 font-medium">
                              {(notification as any).metadata.categoryIntro}
                            </p>
                          )}
                          
                          {/* رسالة الإشعار */}
                          {(notification as any).link ? (
                            <Link 
                              href={(notification as any).link}
                              className={`text-sm leading-relaxed block hover:underline ${
                                !notification.read_at 
                                  ? 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white' 
                                  : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200'
                              }`}
                              onClick={async (e) => {
                                if (!notification.read_at) {
                                  try {
                                    await markAsRead(notification.id);
                                  } catch (error) {
                                    console.error('فشل في تحديد الإشعار كمقروء:', error);
                                  }
                                }
                              }}
                            >
                              {notification.message}
                            </Link>
                          ) : (
                            <p className={`text-sm leading-relaxed ${
                              !notification.read_at 
                                ? 'text-gray-700 dark:text-gray-300' 
                                : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              {notification.message}
                            </p>
                          )}

                          
                          <div className="flex items-center justify-between mt-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(notification.created_at)}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              notification.priority === 'urgent' 
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                                : notification.priority === 'high'
                                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
                                : notification.priority === 'medium'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {notification.priority === 'urgent' ? 'عاجل' :
                               notification.priority === 'high' ? 'مهم' :
                               notification.priority === 'medium' ? 'متوسط' : 'عادي'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* زر تحميل المزيد */}
                  {hasMore && (
                    <div className="p-6 text-center border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
                      <button
                        onClick={loadMore}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-800 text-white rounded-lg font-medium transition-all duration-200 active:scale-95 disabled:cursor-not-allowed mr-3"
                      >
                        {loading ? 'جاري التحميل...' : 'تحميل المزيد'}
                      </button>
                      <button
                        onClick={() => fetchNotifications(1, true)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200 active:scale-95"
                      >
                        تحديث
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
