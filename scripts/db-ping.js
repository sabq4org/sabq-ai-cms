import { PrismaClient } from '../lib/generated/prisma/index.js';

(async () => {
  const prisma = new PrismaClient();
  try {
    const result = await prisma.$queryRaw`SELECT 1+1 AS result`;
    console.log('✅ Database connection successful:', result);
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})(); 