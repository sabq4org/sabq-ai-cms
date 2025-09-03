/**
 * 🔍 مراقب الوضع الليلي
 * يراقب التغييرات في DOM ويطبق الوضع الليلي تلقائياً
 */

export class DarkModeObserver {
  private observer: MutationObserver | null = null;
  private isActive: boolean = false;
  private darkModeClass: string = 'dark';

  constructor() {
    this.init();
  }

  private init(): void {
    // التحقق من وجود window
    if (typeof window === 'undefined') return;

    // إنشاء MutationObserver
    this.observer = new MutationObserver((mutations) => {
      this.handleMutations(mutations);
    });

    // بدء المراقبة عند تحميل الصفحة
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.start());
    } else {
      this.start();
    }

    // مراقبة تغييرات الثيم
    this.observeThemeChanges();
  }

  private start(): void {
    if (!this.observer || this.isActive) return;

    // بدء مراقبة التغييرات
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    this.isActive = true;

    // تطبيق الوضع الليلي الحالي
    this.applyCurrentTheme();
  }

  private stop(): void {
    if (this.observer && this.isActive) {
      this.observer.disconnect();
      this.isActive = false;
    }
  }

  private handleMutations(mutations: MutationRecord[]): void {
    // تأخير قليل لتجميع التغييرات
    requestAnimationFrame(() => {
      const isDark = this.isDarkMode();
      if (isDark) {
        this.applyDarkModeToNewElements();
      }
    });
  }

  private isDarkMode(): boolean {
    return document.documentElement.classList.contains(this.darkModeClass) ||
           document.body.classList.contains(this.darkModeClass);
  }

  private applyCurrentTheme(): void {
    if (this.isDarkMode()) {
      this.applyDarkModeToAllElements();
    }
  }

  private applyDarkModeToAllElements(): void {
    // قائمة العناصر التي تحتاج تطبيق dark class
    const selectors = [
      'main',
      'header',
      'nav',
      'footer',
      'aside',
      'section',
      'article',
      'div[class*="container"]',
      'div[class*="wrapper"]',
      'div[class*="layout"]',
      'div[class*="page"]',
      'div[class*="content"]',
      'div[class*="panel"]',
      'div[class*="dashboard"]',
      'div[class*="admin"]',
      'div[class*="block"]',
      'div[class*="card"]'
    ];

    // تطبيق dark class على جميع العناصر
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (!element.classList.contains(this.darkModeClass)) {
          element.classList.add(this.darkModeClass);
        }
      });
    });

    // إصلاح العناصر ذات inline styles
    this.fixInlineStyles();
  }

  private applyDarkModeToNewElements(): void {
    // البحث عن العناصر الجديدة التي لا تحتوي على dark class
    const newElements = document.querySelectorAll(
      'main:not(.dark), ' +
      'header:not(.dark), ' +
      'nav:not(.dark), ' +
      'footer:not(.dark), ' +
      'section:not(.dark), ' +
      'article:not(.dark), ' +
      'div[class*="container"]:not(.dark), ' +
      'div[class*="wrapper"]:not(.dark), ' +
      'div[class*="block"]:not(.dark), ' +
      'div[class*="card"]:not(.dark)'
    );

    newElements.forEach(element => {
      element.classList.add(this.darkModeClass);
    });

    // إصلاح inline styles للعناصر الجديدة
    this.fixInlineStyles();
  }

  private fixInlineStyles(): void {
    // إصلاح الخلفيات البيضاء
    const whiteBackgrounds = document.querySelectorAll(
      '[style*="background-color: white"]:not([data-dark-fixed]), ' +
      '[style*="background-color:#fff"]:not([data-dark-fixed]), ' +
      '[style*="background-color: #fff"]:not([data-dark-fixed]), ' +
      '[style*="background-color:#ffffff"]:not([data-dark-fixed]), ' +
      '[style*="background-color: #ffffff"]:not([data-dark-fixed]), ' +
      '[style*="background-color: rgb(255"]:not([data-dark-fixed]), ' +
      '[style*="background: white"]:not([data-dark-fixed]), ' +
      '[style*="background:#fff"]:not([data-dark-fixed]), ' +
      '[style*="background: #fff"]:not([data-dark-fixed]), ' +
      '[style*="background:#ffffff"]:not([data-dark-fixed]), ' +
      '[style*="background: #ffffff"]:not([data-dark-fixed]), ' +
      '[style*="background: rgb(255"]:not([data-dark-fixed])'
    );

    whiteBackgrounds.forEach(element => {
      if (element instanceof HTMLElement && this.isDarkMode()) {
        const currentStyle = element.getAttribute('style') || '';
        const updatedStyle = currentStyle
          .replace(/background(-color)?:\s*(white|#fff|#ffffff|rgb\(255[^)]+\))/gi, 'background$1: #1e293b');
        
        element.setAttribute('style', updatedStyle);
        element.setAttribute('data-dark-fixed', 'true');
      }
    });

    // إصلاح النصوص السوداء
    const blackTexts = document.querySelectorAll(
      '[style*="color: black"]:not([data-dark-fixed]), ' +
      '[style*="color:#000"]:not([data-dark-fixed]), ' +
      '[style*="color: #000"]:not([data-dark-fixed]), ' +
      '[style*="color:#000000"]:not([data-dark-fixed]), ' +
      '[style*="color: #000000"]:not([data-dark-fixed]), ' +
      '[style*="color: rgb(0"]:not([data-dark-fixed])'
    );

    blackTexts.forEach(element => {
      if (element instanceof HTMLElement && this.isDarkMode()) {
        const currentStyle = element.getAttribute('style') || '';
        const updatedStyle = currentStyle
          .replace(/color:\s*(black|#000|#000000|rgb\(0[^)]+\))/gi, 'color: #f1f5f9');
        
        element.setAttribute('style', updatedStyle);
        element.setAttribute('data-dark-fixed', 'true');
      }
    });
  }

  private observeThemeChanges(): void {
    // مراقبة تغييرات class على html و body
    const themeObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          this.applyCurrentTheme();
        }
      });
    });

    // مراقبة html
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // مراقبة body
    if (document.body) {
      themeObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['class']
      });
    }
  }

  // طرق عامة للتحكم
  public activate(): void {
    this.start();
  }

  public deactivate(): void {
    this.stop();
  }

  public forceApplyDarkMode(): void {
    document.documentElement.classList.add(this.darkModeClass);
    document.body.classList.add(this.darkModeClass);
    this.applyDarkModeToAllElements();
  }

  public forceRemoveDarkMode(): void {
    // إزالة dark class من جميع العناصر
    const darkElements = document.querySelectorAll(`.${this.darkModeClass}`);
    darkElements.forEach(element => {
      element.classList.remove(this.darkModeClass);
    });

    // إزالة data-dark-fixed attributes
    const fixedElements = document.querySelectorAll('[data-dark-fixed]');
    fixedElements.forEach(element => {
      element.removeAttribute('data-dark-fixed');
    });
  }
}

// إنشاء مثيل وحيد
let darkModeObserverInstance: DarkModeObserver | null = null;

export function getDarkModeObserver(): DarkModeObserver {
  if (!darkModeObserverInstance) {
    darkModeObserverInstance = new DarkModeObserver();
  }
  return darkModeObserverInstance;
}

// تفعيل المراقب تلقائياً
if (typeof window !== 'undefined') {
  getDarkModeObserver();
}
