/**
 * 📱 إعدادات الهواتف الذكية
 * ملف إعدادات مخصص للتجربة المحمولة
 */

export interface MobileSettings {
  // إعدادات العرض
  display: {
    theme: 'auto' | 'light' | 'dark';
    fontSize: 'small' | 'medium' | 'large';
    compactMode: boolean;
    highContrast: boolean;
  };
  
  // إعدادات التفاعل
  interaction: {
    hapticFeedback: boolean;
    soundEffects: boolean;
    gestureNavigation: boolean;
    pullToRefresh: boolean;
    swipeActions: boolean;
  };
  
  // إعدادات الأداء
  performance: {
    autoLoadImages: boolean;
    backgroundSync: boolean;
    offlineMode: boolean;
    dataCompression: boolean;
    cacheDuration: number; // بالدقائق
  };
  
  // إعدادات الإشعارات
  notifications: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
    badge: boolean;
    types: {
      newArticles: boolean;
      comments: boolean;
      updates: boolean;
      breaking: boolean;
    };
  };
  
  // إعدادات المحرر
  editor: {
    autoSave: boolean;
    saveInterval: number; // بالثواني
    showPreview: boolean;
    spellCheck: boolean;
    wordWrap: boolean;
    lineNumbers: boolean;
  };
  
  // إعدادات الأمان
  security: {
    biometricLogin: boolean;
    autoLock: boolean;
    lockTimeout: number; // بالدقائق
    sessionTimeout: number; // بالساعات
  };
}

export const DEFAULT_MOBILE_SETTINGS: MobileSettings = {
  display: {
    theme: 'auto',
    fontSize: 'medium',
    compactMode: false,
    highContrast: false,
  },
  interaction: {
    hapticFeedback: true,
    soundEffects: false,
    gestureNavigation: true,
    pullToRefresh: true,
    swipeActions: true,
  },
  performance: {
    autoLoadImages: true,
    backgroundSync: true,
    offlineMode: false,
    dataCompression: true,
    cacheDuration: 60, // ساعة واحدة
  },
  notifications: {
    enabled: true,
    sound: true,
    vibration: true,
    badge: true,
    types: {
      newArticles: true,
      comments: true,
      updates: false,
      breaking: true,
    },
  },
  editor: {
    autoSave: true,
    saveInterval: 30, // 30 ثانية
    showPreview: true,
    spellCheck: true,
    wordWrap: true,
    lineNumbers: false,
  },
  security: {
    biometricLogin: false,
    autoLock: false,
    lockTimeout: 5, // 5 دقائق
    sessionTimeout: 24, // 24 ساعة
  },
};

/**
 * خطاف لإدارة إعدادات الهاتف
 */
import { useState, useEffect } from 'react';

export function useMobileSettings() {
  const [settings, setSettings] = useState<MobileSettings>(DEFAULT_MOBILE_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // تحميل الإعدادات من التخزين المحلي
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('mobile-settings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettings({ ...DEFAULT_MOBILE_SETTINGS, ...parsed });
        }
      } catch (error) {
        console.error('Error loading mobile settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // حفظ الإعدادات
  const saveSettings = (newSettings: Partial<MobileSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    try {
      localStorage.setItem('mobile-settings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error saving mobile settings:', error);
    }
  };

  // تحديث إعداد محدد
  const updateSetting = <K extends keyof MobileSettings>(
    category: K,
    updates: Partial<MobileSettings[K]>
  ) => {
    saveSettings({
      [category]: { ...settings[category], ...updates }
    } as Partial<MobileSettings>);
  };

  // إعادة تعيين الإعدادات للافتراضية
  const resetSettings = () => {
    setSettings(DEFAULT_MOBILE_SETTINGS);
    localStorage.removeItem('mobile-settings');
  };

  return {
    settings,
    isLoading,
    saveSettings,
    updateSetting,
    resetSettings,
  };
}

/**
 * خطاف لإدارة الوضع الداكن والفاتح
 */
export function useMobileTheme() {
  const { settings, updateSetting } = useMobileSettings();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      if (settings.display.theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDark(prefersDark);
      } else {
        setIsDark(settings.display.theme === 'dark');
      }
    };

    updateTheme();

    if (settings.display.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => updateTheme();
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [settings.display.theme]);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    updateSetting('display', { theme: newTheme });
  };

  const setTheme = (theme: 'auto' | 'light' | 'dark') => {
    updateSetting('display', { theme });
  };

  return {
    isDark,
    theme: settings.display.theme,
    toggleTheme,
    setTheme,
  };
}

/**
 * خطاف للتحكم في الاهتزاز اللمسي
 */
export function useHapticFeedback() {
  const { settings } = useMobileSettings();

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (!settings.interaction.hapticFeedback) return;

    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [50],
      };
      navigator.vibrate(patterns[type]);
    }
  };

  return { triggerHaptic };
}

/**
 * خطاف لإدارة الإشعارات
 */
export function useMobileNotifications() {
  const { settings, updateSetting } = useMobileSettings();

  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        updateSetting('notifications', { enabled: true });
      }
      return permission;
    }
    return 'denied';
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (!settings.notifications.enabled || Notification.permission !== 'granted') {
      return;
    }

    const notification = new Notification(title, {
      ...options,
      badge: settings.notifications.badge ? '/icon-192x192.png' : undefined,
      silent: !settings.notifications.sound,
    });

    if (settings.notifications.vibration && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    return notification;
  };

  return {
    settings: settings.notifications,
    requestPermission,
    showNotification,
    updateSettings: (updates: Partial<MobileSettings['notifications']>) =>
      updateSetting('notifications', updates),
  };
}

/**
 * خطاف لإدارة وضع عدم الاتصال
 */
export function useOfflineMode() {
  const { settings } = useMobileSettings();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const canUseOfflineFeatures = settings.performance.offlineMode && !isOnline;

  return {
    isOnline,
    isOffline: !isOnline,
    canUseOfflineFeatures,
    offlineEnabled: settings.performance.offlineMode,
  };
}

/**
 * مساعدات CSS للإعدادات
 */
export function getMobileClasses(settings: MobileSettings) {
  const classes = ['device-mobile'];

  // إضافة فئات الموضوع
  if (settings.display.theme === 'dark') {
    classes.push('dark');
  }

  // إضافة فئات حجم الخط
  classes.push(`text-${settings.display.fontSize}`);

  // إضافة فئة الوضع المضغوط
  if (settings.display.compactMode) {
    classes.push('compact-mode');
  }

  // إضافة فئة التباين العالي
  if (settings.display.highContrast) {
    classes.push('high-contrast');
  }

  return classes.join(' ');
}

/**
 * تحقق من دعم الميزات
 */
export function checkMobileFeatureSupport() {
  return {
    notifications: 'Notification' in window,
    serviceWorker: 'serviceWorker' in navigator,
    vibration: 'vibrate' in navigator,
    geolocation: 'geolocation' in navigator,
    camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
    touchScreen: 'ontouchstart' in window,
    orientation: 'orientation' in window || ('screen' in window && screen && 'orientation' in screen),
    share: 'share' in navigator,
    clipboard: 'clipboard' in navigator,
    fullscreen: 'requestFullscreen' in document.documentElement,
  };
}
