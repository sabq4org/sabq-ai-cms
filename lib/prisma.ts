import { PrismaClient } from '@prisma/client'

// استخدام global variable بطريقة أفضل
declare global {
  var __prisma: PrismaClient | undefined
}

// إنشاء instance واحد فقط
export const prisma = globalThis.__prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error'] : [],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

// دالة اتصال محسنة
export async function ensureConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('❌ فشل الاتصال:', error)
    return false
  }
}

// التصدير الافتراضي للتوافق
export default prisma;
