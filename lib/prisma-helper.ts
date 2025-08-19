import { PrismaClient } from "@prisma/client";
import prisma from "./prisma";

// معالج اتصال محسّن مع إعادة محاولة
export async function ensurePrismaConnection(client: PrismaClient = prisma, retries = 3): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      // محاولة استعلام بسيط للتأكد من الاتصال
      await client.$queryRaw`SELECT 1`;
      return; // نجح الاتصال
    } catch (error: any) {
      console.log(`محاولة الاتصال ${i + 1}/${retries}...`);
      
      if (error.message?.includes("Engine is not yet connected")) {
        // محاولة إعادة الاتصال
        try {
          await client.$connect();
          await new Promise(resolve => setTimeout(resolve, 100 * (i + 1))); // تأخير متزايد
          continue;
        } catch (connectError) {
          console.error("فشل الاتصال:", connectError);
        }
      }
      
      if (i === retries - 1) {
        throw error; // آخر محاولة فاشلة
      }
    }
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
      // تأكد من الاتصال قبل العملية
      if (attempt > 0) {
        await ensurePrismaConnection(prisma, 1);
      }
      
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // إذا كان خطأ اتصال، انتظر قبل إعادة المحاولة
      if (error.message?.includes("Engine is not yet connected") ||
          error.message?.includes("ECONNREFUSED") ||
          error.code === "P1001") {
        console.log(`إعادة محاولة العملية (${attempt + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }
      
      // للأخطاء الأخرى، ارمي الخطأ مباشرة
      throw error;
    }
  }
  
  throw lastError;
}
