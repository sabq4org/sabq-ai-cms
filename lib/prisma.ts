import { PrismaClient } from '@prisma/client'

// استخدام global variable بطريقة أفضل
declare global {
  var __prisma: PrismaClient | undefined
}

// تحسين إعدادات URL قاعدة البيانات
function enhanceDatabaseUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    
    // إعدادات connection pool محسنة لـ Supabase
    params.set('connection_limit', '10');
    params.set('pool_timeout', '20');
    params.set('connect_timeout', '30');
    params.set('pgbouncer', 'true');
    params.set('sslmode', 'require');
    
    urlObj.search = params.toString();
    return urlObj.toString();
  } catch (error) {
    console.error('❌ خطأ في تحسين DATABASE_URL:', error);
    return url;
  }
}

// إنشاء instance واحد فقط مع إعدادات محسّنة
const enhancedUrl = process.env.DATABASE_URL 
  ? enhanceDatabaseUrl(process.env.DATABASE_URL)
  : process.env.DATABASE_URL;

export const prisma = globalThis.__prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: enhancedUrl,
    },
  },
  errorFormat: 'pretty',
})

// Middleware لإعادة المحاولة التلقائية
prisma.$use(async (params, next) => {
  const maxRetries = 3;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      return await next(params);
    } catch (error: any) {
      retries++;
      
      // التحقق من أخطاء الاتصال
      if (
        error.code === 'P1001' || // Can't reach database
        error.code === 'P1002' || // Server terminated connection
        error.code === 'P2024' || // Timeout
        error.message?.includes('Engine is not yet connected')
      ) {
        if (retries < maxRetries) {
          console.log(`⚠️ إعادة محاولة ${retries}/${maxRetries} لـ ${params.model}.${params.action}`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          
          try {
            await prisma.$connect();
          } catch (connectError) {
            console.error('❌ فشل إعادة الاتصال:', connectError);
          }
          
          continue;
        }
      }
      
      throw error;
    }
  }
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

// محاولة الاتصال مباشرة مع إعادة المحاولة
if (process.env.NODE_ENV === 'development') {
  let connectAttempts = 0;
  const maxConnectAttempts = 3;
  
  const attemptConnection = async () => {
    try {
      await prisma.$connect();
      console.log('✅ Prisma connected successfully');
    } catch (e) {
      connectAttempts++;
      console.error(`❌ Prisma connection error (attempt ${connectAttempts}/${maxConnectAttempts}):`, e);
      
      if (connectAttempts < maxConnectAttempts) {
        setTimeout(attemptConnection, 2000 * connectAttempts);
      }
    }
  };
  
  attemptConnection();
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
