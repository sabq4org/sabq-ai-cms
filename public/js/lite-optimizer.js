/**
 * نظام تحسينات النسخة الخفيفة التلقائي
 * Automatic Lite Layout Optimization System
 */

(function() {
  'use strict';

  // التحقق من أن المتصفح يدعم الميزات المطلوبة
  if (typeof window === 'undefined' || !document.documentElement.style.setProperty) {
    return;
  }

  // إعدادات النظام
  const config = {
    mobileBreakpoint: 768,
    smallMobileBreakpoint: 375,
    enableAutoDetection: true,
    enablePerformanceMode: true,
    enableAccessibility: true,
    debugMode: false
  };

  // كلاسات CSS للتطبيق التلقائي
  const liteClasses = {
    containers: ['max-w-6xl', 'max-w-7xl', 'max-w-5xl', 'max-w-4xl', 'container'],
    cards: ['bg-white', 'card', 'news-card', 'article-card'],
    grids: ['grid', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4'],
    sections: ['section', 'main', 'article'],
    images: ['img', 'featured-image', 'article-image']
  };

  // المتغيرات العامة
  let isLiteMode = false;
  let resizeTimeout = null;
  let observer = null;

  /**
   * فحص ما إذا كان الجهاز موبايل
   */
  function isMobileDevice() {
    return window.innerWidth <= config.mobileBreakpoint;
  }

  /**
   * فحص ما إذا كان الجهاز صغير جداً
   */
  function isSmallMobile() {
    return window.innerWidth <= config.smallMobileBreakpoint;
  }

  /**
   * تسجيل رسائل التطوير
   */
  function log(message, ...args) {
    if (config.debugMode) {
      console.log(`[LiteOptimizer] ${message}`, ...args);
    }
  }

  /**
   * إضافة ستايلات CSS مباشرة للصفحة
   */
  function injectLiteStyles() {
    const existingStyle = document.getElementById('lite-auto-styles');
    if (existingStyle) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'lite-auto-styles';
    style.textContent = `
      /* تحسينات تلقائية للنسخة الخفيفة */
      @media (max-width: ${config.mobileBreakpoint}px) {
        .lite-auto-optimized {
          max-width: 100% !important;
          width: 100% !important;
        }

        .lite-auto-full-width {
          margin-left: 0 !important;
          margin-right: 0 !important;
          padding-left: 0.75rem !important;
          padding-right: 0.75rem !important;
        }

        .lite-auto-container {
          padding-left: 0.75rem !important;
          padding-right: 0.75rem !important;
          max-width: 100% !important;
        }

        .lite-auto-grid {
          grid-template-columns: 1fr !important;
          gap: 0.75rem !important;
        }

        .lite-auto-card {
          border-radius: 12px !important;
          margin: 0.5rem 0 !important;
        }

        .lite-auto-image {
          width: 100% !important;
          height: auto !important;
          border-radius: 8px !important;
        }

        .lite-auto-text {
          line-height: 1.6 !important;
          margin-bottom: 0.75rem !important;
        }

        /* إضافات للشاشات الصغيرة جداً */
        @media (max-width: ${config.smallMobileBreakpoint}px) {
          .lite-auto-container {
            padding-left: 0.5rem !important;
            padding-right: 0.5rem !important;
          }

          .lite-auto-card {
            padding: 0.75rem !important;
          }
        }
      }

      /* تحسينات الأداء */
      .lite-auto-optimized * {
        transition-duration: 0.15s !important;
      }

      .lite-auto-optimized .backdrop-blur {
        backdrop-filter: none !important;
      }

      .lite-auto-optimized .shadow-lg {
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
      }
    `;

    document.head.appendChild(style);
    log('تم حقن ستايلات النسخة الخفيفة');
  }

  /**
   * تطبيق التحسينات على عنصر معين
   */
  function optimizeElement(element) {
    if (!element || element.hasAttribute('data-lite-optimized')) {
      return;
    }

    const tagName = element.tagName.toLowerCase();
    const className = element.className;

    // تحسين الحاويات
    if (liteClasses.containers.some(cls => className.includes(cls))) {
      element.classList.add('lite-auto-optimized', 'lite-auto-container');
      log('تم تحسين حاوية:', element);
    }

    // تحسين البطاقات
    if (liteClasses.cards.some(cls => className.includes(cls))) {
      element.classList.add('lite-auto-card');
      log('تم تحسين بطاقة:', element);
    }

    // تحسين الشبكة
    if (liteClasses.grids.some(cls => className.includes(cls))) {
      element.classList.add('lite-auto-grid');
      log('تم تحسين شبكة:', element);
    }

    // تحسين الصور
    if (tagName === 'img') {
      element.classList.add('lite-auto-image');
      log('تم تحسين صورة:', element);
    }

    // تحسين النصوص
    if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
      element.classList.add('lite-auto-text');
    }

    // تحسين الأقسام
    if (liteClasses.sections.includes(tagName)) {
      element.classList.add('lite-auto-optimized', 'lite-auto-full-width');
    }

    element.setAttribute('data-lite-optimized', 'true');
  }

  /**
   * إزالة التحسينات من عنصر
   */
  function unoptimizeElement(element) {
    if (!element || !element.hasAttribute('data-lite-optimized')) {
      return;
    }

    const classesToRemove = [
      'lite-auto-optimized',
      'lite-auto-container', 
      'lite-auto-card',
      'lite-auto-grid',
      'lite-auto-image',
      'lite-auto-text',
      'lite-auto-full-width'
    ];

    classesToRemove.forEach(cls => {
      element.classList.remove(cls);
    });

    element.removeAttribute('data-lite-optimized');
    log('تم إلغاء تحسين عنصر:', element);
  }

  /**
   * فحص وتحسين جميع العناصر في الصفحة
   */
  function scanAndOptimize() {
    if (!isMobileDevice()) {
      return;
    }

    // البحث عن العناصر المرشحة للتحسين
    const selectors = [
      '.max-w-6xl', '.max-w-7xl', '.max-w-5xl', '.max-w-4xl', '.container',
      '.bg-white', '.card', '.news-card', '.article-card',
      '.grid', '.grid-cols-2', '.grid-cols-3', '.grid-cols-4',
      'section', 'main', 'article', 'img'
    ];

    const elements = document.querySelectorAll(selectors.join(', '));
    
    elements.forEach(element => {
      optimizeElement(element);
    });

    log(`تم فحص وتحسين ${elements.length} عنصر`);
  }

  /**
   * إلغاء جميع التحسينات
   */
  function removeAllOptimizations() {
    const optimizedElements = document.querySelectorAll('[data-lite-optimized="true"]');
    
    optimizedElements.forEach(element => {
      unoptimizeElement(element);
    });

    log(`تم إلغاء تحسين ${optimizedElements.length} عنصر`);
  }

  /**
   * تفعيل النسخة الخفيفة
   */
  function enableLiteMode() {
    if (isLiteMode) {
      return;
    }

    isLiteMode = true;
    document.documentElement.classList.add('lite-mode-active');
    
    // حقن الستايلات
    injectLiteStyles();
    
    // فحص وتحسين العناصر الموجودة
    scanAndOptimize();
    
    // مراقبة العناصر الجديدة
    if (config.enableAutoDetection && 'MutationObserver' in window) {
      observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              optimizeElement(node);
              // فحص العناصر الفرعية أيضاً
              const childElements = node.querySelectorAll && node.querySelectorAll('*');
              if (childElements) {
                childElements.forEach(child => optimizeElement(child));
              }
            }
          });
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }

    log('تم تفعيل النسخة الخفيفة');
  }

  /**
   * إلغاء تفعيل النسخة الخفيفة
   */
  function disableLiteMode() {
    if (!isLiteMode) {
      return;
    }

    isLiteMode = false;
    document.documentElement.classList.remove('lite-mode-active');
    
    // إلغاء جميع التحسينات
    removeAllOptimizations();
    
    // إيقاف المراقب
    if (observer) {
      observer.disconnect();
      observer = null;
    }

    log('تم إلغاء تفعيل النسخة الخفيفة');
  }

  /**
   * معالج تغيير حجم النافذة
   */
  function handleResize() {
    // تأخير التنفيذ لتحسين الأداء
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (isMobileDevice() && !isLiteMode) {
        enableLiteMode();
      } else if (!isMobileDevice() && isLiteMode) {
        disableLiteMode();
      }
    }, 100);
  }

  /**
   * معالج تحميل الصفحة
   */
  function handlePageLoad() {
    // تأخير قصير للسماح للعناصر بالتحميل
    setTimeout(() => {
      if (isMobileDevice()) {
        enableLiteMode();
      }
    }, 100);
  }

  /**
   * تهيئة النظام
   */
  function init() {
    log('بدء تهيئة نظام تحسينات النسخة الخفيفة');

    // معالج تحميل الصفحة
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', handlePageLoad);
    } else {
      handlePageLoad();
    }

    // معالج تغيير حجم النافذة
    window.addEventListener('resize', handleResize, { passive: true });

    // كشف تغيير الاتجاه
    if ('screen' in window && 'orientation' in screen) {
      screen.orientation.addEventListener('change', handleResize);
    }

    log('تم تهيئة نظام تحسينات النسخة الخفيفة');
  }

  // تصدير API عام
  window.LiteOptimizer = {
    enable: enableLiteMode,
    disable: disableLiteMode,
    scan: scanAndOptimize,
    isActive: () => isLiteMode,
    isMobile: isMobileDevice,
    config: config
  };

  // بدء التشغيل التلقائي
  init();

})();
