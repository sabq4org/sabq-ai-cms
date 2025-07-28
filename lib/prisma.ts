import { PrismaClient } from '@prisma/client'

// إعدادات محسنة للإنتاج
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    // لا نحدد datasources يدوياً مع Prisma Accelerate
    // لأنها تستخدم DATABASE_URL تلقائياً بالطريقة الصحيحة
    
    // إعدادات timeout محسنة
    transactionOptions: {
      maxWait: 5000, // 5 ثواني
      timeout: 10000, // 10 ثواني
      isolationLevel: 'ReadCommitted',
    },
    errorFormat: 'minimal',
  })
}

// Global instance مع connection pooling
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  prismaPromise: Promise<PrismaClient> | undefined
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Keep-alive mechanism
let keepAliveInterval: NodeJS.Timeout | null = null

// بدء keep-alive queries
export function startKeepAlive() {
  if (keepAliveInterval) return
  
  keepAliveInterval = setInterval(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`
      console.log('✅ Keep-alive query تم بنجاح')
    } catch (error) {
      console.error('❌ Keep-alive query فشل:', error)
      // محاولة إعادة الاتصال
      try {
        await prisma.$disconnect()
        await prisma.$connect()
        console.log('✅ تم إعادة الاتصال بنجاح')
      } catch (reconnectError) {
        console.error('❌ فشل إعادة الاتصال:', reconnectError)
      }
    }
  }, 60000) // كل دقيقة
}

// إيقاف keep-alive
export function stopKeepAlive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval)
    keepAliveInterval = null
  }
}

// معالجة إغلاق الاتصال عند إيقاف التطبيق
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    stopKeepAlive()
    await prisma.$disconnect()
  })
  
  process.on('SIGINT', async () => {
    stopKeepAlive()
    await prisma.$disconnect()
    process.exit(0)
  })
  
  process.on('SIGTERM', async () => {
    stopKeepAlive()
    await prisma.$disconnect()
    process.exit(0)
  })
}

// بدء keep-alive في الإنتاج
if (process.env.NODE_ENV === 'production') {
  startKeepAlive()
}

// دالة مساعدة لتنفيذ queries مع retry
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      console.error(`❌ المحاولة ${attempt}/${maxRetries} فشلت:`, error)
      
      if (attempt < maxRetries) {
        // انتظار قبل المحاولة التالية
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
        
        // محاولة إعادة الاتصال
        try {
          await prisma.$disconnect()
          await prisma.$connect()
          console.log('✅ تم إعادة الاتصال للمحاولة التالية')
        } catch (reconnectError) {
          console.error('❌ فشل إعادة الاتصال:', reconnectError)
        }
      }
    }
  }
  
  throw lastError || new Error('فشلت جميع المحاولات')
}

// دالة للتأكد من الاتصال
export async function ensureConnection() {
  try {
    await prisma.$connect()
    return true
  } catch (error) {
    console.error('❌ فشل الاتصال بقاعدة البيانات:', error)
    return false
  }
}

// التصدير الافتراضي
export default prisma

// Named exports للتوافق مع جميع الملفات
export { 
  prisma
}
