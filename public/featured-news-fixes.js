// إصلاح عرض الأخبار المميزة
(function() {
  'use strict';

  // انتظر تحميل الصفحة
  function waitForPageLoad() {
    // التحقق مما إذا كانت الصفحة قد تم تحميلها بالفعل
    if (document.readyState === 'complete') {
      initFeaturedNewsFixers();
    } else {
      window.addEventListener('load', initFeaturedNewsFixers);
    }
  }

  // تهيئة مصلحات الأخبار المميزة
  function initFeaturedNewsFixers() {
    setTimeout(() => {
      fixFeaturedNewsCarousel();
      fixMobileCardsVisibility();
    }, 200);
  }

  // إصلاح كاروسيل الأخبار المميزة
  function fixFeaturedNewsCarousel() {
    const carousel = document.querySelector('.featured-carousel');
    if (carousel) {
      // التأكد من أن الكاروسيل مرئي
      carousel.style.display = 'block';
      carousel.style.opacity = '1';
      carousel.style.visibility = 'visible';
      
      // التحقق من وجود صورة وإضافة فئة الإصلاح إذا كانت موجودة
      const image = carousel.querySelector('img');
      if (image) {
        image.style.opacity = '1';
        image.style.visibility = 'visible';
        image.classList.add('featured-image-fixed');
      }
      
      // التأكد من أن المقالة نفسها مرئية
      const article = carousel.querySelector('article');
      if (article) {
        article.style.display = 'block';
        article.style.opacity = '1';
        article.style.visibility = 'visible';
      }
      
      // إضافة فئة لتأكيد الإصلاح
      carousel.classList.add('featured-carousel-fixed');
    }
  }

  // إصلاح رؤية بطاقات الجوال
  function fixMobileCardsVisibility() {
    // تحسين عرض بطاقات الأخبار في النسخة المحمولة
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      // تطبيق أنماط الإصلاح على بطاقات الأخبار المميزة للجوال
      const mobileCards = document.querySelectorAll('.featured-mobile-card, .news-card-mobile');
      
      mobileCards.forEach(card => {
        card.style.display = 'block';
        card.style.opacity = '1';
        card.style.visibility = 'visible';
        card.classList.add('visibility-fixed');
        
        // إصلاح الصور داخل البطاقات
        const cardImage = card.querySelector('img');
        if (cardImage) {
          cardImage.style.opacity = '1';
          cardImage.style.visibility = 'visible';
        }
        
        // إصلاح النص داخل البطاقات
        const cardTitle = card.querySelector('h2, h3');
        if (cardTitle) {
          cardTitle.style.color = '#000000';
          cardTitle.style.opacity = '1';
        }
      });
    }
  }

  // تنفيذ الإصلاحات
  waitForPageLoad();
  
  // تشغيل الإصلاحات بشكل دوري للتأكد من تطبيقها
  setInterval(fixFeaturedNewsCarousel, 2000);
  
})();
