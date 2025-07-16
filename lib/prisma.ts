import { PrismaClient } from '@/lib/generated/prisma'

declare global {
  var prisma: PrismaClient | undefined
}

// تحسين إعدادات الاتصال
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['error', 'warn'] 
      : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // تحسينات الأداء
    errorFormat: 'minimal',
  })
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

// تكوين connection pool محسّن
if (process.env.DATABASE_URL) {
  // تنظيف قيمة DATABASE_URL من أي أجزاء إضافية
  let cleanUrl = process.env.DATABASE_URL;
  if (cleanUrl && cleanUrl.includes('=')) {
    cleanUrl = cleanUrl.split('=')[1].replace(/"/g, '');
  }

  // التأكد من أن cleanUrl صحيح قبل إنشاء URL
  if (cleanUrl && cleanUrl.startsWith('postgresql://')) {
    try {
      const url = new URL(cleanUrl);
      
      // إضافة معاملات تحسين الأداء
      url.searchParams.set('connection_limit', '10')
      url.searchParams.set('pool_timeout', '20')
      url.searchParams.set('statement_cache_size', '100')
      url.searchParams.set('pgbouncer', 'true')
      
      process.env.DATABASE_URL = url.toString()
    } catch (error) {
      console.warn('خطأ في معالجة DATABASE_URL:', error);
      // استخدام القيمة الأصلية إذا فشل التحليل
    }
  }
}

export default prisma
