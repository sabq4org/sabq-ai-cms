/**
 * 🔔 مكون: جرس الإشعارات الذكية
 * 
 * يعرض:
 * - أيقونة الجرس مع Badge للعدد
 * - قائمة منسدلة بالإشعارات
 * - تأثيرات بصرية حسب الأولوية
 * - دعم RTL
 */

'use client';

import React, { useState } from 'react';
import { Bell, Zap, Star, MessageCircle, Flame, Reply, X } from 'lucide-react';

// الأيقونات حسب النوع
const ICON_MAP = {
  flash: Zap,
  star: Star,
  'message-circle': MessageCircle,
  flame: Flame,
  reply: Reply,
  bell: Bell
} as const;

// الألوان حسب النوع
const COLOR_MAP = {
  red: 'text-red-600 bg-red-50 border-red-200',
  amber: 'text-amber-600 bg-amber-50 border-amber-200',
  violet: 'text-violet-600 bg-violet-50 border-violet-200',
  sky: 'text-sky-600 bg-sky-50 border-sky-200',
  emerald: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  orange: 'text-orange-600 bg-orange-50 border-orange-200',
  slate: 'text-slate-600 bg-slate-50 border-slate-200'
} as const;

interface SmartNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string;
  icon: string;
  color: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
}

interface SmartNotificationBellProps {
  notifications: SmartNotification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  isConnected?: boolean;
}

export default function SmartNotificationBell({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  isConnected = false
}: SmartNotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = (notification: SmartNotification) => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    window.location.href = notification.link;
  };

  return (
    <div className="relative" dir="rtl">
      {/* زر الجرس */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="الإشعارات"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        
        {/* Badge العدد */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* مؤشر الاتصال */}
        {isConnected && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {/* القائمة المنسدلة */}
      {isOpen && (
        <>
          {/* Overlay للإغلاق */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* القائمة */}
          <div className="absolute left-0 mt-3 w-[420px] max-w-[95vw] bg-white shadow-2xl rounded-2xl border border-gray-200 z-50 max-h-[80vh] overflow-hidden flex flex-col">
            {/* الرأس */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">الإشعارات</h3>
                {unreadCount > 0 && (
                  <span className="text-sm text-gray-500">
                    ({unreadCount} جديد)
                  </span>
                )}
              </div>
              
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* قائمة الإشعارات */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>لا توجد إشعارات</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => {
                    const Icon = ICON_MAP[notification.icon as keyof typeof ICON_MAP] || Bell;
                    const colorClass = COLOR_MAP[notification.color as keyof typeof COLOR_MAP] || COLOR_MAP.slate;

                    return (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`
                          p-4 cursor-pointer transition-all hover:bg-gray-50
                          ${!notification.isRead ? 'bg-blue-50/30' : ''}
                        `}
                      >
                        <div className="flex items-start gap-3">
                          {/* الأيقونة */}
                          <div className={`
                            p-2 rounded-xl shrink-0
                            ${colorClass}
                          `}>
                            <Icon className="w-5 h-5" />
                          </div>

                          {/* المحتوى */}
                          <div className="flex-1 min-w-0">
                            {/* العنوان والشارات */}
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-sm text-gray-900">
                                {notification.title}
                              </h4>
                              
                              {notification.priority === 'HIGH' && (
                                <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full">
                                  عاجل
                                </span>
                              )}
                              
                              {notification.type === 'ARTICLE_FEATURED' && (
                                <span className="px-2 py-0.5 bg-violet-600 text-white text-xs font-bold rounded-full">
                                  مميّز
                                </span>
                              )}
                            </div>

                            {/* النص */}
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {notification.body}
                            </p>

                            {/* التوقيت */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">
                                {formatTimeAgo(notification.createdAt)}
                              </span>
                              
                              {!notification.isRead && (
                                <span className="text-xs text-emerald-600 font-medium">
                                  جديد
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* الذيل */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAllAsRead();
                  }}
                  className="w-full text-sm text-sky-600 hover:text-sky-700 font-medium transition-colors"
                >
                  تعليم الكل كمقروء
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ========================================
// Helper Functions
// ========================================

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'الآن';
  if (seconds < 3600) return `منذ ${Math.floor(seconds / 60)} دقيقة`;
  if (seconds < 86400) return `منذ ${Math.floor(seconds / 3600)} ساعة`;
  if (seconds < 604800) return `منذ ${Math.floor(seconds / 86400)} يوم`;
  
  return date.toLocaleDateString('ar-SA', {
    month: 'short',
    day: 'numeric'
  });
}

