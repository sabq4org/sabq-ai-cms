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

// معالجة أفضل للاتصال
async function connectPrisma() {
  try {
    await prisma.$connect();
    console.log("✅ Prisma connected successfully.");
  } catch (error) {
    console.error("🔴 Failed to connect to Prisma:", error);
    // In case of a connection error, we might want to exit the process
    // to allow for a restart by the environment manager (like Docker or PM2).
    process.exit(1);
  }
}

connectPrisma();


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
export { prisma };
export default prisma;
