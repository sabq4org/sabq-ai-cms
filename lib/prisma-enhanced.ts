import { PrismaClient } from '@/lib/generated/prisma'
import { runStartupChecks } from './startup-checks'

declare global {
  var prisma: PrismaClient | undefined
  var prismaConnectionAttempts: number
}

// متابعة محاولات الاتصال
if (typeof global.prismaConnectionAttempts === 'undefined') {
  global.prismaConnectionAttempts = 0
}

// إنشاء Prisma Client مع إعدادات محسنة للإنتاج
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

// دالة للاتصال المتزامن مع إعادة المحاولة
async function connectDatabase() {
  let attempts = 0
  const maxAttempts = 3
  
  while (attempts < maxAttempts) {
    try {
      console.log(`🔗 محاولة الاتصال بقاعدة البيانات (${attempts + 1}/${maxAttempts})...`)
      await prisma.$connect()
      console.log('✅ تم الاتصال بقاعدة البيانات بنجاح')
      global.prismaConnectionAttempts = 0
      return true
    } catch (error) {
      attempts++
      global.prismaConnectionAttempts = attempts
      console.error(`❌ فشل الاتصال محاولة ${attempts}:`, error)
      
      if (attempts < maxAttempts) {
        console.log(`⏳ انتظار 2 ثانية قبل إعادة المحاولة...`)
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
  }
  
  return false
}

// helper function للتحقق من حالة الاتصال مع إعادة المحاولة محسنة
export async function ensureConnection(): Promise<boolean> {
  try {
    // التحقق من متغير البيئة
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL غير محدد')
      return false
    }

    // محاولة سريعة للتحقق من الاتصال
    try {
      await prisma.$queryRaw`SELECT 1 as test`
      console.log('✅ تم التحقق من اتصال قاعدة البيانات')
      return true
    } catch (quickTestError: any) {
      console.log('🔄 محاولة إعادة الاتصال...', quickTestError?.message || 'خطأ غير معروف')
      
      // إعادة المحاولة مع connect
      return await connectDatabase()
    }
    
  } catch (error) {
    console.error('❌ فشل في إعادة الاتصال:', error)
    return false
  }
}

// دالة لإعادة تشغيل الاتصال في حالة الفشل
export async function reconnectPrisma(): Promise<boolean> {
  try {
    console.log('🔄 إعادة تشغيل اتصال Prisma...')
    await prisma.$disconnect()
    await new Promise(resolve => setTimeout(resolve, 1000)) // انتظار ثانية
    return await connectDatabase()
  } catch (error) {
    console.error('❌ فشل في إعادة تشغيل الاتصال:', error)
    return false
  }
}

// دالة تشخيص الاتصال
export async function diagnosePrismaConnection() {
  console.log('🔍 تشخيص اتصال قاعدة البيانات...')
  
  const diagnosis = {
    databaseUrl: !!process.env.DATABASE_URL,
    databaseUrlLength: process.env.DATABASE_URL?.length || 0,
    connectionAttempts: global.prismaConnectionAttempts || 0,
    canConnect: false,
    lastError: null as any
  }
  
  try {
    await prisma.$queryRaw`SELECT 1 as test`
    diagnosis.canConnect = true
    console.log('✅ تشخيص: الاتصال يعمل بنجاح')
  } catch (error: any) {
    diagnosis.lastError = error?.message || String(error)
    console.error('❌ تشخيص: فشل الاتصال -', error?.message || String(error))
  }
  
  return diagnosis
}

export { prisma }
