/**
 * نظام موحد للتعرف على الأجهزة
 * 
 * يحل مشاكل عدم التزامن بين النسختين عن طريق:
 * 1. توحيد آلية التعرف على الجهاز
 * 2. حفظ نوع الجهاز بشكل ثابت
 * 3. التحقق من صحة النوع المحفوظ
 */

import Cookies from 'js-cookie';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface DeviceInfo {
  type: DeviceType;
  screenWidth: number;
  userAgent: string;
  hasTouch: boolean;
  isCached: boolean;
  timestamp: number;
}

/**
 * مدير موحد للتعرف على الأجهزة
 */
export class UnifiedDeviceDetector {
  private static instance: UnifiedDeviceDetector;
  private deviceInfo: DeviceInfo | null = null;
  private readonly COOKIE_NAME = 'device-type';
  private readonly STORAGE_KEY = 'device-info';
  private readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // أسبوع واحد

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initializeDevice();
    }
  }

  /**
   * الحصول على instance واحد (Singleton)
   */
  public static getInstance(): UnifiedDeviceDetector {
    if (!UnifiedDeviceDetector.instance) {
      UnifiedDeviceDetector.instance = new UnifiedDeviceDetector();
    }
    return UnifiedDeviceDetector.instance;
  }

  /**
   * تهيئة معلومات الجهاز
   */
  private initializeDevice(): void {
    // محاولة جلب المعلومات المحفوظة أولاً
    const cached = this.getCachedDeviceInfo();
    
    if (cached && this.isValidCache(cached)) {
      this.deviceInfo = cached;
      console.log('📱 استخدام معلومات الجهاز المحفوظة:', cached.type);
    } else {
      // التعرف الجديد على الجهاز
      this.deviceInfo = this.detectDevice();
      this.persistDeviceInfo();
      console.log('📱 تم التعرف على الجهاز:', this.deviceInfo.type);
    }

    // إضافة class للـ body
    this.applyDeviceClass();
  }

  /**
   * التعرف على نوع الجهاز
   */
  private detectDevice(): DeviceInfo {
    const userAgent = navigator.userAgent;
    const screenWidth = Math.max(screen.width, screen.height); // استخدام الأبعاد الثابتة
    const viewportWidth = window.innerWidth;
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // قواعد التعرف المحسنة
    const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTabletUA = /iPad|Android(?=.*\bTablet\b)|KFAPWI/i.test(userAgent);
    
    let type: DeviceType;

    // منطق التعرف بناءً على معايير متعددة
    if (isMobileUA && !isTabletUA) {
      // جهاز محمول
      type = 'mobile';
    } else if (isTabletUA || (hasTouch && screenWidth >= 768 && screenWidth <= 1024)) {
      // جهاز لوحي
      type = 'tablet';
    } else if (viewportWidth < 768 && hasTouch) {
      // جهاز محمول صغير
      type = 'mobile';
    } else {
      // جهاز مكتبي
      type = 'desktop';
    }

    return {
      type,
      screenWidth: viewportWidth,
      userAgent,
      hasTouch,
      isCached: false,
      timestamp: Date.now()
    };
  }

  /**
   * جلب معلومات الجهاز المحفوظة
   */
  private getCachedDeviceInfo(): DeviceInfo | null {
    try {
      // محاولة من الكوكيز أولاً (للـ SSR)
      const cookieType = Cookies.get(this.COOKIE_NAME) as DeviceType;
      
      // محاولة من localStorage
      const stored = localStorage.getItem(this.STORAGE_KEY);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          isCached: true
        };
      } else if (cookieType) {
        // إنشاء معلومات أساسية من الكوكي
        return {
          type: cookieType,
          screenWidth: window.innerWidth,
          userAgent: navigator.userAgent,
          hasTouch: 'ontouchstart' in window,
          isCached: true,
          timestamp: Date.now()
        };
      }
    } catch (error) {
      console.warn('⚠️ خطأ في قراءة معلومات الجهاز المحفوظة:', error);
    }
    
    return null;
  }

  /**
   * التحقق من صلاحية الكاش
   */
  private isValidCache(cached: DeviceInfo): boolean {
    // التحقق من عمر الكاش
    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      return false;
    }

    // التحقق من تطابق User Agent (للتأكد من عدم تغيير المتصفح)
    if (cached.userAgent !== navigator.userAgent) {
      return false;
    }

    // التحقق من الفرق الكبير في حجم الشاشة
    const currentWidth = window.innerWidth;
    const widthDifference = Math.abs(cached.screenWidth - currentWidth);
    
    // إذا كان الفرق أكثر من 200 بكسل، قد يكون الجهاز تغير
    if (widthDifference > 200) {
      // إعادة التعرف للتأكد
      const newDetection = this.detectDevice();
      return newDetection.type === cached.type;
    }

    return true;
  }

  /**
   * حفظ معلومات الجهاز
   */
  private persistDeviceInfo(): void {
    if (!this.deviceInfo) return;

    try {
      // حفظ في الكوكيز (للـ SSR والمشاركة بين النوافذ)
      Cookies.set(this.COOKIE_NAME, this.deviceInfo.type, {
        expires: 7, // 7 أيام
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });

      // حفظ في localStorage (للتفاصيل الكاملة)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        ...this.deviceInfo,
        timestamp: Date.now()
      }));

      // حفظ في sessionStorage (للجلسة الحالية)
      sessionStorage.setItem('device-type-session', this.deviceInfo.type);
    } catch (error) {
      console.warn('⚠️ خطأ في حفظ معلومات الجهاز:', error);
    }
  }

  /**
   * تطبيق كلاس CSS على الـ body
   */
  private applyDeviceClass(): void {
    if (!this.deviceInfo || typeof document === 'undefined') return;

    // إزالة الكلاسات القديمة
    document.body.classList.remove('device-mobile', 'device-tablet', 'device-desktop');
    
    // إضافة الكلاس الجديد
    document.body.classList.add(`device-${this.deviceInfo.type}`);
    
    // إضافة كلاسات إضافية
    if (this.deviceInfo.hasTouch) {
      document.body.classList.add('has-touch');
    }
  }

  /**
   * الحصول على نوع الجهاز الحالي
   */
  public getDeviceType(): DeviceType {
    if (!this.deviceInfo) {
      // إذا لم يتم التهيئة بعد، قم بالتعرف السريع
      if (typeof window === 'undefined') {
        return 'desktop'; // افتراضي للـ SSR
      }
      this.initializeDevice();
    }
    return this.deviceInfo?.type || 'desktop';
  }

  /**
   * الحصول على معلومات الجهاز الكاملة
   */
  public getDeviceInfo(): DeviceInfo | null {
    return this.deviceInfo;
  }

  /**
   * فحص إذا كان الجهاز محمول
   */
  public isMobile(): boolean {
    return this.getDeviceType() === 'mobile';
  }

  /**
   * فحص إذا كان الجهاز لوحي
   */
  public isTablet(): boolean {
    return this.getDeviceType() === 'tablet';
  }

  /**
   * فحص إذا كان الجهاز مكتبي
   */
  public isDesktop(): boolean {
    return this.getDeviceType() === 'desktop';
  }

  /**
   * فحص إذا كان الجهاز يدعم اللمس
   */
  public hasTouch(): boolean {
    return this.deviceInfo?.hasTouch || false;
  }

  /**
   * إعادة التعرف على الجهاز (يدوياً)
   */
  public refresh(): void {
    this.deviceInfo = this.detectDevice();
    this.persistDeviceInfo();
    this.applyDeviceClass();
    console.log('🔄 تم إعادة التعرف على الجهاز:', this.deviceInfo.type);
  }

  /**
   * مسح الكاش وإعادة التعرف
   */
  public clearCache(): void {
    try {
      Cookies.remove(this.COOKIE_NAME);
      localStorage.removeItem(this.STORAGE_KEY);
      sessionStorage.removeItem('device-type-session');
      this.refresh();
      console.log('🧹 تم مسح كاش معلومات الجهاز');
    } catch (error) {
      console.warn('⚠️ خطأ في مسح كاش الجهاز:', error);
    }
  }

  /**
   * مستمع لتغيير حجم الشاشة
   */
  public enableResizeListener(): void {
    if (typeof window === 'undefined') return;

    let resizeTimer: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const currentType = this.getDeviceType();
        const newInfo = this.detectDevice();
        
        // إذا تغير نوع الجهاز، قم بالتحديث
        if (newInfo.type !== currentType) {
          this.deviceInfo = newInfo;
          this.persistDeviceInfo();
          this.applyDeviceClass();
          
          // إطلاق حدث مخصص
          window.dispatchEvent(new CustomEvent('deviceTypeChanged', {
            detail: { oldType: currentType, newType: newInfo.type }
          }));
          
          console.log(`📱 تغير نوع الجهاز من ${currentType} إلى ${newInfo.type}`);
        }
      }, 500); // انتظار 500ms بعد توقف تغيير الحجم
    };

    window.addEventListener('resize', handleResize, { passive: true });
  }
}

/**
 * دالة مساعدة للتعرف على الجهاز من User Agent (للـ SSR)
 */
export function getDeviceTypeFromUserAgent(userAgent: string): DeviceType {
  const mobileRegex = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i;
  const tabletRegex = /iPad|Android(?=.*\bTablet\b)|KFAPWI/i;
  
  if (mobileRegex.test(userAgent) && !tabletRegex.test(userAgent)) {
    return 'mobile';
  } else if (tabletRegex.test(userAgent)) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

/**
 * Hook للتعرف على الجهاز في React
 */
export function useUnifiedDeviceDetection() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detector = UnifiedDeviceDetector.getInstance();
    setDeviceInfo(detector.getDeviceInfo());
    setIsLoading(false);

    // الاستماع لتغييرات نوع الجهاز
    const handleDeviceChange = (event: CustomEvent) => {
      setDeviceInfo(detector.getDeviceInfo());
      console.log('📱 Hook: تم رصد تغيير في نوع الجهاز', event.detail);
    };

    window.addEventListener('deviceTypeChanged', handleDeviceChange as EventListener);

    // تفعيل مستمع تغيير الحجم
    detector.enableResizeListener();

    return () => {
      window.removeEventListener('deviceTypeChanged', handleDeviceChange as EventListener);
    };
  }, []);

  return {
    deviceInfo,
    isLoading,
    deviceType: deviceInfo?.type || 'desktop',
    isMobile: deviceInfo?.type === 'mobile',
    isTablet: deviceInfo?.type === 'tablet',
    isDesktop: deviceInfo?.type === 'desktop',
    hasTouch: deviceInfo?.hasTouch || false,
    refresh: () => UnifiedDeviceDetector.getInstance().refresh(),
    clearCache: () => UnifiedDeviceDetector.getInstance().clearCache()
  };
}

// تصدير instance مباشرة للاستخدام السريع
export const deviceDetector = UnifiedDeviceDetector.getInstance();
