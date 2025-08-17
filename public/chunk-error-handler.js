/**
 * معالج أخطاء الـ Chunks والـ DevTools - يتم تحميله قبل التطبيق الرئيسي
 * يتعامل مع أخطاء تحميل JavaScript chunks وأخطاء Next.js DevTools
 */

(function() {
  'use strict';

  // إصلاح Next.js DevTools أولاً
  function fixNextDevTools() {
    // تعطيل DevTools إذا كان يسبب مشاكل
    if (localStorage.getItem('__NEXT_DEVTOOLS_DISABLED__') === 'true') {
      window.__NEXT_DEVTOOLS_DISABLED__ = true;
      return;
    }

    // اعتراض أخطاء DevTools
    const originalError = console.error;
    console.error = function(...args) {
      const message = args.join(' ');
      
      // فحص أخطاء DevTools
      if (message.includes('webpack-internal') || 
          message.includes('next-devtools') ||
          message.includes('tr@webpack-internal') ||
          message.includes('o6@webpack-internal')) {
        
        console.warn('🔧 تم اكتشاف خطأ DevTools - تطبيق الإصلاح...');
        
        // تعطيل DevTools
        localStorage.setItem('__NEXT_DEVTOOLS_DISABLED__', 'true');
        window.__NEXT_DEVTOOLS_DISABLED__ = true;
        
        // إعادة تحميل إذا لم يتم من قبل
        if (!sessionStorage.getItem('devtools_fix_reload')) {
          sessionStorage.setItem('devtools_fix_reload', 'true');
          setTimeout(() => window.location.reload(), 1000);
        }
        
        return; // عدم عرض الخطأ
      }
      
      originalError.apply(console, args);
    };

    // معالجة أخطاء window
    window.addEventListener('error', function(event) {
      if (event.message && (
          event.message.includes('webpack-internal') ||
          event.message.includes('next-devtools') ||
          event.filename && event.filename.includes('next-devtools')
        )) {
        console.warn('🔧 تم منع خطأ DevTools');
        event.preventDefault();
        event.stopPropagation();
      }
    });

    console.log('✅ تم تطبيق إصلاح DevTools');
  }

  // تطبيق إصلاح DevTools فوراً
  fixNextDevTools();

  // إعدادات المعالج
  const CONFIG = {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    EXPONENTIAL_BACKOFF: true,
    AUTO_RELOAD_ON_CRITICAL: true,
    STORAGE_KEY: 'sabq_chunk_errors'
  };

  // متغيرات التتبع
  let failedChunks = new Map();
  let retryTimers = new Map();
  let hasReloaded = false;

  /**
   * تسجيل خطأ في الكونسول مع تنسيق موحد
   */
  function logError(message, data) {
    console.error('🚨 [ChunkErrorHandler]', message, data || '');
  }

  function logInfo(message, data) {
    console.log('ℹ️ [ChunkErrorHandler]', message, data || '');
  }

  function logSuccess(message, data) {
    console.log('✅ [ChunkErrorHandler]', message, data || '');
  }

  /**
   * حفظ معلومات الخطأ في localStorage
   */
  function saveErrorInfo(chunkId, error, retryCount) {
    try {
      const errorInfo = {
        chunkId,
        error: error.message,
        timestamp: Date.now(),
        retryCount,
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      const existingErrors = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '[]');
      existingErrors.push(errorInfo);
      
      // الاحتفاظ بآخر 50 خطأ فقط
      if (existingErrors.length > 50) {
        existingErrors.splice(0, existingErrors.length - 50);
      }

      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(existingErrors));
    } catch (e) {
      logError('فشل في حفظ معلومات الخطأ:', e);
    }
  }

  /**
   * حساب تأخير إعادة المحاولة
   */
  function calculateRetryDelay(retryCount) {
    if (!CONFIG.EXPONENTIAL_BACKOFF) {
      return CONFIG.RETRY_DELAY;
    }
    return CONFIG.RETRY_DELAY * Math.pow(2, retryCount - 1);
  }

  /**
   * تنظيف الكاش والبيانات المحفوظة
   */
  async function cleanupCache() {
    logInfo('بدء تنظيف الكاش...');

    // تنظيف service workers
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
        logSuccess('تم تنظيف service workers');
      } catch (error) {
        logError('فشل في تنظيف service workers:', error);
      }
    }

    // تنظيف browser cache
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          if (cacheName.includes('webpack') || cacheName.includes('chunk')) {
            await caches.delete(cacheName);
          }
        }
        logSuccess('تم تنظيف browser cache');
      } catch (error) {
        logError('فشل في تنظيف browser cache:', error);
      }
    }

    // تنظيف localStorage
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.includes('chunk') || key.includes('webpack') || key.includes('next')) {
          localStorage.removeItem(key);
        }
      });
      logSuccess('تم تنظيف localStorage');
    } catch (error) {
      logError('فشل في تنظيف localStorage:', error);
    }
  }

  /**
   * إعادة تحميل الصفحة مع تنظيف شامل
   */
  function performFullReload() {
    if (hasReloaded) {
      logError('تم منع إعادة التحميل المتكررة');
      return;
    }

    hasReloaded = true;
    sessionStorage.setItem('sabq_chunk_reload', Date.now().toString());
    
    logInfo('إجراء إعادة تحميل شاملة...');
    
    // تنظيف سريع
    try {
      sessionStorage.clear();
    } catch (e) {
      logError('فشل في مسح sessionStorage:', e);
    }

    // إعادة تحميل
    window.location.reload(true);
  }

  /**
   * معالجة خطأ تحميل chunk
   */
  function handleChunkError(chunkId, error, scriptElement) {
    logError(`فشل تحميل chunk: ${chunkId}`, error);

    const existingError = failedChunks.get(chunkId);
    const retryCount = existingError ? existingError.retryCount + 1 : 1;

    // حفظ معلومات الخطأ
    saveErrorInfo(chunkId, error, retryCount);

    // تحديث معلومات الخطأ
    failedChunks.set(chunkId, {
      chunkId,
      error,
      retryCount,
      timestamp: Date.now(),
      scriptElement
    });

    // إذا تجاوزنا الحد الأقصى للمحاولات
    if (retryCount > CONFIG.MAX_RETRIES) {
      logError(`تجاوز الحد الأقصى للمحاولات لـ chunk: ${chunkId}`);
      
      // إعادة تحميل تلقائية للأخطاء الحرجة
      if (CONFIG.AUTO_RELOAD_ON_CRITICAL) {
        setTimeout(performFullReload, 1000);
      }
      return;
    }

    // إعادة المحاولة مع تأخير
    const delay = calculateRetryDelay(retryCount);
    logInfo(`إعادة محاولة تحميل chunk ${chunkId} خلال ${delay}ms (المحاولة ${retryCount})`);

    const timer = setTimeout(() => {
      retryChunkLoading(chunkId, scriptElement);
    }, delay);

    retryTimers.set(chunkId, timer);
  }

  /**
   * إعادة محاولة تحميل chunk
   */
  function retryChunkLoading(chunkId, originalScript) {
    logInfo(`إعادة محاولة تحميل chunk: ${chunkId}`);

    // إنشاء script element جديد
    const newScript = document.createElement('script');
    newScript.src = originalScript.src + '?retry=' + Date.now(); // إضافة query parameter لتجنب الكاش
    newScript.async = true;
    newScript.crossOrigin = originalScript.crossOrigin;

    // معالج النجاح
    newScript.onload = function() {
      logSuccess(`نجح تحميل chunk: ${chunkId}`);
      
      // إزالة من قائمة الفاشلة
      failedChunks.delete(chunkId);
      retryTimers.delete(chunkId);
      
      // إزالة العنصر
      if (newScript.parentNode) {
        newScript.parentNode.removeChild(newScript);
      }
    };

    // معالج الفشل
    newScript.onerror = function() {
      const error = new Error(`Failed to load chunk: ${chunkId} (retry)`);
      handleChunkError(chunkId, error, newScript);
      
      // إزالة العنصر
      if (newScript.parentNode) {
        newScript.parentNode.removeChild(newScript);
      }
    };

    // إضافة للصفحة
    document.head.appendChild(newScript);
  }

  /**
   * مراقبة أخطاء تحميل الـ scripts
   */
  function monitorScriptErrors() {
    // مراقبة أخطاء تحميل الـ scripts
    document.addEventListener('error', function(event) {
      if (event.target && event.target.tagName === 'SCRIPT') {
        const script = event.target;
        const src = script.src;
        
        // استخراج معرف الـ chunk من URL
        const chunkMatch = src.match(/\/([^\/]+)\.js/);
        if (chunkMatch) {
          const chunkId = chunkMatch[1];
          const error = new Error(`Script loading failed: ${src}`);
          handleChunkError(chunkId, error, script);
        }
      }
    }, true);

    // مراقبة أخطاء تحميل الـ CSS
    document.addEventListener('error', function(event) {
      if (event.target && event.target.tagName === 'LINK' && event.target.rel === 'stylesheet') {
        const link = event.target;
        const href = link.href;
        
        logError('فشل تحميل CSS:', href);
        
        // محاولة إعادة تحميل CSS
        setTimeout(() => {
          const newLink = document.createElement('link');
          newLink.rel = 'stylesheet';
          newLink.href = href + '?retry=' + Date.now();
          document.head.appendChild(newLink);
        }, 1000);
      }
    }, true);
  }

  /**
   * مراقبة حالة الشبكة
   */
  function monitorNetworkStatus() {
    // عند عودة الاتصال، إعادة محاولة الـ chunks الفاشلة
    window.addEventListener('online', function() {
      logInfo('عاد الاتصال بالإنترنت - إعادة محاولة الـ chunks الفاشلة');
      
      // إعادة محاولة جميع الـ chunks الفاشلة
      for (const [chunkId, errorInfo] of failedChunks.entries()) {
        if (errorInfo.retryCount <= CONFIG.MAX_RETRIES) {
          setTimeout(() => {
            retryChunkLoading(chunkId, errorInfo.scriptElement);
          }, 1000);
        }
      }
    });

    window.addEventListener('offline', function() {
      logInfo('انقطع الاتصال بالإنترنت');
    });
  }

  /**
   * فحص إذا كانت الصفحة تم إعادة تحميلها بسبب خطأ chunk
   */
  function checkReloadStatus() {
    const reloadTime = sessionStorage.getItem('sabq_chunk_reload');
    if (reloadTime) {
      const timeDiff = Date.now() - parseInt(reloadTime);
      if (timeDiff < 10000) { // خلال 10 ثوانٍ
        logInfo('تم إعادة تحميل الصفحة بسبب خطأ chunk');
        sessionStorage.removeItem('sabq_chunk_reload');
      }
    }
  }

  /**
   * تنظيف دوري للبيانات القديمة
   */
  function setupPeriodicCleanup() {
    setInterval(() => {
      const now = Date.now();
      const maxAge = 10 * 60 * 1000; // 10 دقائق

      // تنظيف الـ chunks الفاشلة القديمة
      for (const [chunkId, errorInfo] of failedChunks.entries()) {
        if (now - errorInfo.timestamp > maxAge) {
          failedChunks.delete(chunkId);
          
          const timer = retryTimers.get(chunkId);
          if (timer) {
            clearTimeout(timer);
            retryTimers.delete(chunkId);
          }
        }
      }

      // تنظيف سجلات الأخطاء القديمة
      try {
        const errors = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '[]');
        const filteredErrors = errors.filter(error => now - error.timestamp < 24 * 60 * 60 * 1000); // 24 ساعة
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(filteredErrors));
      } catch (e) {
        logError('فشل في تنظيف سجلات الأخطاء:', e);
      }
    }, 5 * 60 * 1000); // كل 5 دقائق
  }

  /**
   * تهيئة معالج الأخطاء
   */
  function initialize() {
    logInfo('تهيئة معالج أخطاء الـ Chunks...');

    // فحص حالة إعادة التحميل
    checkReloadStatus();

    // بدء المراقبة
    monitorScriptErrors();
    monitorNetworkStatus();
    setupPeriodicCleanup();

    // تنظيف الكاش إذا كان هناك أخطاء سابقة
    const previousErrors = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (previousErrors) {
      const errors = JSON.parse(previousErrors);
      const recentErrors = errors.filter(error => Date.now() - error.timestamp < 60000); // خلال دقيقة
      
      if (recentErrors.length > 2) {
        logInfo('تم اكتشاف أخطاء متكررة - تنظيف الكاش...');
        cleanupCache();
      }
    }

    logSuccess('تم تهيئة معالج أخطاء الـ Chunks بنجاح');
  }

  // تهيئة المعالج عند تحميل الصفحة
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  // إتاحة واجهة برمجية للتحكم
  window.ChunkErrorHandler = {
    getStats: () => ({
      failedChunks: Array.from(failedChunks.values()),
      activeRetries: retryTimers.size,
      config: CONFIG
    }),
    
    clearErrors: () => {
      failedChunks.clear();
      for (const timer of retryTimers.values()) {
        clearTimeout(timer);
      }
      retryTimers.clear();
      localStorage.removeItem(CONFIG.STORAGE_KEY);
      logSuccess('تم مسح جميع أخطاء الـ Chunks');
    },
    
    forceReload: performFullReload,
    
    cleanCache: cleanupCache
  };

})();