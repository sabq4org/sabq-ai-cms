import { PrismaClient } from '../lib/generated/prisma';

declare global {
  var prisma: PrismaClient | undefined;
}

// دالة إنشاء Prisma Client جديد مع معالجة أخطاء محسنة
function createPrismaClient(): PrismaClient {
  console.log('🔧 إنشاء Prisma Client جديد...');
  
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // إضافة خيارات إضافية للاتصال
    errorFormat: 'pretty',
  });

  // محاولة الاتصال مع إعادة المحاولة
  const connectWithRetry = async (retries = 3): Promise<void> => {
    for (let i = 0; i < retries; i++) {
      try {
        await client.$connect();
        console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
        return;
      } catch (error) {
        console.error(`❌ محاولة الاتصال ${i + 1}/${retries} فشلت:`, error);
        if (i === retries - 1) {
          console.error('❌ فشل في جميع محاولات الاتصال');
          throw error;
        }
        // انتظار ثانية قبل إعادة المحاولة
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  // محاولة الاتصال
  connectWithRetry().catch((error: Error) => {
    console.error('❌ خطأ نهائي في الاتصال بقاعدة البيانات:', error);
  });

  return client;
}

// إنشاء أو إعادة استخدام Prisma Client
if (!global.prisma) {
  global.prisma = createPrismaClient();

  // تنظيف الاتصال عند إغلاق التطبيق
  process.on('beforeExit', async () => {
    console.log('🔌 إغلاق اتصال قاعدة البيانات...');
    await global.prisma?.$disconnect();
  });

  process.on('SIGINT', async () => {
    console.log('🔌 إغلاق اتصال قاعدة البيانات (SIGINT)...');
    await global.prisma?.$disconnect();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('🔌 إغلاق اتصال قاعدة البيانات (SIGTERM)...');
    await global.prisma?.$disconnect();
    process.exit(0);
  });
}

export const prisma = global.prisma;

// دالة للتحقق من الاتصال بقاعدة البيانات
export async function ensureConnection(): Promise<boolean> {
  try {
    // التحقق من متغير البيئة
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL غير محدد');
      return false;
    }

    // محاولة الاتصال
    await prisma.$connect();
    
    // اختبار الاتصال
    await prisma.$queryRaw`SELECT 1 as test`;
    
    return true;
  } catch (error) {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات:', error);
    return false;
  }
}
