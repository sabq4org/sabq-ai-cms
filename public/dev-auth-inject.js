// إعداد التوثيق للتطوير
(function() {
  'use strict';
  
  // معرّف المستخدم للتطوير
  const DEV_USER_EMAIL = 'editor@sabq.ai';
  const DEV_USER_ID = '0f107dd1-bfb7-4fac-b664-6587e6fc9a1e';
  
  // تطبيق middleware لإضافة headers للطلبات
  if (typeof window !== 'undefined') {
    const originalFetch = window.fetch;
    
    window.fetch = function(url, options = {}) {
      // التحقق من أن هذا طلب API
      if (typeof url === 'string' && url.startsWith('/api/')) {
        options.headers = options.headers || {};
        
        // إضافة user-id header للتطوير
        if (!options.headers['user-id']) {
          options.headers['user-id'] = DEV_USER_EMAIL;
        }
      }
      
      return originalFetch(url, options);
    };
    
    console.log('🔧 تم تفعيل وضع التطوير - التوثيق التلقائي مفعل');
  }
})();
