// مثال شامل لاستخدام نظام تتبع سلوك المستخدم - سبق الذكية
'use client';

import React, { useState, useEffect } from 'react';
import { useUserTracking, useArticleTracking, usePerformanceTracking } from '@/hooks/useUserTracking';
import PrivacyConsentModal from '@/components/privacy/PrivacyConsentModal';
import PrivacyManager, { PrivacyLevel } from '@/lib/tracking/privacy-manager';
import { Shield, BarChart3, Eye, Clock, TrendingUp, Settings } from 'lucide-react';

// مكون لعرض حالة التتبع
const TrackingStatus: React.FC = () => {
  const tracking = useUserTracking({
    enableInteractionTracking: true,
    enableReadingTracking: true,
    enableScrollTracking: true,
    debug: true
  });

  const [privacySettings, setPrivacySettings] = useState(PrivacyManager.loadPrivacySettings());

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-blue-500" />
        حالة نظام التتبع
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
            tracking.isInitialized ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <p className="text-sm text-gray-600 dark:text-gray-400">النظام</p>
          <p className="text-xs font-medium">
            {tracking.isInitialized ? 'نشط' : 'غير نشط'}
          </p>
        </div>

        <div className="text-center">
          <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
            tracking.isTrackingReading ? 'bg-blue-500' : 'bg-gray-400'
          }`} />
          <p className="text-sm text-gray-600 dark:text-gray-400">تتبع القراءة</p>
          <p className="text-xs font-medium">
            {tracking.isTrackingReading ? 'يعمل' : 'متوقف'}
          </p>
        </div>

        <div className="text-center">
          <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
            privacySettings.userConsent ? 'bg-green-500' : 'bg-orange-500'
          }`} />
          <p className="text-sm text-gray-600 dark:text-gray-400">الموافقة</p>
          <p className="text-xs font-medium">
            {privacySettings.userConsent ? 'مفعلة' : 'مطلوبة'}
          </p>
        </div>

        <div className="text-center">
          <div className="w-3 h-3 rounded-full mx-auto mb-2 bg-purple-500" />
          <p className="text-sm text-gray-600 dark:text-gray-400">الخصوصية</p>
          <p className="text-xs font-medium">
            {privacySettings.level === PrivacyLevel.MINIMAL ? 'عالية' :
             privacySettings.level === PrivacyLevel.BALANCED ? 'متوازنة' :
             privacySettings.level === PrivacyLevel.FULL ? 'مفتوحة' : 'مغلقة'}
          </p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          معرف الجلسة: <span className="font-mono">{tracking.sessionId}</span>
        </p>
      </div>
    </div>
  );
};

// مكون تفاعلي لاختبار التتبع
const InteractiveDemo: React.FC = () => {
  const tracking = useArticleTracking('demo-article-123', { debug: true });
  const [selectedText, setSelectedText] = useState('');
  const [interactionCount, setInteractionCount] = useState(0);

  const handleInteraction = (type: string) => {
    setInteractionCount(prev => prev + 1);
    
    switch (type) {
      case 'like':
        tracking.trackLike();
        break;
      case 'save':
        tracking.trackSave();
        break;
      case 'share':
        tracking.trackShare('demo');
        break;
      case 'comment':
        tracking.trackComment();
        break;
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      const text = selection.toString();
      setSelectedText(text);
      tracking.highlightText(text, 0, text.length);
    }
  };

  useEffect(() => {
    // محاكاة تحديث القسم أثناء التمرير
    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      
      if (scrollPercentage > 70) {
        tracking.updateReadingSection('conclusion');
      } else if (scrollPercentage > 30) {
        tracking.updateReadingSection('main_content');
      } else {
        tracking.updateReadingSection('introduction');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tracking]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Eye className="w-5 h-5 text-green-500" />
        عرض تفاعلي للتتبع
      </h3>

      <div className="space-y-4">
        {/* محتوى للقراءة */}
        <div 
          className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer select-text"
          onMouseUp={handleTextSelection}
        >
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            مقال تجريبي لاختبار نظام التتبع
          </h4>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            هذا نص تجريبي لاختبار نظام تتبع سلوك القراءة في موقع سبق الذكية. 
            يمكنك تحديد أجزاء من النص لمشاهدة كيف يتم تتبع عمليات التمييز. 
            النظام يرصد أيضاً وقت القراءة، نسبة التمرير، والتفاعلات المختلفة مع المحتوى.
            جرب التمرير لأسفل ولأعلى لمشاهدة تغيير الأقسام.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
            يتميز نظام التتبع بحماية عالية للخصوصية مع إمكانية تخصيص مستوى البيانات المجمعة.
            جميع البيانات الحساسة مشفرة ويمكن للمستخدم حذفها في أي وقت.
            النظام يحلل أنماط القراءة لتقديم تجربة أفضل وتوصيات أكثر دقة.
          </p>
        </div>

        {/* أزرار التفاعل */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleInteraction('like')}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            ❤️ إعجاب
          </button>
          <button
            onClick={() => handleInteraction('save')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            🔖 حفظ
          </button>
          <button
            onClick={() => handleInteraction('share')}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            📤 مشاركة
          </button>
          <button
            onClick={() => handleInteraction('comment')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
          >
            💬 تعليق
          </button>
        </div>

        {/* معلومات التفاعل */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>عدد التفاعلات:</strong> {interactionCount}
          </p>
          {selectedText && (
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
              <strong>النص المحدد:</strong> "{selectedText.substring(0, 50)}..."
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// مكون لعرض رؤى القراءة
const ReadingInsights: React.FC = () => {
  const tracking = useUserTracking();
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    if (tracking.readingInsights) {
      setInsights(tracking.readingInsights);
    }
  }, [tracking.readingInsights]);

  if (!insights) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-orange-500" />
          رؤى القراءة
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          اقرأ بعض المحتوى أولاً للحصول على الرؤى...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-orange-500" />
        رؤى القراءة
      </h3>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">الوقت والمدة</h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            مدة القراءة: {insights.duration_seconds} ثانية
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            نسبة القراءة: {insights.read_percentage}%
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h4 className="font-medium text-green-900 dark:text-green-200 mb-2">التفاعل</h4>
          <p className="text-sm text-green-700 dark:text-green-300">
            عمق التمرير: {insights.scroll_depth}%
          </p>
          <p className="text-sm text-green-700 dark:text-green-300">
            التوقفات: {insights.pause_points?.length || 0}
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <h4 className="font-medium text-purple-900 dark:text-purple-200 mb-2">السلوك</h4>
          <p className="text-sm text-purple-700 dark:text-purple-300">
            التفاعلات: {insights.interactions?.length || 0}
          </p>
          <p className="text-sm text-purple-700 dark:text-purple-300">
            النصوص المميزة: {insights.highlights?.length || 0}
          </p>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
          <h4 className="font-medium text-orange-900 dark:text-orange-200 mb-2">الجهاز</h4>
          <p className="text-sm text-orange-700 dark:text-orange-300">
            الاتجاه: {insights.device_orientation === 'portrait' ? 'عمودي' : 'أفقي'}
          </p>
          <p className="text-sm text-orange-700 dark:text-orange-300">
            الثيم: {insights.reading_environment?.theme === 'dark' ? 'داكن' : 'فاتح'}
          </p>
        </div>
      </div>
    </div>
  );
};

// مكون لعرض معلومات الأداء
const PerformanceMetrics: React.FC = () => {
  const performanceData = usePerformanceTracking();

  if (!performanceData) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-red-500" />
        مقاييس الأداء
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-500">
            {Math.round(performanceData.page_load_time)}ms
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">تحميل الصفحة</p>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-blue-500">
            {Math.round(performanceData.dom_ready_time)}ms
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">جاهزية DOM</p>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-green-500">
            {Math.round(performanceData.first_contentful_paint)}ms
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">أول محتوى</p>
        </div>
      </div>
    </div>
  );
};

// مكون إدارة الخصوصية
const PrivacyControls: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [settings, setSettings] = useState(PrivacyManager.loadPrivacySettings());

  const handleSettingsUpdate = (newSettings: any) => {
    setSettings(newSettings);
    setShowModal(false);
  };

  const handleExportData = async () => {
    try {
      const result = await PrivacyManager.exportUserData('demo-user');
      if (result.success) {
        const blob = new Blob([JSON.stringify(result.data, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'my-sabq-data.json';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('خطأ في تصدير البيانات:', error);
    }
  };

  const handleDeleteData = async () => {
    if (confirm('هل أنت متأكد من حذف جميع بياناتك؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      const result = await PrivacyManager.requestDataDeletion('demo-user');
      if (result) {
        alert('تم حذف بياناتك بنجاح');
        setSettings(PrivacyManager.loadPrivacySettings());
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5 text-blue-500" />
        إدارة الخصوصية
      </h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">مستوى الخصوصية</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {settings.level === PrivacyLevel.MINIMAL ? 'الحد الأدنى - حماية عالية' :
               settings.level === PrivacyLevel.BALANCED ? 'متوازن - الافتراضي' :
               settings.level === PrivacyLevel.FULL ? 'كامل - تخصيص متقدم' : 'مغلق'}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportData}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
          >
            📤 تصدير بياناتي
          </button>
          
          <button
            onClick={handleDeleteData}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
          >
            🗑️ حذف بياناتي
          </button>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 border-t pt-3">
          آخر موافقة: {settings.consentTimestamp ? 
            new Date(settings.consentTimestamp).toLocaleDateString('ar-SA') : 'غير متاح'}
          <br />
          إصدار الموافقة: {settings.consentVersion}
        </div>
      </div>

      <PrivacyConsentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAccept={handleSettingsUpdate}
      />
    </div>
  );
};

// المكون الرئيسي
const TrackingSystemDemo: React.FC = () => {
  const [showConsentModal, setShowConsentModal] = useState(false);

  useEffect(() => {
    // التحقق من الموافقة عند التحميل
    const needsConsent = !PrivacyManager.validateConsent();
    if (needsConsent) {
      setShowConsentModal(true);
    }
  }, []);

  const handleConsentAccept = (settings: any) => {
    setShowConsentModal(false);
    // إعادة تحميل الصفحة لتطبيق الإعدادات الجديدة
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            عرض توضيحي لنظام تتبع سلوك المستخدم
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            سبق الذكية - نظام تتبع متقدم يحترم الخصوصية
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <TrackingStatus />
          <PrivacyControls />
        </div>

        <div className="grid lg:grid-cols-1 gap-6 mb-6">
          <InteractiveDemo />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <ReadingInsights />
          <PerformanceMetrics />
        </div>
      </div>

      <PrivacyConsentModal
        isOpen={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        onAccept={handleConsentAccept}
        forcedUpdate={true}
      />
    </div>
  );
};

export default TrackingSystemDemo;
