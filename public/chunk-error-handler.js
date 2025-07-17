// معالج أخطاء chunk loading
(function() {
  'use strict';
  
  // تتبع محاولات إعادة التحميل
  let reloadAttempts = 0;
  const MAX_RELOAD_ATTEMPTS = 2;
  
  // معالج الأخطاء العام
  window.addEventListener('error', function(event) {
    const error = event.error || {};
    const message = error.message || event.message || '';
    
    // التحقق من أخطاء chunk loading
    if (message.includes('Loading chunk') || 
        message.includes('Failed to fetch dynamically imported module') ||
        message.includes('ChunkLoadError')) {
      
      console.error('[Chunk Error Handler] Detected chunk loading error:', message);
      
      // التحقق من عدد المحاولات
      const storageKey = 'chunk_reload_attempts';
      const storedAttempts = sessionStorage.getItem(storageKey);
      reloadAttempts = storedAttempts ? parseInt(storedAttempts, 10) : 0;
      
      if (reloadAttempts < MAX_RELOAD_ATTEMPTS) {
        // زيادة عداد المحاولات
        reloadAttempts++;
        sessionStorage.setItem(storageKey, reloadAttempts.toString());
        
        console.log(`[Chunk Error Handler] Attempting reload (${reloadAttempts}/${MAX_RELOAD_ATTEMPTS})...`);
        
        // تنظيف الكاش
        if ('caches' in window) {
          caches.keys().then(function(names) {
            return Promise.all(
              names.map(function(name) {
                return caches.delete(name);
              })
            );
          }).then(function() {
            // إعادة التحميل بعد تنظيف الكاش
            window.location.reload(true);
          });
        } else {
          // إعادة التحميل مباشرة إذا لم يكن الكاش متاحاً
          window.location.reload(true);
        }
      } else {
        // إذا فشلت جميع المحاولات، عرض رسالة خطأ
        console.error('[Chunk Error Handler] Max reload attempts reached');
        sessionStorage.removeItem(storageKey);
        
        // عرض رسالة خطأ للمستخدم
        showErrorMessage();
      }
      
      // منع الخطأ من الظهور في وحدة التحكم
      event.preventDefault();
      return true;
    }
  });
  
  // معالج unhandledrejection للـ Promises
  window.addEventListener('unhandledrejection', function(event) {
    const reason = event.reason || {};
    const message = reason.message || reason.toString() || '';
    
    if (message.includes('Loading chunk') || 
        message.includes('Failed to fetch dynamically imported module')) {
      console.error('[Chunk Error Handler] Detected promise rejection:', message);
      event.preventDefault();
    }
  });
  
  // إعادة تعيين عداد المحاولات عند تحميل الصفحة بنجاح
  window.addEventListener('load', function() {
    const storageKey = 'chunk_reload_attempts';
    const hasError = sessionStorage.getItem('chunk_error_occurred');
    
    if (!hasError) {
      sessionStorage.removeItem(storageKey);
    }
    sessionStorage.removeItem('chunk_error_occurred');
  });
  
  // دالة عرض رسالة الخطأ
  function showErrorMessage() {
    // إنشاء عنصر رسالة الخطأ
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      text-align: center;
      z-index: 999999;
      max-width: 400px;
      width: 90%;
    `;
    
    errorDiv.innerHTML = `
      <div style="color: #ef4444; font-size: 48px; margin-bottom: 20px;">⚠️</div>
      <h2 style="color: #1f2937; margin-bottom: 15px; font-size: 20px;">حدث خطأ في تحميل الصفحة</h2>
      <p style="color: #6b7280; margin-bottom: 25px; line-height: 1.5;">
        نعتذر عن الإزعاج. يرجى مسح ذاكرة التخزين المؤقت للمتصفح والمحاولة مرة أخرى.
      </p>
      <button onclick="location.reload(true)" style="
        background: #3b82f6;
        color: white;
        border: none;
        padding: 10px 24px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 16px;
        margin-right: 10px;
      ">إعادة المحاولة</button>
      <button onclick="location.href='/'" style="
        background: #e5e7eb;
        color: #374151;
        border: none;
        padding: 10px 24px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 16px;
      ">الصفحة الرئيسية</button>
    `;
    
    // إضافة خلفية شفافة
    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 999998;
    `;
    
    document.body.appendChild(backdrop);
    document.body.appendChild(errorDiv);
  }
})(); 