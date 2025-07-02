import { PrismaClient } from './generated/prisma';
import { logEnvironment, logDatabaseConnection, getEnvironmentConfig } from './debug';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
};

// الحصول على تكوين البيئة
const envConfig = getEnvironmentConfig();

// تسجيل معلومات البيئة للتشخيص
if (envConfig.debug) {
  logEnvironment();
}

// تكوين Prisma بناءً على البيئة
const prismaOptions: any = {
  log: envConfig.isDevelopment ? ['query', 'error', 'warn'] : ['error'],
};

// التأكد من وجود رابط قاعدة البيانات
if (!process.env.DATABASE_URL) {
  console.error('[Prisma] ❌ خطأ: DATABASE_URL غير محدد!');
  throw new Error('DATABASE_URL is required');
}

// تكوين مصدر البيانات
prismaOptions.datasources = {
  db: {
    url: process.env.DATABASE_URL,
  },
};

// إنشاء عميل Prisma
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(prismaOptions);

// حفظ المثيل في البيئة التطويرية فقط
if (!envConfig.isProduction) {
  globalForPrisma.prisma = prisma;
}

// اختبار الاتصال عند بدء التشغيل
if (envConfig.debug) {
  prisma.$connect()
    .then(() => logDatabaseConnection(true))
    .catch((error) => logDatabaseConnection(false, error));
}

export default prisma;
