/**
 * Middleware للتعرف على الجهاز من جانب الخادم
 * يحسن الأداء بالتعرف المبكر على نوع الجهاز
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * معلومات الجهاز من الخادم
 */
export interface ServerDeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  subType: string;
  userAgent: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isBot: boolean;
  os: string;
  browser: string;
}

/**
 * قوائم User Agents للأجهزة المختلفة
 */
const DEVICE_PATTERNS = {
  mobile: /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i,
  tablet: /iPad|Android(?=.*\bTablet\b)|Tablet|tablet|PlayBook|Kindle|Silk/i,
  desktop: /Windows NT|Macintosh|Mac OS X|Linux x86|CrOS/i,
  bot: /bot|crawler|spider|crawling|facebookexternalhit|whatsapp|telegram|twitter|linkedin/i,
  
  // أنظمة التشغيل
  ios: /iPhone|iPad|iPod/i,
  android: /Android/i,
  windows: /Windows/i,
  mac: /Macintosh|Mac OS X/i,
  linux: /Linux/i,
  
  // المتصفحات
  chrome: /Chrome|CriOS/i,
  safari: /Safari/i,
  firefox: /Firefox|FxiOS/i,
  edge: /Edge|EdgA|EdgiOS/i,
  opera: /Opera|OPR/i,
  samsung: /SamsungBrowser/i
};

/**
 * الأجهزة الهجينة المعروفة
 */
const HYBRID_DEVICES = {
  surfacePro: /Windows.*Touch.*Chrome/i,
  iPadPro: /iPad.*Safari.*AppleWebKit/i,
  chromebook: /CrOS/i,
  galaxyTab: /Samsung.*Tablet/i
};

/**
 * التعرف على الجهاز من User Agent
 */
export function detectDeviceFromUserAgent(userAgent: string): ServerDeviceInfo {
  // فحص البوتات أولاً
  const isBot = DEVICE_PATTERNS.bot.test(userAgent);
  
  if (isBot) {
    return {
      type: 'desktop',
      subType: 'bot',
      userAgent,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isBot: true,
      os: 'unknown',
      browser: 'bot'
    };
  }
  
  // تحديد نوع الجهاز
  const isMobile = DEVICE_PATTERNS.mobile.test(userAgent) && 
                   !DEVICE_PATTERNS.tablet.test(userAgent);
  const isTablet = DEVICE_PATTERNS.tablet.test(userAgent);
  const isDesktop = !isMobile && !isTablet;
  
  let type: 'mobile' | 'tablet' | 'desktop';
  let subType = 'unknown';
  
  if (isMobile) {
    type = 'mobile';
    subType = detectMobileSubType(userAgent);
  } else if (isTablet) {
    type = 'tablet';
    subType = detectTabletSubType(userAgent);
  } else {
    type = 'desktop';
    subType = detectDesktopSubType(userAgent);
  }
  
  // تحديد نظام التشغيل
  const os = detectOS(userAgent);
  
  // تحديد المتصفح
  const browser = detectBrowser(userAgent);
  
  return {
    type,
    subType,
    userAgent,
    isMobile,
    isTablet,
    isDesktop,
    isBot: false,
    os,
    browser
  };
}

/**
 * تحديد النوع الفرعي للموبايل
 */
function detectMobileSubType(userAgent: string): string {
  if (/iPhone\s+(SE|6|7|8|X)/i.test(userAgent)) return 'phone-small';
  if (/iPhone\s+(11|12|13|14|15)\s+Pro\s+Max/i.test(userAgent)) return 'phone-large';
  if (/iPhone/i.test(userAgent)) return 'phone';
  if (/Android.*Mobile/i.test(userAgent)) {
    if (/Pixel\s+[67]/i.test(userAgent)) return 'phone-large';
    if (/Galaxy\s+S2[0-9]/i.test(userAgent)) return 'phone-premium';
    return 'phone-android';
  }
  if (/Windows Phone/i.test(userAgent)) return 'phone-windows';
  return 'phone';
}

/**
 * تحديد النوع الفرعي للتابلت
 */
function detectTabletSubType(userAgent: string): string {
  if (/iPad\s+Pro\s+(12\.9|11)/i.test(userAgent)) return 'tablet-pro';
  if (/iPad\s+Air/i.test(userAgent)) return 'tablet-air';
  if (/iPad\s+Mini/i.test(userAgent)) return 'tablet-mini';
  if (/iPad/i.test(userAgent)) return 'tablet-ipad';
  if (/Galaxy\s+Tab\s+S[7-9]/i.test(userAgent)) return 'tablet-premium';
  if (/Android.*Tablet/i.test(userAgent)) return 'tablet-android';
  if (/Kindle|Silk/i.test(userAgent)) return 'tablet-kindle';
  if (HYBRID_DEVICES.surfacePro.test(userAgent)) return 'tablet-surface';
  return 'tablet';
}

/**
 * تحديد النوع الفرعي للديسكتوب
 */
function detectDesktopSubType(userAgent: string): string {
  if (HYBRID_DEVICES.surfacePro.test(userAgent)) return 'laptop-touch';
  if (/MacBook/i.test(userAgent)) return 'laptop-mac';
  if (/Windows.*Laptop/i.test(userAgent)) return 'laptop-windows';
  if (/CrOS/i.test(userAgent)) return 'chromebook';
  if (/Mac\s+Studio|iMac/i.test(userAgent)) return 'desktop-mac';
  if (/Windows/i.test(userAgent)) return 'desktop-windows';
  if (/Linux/i.test(userAgent)) return 'desktop-linux';
  return 'desktop';
}

/**
 * تحديد نظام التشغيل
 */
function detectOS(userAgent: string): string {
  if (DEVICE_PATTERNS.ios.test(userAgent)) return 'ios';
  if (DEVICE_PATTERNS.android.test(userAgent)) return 'android';
  if (DEVICE_PATTERNS.windows.test(userAgent)) return 'windows';
  if (DEVICE_PATTERNS.mac.test(userAgent)) return 'macos';
  if (DEVICE_PATTERNS.linux.test(userAgent)) return 'linux';
  return 'unknown';
}

/**
 * تحديد المتصفح
 */
function detectBrowser(userAgent: string): string {
  // ترتيب الفحص مهم لأن بعض المتصفحات تحتوي على أسماء أخرى
  if (DEVICE_PATTERNS.edge.test(userAgent)) return 'edge';
  if (DEVICE_PATTERNS.opera.test(userAgent)) return 'opera';
  if (DEVICE_PATTERNS.samsung.test(userAgent)) return 'samsung';
  if (DEVICE_PATTERNS.chrome.test(userAgent)) return 'chrome';
  if (DEVICE_PATTERNS.firefox.test(userAgent)) return 'firefox';
  if (DEVICE_PATTERNS.safari.test(userAgent)) return 'safari';
  return 'unknown';
}

/**
 * إنشاء ترويسات الاستجابة للجهاز
 */
function createDeviceHeaders(deviceInfo: ServerDeviceInfo): Headers {
  const headers = new Headers();
  
  headers.set('X-Device-Type', deviceInfo.type);
  headers.set('X-Device-SubType', deviceInfo.subType);
  headers.set('X-Is-Mobile', deviceInfo.isMobile.toString());
  headers.set('X-Is-Tablet', deviceInfo.isTablet.toString());
  headers.set('X-Is-Desktop', deviceInfo.isDesktop.toString());
  headers.set('X-Is-Bot', deviceInfo.isBot.toString());
  headers.set('X-Device-OS', deviceInfo.os);
  headers.set('X-Device-Browser', deviceInfo.browser);
  
  return headers;
}

/**
 * تحديد استراتيجية الكاش حسب الجهاز
 */
function getCacheStrategy(deviceInfo: ServerDeviceInfo): {
  maxAge: number;
  sMaxAge: number;
  staleWhileRevalidate: number;
} {
  // البوتات - كاش قصير
  if (deviceInfo.isBot) {
    return {
      maxAge: 60,       // دقيقة
      sMaxAge: 300,     // 5 دقائق
      staleWhileRevalidate: 60
    };
  }
  
  // الموبايل - كاش متوسط
  if (deviceInfo.isMobile) {
    return {
      maxAge: 120,      // دقيقتان
      sMaxAge: 600,     // 10 دقائق
      staleWhileRevalidate: 300
    };
  }
  
  // التابلت - كاش متوسط إلى طويل
  if (deviceInfo.isTablet) {
    return {
      maxAge: 180,      // 3 دقائق
      sMaxAge: 900,     // 15 دقيقة
      staleWhileRevalidate: 600
    };
  }
  
  // الديسكتوب - كاش طويل
  return {
    maxAge: 300,        // 5 دقائق
    sMaxAge: 1800,      // 30 دقيقة
    staleWhileRevalidate: 900
  };
}

/**
 * Middleware للتعرف على الجهاز
 */
export function deviceDetectionMiddleware(request: NextRequest): NextResponse {
  const userAgent = request.headers.get('user-agent') || '';
  
  // التعرف على الجهاز
  const deviceInfo = detectDeviceFromUserAgent(userAgent);
  
  // إنشاء الاستجابة
  const response = NextResponse.next();
  
  // إضافة ترويسات الجهاز
  const deviceHeaders = createDeviceHeaders(deviceInfo);
  deviceHeaders.forEach((value, key) => {
    response.headers.set(key, value);
  });
  
  // إضافة كوكي الجهاز (للعميل)
  response.cookies.set('device-type', deviceInfo.type, {
    maxAge: 60 * 60 * 24 * 7, // أسبوع
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  
  response.cookies.set('device-subtype', deviceInfo.subType, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  
  // إضافة ترويسات الكاش المناسبة
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const cacheStrategy = getCacheStrategy(deviceInfo);
    
    response.headers.set(
      'Cache-Control',
      `public, max-age=${cacheStrategy.maxAge}, s-maxage=${cacheStrategy.sMaxAge}, stale-while-revalidate=${cacheStrategy.staleWhileRevalidate}`
    );
    
    // تجنب Vary: User-Agent لمنع تجزئة الكاش
    response.headers.set('Vary', 'Accept-Encoding, Accept');
  }
  
  // إضافة ترويسات الأمان للأجهزة المحمولة
  if (deviceInfo.isMobile || deviceInfo.isTablet) {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  }
  
  return response;
}

/**
 * دالة مساعدة للحصول على معلومات الجهاز من الطلب
 */
export function getDeviceInfoFromRequest(request: NextRequest): ServerDeviceInfo {
  const userAgent = request.headers.get('user-agent') || '';
  return detectDeviceFromUserAgent(userAgent);
}

/**
 * دالة مساعدة للتحقق من نوع الجهاز
 */
export function isDeviceType(
  request: NextRequest,
  type: 'mobile' | 'tablet' | 'desktop'
): boolean {
  const deviceInfo = getDeviceInfoFromRequest(request);
  return deviceInfo.type === type;
}

/**
 * دالة مساعدة للحصول على استراتيجية التحميل من الخادم
 */
export function getServerLoadingStrategy(deviceInfo: ServerDeviceInfo): {
  imageFormat: 'webp' | 'jpeg' | 'avif';
  imageQuality: number;
  enableCompression: boolean;
  enableMinification: boolean;
} {
  // للبوتات - جودة منخفضة
  if (deviceInfo.isBot) {
    return {
      imageFormat: 'jpeg',
      imageQuality: 60,
      enableCompression: true,
      enableMinification: true
    };
  }
  
  // للموبايل - جودة متوسطة
  if (deviceInfo.isMobile) {
    return {
      imageFormat: 'webp',
      imageQuality: 75,
      enableCompression: true,
      enableMinification: true
    };
  }
  
  // للتابلت - جودة جيدة
  if (deviceInfo.isTablet) {
    return {
      imageFormat: 'webp',
      imageQuality: 85,
      enableCompression: true,
      enableMinification: false
    };
  }
  
  // للديسكتوب - جودة عالية
  return {
    imageFormat: 'avif',
    imageQuality: 90,
    enableCompression: false,
    enableMinification: false
  };
}
