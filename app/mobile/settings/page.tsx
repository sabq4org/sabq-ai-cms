'use client';

import React, { useEffect, useState } from 'react';
import { useMobileSettings, useMobileTheme } from '../../../lib/mobile-settings';
import { MobileButton } from '../../../components/mobile/MobileComponents';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  ArrowLeft, 
  Monitor, 
  Moon, 
  Sun, 
  Smartphone, 
  Volume2, 
  VolumeX, 
  Vibrate, 
  Bell, 
  Shield, 
  Zap,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Wifi,
  WifiOff,
  Download,
  Upload
} from 'lucide-react';

// تحقق من دعم الميزات في المتصفح فقط
function useFeatureSupport() {
  const [features, setFeatures] = useState({
    notifications: false,
    vibration: false,
    touchScreen: false,
    share: false
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setFeatures({
        notifications: 'Notification' in window,
        vibration: 'vibrate' in navigator,
        touchScreen: 'ontouchstart' in window,
        share: 'share' in navigator
      });
    }
  }, []);

  return features;
}

function MobileSettingsPage() {
  const { settings, isLoading, updateSetting, resetSettings } = useMobileSettings();
  const { isDark, theme, setTheme } = useMobileTheme();
  const featureSupport = useFeatureSupport();

  if (isLoading) {
    return (
      <div className="device-mobile min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleSaveSettings = () => {
    if (typeof window !== 'undefined' && featureSupport.vibration) {
      navigator.vibrate([100, 50, 100]);
    }
    // يمكن إضافة منطق حفظ إضافي هنا
  };

  return (
    <div className="device-mobile min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* الشريط العلوي */}
      <div className="mobile-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/mobile/dashboard">
              <MobileButton variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </MobileButton>
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              إعدادات التطبيق
            </h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 pb-24">
        {/* إعدادات العرض */}
        <div className="mobile-card p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            إعدادات العرض
          </h2>
          
          <div className="space-y-4">
            {/* الموضوع */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                الموضوع
              </label>
              <div className="mobile-grid-3 gap-2">
                <MobileButton
                  variant={theme === 'auto' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setTheme('auto')}
                  className="flex flex-col items-center gap-1 p-3"
                >
                  <Smartphone className="w-4 h-4" />
                  <span className="text-xs">تلقائي</span>
                </MobileButton>
                <MobileButton
                  variant={theme === 'light' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setTheme('light')}
                  className="flex flex-col items-center gap-1 p-3"
                >
                  <Sun className="w-4 h-4" />
                  <span className="text-xs">فاتح</span>
                </MobileButton>
                <MobileButton
                  variant={theme === 'dark' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setTheme('dark')}
                  className="flex flex-col items-center gap-1 p-3"
                >
                  <Moon className="w-4 h-4" />
                  <span className="text-xs">داكن</span>
                </MobileButton>
              </div>
            </div>

            {/* حجم الخط */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                حجم الخط
              </label>
              <div className="mobile-grid-3 gap-2">
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <MobileButton
                    key={size}
                    variant={settings.display.fontSize === size ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => updateSetting('display', { fontSize: size })}
                    className="p-3"
                  >
                    <span className={`text-${size === 'small' ? 'xs' : size === 'medium' ? 'sm' : 'base'}`}>
                      {size === 'small' ? 'صغير' : size === 'medium' ? 'متوسط' : 'كبير'}
                    </span>
                  </MobileButton>
                ))}
              </div>
            </div>

            {/* الوضع المضغوط */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  الوضع المضغوط
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  عرض أكثر كثافة للمحتوى
                </p>
              </div>
              <MobileButton
                variant={settings.display.compactMode ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => updateSetting('display', { compactMode: !settings.display.compactMode })}
                className="p-2"
              >
                {settings.display.compactMode ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </MobileButton>
            </div>

            {/* التباين العالي */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  التباين العالي
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  تحسين الرؤية والوضوح
                </p>
              </div>
              <MobileButton
                variant={settings.display.highContrast ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => updateSetting('display', { highContrast: !settings.display.highContrast })}
                className="p-2"
              >
                {settings.display.highContrast ? '✓' : '○'}
              </MobileButton>
            </div>
          </div>
        </div>

        {/* إعدادات التفاعل */}
        <div className="mobile-card p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Vibrate className="w-5 h-5" />
            إعدادات التفاعل
          </h2>
          
          <div className="space-y-4">
            {/* الاهتزاز اللمسي */}
            {featureSupport.vibration && (
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    الاهتزاز اللمسي
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    اهتزاز عند اللمس
                  </p>
                </div>
                <MobileButton
                  variant={settings.interaction.hapticFeedback ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => {
                    const newValue = !settings.interaction.hapticFeedback;
                    updateSetting('interaction', { hapticFeedback: newValue });
                    if (typeof window !== 'undefined' && newValue && featureSupport.vibration) {
                      navigator.vibrate([50]);
                    }
                  }}
                  className="p-2"
                >
                  <Vibrate className="w-4 h-4" />
                </MobileButton>
              </div>
            )}

            {/* الأصوات */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  أصوات التطبيق
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  أصوات التفاعل والإشعارات
                </p>
              </div>
              <MobileButton
                variant={settings.interaction.soundEffects ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => updateSetting('interaction', { soundEffects: !settings.interaction.soundEffects })}
                className="p-2"
              >
                {settings.interaction.soundEffects ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </MobileButton>
            </div>

            {/* التنقل بالإيماءات */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  التنقل بالإيماءات
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  السحب والانتقالات بالإيماءات
                </p>
              </div>
              <MobileButton
                variant={settings.interaction.gestureNavigation ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => updateSetting('interaction', { gestureNavigation: !settings.interaction.gestureNavigation })}
                className="p-2"
              >
                {settings.interaction.gestureNavigation ? '✓' : '○'}
              </MobileButton>
            </div>

            {/* السحب للتحديث */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  السحب للتحديث
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  تحديث المحتوى بالسحب للأسفل
                </p>
              </div>
              <MobileButton
                variant={settings.interaction.pullToRefresh ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => updateSetting('interaction', { pullToRefresh: !settings.interaction.pullToRefresh })}
                className="p-2"
              >
                <Download className="w-4 h-4" />
              </MobileButton>
            </div>
          </div>
        </div>

        {/* إعدادات الأداء */}
        <div className="mobile-card p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            إعدادات الأداء
          </h2>
          
          <div className="space-y-4">
            {/* تحميل الصور تلقائياً */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  تحميل الصور تلقائياً
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  توفير استهلاك البيانات
                </p>
              </div>
              <MobileButton
                variant={settings.performance.autoLoadImages ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => updateSetting('performance', { autoLoadImages: !settings.performance.autoLoadImages })}
                className="p-2"
              >
                {settings.performance.autoLoadImages ? (
                  <Upload className="w-4 h-4" />
                ) : (
                  <WifiOff className="w-4 h-4" />
                )}
              </MobileButton>
            </div>

            {/* المزامنة في الخلفية */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  المزامنة في الخلفية
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  تحديث المحتوى تلقائياً
                </p>
              </div>
              <MobileButton
                variant={settings.performance.backgroundSync ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => updateSetting('performance', { backgroundSync: !settings.performance.backgroundSync })}
                className="p-2"
              >
                {settings.performance.backgroundSync ? (
                  <Wifi className="w-4 h-4" />
                ) : (
                  <WifiOff className="w-4 h-4" />
                )}
              </MobileButton>
            </div>

            {/* الوضع غير المتصل */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  الوضع غير المتصل
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  حفظ المحتوى للقراءة لاحقاً
                </p>
              </div>
              <MobileButton
                variant={settings.performance.offlineMode ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => updateSetting('performance', { offlineMode: !settings.performance.offlineMode })}
                className="p-2"
              >
                {settings.performance.offlineMode ? (
                  <Download className="w-4 h-4" />
                ) : (
                  <Wifi className="w-4 h-4" />
                )}
              </MobileButton>
            </div>
          </div>
        </div>

        {/* إعدادات الإشعارات */}
        {featureSupport.notifications && (
          <div className="mobile-card p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              إعدادات الإشعارات
            </h2>
            
            <div className="space-y-4">
              {/* تفعيل الإشعارات */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    الإشعارات
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    تلقي إشعارات التطبيق
                  </p>
                </div>
                <MobileButton
                  variant={settings.notifications.enabled ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => updateSetting('notifications', { enabled: !settings.notifications.enabled })}
                  className="p-2"
                >
                  <Bell className="w-4 h-4" />
                </MobileButton>
              </div>

              {/* إشعارات المقالات الجديدة */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    المقالات الجديدة
                  </label>
                </div>
                <MobileButton
                  variant={settings.notifications.types.newArticles ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => updateSetting('notifications', { 
                    types: { ...settings.notifications.types, newArticles: !settings.notifications.types.newArticles }
                  })}
                  className="p-2"
                >
                  {settings.notifications.types.newArticles ? '✓' : '○'}
                </MobileButton>
              </div>

              {/* الأخبار العاجلة */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    الأخبار العاجلة
                  </label>
                </div>
                <MobileButton
                  variant={settings.notifications.types.breaking ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => updateSetting('notifications', { 
                    types: { ...settings.notifications.types, breaking: !settings.notifications.types.breaking }
                  })}
                  className="p-2"
                >
                  {settings.notifications.types.breaking ? '✓' : '○'}
                </MobileButton>
              </div>
            </div>
          </div>
        )}

        {/* إعدادات الأمان */}
        <div className="mobile-card p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            إعدادات الأمان
          </h2>
          
          <div className="space-y-4">
            {/* القفل التلقائي */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  القفل التلقائي
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  قفل التطبيق عند عدم الاستخدام
                </p>
              </div>
              <MobileButton
                variant={settings.security.autoLock ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => updateSetting('security', { autoLock: !settings.security.autoLock })}
                className="p-2"
              >
                <Shield className="w-4 h-4" />
              </MobileButton>
            </div>
          </div>
        </div>

        {/* أزرار الإجراءات */}
        <div className="space-y-3">
          <MobileButton
            onClick={handleSaveSettings}
            className="w-full flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            حفظ الإعدادات
          </MobileButton>
          
          <MobileButton
            variant="secondary"
            onClick={resetSettings}
            className="w-full flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            إعادة تعيين للافتراضي
          </MobileButton>
        </div>

        {/* معلومات الدعم */}
        <div className="mobile-card p-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            دعم الميزات على هذا الجهاز:
          </p>
          <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
            <div className={`p-2 rounded ${featureSupport.notifications ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              إشعارات: {featureSupport.notifications ? '✓' : '✗'}
            </div>
            <div className={`p-2 rounded ${featureSupport.vibration ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              اهتزاز: {featureSupport.vibration ? '✓' : '✗'}
            </div>
            <div className={`p-2 rounded ${featureSupport.touchScreen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              شاشة لمس: {featureSupport.touchScreen ? '✓' : '✗'}
            </div>
            <div className={`p-2 rounded ${featureSupport.share ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              مشاركة: {featureSupport.share ? '✓' : '✗'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// تصدير المكون مع تحميل ديناميكي لتجنب أخطاء SSR
export default dynamic(() => Promise.resolve(MobileSettingsPage), {
  ssr: false,
  loading: () => (
    <div className="device-mobile min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
});
