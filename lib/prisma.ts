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

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}

// التصدير
export { prisma };
export default prisma;
