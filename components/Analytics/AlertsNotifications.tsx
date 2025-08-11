"use client";

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface TrendAlert {
  id: string;
  keyword: string;
  type: 'spike' | 'drop' | 'threshold' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  value: number;
  threshold: number;
  change: number;
  timestamp: string;
  isRead: boolean;
  actionRequired: boolean;
}

interface AlertRule {
  id: string;
  keyword: string;
  type: 'usage_spike' | 'usage_drop' | 'view_threshold' | 'popularity_change';
  threshold: number;
  isActive: boolean;
  notificationMethod: 'browser' | 'email' | 'both';
  createdAt: string;
}

interface AlertsNotificationsProps {
  keyword?: string;
  onAlertAction?: (alertId: string, action: string) => void;
}

const AlertsNotifications: React.FC<AlertsNotificationsProps> = ({
  keyword,
  onAlertAction
}) => {
  const [alerts, setAlerts] = useState<TrendAlert[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all');
  const [newRule, setNewRule] = useState<Partial<AlertRule>>({
    type: 'usage_spike',
    threshold: 100,
    isActive: true,
    notificationMethod: 'browser'
  });

  // تحميل التنبيهات
  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/alerts?keyword=${keyword || ''}`);
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
        setAlertRules(data.rules || []);
      }
    } catch (error) {
      console.error('خطأ في تحميل التنبيهات:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [keyword]);

  // طلب إذن التنبيهات
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  // تصفية التنبيهات
  const filteredAlerts = alerts.filter(alert => {
    switch (filter) {
      case 'unread':
        return !alert.isRead;
      case 'critical':
        return alert.severity === 'critical';
      default:
        return true;
    }
  });

  // وضع علامة على التنبيه كمقروء
  const markAsRead = async (alertId: string) => {
    try {
      await fetch(`/api/analytics/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true })
      });
      
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, isRead: true } : alert
      ));
    } catch (error) {
      console.error('خطأ في تحديث التنبيه:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg border">
      {/* رأس التنبيهات */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <h3 className="text-lg font-semibold text-gray-900">التنبيهات والإشعارات</h3>
          {alerts.filter(a => !a.isRead).length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {alerts.filter(a => !a.isRead).length}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          {/* مرشح التنبيهات */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">جميع التنبيهات</option>
            <option value="unread">غير مقروءة</option>
            <option value="critical">حرجة</option>
          </select>

          <button
            onClick={requestNotificationPermission}
            className="px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
          >
            تفعيل التنبيهات
          </button>
        </div>
      </div>

      {/* قائمة التنبيهات */}
      <div className="divide-y">
        {loading ? (
          <div className="p-6 text-center text-gray-500">
            جاري تحميل التنبيهات...
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            لا توجد تنبيهات
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className={`p-4 hover:bg-gray-50 transition-colors ${
                !alert.isRead ? 'bg-blue-50 border-r-4 border-blue-500' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {alert.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {alert.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 rtl:space-x-reverse mt-2 text-xs text-gray-500">
                    <span>الكلمة المفتاحية: {alert.keyword}</span>
                    <span>القيمة: {alert.value.toLocaleString('ar-SA')}</span>
                    <span>التغيير: {alert.change > 0 ? '+' : ''}{alert.change.toFixed(1)}%</span>
                    <span>{format(new Date(alert.timestamp), 'dd/MM/yyyy HH:mm', { locale: ar })}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  {alert.actionRequired && (
                    <button
                      onClick={() => onAlertAction?.(alert.id, 'investigate')}
                      className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-md hover:bg-yellow-200 transition-colors"
                    >
                      تحقق
                    </button>
                  )}
                  
                  {!alert.isRead && (
                    <button
                      onClick={() => markAsRead(alert.id)}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-md hover:bg-blue-200 transition-colors"
                    >
                      وضع علامة كمقروء
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertsNotifications;
export type { TrendAlert, AlertRule };