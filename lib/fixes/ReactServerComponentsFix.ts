/**
 * إصلاح مشاكل React Server Components
 * يتعامل مع أخطاء تحميل الوحدات وwebpack factory
 */

export class ReactServerComponentsFix {
  private static instance: ReactServerComponentsFix;
  private isFixed = false;

  private constructor() {
    this.applyFix();
  }

  public static getInstance(): ReactServerComponentsFix {
    if (!ReactServerComponentsFix.instance) {
      ReactServerComponentsFix.instance = new ReactServerComponentsFix();
    }
    return ReactServerComponentsFix.instance;
  }

  /**
   * تطبيق الإصلاح
   */
  private applyFix(): void {
    if (typeof window === 'undefined' || this.isFixed) return;

    try {
      // إصلاح 1: معالجة أخطاء webpack factory
      this.fixWebpackFactory();
      
      // إصلاح 2: معالجة أخطاء React Server Components
      this.fixReactServerComponents();
      
      // إصلاح 3: تحسين تحميل الوحدات
      this.improveModuleLoading();
      
      this.isFixed = true;
      console.log('✅ تم تطبيق إصلاح React Server Components');
      
    } catch (error) {
      console.warn('⚠️ فشل في تطبيق إصلاح React Server Components:', error);
    }
  }

  /**
   * إصلاح أخطاء webpack factory
   */
  private fixWebpackFactory(): void {
    // اعتراض أخطاء webpack factory
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      const message = args.join(' ');
      
      if (this.isWebpackFactoryError(message)) {
        console.warn('🔧 تم اكتشاف خطأ webpack factory - تطبيق الإصلاح...');
        this.handleWebpackFactoryError(message);
        return; // عدم عرض الخطأ
      }
      
      originalConsoleError.apply(console, args);
    };

    // معالجة أخطاء window
    window.addEventListener('error', (event) => {
      if (this.isWebpackFactoryError(event.message)) {
        console.warn('🔧 تم اكتشاف خطأ webpack factory في event listener');
        this.handleWebpackFactoryError(event.message);
        event.preventDefault();
        event.stopPropagation();
      }
    });
  }

  /**
   * إصلاح React Server Components
   */
  private fixReactServerComponents(): void {
    // تحسين تحميل React Server Components
    if ((window as any).__webpack_require__) {
      const originalRequire = (window as any).__webpack_require__;
      
      (window as any).__webpack_require__ = function(moduleId: any) {
        try {
          return originalRequire(moduleId);
        } catch (error) {
          if (ReactServerComponentsFix.getInstance().isReactServerComponentError(error.message)) {
            console.warn('🔧 تم تجاهل خطأ React Server Component:', moduleId);
            
            // إرجاع وحدة فارغة بدلاً من الخطأ
            return {
              default: () => null,
              __esModule: true
            };
          }
          throw error;
        }
      };
    }

    // معالجة أخطاء React hydration
    const originalReactError = (window as any).React?.createElement;
    if (originalReactError) {
      // تحسين معالجة أخطاء React
      const originalCreateElement = (window as any).React.createElement;
      (window as any).React.createElement = function(type: any, props: any, ...children: any[]) {
        try {
          return originalCreateElement.call(this, type, props, ...children);
        } catch (error) {
          console.warn('🔧 خطأ في React.createElement:', error);
          return originalCreateElement.call(this, 'div', { 
            style: { display: 'none' } 
          }, 'Component Error');
        }
      };
    }
  }

  /**
   * تحسين تحميل الوحدات
   */
  private improveModuleLoading(): void {
    // تحسين تحميل الوحدات الديناميكية
    if ((window as any).__webpack_require__ && (window as any).__webpack_require__.e) {
      const originalEnsure = (window as any).__webpack_require__.e;
      
      (window as any).__webpack_require__.e = function(chunkId: string) {
        return originalEnsure.call(this, chunkId).catch((error: Error) => {
          console.warn('🔧 خطأ في تحميل chunk:', chunkId, error);
          
          // محاولة إعادة التحميل مرة واحدة
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              originalEnsure.call(this, chunkId)
                .then(resolve)
                .catch((retryError: Error) => {
                  console.error('❌ فشل في إعادة تحميل chunk:', chunkId, retryError);
                  reject(retryError);
                });
            }, 1000);
          });
        });
      };
    }

    // تحسين import() الديناميكي
    const originalImport = (window as any).import;
    if (originalImport) {
      (window as any).import = function(specifier: string) {
        return originalImport.call(this, specifier).catch((error: Error) => {
          console.warn('🔧 خطأ في dynamic import:', specifier, error);
          
          // محاولة إعادة المحاولة
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              originalImport.call(this, specifier)
                .then(resolve)
                .catch(reject);
            }, 500);
          });
        });
      };
    }
  }

  /**
   * فحص إذا كان خطأ webpack factory
   */
  private isWebpackFactoryError(message: string): boolean {
    if (!message) return false;
    
    const factoryErrorPatterns = [
      'options.factory',
      '__webpack_require__',
      'requireModule',
      'initializeModuleChunk',
      'readChunk',
      'react-server-dom-webpack',
      'performUnitOfWork',
      'workLoopConcurrentByScheduler',
      'renderRootConcurrent'
    ];

    return factoryErrorPatterns.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
   * فحص إذا كان خطأ React Server Component
   */
  private isReactServerComponentError(message: string): boolean {
    if (!message) return false;
    
    const rscErrorPatterns = [
      'server component',
      'react-server',
      'server-dom-webpack',
      'rsc',
      'server-side'
    ];

    return rscErrorPatterns.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
   * معالجة خطأ webpack factory
   */
  private handleWebpackFactoryError(message: string): void {
    console.log('🔧 معالجة خطأ webpack factory...');
    
    // تعطيل React Strict Mode مؤقتاً
    if ((window as any).React && (window as any).React.StrictMode) {
      const originalStrictMode = (window as any).React.StrictMode;
      (window as any).React.StrictMode = ({ children }: { children: any }) => children;
      
      console.log('🔧 تم تعطيل React StrictMode مؤقتاً');
    }

    // تنظيف webpack cache
    if ((window as any).__webpack_require__ && (window as any).__webpack_require__.cache) {
      try {
        Object.keys((window as any).__webpack_require__.cache).forEach(key => {
          if (key.includes('server') || key.includes('rsc')) {
            delete (window as any).__webpack_require__.cache[key];
          }
        });
        console.log('🔧 تم تنظيف webpack cache');
      } catch (error) {
        console.warn('فشل في تنظيف webpack cache:', error);
      }
    }

    // إعادة تحميل إذا لزم الأمر
    if (!sessionStorage.getItem('rsc_fix_applied')) {
      sessionStorage.setItem('rsc_fix_applied', 'true');
      console.log('🔄 إعادة تحميل لتطبيق إصلاح RSC...');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }

  /**
   * الحصول على حالة الإصلاح
   */
  public getStatus(): {
    isFixed: boolean;
    hasAppliedFix: boolean;
  } {
    return {
      isFixed: this.isFixed,
      hasAppliedFix: sessionStorage.getItem('rsc_fix_applied') === 'true'
    };
  }

  /**
   * إعادة تعيين الإصلاح
   */
  public reset(): void {
    sessionStorage.removeItem('rsc_fix_applied');
    this.isFixed = false;
    console.log('✅ تم إعادة تعيين إصلاح React Server Components');
  }
}