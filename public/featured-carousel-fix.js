// إصلاح عاجل لكاروسيل الأخبار المميزة
(function() {
  'use strict';
  
  function fixCarousel() {
    // إزالة مربع DEBUG
    const debugBox = document.querySelector('.featured-carousel > div[style*="background: yellow"]');
    if (debugBox) {
      debugBox.style.display = 'none';
    }
    
    // إصلاح الصور المخفية
    const images = document.querySelectorAll('.featured-carousel img');
    images.forEach(img => {
      // فرض الظهور
      img.style.visibility = 'visible';
      img.style.opacity = '1';
      img.style.display = 'block';
      
      // إزالة أي قيود على الحجم
      const parent = img.parentElement;
      if (parent && parent.tagName === 'SPAN') {
        parent.style.display = 'block';
        parent.style.width = '100%';
        parent.style.height = '100%';
      }
    });
    
    // إصلاح الحاويات
    const containers = document.querySelectorAll('.featured-carousel .image-container');
    containers.forEach(container => {
      container.style.display = 'block';
      container.style.width = '100%';
      container.style.height = '100%';
    });
    
    // إصلاح الشبكة
    const grids = document.querySelectorAll('.featured-carousel .grid');
    grids.forEach(grid => {
      grid.style.display = 'grid';
      grid.style.visibility = 'visible';
      grid.style.opacity = '1';
    });
    
    // إزالة overflow hidden مؤقتاً
    const overflowElements = document.querySelectorAll('.featured-carousel .overflow-hidden');
    overflowElements.forEach(el => {
      el.classList.remove('overflow-hidden');
      el.style.overflow = 'visible';
    });
    
    // إصلاح الارتفاع
    const carousel = document.querySelector('.featured-carousel');
    if (carousel) {
      carousel.style.minHeight = '240px';
      
      // البحث عن البلوك الرئيسي
      const mainBlock = carousel.querySelector('.rounded-3xl');
      if (mainBlock) {
        mainBlock.style.minHeight = '220px';
        mainBlock.style.display = 'block';
        mainBlock.style.visibility = 'visible';
      }
    }
    
    console.log('[Featured Carousel Fix] Applied fixes');
  }
  
  // تطبيق الإصلاحات
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixCarousel);
  } else {
    fixCarousel();
  }
  
  // إعادة تطبيق بعد تحميل الصور
  window.addEventListener('load', () => {
    setTimeout(fixCarousel, 500);
  });
  
  // مراقبة التغييرات
  const observer = new MutationObserver(() => {
    const carousel = document.querySelector('.featured-carousel');
    if (carousel) {
      fixCarousel();
    }
  });
  
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
})();
