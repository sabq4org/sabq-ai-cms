'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BellOff, 
  Volume2, 
  VolumeX, 
  Monitor, 
  Smartphone,
  Settings,
  Save,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NotificationPreferences {
  enabled: boolean;
  browserNotifications: boolean;
  soundEnabled: boolean;
  showToasts: boolean;
  autoSaveNotifications: boolean;
  errorNotifications: boolean;
  performanceWarnings: boolean;
  conflictAlerts: boolean;
  offlineMode: boolean;
  notificationDuration: number;
  maxToasts: number;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const defaultPreferences: NotificationPreferences = {
  enabled: true,
  browserNotifications: true,
  soundEnabled: false,
  showToasts: true,
  autoSaveNotifications: true,
  errorNotifications: true,
  performanceWarnings: true,
  conflictAlerts: true,
  offlineMode: true,
  notificationDuration: 5000,
  maxToasts: 5,
  position: 'top-right'
};

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  isOpen,
  onClose
}) => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [hasChanges, setHasChanges] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  // تحميل الإعدادات المحفوظة
  useEffect(() => {
    if (isOpen) {
      loadPreferences();
      checkPermissionStatus();
    }
  }, [isOpen]);

  const loadPreferences = () => {
    try {
      const saved = localStorage.getItem('notification-preferences');
      if (saved) {
        const parsed = JSON.parse(saved);
        setPreferences({ ...defaultPreferences, ...parsed });
      }
    } catch (error) {
      console.warn('Failed to load notification preferences:', error);
    }
  };

  const savePreferences = () => {
    try {
      localStorage.setItem('notification-preferences', JSON.stringify(preferences));
      setHasChanges(false);
      
      // تطبيق الإعدادات على خدمة الإشعارات
      if ((window as any).notificationService) {
        // يمكن إضافة منطق تطبيق الإعدادات هنا
      }

      alert('تم حفظ الإعدادات بنجاح');
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
      alert('فشل في حفظ الإعدادات');
    }
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
    setHasChanges(true);
  };

  const checkPermissionStatus = () => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  };

  const requestPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setPermissionStatus(permission);
        
        if (permission === 'granted') {
          setPreferences(prev => ({ ...prev, browserNotifications: true }));
          setHasChanges(true);
        }
      } catch (error) {
        console.error('Failed to request notification permission:', error);
      }
    }
  };

  const updatePreference = <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const testNotification = () => {
    if ((window as any).notificationService) {
      (window as any).notificationService.show(
        'info',
        'إشعار تجريبي',
        'هذا إشعار تجريبي لاختبار الإعدادات',
        { duration: 3000 }
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              إعدادات الإشعارات
            </h2>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            إغلاق
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
          {/* الإعدادات العامة */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              الإعدادات العامة
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {preferences.enabled ? (
                    <Bell className="w-5 h-5 text-blue-600" />
                  ) : (
                    <BellOff className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      تفعيل الإشعارات
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      تفعيل أو إلغاء جميع الإشعارات
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.enabled}
                    onChange={(e) => updatePreference('enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {preferences.soundEnabled ? (
                    <Volume2 className="w-5 h-5 text-blue-600" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      الأصوات
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      تشغيل أصوات مع الإشعارات
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.soundEnabled}
                    onChange={(e) => updatePreference('soundEnabled', e.target.checked)}
                    disabled={!preferences.enabled}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* إشعارات المتصفح */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              إشعارات المتصفح
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      إشعارات سطح المكتب
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      إظهار إشعارات في نظام التشغيل
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {permissionStatus === 'denied' && (
                    <span className="text-xs text-red-600">مرفوض</span>
                  )}
                  {permissionStatus === 'default' && (
                    <Button
                      onClick={requestPermission}
                      size="sm"
                      variant="outline"
                    >
                      طلب الإذن
                    </Button>
                  )}
                  {permissionStatus === 'granted' && (
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.browserNotifications}
                        onChange={(e) => updatePreference('browserNotifications', e.target.checked)}
                        disabled={!preferences.enabled}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* أنواع الإشعارات */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              أنواع الإشعارات
            </h3>
            <div className="space-y-4">
              {[
                { key: 'errorNotifications', label: 'إشعارات الأخطاء', desc: 'إشعارات عند حدوث أخطاء' },
                { key: 'autoSaveNotifications', label: 'إشعارات الحفظ التلقائي', desc: 'إشعارات عند الحفظ التلقائي' },
                { key: 'conflictAlerts', label: 'تنبيهات التضارب', desc: 'تنبيهات عند اكتشاف تضارب في النسخ' },
                { key: 'performanceWarnings', label: 'تحذيرات الأداء', desc: 'تحذيرات عند بطء الأداء' },
                { key: 'offlineMode', label: 'وضع عدم الاتصال', desc: 'إشعارات عند فقدان الاتصال' }
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {label}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {desc}
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences[key as keyof NotificationPreferences] as boolean}
                      onChange={(e) => updatePreference(key as keyof NotificationPreferences, e.target.checked)}
                      disabled={!preferences.enabled}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* إعدادات العرض */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              إعدادات العرض
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  مدة عرض الإشعار (بالثواني)
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={preferences.notificationDuration / 1000}
                  onChange={(e) => updatePreference('notificationDuration', parseInt(e.target.value) * 1000)}
                  disabled={!preferences.enabled}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {preferences.notificationDuration / 1000} ثانية
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الحد الأقصى للإشعارات المرئية
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={preferences.maxToasts}
                  onChange={(e) => updatePreference('maxToasts', parseInt(e.target.value))}
                  disabled={!preferences.enabled}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {preferences.maxToasts} إشعار
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  موقع الإشعارات
                </label>
                <select
                  value={preferences.position}
                  onChange={(e) => updatePreference('position', e.target.value as any)}
                  disabled={!preferences.enabled}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="top-right">أعلى اليمين</option>
                  <option value="top-left">أعلى اليسار</option>
                  <option value="bottom-right">أسفل اليمين</option>
                  <option value="bottom-left">أسفل اليسار</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <Button
              onClick={testNotification}
              variant="outline"
              size="sm"
              disabled={!preferences.enabled}
            >
              اختبار الإشعار
            </Button>
            <Button
              onClick={resetPreferences}
              variant="outline"
              size="sm"
              className="text-gray-600"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              إعادة تعيين
            </Button>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
            >
              إلغاء
            </Button>
            <Button
              onClick={savePreferences}
              disabled={!hasChanges}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              حفظ الإعدادات
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;