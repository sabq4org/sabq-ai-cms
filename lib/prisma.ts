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
  log: (process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]) as LogLevel[],
  errorFormat: "pretty" as const,
};

// إنشاء instance واحد فقط مع إعدادات محسّنة
const prisma =
  globalThis.__prisma ??
  new PrismaClient(prismaOptions);

// معالجة أفضل للاتصال
async function initConnection(client: PrismaClient) {
  try {
    await client.$connect();
    console.log("✅ Prisma connected successfully");
  } catch (e: any) {
    console.warn("⚠️ Prisma connection warning:", e.message);
    // تجاهل؛ سيتم إعادة المحاولة عند أول استعلام
  }
}

// معالجة إغلاق الاتصال بشكل صحيح
process.on("beforeExit", async () => {
  console.log("🔌 Disconnecting Prisma...");
  await prisma.$disconnect();
});

process.on("SIGINT", async () => {
  console.log("🔌 Gracefully shutting down Prisma...");
  await prisma.$disconnect();
  process.exit(0);
});

if (process.env.NODE_ENV === "production") {
  // تشغيل اتصال مبكر في الإنتاج
  initConnection(prisma).catch(console.error);
}

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}

// دالة مساعدة للاستعلامات مع معالجة الأخطاء
export async function withPrisma<T>(operation: (prisma: PrismaClient) => Promise<T>): Promise<T> {
  try {
    return await operation(prisma);
  } catch (error: any) {
    console.error("🔴 Prisma operation failed:", error.message);
    throw error;
  }
}

// دالة آمنة للحصول على Prisma Client (للاستخدام في جميع أنحاء التطبيق)
function getPrismaClient(): PrismaClient {
  if (typeof window !== 'undefined') {
    throw new Error('PrismaClient cannot be used in browser environment');
  }
  return prisma;
}

// التصدير - named export و default export
export { prisma, getPrismaClient };
export default prisma;
