/* حلول JavaScript للنسخة المحمولة - موقع sabq.io */
/* Mobile Interactive Solutions for sabq.io Admin Panel */

// ===== 1. كشف الجهاز المحمول =====
const MobileDetector = {
  isMobile: () => {
    return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },
  
  isTablet: () => {
    return window.innerWidth <= 1024 && window.innerWidth > 768;
  },
  
  isTouch: () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }
};

// ===== 2. إدارة القائمة العلوية المتحركة =====
class MobileTopNavigation {
  constructor() {
    this.init();
  }
  
  init() {
    if (!MobileDetector.isMobile()) return;
    
    this.setupScrollableNavigation();
    this.addTouchSupport();
    this.addScrollIndicators();
  }
  
  setupScrollableNavigation() {
    const navSelectors = [
      '.top-navigation',
      '.header-nav',
      '.admin-header',
      '.flex.items-center.gap-3',
      '.flex.items-center.space-x-4'
    ];
    
    navSelectors.forEach(selector => {
      const nav = document.querySelector(selector);
      if (nav) {
        this.makeScrollable(nav);
      }
    });
  }
  
  makeScrollable(nav) {
    // إضافة خصائص التمرير
    nav.style.overflowX = 'auto';
    nav.style.overflowY = 'hidden';
    nav.style.webkitOverflowScrolling = 'touch';
    nav.style.scrollBehavior = 'smooth';
    nav.style.flexWrap = 'nowrap';
    
    // إخفاء شريط التمرير
    nav.style.scrollbarWidth = 'none';
    nav.style.msOverflowStyle = 'none';
    
    // إضافة CSS لإخفاء شريط التمرير في WebKit
    const style = document.createElement('style');
    style.textContent = `
      ${nav.className ? '.' + nav.className.split(' ').join('.') : nav.tagName.toLowerCase()}::-webkit-scrollbar {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  addTouchSupport() {
    const navs = document.querySelectorAll('.top-navigation, .header-nav, .admin-header');
    
    navs.forEach(nav => {
      let isScrolling = false;
      let startX = 0;
      let scrollLeft = 0;
      
      // بداية اللمس
      nav.addEventListener('touchstart', (e) => {
        isScrolling = true;
        startX = e.touches[0].pageX - nav.offsetLeft;
        scrollLeft = nav.scrollLeft;
        nav.style.cursor = 'grabbing';
      }, { passive: true });
      
      // أثناء اللمس
      nav.addEventListener('touchmove', (e) => {
        if (!isScrolling) return;
        const x = e.touches[0].pageX - nav.offsetLeft;
        const walk = (x - startX) * 2;
        nav.scrollLeft = scrollLeft - walk;
      }, { passive: true });
      
      // نهاية اللمس
      nav.addEventListener('touchend', () => {
        isScrolling = false;
        nav.style.cursor = 'grab';
      }, { passive: true });
    });
  }
  
  addScrollIndicators() {
    const navs = document.querySelectorAll('.top-navigation, .header-nav, .admin-header');
    
    navs.forEach(nav => {
      // إضافة مؤشر التمرير
      const indicator = document.createElement('div');
      indicator.className = 'scroll-indicator';
      indicator.innerHTML = '⟵ مرر للمزيد';
      indicator.style.cssText = `
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        background: linear-gradient(to left, rgba(255,255,255,0.9), transparent);
        padding: 5px 10px;
        font-size: 10px;
        color: #666;
        pointer-events: none;
        opacity: 0.8;
        z-index: 10;
      `;
      
      nav.style.position = 'relative';
      nav.appendChild(indicator);
      
      // إخفاء المؤشر عند الوصول للنهاية
      nav.addEventListener('scroll', () => {
        const isAtEnd = nav.scrollLeft >= (nav.scrollWidth - nav.clientWidth - 10);
        indicator.style.opacity = isAtEnd ? '0' : '0.8';
      });
    });
  }
}

// ===== 3. إدارة الجداول المتجاوبة =====
class ResponsiveTable {
  constructor() {
    this.init();
  }
  
  init() {
    if (!MobileDetector.isMobile()) return;
    
    this.setupResponsiveTables();
    this.createMobileCards();
  }
  
  setupResponsiveTables() {
    const tables = document.querySelectorAll('table');
    
    tables.forEach(table => {
      this.wrapTable(table);
      this.optimizeTableCells(table);
    });
  }
  
  wrapTable(table) {
    if (table.parentElement && table.parentElement.classList.contains('table-wrapper')) return;
    
    const wrapper = document.createElement('div');
    wrapper.className = 'table-wrapper';
    wrapper.style.cssText = `
      width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      margin: 10px 0;
    `;
    
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  }
  
  optimizeTableCells(table) {
    // تحسين رؤوس الجدول
    const headers = table.querySelectorAll('th');
    headers.forEach(th => {
      th.style.whiteSpace = 'nowrap';
      th.style.padding = '12px 8px';
      th.style.fontSize = '12px';
      th.style.fontWeight = '600';
      th.style.position = 'sticky';
      th.style.top = '0';
      th.style.zIndex = '10';
      th.style.background = '#f9fafb';
      th.style.borderBottom = '2px solid #e5e7eb';
    });
    
    // تحسين خلايا الجدول
    const cells = table.querySelectorAll('td');
    cells.forEach(td => {
      td.style.padding = '10px 8px';
      td.style.fontSize = '13px';
      td.style.verticalAlign = 'middle';
      
      // تحسين النصوص الطويلة
      const text = (td.textContent || '').trim();
      if (text.length > 50) {
        td.style.maxWidth = '200px';
        td.style.overflow = 'hidden';
        td.style.textOverflow = 'ellipsis';
        td.style.whiteSpace = 'nowrap';
        
        // إضافة tooltip للنص الكامل
        td.title = text;
      }
    });
  }
  
  createMobileCards() {
    if (window.innerWidth > 480) return;
    
    const tables = document.querySelectorAll('table');
    
    tables.forEach(table => {
      const cardsContainer = this.convertTableToCards(table);
      table.style.display = 'none';
      table.parentNode.insertBefore(cardsContainer, table.nextSibling);
    });
  }
  
  convertTableToCards(table) {
    const container = document.createElement('div');
    container.className = 'mobile-cards-container';
    
    const headers = Array.from(table.querySelectorAll('th')).map(th => (th.textContent || '').trim());
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach((row, index) => {
      const card = this.createCard(row, headers, index + 1);
      container.appendChild(card);
    });
    
    return container;
  }
  
  createCard(row, headers, index) {
    const card = document.createElement('div');
    card.className = 'mobile-card';
    card.style.cssText = `
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    `;
    
    const cells = row.querySelectorAll('td');
    
    // رأس البطاقة
    const header = document.createElement('div');
    header.className = 'mobile-card-header';
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #f3f4f6;
    `;
    
    const title = document.createElement('div');
    title.className = 'mobile-card-title';
    const titleCell = cells[1] ? (cells[1].textContent || '') : 'عنصر';
    title.textContent = `#${index} - ${titleCell.substring(0, 30)}${titleCell.length > 30 ? '...' : ''}`;
    title.style.cssText = `
      font-weight: 600;
      font-size: 14px;
      color: #1f2937;
      flex: 1;
    `;
    
    header.appendChild(title);
    card.appendChild(header);
    
    // محتوى البطاقة
    const body = document.createElement('div');
    body.className = 'mobile-card-body';
    body.style.cssText = `
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 12px;
    `;
    
    cells.forEach((cell, cellIndex) => {
      if (cellIndex === 0 || cellIndex === cells.length - 1) return; // تجاهل الرقم والإجراءات
      
      const field = document.createElement('div');
      field.className = 'mobile-card-field';
      field.style.cssText = `
        display: flex;
        flex-direction: column;
      `;
      
      const label = document.createElement('div');
      label.className = 'mobile-card-label';
      label.textContent = headers[cellIndex] || `حقل ${cellIndex}`;
      label.style.cssText = `
        font-size: 11px;
        color: #6b7280;
        margin-bottom: 2px;
      `;
      
      const value = document.createElement('div');
      value.className = 'mobile-card-value';
      value.textContent = (cell.textContent || '').trim();
      value.style.cssText = `
        font-size: 13px;
        color: #1f2937;
        font-weight: 500;
      `;
      
      field.appendChild(label);
      field.appendChild(value);
      body.appendChild(field);
    });
    
    card.appendChild(body);
    
    // إجراءات البطاقة
    const lastCell = cells[cells.length - 1];
    if (lastCell) {
      const actions = document.createElement('div');
      actions.className = 'mobile-card-actions';
      actions.style.cssText = `
        display: flex;
        gap: 8px;
        justify-content: flex-end;
      `;
      
      const buttons = lastCell.querySelectorAll('button, a');
      buttons.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        newBtn.style.cssText = `
          padding: 6px 12px;
          font-size: 12px;
          border-radius: 6px;
          min-height: 32px;
        `;
        actions.appendChild(newBtn);
      });
      
      card.appendChild(actions);
    }
    
    return card;
  }
}

// ===== 4. إدارة القائمة الجانبية المحمولة =====
class MobileSidebar {
  constructor() {
    this.init();
  }
  
  init() {
    if (!MobileDetector.isMobile()) return;
    
    this.createMobileMenu();
    this.setupSidebarToggle();
  }
  
  createMobileMenu() {
    const sidebar = document.querySelector('.sidebar, .side-navigation');
    if (!sidebar) return;
    
    // إنشاء زر القائمة
    const menuToggle = document.createElement('button');
    menuToggle.className = 'mobile-menu-toggle';
    menuToggle.innerHTML = `
      <span></span>
      <span></span>
      <span></span>
    `;
    menuToggle.style.cssText = `
      display: block;
      width: 44px;
      height: 44px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      position: fixed;
      top: 10px;
      left: 10px;
      z-index: 1001;
    `;
    
    // إضافة أنماط الخطوط
    const spans = menuToggle.querySelectorAll('span');
    spans.forEach(span => {
      span.style.cssText = `
        display: block;
        width: 20px;
        height: 2px;
        background: #374151;
        margin: 4px 0;
        transition: 0.3s;
      `;
    });
    
    document.body.appendChild(menuToggle);
    
    // إنشاء الخلفية الشفافة
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.5);
      z-index: 999;
      display: none;
    `;
    
    document.body.appendChild(overlay);
    
    // تحديث أنماط القائمة الجانبية
    sidebar.style.cssText = `
      position: fixed;
      left: -280px;
      top: 0;
      width: 280px;
      height: 100vh;
      background: white;
      z-index: 1000;
      transition: left 0.3s ease;
      box-shadow: 2px 0 10px rgba(0,0,0,0.1);
    `;
  }
  
  setupSidebarToggle() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar, .side-navigation');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (!menuToggle || !sidebar || !overlay) return;
    
    // فتح/إغلاق القائمة
    menuToggle.addEventListener('click', () => {
      const isActive = sidebar.classList.contains('active');
      
      if (isActive) {
        this.closeSidebar();
      } else {
        this.openSidebar();
      }
    });
    
    // إغلاق عند النقر على الخلفية
    overlay.addEventListener('click', () => {
      this.closeSidebar();
    });
    
    // إغلاق عند الضغط على Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeSidebar();
      }
    });
  }
  
  openSidebar() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar, .side-navigation');
    const overlay = document.querySelector('.sidebar-overlay');
    
    sidebar.classList.add('active');
    sidebar.style.left = '0';
    overlay.classList.add('active');
    overlay.style.display = 'block';
    menuToggle.classList.add('active');
    
    // تحريك خطوط الهامبرغر
    const spans = menuToggle.querySelectorAll('span');
    spans[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
  }
  
  closeSidebar() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar, .side-navigation');
    const overlay = document.querySelector('.sidebar-overlay');
    
    sidebar.classList.remove('active');
    sidebar.style.left = '-280px';
    overlay.classList.remove('active');
    overlay.style.display = 'none';
    menuToggle.classList.remove('active');
    
    // إعادة تعيين خطوط الهامبرغر
    const spans = menuToggle.querySelectorAll('span');
    spans[0].style.transform = 'none';
    spans[1].style.opacity = '1';
    spans[2].style.transform = 'none';
  }
}

// ===== 5. تحسينات الأداء والتفاعل =====
class MobilePerformance {
  constructor() {
    this.init();
  }
  
  init() {
    if (!MobileDetector.isMobile()) return;
    
    this.optimizeTouch();
    this.improveScrolling();
    this.addHapticFeedback();
  }
  
  optimizeTouch() {
    // تحسين جميع العناصر التفاعلية
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
    
    interactiveElements.forEach(element => {
      element.style.minHeight = '44px';
      element.style.touchAction = 'manipulation';
      element.style.webkitTapHighlightColor = 'rgba(0,0,0,0.1)';
      
      // منع التكبير في iOS للحقول النصية
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.style.fontSize = '16px';
      }
    });
  }
  
  improveScrolling() {
    // تحسين التمرير لجميع العناصر القابلة للتمرير
    const scrollableElements = document.querySelectorAll('.scrollable, .table-wrapper, .sidebar');
    
    scrollableElements.forEach(element => {
      element.style.webkitOverflowScrolling = 'touch';
      element.style.scrollBehavior = 'smooth';
    });
  }
  
  addHapticFeedback() {
    // إضافة ردود فعل لمسية للأزرار المهمة
    const importantButtons = document.querySelectorAll('.btn-primary, .btn-danger, .submit-btn');
    
    importantButtons.forEach(button => {
      button.addEventListener('touchstart', () => {
        if (navigator.vibrate) {
          navigator.vibrate(10); // اهتزاز خفيف
        }
      }, { passive: true });
    });
  }
}

// ===== 6. مراقب تغيير الاتجاه =====
class OrientationManager {
  constructor() {
    this.init();
  }
  
  init() {
    this.handleOrientationChange();
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.handleOrientationChange();
      }, 100);
    });
    
    window.addEventListener('resize', () => {
      this.handleOrientationChange();
    });
  }
  
  handleOrientationChange() {
    const isLandscape = window.innerWidth > window.innerHeight;
    const body = document.body;
    
    if (isLandscape) {
      body.classList.add('landscape');
      body.classList.remove('portrait');
    } else {
      body.classList.add('portrait');
      body.classList.remove('landscape');
    }
    
    // إعادة تهيئة الجداول عند تغيير الاتجاه
    if (MobileDetector.isMobile()) {
      setTimeout(() => {
        new ResponsiveTable();
      }, 200);
    }
  }
}

// ===== 7. تهيئة النظام =====
class MobileSystem {
  constructor() {
    this.init();
  }
  
  init() {
    // انتظار تحميل DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.initializeComponents();
      });
    } else {
      this.initializeComponents();
    }
  }
  
  initializeComponents() {
    if (!MobileDetector.isMobile()) {
      console.log('Desktop detected - mobile optimizations skipped');
      return;
    }
    
    console.log('Mobile detected - initializing mobile optimizations');
    
    // تهيئة جميع المكونات
    new MobileTopNavigation();
    new ResponsiveTable();
    new MobileSidebar();
    new MobilePerformance();
    new OrientationManager();
    
    // إضافة فئة CSS للجسم
    document.body.classList.add('mobile-optimized');
    
    console.log('Mobile optimizations initialized successfully');
  }
}

// تشغيل النظام
try {
  new MobileSystem();
} catch (e) {
  console.warn('MobileSystem init failed:', e);
}


