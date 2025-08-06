/**
 * ملف مساعد للتعامل مع أخطاء Prisma
 */

export enum PrismaErrorCodes {
  CONNECTION_ERROR = "P1001", // Cannot reach database server
  CONNECTION_TIMEOUT = "P1002", // The connection pool timed out
  DATABASE_ALREADY_EXISTS = "P1003", // Database already exists
  DATABASE_NOT_FOUND = "P1004", // Database does not exist
  AUTHENTICATION_FAILED = "P1010", // User authentication failed
  FOREIGN_KEY_CONSTRAINT = "P2003", // Foreign key constraint failed
  UNIQUE_CONSTRAINT = "P2002", // Unique constraint failed
  NOT_FOUND = "P2001", // Record does not exist
  REQUIRED_FIELD = "P2012", // Missing required value
}

/**
 * التحقق مما إذا كان الخطأ متعلق بالاتصال بقاعدة البيانات
 */
export function isPrismaConnectionError(error: any): boolean {
  // التحقق من رسائل الخطأ المعروفة لمشاكل الاتصال
  const connectionErrorMessages = [
    "Engine is not yet connected",
    "Can't reach database server",
    "P1001",
    "P1002",
    "Connection timed out",
    "Connection refused",
    "Database connection failed",
    "Invalid `prisma.$query",
  ];

  if (error && error.message) {
    return connectionErrorMessages.some((msg) => error.message.includes(msg));
  }

  // التحقق من وجود رمز خطأ معروف
  if (error && error.code) {
    return [
      PrismaErrorCodes.CONNECTION_ERROR,
      PrismaErrorCodes.CONNECTION_TIMEOUT,
    ].includes(error.code);
  }

  return false;
}

/**
 * وظيفة عامة للتعامل مع أخطاء Prisma وتسجيلها
 */
export function handlePrismaError(error: any, context: string = "عام"): void {
  console.error(`❌ خطأ Prisma (${context}):`, error);

  if (isPrismaConnectionError(error)) {
    console.error(`🚨 خطأ في الاتصال بقاعدة البيانات (${context})`);
    // يمكن هنا إضافة إرسال إشعارات أو تسجيل الأخطاء في نظام مراقبة
  }
}

/**
 * وظيفة مساعدة لتوليد رسالة خطأ مناسبة للمستخدم
 */
export function getUserFriendlyErrorMessage(error: any): string {
  if (isPrismaConnectionError(error)) {
    return "عذراً، لا يمكن الاتصال بقاعدة البيانات حالياً. يرجى المحاولة مرة أخرى لاحقاً.";
  }

  if (error && error.code) {
    switch (error.code) {
      case PrismaErrorCodes.NOT_FOUND:
        return "لم يتم العثور على المعلومات المطلوبة.";
      case PrismaErrorCodes.UNIQUE_CONSTRAINT:
        return "هذه المعلومات موجودة بالفعل.";
      case PrismaErrorCodes.REQUIRED_FIELD:
        return "بعض المعلومات المطلوبة غير موجودة.";
      default:
        return "حدث خطأ أثناء معالجة طلبك.";
    }
  }

  return "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى لاحقاً.";
}
