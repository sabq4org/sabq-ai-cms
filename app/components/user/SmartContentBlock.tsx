      // جلب الأخبار العامة مع إمكانية تضمين الأخبار المميزة
      const cacheKey = '/api/articles/latest?limit=20';
      
      // محاولة استخدام Cache API إذا كانت متوفرة بالمتصفح
      let cachedResponse: any;
      try {
        if ('caches' in window) {
          const cache = await window.caches.open('smart-content-cache');
          cachedResponse = await cache.match(cacheKey);
        }
      } catch (cacheError) {
        // تجاهل أخطاء الكاش وإكمال الجلب بشكل عادي
      }
      
      // استخدام الاستجابة من الكاش إن وجدت أو إجراء طلب جديد
      const response = cachedResponse || await fetch(cacheKey, { 
        signal,
        // تلميح للمتصفح بأننا جربنا الكاش بالفعل
        cache: 'force-cache' 
      });