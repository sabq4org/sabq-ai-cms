/**
 * مدير المحرر الموحد - إدارة جميع محررات المقالات
 */

import { errorMonitoringService } from './ErrorMonitoringService';

export type EditorType = 'tiptap' | 'realtime' | 'content' | 'content-tiptap';
export type EditorStatus = 'loading' | 'ready' | 'error' | 'destroyed';

export interface EditorConfig {
  type: EditorType;
  initialContent?: any;
  autoSave?: boolean;
  autoSaveInterval?: number;
  enableAI?: boolean;
  placeholder?: string;
  maxRetries?: number;
  [key: string]: any;
}

export interface EditorInstance {
  id: string;
  type: EditorType;
  status: EditorStatus;
  config: EditorConfig;
  component: React.ComponentType<any> | null;
  lastActivity: Date;
  retryCount: number;
  performance: {
    loadTime: number;
    renderTime: number;
    memoryUsage: number;
  };
  errors: Error[];
}

export interface EditorPerformanceMetrics {
  totalEditors: number;
  activeEditors: number;
  averageLoadTime: number;
  memoryUsage: number;
  errorRate: number;
}

class UnifiedEditorManager {
  private editors: Map<string, EditorInstance> = new Map();
  private activeEditorId: string | null = null;
  private performanceObserver: PerformanceObserver | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    if (typeof window === 'undefined') return;

    // إعداد مراقبة الأداء
    this.setupPerformanceMonitoring();

    // إعداد تنظيف دوري للمحررات غير المستخدمة
    this.setupCleanup();

    // إعداد معالجات الأحداث
    this.setupEventHandlers();
  }

  private setupPerformanceMonitoring(): void {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          // تحديث معلومات الأداء للمحررات
          this.updatePerformanceMetrics(entry);
        });
      });

      this.performanceObserver.observe({ 
        entryTypes: ['measure', 'navigation', 'resource'] 
      });
    }
  }

  private setupCleanup(): void {
    // تنظيف المحررات غير المستخدمة كل 5 دقائق
    this.cleanupInterval = setInterval(() => {
      this.cleanupInactiveEditors();
    }, 5 * 60 * 1000);
  }

  private setupEventHandlers(): void {
    // حفظ حالة المحررات عند إغلاق الصفحة
    window.addEventListener('beforeunload', () => {
      this.saveEditorsState();
    });

    // مراقبة استهلاك الذاكرة
    if ('memory' in performance) {
      setInterval(() => {
        this.checkMemoryUsage();
      }, 30000); // كل 30 ثانية
    }
  }

  public async createEditor(config: EditorConfig): Promise<EditorInstance> {
    const editorId = this.generateEditorId();
    const startTime = performance.now();

    try {
      // إنشاء instance المحرر
      const editorInstance: EditorInstance = {
        id: editorId,
        type: config.type,
        status: 'loading',
        config,
        component: null,
        lastActivity: new Date(),
        retryCount: 0,
        performance: {
          loadTime: 0,
          renderTime: 0,
          memoryUsage: 0
        },
        errors: []
      };

      // إضافة المحرر إلى القائمة
      this.editors.set(editorId, editorInstance);

      // تحميل مكون المحرر
      const component = await this.loadEditorComponent(config.type);
      
      // تحديث حالة المحرر
      editorInstance.component = component;
      editorInstance.status = 'ready';
      editorInstance.performance.loadTime = performance.now() - startTime;

      // تعيين كمحرر نشط إذا لم يكن هناك محرر نشط
      if (!this.activeEditorId) {
        this.activeEditorId = editorId;
      }

      // تسجيل نجاح الإنشاء
      console.log(`Editor ${editorId} created successfully`, editorInstance);

      return editorInstance;

    } catch (error) {
      // تسجيل الخطأ
      const editorInstance = this.editors.get(editorId);
      if (editorInstance) {
        editorInstance.status = 'error';
        editorInstance.errors.push(error as Error);
      }

      errorMonitoringService.reportError(error as Error, {
        component: 'UnifiedEditorManager',
        userAction: 'create_editor',
        props: { editorType: config.type, editorId }
      });

      throw error;
    }
  }

  private async loadEditorComponent(type: EditorType): Promise<React.ComponentType<any>> {
    switch (type) {
      case 'tiptap':
        return (await import('../../components/Editor/Editor')).default;
      case 'realtime':
        return (await import('../../components/ArticleEditor/RealtimeEditor')).default;
      case 'content':
        return (await import('../../components/ContentEditor')).default;
      case 'content-tiptap':
        return (await import('../../components/ContentEditorWithTiptap')).default;
      default:
        throw new Error(`Unknown editor type: ${type}`);
    }
  }

  public destroyEditor(editorId: string): void {
    const editor = this.editors.get(editorId);
    if (!editor) return;

    try {
      // تنظيف الموارد
      editor.status = 'destroyed';
      editor.component = null;

      // إزالة من القائمة
      this.editors.delete(editorId);

      // تحديث المحرر النشط إذا كان هذا هو المحرر النشط
      if (this.activeEditorId === editorId) {
        this.activeEditorId = this.getNextActiveEditor();
      }

      console.log(`Editor ${editorId} destroyed`);

    } catch (error) {
      errorMonitoringService.reportError(error as Error, {
        component: 'UnifiedEditorManager',
        userAction: 'destroy_editor',
        props: { editorId }
      });
    }
  }

  public async switchEditor(fromId: string, toId: string): Promise<void> {
    const fromEditor = this.editors.get(fromId);
    const toEditor = this.editors.get(toId);

    if (!fromEditor || !toEditor) {
      throw new Error('Editor not found');
    }

    try {
      // حفظ حالة المحرر الحالي
      await this.saveEditorState(fromId);

      // تبديل المحرر النشط
      this.activeEditorId = toId;
      toEditor.lastActivity = new Date();

      // تحديث حالة المحرر الجديد
      if (toEditor.status !== 'ready') {
        await this.reactivateEditor(toId);
      }

      console.log(`Switched from editor ${fromId} to ${toId}`);

    } catch (error) {
      errorMonitoringService.reportError(error as Error, {
        component: 'UnifiedEditorManager',
        userAction: 'switch_editor',
        props: { fromId, toId }
      });
      throw error;
    }
  }

  private async reactivateEditor(editorId: string): Promise<void> {
    const editor = this.editors.get(editorId);
    if (!editor) return;

    try {
      editor.status = 'loading';
      
      // إعادة تحميل المكون إذا لزم الأمر
      if (!editor.component) {
        editor.component = await this.loadEditorComponent(editor.type);
      }

      editor.status = 'ready';
      editor.lastActivity = new Date();

    } catch (error) {
      editor.status = 'error';
      editor.errors.push(error as Error);
      throw error;
    }
  }

  public getActiveEditor(): EditorInstance | null {
    if (!this.activeEditorId) return null;
    return this.editors.get(this.activeEditorId) || null;
  }

  public getActiveEditors(): EditorInstance[] {
    return Array.from(this.editors.values()).filter(
      editor => editor.status === 'ready' || editor.status === 'loading'
    );
  }

  public getAllEditors(): EditorInstance[] {
    return Array.from(this.editors.values());
  }

  public getEditorById(editorId: string): EditorInstance | null {
    return this.editors.get(editorId) || null;
  }

  public getEditorsByType(type: EditorType): EditorInstance[] {
    return Array.from(this.editors.values()).filter(
      editor => editor.type === type
    );
  }

  private generateEditorId(): string {
    return `editor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getNextActiveEditor(): string | null {
    const activeEditors = this.getActiveEditors();
    return activeEditors.length > 0 ? activeEditors[0].id : null;
  }

  private cleanupInactiveEditors(): void {
    const now = new Date();
    const inactiveThreshold = 30 * 60 * 1000; // 30 دقيقة

    for (const [editorId, editor] of this.editors.entries()) {
      const timeSinceLastActivity = now.getTime() - editor.lastActivity.getTime();
      
      if (timeSinceLastActivity > inactiveThreshold && editor.id !== this.activeEditorId) {
        console.log(`Cleaning up inactive editor: ${editorId}`);
        this.destroyEditor(editorId);
      }
    }
  }

  private async saveEditorState(editorId: string): Promise<void> {
    const editor = this.editors.get(editorId);
    if (!editor) return;

    try {
      // حفظ حالة المحرر في localStorage
      const state = {
        id: editor.id,
        type: editor.type,
        config: editor.config,
        lastActivity: editor.lastActivity.toISOString(),
        performance: editor.performance
      };

      localStorage.setItem(`editor_state_${editorId}`, JSON.stringify(state));

    } catch (error) {
      console.warn('Failed to save editor state:', error);
    }
  }

  private saveEditorsState(): void {
    try {
      const editorsState = Array.from(this.editors.entries()).map(([id, editor]) => ({
        id,
        type: editor.type,
        status: editor.status,
        lastActivity: editor.lastActivity.toISOString()
      }));

      localStorage.setItem('editors_state', JSON.stringify(editorsState));

    } catch (error) {
      console.warn('Failed to save editors state:', error);
    }
  }

  private updatePerformanceMetrics(entry: PerformanceEntry): void {
    // تحديث معلومات الأداء بناءً على نوع الحدث
    if (entry.name.includes('editor')) {
      // البحث عن المحرر المرتبط بهذا الحدث
      for (const editor of this.editors.values()) {
        if (entry.name.includes(editor.id)) {
          if (entry.entryType === 'measure') {
            editor.performance.renderTime = entry.duration;
          }
          break;
        }
      }
    }
  }

  private checkMemoryUsage(): void {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      const totalMemory = memInfo.totalJSHeapSize;
      const usedMemory = memInfo.usedJSHeapSize;

      // تحديث معلومات الذاكرة للمحررات
      for (const editor of this.editors.values()) {
        editor.performance.memoryUsage = usedMemory / this.editors.size;
      }

      // تنبيه إذا كان استهلاك الذاكرة مرتفعاً
      if (usedMemory > totalMemory * 0.8) {
        errorMonitoringService.reportError(
          new Error('High memory usage detected'),
          {
            component: 'UnifiedEditorManager',
            userAction: 'memory_check',
            props: { usedMemory, totalMemory }
          },
          'high'
        );
      }
    }
  }

  public getPerformanceMetrics(): EditorPerformanceMetrics {
    const editors = Array.from(this.editors.values());
    const activeEditors = editors.filter(e => e.status === 'ready');
    
    const totalLoadTime = editors.reduce((sum, e) => sum + e.performance.loadTime, 0);
    const averageLoadTime = editors.length > 0 ? totalLoadTime / editors.length : 0;
    
    const totalMemory = editors.reduce((sum, e) => sum + e.performance.memoryUsage, 0);
    
    const totalErrors = editors.reduce((sum, e) => sum + e.errors.length, 0);
    const errorRate = editors.length > 0 ? totalErrors / editors.length : 0;

    return {
      totalEditors: editors.length,
      activeEditors: activeEditors.length,
      averageLoadTime,
      memoryUsage: totalMemory,
      errorRate
    };
  }

  public async retryFailedEditor(editorId: string): Promise<void> {
    const editor = this.editors.get(editorId);
    if (!editor || editor.status !== 'error') return;

    const maxRetries = editor.config.maxRetries || 3;
    if (editor.retryCount >= maxRetries) {
      throw new Error(`Max retries exceeded for editor ${editorId}`);
    }

    try {
      editor.retryCount++;
      editor.status = 'loading';
      editor.errors = []; // مسح الأخطاء السابقة

      // إعادة تحميل المحرر
      await this.reactivateEditor(editorId);

      console.log(`Editor ${editorId} retried successfully (attempt ${editor.retryCount})`);

    } catch (error) {
      editor.status = 'error';
      editor.errors.push(error as Error);
      
      errorMonitoringService.reportError(error as Error, {
        component: 'UnifiedEditorManager',
        userAction: 'retry_editor',
        props: { editorId, retryCount: editor.retryCount }
      });

      throw error;
    }
  }

  public destroy(): void {
    // تنظيف جميع المحررات
    for (const editorId of this.editors.keys()) {
      this.destroyEditor(editorId);
    }

    // تنظيف المراقبات والفواصل الزمنية
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    console.log('UnifiedEditorManager destroyed');
  }
}

// إنشاء instance واحد للاستخدام العام
export const unifiedEditorManager = new UnifiedEditorManager();

// تعريض المدير على window للاستخدام العام
if (typeof window !== 'undefined') {
  (window as any).editorManager = unifiedEditorManager;
}

export default UnifiedEditorManager;