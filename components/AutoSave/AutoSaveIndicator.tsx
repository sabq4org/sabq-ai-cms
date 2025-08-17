'use client';

import React, { useState } from 'react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { 
  Save, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Loader2, 
  History,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AutoSaveIndicatorProps {
  editorKey: string;
  content: any;
  onRestore?: (content: any) => void;
  className?: string;
}

const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  editorKey,
  content,
  onRestore,
  className = ''
}) => {
  const [showVersions, setShowVersions] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const {
    state,
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    versions,
    conflicts,
    save,
    restore,
    resolveConflict
  } = useAutoSave({
    key: editorKey,
    interval: 30000, // 30 ثانية
    maxVersions: 20,
    enableCloudSync: true,
    onRestore,
    onError: (error) => {
      console.error('AutoSave Error:', error);
    }
  });

  // مراقبة حالة الاتصال
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // حفظ يدوي
  const handleManualSave = async () => {
    try {
      await save(content, true);
    } catch (error) {
      console.error('Manual save failed:', error);
    }
  };

  // استعادة نسخة
  const handleRestore = async (versionId?: string) => {
    try {
      await restore(versionId);
      setShowVersions(false);
    } catch (error) {
      console.error('Restore failed:', error);
    }
  };

  // حل تضارب
  const handleResolveConflict = async (versionId: string, action: 'keep' | 'merge' | 'discard') => {
    try {
      await resolveConflict(versionId, action);
    } catch (error) {
      console.error('Conflict resolution failed:', error);
    }
  };

  // تحديد لون المؤشر
  const getIndicatorColor = () => {
    if (conflicts.length > 0) return 'text-red-500';
    if (isSaving) return 'text-blue-500';
    if (hasUnsavedChanges) return 'text-yellow-500';
    return 'text-green-500';
  };

  // تحديد أيقونة المؤشر
  const getIndicatorIcon = () => {
    if (conflicts.length > 0) return AlertTriangle;
    if (isSaving) return Loader2;
    if (hasUnsavedChanges) return Clock;
    return CheckCircle;
  };

  const IndicatorIcon = getIndicatorIcon();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* مؤشر حالة الاتصال */}
      <div className="flex items-center gap-1">
        {isOnline ? (
          <Wifi className="w-4 h-4 text-green-500" title="متصل" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-500" title="غير متصل" />
        )}
      </div>

      {/* مؤشر حالة الحفظ */}
      <div className="flex items-center gap-2">
        <IndicatorIcon 
          className={`w-4 h-4 ${getIndicatorColor()} ${isSaving ? 'animate-spin' : ''}`}
        />
        
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {conflicts.length > 0 && 'تضارب في النسخ'}
          {isSaving && 'جاري الحفظ...'}
          {!isSaving && hasUnsavedChanges && 'تغييرات غير محفوظة'}
          {!isSaving && !hasUnsavedChanges && lastSaved && (
            `آخر حفظ: ${lastSaved.toLocaleTimeString('ar')}`
          )}
          {!isSaving && !hasUnsavedChanges && !lastSaved && 'لم يتم الحفظ بعد'}
        </span>
      </div>

      {/* أزرار التحكم */}
      <div className="flex items-center gap-1">
        {/* حفظ يدوي */}
        <Button
          onClick={handleManualSave}
          disabled={isSaving}
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          title="حفظ يدوي"
        >
          <Save className="w-4 h-4" />
        </Button>

        {/* عرض النسخ */}
        <Button
          onClick={() => setShowVersions(!showVersions)}
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          title="عرض النسخ المحفوظة"
        >
          <History className="w-4 h-4" />
          {versions.length > 0 && (
            <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1 rounded">
              {versions.length}
            </span>
          )}
        </Button>
      </div>

      {/* تنبيه التضارب */}
      {conflicts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-red-800">
              تم اكتشاف تضارب في النسخ ({conflicts.length})
            </span>
          </div>
          <div className="flex gap-2">
            {conflicts.map((conflict) => (
              <div key={conflict.id} className="flex gap-1">
                <Button
                  onClick={() => handleResolveConflict(conflict.id, 'keep')}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  اختيار هذه النسخة
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* قائمة النسخ */}
      {showVersions && (
        <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[300px] z-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              النسخ المحفوظة
            </h3>
            <Button
              onClick={() => setShowVersions(false)}
              variant="ghost"
              size="sm"
            >
              إغلاق
            </Button>
          </div>

          {versions.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              لا توجد نسخ محفوظة
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      نسخة {index + 1}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {version.timestamp.toLocaleString('ar')}
                    </div>
                    <div className="text-xs text-gray-400">
                      الحجم: {(version.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <Button
                    onClick={() => handleRestore(version.id)}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                  >
                    استعادة
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutoSaveIndicator;