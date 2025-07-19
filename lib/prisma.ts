import { PrismaClient } from '@/lib/generated/prisma'

declare global {
  var prisma: PrismaClient | undefined
}

// إنشاء Prisma Client مع إعدادات محسنة
const prismaClientSingleton = () => {
  console.log('🔄 إنشاء Prisma Client جديد...')
  
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['error', 'warn'] 
      : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    errorFormat: 'minimal',
  })

  // لا نتصل بقاعدة البيانات عند الإنشاء
  // console.log('🔗 محاولة الاتصال بقاعدة البيانات...')
  
  return client
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

// دالة للاتصال المتزامن
async function connectDatabase() {
  try {
    await prisma.$connect()
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح')
    return true
  } catch (error) {
    console.error('❌ فشل الاتصال بقاعدة البيانات:', error)
    return false
  }
}

// helper function للتحقق من حالة الاتصال مع إعادة المحاولة
export async function ensureConnection() {
  try {
    // اختبار الاتصال بعملية بسيطة
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.log('🔄 محاولة إعادة الاتصال...')
    return await connectDatabase()
  }
}

// لا نتصل تلقائياً عند تحميل الملف
// هذا يسبب مشاكل في البناء
// connectDatabase()

export { prisma }
