// Mobile Debug Script for Featured News
console.log('[MOBILE TEST] Testing featured news on mobile version');

// تأخير للتأكد من تحميل الصفحة
setTimeout(() => {
  console.log('[MOBILE TEST] Page loaded, checking elements...');
  
  // البحث عن الأخبار المميزة
  const featuredElements = document.querySelectorAll('.featured-carousel, [class*="featured"], [class*="Featured"]');
  console.log('[MOBILE TEST] Featured elements found:', featuredElements.length);
  
  featuredElements.forEach((el, i) => {
    console.log(`[MOBILE TEST] Element ${i}:`, {
      className: el.className,
      innerHTML: el.innerHTML.substring(0, 200) + '...',
      visible: !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)
    });
  });
  
  // البحث عن مكونات الأخبار بشكل عام
  const newsElements = document.querySelectorAll('[class*="news"], [class*="News"], [class*="article"], [class*="Article"]');
  console.log('[MOBILE TEST] News elements found:', newsElements.length);
  
  // فحص console errors
  const errors = window.console._errors || [];
  if (errors.length > 0) {
    console.log('[MOBILE TEST] Console errors found:', errors);
  }
  
}, 3000);

// تجميع أخطاء console
(function() {
  window.console._errors = [];
  const originalError = console.error;
  console.error = function(...args) {
    window.console._errors.push(args);
    originalError.apply(console, args);
  };
})();
