/**
 * خدمة الحفظ التلقائي المحسنة للمحررات
 */

import { errorMonitoringService } from './ErrorMonitoringService';
import { safeLocalStorage, safeSessionStorage } from '../utils/ssr-helpers';

export interface AutoSaveConfig {
  key: string;
  interval: number; // بالمللي ثانية
  maxVersions: number; // عدد النسخ المحفوظة
  enableCloudSync?: boolean;
  enableConflictResolution?: boolean;
  compressionEnabled?: boolean;
}

export interface SavedVersion {
  id: string;
  timestamp: Date;
  content: any;
  contentHash: string;
  size: number;
  metadata: {
    editorType: string;
    userId?: string;
    sessionId: string;
    deviceInfo: string;
  };
}

export interface AutoSaveState {
  isEnabled: boolean;
  lastSaved: Date | null;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  versions: SavedVersion[];
  currentVersion: SavedVersion | null;
  conflicts: SavedVersion[];
}

class AutoSaveService {
  private configs: Map<string, AutoSaveConfig> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private states: Map<string, AutoSaveState> = new Map();
  private listeners: Map<string, Array<(state: AutoSaveState) => void>> = new Map();

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    if (typeof window === 'undefined') return;

    // استعادة الحالات المحفوظة
    this.restoreStates();

    // إعداد معالجات الأحداث
    this.setupEventHandlers();

    // إعداد تنظيف دوري
    this.setupCleanup();
  }

  private restoreStates(): void {
    try {
      const savedStates = safeLocalStorage.getItem('autosave-states');
      if (savedStates) {
        const parsedStates = JSON.parse(savedStates);
        for (const [key, state] of Object.entries(parsedStates)) {
          this.states.set(key, {
            ...state as AutoSaveState,
            lastSaved: state.lastSaved ? new Date(state.lastSaved) : null,
            versions: (state.versions || []).map((v: any) => ({
              ...v,
              timestamp: new Date(v.timestamp)
            }))
          });
        }
      }
    } catch (error) {
      console.warn('Failed to restore autosave states:', error);
    }
  }

  private setupEventHandlers(): void {
    // حفظ الحالات عند إغلاق الصفحة
    window.addEventListener('beforeunload', () => {
      this.saveAllStates();
    });

    // حفظ عند فقدان التركيز
    window.addEventListener('blur', () => {
      this.saveAllPendingChanges();
    });

    // مراقبة حالة الاتصال
    window.addEventListener('online', () => {
      this.syncWithCloud();
    });

    window.addEventListener('offline', () => {
      this.handleOfflineMode();
    });
  }

  private setupCleanup(): void {
    // تنظيف النسخ القديمة كل ساعة
    setInterval(() => {
      this.cleanupOldVersions();
    }, 60 * 60 * 1000);
  }

  public register(config: AutoSaveConfig): void {
    this.configs.set(config.key, config);

    // إنشاء حالة أولية إذا لم تكن موجودة
    if (!this.states.has(config.key)) {
      this.states.set(config.key, {
        isEnabled: true,
        lastSaved: null,
        isSaving: false,
        hasUnsavedChanges: false,
        versions: [],
        currentVersion: null,
        conflicts: []
      });
    }

    // بدء المؤقت
    this.startAutoSave(config.key);
  }

  public unregister(key: string): void {
    // إيقاف المؤقت
    const timer = this.timers.get(key);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(key);
    }

    // إزالة التكوين والحالة
    this.configs.delete(key);
    this.states.delete(key);
    this.listeners.delete(key);
  }

  private startAutoSave(key: string): void {
    const config = this.configs.get(key);
    if (!config) return;

    // إيقاف المؤقت السابق إذا كان موجوداً
    const existingTimer = this.timers.get(key);
    if (existingTimer) {
      clearInterval(existingTimer);
    }

    // بدء مؤقت جديد
    const timer = setInterval(() => {
      this.performAutoSave(key);
    }, config.interval);

    this.timers.set(key, timer);
  }

  public async save(key: string, content: any, force = false): Promise<void> {
    const config = this.configs.get(key);
    const state = this.states.get(key);

    if (!config || !state) {
      throw new Error(`AutoSave not registered for key: ${key}`);
    }

    // تجنب الحفظ المتكرر إذا لم يكن إجبارياً
    if (!force && state.isSaving) {
      return;
    }

    state.isSaving = true;
    this.notifyListeners(key, state);

    try {
      // إنشاء نسخة جديدة
      const version = await this.createVersion(key, content);

      // حفظ النسخة
      await this.saveVersion(key, version);

      // تحديث الحالة
      state.lastSaved = new Date();
      state.hasUnsavedChanges = false;
      state.currentVersion = version;
      state.versions.unshift(version);

      // الحفاظ على الحد الأقصى للنسخ
      if (state.versions.length > config.maxVersions) {
        state.versions = state.versions.slice(0, config.maxVersions);
      }

      // مزامنة مع السحابة إذا كانت مفعلة
      if (config.enableCloudSync && navigator.onLine) {
        await this.syncWithCloud(key, version);
      }

      // إظهار إشعار نجاح الحفظ
      if (typeof window !== 'undefined' && (window as any).notificationService) {
        (window as any).notificationService.showAutoSaveSuccess(state.lastSaved);
      }

      console.log(`AutoSave completed for ${key}`);

    } catch (error) {
      errorMonitoringService.reportError(error as Error, {
        component: 'AutoSaveService',
        userAction: 'save',
        props: { key }
      });

      // إظهار إشعار فشل الحفظ
      if (typeof window !== 'undefined' && (window as any).notificationService) {
        (window as any).notificationService.showAutoSaveError(
          (error as Error).message || 'حدث خطأ أثناء الحفظ التلقائي'
        );
      }

      throw error;
    } finally {
      state.isSaving = false;
      this.notifyListeners(key, state);
    }
  }

  private async createVersion(key: string, content: any): Promise<SavedVersion> {
    const contentString = JSON.stringify(content);
    const contentHash = await this.generateHash(contentString);
    
    return {
      id: this.generateVersionId(),
      timestamp: new Date(),
      content,
      contentHash,
      size: new Blob([contentString]).size,
      metadata: {
        editorType: key.split('-')[0] || 'unknown',
        userId: this.getCurrentUserId(),
        sessionId: this.getSessionId(),
        deviceInfo: this.getDeviceInfo()
      }
    };
  }

  private async saveVersion(key: string, version: SavedVersion): Promise<void> {
    const config = this.configs.get(key);
    if (!config) return;

    // ضغط المحتوى إذا كان مفعلاً
    let contentToSave = version.content;
    if (config.compressionEnabled) {
      contentToSave = await this.compressContent(version.content);
    }

    // حفظ في localStorage
    const storageKey = `autosave-${key}-${version.id}`;
    const success = safeLocalStorage.setItem(storageKey, JSON.stringify({
      ...version,
      content: contentToSave
    }));

    if (!success) {
      // إذا فشل الحفظ في localStorage، جرب sessionStorage
      safeSessionStorage.setItem(storageKey, JSON.stringify({
        ...version,
        content: contentToSave
      }));
    }
  }

  public async restore(key: string, versionId?: string): Promise<any> {
    const state = this.states.get(key);
    if (!state) {
      throw new Error(`AutoSave not registered for key: ${key}`);
    }

    let version: SavedVersion | null = null;

    if (versionId) {
      // استعادة نسخة محددة
      version = state.versions.find(v => v.id === versionId) || null;
    } else {
      // استعادة آخر نسخة
      version = state.currentVersion || state.versions[0] || null;
    }

    if (!version) {
      throw new Error('No saved version found');
    }

    try {
      // تحميل المحتوى من التخزين
      const storageKey = `autosave-${key}-${version.id}`;
      let savedData = safeLocalStorage.getItem(storageKey);
      
      if (!savedData) {
        savedData = safeSessionStorage.getItem(storageKey);
      }

      if (!savedData) {
        throw new Error('Saved data not found in storage');
      }

      const parsedData = JSON.parse(savedData);
      
      // إلغاء ضغط المحتوى إذا لزم الأمر
      const config = this.configs.get(key);
      let content = parsedData.content;
      if (config?.compressionEnabled) {
        content = await this.decompressContent(content);
      }

      return content;

    } catch (error) {
      errorMonitoringService.reportError(error as Error, {
        component: 'AutoSaveService',
        userAction: 'restore',
        props: { key, versionId }
      });
      throw error;
    }
  }

  public getVersions(key: string): SavedVersion[] {
    const state = this.states.get(key);
    return state?.versions || [];
  }

  public async detectConflicts(key: string): Promise<SavedVersion[]> {
    const state = this.states.get(key);
    if (!state || !state.currentVersion) return [];

    const conflicts: SavedVersion[] = [];
    
    // البحث عن نسخ متضاربة (نفس الوقت تقريباً ولكن محتوى مختلف)
    for (const version of state.versions) {
      if (version.id !== state.currentVersion.id) {
        const timeDiff = Math.abs(
          version.timestamp.getTime() - state.currentVersion.timestamp.getTime()
        );
        
        // إذا كانت النسخ في نفس الدقيقة ولكن المحتوى مختلف
        if (timeDiff < 60000 && version.contentHash !== state.currentVersion.contentHash) {
          conflicts.push(version);
        }
      }
    }

    state.conflicts = conflicts;
    this.notifyListeners(key, state);
    
    return conflicts;
  }

  public async resolveConflict(
    key: string, 
    winnerVersionId: string, 
    action: 'keep' | 'merge' | 'discard'
  ): Promise<void> {
    const state = this.states.get(key);
    if (!state) return;

    const winnerVersion = state.versions.find(v => v.id === winnerVersionId);
    if (!winnerVersion) return;

    try {
      switch (action) {
        case 'keep':
          state.currentVersion = winnerVersion;
          break;
        case 'merge':
          // دمج النسخ (يتطلب تنفيذ خاص حسب نوع المحتوى)
          const mergedContent = await this.mergeVersions(key, state.conflicts);
          await this.save(key, mergedContent, true);
          break;
        case 'discard':
          // حذف النسخ المتضاربة
          state.versions = state.versions.filter(v => !state.conflicts.includes(v));
          break;
      }

      state.conflicts = [];
      this.notifyListeners(key, state);

    } catch (error) {
      errorMonitoringService.reportError(error as Error, {
        component: 'AutoSaveService',
        userAction: 'resolve_conflict',
        props: { key, winnerVersionId, action }
      });
      throw error;
    }
  }

  private async performAutoSave(key: string): Promise<void> {
    const state = this.states.get(key);
    if (!state || !state.hasUnsavedChanges || state.isSaving) {
      return;
    }

    // الحصول على المحتوى الحالي من المحرر
    const currentContent = await this.getCurrentContent(key);
    if (currentContent) {
      await this.save(key, currentContent);
    }
  }

  private async getCurrentContent(key: string): Promise<any> {
    // محاولة الحصول على المحتوى من المحرر النشط
    if (typeof window !== 'undefined' && (window as any).editorManager) {
      const editorManager = (window as any).editorManager;
      const activeEditor = editorManager.getActiveEditor();
      
      if (activeEditor && activeEditor.component) {
        // استخدام API المحرر للحصول على المحتوى
        return activeEditor.component.getContent?.() || null;
      }
    }

    return null;
  }

  private saveAllStates(): void {
    try {
      const statesToSave: Record<string, any> = {};
      for (const [key, state] of this.states.entries()) {
        statesToSave[key] = {
          ...state,
          lastSaved: state.lastSaved?.toISOString(),
          versions: state.versions.map(v => ({
            ...v,
            timestamp: v.timestamp.toISOString()
          }))
        };
      }
      
      safeLocalStorage.setItem('autosave-states', JSON.stringify(statesToSave));
    } catch (error) {
      console.warn('Failed to save autosave states:', error);
    }
  }

  private async saveAllPendingChanges(): Promise<void> {
    const promises = Array.from(this.configs.keys()).map(key => 
      this.performAutoSave(key).catch(error => 
        console.warn(`Failed to save ${key}:`, error)
      )
    );
    
    await Promise.all(promises);
  }

  private async syncWithCloud(key?: string, version?: SavedVersion): Promise<void> {
    // تنفيذ مزامنة السحابة (يمكن تخصيصه حسب الحاجة)
    if (process.env.NODE_ENV === 'development') {
      console.log('Cloud sync simulated', { key, version });
      return;
    }

    // مثال على تنفيذ حقيقي
    try {
      await fetch('/api/autosave/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, version })
      });
    } catch (error) {
      console.warn('Cloud sync failed:', error);
    }
  }

  private handleOfflineMode(): void {
    // تحويل إلى وضع عدم الاتصال
    console.log('AutoSave: Switched to offline mode');
    
    // زيادة تكرار الحفظ المحلي
    for (const [key, config] of this.configs.entries()) {
      if (config.interval > 10000) {
        this.configs.set(key, { ...config, interval: 10000 });
        this.startAutoSave(key);
      }
    }
  }

  private cleanupOldVersions(): void {
    for (const [key, state] of this.states.entries()) {
      const config = this.configs.get(key);
      if (!config) continue;

      // حذف النسخ القديمة من التخزين
      const versionsToDelete = state.versions.slice(config.maxVersions);
      for (const version of versionsToDelete) {
        const storageKey = `autosave-${key}-${version.id}`;
        safeLocalStorage.removeItem(storageKey);
        safeSessionStorage.removeItem(storageKey);
      }

      // تحديث قائمة النسخ
      state.versions = state.versions.slice(0, config.maxVersions);
    }
  }

  // دوال مساعدة
  private generateVersionId(): string {
    return `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async generateHash(content: string): Promise<string> {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(content);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    // fallback للمتصفحات القديمة
    return content.length.toString() + '_' + Date.now().toString();
  }

  private getCurrentUserId(): string | undefined {
    try {
      const userInfo = safeLocalStorage.getItem('user-info');
      return userInfo ? JSON.parse(userInfo).id : undefined;
    } catch {
      return undefined;
    }
  }

  private getSessionId(): string {
    let sessionId = safeSessionStorage.getItem('session-id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      safeSessionStorage.setItem('session-id', sessionId);
    }
    return sessionId;
  }

  private getDeviceInfo(): string {
    if (typeof navigator === 'undefined') return 'unknown';
    return `${navigator.platform} - ${navigator.userAgent.split(' ')[0]}`;
  }

  private async compressContent(content: any): Promise<string> {
    // تنفيذ ضغط بسيط (يمكن تحسينه)
    return JSON.stringify(content);
  }

  private async decompressContent(compressedContent: string): Promise<any> {
    // تنفيذ إلغاء ضغط بسيط
    return JSON.parse(compressedContent);
  }

  private async mergeVersions(key: string, versions: SavedVersion[]): Promise<any> {
    // تنفيذ دمج بسيط (يحتاج تخصيص حسب نوع المحتوى)
    if (versions.length === 0) return null;
    
    // للآن، نأخذ آخر نسخة
    return versions[versions.length - 1].content;
  }

  // إدارة المستمعين
  public addListener(key: string, listener: (state: AutoSaveState) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    
    this.listeners.get(key)!.push(listener);
    
    return () => {
      const listeners = this.listeners.get(key);
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  private notifyListeners(key: string, state: AutoSaveState): void {
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(state);
        } catch (error) {
          console.error('Error in autosave listener:', error);
        }
      });
    }
  }

  public getState(key: string): AutoSaveState | null {
    return this.states.get(key) || null;
  }

  public markAsChanged(key: string): void {
    const state = this.states.get(key);
    if (state) {
      state.hasUnsavedChanges = true;
      this.notifyListeners(key, state);
    }
  }

  public destroy(): void {
    // إيقاف جميع المؤقتات
    for (const timer of this.timers.values()) {
      clearInterval(timer);
    }

    // حفظ الحالات النهائية
    this.saveAllStates();

    // تنظيف البيانات
    this.configs.clear();
    this.timers.clear();
    this.states.clear();
    this.listeners.clear();
  }
}

// إنشاء instance واحد للاستخدام العام
export const autoSaveService = new AutoSaveService();

// تعريض الخدمة على window للاستخدام العام
if (typeof window !== 'undefined') {
  (window as any).autoSaveService = autoSaveService;
}

export default AutoSaveService;