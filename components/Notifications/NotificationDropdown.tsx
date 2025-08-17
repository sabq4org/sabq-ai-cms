'use client';

// مكون الإشعارات الذكية في الهيدر - سبق الذكية
import React, { useState, useEffect, useRef } from 'react';
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
    if (isOpen && notifications.length === 0) {
      fetchNotifications(1, true);
    }
  }, [isOpen, notifications.length, fetchNotifications]);

  /**
   * إغلاق القائمة عند النقر خارجها
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors duration-200"
        aria-label="الإشعارات"
        title={`الإشعارات ${!isConnected ? '(غير متصل)' : ''}`}
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

        {/* مؤشر حالة الاتصال */}
        {!isConnected && (
          <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-gray-400 rounded-full border-2 border-white dark:border-gray-800" />
        )}
      </button>

      {/* قائمة الإشعارات المنسدلة */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden"
          >
            {/* رأس القائمة */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    الإشعارات الذكية
                  </h3>
                  {!isConnected && (
                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      غير متصل
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                      تحديد الكل كمقروء
                    </button>
                  )}
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
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  لديك {unreadCount} إشعار غير مقروء
                </p>
              )}
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                  {error}
                </p>
              )}
            </div>

            {/* قائمة الإشعارات */}
            <div className="max-h-80 overflow-y-auto">
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
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      layout
                      className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-all duration-200 ${
                        !notification.read_at 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' 
                          : ''
                      }`}
                      onClick={() => !notification.read_at && markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        {/* أيقونة نوع الإشعار */}
                        <div className="text-2xl flex-shrink-0 animate-pulse">
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
                            <div className="flex items-center gap-2 flex-shrink-0">
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
                          
                          <p className={`text-sm ${
                            !notification.read_at 
                              ? 'text-gray-700 dark:text-gray-300' 
                              : 'text-gray-500 dark:text-gray-400'
                          } line-clamp-2 leading-relaxed`}>
                            {notification.message}
                          </p>
                          
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
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
