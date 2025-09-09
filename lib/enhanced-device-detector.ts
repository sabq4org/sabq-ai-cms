/**
 * نظام محسّن للتعرف على الأجهزة
 * يدمج توصيات Manus AI مع النظام الحالي
 * 
 * التحسينات:
 * - دعم الأجهزة الهجينة (Surface Pro, iPad Pro)
 * - التعرف على قدرات الشبكة
 * - Adaptive Loading حسب القدرات
 * - Progressive Enhancement
 */

import Cookies from 'js-cookie';
import { UnifiedDeviceDetector, DeviceType, DeviceInfo } from './unified-device-detector';

/**
 * معلومات الجهاز المحسنة
 */
export interface EnhancedDeviceInfo extends DeviceInfo {
  subType: 'phone' | 'phablet' | 'small-tablet' | 'large-tablet' | 'laptop' | 'desktop' | 'foldable';
  isHybrid: boolean;
  primaryInput: 'touch' | 'mouse' | 'both';
  network: NetworkInfo;
  features: FeatureSupport;
  loadingStrategy: LoadingStrategy;
}

/**
 * معلومات الشبكة
 */
export interface NetworkInfo {
  effectiveType: '2g' | '3g' | '4g' | '5g' | 'unknown';
  downlink: number;
  rtt: number;
  saveData: boolean;
  isOnline: boolean;
}

/**
 * دعم الميزات
 */
export interface FeatureSupport {
  // CSS Features
  cssGrid: boolean;
  cssFlexbox: boolean;
  cssCustomProperties: boolean;
  cssContainerQueries: boolean;
  
  // JavaScript Features
  intersectionObserver: boolean;
  resizeObserver: boolean;
  webp: boolean;
  avif: boolean;
  
  // Device Features
  touchEvents: boolean;
  pointerEvents: boolean;
  deviceMotion: boolean;
  vibration: boolean;
}

/**
 * استراتيجية التحميل
 */
export interface LoadingStrategy {
  imageQuality: 'low' | 'medium' | 'high' | 'auto';
  lazyLoading: boolean;
  prefetchCount: number;
  enableAnimations: boolean;
  enableAutoplay: boolean;
  compressionLevel: 'low' | 'medium' | 'high';
  cacheStrategy: 'aggressive' | 'moderate' | 'minimal';
}

/**
 * نظام محسن للتعرف على الأجهزة
 */
export class EnhancedDeviceDetector extends UnifiedDeviceDetector {
  private static enhancedInstance: EnhancedDeviceDetector;
  private enhancedInfo: EnhancedDeviceInfo | null = null;
  private networkObserver: any = null;
  private performanceObserver: PerformanceObserver | null = null;
  
  protected constructor() {
    super();
    if (typeof window !== 'undefined') {
      this.initializeEnhanced();
    }
  }
  
  /**
   * الحصول على instance محسن
   */
  public static getEnhancedInstance(): EnhancedDeviceDetector {
    if (!EnhancedDeviceDetector.enhancedInstance) {
      EnhancedDeviceDetector.enhancedInstance = new EnhancedDeviceDetector();
    }
    return EnhancedDeviceDetector.enhancedInstance;
  }
  
  /**
   * تهيئة محسنة
   */
  private initializeEnhanced(): void {
    this.enhancedInfo = this.detectEnhancedDevice();
    this.setupNetworkObserver();
    this.setupPerformanceObserver();
    this.applyProgressiveEnhancements();
    this.updateDOMEnhanced();
  }
  
  /**
   * التعرف المحسن على الجهاز
   */
  private detectEnhancedDevice(): EnhancedDeviceInfo {
    const baseInfo = this.getDeviceInfo();
    if (!baseInfo) {
      throw new Error('Failed to get base device info');
    }
    
    // تحديد النوع الفرعي
    const subType = this.detectSubType(baseInfo);
    
    // فحص الأجهزة الهجينة
    const { isHybrid, primaryInput } = this.detectHybridDevice(baseInfo);
    
    // معلومات الشبكة
    const network = this.detectNetworkInfo();
    
    // دعم الميزات
    const features = this.detectFeatureSupport();
    
    // استراتيجية التحميل
    const loadingStrategy = this.determineLoadingStrategy(
      baseInfo,
      network,
      features,
      isHybrid
    );
    
    return {
      ...baseInfo,
      subType,
      isHybrid,
      primaryInput,
      network,
      features,
      loadingStrategy
    };
  }
  
  /**
   * تحديد النوع الفرعي للجهاز
   */
  private detectSubType(baseInfo: DeviceInfo): EnhancedDeviceInfo['subType'] {
    const screenWidth = Math.max(screen.width, screen.height);
    const viewportWidth = window.innerWidth;
    const hasTouch = baseInfo.hasTouch;
    const userAgent = navigator.userAgent;
    
    // فحص الأجهزة القابلة للطي
    if (/Fold|Flip/i.test(userAgent)) {
      return 'foldable';
    }
    
    // تصنيف دقيق بناءً على الحجم
    if (screenWidth <= 360 || (viewportWidth <= 360 && hasTouch)) {
      return 'phone';
    } else if (screenWidth <= 414 || (viewportWidth <= 414 && hasTouch)) {
      return 'phone';
    } else if (screenWidth <= 640 || (viewportWidth <= 640 && hasTouch)) {
      return 'phablet';
    } else if (screenWidth <= 768 || (viewportWidth <= 768 && hasTouch)) {
      return 'small-tablet';
    } else if (screenWidth <= 1024 || (viewportWidth <= 1024 && hasTouch)) {
      return 'large-tablet';
    } else if (screenWidth <= 1366) {
      return 'laptop';
    } else {
      return 'desktop';
    }
  }
  
  /**
   * فحص الأجهزة الهجينة
   */
  private detectHybridDevice(baseInfo: DeviceInfo): {
    isHybrid: boolean;
    primaryInput: 'touch' | 'mouse' | 'both';
  } {
    const userAgent = navigator.userAgent;
    const hasTouch = baseInfo.hasTouch;
    const hasHover = window.matchMedia('(hover: hover)').matches;
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    
    // فحص الأجهزة الهجينة المعروفة
    const isSurfacePro = /Windows.*Touch/i.test(userAgent) && screen.width >= 1024;
    const isiPadPro = /iPad/i.test(userAgent) && screen.width >= 1024;
    const isMacWithTouch = /Macintosh/i.test(userAgent) && hasTouch;
    
    let isHybrid = false;
    let primaryInput: 'touch' | 'mouse' | 'both' = 'mouse';
    
    if (isSurfacePro || isMacWithTouch || (hasTouch && hasHover && hasFinePointer)) {
      isHybrid = true;
      primaryInput = 'both';
    } else if (isiPadPro) {
      isHybrid = true;
      primaryInput = hasHover ? 'both' : 'touch';
    } else if (hasTouch && hasCoarsePointer && !hasFinePointer) {
      primaryInput = 'touch';
    } else if (!hasTouch && hasFinePointer) {
      primaryInput = 'mouse';
    } else if (hasTouch && hasFinePointer) {
      isHybrid = true;
      primaryInput = 'both';
    }
    
    return { isHybrid, primaryInput };
  }
  
  /**
   * فحص معلومات الشبكة
   */
  private detectNetworkInfo(): NetworkInfo {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;
    
    if (!connection) {
      return {
        effectiveType: 'unknown',
        downlink: 10,
        rtt: 100,
        saveData: false,
        isOnline: navigator.onLine
      };
    }
    
    return {
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || 10,
      rtt: connection.rtt || 100,
      saveData: connection.saveData || false,
      isOnline: navigator.onLine
    };
  }
  
  /**
   * فحص دعم الميزات
   */
  private detectFeatureSupport(): FeatureSupport {
    return {
      // CSS Features
      cssGrid: CSS.supports('display', 'grid'),
      cssFlexbox: CSS.supports('display', 'flex'),
      cssCustomProperties: CSS.supports('--test', 'value'),
      cssContainerQueries: CSS.supports('container-type', 'inline-size'),
      
      // JavaScript Features
      intersectionObserver: 'IntersectionObserver' in window,
      resizeObserver: 'ResizeObserver' in window,
      webp: this.checkWebPSupport(),
      avif: this.checkAVIFSupport(),
      
      // Device Features
      touchEvents: 'ontouchstart' in window,
      pointerEvents: 'PointerEvent' in window,
      deviceMotion: 'DeviceMotionEvent' in window,
      vibration: 'vibrate' in navigator
    };
  }
  
  /**
   * تحديد استراتيجية التحميل
   */
  private determineLoadingStrategy(
    deviceInfo: DeviceInfo,
    networkInfo: NetworkInfo,
    features: FeatureSupport,
    isHybrid: boolean
  ): LoadingStrategy {
    const { type } = deviceInfo;
    const { effectiveType, saveData, downlink } = networkInfo;
    
    // استراتيجية للشبكات البطيئة أو وضع توفير البيانات
    if (effectiveType === '2g' || saveData || downlink < 1) {
      return {
        imageQuality: 'low',
        lazyLoading: true,
        prefetchCount: 1,
        enableAnimations: false,
        enableAutoplay: false,
        compressionLevel: 'high',
        cacheStrategy: 'aggressive'
      };
    }
    
    // استراتيجية للشبكات المتوسطة (3G)
    if (effectiveType === '3g' || downlink < 5) {
      return {
        imageQuality: type === 'mobile' ? 'medium' : 'high',
        lazyLoading: true,
        prefetchCount: 3,
        enableAnimations: !type.includes('mobile'),
        enableAutoplay: false,
        compressionLevel: 'medium',
        cacheStrategy: 'moderate'
      };
    }
    
    // استراتيجية للأجهزة الهجينة
    if (isHybrid) {
      return {
        imageQuality: 'high',
        lazyLoading: features.intersectionObserver,
        prefetchCount: 5,
        enableAnimations: true,
        enableAutoplay: effectiveType === '4g' || effectiveType === '5g',
        compressionLevel: 'low',
        cacheStrategy: 'moderate'
      };
    }
    
    // استراتيجية للشبكات السريعة (4G/5G)
    return {
      imageQuality: 'high',
      lazyLoading: type === 'mobile',
      prefetchCount: type === 'mobile' ? 5 : 10,
      enableAnimations: true,
      enableAutoplay: true,
      compressionLevel: 'low',
      cacheStrategy: type === 'mobile' ? 'moderate' : 'minimal'
    };
  }
  
  /**
   * مراقب الشبكة
   */
  private setupNetworkObserver(): void {
    const connection = (navigator as any).connection;
    
    if (connection) {
      connection.addEventListener('change', () => {
        this.enhancedInfo = this.detectEnhancedDevice();
        this.notifyEnhancedChange();
      });
    }
    
    // مراقبة حالة الاتصال
    window.addEventListener('online', () => {
      if (this.enhancedInfo) {
        this.enhancedInfo.network.isOnline = true;
        this.notifyEnhancedChange();
      }
    });
    
    window.addEventListener('offline', () => {
      if (this.enhancedInfo) {
        this.enhancedInfo.network.isOnline = false;
        this.notifyEnhancedChange();
      }
    });
  }
  
  /**
   * مراقب الأداء
   */
  private setupPerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      try {
        this.performanceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            // تتبع أداء التحميل
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              const loadTime = navEntry.loadEventEnd - navEntry.fetchStart;
              
              // تحديث الاستراتيجية إذا كان التحميل بطيئاً
              if (loadTime > 3000 && this.enhancedInfo) {
                this.enhancedInfo.loadingStrategy.lazyLoading = true;
                this.enhancedInfo.loadingStrategy.prefetchCount = Math.min(
                  this.enhancedInfo.loadingStrategy.prefetchCount,
                  3
                );
              }
            }
          }
        });
        
        this.performanceObserver.observe({ 
          entryTypes: ['navigation', 'resource'] 
        });
      } catch (error) {
        console.warn('Performance Observer setup failed:', error);
      }
    }
  }
  
  /**
   * تطبيق التحسينات التدريجية
   */
  private applyProgressiveEnhancements(): void {
    if (!this.enhancedInfo) return;
    
    const { features } = this.enhancedInfo;
    const body = document.body;
    
    // إضافة فئات CSS للميزات المدعومة
    Object.entries(features).forEach(([feature, supported]) => {
      const className = supported ? `supports-${feature}` : `no-${feature}`;
      body.classList.add(className.toLowerCase().replace(/_/g, '-'));
    });
    
    // تحميل polyfills إذا لزم
    if (!features.intersectionObserver) {
      this.loadPolyfill('intersection-observer');
    }
    
    if (!features.resizeObserver) {
      this.loadPolyfill('resize-observer');
    }
  }
  
  /**
   * تحديث DOM المحسن
   */
  private updateDOMEnhanced(): void {
    if (!this.enhancedInfo) return;
    
    const body = document.body;
    const root = document.documentElement;
    
    // إضافة فئات النوع الفرعي
    body.classList.add(`device-subtype-${this.enhancedInfo.subType}`);
    
    // إضافة فئات الأجهزة الهجينة
    if (this.enhancedInfo.isHybrid) {
      body.classList.add('device-hybrid');
      body.classList.add(`input-${this.enhancedInfo.primaryInput}`);
    }
    
    // إضافة فئات الشبكة
    body.classList.add(`network-${this.enhancedInfo.network.effectiveType}`);
    if (this.enhancedInfo.network.saveData) {
      body.classList.add('data-saver');
    }
    
    // تحديث CSS Custom Properties
    root.style.setProperty('--device-subtype', this.enhancedInfo.subType);
    root.style.setProperty('--network-type', this.enhancedInfo.network.effectiveType);
    root.style.setProperty('--network-downlink', `${this.enhancedInfo.network.downlink}`);
    root.style.setProperty('--is-hybrid', this.enhancedInfo.isHybrid ? '1' : '0');
    
    // تطبيق استراتيجية التحميل
    const strategy = this.enhancedInfo.loadingStrategy;
    root.style.setProperty('--image-quality', strategy.imageQuality);
    root.style.setProperty('--lazy-loading', strategy.lazyLoading ? 'lazy' : 'eager');
    root.style.setProperty('--prefetch-count', `${strategy.prefetchCount}`);
    root.style.setProperty('--enable-animations', strategy.enableAnimations ? '1' : '0');
  }
  
  /**
   * إشعار بالتغييرات المحسنة
   */
  private notifyEnhancedChange(): void {
    window.dispatchEvent(new CustomEvent('enhancedDeviceChange', {
      detail: this.enhancedInfo
    }));
  }
  
  /**
   * فحص دعم WebP
   */
  private checkWebPSupport(): boolean {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    } catch {
      return false;
    }
  }
  
  /**
   * فحص دعم AVIF
   */
  private checkAVIFSupport(): boolean {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
    } catch {
      return false;
    }
  }
  
  /**
   * تحميل Polyfill
   */
  private async loadPolyfill(name: string): Promise<void> {
    try {
      // محاولة تحميل polyfill من CDN
      const script = document.createElement('script');
      script.src = `https://polyfill.io/v3/polyfill.min.js?features=${name}`;
      script.async = true;
      document.head.appendChild(script);
    } catch (error) {
      console.warn(`Failed to load polyfill: ${name}`, error);
    }
  }
  
  /**
   * الحصول على معلومات الجهاز المحسنة
   */
  public getEnhancedInfo(): EnhancedDeviceInfo | null {
    return this.enhancedInfo;
  }
  
  /**
   * الحصول على استراتيجية التحميل
   */
  public getLoadingStrategy(): LoadingStrategy {
    return this.enhancedInfo?.loadingStrategy || {
      imageQuality: 'auto',
      lazyLoading: true,
      prefetchCount: 5,
      enableAnimations: true,
      enableAutoplay: false,
      compressionLevel: 'medium',
      cacheStrategy: 'moderate'
    };
  }
  
  /**
   * فحص إذا كان الجهاز هجين
   */
  public isHybridDevice(): boolean {
    return this.enhancedInfo?.isHybrid || false;
  }
  
  /**
   * الحصول على نوع الإدخال الأساسي
   */
  public getPrimaryInput(): 'touch' | 'mouse' | 'both' {
    return this.enhancedInfo?.primaryInput || 'mouse';
  }
  
  /**
   * فحص حالة الشبكة
   */
  public getNetworkInfo(): NetworkInfo {
    return this.enhancedInfo?.network || {
      effectiveType: 'unknown',
      downlink: 10,
      rtt: 100,
      saveData: false,
      isOnline: navigator.onLine
    };
  }
  
  /**
   * فحص دعم ميزة معينة
   */
  public supportsFeature(feature: keyof FeatureSupport): boolean {
    return this.enhancedInfo?.features[feature] || false;
  }
  
  /**
   * تنظيف الموارد
   */
  public cleanup(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }
    
    const connection = (navigator as any).connection;
    if (connection && connection.removeEventListener) {
      connection.removeEventListener('change', this.notifyEnhancedChange);
    }
  }
}

/**
 * Hook محسن لـ React
 */
export function useEnhancedDeviceDetection() {
  const [enhancedInfo, setEnhancedInfo] = useState<EnhancedDeviceInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const detector = EnhancedDeviceDetector.getEnhancedInstance();
    setEnhancedInfo(detector.getEnhancedInfo());
    setIsLoading(false);
    
    const handleChange = (event: CustomEvent) => {
      setEnhancedInfo(event.detail);
    };
    
    window.addEventListener('enhancedDeviceChange', handleChange as EventListener);
    
    return () => {
      window.removeEventListener('enhancedDeviceChange', handleChange as EventListener);
    };
  }, []);
  
  return {
    enhancedInfo,
    isLoading,
    deviceType: enhancedInfo?.type || 'desktop',
    subType: enhancedInfo?.subType || 'desktop',
    isHybrid: enhancedInfo?.isHybrid || false,
    primaryInput: enhancedInfo?.primaryInput || 'mouse',
    network: enhancedInfo?.network,
    features: enhancedInfo?.features,
    loadingStrategy: enhancedInfo?.loadingStrategy,
    
    // Helper methods
    isMobile: enhancedInfo?.type === 'mobile',
    isTablet: enhancedInfo?.type === 'tablet',
    isDesktop: enhancedInfo?.type === 'desktop',
    isSlow: enhancedInfo?.network.effectiveType === '2g' || enhancedInfo?.network.effectiveType === '3g',
    isFast: enhancedInfo?.network.effectiveType === '4g' || enhancedInfo?.network.effectiveType === '5g',
    isOffline: !enhancedInfo?.network.isOnline,
    shouldReduceData: enhancedInfo?.network.saveData || enhancedInfo?.network.effectiveType === '2g',
    supportsTouch: enhancedInfo?.features?.touchEvents || false,
    supportsHover: enhancedInfo?.hasTouch === false
  };
}

// تصدير instance محسن
export const enhancedDeviceDetector = EnhancedDeviceDetector.getEnhancedInstance();
