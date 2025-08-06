import { PrismaClient } from "@prisma/client";

// مدير إتصالات محسّن ومبسط
class SingletonPrisma {
  private static instance: PrismaClient | null = null;
  private static isConnecting = false;

  static getInstance(): PrismaClient {
    if (!SingletonPrisma.instance) {
      SingletonPrisma.instance = new PrismaClient({
        log: ["error"],
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
        // إعدادات connection pool محسّنة جداً
        transactionOptions: {
          timeout: 5000,
          maxWait: 3000,
        },
      });

      // معالج إغلاق للتطبيق
      const cleanup = async () => {
        if (SingletonPrisma.instance) {
          await SingletonPrisma.instance.$disconnect();
          SingletonPrisma.instance = null;
        }
      };

      process.on("SIGINT", cleanup);
      process.on("SIGTERM", cleanup);
      process.on("beforeExit", cleanup);
    }

    return SingletonPrisma.instance;
  }

  static async disconnect() {
    if (SingletonPrisma.instance) {
      await SingletonPrisma.instance.$disconnect();
      SingletonPrisma.instance = null;
    }
  }

  // دالة تنفيذ مع إدارة الأخطاء
  static async executeQuery<T>(
    operation: (prisma: PrismaClient) => Promise<T>
  ): Promise<T> {
    const prisma = SingletonPrisma.getInstance();

    try {
      return await operation(prisma);
    } catch (error: any) {
      // في حالة أخطاء الاتصال، أعد إنشاء الاتصال
      if (
        error.code === "P2037" || // Too many connections
        error.message?.includes("too many clients") ||
        error.message?.includes("connection")
      ) {
        console.warn("🔄 إعادة إنشاء اتصال قاعدة البيانات...");
        await SingletonPrisma.disconnect();
        const newPrisma = SingletonPrisma.getInstance();
        return await operation(newPrisma);
      }
      throw error;
    }
  }
}

export default SingletonPrisma;
