import { PrismaClient } from './generated/prisma'

// تجنب إنشاء عدة نسخ من PrismaClient في بيئة التطوير
// https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#prevent-hot-reloading-from-creating-new-database-connections

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// وظائف مساعدة للتعامل مع قاعدة البيانات
export async function checkDatabaseConnection() {
  try {
    await prisma.$connect()
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح')
    return true
  } catch (error) {
    console.error('❌ فشل الاتصال بقاعدة البيانات:', error)
    return false
  }
}

// تنظيف الاتصالات عند إيقاف التطبيق
export async function disconnectDatabase() {
  await prisma.$disconnect()
}

// دالة مساعدة للتعامل مع الأخطاء
export function handlePrismaError(error: any) {
  if (error.code === 'P2002') {
    return 'البيانات المُدخلة موجودة مسبقاً'
  }
  if (error.code === 'P2025') {
    return 'السجل المطلوب غير موجود'
  }
  if (error.code === 'P2003') {
    return 'خطأ في العلاقة - تأكد من وجود السجل المرتبط'
  }
  
  console.error('Prisma Error:', error)
  return 'حدث خطأ في قاعدة البيانات'
} 