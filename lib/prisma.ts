import { PrismaClient } from '../lib/generated/prisma';

// ضمان عدم إنشاء عدة اتصالات في بيئة التطوير
declare global {
  var prisma: PrismaClient | undefined;
}

// تحسين إدارة الاتصال ومعالجة الأخطاء
const createPrismaClient = () => {
  console.log('🔧 إنشاء Prisma Client جديد...');

  const client = new PrismaClient({
    log: ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
  
  return client;
};

let prismaInstance: PrismaClient;

// استخدام نمط singleton مع تحسين معالجة الاتصال
if (process.env.NODE_ENV === 'production') {
  // في بيئة الإنتاج، إنشاء نسخة جديدة دائمًا
  prismaInstance = createPrismaClient();
} else {
  // في بيئة التطوير، استخدام global لتجنب إنشاء عدة اتصالات
  if (!global.prisma) {
    global.prisma = createPrismaClient();

    // مؤشر لحالة الاتصال في كائن منفصل
    const prismaConnectionStatus = { isConnected: false };
    (global as any).prismaConnectionStatus = prismaConnectionStatus;
    
    // محاولة الاتصال عند الإنشاء
    global.prisma.$connect()
      .then(() => {
        console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
        (global as any).prismaConnectionStatus.isConnected = true;
      })
      .catch((error: Error) => {
        console.error('❌ خطأ في الاتصال بقاعدة البيانات:', error);
      });
  }
  
  // استخدام النسخة المخزنة
  prismaInstance = global.prisma;
}

// تنظيف الاتصالات عند إغلاق التطبيق
['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, async () => {
    console.log(`🔌 إغلاق اتصال قاعدة البيانات (${signal})...`);
    await prismaInstance?.$disconnect().catch(console.error);
  });
});

// تصدير النسخة للاستخدام في التطبيق
export const prisma = prismaInstance;

/**
 * دالة محسّنة للتحقق من الاتصال بقاعدة البيانات
 * تستخدم استراتيجية أكثر مرونة مع إمكانية الإعادة وإدارة الخطأ
 */
export async function ensureConnection(retry = 2): Promise<boolean> {
  try {
    // التحقق من متغير البيئة
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL غير محدد');
      return false;
    }

    // إذا كان الاتصال يعمل بالفعل، لا داعي لإعادة الاتصال
    if ((global as any).prismaConnectionStatus?.isConnected) {
      return true;
    }

    // وضع مهلة زمنية لمنع الانتظار إلى ما لا نهاية
    const timeout = new Promise<boolean>((_, reject) => {
      setTimeout(() => reject(new Error('مهلة الاتصال انتهت')), 5000);
    });

    // استراتيجية الاتصال
    const connectWithRetry = async (attemptsLeft: number): Promise<boolean> => {
      try {
        // محاولة الاتصال
        await prisma.$connect();
        
        // اختبار الاتصال بعملية استعلام بسيطة
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        
        // تحديث حالة الاتصال
        (global as any).prismaConnectionStatus = { isConnected: true };
        
        return true;
      } catch (connectionError) {
        if (attemptsLeft > 0) {
          console.log(`🔄 محاولة إعادة الاتصال... (${attemptsLeft} محاولات متبقية)`);
          
          try {
            // محاولة فصل الاتصال الحالي
            await prisma.$disconnect();
          } catch (disconnectError) {
            // تجاهل أخطاء الفصل
          }
          
          // انتظار قبل المحاولة التالية
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          return connectWithRetry(attemptsLeft - 1);
        } else {
          throw connectionError;
        }
      }
    };

    // تنفيذ الاتصال مع مهلة
    const result = await Promise.race([
      connectWithRetry(retry),
      timeout
    ]);
    
    return result;
  } catch (error) {
    console.error('❌ خطأ نهائي في الاتصال بقاعدة البيانات:', error);
    return false;
  }
}
