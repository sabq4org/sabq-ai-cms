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

// دالة للمحاولة مع إعادة الاتصال التلقائي
export async function retryWithConnection<T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: unknown;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      // تأكد من الاتصال قبل كل محاولة
      if (i > 0) {
        const connected = await ensureDbConnected();
        if (!connected) {
          throw new Error('Failed to establish database connection');
        }
      }
      
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (isPrismaNotConnectedError(error) && i < maxRetries) {
        console.info(`🔄 Retrying after connection error (attempt ${i + 1}/${maxRetries + 1})...`);
        
        // انتظار قصير قبل المحاولة التالية
        await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
        continue;
      } else {
        throw error;
      }
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

// التصدير - named export و default export
export { 
  prisma,
  ensureDbConnected,
  isPrismaNotConnectedError,
  retryWithConnection,
  withPrisma,
  getPrismaClient
};

// التصدير الصريح للدوال التي يبحث عنها البناء
export { ensureDbConnected, isPrismaNotConnectedError, retryWithConnection };

export default prisma;