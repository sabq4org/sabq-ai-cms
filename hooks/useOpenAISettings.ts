import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface OpenAISettings {
  openai: {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
    hasKey?: boolean;
  };
  features: {
    aiEditor: boolean;
    analytics: boolean;
    notifications: boolean;
    deepAnalysis: boolean;
    smartLinks: boolean;
    commentModeration: boolean;
  };
}

export function useOpenAISettings() {
  const [settings, setSettings] = useState<OpenAISettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // جلب الإعدادات
  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/settings/openai');
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('خطأ في جلب إعدادات OpenAI:', error);
      toast.error('فشل في جلب الإعدادات');
    } finally {
      setLoading(false);
    }
  }, []);

  // حفظ الإعدادات
  const saveSettings = useCallback(async (newSettings: Partial<OpenAISettings>) => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.data);
        toast.success('تم حفظ الإعدادات بنجاح');
        return true;
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('خطأ في حفظ إعدادات OpenAI:', error);
      toast.error(error.message || 'فشل في حفظ الإعدادات');
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  // اختبار الاتصال
  const testConnection = useCallback(async (apiKey?: string) => {
    try {
      const keyToTest = apiKey || settings?.openai?.apiKey;
      
      if (!keyToTest || keyToTest === 'sk-...****...') {
        toast.error('يرجى إدخال مفتاح صالح');
        return false;
      }
      
      const response = await fetch('/api/ai/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: keyToTest })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('تم الاتصال بنجاح!');
        return true;
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('خطأ في اختبار الاتصال:', error);
      toast.error(error.message || 'فشل الاتصال');
      return false;
    }
  }, [settings]);

  // حذف المفتاح
  const deleteKey = useCallback(async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings/openai', {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSettings(prev => prev ? {
          ...prev,
          openai: { ...prev.openai, apiKey: '', hasKey: false }
        } : null);
        toast.success('تم حذف المفتاح بنجاح');
        return true;
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('خطأ في حذف المفتاح:', error);
      toast.error(error.message || 'فشل في حذف المفتاح');
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  // تحديث الإعدادات محلياً
  const updateLocalSettings = useCallback((updates: Partial<OpenAISettings>) => {
    setSettings(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    saving,
    saveSettings,
    testConnection,
    deleteKey,
    updateLocalSettings,
    refetch: fetchSettings
  };
} 