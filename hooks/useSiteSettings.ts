'use client';

import { useState, useEffect } from 'react';

interface SiteSettings {
  identity?: {
    logo?: string;
    logoDarkUrl?: string;
    siteName?: string;
  };
  general?: {
    logoUrl?: string;
    logoDarkUrl?: string;
    siteName?: string;
  };
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        
        if (data.success && data.data) {
          setSettings(data.data);
        }
      } catch (error) {
        console.error('خطأ في جلب الإعدادات:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // جلب رابط الشعار من الإعدادات
  const logoUrl = loading ? null : (settings.general?.logoUrl || settings.identity?.logo || '/logo.png');
  const logoDarkUrl = loading ? null : (settings.general?.logoDarkUrl || settings.identity?.logoDarkUrl || logoUrl);
  const siteName = settings.general?.siteName || settings.identity?.siteName || 'صحيفة سبق الإلكترونية';

  return {
    settings,
    logoUrl,
    logoDarkUrl,
    siteName,
    loading
  };
}