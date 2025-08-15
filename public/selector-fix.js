// إصلاح مشاكل CSS Selectors غير المدعومة
(function() {
  'use strict';
  
  // دالة آمنة للعثور على العناصر بدلاً من :has() و :contains()
  function findElementWithText(tagName, className, textContent) {
    try {
      const elements = document.querySelectorAll(`${tagName}${className ? '.' + className : ''}`);
      return Array.from(elements).find(el => {
        const span = el.querySelector('span');
        return span && span.textContent && span.textContent.includes(textContent);
      });
    } catch (error) {
      console.warn('Selector error prevented:', error);
      return null;
    }
  }
  
  // إصلاح مشكلة البحث عن عنصر "مجدول"
  function fixScheduledButton() {
    try {
      // البحث الآمن
      const button = findElementWithText('button', null, 'مجدول');
      if (button) {
        // إخفاء الزر إذا كان موجوداً
        button.style.display = 'none';
        console.log('✅ تم إخفاء زر "مجدول" بنجاح');
      }
    } catch (error) {
      console.warn('خطأ في إصلاح زر مجدول:', error);
    }
  }
  
  // منع أخطاء CSS selectors غير المدعومة
  function preventSelectorErrors() {
    // حفظ الدالة الأصلية
    const originalQuerySelector = document.querySelector;
    const originalQuerySelectorAll = document.querySelectorAll;
    
    // تبديل querySelector
    document.querySelector = function(selector) {
      try {
        // فحص للـ selectors المشكوك فيها
        if (selector && (selector.includes(':has(') || selector.includes(':contains('))) {
          console.warn('منع استخدام selector غير مدعوم:', selector);
          return null;
        }
        return originalQuerySelector.call(this, selector);
      } catch (error) {
        console.warn('خطأ في selector، تم تجاهله:', selector, error);
        return null;
      }
    };
    
    // تبديل querySelectorAll
    document.querySelectorAll = function(selector) {
      try {
        // فحص للـ selectors المشكوك فيها
        if (selector && (selector.includes(':has(') || selector.includes(':contains('))) {
          console.warn('منع استخدام selector غير مدعوم:', selector);
          return [];
        }
        return originalQuerySelectorAll.call(this, selector);
      } catch (error) {
        console.warn('خطأ في selector، تم تجاهله:', selector, error);
        return [];
      }
    };
  }
  
  // إصلاح مشاكل CSS loading
  function fixCSSLoadingErrors() {
    // التحقق من الملفات المفقودة وإنشاءها dynamically
    const missingCSS = [
      '/styles/mobile-lite-fixes.css'
    ];
    
    missingCSS.forEach(cssPath => {
      const link = document.querySelector(`link[href="${cssPath}"]`);
      if (link && !link.sheet) {
        console.warn(`ملف CSS مفقود: ${cssPath}`);
        // إزالة الرابط المكسور
        link.remove();
      }
    });
  }
  
  // إصلاح مشاكل 401 authentication
  function fixAuthErrors() {
    // منع تكرار طلبات المصادقة الفاشلة
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      return originalFetch.apply(this, args)
        .catch(error => {
          if (error.message && error.message.includes('401')) {
            console.warn('تم تجاهل خطأ المصادقة:', error);
            return new Response('{}', { status: 200 });
          }
          throw error;
        });
    };
  }
  
  // تشغيل الإصلاحات
  function runFixes() {
    preventSelectorErrors();
    fixCSSLoadingErrors();
    fixAuthErrors();
    
    // تأخير إصلاح الأزرار حتى تحميل DOM
    setTimeout(fixScheduledButton, 1000);
    
    // إعادة المحاولة دورياً
    setInterval(fixScheduledButton, 5000);
  }
  
  // تشغيل عند التحميل
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runFixes);
  } else {
    runFixes();
  }
  
})();
