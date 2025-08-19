/**
 * ملف معالج الأخطاء آمن للعميل (المتصفح)
 * بدون استيراد Prisma
 */

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
