/**
 * محسن التخطيط للموبايل
 * Mobile Layout Enhancer
 */

(function() {
  'use strict';

  console.log('بدء تطبيق محسن التخطيط للموبايل...');

  // 1. إزالة الفراغ العلوي
  function removeTopSpace() {
    // إزالة أي padding أو margin من العناصر العلوية
    const elements = [
      document.documentElement,
      document.body,
      document.getElementById('__next'),
      document.querySelector('.admin-mobile-container'),
      document.querySelector('main'),
      document.querySelector('.page-content')
    ];

    elements.forEach(el => {
      if (el) {
        el.style.marginTop = '0';
        el.style.paddingTop = '0';
      }
    });

    // التأكد من أن الهيدر يلتصق بالأعلى
    const header = document.querySelector('.admin-header');
    if (header) {
      header.style.top = '0';
      header.style.marginTop = '0';
      header.style.position = 'sticky';
    }
  }

  // 2. تمكين التمرير الأفقي لعناصر الهيدر
  function enableHeaderScroll() {
    const headerTools = document.querySelector('.header-tools');
    if (headerTools) {
      headerTools.style.overflowX = 'auto';
      headerTools.style.webkitOverflowScrolling = 'touch';
      headerTools.style.scrollBehavior = 'smooth';
      
      // إضافة momentum scrolling
      headerTools.addEventListener('touchstart', function() {
        this.style.scrollSnapType = 'x proximity';
      });
    }

    // تطبيق على جميع العناصر القابلة للتمرير
    const scrollableElements = document.querySelectorAll('.scrollable-horizontal, .filter-options');
    scrollableElements.forEach(el => {
      el.style.overflowX = 'auto';
      el.style.webkitOverflowScrolling = 'touch';
      el.style.scrollBehavior = 'smooth';
    });
  }

  // 3. إصلاح البطاقات المتداخلة
  function fixNestedCards() {
    // إزالة الجداول من صفحة الأخبار
    const newsTables = document.querySelectorAll('.mobile-news-page table, .news-list-container table');
    newsTables.forEach(table => {
      table.style.display = 'none';
    });

    // إزالة الحاويات الزائدة
    const newsCards = document.querySelectorAll('.news-card-mobile');
    newsCards.forEach(card => {
      // إزالة أي wrapper زائد
      if (card.parentElement && card.parentElement.tagName === 'TD') {
        const parent = card.parentElement.parentElement.parentElement; // tr -> tbody -> table
        parent.parentNode.insertBefore(card, parent);
        parent.remove();
      }
    });
  }

  // 4. إصلاح الفراغات الجانبية
  function fixSideSpaces() {
    const newsPage = document.querySelector('.mobile-news-page');
    if (newsPage) {
      newsPage.style.width = '100vw';
      newsPage.style.margin = '0';
      newsPage.style.padding = '0';
      newsPage.style.position = 'relative';
      newsPage.style.left = '0';
      newsPage.style.right = '0';
    }

    const listContainer = document.querySelector('.news-list-container');
    if (listContainer) {
      listContainer.style.width = '100%';
      listContainer.style.padding = '0 16px 16px 16px';
      listContainer.style.boxSizing = 'border-box';
    }

    // إصلاح شريط البحث
    const searchBar = document.querySelector('.search-filter-bar');
    if (searchBar) {
      searchBar.style.width = '100%';
      searchBar.style.boxSizing = 'border-box';
    }
  }

  // 5. تحسين الأداء
  function improvePerformance() {
    // إضافة will-change للعناصر المتحركة
    const animatedElements = document.querySelectorAll('.news-card-mobile, .filter-options');
    animatedElements.forEach(el => {
      el.style.willChange = 'transform';
    });

    // تحسين اللمس
    const touchElements = document.querySelectorAll('button, a, .clickable, .news-card-mobile');
    touchElements.forEach(el => {
      el.style.touchAction = 'manipulation';
      el.style.webkitTapHighlightColor = 'transparent';
    });
  }

  // 6. إضافة مؤشرات التمرير
  function addScrollIndicators() {
    const scrollContainers = document.querySelectorAll('.header-tools, .filter-options');
    scrollContainers.forEach(container => {
      // التحقق من إمكانية التمرير
      if (container.scrollWidth > container.clientWidth) {
        container.classList.add('has-scroll');
        
        // إضافة مؤشر بصري
        container.addEventListener('scroll', function() {
          const scrollLeft = this.scrollLeft;
          const scrollWidth = this.scrollWidth - this.clientWidth;
          
          if (scrollLeft > 10) {
            this.classList.add('scrolled-left');
          } else {
            this.classList.remove('scrolled-left');
          }
          
          if (scrollLeft < scrollWidth - 10) {
            this.classList.add('can-scroll-right');
          } else {
            this.classList.remove('can-scroll-right');
          }
        });
        
        // تطبيق الحالة الأولية
        container.dispatchEvent(new Event('scroll'));
      }
    });
  }

  // تطبيق جميع الإصلاحات
  function applyAllFixes() {
    removeTopSpace();
    enableHeaderScroll();
    fixNestedCards();
    fixSideSpaces();
    improvePerformance();
    addScrollIndicators();
  }

  // تطبيق عند التحميل
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyAllFixes);
  } else {
    applyAllFixes();
  }

  // إعادة تطبيق عند تغيير المحتوى
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length > 0) {
        setTimeout(applyAllFixes, 100);
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // إضافة أنماط للمؤشرات
  const style = document.createElement('style');
  style.textContent = `
    .has-scroll {
      position: relative;
    }
    
    .has-scroll.can-scroll-right::after {
      content: '';
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 20px;
      background: linear-gradient(to left, hsl(var(--bg)), transparent);
      pointer-events: none;
      z-index: 1;
    }
    
    .has-scroll.scrolled-left::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 20px;
      background: linear-gradient(to right, hsl(var(--bg)), transparent);
      pointer-events: none;
      z-index: 1;
    }
    
    /* تحسين التمرير */
    .scrollable-horizontal,
    .header-tools,
    .filter-options {
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
      scroll-snap-type: x proximity;
    }
    
    .scrollable-horizontal > *,
    .header-tools > *,
    .filter-options > * {
      scroll-snap-align: start;
    }
  `;
  document.head.appendChild(style);

  console.log('تم تطبيق محسن التخطيط بنجاح!');

})();
