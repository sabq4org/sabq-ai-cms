/**
 * إعدادات خاصة للإنتاج لتجاوز المشاكل
 */

export const PRODUCTION_CONFIG = {
  // تعطيل المكونات التي تسبب مشاكل في الإنتاج
  DISABLE_COMPONENTS: [
    "TodayOpinionsSection",
    "SmartAudioBlock",
    "MuqtarabBlock",
    "FeaturedNewsCarousel",
  ],

  // استخدام نسخ مبسطة في الإنتاج
  USE_SIMPLIFIED_COMPONENTS: true,

  // تعطيل التحميل الديناميكي في الإنتاج
  DISABLE_DYNAMIC_IMPORTS: false,

  // عدد المحاولات لتحميل المكونات
  MAX_LOAD_ATTEMPTS: 3,

  // تأخير بين المحاولات (ms)
  RETRY_DELAY: 1000,

  // استخدام fallbacks فورية بدون انتظار
  IMMEDIATE_FALLBACK: true,
};

/**
 * فحص إذا كنا في بيئة الإنتاج
 */
export function isProduction(): boolean {
  if (typeof window === "undefined") {
    return process.env.NODE_ENV === "production";
  }

  // في المتصفح
  return (
    window.location.hostname !== "localhost" &&
    !window.location.hostname.includes("127.0.0.1") &&
    !window.location.hostname.includes("192.168.")
  );
}

/**
 * فحص إذا كان المكون معطل في الإنتاج
 */
export function isComponentDisabled(componentName: string): boolean {
  if (!isProduction()) return false;

  return PRODUCTION_CONFIG.DISABLE_COMPONENTS.includes(componentName);
}

/**
 * الحصول على مكون آمن للإنتاج
 */
export function getSafeProductionComponent(
  componentName: string
): React.ComponentType<any> | null {
  if (isComponentDisabled(componentName)) {
    console.log(`⚠️ Component ${componentName} is disabled in production`);
    return null;
  }

  // إرجاع مكون فارغ آمن
  return () => null;
}
