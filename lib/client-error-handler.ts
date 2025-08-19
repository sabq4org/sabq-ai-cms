/**
 * ملف معالج الأخطاء آمن للعميل (المتصفح)
 * بدون استيراد Prisma - يحل React Error #130 و Prisma browser errors
 */

export interface SafeErrorHandler {
  log: (message: string, error?: any) => void;
  warn: (message: string, error?: any) => void;
  error: (message: string, error?: any) => void;
}

// معالج آمن يعمل في البراوزر وخادم
export const createSafeErrorHandler = (): SafeErrorHandler => {
  const isServer = typeof window === 'undefined';
  
  return {
    log: (message: string, error?: any) => {
      if (isServer) {
        console.log(`[SERVER] ${message}`, error || '');
      } else {
        console.log(`[CLIENT] ${message}`, error || '');
      }
    },
    
    warn: (message: string, error?: any) => {
      if (isServer) {
        console.warn(`[SERVER] ⚠️ ${message}`, error || '');
      } else {
        console.warn(`[CLIENT] ⚠️ ${message}`, error || '');
      }
    },
    
    error: (message: string, error?: any) => {
      if (isServer) {
        console.error(`[SERVER] ❌ ${message}`, error || '');
      } else {
        console.error(`[CLIENT] ❌ ${message}`, error || '');
        
        // في البراوزر، أرسل للتتبع
        try {
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'exception', {
              description: message,
              fatal: false
            });
          }
        } catch (e) {
          // تجاهل أخطاء التتبع
        }
      }
    }
  };
};

// instance عالمي
export const safeErrorHandler = createSafeErrorHandler();

// معالج خاص للمكونات React
export const handleReactError = (error: Error, errorInfo: any) => {
  safeErrorHandler.error('React Component Error:', { error: error.message, errorInfo });
  
  // تجنب أخطاء React Error #130
  if (error.message.includes('Minified React error #130')) {
    safeErrorHandler.warn('React Error #130 detected - likely hydration mismatch');
    return;
  }
  
  // معالجة أخطاء Prisma في البراوزر
  if (error.message.includes('PrismaClient is unable to run in this browser environment')) {
    safeErrorHandler.error('Prisma Client accessed in browser - this should not happen');
    return;
  }
};

// معالج خاص لطلبات API الفاشلة
export const handleAPIError = (endpoint: string, error: any) => {
  const message = error?.message || 'Unknown API error';
  
  safeErrorHandler.error(`API Error at ${endpoint}:`, message);
  
  // معالجة أخطاء المصادقة
  if (error?.status === 401) {
    safeErrorHandler.warn('Authentication failed - user may need to login again');
  }
  
  // معالجة أخطاء الشبكة
  if (error?.code === 'NETWORK_ERROR') {
    safeErrorHandler.warn('Network error - user may be offline');
  }
};

/**
 * التحقق من وجود خطأ اتصال بناءً على الرسالة فقط
 */
export function isConnectionError(error: any): boolean {
  if (!error || !error.message) return false;
  
  const connectionErrorMessages = [
    "Connection",
    "Network",
    "Timeout",
    "Can't reach",
    "refused",
    "failed",
    "P1001",
    "P1002"
  ];

  return connectionErrorMessages.some(msg => 
    error.message.toLowerCase().includes(msg.toLowerCase())
  );
}

/**
 * تسجيل الأخطاء بطريقة آمنة للعميل
 */
export function logClientError(error: any, context: string = "عام"): void {
  console.error(`❌ خطأ العميل (${context}):`, error);
}

/**
 * توليد رسالة خطأ مناسبة للمستخدم
 */
export function getClientFriendlyErrorMessage(error: any): string {
  if (isConnectionError(error)) {
    return "عذراً، لا يمكن الاتصال بالخادم حالياً. يرجى المحاولة مرة أخرى لاحقاً.";
  }

  if (error && error.message) {
    // رسائل خطأ شائعة
    if (error.message.includes("404")) {
      return "لم يتم العثور على المعلومات المطلوبة.";
    }
    if (error.message.includes("500")) {
      return "حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.";
    }
    if (error.message.includes("401") || error.message.includes("Unauthorized")) {
      return "يجب تسجيل الدخول للوصول لهذه المعلومات.";
    }
  }

  return "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى لاحقاً.";
}
