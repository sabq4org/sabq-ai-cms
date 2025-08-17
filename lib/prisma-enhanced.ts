import { PrismaClient } from '@prisma/client'

// تحسين إعدادات URL قاعدة البيانات
function enhanceDatabaseUrl(url: string): string {
  const urlObj = new URL(url);
  
  // إضافة معاملات connection pool محسنة
  const params = new URLSearchParams(urlObj.search);
  
  // إعدادات أساسية
  params.set('connection_limit', '10'); // عدد الاتصالات المتزامنة
  params.set('pool_timeout', '20'); // وقت انتظار الاتصال (20 ثانية)
  params.set('connect_timeout', '30'); // وقت انتظار الاتصال الأول (30 ثانية)
  params.set('socket_timeout', '60'); // وقت انتظار socket (60 ثانية)
  params.set('statement_timeout', '60000'); // وقت انتظار الاستعلام (60 ثانية)
  
  // إعدادات pgbouncer (إذا كان يستخدم)
  params.set('pgbouncer', 'true');
  params.set('sslmode', 'require'); // SSL مطلوب لـ Supabase
  
  urlObj.search = params.toString();
  return urlObj.toString();
}

// إنشاء Prisma client محسن
const enhancedDatabaseUrl = process.env.DATABASE_URL 
  ? enhanceDatabaseUrl(process.env.DATABASE_URL)
  : undefined;

export const prismaEnhanced = new PrismaClient({
  datasources: {
    db: {
      url: enhancedDatabaseUrl,
    },
  },
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn']
    : ['error'],
  errorFormat: 'pretty',
});

// Middleware لإعادة المحاولة
prismaEnhanced.$use(async (params, next) => {
  const maxRetries = 3;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const result = await next(params);
      return result;
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
          
          // انتظار قبل إعادة المحاولة
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          
          // محاولة إعادة الاتصال
          try {
            await prismaEnhanced.$connect();
          } catch (connectError) {
            console.error('❌ فشل إعادة الاتصال:', connectError);
          }
          
          continue;
        }
      }
      
      throw error;
    }
  }
  
  throw new Error(`فشلت جميع المحاولات لـ ${params.model}.${params.action}`);
});

// دالة للتحقق من الاتصال
export async function checkConnection(): Promise<boolean> {
  try {
    await prismaEnhanced.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('❌ فشل فحص الاتصال:', error);
    return false;
  }
}

// دالة لإعادة تشغيل الاتصال
export async function reconnect(): Promise<void> {
  try {
    console.log('🔄 إعادة تشغيل الاتصال...');
    await prismaEnhanced.$disconnect();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await prismaEnhanced.$connect();
    console.log('✅ تم إعادة الاتصال بنجاح');
  } catch (error) {
    console.error('❌ فشل إعادة تشغيل الاتصال:', error);
    throw error;
  }
}

// مراقب صحة الاتصال
let healthCheckInterval: NodeJS.Timeout | null = null;

export function startHealthCheck() {
  if (healthCheckInterval) return;
  
  healthCheckInterval = setInterval(async () => {
    const isConnected = await checkConnection();
    if (!isConnected) {
      console.log('⚠️ اكتشاف انقطاع الاتصال - محاولة إعادة الاتصال...');
      try {
        await reconnect();
      } catch (error) {
        console.error('❌ فشل إعادة الاتصال التلقائي');
      }
    }
  }, 30000); // كل 30 ثانية
}

export function stopHealthCheck() {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
  }
}

// بدء المراقبة في بيئة التطوير
if (process.env.NODE_ENV === 'development') {
  startHealthCheck();
}

// تنظيف عند إيقاف العملية
process.on('beforeExit', async () => {
  console.log('🔄 إغلاق اتصال قاعدة البيانات...');
  stopHealthCheck();
  await prismaEnhanced.$disconnect();
});

export default prismaEnhanced;
