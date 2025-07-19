/**
 * React Hook لاستخدام مدير المحرر الموحد
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  unifiedEditorManager, 
  EditorInstance, 
  EditorConfig, 
  EditorType,
  EditorPerformanceMetrics 
} from '@/lib/services/UnifiedEditorManager';
import { errorMonitoringService } from '@/lib/services/ErrorMonitoringService';

interface UseEditorManagerReturn {
  // حالة المحررات
  editors: EditorInstance[];
  activeEditor: EditorInstance | null;
  isLoading: boolean;
  error: Error | null;
  
  // معلومات الأداء
  performanceMetrics: EditorPerformanceMetrics | null;
  
  // وظائف إدارة المحررات
  createEditor: (config: EditorConfig) => Promise<EditorInstance>;
  destroyEditor: (editorId: string) => void;
  switchEditor: (fromId: string, toId: string) => Promise<void>;
  retryEditor: (editorId: string) => Promise<void>;
  
  // وظائف مساعدة
  getEditorsByType: (type: EditorType) => EditorInstance[];
  refreshEditors: () => void;
}

export const useEditorManager = (): UseEditorManagerReturn => {
  const [editors, setEditors] = useState<EditorInstance[]>([]);
  const [activeEditor, setActiveEditor] = useState<EditorInstance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<EditorPerformanceMetrics | null>(null);

  // تحديث حالة المحررات
  const refreshEditors = useCallback(() => {
    try {
      const allEditors = unifiedEditorManager.getAllEditors();
      const currentActiveEditor = unifiedEditorManager.getActiveEditor();
      const metrics = unifiedEditorManager.getPerformanceMetrics();

      setEditors(allEditors);
      setActiveEditor(currentActiveEditor);
      setPerformanceMetrics(metrics);
      setError(null);
    } catch (err) {
      setError(err as Error);
      errorMonitoringService.reportError(err as Error, {
        component: 'useEditorManager',
        userAction: 'refresh_editors'
      });
    }
  }, []);

  // إنشاء محرر جديد
  const createEditor = useCallback(async (config: EditorConfig): Promise<EditorInstance> => {
    setIsLoading(true);
    setError(null);

    try {
      const newEditor = await unifiedEditorManager.createEditor(config);
      refreshEditors();
      return newEditor;
    } catch (err) {
      const error = err as Error;
      setError(error);
      errorMonitoringService.reportError(error, {
        component: 'useEditorManager',
        userAction: 'create_editor',
        props: { editorType: config.type }
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [refreshEditors]);

  // حذف محرر
  const destroyEditor = useCallback((editorId: string) => {
    try {
      unifiedEditorManager.destroyEditor(editorId);
      refreshEditors();
    } catch (err) {
      const error = err as Error;
      setError(error);
      errorMonitoringService.reportError(error, {
        component: 'useEditorManager',
        userAction: 'destroy_editor',
        props: { editorId }
      });
    }
  }, [refreshEditors]);

  // التبديل بين المحررات
  const switchEditor = useCallback(async (fromId: string, toId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await unifiedEditorManager.switchEditor(fromId, toId);
      refreshEditors();
    } catch (err) {
      const error = err as Error;
      setError(error);
      errorMonitoringService.reportError(error, {
        component: 'useEditorManager',
        userAction: 'switch_editor',
        props: { fromId, toId }
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [refreshEditors]);

  // إعادة محاولة محرر فاشل
  const retryEditor = useCallback(async (editorId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await unifiedEditorManager.retryFailedEditor(editorId);
      refreshEditors();
    } catch (err) {
      const error = err as Error;
      setError(error);
      errorMonitoringService.reportError(error, {
        component: 'useEditorManager',
        userAction: 'retry_editor',
        props: { editorId }
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [refreshEditors]);

  // الحصول على محررات من نوع معين
  const getEditorsByType = useCallback((type: EditorType): EditorInstance[] => {
    return unifiedEditorManager.getEditorsByType(type);
  }, []);

  // تحديث دوري للحالة
  useEffect(() => {
    // تحديث أولي
    refreshEditors();

    // تحديث دوري كل 10 ثوانٍ
    const interval = setInterval(refreshEditors, 10000);

    // تنظيف عند إلغاء التحميل
    return () => {
      clearInterval(interval);
    };
  }, [refreshEditors]);

  // مراقبة تغييرات الأداء
  useEffect(() => {
    const updatePerformanceMetrics = () => {
      const metrics = unifiedEditorManager.getPerformanceMetrics();
      setPerformanceMetrics(metrics);
    };

    // تحديث معلومات الأداء كل 30 ثانية
    const performanceInterval = setInterval(updatePerformanceMetrics, 30000);

    return () => {
      clearInterval(performanceInterval);
    };
  }, []);

  return {
    editors,
    activeEditor,
    isLoading,
    error,
    performanceMetrics,
    createEditor,
    destroyEditor,
    switchEditor,
    retryEditor,
    getEditorsByType,
    refreshEditors
  };
};

export default useEditorManager;