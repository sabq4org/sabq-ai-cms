import { PrismaClient } from "@prisma/client";
import prisma from "./prisma";
import { checkDatabaseHealth } from "./prisma-production";

// معالج اتصال محسّن مع إعادة محاولة
let prismaConnectingPromise: Promise<void> | null = null;
export async function ensurePrismaConnection(client: PrismaClient = prisma, retries = 3): Promise<void> {
  // منع اتصالات متوازية إلى المحرك
  if (prismaConnectingPromise) {
    await prismaConnectingPromise;
    return;
  }
  
  prismaConnectingPromise = (async () => {
    for (let i = 0; i < retries; i++) {
      try {
        await client.$queryRaw`SELECT 1`;
        return; // نجح الاتصال
      } catch (error: any) {
        if (error.message?.includes("Engine is not yet connected") || error.code === 'P1017') {
          try {
            await client.$connect();
            await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)));
            continue;
          } catch (connectError) {
            // لا نطبع بشدة، فقط نُمهل ونعيد المحاولة
          }
        }
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 200 * (i + 1)));
      }
    }
  })();
  try {
    await prismaConnectingPromise;
  } finally {
    prismaConnectingPromise = null;
  }
}

// wrapper آمن للاستعلامات مع إعادة محاولة الاتصال
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // فحص صحة الاتصال قبل العملية
      if (attempt > 0) {
        const health = await checkDatabaseHealth(prisma);
        if (!health.connected) {
          await ensurePrismaConnection(prisma, 2);
        }
      }
      
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // إذا كان خطأ اتصال، انتظر قبل إعادة المحاولة
      if (error.message?.includes("Engine is not yet connected") ||
          error.message?.includes("ECONNREFUSED") ||
          error.message?.includes("Connection terminated") ||
          error.code === "P1001" ||
          error.code === "P1017") {
        // إعادة محاولة هادئة
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        await ensurePrismaConnection(prisma, 2);
        continue;
      }
      
      // للأخطاء الأخرى، ارمي الخطأ مباشرة
      throw error;
    }
  }
  
  throw lastError;
}
