import { PrismaClient } from '../lib/generated/prisma';

declare global {
  var prisma: PrismaClient | undefined;
}

if (!global.prisma) {
  global.prisma = new PrismaClient({
    log: ['error'],
  });

  // تأكد من الاتصال عند بدء التطبيق
  global.prisma.$connect()
    .then(() => console.log('✅ تم الاتصال بقاعدة البيانات بنجاح'))
    .catch((error: Error) => console.error('❌ خطأ في الاتصال بقاعدة البيانات:', error));

  // تنظيف الاتصال عند إغلاق التطبيق
  process.on('beforeExit', async () => {
    await global.prisma?.$disconnect();
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
