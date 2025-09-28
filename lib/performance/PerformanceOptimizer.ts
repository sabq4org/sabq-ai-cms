/**
 * PerformanceOptimizer - محسن الأداء لبوابة سبق الذكية
 * 
 * يوفر هذا المكون مجموعة من الأدوات والوظائف لتحسين أداء التطبيق
 * وتقليل وقت التحميل وتحسين تجربة المستخدم
 */

// أنواع البيانات
export interface PerformanceMetrics {
  ttfb: number; // Time to First Byte
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttl: number; // Time to Load
  jsHeapSize: number; // JavaScript Heap Size
  domNodes: number; // DOM Nodes Count
  resources: {
    total: number;
    js: number;
    css: number;
    images: number;
    fonts: number;
    other: number;
  };
}

export interface ResourceInfo {
  url: string;
  type: string;
  size: number;
  duration: number;
}

export interface PerformanceReport {
  url: string;
  timestamp: Date;
  metrics: PerformanceMetrics;
  slowResources: ResourceInfo[];
  recommendations: string[];
  score: number; // 0-100
}

// محسن الأداء
export class PerformanceOptimizer {
  /**
   * قياس أداء الصفحة الحالية
   */
  static measurePagePerformance(): PerformanceMetrics | null {
    if (typeof window === 'undefined') {
      return null; // تشغيل على الخادم
    }
    
    try {
      // الحصول على توقيتات الأداء
      const perfEntries = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = window.performance.getEntriesByType('paint');
      
      // حساب المقاييس
      const ttfb = perfEntries.responseStart - perfEntries.requestStart;
      const domLoad = perfEntries.domContentLoadedEventEnd - perfEntries.fetchStart;
      const pageLoad = perfEntries.loadEventEnd - perfEntries.fetchStart;
      
      // الحصول على First Contentful Paint
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      const fcp = fcpEntry ? fcpEntry.startTime : 0;
      
      // الحصول على معلومات الموارد
      const resourceEntries = window.performance.getEntriesByType('resource');
      const resources = {
        total: resourceEntries.length,
        js: resourceEntries.filter(entry => entry.name.endsWith('.js')).length,
        css: resourceEntries.filter(entry => entry.name.endsWith('.css')).length,
        images: resourceEntries.filter(entry => 
          entry.name.endsWith('.jpg') || 
          entry.name.endsWith('.jpeg') || 
          entry.name.endsWith('.png') || 
          entry.name.endsWith('.gif') || 
          entry.name.endsWith('.svg') || 
          entry.name.endsWith('.webp')
        ).length,
        fonts: resourceEntries.filter(entry => 
          entry.name.endsWith('.woff') || 
          entry.name.endsWith('.woff2') || 
          entry.name.endsWith('.ttf') || 
          entry.name.endsWith('.otf')
        ).length,
        other: resourceEntries.filter(entry => 
          !entry.name.endsWith('.js') && 
          !entry.name.endsWith('.css') && 
          !entry.name.endsWith('.jpg') && 
          !entry.name.endsWith('.jpeg') && 
          !entry.name.endsWith('.png') && 
          !entry.name.endsWith('.gif') && 
          !entry.name.endsWith('.svg') && 
          !entry.name.endsWith('.webp') && 
          !entry.name.endsWith('.woff') && 
          !entry.name.endsWith('.woff2') && 
          !entry.name.endsWith('.ttf') && 
          !entry.name.endsWith('.otf')
        ).length
      };
      
      // الحصول على معلومات الذاكرة (إذا كانت متاحة)
      let jsHeapSize = 0;
      if (window.performance && (performance as any).memory) {
        jsHeapSize = (performance as any).memory.usedJSHeapSize;
      }
      
      // حساب عدد عناصر DOM
      const domNodes = document.querySelectorAll('*').length;
      
      return {
        ttfb,
        fcp,
        lcp: 0, // يتطلب مكتبة web-vitals
        fid: 0, // يتطلب مكتبة web-vitals
        cls: 0, // يتطلب مكتبة web-vitals
        ttl: pageLoad,
        jsHeapSize,
        domNodes,
        resources
      };
    } catch (error) {
      console.error('فشل قياس أداء الصفحة:', error);
      return null;
    }
  }

  /**
   * تحسين الصور في الصفحة
   */
  static optimizeImages(): void {
    if (typeof window === 'undefined') {
      return; // تشغيل على الخادم
    }
    
    try {
      // تحديد الصور التي ليست في منطقة العرض
      const images = document.querySelectorAll('img:not([loading])');
      
      images.forEach(img => {
        // إضافة خاصية loading="lazy" للصور
        if (!img.hasAttribute('loading')) {
          img.setAttribute('loading', 'lazy');
        }
        
        // إضافة خاصية decoding="async" للصور
        if (!img.hasAttribute('decoding')) {
          img.setAttribute('decoding', 'async');
        }
        
        // إضافة خاصية fetchpriority للصور المهمة
        if (img.getBoundingClientRect().top < window.innerHeight) {
          img.setAttribute('fetchpriority', 'high');
        } else {
          img.setAttribute('fetchpriority', 'low');
        }
      });
    } catch (error) {
      console.error('فشل تحسين الصور:', error);
    }
  }

  /**
   * تحسين الخطوط في الصفحة
   */
  static optimizeFonts(): void {
    if (typeof window === 'undefined') {
      return; // تشغيل على الخادم
    }
    
    try {
      // إضافة preconnect للخطوط
      const fontDomains = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com'
      ];
      
      fontDomains.forEach(domain => {
        if (!document.querySelector(`link[rel="preconnect"][href="${domain}"]`)) {
          const link = document.createElement('link');
          link.rel = 'preconnect';
          link.href = domain;
          link.crossOrigin = 'anonymous';
          document.head.appendChild(link);
        }
      });
      
      // إضافة font-display: swap للخطوط
      const style = document.createElement('style');
      style.textContent = `
        @font-face {
          font-display: swap;
        }
      `;
      document.head.appendChild(style);
    } catch (error) {
      console.error('فشل تحسين الخطوط:', error);
    }
  }

  /**
   * تحسين السكريبتات في الصفحة
   */
  static optimizeScripts(): void {
    if (typeof window === 'undefined') {
      return; // تشغيل على الخادم
    }
    
    try {
      // تأجيل تحميل السكريبتات غير الضرورية
      const scripts = document.querySelectorAll('script:not([async]):not([defer])');
      
      scripts.forEach(script => {
        if (!script.hasAttribute('async') && !script.hasAttribute('defer')) {
          // تجنب تعديل سكريبتات الصفحة الأساسية
          if (!script.src.includes('next') && !script.src.includes('webpack')) {
            script.setAttribute('defer', '');
          }
        }
      });
    } catch (error) {
      console.error('فشل تحسين السكريبتات:', error);
    }
  }

  /**
   * تحسين الروابط في الصفحة
   */
  static optimizeLinks(): void {
    if (typeof window === 'undefined') {
      return; // تشغيل على الخادم
    }
    
    try {
      // تحديد الروابط المرئية في الصفحة
      const links = document.querySelectorAll('a[href]:not([rel="prefetch"])');
      
      links.forEach(link => {
        // إضافة prefetch للروابط المرئية
        if (link.getBoundingClientRect().top < window.innerHeight * 1.5) {
          link.setAttribute('rel', (link.getAttribute('rel') || '') + ' prefetch');
        }
      });
    } catch (error) {
      console.error('فشل تحسين الروابط:', error);
    }
  }

  /**
   * تحسين الأداء العام للصفحة
   */
  static optimizePage(): void {
    if (typeof window === 'undefined') {
      return; // تشغيل على الخادم
    }
    
    try {
      // تطبيق جميع التحسينات
      this.optimizeImages();
      this.optimizeFonts();
      this.optimizeScripts();
      this.optimizeLinks();
      
      // تسجيل الأداء
      const metrics = this.measurePagePerformance();
      if (metrics) {
        console.log('مقاييس الأداء:', metrics);
      }
    } catch (error) {
      console.error('فشل تحسين الصفحة:', error);
    }
  }

  /**
   * إنشاء تقرير أداء للصفحة
   */
  static generatePerformanceReport(): PerformanceReport | null {
    if (typeof window === 'undefined') {
      return null; // تشغيل على الخادم
    }
    
    try {
      const metrics = this.measurePagePerformance();
      if (!metrics) {
        return null;
      }
      
      // تحديد الموارد البطيئة
      const resourceEntries = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const slowResources = resourceEntries
        .filter(entry => entry.duration > 500) // أكثر من 500 مللي ثانية
        .map(entry => ({
          url: entry.name,
          type: entry.initiatorType,
          size: entry.transferSize,
          duration: entry.duration
        }))
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 5); // أبطأ 5 موارد
      
      // إنشاء توصيات
      const recommendations: string[] = [];
      
      if (metrics.ttfb > 300) {
        recommendations.push('تحسين وقت استجابة الخادم (TTFB)');
      }
      
      if (metrics.fcp > 1000) {
        recommendations.push('تحسين First Contentful Paint عن طريق تقليل حجم CSS الأساسي');
      }
      
      if (metrics.ttl > 3000) {
        recommendations.push('تحسين وقت تحميل الصفحة عن طريق تقليل حجم الموارد وتحسين ترتيب التحميل');
      }
      
      if (metrics.jsHeapSize > 50000000) {
        recommendations.push('تقليل استخدام الذاكرة عن طريق تحسين استخدام JavaScript');
      }
      
      if (metrics.domNodes > 1500) {
        recommendations.push('تقليل عدد عناصر DOM لتحسين أداء الصفحة');
      }
      
      if (metrics.resources.images > 15) {
        recommendations.push('تقليل عدد الصور أو تحسين حجمها وتنسيقها');
      }
      
      // حساب درجة الأداء (0-100)
      let score = 100;
      
      if (metrics.ttfb > 300) score -= 10;
      if (metrics.fcp > 1000) score -= 10;
      if (metrics.ttl > 3000) score -= 20;
      if (metrics.jsHeapSize > 50000000) score -= 10;
      if (metrics.domNodes > 1500) score -= 10;
      if (metrics.resources.images > 15) score -= 10;
      if (metrics.resources.js > 20) score -= 10;
      if (metrics.resources.css > 10) score -= 10;
      if (slowResources.length > 3) score -= 10;
      
      // ضمان أن الدرجة بين 0 و 100
      score = Math.max(0, Math.min(100, score));
      
      return {
        url: window.location.href,
        timestamp: new Date(),
        metrics,
        slowResources,
        recommendations,
        score
      };
    } catch (error) {
      console.error('فشل إنشاء تقرير الأداء:', error);
      return null;
    }
  }
}
