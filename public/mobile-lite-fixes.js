// إصلاحات النسخة الخفيفة للموبايل
(function() {
  'use strict';
  
  // كشف الموبايل
  const isMobile = window.innerWidth <= 768;
  
  if (!isMobile) return;
  
  // 1. إصلاح بداية الصفحة من أعلى
  function fixPageStart() {
    // منع التمرير التلقائي عند التحميل
    if (window.location.hash) {
      window.history.replaceState(null, null, window.location.pathname);
    }
    
    // التمرير لأعلى الصفحة فوراً
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // إضافة كلاس للجسم بعد التحميل
    setTimeout(() => {
      document.body.classList.add('page-loaded');
    }, 100);
  }
  
  // 2. إصلاح الأخبار المميزة الفارغة
  function fixEmptyFeaturedNews() {
    const featuredSection = document.querySelector('.pt-2.pb-4, .pt-4.pb-6');
    
    if (featuredSection && !featuredSection.querySelector('.featured-carousel')) {
      // إنشاء حالة فارغة مؤقتة
      const emptyState = document.createElement('div');
      emptyState.className = 'featured-empty-state';
      emptyState.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #6b7280;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">📰</div>
          <p style="font-size: 0.875rem;">جاري تحميل الأخبار المميزة...</p>
        </div>
      `;
      featuredSection.appendChild(emptyState);
    }
  }
  
  // 3. إصلاح ارتفاع شريط الإحصائيات
  function fixStatsBar() {
    const statsBar = document.querySelector('.compact-stats-bar');
    if (statsBar) {
      // ضبط الارتفاع التلقائي
      statsBar.style.height = 'auto';
      
      // التأكد من أن العناصر في صف واحد
      const items = statsBar.querySelectorAll('.stat-item');
      items.forEach(item => {
        item.style.display = 'inline-flex';
        item.style.flexDirection = 'column';
        item.style.alignItems = 'center';
        item.style.padding = '0 0.5rem';
      });
    }
  }
  
  // 4. تحسين أداء التمرير
  function improveScrollPerformance() {
    // إيقاف الرسوم المتحركة الثقيلة أثناء التمرير
    let scrollTimer;
    window.addEventListener('scroll', () => {
      document.body.classList.add('is-scrolling');
      
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        document.body.classList.remove('is-scrolling');
      }, 150);
    }, { passive: true });
  }
  
  // 5. إصلاح Lazy Loading للصور
  function fixLazyLoading() {
    // تحسين تحميل الصور
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.loading = 'eager';
            imageObserver.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px'
      });
      
      images.forEach(img => imageObserver.observe(img));
    }
  }
  
  // 6. إصلاح مشاكل iOS الخاصة
  function fixIOSIssues() {
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      // منع التكبير على النقر المزدوج
      let lastTouchEnd = 0;
      document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
          e.preventDefault();
        }
        lastTouchEnd = now;
      }, false);
      
      // إصلاح مشكلة viewport
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0';
      }
    }
  }
  
  // تنفيذ الإصلاحات
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      fixPageStart();
      fixEmptyFeaturedNews();
      fixStatsBar();
      improveScrollPerformance();
      fixLazyLoading();
      fixIOSIssues();
    });
  } else {
    fixPageStart();
    fixEmptyFeaturedNews();
    fixStatsBar();
    improveScrollPerformance();
    fixLazyLoading();
    fixIOSIssues();
  }
  
  // التأكد من التمرير لأعلى عند تغيير الصفحة
  window.addEventListener('load', () => {
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
  });
  
})();
