/**
 * Prisma helper functions - مُصدَّرة بشكل منفصل لتجنب مشاكل البناء
 */

import { PrismaClient } from "@prisma/client";
import prisma from "./prisma";

/**
 * التأكد من الاتصال بقاعدة البيانات
 */
export async function ensureDbConnected(): Promise<boolean> {
  try {
    // $connect() is idempotent - safe to call multiple times
    await prisma.$connect();
    return true;
  } catch (err) {
    console.error('❌ Prisma $connect() failed:', err);
    return false;
  }
}

/**
 * فحص أخطاء Prisma الشائعة
 */
export function isPrismaNotConnectedError(e: unknown): boolean {
  return e instanceof Error && 
    (e.message?.includes('Engine is not yet connected') ||
     e.message?.includes('Cannot fetch data from service') ||
     e.message?.includes('Connection pool timeout') ||
     e.message?.includes('P1017')); // Connection pool error code
}

/**
 * إعادة المحاولة مع إعادة الاتصال
 */
export async function retryWithConnection<T>(
  operation: () => Promise<T>,
  maxRetries = 2
): Promise<T> {
  let lastError: unknown;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (isPrismaNotConnectedError(error) && i < maxRetries) {
        console.log(`🔄 Retrying after connection error (attempt ${i + 1}/${maxRetries})...`);
        const connected = await ensureDbConnected();
        if (!connected) {
          throw error;
        }
        // Continue to next iteration
      } else {
        throw error;
      }
    }
  }
  
  throw lastError;
}

/**
 * تنفيذ عملية مع معالجة الأخطاء
 */
export async function withPrisma<T>(operation: (prisma: PrismaClient) => Promise<T>): Promise<T> {
  try {
    return await retryWithConnection(() => operation(prisma));
  } catch (error: any) {
    console.error("🔴 Prisma operation failed:", error.message);
    throw error;
  }
}
