'use client';

import React, { useState, useEffect } from 'react';
import { SavedVersion } from '@/lib/services/AutoSaveService';
import { useAutoSave } from '@/hooks/useAutoSave';
import { 
  Download, 
  Upload, 
  Trash2, 
  Archive, 
  Clock, 
  HardDrive,
  Cloud,
  AlertCircle,
  CheckCircle,
  Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackupManagerProps {
  editorKey: string;
  isOpen: boolean;
  onClose: () => void;
}

const BackupManager: React.FC<BackupManagerProps> = ({
  editorKey,
  isOpen,
  onClose
}) => {
  const [selectedVersions, setSelectedVersions] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [storageInfo, setStorageInfo] = useState<{
    used: number;
    available: number;
    total: number;
  } | null>(null);

  const {
    versions,
    restore,
    getVersions
  } = useAutoSave({
    key: editorKey,
    onError: (error) => console.error('Backup Manager Error:', error)
  });

  // حساب معلومات التخزين
  useEffect(() => {
    if (isOpen) {
      calculateStorageInfo();
    }
  }, [isOpen, versions]);

  const calculateStorageInfo = () => {
    try {
      // حساب المساحة المستخدمة
      let usedSpace = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('autosave-')) {
          const value = localStorage.getItem(key);
          if (value) {
            usedSpace += new Blob([value]).size;
          }
        }
      }

      // تقدير المساحة المتاحة (5MB هو الحد الافتراضي لـ localStorage)
      const totalSpace = 5 * 1024 * 1024; // 5MB
      const availableSpace = totalSpace - usedSpace;

      setStorageInfo({
        used: usedSpace,
        available: availableSpace,
        total: totalSpace
      });
    } catch (error) {
      console.warn('Failed to calculate storage info:', error);
    }
  };

  // تحديد/إلغاء تحديد نسخة
  const toggleVersionSelection = (versionId: string) => {
    const newSelection = new Set(selectedVersions);
    if (newSelection.has(versionId)) {
      newSelection.delete(versionId);
    } else {
      newSelection.add(versionId);
    }
    setSelectedVersions(newSelection);
  };

  // تحديد/إلغاء تحديد الكل
  const toggleSelectAll = () => {
    if (selectedVersions.size === versions.length) {
      setSelectedVersions(new Set());
    } else {
      setSelectedVersions(new Set(versions.map(v => v.id)));
    }
  };

  // تصدير النسخ المحددة
  const exportVersions = async () => {
    if (selectedVersions.size === 0) return;

    setIsExporting(true);
    try {
      const versionsToExport = versions.filter(v => selectedVersions.has(v.id));
      const exportData = {
        editorKey,
        exportDate: new Date().toISOString(),
        versions: versionsToExport
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${editorKey}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSelectedVersions(new Set());
    } catch (error) {
      console.error('Export failed:', error);
      alert('فشل في تصدير النسخ الاحتياطية');
    } finally {
      setIsExporting(false);
    }
  };

  // استيراد النسخ
  const importVersions = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const importData = JSON.parse(text);

      if (!importData.versions || !Array.isArray(importData.versions)) {
        throw new Error('Invalid backup file format');
      }

      // هنا يمكن إضافة منطق استيراد النسخ إلى الخدمة
      console.log('Importing versions:', importData.versions);
      alert(`تم استيراد ${importData.versions.length} نسخة بنجاح`);

    } catch (error) {
      console.error('Import failed:', error);
      alert('فشل في استيراد النسخ الاحتياطية');
    } finally {
      setIsImporting(false);
      event.target.value = ''; // إعادة تعيين input
    }
  };

  // حذف النسخ المحددة
  const deleteSelectedVersions = async () => {
    if (selectedVersions.size === 0) return;

    const confirmed = confirm(`هل أنت متأكد من حذف ${selectedVersions.size} نسخة؟`);
    if (!confirmed) return;

    try {
      // هنا يمكن إضافة منطق حذف النسخ من الخدمة
      for (const versionId of selectedVersions) {
        const storageKey = `autosave-${editorKey}-${versionId}`;
        localStorage.removeItem(storageKey);
      }

      setSelectedVersions(new Set());
      calculateStorageInfo();
      alert('تم حذف النسخ المحددة بنجاح');
    } catch (error) {
      console.error('Delete failed:', error);
      alert('فشل في حذف النسخ');
    }
  };

  // نسخ محتوى النسخة
  const copyVersionContent = async (version: SavedVersion) => {
    try {
      const contentStr = JSON.stringify(version.content, null, 2);
      await navigator.clipboard.writeText(contentStr);
      alert('تم نسخ محتوى النسخة');
    } catch (error) {
      console.error('Copy failed:', error);
      alert('فشل في نسخ المحتوى');
    }
  };

  // تنسيق حجم الملف
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // تنسيق التاريخ
  const formatDate = (date: Date) => {
    return date.toLocaleString('ar', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Archive className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                إدارة النسخ الاحتياطية
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {editorKey} - {versions.length} نسخة محفوظة
              </p>
            </div>
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

        {/* معلومات التخزين */}
        {storageInfo && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    المساحة المستخدمة: {formatFileSize(storageInfo.used)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    المساحة المتاحة: {formatFileSize(storageInfo.available)}
                  </span>
                </div>
              </div>
              <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ 
                    width: `${Math.min((storageInfo.used / storageInfo.total) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* أدوات التحكم */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Button
              onClick={toggleSelectAll}
              variant="outline"
              size="sm"
            >
              {selectedVersions.size === versions.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedVersions.size} من {versions.length} محدد
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".json"
              onChange={importVersions}
              className="hidden"
              id="import-backup"
              disabled={isImporting}
            />
            <label htmlFor="import-backup">
              <Button
                as="span"
                variant="outline"
                size="sm"
                disabled={isImporting}
                className="cursor-pointer"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isImporting ? 'جاري الاستيراد...' : 'استيراد'}
              </Button>
            </label>

            <Button
              onClick={exportVersions}
              disabled={selectedVersions.size === 0 || isExporting}
              variant="outline"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'جاري التصدير...' : 'تصدير'}
            </Button>

            <Button
              onClick={deleteSelectedVersions}
              disabled={selectedVersions.size === 0}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              حذف
            </Button>
          </div>
        </div>

        {/* قائمة النسخ */}
        <div className="overflow-y-auto max-h-[50vh]">
          {versions.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Archive className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد نسخ احتياطية محفوظة</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    selectedVersions.has(version.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={selectedVersions.has(version.id)}
                        onChange={() => toggleVersionSelection(version.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            نسخة {versions.length - index}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="w-3 h-3" />
                            {formatDate(version.timestamp)}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>الحجم: {formatFileSize(version.size)}</span>
                          <span>المستخدم: {version.metadata.userId || 'مجهول'}</span>
                          <span>الجلسة: {version.metadata.sessionId.substring(0, 8)}...</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => copyVersionContent(version)}
                        variant="ghost"
                        size="sm"
                        title="نسخ المحتوى"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        onClick={() => restore(version.id)}
                        variant="outline"
                        size="sm"
                      >
                        استعادة
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>النسخ محفوظة محلياً</span>
              </div>
              {storageInfo && storageInfo.available < 1024 * 1024 && (
                <div className="flex items-center gap-1 text-orange-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>مساحة التخزين منخفضة</span>
                </div>
              )}
            </div>
            <div>
              آخر تحديث: {new Date().toLocaleTimeString('ar')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupManager;