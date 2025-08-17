/**
 * مدير تحميل الـ Chunks المحسن
 * يتعامل مع أخطاء تحميل JavaScript chunks ويوفر آليات الاسترداد
 */

export interface ChunkLoadingConfig {
  maxRetries: number;
  retryDelay: number;
  exponentialBackoff: boolean;
  fallbackCDN?: string;
  enableServiceWorkerCleanup: boolean;
  enableCacheCleanup: boolean;
}

export interface ChunkError {
  chunkId: string;
  url: string;
  error: Error;
  timestamp: number;
  retryCount: number;
}

export class ChunkLoadingManager {
  private static instance: ChunkLoadingManager;
  private config: ChunkLoadingConfig;
  private failedChunks: Map<string, ChunkError> = new Map();
  private retryTimers: Map<string, NodeJS.Timeout> = new Map();
  private originalWebpackRequire?: any;

  private constructor(config: Partial<ChunkLoadingConfig> = {}) {
    this.config = {
      maxRetries: 3,
      retryDelay: 1000,
      exponentialBackoff: true,
      enableServiceWorkerCleanup: true,
      enableCacheCleanup: true,
      ...config
    };

    this.initializeChunkManager();
  }

  public static getInstance(config?: Partial<ChunkLoadingConfig>): ChunkLoadingManager {
    if (!ChunkLoadingManager.instance) {
      ChunkLoadingManager.instance = new ChunkLoadingManager(config);
    }
    return ChunkLoadingManager.instance;
  }

  /**
   * تهيئة مدير الـ chunks
   */
  private initializeChunkManager(): void {
    if (typeof window === 'undefined') return;

    // اعتراض أخطاء تحميل الـ chunks
    this.interceptChunkErrors();
    
    // مراقبة أخطاء الشبكة العامة
    this.monitorNetworkErrors();
    
    // تنظيف دوري للـ chunks الفاشلة
    this.setupPeriodicCleanup();
  }

  /**
   * اعتراض أخطاء تحميل الـ chunks
   */
  private interceptChunkErrors(): void {
    // اعتراض webpack chunk loading errors
    if (typeof window !== 'undefined' && (window as any).__webpack_require__) {
      this.originalWebpackRequire = (window as any).__webpack_require__;
      
      const originalEnsure = this.originalWebpackRequire.e;
      if (originalEnsure) {
        (window as any).__webpack_require__.e = (chunkId: string) => {
          return originalEnsure.call(this.originalWebpackRequire, chunkId)
            .catch((error: Error) => {
              return this.handleChunkError(chunkId, error);
            });
        };
      }
    }

    // اعتراض أخطاء تحميل الـ scripts
    window.addEventListener('error', (event) => {
      if (event.target && (event.target as HTMLElement).tagName === 'SCRIPT') {
        const script = event.target as HTMLScriptElement;
        const chunkId = this.extractChunkIdFromUrl(script.src);
        if (chunkId) {
          this.handleChunkError(chunkId, new Error(`Failed to load script: ${script.src}`));
        }
      }
    }, true);

    // اعتراض أخطاء تحميل الـ CSS chunks
    window.addEventListener('error', (event) => {
      if (event.target && (event.target as HTMLElement).tagName === 'LINK') {
        const link = event.target as HTMLLinkElement;
        if (link.rel === 'stylesheet') {
          const chunkId = this.extractChunkIdFromUrl(link.href);
          if (chunkId) {
            this.handleChunkError(chunkId, new Error(`Failed to load CSS chunk: ${link.href}`));
          }
        }
      }
    }, true);
  }

  /**
   * مراقبة أخطاء الشبكة
   */
  private monitorNetworkErrors(): void {
    // مراقبة حالة الاتصال
    window.addEventListener('online', () => {
      this.retryFailedChunks();
    });

    window.addEventListener('offline', () => {
      console.warn('🔌 انقطع الاتصال بالإنترنت - تم إيقاف محاولات تحميل الـ chunks');
    });
  }

  /**
   * معالجة خطأ تحميل chunk
   */
  private async handleChunkError(chunkId: string, error: Error): Promise<any> {
    console.error(`❌ فشل تحميل chunk ${chunkId}:`, error);

    const existingError = this.failedChunks.get(chunkId);
    const retryCount = existingError ? existingError.retryCount + 1 : 1;

    // تسجيل الخطأ
    const chunkError: ChunkError = {
      chunkId,
      url: this.getChunkUrl(chunkId),
      error,
      timestamp: Date.now(),
      retryCount
    };

    this.failedChunks.set(chunkId, chunkError);

    // إذا تجاوزنا الحد الأقصى للمحاولات
    if (retryCount > this.config.maxRetries) {
      console.error(`🚨 تجاوز الحد الأقصى للمحاولات لـ chunk ${chunkId}`);
      
      // محاولة التحميل من CDN بديل
      if (this.config.fallbackCDN) {
        return this.loadFromFallbackCDN(chunkId);
      }
      
      // إذا فشل كل شيء، ارمي الخطأ
      throw error;
    }

    // تنظيف الكاش قبل إعادة المحاولة
    if (retryCount === 1) {
      await this.cleanupForChunk(chunkId);
    }

    // إعادة المحاولة مع تأخير
    return this.retryChunkLoading(chunkId, retryCount);
  }

  /**
   * إعادة محاولة تحميل chunk
   */
  private async retryChunkLoading(chunkId: string, retryCount: number): Promise<any> {
    const delay = this.calculateRetryDelay(retryCount);
    
    console.log(`🔄 إعادة محاولة تحميل chunk ${chunkId} (المحاولة ${retryCount}) خلال ${delay}ms`);

    return new Promise((resolve, reject) => {
      const timer = setTimeout(async () => {
        try {
          // محاولة تحميل الـ chunk مرة أخرى
          const result = await this.loadChunk(chunkId);
          
          // إزالة من قائمة الفاشلة عند النجاح
          this.failedChunks.delete(chunkId);
          this.retryTimers.delete(chunkId);
          
          console.log(`✅ نجح تحميل chunk ${chunkId} في المحاولة ${retryCount}`);
          resolve(result);
        } catch (error) {
          // إعادة معالجة الخطأ
          this.handleChunkError(chunkId, error as Error)
            .then(resolve)
            .catch(reject);
        }
      }, delay);

      this.retryTimers.set(chunkId, timer);
    });
  }

  /**
   * تحميل chunk من CDN بديل
   */
  private async loadFromFallbackCDN(chunkId: string): Promise<any> {
    if (!this.config.fallbackCDN) {
      throw new Error(`No fallback CDN configured for chunk ${chunkId}`);
    }

    console.log(`🔄 محاولة تحميل chunk ${chunkId} من CDN بديل`);

    try {
      const fallbackUrl = `${this.config.fallbackCDN}/${chunkId}`;
      const result = await this.loadChunkFromUrl(fallbackUrl);
      
      console.log(`✅ نجح تحميل chunk ${chunkId} من CDN بديل`);
      return result;
    } catch (error) {
      console.error(`❌ فشل تحميل chunk ${chunkId} من CDN بديل:`, error);
      throw error;
    }
  }

  /**
   * تحميل chunk من URL محدد
   */
  private async loadChunkFromUrl(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      
      script.onload = () => {
        document.head.removeChild(script);
        resolve(true);
      };
      
      script.onerror = () => {
        document.head.removeChild(script);
        reject(new Error(`Failed to load script from ${url}`));
      };
      
      document.head.appendChild(script);
    });
  }

  /**
   * تحميل chunk عادي
   */
  private async loadChunk(chunkId: string): Promise<any> {
    if (this.originalWebpackRequire && this.originalWebpackRequire.e) {
      // استخدام webpack الأصلي
      return this.originalWebpackRequire.e(chunkId);
    } else {
      // تحميل مباشر
      const url = this.getChunkUrl(chunkId);
      return this.loadChunkFromUrl(url);
    }
  }

  /**
   * تنظيف الكاش للـ chunk
   */
  private async cleanupForChunk(chunkId: string): Promise<void> {
    console.log(`🧹 تنظيف الكاش لـ chunk ${chunkId}`);

    // تنظيف service workers
    if (this.config.enableServiceWorkerCleanup && 'serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
        console.log('✅ تم تنظيف service workers');
      } catch (error) {
        console.warn('⚠️ فشل في تنظيف service workers:', error);
      }
    }

    // تنظيف browser cache
    if (this.config.enableCacheCleanup && 'caches' in window) {
      try {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          if (cacheName.includes(chunkId) || cacheName.includes('webpack')) {
            await caches.delete(cacheName);
          }
        }
        console.log('✅ تم تنظيف browser cache');
      } catch (error) {
        console.warn('⚠️ فشل في تنظيف browser cache:', error);
      }
    }

    // تنظيف localStorage
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.includes('chunk') || key.includes('webpack') || key.includes(chunkId)) {
          localStorage.removeItem(key);
        }
      });
      console.log('✅ تم تنظيف localStorage');
    } catch (error) {
      console.warn('⚠️ فشل في تنظيف localStorage:', error);
    }
  }

  /**
   * إعادة محاولة جميع الـ chunks الفاشلة
   */
  private async retryFailedChunks(): Promise<void> {
    if (this.failedChunks.size === 0) return;

    console.log(`🔄 إعادة محاولة ${this.failedChunks.size} chunks فاشلة`);

    const retryPromises = Array.from(this.failedChunks.entries()).map(
      async ([chunkId, chunkError]) => {
        try {
          await this.retryChunkLoading(chunkId, chunkError.retryCount + 1);
        } catch (error) {
          console.error(`❌ فشل في إعادة محاولة chunk ${chunkId}:`, error);
        }
      }
    );

    await Promise.allSettled(retryPromises);
  }

  /**
   * حساب تأخير إعادة المحاولة
   */
  private calculateRetryDelay(retryCount: number): number {
    if (!this.config.exponentialBackoff) {
      return this.config.retryDelay;
    }

    // Exponential backoff: delay * (2 ^ (retryCount - 1))
    return this.config.retryDelay * Math.pow(2, retryCount - 1);
  }

  /**
   * استخراج معرف الـ chunk من URL
   */
  private extractChunkIdFromUrl(url: string): string | null {
    // استخراج معرف الـ chunk من URL
    const match = url.match(/\/([^\/]+)\.js$/);
    return match ? match[1] : null;
  }

  /**
   * الحصول على URL الـ chunk
   */
  private getChunkUrl(chunkId: string): string {
    // بناء URL الـ chunk
    const basePath = (window as any).__webpack_public_path__ || '/_next/static/chunks/';
    return `${basePath}${chunkId}.js`;
  }

  /**
   * تنظيف دوري للـ chunks الفاشلة القديمة
   */
  private setupPeriodicCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      const maxAge = 10 * 60 * 1000; // 10 دقائق

      for (const [chunkId, chunkError] of this.failedChunks.entries()) {
        if (now - chunkError.timestamp > maxAge) {
          this.failedChunks.delete(chunkId);
          
          // إلغاء المؤقت إذا كان موجوداً
          const timer = this.retryTimers.get(chunkId);
          if (timer) {
            clearTimeout(timer);
            this.retryTimers.delete(chunkId);
          }
        }
      }
    }, 5 * 60 * 1000); // كل 5 دقائق
  }

  /**
   * الحصول على إحصائيات الـ chunks
   */
  public getChunkStats(): {
    totalFailed: number;
    failedChunks: ChunkError[];
    activeRetries: number;
  } {
    return {
      totalFailed: this.failedChunks.size,
      failedChunks: Array.from(this.failedChunks.values()),
      activeRetries: this.retryTimers.size
    };
  }

  /**
   * إعادة تعيين جميع الـ chunks الفاشلة
   */
  public resetFailedChunks(): void {
    // إلغاء جميع المؤقتات
    for (const timer of this.retryTimers.values()) {
      clearTimeout(timer);
    }

    this.failedChunks.clear();
    this.retryTimers.clear();
    
    console.log('✅ تم إعادة تعيين جميع الـ chunks الفاشلة');
  }

  /**
   * تحديث إعدادات المدير
   */
  public updateConfig(newConfig: Partial<ChunkLoadingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('✅ تم تحديث إعدادات ChunkLoadingManager');
  }
}