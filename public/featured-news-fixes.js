// إصلاحات كاروسيل الأخبار المميزة
(function() {
  'use strict';
  
  // التحقق من وجود المكون
  function checkCarousel() {
    const carousel = document.querySelector('.featured-carousel');
    if (!carousel) {
      console.warn('[Featured News] الكاروسيل غير موجود');
      return false;
    }
    return true;
  }
  
  // إصلاح مشاكل التداخل في z-index
  function fixZIndexIssues() {
    const bottomTitle = document.querySelectorAll('.bottom-title-container');
    bottomTitle.forEach(el => {
      el.style.zIndex = '20';
    });
    
    const dots = document.querySelectorAll('.dots-container');
    dots.forEach(el => {
      el.style.zIndex = '25';
    });
    
    const navButtons = document.querySelectorAll('.nav-button');
    navButtons.forEach(el => {
      el.style.zIndex = '30';
    });
  }
  
  // إصلاح مشاكل النقر على الأزرار
  function fixButtonClicks() {
    // التأكد من أن الأزرار تعمل بشكل صحيح
    const buttons = document.querySelectorAll('.featured-carousel button');
    buttons.forEach(button => {
      // إزالة أي معالجات أحداث مكررة
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
    });
  }
  
  // إصلاح مشاكل التحريك التلقائي
  function fixAutoPlay() {
    const carousel = document.querySelector('.featured-carousel');
    if (!carousel) return;
    
    // التأكد من عدم تداخل الأحداث
    carousel.addEventListener('touchstart', (e) => {
      // السماح بالتمرير الطبيعي
      if (e.target.closest('.nav-button') || e.target.closest('.dot')) {
        e.stopPropagation();
      }
    }, { passive: true });
  }
  
  // إصلاح مشاكل الصور
  function fixImages() {
    const images = document.querySelectorAll('.featured-carousel img');
    images.forEach(img => {
      // إضافة معالج للأخطاء
      img.onerror = function() {
        console.error('[Featured News] خطأ في تحميل الصورة:', img.src);
        // يمكن إضافة صورة بديلة هنا
      };
      
      // التأكد من تحميل الصور بشكل صحيح
      if (img.complete && img.naturalHeight === 0) {
        img.src = img.src; // إعادة تحميل
      }
    });
  }
  
  // إصلاح مشاكل الأبعاد على الموبايل
  function fixMobileDimensions() {
    if (window.innerWidth > 768) return;
    
    const imageContainers = document.querySelectorAll('.featured-carousel .image-container');
    imageContainers.forEach(container => {
      container.style.height = '220px';
    });
  }
  
  // تطبيق جميع الإصلاحات
  function applyAllFixes() {
    if (!checkCarousel()) return;
    
    fixZIndexIssues();
    fixButtonClicks();
    fixAutoPlay();
    fixImages();
    fixMobileDimensions();
  }
  
  // تشغيل الإصلاحات عند تحميل الصفحة
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyAllFixes);
  } else {
    applyAllFixes();
  }
  
  // إعادة تطبيق الإصلاحات عند تغيير حجم النافذة
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(applyAllFixes, 250);
  });
  
  // مراقبة التغييرات في DOM
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1 && node.classList && node.classList.contains('featured-carousel')) {
            setTimeout(applyAllFixes, 100);
            return;
          }
        }
      }
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
})();