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

  // الاتصال التلقائي عند الإنشاء
  client.$connect()
    .then(() => console.log('✅ تم الاتصال بقاعدة البيانات'))
    .catch((error) => console.error('❌ فشل الاتصال الأولي:', error))

  return client
}

// التأكد من إنشاء instance واحد فقط
const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

// helper function للتحقق من حالة الاتصال مع إعادة المحاولة
export async function ensureConnection() {
  try {
    // اختبار الاتصال بعملية بسيطة
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.log('🔄 محاولة إعادة الاتصال...')
    try {
      await prisma.$connect()
      return true
    } catch (connectError) {
      console.error('❌ فشل إعادة الاتصال:', connectError)
      return false
    }
  }
}

// helper function للتحقق من حالة الاتصال
export async function checkDatabaseConnection() {
  try {
    await prisma.$connect()
    console.log('✅ نجح الاتصال بقاعدة البيانات')
    return true
  } catch (error) {
    console.error('❌ فشل الاتصال بقاعدة البيانات:', error)
    return false
  }
}

// helper function لإعادة الاتصال
export async function reconnectDatabase() {
  try {
    await prisma.$disconnect()
    await prisma.$connect()
    console.log('🔄 تم إعادة الاتصال بقاعدة البيانات بنجاح')
    return true
  } catch (error) {
    console.error('❌ فشل إعادة الاتصال:', error)
    return false
  }
}

export { prisma }
