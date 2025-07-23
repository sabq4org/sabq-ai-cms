import { PrismaClient } from '@/lib/generated/prisma'
import { runStartupChecks } from './startup-checks'

declare global {
  var prisma: PrismaClient | undefined
}

// إنشاء Prisma Client مع إعدادات محسنة
const prismaClientSingleton = () => {
  console.log('🔄 إنشاء Prisma Client جديد...')
  
  // فحص المتغيرات قبل إنشاء العميل
  const checksPass = runStartupChecks()
  if (!checksPass) {
    console.warn('⚠️ بعض الفحوصات فشلت، قد تواجه مشاكل')
  }
  
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
    // إضافة timeout settings لتحسين الأداء
    transactionOptions: {
      timeout: 10000, // 10 seconds
      maxWait: 5000,  // 5 seconds
    },
  })

  // معالجة إغلاق الاتصال عند إيقاف التطبيق
  if (typeof window === 'undefined') {
    process.on('beforeExit', async () => {
      console.log('🔌 إغلاق اتصال قاعدة البيانات...')
      await client.$disconnect()
    })
  }
  
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
    // التحقق من متغير البيئة
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL غير محدد')
      return false
    }

    // محاولة اتصال أولية
    await prisma.$connect()
    
    // اختبار الاتصال بعملية بسيطة
    await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ تم التحقق من اتصال قاعدة البيانات')
    return true
  } catch (error) {
    console.log('🔄 محاولة إعادة الاتصال...', error)
    try {
      // إغلاق الاتصال الحالي
      await prisma.$disconnect()
      
      // محاولة اتصال جديد
      await prisma.$connect()
      
      // اختبار مرة أخرى
      await prisma.$queryRaw`SELECT 1 as test`
      console.log('✅ نجح إعادة الاتصال')
      return true
    } catch (retryError) {
      console.error('❌ فشل في إعادة الاتصال:', retryError)
      return false
    }
  }
}

// لا نتصل تلقائياً عند تحميل الملف
// هذا يسبب مشاكل في البناء
// connectDatabase()

export { prisma }
