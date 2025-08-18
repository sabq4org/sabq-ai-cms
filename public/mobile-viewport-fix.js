/**
 * إصلاحات ديناميكية لمشكلة عرض الصفحات على الموبايل
 * Dynamic Mobile Viewport Fixes
 */

(function() {
  'use strict';

  // التحقق من أننا على جهاز موبايل
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;

  if (!isMobile) return;

  console.log('تطبيق إصلاحات الموبايل...');

  // 1. إضافة أو تحديث viewport meta tag
  function fixViewport() {
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
  }

  // 2. إصلاح القوائم الجانبية
  function hideSidebars() {
    const sidebars = document.querySelectorAll('.sidebar, aside, nav[class*="sidebar"], [class*="sidebar"]:not(.mobile-sidebar)');
    sidebars.forEach(sidebar => {
      sidebar.style.display = 'none';
      sidebar.style.width = '0';
      sidebar.style.visibility = 'hidden';
    });
  }

  // 3. إصلاح عرض المحتوى
  function fixContentWidth() {
    // إصلاح الحاويات الرئيسية
    const containers = [
      document.body,
      document.documentElement,
      ...document.querySelectorAll('#__next, main, .main-content, .content, .page-container, .news-page-container')
    ];

    containers.forEach(container => {
      if (container) {
        container.style.width = '100%';
        container.style.maxWidth = '100vw';
        container.style.margin = '0';
        container.style.overflowX = 'hidden';
      }
    });

    // إصلاح المحتوى الداخلي
    const contentElements = document.querySelectorAll('.page-content, .inner-content, main > div');
    contentElements.forEach(el => {
      el.style.width = '100%';
      el.style.padding = '16px';
      el.style.boxSizing = 'border-box';
    });
  }

  // 4. تحويل الجداول إلى بطاقات
  function transformTables() {
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
      // حفظ headers
      const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
      
      // تطبيق data-labels
      const rows = table.querySelectorAll('tbody tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        cells.forEach((cell, index) => {
          if (headers[index]) {
            cell.setAttribute('data-label', headers[index]);
          }
        });
      });

      // تطبيق أنماط الموبايل
      table.classList.add('mobile-table');
    });
  }

  // 5. إصلاح الأزرار وحقول الإدخال
  function fixFormElements() {
    const inputs = document.querySelectorAll('input, select, textarea, button');
    inputs.forEach(input => {
      if (input.tagName.toLowerCase() !== 'button') {
        input.style.fontSize = '16px'; // منع التكبير على iOS
      }
      input.style.minHeight = '44px';
      input.style.touchAction = 'manipulation';
    });
  }

  // 6. إصلاح overflow
  function preventHorizontalScroll() {
    // فحص جميع العناصر
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width > window.innerWidth) {
        console.log('عنصر يتجاوز عرض الشاشة:', el);
        el.style.maxWidth = '100vw';
        el.style.overflowX = 'hidden';
      }
    });
  }

  // 7. تطبيق الإصلاحات
  function applyAllFixes() {
    fixViewport();
    hideSidebars();
    fixContentWidth();
    transformTables();
    fixFormElements();
    preventHorizontalScroll();
  }

  // تطبيق الإصلاحات عند تحميل الصفحة
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyAllFixes);
  } else {
    applyAllFixes();
  }

  // إعادة تطبيق عند تغيير الحجم
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (window.innerWidth <= 768) {
        applyAllFixes();
      }
    }, 250);
  });

  // مراقبة التغييرات في DOM
  const observer = new MutationObserver(() => {
    if (window.innerWidth <= 768) {
      hideSidebars();
      fixContentWidth();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // إضافة كلاس للـ body
  document.body.classList.add('mobile-optimized');

  // تسجيل النجاح
  console.log('تم تطبيق إصلاحات الموبايل بنجاح!');
  console.log('عرض الجسم:', document.body.scrollWidth);
  console.log('عرض النافذة:', window.innerWidth);

})();
