import { PrismaClient } from '@/lib/generated/prisma'

// استخدام global variable بطريقة أفضل
declare global {
  var __prisma: PrismaClient | undefined
}

// إنشاء instance واحد فقط
export const prisma = globalThis.__prisma ?? new PrismaClient({
  log: ['error'],
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
