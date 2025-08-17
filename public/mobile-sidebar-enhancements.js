// تحسينات تفاعلية للقوائم الجانبية في الجوال
// Mobile Sidebar Interactive Enhancements

(function() {
  'use strict';

  // انتظار تحميل DOM كاملاً
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileSidebarEnhancements);
  } else {
    initMobileSidebarEnhancements();
  }

  function initMobileSidebarEnhancements() {
    // ===== تحسينات اللمس للأجهزة المحمولة =====
    
    // إضافة مؤثرات اللمس
    addTouchEffects();
    
    // تحسين التمرير
    optimizeScrolling();
    
    // إضافة اختصارات لوحة المفاتيح
    addKeyboardShortcuts();
    
    // تحسين الإمكانية الوصول
    enhanceAccessibility();
    
    // إضافة تأثيرات التحويم المحسنة
    addEnhancedHoverEffects();
    
    // تحسين الأداء
    optimizePerformance();
  }

  // ===== مؤثرات اللمس =====
  function addTouchEffects() {
    let touchStartTime = 0;
    let touchElement = null;

    // إضافة مستمعات الأحداث لجميع عناصر القائمة
    document.addEventListener('touchstart', function(e) {
      const navItem = e.target.closest('.mobile-nav-item, .sidebar-item');
      if (navItem) {
        touchStartTime = Date.now();
        touchElement = navItem;
        
        // إضافة تأثير اللمس
        navItem.style.transform = 'scale(0.98)';
        navItem.style.transition = 'transform 0.1s ease';
        
        // إضافة تأثير النبضة
        addRippleEffect(navItem, e);
      }
    }, { passive: true });

    document.addEventListener('touchend', function(e) {
      if (touchElement) {
        const touchDuration = Date.now() - touchStartTime;
        
        // إعادة العنصر لحالته الطبيعية
        setTimeout(() => {
          if (touchElement) {
            touchElement.style.transform = '';
            touchElement.style.transition = '';
          }
        }, 150);
        
        // إذا كان اللمس سريعاً، أضف تأثير إضافي
        if (touchDuration < 200) {
          touchElement.classList.add('quick-tap');
          setTimeout(() => {
            if (touchElement) {
              touchElement.classList.remove('quick-tap');
            }
          }, 300);
        }
        
        touchElement = null;
        touchStartTime = 0;
      }
    }, { passive: true });

    // إلغاء التأثيرات عند إلغاء اللمس
    document.addEventListener('touchcancel', function(e) {
      if (touchElement) {
        touchElement.style.transform = '';
        touchElement.style.transition = '';
        touchElement = null;
        touchStartTime = 0;
      }
    }, { passive: true });
  }

  // ===== تأثير النبضة عند اللمس =====
  function addRippleEffect(element, event) {
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.touches[0].clientX - rect.left - size / 2;
    const y = event.touches[0].clientY - rect.top - size / 2;

    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(59, 130, 246, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.4s ease-out;
      pointer-events: none;
      z-index: 1;
    `;

    // التأكد من أن العنصر له position relative
    if (getComputedStyle(element).position === 'static') {
      element.style.position = 'relative';
    }
    
    element.style.overflow = 'hidden';
    element.appendChild(ripple);

    // إزالة التأثير بعد انتهائه
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 400);
  }

  // ===== تحسين التمرير =====
  function optimizeScrolling() {
    const sidebars = document.querySelectorAll('.mobile-sidebar, .sidebar-mobile');
    
    sidebars.forEach(sidebar => {
      let isScrolling = false;
      let scrollTimeout;

      sidebar.addEventListener('scroll', function() {
        // إضافة كلاس للتحكم في التأثيرات أثناء التمرير
        if (!isScrolling) {
          sidebar.classList.add('scrolling');
          isScrolling = true;
        }

        // إزالة كلاس التمرير بعد توقف التمرير
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          sidebar.classList.remove('scrolling');
          isScrolling = false;
        }, 150);
      }, { passive: true });

      // تحسين momentum scrolling لـ iOS
      sidebar.style.webkitOverflowScrolling = 'touch';
    });
  }

  // ===== اختصارات لوحة المفاتيح =====
  function addKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
      // ESC لإغلاق القائمة المفتوحة
      if (e.key === 'Escape') {
        const openSidebars = document.querySelectorAll('.mobile-sidebar:not([hidden]), .sidebar-mobile:not([hidden])');
        openSidebars.forEach(sidebar => {
          const closeButton = sidebar.querySelector('button[aria-label*="إغلاق"], button[aria-label*="close"]');
          if (closeButton) {
            closeButton.click();
          }
        });
      }

      // التنقل بالأسهم داخل القائمة
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const focusedElement = document.activeElement;
        const navItem = focusedElement.closest('.mobile-nav-item, .sidebar-item');
        
        if (navItem) {
          e.preventDefault();
          const allItems = Array.from(document.querySelectorAll('.mobile-nav-item, .sidebar-item'));
          const currentIndex = allItems.indexOf(navItem);
          
          let nextIndex;
          if (e.key === 'ArrowDown') {
            nextIndex = (currentIndex + 1) % allItems.length;
          } else {
            nextIndex = (currentIndex - 1 + allItems.length) % allItems.length;
          }
          
          allItems[nextIndex].focus();
        }
      }
    });
  }

  // ===== تحسين الإمكانية الوصول =====
  function enhanceAccessibility() {
    // إضافة خصائص ARIA للعناصر التفاعلية
    const navItems = document.querySelectorAll('.mobile-nav-item, .sidebar-item');
    
    navItems.forEach((item, index) => {
      // جعل العناصر قابلة للتركيز
      if (!item.hasAttribute('tabindex')) {
        item.setAttribute('tabindex', '0');
      }
      
      // إضافة معرف فريد إذا لم يكن موجوداً
      if (!item.id) {
        item.id = `mobile-nav-item-${index}`;
      }
      
      // إضافة وصف مناسب
      if (!item.getAttribute('aria-label') && !item.getAttribute('aria-labelledby')) {
        const textContent = item.textContent.trim();
        if (textContent) {
          item.setAttribute('aria-label', textContent);
        }
      }
      
      // إضافة دور مناسب
      if (!item.getAttribute('role')) {
        if (item.tagName === 'A') {
          item.setAttribute('role', 'menuitem');
        } else if (item.tagName === 'BUTTON') {
          item.setAttribute('role', 'menuitem');
        }
      }
    });

    // إضافة دعم Enter و Space للعناصر القابلة للتركيز
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        const navItem = e.target.closest('.mobile-nav-item, .sidebar-item');
        if (navItem && navItem.tagName !== 'A' && navItem.tagName !== 'BUTTON') {
          e.preventDefault();
          navItem.click();
        }
      }
    });
  }

  // ===== تأثيرات التحويم المحسنة =====
  function addEnhancedHoverEffects() {
    const style = document.createElement('style');
    style.textContent = `
      @media (hover: hover) {
        .mobile-nav-item:hover .icon,
        .sidebar-item:hover .icon {
          animation: iconBounce 0.3s ease;
        }
        
        .mobile-nav-item:hover .text,
        .sidebar-item:hover .text {
          animation: textSlide 0.3s ease;
        }
      }
      
      @keyframes iconBounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-2px); }
      }
      
      @keyframes textSlide {
        0% { transform: translateX(0); }
        50% { transform: translateX(2px); }
        100% { transform: translateX(0); }
      }
      
      @keyframes ripple {
        0% { transform: scale(0); opacity: 1; }
        100% { transform: scale(1); opacity: 0; }
      }
      
      .quick-tap {
        animation: quickTapPulse 0.3s ease;
      }
      
      @keyframes quickTapPulse {
        0% { background-color: rgba(59, 130, 246, 0); }
        50% { background-color: rgba(59, 130, 246, 0.1); }
        100% { background-color: rgba(59, 130, 246, 0); }
      }
      
      /* تحسينات الوضع الليلي */
      .dark .quick-tap {
        animation: quickTapPulseDark 0.3s ease;
      }
      
      @keyframes quickTapPulseDark {
        0% { background-color: rgba(96, 165, 250, 0); }
        50% { background-color: rgba(96, 165, 250, 0.2); }
        100% { background-color: rgba(96, 165, 250, 0); }
      }
      
      /* تحسينات لمن يفضل تقليل الحركة */
      @media (prefers-reduced-motion: reduce) {
        .mobile-nav-item,
        .sidebar-item {
          animation: none !important;
        }
        
        .mobile-nav-item *,
        .sidebar-item * {
          animation: none !important;
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  // ===== تحسين الأداء =====
  function optimizePerformance() {
    // استخدام Intersection Observer لتحسين التفاعلات
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-viewport');
          } else {
            entry.target.classList.remove('in-viewport');
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '50px'
      });

      // مراقبة جميع عناصر القائمة
      document.querySelectorAll('.mobile-nav-item, .sidebar-item').forEach(item => {
        observer.observe(item);
      });
    }

    // تحسين الذاكرة بتنظيف المستمعات عند إزالة العناصر
    const cleanupObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.removedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // تنظيف مستمعات الأحداث
            const navItems = node.querySelectorAll?.('.mobile-nav-item, .sidebar-item') || [];
            navItems.forEach(item => {
              // إزالة مراجع الأحداث المخزنة
              item.removeEventListener?.('touchstart', null);
              item.removeEventListener?.('touchend', null);
              item.removeEventListener?.('touchcancel', null);
            });
          }
        });
      });
    });

    cleanupObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // ===== تصدير وظائف مساعدة =====
  window.MobileSidebarEnhancements = {
    addRippleEffect: addRippleEffect,
    optimizeScrolling: optimizeScrolling,
    addTouchEffects: addTouchEffects
  };

  console.log('🎯 Mobile Sidebar Enhancements loaded successfully');
})();
