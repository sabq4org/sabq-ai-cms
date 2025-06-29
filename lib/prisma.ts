import { PrismaClient } from './generated/prisma';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
};

// تسجيل معلومات البيئة للتشخيص
console.log('[Prisma] Initializing with environment:', {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
  DATABASE_URL_PREFIX: process.env.DATABASE_URL?.substring(0, 10) + '...',
  VERCEL: process.env.VERCEL,
  VERCEL_ENV: process.env.VERCEL_ENV
});

const prismaOptions: any = {
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
};

// في بيئة Vercel، يجب تحديد رابط قاعدة البيانات مباشرة لتجنب مشاكل pooling
if (process.env.DATABASE_URL) {
  prismaOptions.datasources = {
    db: {
      url: process.env.DATABASE_URL,
    },
  };
} else {
  console.error('[Prisma] WARNING: DATABASE_URL is not defined!');
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
