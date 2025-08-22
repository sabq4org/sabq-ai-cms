"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellRing, X, Check, Clock, AlertCircle, Newspaper, MessageSquare, TrendingUp, Settings } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  category: string;
  data?: any;
  read_at?: string | null;
  created_at: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // جلب الإشعارات
  useEffect(() => {
    fetchNotifications();
    
    // تحديث الإشعارات كل 30 ثانية
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/user');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST'
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'breaking':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'news':
        return <Newspaper className="w-5 h-5 text-blue-500" />;
      case 'comment':
        return <MessageSquare className="w-5 h-5 text-green-500" />;
      case 'trending':
        return <TrendingUp className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* زر الجرس */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
        aria-label="الإشعارات"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-6 h-6 animate-pulse" />
        ) : (
          <Bell className="w-6 h-6" />
        )}
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* قائمة الإشعارات */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
          {/* الهيدر */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">الإشعارات</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    disabled={loading}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    تعيين الكل كمقروء
                  </button>
                )}
                <Link
                  href="/settings/notifications"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Settings className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* قائمة الإشعارات */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>لا توجد إشعارات جديدة</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.read_at ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    if (!notification.read_at) {
                      markAsRead(notification.id);
                    }
                    if (notification.data?.url) {
                      window.location.href = notification.data.url;
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className={`text-sm font-medium text-gray-900 ${
                            !notification.read_at ? 'font-semibold' : ''
                          }`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read_at && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: ar
                          })}
                        </span>
                        {notification.priority === 'high' && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                            عاجل
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* الفوتر */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
              <Link
                href="/notifications"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                عرض جميع الإشعارات
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
