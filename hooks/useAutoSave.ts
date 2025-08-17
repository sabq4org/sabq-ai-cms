/**
 * React Hook لاستخدام خدمة الحفظ التلقائي
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  autoSaveService, 
  AutoSaveConfig, 
  AutoSaveState, 
  SavedVersion 
} from '@/lib/services/AutoSaveService';

interface UseAutoSaveOptions extends Partial<AutoSaveConfig> {
  key: string;
  onSave?: (content: any) => Promise<void>;
  onRestore?: (content: any) => void;
  onConflict?: (conflicts: SavedVersion[]) => void;
  onError?: (error: Error) => void;
}

interface UseAutoSaveReturn {
  // حالة الحفظ التلقائي
  state: AutoSaveState | null;
  isEnabled: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  
  // النسخ المحفوظة
  versions: SavedVersion[];
  conflicts: SavedVersion[];
  
  // وظائف التحكم
  save: (content: any, force?: boolean) => Promise<void>;
  restore: (versionId?: string) => Promise<any>;
  markAsChanged: () => void;
  
  // إدارة النسخ
  getVersions: () => SavedVersion[];
  deleteVersion: (versionId: string) => void;
  
  // حل التضارب
  detectConflicts: () => Promise<SavedVersion[]>;
  resolveConflict: (winnerVersionId: string, action: 'keep' | 'merge' | 'discard') => Promise<void>;
  
  // التحكم في الخدمة
  enable: () => void;
  disable: () => void;
}

export const useAutoSave = (options: UseAutoSaveOptions): UseAutoSaveReturn => {
  const {
    key,
    interval = 30000, // 30 ثانية افتراضياً
    maxVersions = 10,
    enableCloudSync = false,
    enableConflictResolution = true,
    compressionEnabled = false,
    onSave,
    onRestore,
    onConflict,
    onError
  } = options;

  const [state, setState] = useState<AutoSaveState | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const onSaveRef = useRef(onSave);
  const onRestoreRef = useRef(onRestore);
  const onConflictRef = useRef(onConflict);
  const onErrorRef = useRef(onError);

  // تحديث المراجع
  useEffect(() => {
    onSaveRef.current = onSave;
    onRestoreRef.current = onRestore;
    onConflictRef.current = onConflict;
    onErrorRef.current = onError;
  }, [onSave, onRestore, onConflict, onError]);

  // تسجيل الخدمة
  useEffect(() => {
    if (!isRegistered) {
      const config: AutoSaveConfig = {
        key,
        interval,
        maxVersions,
        enableCloudSync,
        enableConflictResolution,
        compressionEnabled
      };

      autoSaveService.register(config);
      setIsRegistered(true);

      // إعداد مستمع للحالة
      const unsubscribe = autoSaveService.addListener(key, (newState) => {
        setState(newState);
        
        // استدعاء callbacks
        if (newState.conflicts.length > 0 && onConflictRef.current) {
          onConflictRef.current(newState.conflicts);
        }
      });

      // تحديث الحالة الأولية
      const initialState = autoSaveService.getState(key);
      if (initialState) {
        setState(initialState);
      }

      return () => {
        unsubscribe();
        autoSaveService.unregister(key);
        setIsRegistered(false);
      };
    }
  }, [key, interval, maxVersions, enableCloudSync, enableConflictResolution, compressionEnabled, isRegistered]);

  // حفظ المحتوى
  const save = useCallback(async (content: any, force = false): Promise<void> => {
    try {
      // استدعاء callback الحفظ المخصص إذا كان موجوداً
      if (onSaveRef.current) {
        await onSaveRef.current(content);
      }

      // حفظ باستخدام خدمة الحفظ التلقائي
      await autoSaveService.save(key, content, force);
    } catch (error) {
      if (onErrorRef.current) {
        onErrorRef.current(error as Error);
      }
      throw error;
    }
  }, [key]);

  // استعادة المحتوى
  const restore = useCallback(async (versionId?: string): Promise<any> => {
    try {
      const content = await autoSaveService.restore(key, versionId);
      
      // استدعاء callback الاستعادة إذا كان موجوداً
      if (onRestoreRef.current) {
        onRestoreRef.current(content);
      }
      
      return content;
    } catch (error) {
      if (onErrorRef.current) {
        onErrorRef.current(error as Error);
      }
      throw error;
    }
  }, [key]);

  // تمييز المحتوى كمتغير
  const markAsChanged = useCallback(() => {
    autoSaveService.markAsChanged(key);
  }, [key]);

  // الحصول على النسخ
  const getVersions = useCallback((): SavedVersion[] => {
    return autoSaveService.getVersions(key);
  }, [key]);

  // حذف نسخة
  const deleteVersion = useCallback((versionId: string) => {
    // تنفيذ حذف النسخة (يمكن إضافة هذه الوظيفة لخدمة الحفظ التلقائي)
    console.log(`Delete version ${versionId} for ${key}`);
  }, [key]);

  // كشف التضارب
  const detectConflicts = useCallback(async (): Promise<SavedVersion[]> => {
    try {
      return await autoSaveService.detectConflicts(key);
    } catch (error) {
      if (onErrorRef.current) {
        onErrorRef.current(error as Error);
      }
      throw error;
    }
  }, [key]);

  // حل التضارب
  const resolveConflict = useCallback(async (
    winnerVersionId: string, 
    action: 'keep' | 'merge' | 'discard'
  ): Promise<void> => {
    try {
      await autoSaveService.resolveConflict(key, winnerVersionId, action);
    } catch (error) {
      if (onErrorRef.current) {
        onErrorRef.current(error as Error);
      }
      throw error;
    }
  }, [key]);

  // تفعيل الحفظ التلقائي
  const enable = useCallback(() => {
    if (state) {
      state.isEnabled = true;
      setState({ ...state });
    }
  }, [state]);

  // تعطيل الحفظ التلقائي
  const disable = useCallback(() => {
    if (state) {
      state.isEnabled = false;
      setState({ ...state });
    }
  }, [state]);

  return {
    // حالة الحفظ التلقائي
    state,
    isEnabled: state?.isEnabled || false,
    isSaving: state?.isSaving || false,
    lastSaved: state?.lastSaved || null,
    hasUnsavedChanges: state?.hasUnsavedChanges || false,
    
    // النسخ المحفوظة
    versions: state?.versions || [],
    conflicts: state?.conflicts || [],
    
    // وظائف التحكم
    save,
    restore,
    markAsChanged,
    
    // إدارة النسخ
    getVersions,
    deleteVersion,
    
    // حل التضارب
    detectConflicts,
    resolveConflict,
    
    // التحكم في الخدمة
    enable,
    disable
  };
};

export default useAutoSave;