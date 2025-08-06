import { PrismaClient } from "@prisma/client";

// مدير connection pool محسّن
class DatabasePool {
  private static instance: DatabasePool;
  private client: PrismaClient | null = null;
  private connectionCount = 0;
  private maxConnections = 3; // أقل عدد للاتصالات المتزامنة
  private activeQueries = new Set<string>();

  private constructor() {}

  static getInstance(): DatabasePool {
    if (!DatabasePool.instance) {
      DatabasePool.instance = new DatabasePool();
    }
    return DatabasePool.instance;
  }

  getClient(): PrismaClient {
    if (!this.client) {
      this.client = new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["error"] : [],
        datasources: {
          db: {
            url: this.enhanceDatabaseUrl(process.env.DATABASE_URL || ""),
          },
        },
      });

      // إعداد middleware لمراقبة الاستعلامات
      this.client.$use(async (params, next) => {
        const queryId = `${params.model}-${params.action}-${Date.now()}`;

        if (this.activeQueries.size >= this.maxConnections) {
          console.warn(
            `⚠️ تأخير استعلام ${queryId} - كثرة الاستعلامات النشطة: ${this.activeQueries.size}`
          );
          await this.waitForAvailableSlot();
        }

        this.activeQueries.add(queryId);

        try {
          const result = await next(params);
          return result;
        } finally {
          this.activeQueries.delete(queryId);
        }
      });
    }
    return this.client;
  }

  private async waitForAvailableSlot(): Promise<void> {
    while (this.activeQueries.size >= this.maxConnections) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  private enhanceDatabaseUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.search);

      // إعدادات أكثر تحفظاً
      params.set("connection_limit", "3");
      params.set("pool_timeout", "5");
      params.set("connect_timeout", "10");
      params.set("pgbouncer", "true");
      params.set("sslmode", "require");

      urlObj.search = params.toString();
      return urlObj.toString();
    } catch (error) {
      console.error("❌ خطأ في تحسين DATABASE_URL:", error);
      return url;
    }
  }

  async executeWithRetry<T>(
    operation: (client: PrismaClient) => Promise<T>,
    maxRetries = 2
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const client = this.getClient();
        return await operation(client);
      } catch (error: any) {
        lastError = error;

        if (
          attempt < maxRetries &&
          (error.code === "P2037" || // Too many connections
            error.message?.includes("too many clients") ||
            error.message?.includes("connection"))
        ) {
          console.warn(
            `⚠️ محاولة ${attempt + 1}/${maxRetries + 1} فشلت، إعادة المحاولة...`
          );
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * (attempt + 1))
          );
          continue;
        }

        break;
      }
    }

    throw lastError;
  }

  getActiveQueryCount(): number {
    return this.activeQueries.size;
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.$disconnect();
      this.client = null;
    }
  }
}

export const dbPool = DatabasePool.getInstance();
export default dbPool;
