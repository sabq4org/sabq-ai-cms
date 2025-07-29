'use client';

import React from 'react';
import { 
  Brain, 
  Key, 
  Zap, 
  Check, 
  AlertCircle, 
  RefreshCw,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useOpenAISettings } from '@/hooks/useOpenAISettings';
import { toast } from 'react-hot-toast';

export default function AISettingsPage() {
  const {
    settings,
    loading,
    saving,
    saveSettings,
    testConnection,
    deleteKey,
    updateLocalSettings
  } = useOpenAISettings();

  const [apiKey, setApiKey] = React.useState('');
  const [showKey, setShowKey] = React.useState(false);
  const [testing, setTesting] = React.useState(false);

  React.useEffect(() => {
    if (settings?.openai?.apiKey) {
      setApiKey(settings.openai.apiKey);
    }
  }, [settings]);

  const handleSaveKey = async () => {
    if (!apiKey || apiKey.trim() === '') {
      toast.error('يرجى إدخال المفتاح');
      return;
    }

    if (apiKey === 'sk-...****...' || apiKey === settings?.openai?.apiKey) {
      toast('لم يتم تغيير المفتاح', { icon: 'ℹ️' });
      return;
    }

    const success = await saveSettings({
      openai: {
        model: settings?.openai?.model || 'gpt-4o',
        maxTokens: settings?.openai?.maxTokens || 2000,
        temperature: settings?.openai?.temperature || 0.7,
        ...settings?.openai,
        apiKey: apiKey.trim()
      }
    });

    if (success) {
      setShowKey(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    await testConnection(apiKey !== 'sk-...****...' ? apiKey : undefined);
    setTesting(false);
  };

  const handleDeleteKey = async () => {
    if (confirm('هل أنت متأكد من حذف المفتاح؟')) {
      const success = await deleteKey();
      if (success) {
        setApiKey('');
      }
    }
  };

  const handleFeatureToggle = async (feature: string) => {
    const defaultFeatures = {
      aiEditor: false,
      analytics: false,
      notifications: false,
      deepAnalysis: false,
      smartLinks: false,
      commentModeration: false
    };
    
    const currentFeatures = settings?.features || defaultFeatures;
    const newFeatures = {
      ...defaultFeatures,
      ...currentFeatures,
      [feature]: !currentFeatures[feature as keyof typeof currentFeatures]
    };

    await saveSettings({ features: newFeatures });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* العنوان */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Brain className="w-8 h-8 text-blue-600" />
          إعدادات الذكاء الاصطناعي
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          قم بتكوين مفتاح OpenAI API وإدارة ميزات الذكاء الاصطناعي
        </p>
      </div>

      {/* بطاقة إعدادات المفتاح */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-gray-600" />
          مفتاح OpenAI API
        </h2>

        <div className="space-y-4">
          {/* حقل المفتاح */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              المفتاح السري
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-4 py-2 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {settings?.openai?.hasKey && apiKey === 'sk-...****...' && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                ✓ مفتاح محفوظ مسبقاً
              </p>
            )}
          </div>

          {/* أزرار التحكم */}
          <div className="flex gap-3">
            <button
              onClick={handleSaveKey}
              disabled={saving || !apiKey || apiKey === 'sk-...****...'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              حفظ المفتاح
            </button>

            <button
              onClick={handleTestConnection}
              disabled={testing || !settings?.openai?.hasKey}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {testing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              اختبار الاتصال
            </button>

            {settings?.openai?.hasKey && (
              <button
                onClick={handleDeleteKey}
                disabled={saving}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                حذف المفتاح
              </button>
            )}
          </div>
        </div>

        {/* رسالة تحذيرية */}
        <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
              ملاحظة مهمة:
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
              احتفظ بمفتاحك السري آمناً. يمكنك الحصول على مفتاح من{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-amber-900 dark:hover:text-amber-200"
              >
                لوحة تحكم OpenAI
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* بطاقة الميزات */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-gray-600" />
          الميزات المتاحة
        </h2>

        <div className="grid gap-4">
          {Object.entries({
            aiEditor: 'المحرر الذكي',
            analytics: 'التحليلات الذكية',
            notifications: 'الإشعارات الذكية',
            deepAnalysis: 'التحليل العميق',
            smartLinks: 'الروابط الذكية',
            commentModeration: 'مراجعة التعليقات بالذكاء الاصطناعي'
          }).map(([key, label]) => (
            <label
              key={key}
              className="flex items-center justify-between p-3 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
            >
              <span className="text-gray-700 dark:text-gray-300">{label}</span>
              <input
                type="checkbox"
                checked={settings?.features?.[key as keyof typeof settings.features] || false}
                onChange={() => handleFeatureToggle(key)}
                disabled={saving}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}