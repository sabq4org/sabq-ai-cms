import { PrismaClient } from "@prisma/client";

// إعدادات محسّنة للإنتاج
const productionPrismaOptions = {
  log: ["error"] as const,
  errorFormat: "minimal" as const,
  // تحسينات للإنتاج
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // إعدادات اتصال محسّنة
  __internal: {
    engine: {
      enableEngineDebugMode: false,
    },
  },
};

// دالة لإنشاء Prisma Client محسّن للإنتاج
export function createProductionPrisma(): PrismaClient {
  const client = new PrismaClient(productionPrismaOptions);
  
  // معالجة أخطاء الاتصال
  client.$on('error', (e) => {
    console.error('🔴 Prisma Error:', e);
  });
  
  // اتصال مبكر في الإنتاج
  if (process.env.NODE_ENV === 'production') {
    client.$connect()
      .then(() => console.log('✅ Production Prisma connected'))
      .catch((e) => console.error('❌ Production Prisma connection failed:', e.message));
  }
  
  return client;
}

// دالة للتحقق من صحة الاتصال
export async function checkDatabaseHealth(client: PrismaClient): Promise<{
  connected: boolean;
  responseTime: number;
  error?: string;
}> {
  const start = Date.now();
  
  try {
    await client.$queryRaw`SELECT 1`;
    return {
      connected: true,
      responseTime: Date.now() - start
    };
  } catch (error: any) {
    return {
      connected: false,
      responseTime: Date.now() - start,
      error: error.message
    };
  }
}

// دالة لإعادة تعيين الاتصال
export async function resetPrismaConnection(client: PrismaClient): Promise<void> {
  try {
    await client.$disconnect();
    console.log('🔌 Disconnected Prisma');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await client.$connect();
    console.log('🔗 Reconnected Prisma');
  } catch (error: any) {
    console.error('❌ Failed to reset Prisma connection:', error.message);
    throw error;
  }
}
