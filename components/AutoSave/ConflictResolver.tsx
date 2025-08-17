'use client';

import React, { useState } from 'react';
import { SavedVersion } from '@/lib/services/AutoSaveService';
import { AlertTriangle, Clock, User, Monitor, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConflictResolverProps {
  conflicts: SavedVersion[];
  currentVersion: SavedVersion | null;
  onResolve: (versionId: string, action: 'keep' | 'merge' | 'discard') => Promise<void>;
  onCancel: () => void;
  isOpen: boolean;
}

const ConflictResolver: React.FC<ConflictResolverProps> = ({
  conflicts,
  currentVersion,
  onResolve,
  onCancel,
  isOpen
}) => {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [showPreview, setShowPreview] = useState<string | null>(null);

  if (!isOpen || conflicts.length === 0) return null;

  const handleResolve = async (action: 'keep' | 'merge' | 'discard') => {
    if (!selectedVersion && action !== 'discard') return;

    setIsResolving(true);
    try {
      await onResolve(selectedVersion || conflicts[0].id, action);
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
    } finally {
      setIsResolving(false);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleString('ar', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getDeviceIcon = (deviceInfo: string) => {
    if (deviceInfo.toLowerCase().includes('mobile')) {
      return '📱';
    } else if (deviceInfo.toLowerCase().includes('tablet')) {
      return '📱';
    }
    return '💻';
  };

  const formatContentPreview = (content: any) => {
    if (typeof content === 'string') {
      return (content && typeof content === 'string') 
  ? content.substring(0, 200) + (content.length > 200 ? '...' : '')
  : 'محتوى غير صالح';
    }
    
    if (typeof content === 'object') {
      try {
        const jsonStr = JSON.stringify(content, null, 2);
        return jsonStr.substring(0, 200) + (jsonStr.length > 200 ? '...' : '');
      } catch {
        return 'محتوى غير قابل للعرض';
      }
    }
    
    return String(content).substring(0, 200);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                حل تضارب النسخ
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                تم العثور على {conflicts.length} نسخة متضاربة. اختر كيفية حل التضارب.
              </p>
            </div>
          </div>
          <Button
            onClick={onCancel}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* النسخة الحالية */}
          {currentVersion && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                النسخة الحالية
              </h3>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-blue-900 dark:text-blue-100">
                        النسخة النشطة
                      </div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">
                        {formatTimestamp(currentVersion.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                    <span>{getDeviceIcon(currentVersion.metadata.deviceInfo)}</span>
                    <User className="w-4 h-4" />
                    <span>{currentVersion.metadata.userId || 'مجهول'}</span>
                  </div>
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  الحجم: {(currentVersion.size / 1024).toFixed(1)} KB
                </div>
              </div>
            </div>
          )}

          {/* النسخ المتضاربة */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
              النسخ المتضاربة
            </h3>
            <div className="space-y-3">
              {conflicts.map((version, index) => (
                <div
                  key={version.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedVersion === version.id
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedVersion(version.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedVersion === version.id
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedVersion === version.id && (
                          <Check className="w-2 h-2 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          نسخة متضاربة {index + 1}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {formatTimestamp(version.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>{getDeviceIcon(version.metadata.deviceInfo)}</span>
                        <User className="w-4 h-4" />
                        <span>{version.metadata.userId || 'مجهول'}</span>
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPreview(showPreview === version.id ? null : version.id);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        {showPreview === version.id ? 'إخفاء' : 'معاينة'}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>الحجم: {(version.size / 1024).toFixed(1)} KB</span>
                    <span>الجلسة: {version.metadata.sessionId.substring(0, 8)}...</span>
                  </div>

                  {/* معاينة المحتوى */}
                  {showPreview === version.id && (
                    <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-700 rounded border">
                      <h4 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                        معاينة المحتوى:
                      </h4>
                      <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap overflow-auto max-h-32">
                        {formatContentPreview(version.content)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* خيارات الحل */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
              خيارات حل التضارب
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                onClick={() => handleResolve('keep')}
                disabled={!selectedVersion || isResolving}
                className="flex flex-col items-center gap-2 h-auto py-4 bg-green-600 hover:bg-green-700"
              >
                <Check className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-medium">الاحتفاظ بالمختارة</div>
                  <div className="text-xs opacity-80">
                    استخدام النسخة المختارة وحذف الباقي
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => handleResolve('merge')}
                disabled={!selectedVersion || isResolving}
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <Monitor className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-medium">دمج النسخ</div>
                  <div className="text-xs opacity-80">
                    محاولة دمج التغييرات معاً
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => handleResolve('discard')}
                disabled={isResolving}
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4 border-red-300 text-red-700 hover:bg-red-50"
              >
                <X className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-medium">حذف المتضاربة</div>
                  <div className="text-xs opacity-80">
                    حذف جميع النسخ المتضاربة
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            💡 نصيحة: اختر النسخة الأحدث أو التي تحتوي على أهم التغييرات
          </div>
          <div className="flex gap-3">
            <Button
              onClick={onCancel}
              variant="outline"
              disabled={isResolving}
            >
              إلغاء
            </Button>
          </div>
        </div>

        {/* Loading overlay */}
        {isResolving && (
          <div className="absolute inset-0 bg-white bg-opacity-75 dark:bg-gray-800 dark:bg-opacity-75 flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-900 dark:text-gray-100">جاري حل التضارب...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConflictResolver;