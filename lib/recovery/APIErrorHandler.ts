/**
 * معالج أخطاء API المتقدم
 * يتعامل مع فشل استدعاءات API ويوفر آليات الاسترداد والبيانات المؤقتة
 */

export interface APIErrorConfig {
  maxRetries: number;
  retryDelay: number;
  exponentialBackoff: boolean;
  enableOfflineMode: boolean;
  enableCaching: boolean;
  cacheTimeout: number;
  enableFallbackData: boolean;
}

export interface APIError {
  url: string;
  method: string;
  status?: number;
  message: string;
  timestamp: number;
  retryCount: number;
  isNetworkError: boolean;
  isServerError: boolean;
  isClientError: boolean;
}

export interface CachedResponse {
  data: any;
  timestamp: number;
  url: string;
  method: string;
  headers?: Record<string, string>;
}

export class APIErrorHandler {
  private static instance: APIErrorHandler;
  private config: APIErrorConfig;
  private failedRequests: Map<string, APIError> = new Map();
  private cachedResponses: Map<string, CachedResponse> = new Map();
  private retryTimers: Map<string, NodeJS.Timeout> = new Map();
  private isOnline = true;
  private offlineQueue: Array<{
    url: string;
    options: RequestInit;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
  }> = [];

  private constructor(config: Partial<APIErrorConfig> = {}) {
    this.config = {
      maxRetries: 3,
      retryDelay: 1000,
      exponentialBackoff: true,
      enableOfflineMode: true,
      enableCaching: true,
      cacheTimeout: 5 * 60 * 1000, // 5 دقائق
      enableFallbackData: true,
      ...config
    };

    this.initializeAPIErrorHandler();
  }

  public static getInstance(config?: Partial<APIErrorConfig>): APIErrorHandler {
    if (!APIErrorHandler.instance) {
      APIErrorHandler.instance = new APIErrorHandler(config);
    }
    return APIErrorHandler.instance;
  }

  /**
   * تهيئة معالج أخطاء API
   */
  private initializeAPIErrorHandler(): void {
    if (typeof window === 'undefined') return;

    // مراقبة حالة الاتصال
    this.monitorNetworkStatus();
    
    // تنظيف دوري للكاش
    this.setupCacheCleanup();
    
    // استعادة البيانات المحفوظة
    this.loadCachedData();
    
    // اعتراض fetch API
    this.interceptFetchAPI();
  }

  /**
   * مراقبة حالة الشبكة
   */
  private monitorNetworkStatus(): void {
    this.isOnline = navigator.onLine;

    window.addEventListener('online', () => {
      console.log('🌐 عاد الاتصال بالإنترنت');
      this.isOnline = true;
      this.processOfflineQueue();
      this.retryFailedRequests();
    });

    window.addEventListener('offline', () => {
      console.log('📴 انقطع الاتصال بالإنترنت');
      this.isOnline = false;
    });
  }

  /**
   * اعتراض fetch API
   */
  private interceptFetchAPI(): void {
    const originalFetch = window.fetch;
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === 'string' ? input : input.toString();
      const method = init?.method || 'GET';
      
      try {
        // إذا كان body من نوع FormData لا نسمح بتمرير Content-Type يدوياً
        if (init && init.body && typeof FormData !== 'undefined' && init.body instanceof FormData) {
          const headers = new Headers(init.headers || {});
          if (headers.has('Content-Type')) {
            headers.delete('Content-Type');
            init.headers = headers;
          }
        }

        // فحص الكاش أولاً للطلبات GET
        if (method === 'GET' && this.config.enableCaching) {
          const cached = this.getCachedResponse(url, method);
          if (cached) {
            console.log('📦 استخدام البيانات المحفوظة لـ:', url);
            return new Response(JSON.stringify(cached.data), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }

        // إذا كان غير متصل، إضافة للطابور
        if (!this.isOnline && this.config.enableOfflineMode) {
          return this.handleOfflineRequest(url, init || {});
        }

        // تنفيذ الطلب
        const response = await originalFetch(input, init);
        
        // حفظ الاستجابة الناجحة في الكاش
        if (response.ok && method === 'GET' && this.config.enableCaching) {
          const data = await response.clone().json();
          this.cacheResponse(url, method, data);
        }

        // إزالة من قائمة الفاشلة عند النجاح
        const requestKey = this.getRequestKey(url, method);
        this.failedRequests.delete(requestKey);

        return response;
        
      } catch (error) {
        return this.handleAPIError(url, method, error as Error, init);
      }
    };
  }

  /**
   * معالجة خطأ API
   */
  private async handleAPIError(
    url: string, 
    method: string, 
    error: Error, 
    options?: RequestInit
  ): Promise<Response> {
    const requestKey = this.getRequestKey(url, method);
    const existingError = this.failedRequests.get(requestKey);
    const retryCount = existingError ? existingError.retryCount + 1 : 1;

    // تحليل نوع الخطأ
    const apiError: APIError = {
      url,
      method,
      message: error.message,
      timestamp: Date.now(),
      retryCount,
      isNetworkError: this.isNetworkError(error),
      isServerError: false,
      isClientError: false
    };

    // إذا كان خطأ HTTP response
    if (error.message.includes('HTTP')) {
      const statusMatch = error.message.match(/(\d{3})/);
      if (statusMatch) {
        apiError.status = parseInt(statusMatch[1]);
        apiError.isServerError = apiError.status >= 500;
        apiError.isClientError = apiError.status >= 400 && apiError.status < 500;
      }
    }

    this.failedRequests.set(requestKey, apiError);

    console.error(`❌ خطأ API: ${method} ${url}`, apiError);

    // محاولة الاسترداد
    if (retryCount <= this.config.maxRetries && this.shouldRetry(apiError)) {
      return this.retryRequest(url, method, options, retryCount);
    }

    // استخدام البيانات المحفوظة كحل أخير
    if (this.config.enableFallbackData) {
      const fallbackData = this.getFallbackData(url, method);
      if (fallbackData) {
        console.log('🔄 استخدام البيانات الاحتياطية لـ:', url);
        return new Response(JSON.stringify(fallbackData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // إرجاع الخطأ
    throw error;
  }

  /**
   * إعادة محاولة الطلب
   */
  private async retryRequest(
    url: string, 
    method: string, 
    options?: RequestInit, 
    retryCount: number = 1
  ): Promise<Response> {
    const delay = this.calculateRetryDelay(retryCount);
    
    console.log(`🔄 إعادة محاولة ${method} ${url} (المحاولة ${retryCount}) خلال ${delay}ms`);

    return new Promise((resolve, reject) => {
      const timer = setTimeout(async () => {
        try {
          const response = await fetch(url, options);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          resolve(response);
        } catch (error) {
          this.handleAPIError(url, method, error as Error, options)
            .then(resolve)
            .catch(reject);
        }
      }, delay);

      const requestKey = this.getRequestKey(url, method);
      this.retryTimers.set(requestKey, timer);
    });
  }

  /**
   * معالجة الطلبات في وضع عدم الاتصال
   */
  private handleOfflineRequest(url: string, options: RequestInit): Promise<Response> {
    // محاولة استخدام البيانات المحفوظة أولاً
    const cached = this.getCachedResponse(url, options.method || 'GET');
    if (cached) {
      console.log('📱 استخدام البيانات المحفوظة في وضع عدم الاتصال:', url);
      return Promise.resolve(new Response(JSON.stringify(cached.data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }));
    }

    // إضافة للطابور للمعالجة لاحقاً
    return new Promise((resolve, reject) => {
      this.offlineQueue.push({
        url,
        options,
        resolve,
        reject
      });

      console.log(`📋 تم إضافة الطلب للطابور: ${options.method || 'GET'} ${url}`);
      
      // إرجاع بيانات احتياطية إذا كانت متوفرة
      const fallbackData = this.getFallbackData(url, options.method || 'GET');
      if (fallbackData) {
        resolve(new Response(JSON.stringify(fallbackData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }));
      } else {
        reject(new Error('No internet connection and no cached data available'));
      }
    });
  }

  /**
   * معالجة طابور الطلبات المؤجلة
   */
  private async processOfflineQueue(): Promise<void> {
    if (this.offlineQueue.length === 0) return;

    console.log(`🔄 معالجة ${this.offlineQueue.length} طلب مؤجل`);

    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const request of queue) {
      try {
        const response = await fetch(request.url, request.options);
        request.resolve(response);
      } catch (error) {
        request.reject(error);
      }
    }
  }

  /**
   * إعادة محاولة الطلبات الفاشلة
   */
  private async retryFailedRequests(): Promise<void> {
    if (this.failedRequests.size === 0) return;

    console.log(`🔄 إعادة محاولة ${this.failedRequests.size} طلب فاشل`);

    const requests = Array.from(this.failedRequests.entries());
    
    for (const [requestKey, apiError] of requests) {
      if (apiError.retryCount < this.config.maxRetries && this.shouldRetry(apiError)) {
        try {
          await this.retryRequest(apiError.url, apiError.method, {}, apiError.retryCount + 1);
        } catch (error) {
          console.error(`❌ فشل في إعادة محاولة ${requestKey}:`, error);
        }
      }
    }
  }

  /**
   * حفظ الاستجابة في الكاش
   */
  private cacheResponse(url: string, method: string, data: any): void {
    const cacheKey = this.getCacheKey(url, method);
    const cachedResponse: CachedResponse = {
      data,
      timestamp: Date.now(),
      url,
      method
    };

    this.cachedResponses.set(cacheKey, cachedResponse);
    
    // حفظ في localStorage
    try {
      const cacheData = Array.from(this.cachedResponses.entries());
      localStorage.setItem('api_cache', JSON.stringify(cacheData));
    } catch (error) {
      console.warn('فشل في حفظ الكاش:', error);
    }
  }

  /**
   * الحصول على الاستجابة المحفوظة
   */
  private getCachedResponse(url: string, method: string): CachedResponse | null {
    const cacheKey = this.getCacheKey(url, method);
    const cached = this.cachedResponses.get(cacheKey);

    if (!cached) return null;

    // فحص انتهاء صلاحية الكاش
    const isExpired = Date.now() - cached.timestamp > this.config.cacheTimeout;
    if (isExpired) {
      this.cachedResponses.delete(cacheKey);
      return null;
    }

    return cached;
  }

  /**
   * الحصول على البيانات الاحتياطية
   */
  private getFallbackData(url: string, method: string): any | null {
    // محاولة الحصول من الكاش أولاً (حتى لو منتهي الصلاحية)
    const cacheKey = this.getCacheKey(url, method);
    const cached = this.cachedResponses.get(cacheKey);
    if (cached) {
      return cached.data;
    }

    // بيانات احتياطية ثابتة للـ endpoints المهمة
    const fallbackData = this.getStaticFallbackData(url);
    return fallbackData;
  }

  /**
   * الحصول على بيانات احتياطية ثابتة
   */
  private getStaticFallbackData(url: string): any | null {
    // بيانات احتياطية للـ endpoints المهمة
    if (url.includes('/api/categories')) {
      return {
        success: true,
        data: [],
        message: 'البيانات غير متوفرة حالياً'
      };
    }

    if (url.includes('/api/articles')) {
      return {
        success: true,
        articles: [],
        total: 0,
        message: 'المقالات غير متوفرة حالياً'
      };
    }

    if (url.includes('/api/auth/me')) {
      return {
        success: false,
        message: 'يرجى تسجيل الدخول مرة أخرى'
      };
    }

    return null;
  }

  /**
   * تحديد إذا كان يجب إعادة المحاولة
   */
  private shouldRetry(apiError: APIError): boolean {
    // عدم إعادة المحاولة للأخطاء 4xx (عدا 408, 429)
    if (apiError.isClientError && apiError.status !== 408 && apiError.status !== 429) {
      return false;
    }

    // إعادة المحاولة للأخطاء 5xx وأخطاء الشبكة
    return apiError.isServerError || apiError.isNetworkError;
  }

  /**
   * فحص إذا كان خطأ شبكة
   */
  private isNetworkError(error: Error): boolean {
    const networkErrorMessages = [
      'network error',
      'failed to fetch',
      'connection',
      'timeout',
      'offline',
      'no internet'
    ];

    return networkErrorMessages.some(msg => 
      error.message.toLowerCase().includes(msg)
    );
  }

  /**
   * حساب تأخير إعادة المحاولة
   */
  private calculateRetryDelay(retryCount: number): number {
    if (!this.config.exponentialBackoff) {
      return this.config.retryDelay;
    }

    return this.config.retryDelay * Math.pow(2, retryCount - 1);
  }

  /**
   * تحميل البيانات المحفوظة
   */
  private loadCachedData(): void {
    try {
      const cacheData = localStorage.getItem('api_cache');
      if (cacheData) {
        const entries = JSON.parse(cacheData);
        this.cachedResponses = new Map(entries);
      }
    } catch (error) {
      console.warn('فشل في تحميل الكاش:', error);
    }
  }

  /**
   * تنظيف الكاش المنتهي الصلاحية
   */
  private setupCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      
      for (const [key, cached] of this.cachedResponses.entries()) {
        if (now - cached.timestamp > this.config.cacheTimeout) {
          this.cachedResponses.delete(key);
        }
      }

      // حفظ الكاش المنظف
      try {
        const cacheData = Array.from(this.cachedResponses.entries());
        localStorage.setItem('api_cache', JSON.stringify(cacheData));
      } catch (error) {
        console.warn('فشل في حفظ الكاش المنظف:', error);
      }
    }, 60000); // كل دقيقة
  }

  /**
   * مساعدات لتوليد المفاتيح
   */
  private getRequestKey(url: string, method: string): string {
    return `${method}:${url}`;
  }

  private getCacheKey(url: string, method: string): string {
    return `${method}:${url}`;
  }

  /**
   * الحصول على إحصائيات API
   */
  public getAPIStats(): {
    failedRequests: number;
    cachedResponses: number;
    offlineQueue: number;
    isOnline: boolean;
    errors: APIError[];
  } {
    return {
      failedRequests: this.failedRequests.size,
      cachedResponses: this.cachedResponses.size,
      offlineQueue: this.offlineQueue.length,
      isOnline: this.isOnline,
      errors: Array.from(this.failedRequests.values())
    };
  }

  /**
   * مسح جميع البيانات
   */
  public clearAll(): void {
    this.failedRequests.clear();
    this.cachedResponses.clear();
    this.offlineQueue = [];
    
    // مسح المؤقتات
    for (const timer of this.retryTimers.values()) {
      clearTimeout(timer);
    }
    this.retryTimers.clear();

    // مسح localStorage
    localStorage.removeItem('api_cache');
    
    console.log('✅ تم مسح جميع بيانات API');
  }
}