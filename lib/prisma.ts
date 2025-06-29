import { PrismaClient } from './generated/prisma';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
};

const prismaOptions: any = {};

// في بيئة Vercel، يجب تحديد رابط قاعدة البيانات مباشرة لتجنب مشاكل pooling
// هذا هو الحل الجذري لمشكلة "the URL must start with the protocol `prisma://`"
if (process.env.NODE_ENV === 'production') {
  prismaOptions.datasources = {
    db: {
      url: process.env.DATABASE_URL,
    },
  };
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
