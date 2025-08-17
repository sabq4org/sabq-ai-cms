/**
 * نظام الاحتياط لـ Server-Side Rendering
 * يكتشف مشاكل SSR ويتبدل تلقائياً إلى Client-Side Rendering
 */

export interface SSRError {
  type: 'hydration_mismatch' | 'server_error' | 'timeout' | 'unknown';
  message: string;
  component?: string;
  timestamp: number;
  userAgent: string;
  url: string;
}

export interface SSRFallbackConfig {
  enableAutoFallback: boolean;
  hydrationTimeout: number;
  maxRetries: number;
  preserveUserState: boolean;
  enableDiagnostics: boolean;
}

export class SSRFallbackSystem {
  private static instance: SSRFallbackSystem;
  private config: SSRFallbackConfig;
  private ssrErrors: SSRError[] = [];
  private hydrationTimer?: NodeJS.Timeout;
  private isHydrated = false;
  private userState: Record<string, any> = {};
  private fallbackMode = false;

  private constructor(config: Partial<SSRFallbackConfig> = {}) {
    this.config = {
      enableAutoFallback: true,
      hydrationTimeout: 10000, // 10 ثوانٍ
      maxRetries: 2,
      preserveUserState: true,
      enableDiagnostics: process.env.NODE_ENV === 'development',
      ...config
    };

    this.initializeSSRFallback();
  }

  public static getInstance(config?: Partial<SSRFallbackConfig>): SSRFallbackSystem {
    if (!SSRFallbackSystem.instance) {
      SSRFallbackSystem.instance = new SSRFallbackSystem(config);
    }
    return SSRFallbackSystem.instance;
  }

  /**
   * تهيئة نظام الاحتياط لـ SSR
   */
  private initializeSSRFallback(): void {
    if (typeof window === 'undefined') return;

    // مراقبة أخطاء الـ hydration
    this.monitorHydrationErrors();
    
    // إعداد مؤقت الـ hydration
    this.setupHydrationTimeout();
    
    // مراقبة حالة الـ hydration
    this.monitorHydrationStatus();
    
    // حفظ حالة المستخدم
    if (this.config.preserveUserState) {
      this.preserveUserState();
    }
  }

  /**
   * مراقبة أخطاء الـ hydration
   */
  private monitorHydrationErrors(): void {
    // اعتراض أخطاء React hydration
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      const message = args.join(' ');
      
      if (this.isHydrationError(message)) {
        this.handleSSRError({
          type: 'hydration_mismatch',
          message,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href
        });
      }
      
      originalConsoleError.apply(console, args);
    };

    // مراقبة أخطاء JavaScript العامة
    window.addEventListener('error', (event) => {
      if (this.isHydrationError(event.message)) {
        this.handleSSRError({
          type: 'hydration_mismatch',
          message: event.message,
          component: this.extractComponentFromError(event.error),
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href
        });
      }
    });

    // مراقبة Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && this.isHydrationError(event.reason.message)) {
        this.handleSSRError({
          type: 'hydration_mismatch',
          message: event.reason.message,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href
        });
      }
    });
  }

  /**
   * إعداد مؤقت الـ hydration
   */
  private setupHydrationTimeout(): void {
    this.hydrationTimer = setTimeout(() => {
      if (!this.isHydrated) {
        console.warn('⚠️ انتهت مهلة الـ hydration - التبديل لوضع CSR');
        
        this.handleSSRError({
          type: 'timeout',
          message: 'Hydration timeout exceeded',
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href
        });
      }
    }, this.config.hydrationTimeout);
  }

  /**
   * مراقبة حالة الـ hydration
   */
  private monitorHydrationStatus(): void {
    // فحص إذا كان React قد تم تحميله وhydration مكتمل
    const checkHydration = () => {
      // فحص وجود React root
      const reactRoot = document.querySelector('#__next, [data-reactroot]');
      if (reactRoot && reactRoot.children.length > 0) {
        this.markHydrationComplete();
        return;
      }

      // فحص وجود محتوى ديناميكي
      const dynamicContent = document.querySelector('[data-hydrated="true"]');
      if (dynamicContent) {
        this.markHydrationComplete();
        return;
      }

      // إعادة الفحص بعد فترة قصيرة
      setTimeout(checkHydration, 100);
    };

    // بدء الفحص بعد تحميل DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkHydration);
    } else {
      checkHydration();
    }
  }

  /**
   * تحديد إذا كان الخطأ متعلق بـ hydration
   */
  private isHydrationError(message: string): boolean {
    if (!message) return false;
    
    const hydrationKeywords = [
      'hydration',
      'server html',
      'client-side exception',
      'text content does not match',
      'hydrate',
      'server-rendered',
      'client and server',
      'mismatch',
      'suppressHydrationWarning'
    ];

    return hydrationKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * استخراج اسم المكون من الخطأ
   */
  private extractComponentFromError(error: Error): string | undefined {
    if (!error || !error.stack) return undefined;

    // البحث عن أسماء المكونات في stack trace
    const componentMatch = error.stack.match(/at (\w+Component|\w+\.render|\w+\.tsx?)/);
    return componentMatch ? componentMatch[1] : undefined;
  }

  /**
   * معالجة خطأ SSR
   */
  private handleSSRError(error: SSRError): void {
    console.error('🚨 خطأ SSR:', error);
    
    this.ssrErrors.push(error);
    
    // إرسال تقرير الخطأ
    this.reportSSRError(error);
    
    // محاولة الاسترداد التلقائي
    if (this.config.enableAutoFallback && !this.fallbackMode) {
      this.attemptFallbackToCSR();
    }
  }

  /**
   * محاولة التبديل لـ CSR
   */
  private async attemptFallbackToCSR(): Promise<void> {
    if (this.fallbackMode) return;
    
    this.fallbackMode = true;
    console.log('🔄 التبديل إلى Client-Side Rendering...');

    try {
      // حفظ حالة المستخدم الحالية
      if (this.config.preserveUserState) {
        this.saveCurrentUserState();
      }

      // تنظيف DOM من محتوى SSR المعطوب
      await this.cleanupSSRContent();
      
      // إعادة تحميل التطبيق في وضع CSR
      await this.reloadInCSRMode();
      
    } catch (fallbackError) {
      console.error('❌ فشل في التبديل لـ CSR:', fallbackError);
      
      // كحل أخير، إعادة تحميل الصفحة
      this.performFullReload();
    }
  }

  /**
   * تنظيف محتوى SSR
   */
  private async cleanupSSRContent(): Promise<void> {
    // إزالة محتوى SSR المعطوب
    const rootElement = document.querySelector('#__next');
    if (rootElement) {
      rootElement.innerHTML = '<div id="csr-loading">جارٍ التحميل...</div>';
    }

    // مسح البيانات المحفوظة من SSR
    try {
      // مسح Next.js data
      const nextData = document.querySelector('#__NEXT_DATA__');
      if (nextData) {
        nextData.remove();
      }

      // مسح preloaded state
      delete (window as any).__PRELOADED_STATE__;
      delete (window as any).__INITIAL_STATE__;
      
    } catch (error) {
      console.warn('⚠️ فشل في تنظيف بيانات SSR:', error);
    }
  }

  /**
   * إعادة تحميل في وضع CSR
   */
  private async reloadInCSRMode(): Promise<void> {
    // إضافة علامة لتجنب SSR في التحميل التالي
    sessionStorage.setItem('sabq_force_csr', 'true');
    sessionStorage.setItem('sabq_ssr_fallback', JSON.stringify({
      timestamp: Date.now(),
      errors: this.ssrErrors,
      userState: this.userState
    }));

    // إعادة تحميل الصفحة
    window.location.reload();
  }

  /**
   * إعادة تحميل كاملة
   */
  private performFullReload(): void {
    console.log('🔄 إجراء إعادة تحميل كاملة...');
    
    // مسح جميع البيانات المحفوظة
    try {
      sessionStorage.clear();
    } catch (error) {
      console.warn('فشل في مسح sessionStorage:', error);
    }

    // إعادة تحميل
    window.location.reload();
  }

  /**
   * حفظ حالة المستخدم
   */
  private preserveUserState(): void {
    // حفظ بيانات النماذج
    const forms = document.querySelectorAll('form');
    forms.forEach((form, index) => {
      const formData = new FormData(form);
      const formObject: Record<string, any> = {};
      
      for (const [key, value] of formData.entries()) {
        formObject[key] = value;
      }
      
      if (Object.keys(formObject).length > 0) {
        this.userState[`form_${index}`] = formObject;
      }
    });

    // حفظ حالة التمرير
    this.userState.scrollPosition = {
      x: window.scrollX,
      y: window.scrollY
    };

    // حفظ البيانات من localStorage
    try {
      const importantKeys = ['user', 'auth_token', 'preferences', 'cart'];
      importantKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          this.userState[`localStorage_${key}`] = value;
        }
      });
    } catch (error) {
      console.warn('فشل في حفظ بيانات localStorage:', error);
    }
  }

  /**
   * حفظ حالة المستخدم الحالية
   */
  private saveCurrentUserState(): void {
    this.preserveUserState();
    
    try {
      sessionStorage.setItem('sabq_user_state', JSON.stringify(this.userState));
    } catch (error) {
      console.warn('فشل في حفظ حالة المستخدم:', error);
    }
  }

  /**
   * استعادة حالة المستخدم
   */
  public restoreUserState(): void {
    try {
      const savedState = sessionStorage.getItem('sabq_user_state');
      if (savedState) {
        const userState = JSON.parse(savedState);
        
        // استعادة حالة التمرير
        if (userState.scrollPosition) {
          window.scrollTo(userState.scrollPosition.x, userState.scrollPosition.y);
        }

        // استعادة بيانات localStorage
        Object.keys(userState).forEach(key => {
          if (key.startsWith('localStorage_')) {
            const originalKey = key.replace('localStorage_', '');
            localStorage.setItem(originalKey, userState[key]);
          }
        });

        // مسح البيانات المحفوظة
        sessionStorage.removeItem('sabq_user_state');
      }
    } catch (error) {
      console.warn('فشل في استعادة حالة المستخدم:', error);
    }
  }

  /**
   * تحديد اكتمال الـ hydration
   */
  private markHydrationComplete(): void {
    if (this.isHydrated) return;
    
    this.isHydrated = true;
    
    if (this.hydrationTimer) {
      clearTimeout(this.hydrationTimer);
      this.hydrationTimer = undefined;
    }

    console.log('✅ اكتمل الـ hydration بنجاح');
    
    // استعادة حالة المستخدم إذا كانت محفوظة
    this.restoreUserState();
  }

  /**
   * إرسال تقرير خطأ SSR
   */
  private async reportSSRError(error: SSRError): Promise<void> {
    try {
      await fetch('/api/errors/ssr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error)
      });
    } catch (reportError) {
      console.warn('فشل في إرسال تقرير خطأ SSR:', reportError);
    }
  }

  /**
   * فحص إذا كان يجب تجنب SSR
   */
  public static shouldSkipSSR(): boolean {
    if (typeof window === 'undefined') return false;
    
    return sessionStorage.getItem('sabq_force_csr') === 'true';
  }

  /**
   * مسح علامة تجنب SSR
   */
  public static clearSSRSkip(): void {
    if (typeof window === 'undefined') return;
    
    sessionStorage.removeItem('sabq_force_csr');
  }

  /**
   * الحصول على إحصائيات SSR
   */
  public getSSRStats(): {
    isHydrated: boolean;
    fallbackMode: boolean;
    errorsCount: number;
    errors: SSRError[];
    config: SSRFallbackConfig;
  } {
    return {
      isHydrated: this.isHydrated,
      fallbackMode: this.fallbackMode,
      errorsCount: this.ssrErrors.length,
      errors: this.ssrErrors,
      config: this.config
    };
  }

  /**
   * إعادة تعيين النظام
   */
  public reset(): void {
    this.ssrErrors = [];
    this.isHydrated = false;
    this.fallbackMode = false;
    this.userState = {};
    
    if (this.hydrationTimer) {
      clearTimeout(this.hydrationTimer);
      this.hydrationTimer = undefined;
    }

    SSRFallbackSystem.clearSSRSkip();
    
    console.log('✅ تم إعادة تعيين SSRFallbackSystem');
  }
}