import { PrismaClient, LogLevel } from "@prisma/client";

// التأكد من أننا في بيئة Node.js وليس المتصفح
if (typeof window !== 'undefined') {
  throw new Error('PrismaClient cannot be used in browser environment');
}

// استخدام global variable بطريقة أفضل
declare global {
  var __prisma: PrismaClient | undefined;
}

// إعدادات محسّنة لمنع connection pool timeout
const prismaOptions = {
  log: (process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error"]) as LogLevel[],
  errorFormat: "pretty" as const,
};

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient(prismaOptions);
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient(prismaOptions);
  }
  prisma = global.__prisma;
}

// متغير لتتبع حالة الاتصال
let isConnecting = false;
let connectionPromise: Promise<boolean> | null = null;

// دالة للتأكد من الاتصال - آمنة للاستدعاء المتكرر
export async function ensureDbConnected(): Promise<boolean> {
  // إذا كان هناك محاولة اتصال جارية، انتظرها
  if (isConnecting && connectionPromise) {
    return connectionPromise;
  }

  try {
    // اختبار سريع للاتصال
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.warn('⚠️ Database connection test failed, attempting to reconnect...');
    
    // إذا فشل الاختبار، حاول الاتصال
    if (!isConnecting) {
      isConnecting = true;
      connectionPromise = prisma.$connect()
        .then(() => {
          console.log('✅ Database reconnected successfully');
          isConnecting = false;
          connectionPromise = null;
          return true;
        })
        .catch((err) => {
          console.error('❌ Prisma $connect() failed:', err);
          isConnecting = false;
          connectionPromise = null;
          return false;
        });
    }
    
    return connectionPromise || false;
  }
}

// Helper لفحص أخطاء Prisma الشائعة
export function isPrismaNotConnectedError(e: unknown): boolean {
  return e instanceof Error && 
    (e.message?.includes('Engine is not yet connected') ||
     e.message?.includes('Cannot fetch data from service') ||
     e.message?.includes('Connection pool timeout') ||
     e.message?.includes('P1017')); // Connection pool error code
}

// Helper: فحص خطأ "Response from the Engine was empty"
export function isEngineEmptyResponseError(e: unknown): boolean {
  if (!(e instanceof Error)) return false;
  const msg = e.message?.toLowerCase?.() || '';
  return msg.includes('response from the engine was empty') || e.name === 'PrismaClientUnknownRequestError';
}

// إعادة بناء عميل Prisma عند تعطل المحرك
export async function resetPrismaClient(): Promise<void> {
  try {
    await prisma.$disconnect().catch(() => {});
  } catch {}
  // إعادة إنشاء العميل بنفس الخيارات
  prisma = new PrismaClient(prismaOptions);
  if (process.env.NODE_ENV !== 'production') {
    (global as any).__prisma = prisma;
  }
  try {
    await prisma.$connect();
    console.log('♻️ Prisma client has been reset and reconnected');
  } catch (e) {
    console.error('❌ Failed to reset Prisma client:', e);
  }
}

// دالة للمحاولة مع إعادة الاتصال التلقائي
export async function retryWithConnection<T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: unknown;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      // تأكد من الاتصال قبل كل محاولة
      const connected = await ensureDbConnected();
      if (!connected) {
        // محاولة إعادة الضبط ثم المحاولة مجدداً
        await resetPrismaClient();
      }
      
      return await operation();
    } catch (error) {
      lastError = error;
      
      if ((isPrismaNotConnectedError(error) || isEngineEmptyResponseError(error)) && i < maxRetries) {
        console.info(`🔄 Retrying after Prisma engine error (attempt ${i + 1}/${maxRetries + 1})...`);
        // إعادة بناء العميل ثم الانتظار قبل المحاولة التالية
        await resetPrismaClient();
        await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
        continue;
      }
      throw error;
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

// معالجة إغلاق الاتصال بشكل صحيح - فقط عند إيقاف التطبيق
if (process.env.NODE_ENV === "production") {
  process.on("beforeExit", async () => {
    console.log("🔌 Disconnecting Prisma...");
    await prisma.$disconnect();
  });

  process.on("SIGINT", async () => {
    console.log("🔌 Gracefully shutting down Prisma...");
    await prisma.$disconnect();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log("🔌 SIGTERM received, shutting down Prisma...");
    await prisma.$disconnect();
    process.exit(0);
  });
}

// دالة مساعدة للاستعلامات مع معالجة الأخطاء وإعادة المحاولة
export async function withPrisma<T>(operation: (prisma: PrismaClient) => Promise<T>): Promise<T> {
  try {
    return await retryWithConnection(() => operation(prisma));
  } catch (error: any) {
    console.error("🔴 Prisma operation failed:", error.message);
    throw error;
  }
}

// دالة آمنة للحصول على Prisma Client
export function getPrismaClient(): PrismaClient {
  if (typeof window !== 'undefined') {
    throw new Error('PrismaClient cannot be used in browser environment');
  }
  return prisma;
}

// التصدير - named export و default export (تجنّب إعادة تصدير الدوال المصدّرة مسبقاً)
export { prisma };

export default prisma;