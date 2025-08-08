import { PrismaClient } from "@prisma/client";

// استخدام global variable بطريقة أفضل
declare global {
  var __prisma: PrismaClient | undefined;
}

// إنشاء instance واحد فقط مع إعدادات محسّنة
const prisma =
  globalThis.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    errorFormat: "pretty",
  });

// محاولة اتصال مبكرة في بيئة الإنتاج لمنع "Engine is not yet connected"
async function initConnection(client: PrismaClient) {
  try {
    await client.$connect();
  } catch (e) {
    // تجاهل؛ سيتم إعادة المحاولة عند أول استعلام مع أدوات إعادة المحاولة إن وُجدت
  }
}

if (process.env.NODE_ENV === "production") {
  // fire-and-forget
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  initConnection(prisma);
}

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}

// التصدير
export { prisma };
export default prisma;
