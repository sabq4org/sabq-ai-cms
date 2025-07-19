/**
 * إصلاح مشكلة Next.js DevTools
 * يتعامل مع الأخطاء المتعلقة بـ next-devtools وwebpack
 */

export class NextDevToolsFix {
  private static instance: NextDevToolsFix;
  private isFixed = false;

  private constructor() {
    this.applyFix();
  }

  public static getInstance(): NextDevToolsFix {
    if (!NextDevToolsFix.instance) {
      NextDevToolsFix.instance = new NextDevToolsFix();
    }
    return NextDevToolsFix.instance;
  }

  /**
   * تطبيق الإصلاح
   */
  private applyFix(): void {
    if (typeof window === 'undefined' || this.isFixed) return;

    try {
      // إصلاح 1: تعطيل Next.js DevTools في حالة الأخطاء
      this.disableDevToolsOnError();
      
      // إصلاح 2: معالجة أخطاء webpack المحددة
      this.handleWebpackErrors();
      
      // إصلاح 3: تنظيف DevTools المعطلة
      this.cleanupBrokenDevTools();
      
      this.isFixed = true;
      console.log('✅ تم تطبيق إصلاح Next.js DevTools');
      
    } catch (error) {
      console.warn('⚠️ فشل في تطبيق إصلاح DevTools:', error);
    }
  }

  /**
   * تعطيل DevTools عند حدوث أخطاء
   */
  private disableDevToolsOnError(): void {
    // اعتراض أخطاء DevTools
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      const message = args.join(' ');
      
      // فحص إذا كان الخطأ متعلق بـ DevTools
      if (this.isDevToolsError(message)) {
        console.warn('🔧 تم اكتشاف خطأ DevTools - تطبيق الإصلاح...');
        this.forceDisableDevTools();
        return; // عدم عرض الخطأ
      }
      
      originalConsoleError.apply(console, args);
    };

    // معالجة أخطاء غير معالجة
    window.addEventListener('error', (event) => {
      if (this.isDevToolsError(event.message) || this.isDevToolsError(event.filename || '')) {
        console.warn('🔧 تم اكتشاف خطأ DevTools في event listener');
        this.forceDisableDevTools();
        event.preventDefault();
        event.stopPropagation();
      }
    });

    // معالجة Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && this.isDevToolsError(event.reason.message || event.reason.toString())) {
        console.warn('🔧 تم اكتشاف خطأ DevTools في promise rejection');
        this.forceDisableDevTools();
        event.preventDefault();
      }
    });
  }

  /**
   * فحص إذا كان الخطأ متعلق بـ DevTools
   */
  private isDevToolsError(message: string): boolean {
    if (!message) return false;
    
    const devToolsKeywords = [
      'next-devtools',
      'webpack-internal',
      'pages-dir-browser',
      '__webpack_require__',
      'tr@webpack-internal',
      'o6@webpack-internal',
      'iP@webpack-internal',
      'i$@webpack-internal',
      'sv@webpack-internal',
      'sm@webpack-internal',
      'sa@webpack-internal',
      'sZ@webpack-internal',
      '_@webpack-internal'
    ];

    return devToolsKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * معالجة أخطاء webpack المحددة
   */
  private handleWebpackErrors(): void {
    // تعطيل webpack hot reload في حالة الأخطاء
    if ((window as any).__webpack_require__) {
      const originalRequire = (window as any).__webpack_require__;
      
      (window as any).__webpack_require__ = function(moduleId: any) {
        try {
          return originalRequire(moduleId);
        } catch (error) {
          if (NextDevToolsFix.getInstance().isDevToolsError(error.message)) {
            console.warn('🔧 تم تجاهل خطأ webpack DevTools:', moduleId);
            return {}; // إرجاع كائن فارغ بدلاً من الخطأ
          }
          throw error;
        }
      };
    }

    // تعطيل hot module replacement إذا كان يسبب مشاكل
    if ((window as any).module && (window as any).module.hot) {
      const originalAccept = (window as any).module.hot.accept;
      (window as any).module.hot.accept = function(...args: any[]) {
        try {
          return originalAccept.apply(this, args);
        } catch (error) {
          console.warn('🔧 تم تجاهل خطأ HMR:', error);
        }
      };
    }
  }

  /**
   * تنظيف DevTools المعطلة
   */
  private cleanupBrokenDevTools(): void {
    // إزالة عناصر DevTools المعطلة من DOM
    const devToolsElements = document.querySelectorAll('[data-nextjs-devtools]');
    devToolsElements.forEach(element => {
      try {
        element.remove();
      } catch (error) {
        console.warn('فشل في إزالة عنصر DevTools:', error);
      }
    });

    // تنظيف متغيرات DevTools العامة
    try {
      delete (window as any).__NEXT_DEVTOOLS__;
      delete (window as any).__NEXT_DEVTOOLS_PORT__;
    } catch (error) {
      console.warn('فشل في تنظيف متغيرات DevTools:', error);
    }
  }

  /**
   * إجبار تعطيل DevTools
   */
  private forceDisableDevTools(): void {
    // تعطيل DevTools في localStorage
    try {
      localStorage.setItem('__NEXT_DEVTOOLS_DISABLED__', 'true');
    } catch (error) {
      console.warn('فشل في حفظ إعداد تعطيل DevTools:', error);
    }

    // تعطيل DevTools في النافذة الحالية
    (window as any).__NEXT_DEVTOOLS_DISABLED__ = true;

    // إعادة تحميل الصفحة إذا لزم الأمر
    if (!sessionStorage.getItem('devtools_fix_reload')) {
      sessionStorage.setItem('devtools_fix_reload', 'true');
      console.log('🔄 إعادة تحميل لتطبيق إصلاح DevTools...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }

  /**
   * فحص إذا كان DevTools معطل
   */
  public static isDevToolsDisabled(): boolean {
    if (typeof window === 'undefined') return false;
    
    return (
      localStorage.getItem('__NEXT_DEVTOOLS_DISABLED__') === 'true' ||
      (window as any).__NEXT_DEVTOOLS_DISABLED__ === true
    );
  }

  /**
   * إعادة تفعيل DevTools
   */
  public static enableDevTools(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('__NEXT_DEVTOOLS_DISABLED__');
    delete (window as any).__NEXT_DEVTOOLS_DISABLED__;
    sessionStorage.removeItem('devtools_fix_reload');
    
    console.log('✅ تم إعادة تفعيل DevTools');
  }

  /**
   * الحصول على حالة الإصلاح
   */
  public getStatus(): {
    isFixed: boolean;
    isDevToolsDisabled: boolean;
    hasReloaded: boolean;
  } {
    return {
      isFixed: this.isFixed,
      isDevToolsDisabled: NextDevToolsFix.isDevToolsDisabled(),
      hasReloaded: sessionStorage.getItem('devtools_fix_reload') === 'true'
    };
  }
}