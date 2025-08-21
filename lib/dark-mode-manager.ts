/**
 * 🌙 مدير الوضع الليلي الموحد
 * يضمن تطبيق الوضع الليلي على جميع العناصر
 */

export class DarkModeManager {
  private static instance: DarkModeManager;
  private isDarkMode: boolean = false;
  private observers: Array<(isDark: boolean) => void> = [];

  private constructor() {
    this.init();
  }

  static getInstance(): DarkModeManager {
    if (!DarkModeManager.instance) {
      DarkModeManager.instance = new DarkModeManager();
    }
    return DarkModeManager.instance;
  }

  private init(): void {
    // قراءة الإعداد المحفوظ
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (savedTheme === 'system' && systemPrefersDark)) {
      this.enableDarkMode();
    } else {
      this.disableDarkMode();
    }

    // مراقبة تغييرات تفضيل النظام
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'system') {
        if (e.matches) {
          this.enableDarkMode();
        } else {
          this.disableDarkMode();
        }
      }
    });
  }

  public enableDarkMode(): void {
    this.isDarkMode = true;
    
    // تطبيق dark class على جميع العناصر الرئيسية
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
    
    // تطبيق على جميع العناصر الرئيسية
    this.applyDarkModeToAllElements();
    
    // إخطار المراقبين
    this.notifyObservers();
  }

  public disableDarkMode(): void {
    this.isDarkMode = false;
    
    // إزالة dark class من جميع العناصر
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
    
    // إزالة الكلاس من جميع العناصر
    this.removeDarkModeFromAllElements();
    
    // إخطار المراقبين
    this.notifyObservers();
  }

  public toggleDarkMode(): void {
    if (this.isDarkMode) {
      this.disableDarkMode();
    } else {
      this.enableDarkMode();
    }
  }

  public isDark(): boolean {
    return this.isDarkMode;
  }

  public addObserver(callback: (isDark: boolean) => void): void {
    this.observers.push(callback);
  }

  public removeObserver(callback: (isDark: boolean) => void): void {
    this.observers = this.observers.filter(obs => obs !== callback);
  }

  private notifyObservers(): void {
    this.observers.forEach(callback => callback(this.isDarkMode));
  }

  private applyDarkModeToAllElements(): void {
    // تطبيق على جميع العناصر الرئيسية
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
      '[class*="bg-white"]',
      '[class*="bg-gray-50"]',
      '[class*="bg-gray-100"]'
    ];

    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        element.classList.add('dark-mode-element');
      });
    });

    // تطبيق أنماط مخصصة للعناصر التي تحتوي على inline styles
    this.fixInlineStyles();
  }

  private removeDarkModeFromAllElements(): void {
    const elements = document.querySelectorAll('.dark-mode-element');
    elements.forEach(element => {
      element.classList.remove('dark-mode-element');
    });
  }

  private fixInlineStyles(): void {
    // إصلاح العناصر التي تحتوي على خلفية بيضاء صريحة
    const whiteBackgrounds = document.querySelectorAll(
      '[style*="background-color: white"], ' +
      '[style*="background-color:#fff"], ' +
      '[style*="background-color: #fff"], ' +
      '[style*="background-color:#ffffff"], ' +
      '[style*="background-color: #ffffff"], ' +
      '[style*="background-color: rgb(255"], ' +
      '[style*="background: white"], ' +
      '[style*="background:#fff"], ' +
      '[style*="background: #fff"], ' +
      '[style*="background:#ffffff"], ' +
      '[style*="background: #ffffff"], ' +
      '[style*="background: rgb(255"]'
    );

    whiteBackgrounds.forEach(element => {
      if (element instanceof HTMLElement) {
        // حفظ الـ style الأصلي
        if (!element.dataset.originalStyle) {
          element.dataset.originalStyle = element.getAttribute('style') || '';
        }
        
        // تحديث الـ style للوضع الليلي
        if (this.isDarkMode) {
          const currentStyle = element.getAttribute('style') || '';
          const updatedStyle = currentStyle
            .replace(/background(-color)?:\s*(white|#fff|#ffffff|rgb\(255[^)]+\))/gi, 'background$1: var(--color-bg-elevated)');
          element.setAttribute('style', updatedStyle);
        }
      }
    });

    // إصلاح العناصر التي تحتوي على نص أسود صريح
    const blackTexts = document.querySelectorAll(
      '[style*="color: black"], ' +
      '[style*="color:#000"], ' +
      '[style*="color: #000"], ' +
      '[style*="color:#000000"], ' +
      '[style*="color: #000000"], ' +
      '[style*="color: rgb(0"]'
    );

    blackTexts.forEach(element => {
      if (element instanceof HTMLElement) {
        // حفظ الـ style الأصلي
        if (!element.dataset.originalStyle) {
          element.dataset.originalStyle = element.getAttribute('style') || '';
        }
        
        // تحديث الـ style للوضع الليلي
        if (this.isDarkMode) {
          const currentStyle = element.getAttribute('style') || '';
          const updatedStyle = currentStyle
            .replace(/color:\s*(black|#000|#000000|rgb\(0[^)]+\))/gi, 'color: var(--color-text-primary)');
          element.setAttribute('style', updatedStyle);
        }
      }
    });
  }

  // مراقبة DOM للعناصر الجديدة
  public observeDOM(): void {
    const observer = new MutationObserver((mutations) => {
      if (this.isDarkMode) {
        // تأخير قليل للتأكد من تحميل العناصر
        setTimeout(() => {
          this.applyDarkModeToAllElements();
        }, 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });
  }
}

// تهيئة المدير عند تحميل الصفحة
if (typeof window !== 'undefined') {
  const darkModeManager = DarkModeManager.getInstance();
  
  // بدء مراقبة DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      darkModeManager.observeDOM();
    });
  } else {
    darkModeManager.observeDOM();
  }
}

// تصدير للاستخدام في React
export function useDarkModeManager() {
  const [isDark, setIsDark] = React.useState(false);
  
  React.useEffect(() => {
    const manager = DarkModeManager.getInstance();
    setIsDark(manager.isDark());
    
    const observer = (isDarkMode: boolean) => {
      setIsDark(isDarkMode);
    };
    
    manager.addObserver(observer);
    
    return () => {
      manager.removeObserver(observer);
    };
  }, []);
  
  return {
    isDark,
    toggleDarkMode: () => DarkModeManager.getInstance().toggleDarkMode(),
    enableDarkMode: () => DarkModeManager.getInstance().enableDarkMode(),
    disableDarkMode: () => DarkModeManager.getInstance().disableDarkMode()
  };
}

// دالة مساعدة للاستخدام السريع
export function toggleDarkMode() {
  DarkModeManager.getInstance().toggleDarkMode();
}

// Import React for the hook
import React from 'react';
