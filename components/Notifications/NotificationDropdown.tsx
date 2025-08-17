'use client';

// مكون الإشعارات الذكية في الهيدر - سبق الذكية
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { BellIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { useSmartNotifications } from '@/hooks/useSmartNotifications';

interface NotificationDropdownProps {
  className?: string;
}

export function NotificationDropdown({ className = '' }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState<{ top: number; right: number }>({ top: 0, right: 16 });
  const [hiddenNotifications, setHiddenNotifications] = useState<Set<string>>(new Set());

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

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
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
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[9999] max-h-[75vh] overflow-hidden"
                  style={{ position: 'fixed', top: position.top, right: position.right, width: '26rem', maxWidth: '90vw' }}
                  role="dialog"
                  aria-label="قائمة الإشعارات"
                >
            {/* رأس القائمة */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 text-right bg-white/95 dark:bg-gray-900/90 backdrop-blur rtl:text-right">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 justify-end rtl:flex-row-reverse">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    الإشعارات الذكية
                  </h3>
                </div>
                <div className="flex items-center gap-2 rtl:flex-row-reverse">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                      تحديد الكل كمقروء
                    </button>
                  )}
                  <button
                    onClick={() => fetchNotifications(1, true)}
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    title="تحديث الآن"
                  >
                    تحديث الآن
                  </button>
                  {error && (
                    <button
                      onClick={clearError}
                      className="text-sm text-red-600 hover:text-red-800 dark:text-red-400"
                      title="مسح الخطأ"
                    >
                      ✕
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-right">
                  لديك {unreadCount} إشعار غير مقروء
                </p>
              )}
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1 p-2 bg-red-50 dark:bg-red-900/20 rounded text-right">
                  {error}
                </p>
              )}
            </div>

            {/* قائمة الإشعارات */}
            <div className="max-h-[60vh] overflow-y-auto bg-white/95 dark:bg-gray-900/90">
              {loading && notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    جاري تحميل الإشعارات...
                  </p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <BellIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    لا توجد إشعارات جديدة
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
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
                      className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-all duration-200 text-right ${
                        !notification.read_at 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' 
                          : ''
                      }`}
                      onClick={(e) => {
                        // تحديد كمقروء إذا لم يكن كذلك
                        if (!notification.read_at) {
                          markAsRead(notification.id);
                        }
                        
                        // إخفاء الإشعار من القائمة
                        setHiddenNotifications(prev => new Set([...prev, notification.id]));
                        
                        // الانتقال للرابط إذا كان موجود
                        if (notification.link && !e.defaultPrevented) {
                          setTimeout(() => {
                            window.location.href = notification.link;
                          }, 200); // تأخير بسيط للسماح بالحركة
                        }
                      }}
                    >
                      <div className="flex flex-row-reverse items-start gap-3">
                        {/* أيقونة نوع الإشعار */}
                        <div className="text-2xl flex-shrink-0 animate-pulse ml-2">
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* محتوى الإشعار */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`text-sm font-medium ${
                              !notification.read_at 
                                ? 'text-gray-900 dark:text-white' 
                                : 'text-gray-700 dark:text-gray-300'
                            } truncate`}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-2 flex-shrink-0 rtl:flex-row-reverse">
                              <span className={`text-xs ${getPriorityColor(notification.priority)}`}>
                                ●
                              </span>
                              {!notification.read_at && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 p-1 rounded transition-colors"
                                  aria-label="تحديد كمقروء"
                                  title="تحديد كمقروء"
                                >
                                  <CheckIcon className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {/* النص التوضيحي بلون مختلف */}
                          {(notification as any).metadata?.categoryIntro && (
                            <p className="text-[11px] text-blue-600 dark:text-blue-400 mb-1.5 opacity-90">
                              {(notification as any).metadata.categoryIntro}
                            </p>
                          )}
                          
                          {/* رسالة الإشعار كرابط قابل للنقر */}
                          {notification.link ? (
                            <Link 
                              href={notification.link}
                              className={`text-sm ${
                                !notification.read_at 
                                  ? 'text-gray-900 dark:text-white font-medium hover:text-blue-600 dark:hover:text-blue-400' 
                                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                              } leading-relaxed break-words block hover:underline`}
                              onClick={(e) => {
                                !notification.read_at && markAsRead(notification.id);
                              }}
                            >
                              {notification.message}
                            </Link>
                          ) : (
                            <p className={`text-sm ${
                              !notification.read_at 
                                ? 'text-gray-700 dark:text-gray-300' 
                                : 'text-gray-500 dark:text-gray-400'
                            } leading-relaxed break-words`}>
                              {notification.message}
                            </p>
                          )}

                          
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              {formatDate(notification.created_at)}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              notification.priority === 'urgent' 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                : notification.priority === 'high'
                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                                : notification.priority === 'medium'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
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
                    <div className="p-4 text-center border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={loadMore}
                        disabled={loading}
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? 'جاري التحميل...' : 'تحميل المزيد'}
                      </button>
                      <button
                        onClick={() => fetchNotifications(1, true)}
                        className="ml-3 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                      >
                        تحديث الآن
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
