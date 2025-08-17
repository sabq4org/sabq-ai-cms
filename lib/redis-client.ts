import { Redis } from "ioredis";

// متغيرات لإدارة الاتصال كـ Singleton
let redisInstance: Redis | null = null;
let connectionStatus: "connecting" | "ready" | "closed" | "error" = "closed";
let listenersAttached = false;

// إعدادات محسنة لمنع التوقف وإعادة المحاولة
const redisOptions: any = {
  lazyConnect: true,
  enableOfflineQueue: false,
  maxRetriesPerRequest: 1, // تقليل إعادة المحاولة لمنع التعليق
  connectTimeout: 5000,
  commandTimeout: 2500,
  retryStrategy: (times: number) => {
    if (times > 3) {
      return null; // إيقاف المحاولات بعد 3 مرات
    }
    return Math.min(times * 50, 2000); // إعادة المحاولة بفاصل زمني قصير
  },
};

/**
 * دالة مركزية للحصول على اتصال Redis واحد فقط (Singleton).
 * تعالج الأخطاء بأمان وتمنع توقف التطبيق.
 */
export function getRedisClient(): Redis | null {
  // إذا تم تعطيل Redis عبر متغيرات البيئة
  if (
    process.env.DISABLE_REDIS === "true" ||
    process.env.REDIS_ENABLED === "false"
  ) {
    if (connectionStatus !== "error") {
      console.warn("⚠️ تم تعطيل Redis عبر متغيرات البيئة.");
      connectionStatus = "error";
    }
    return null;
  }

  // إذا كان الاتصال موجوداً بالفعل، أعده مباشرة
  if (redisInstance) {
    return redisInstance;
  }

  try {
    const url = process.env.REDIS_URL;
    if (!url) {
      if (connectionStatus !== "error") {
        console.warn("⚠️ متغير REDIS_URL غير موجود، تم تعطيل Redis.");
        connectionStatus = "error";
      }
      return null;
    }

    if (url.startsWith("rediss://")) {
      redisOptions.tls = {};
    }

    console.log("🔄 [Redis Client] إنشاء اتصال جديد...");
    redisInstance = new Redis(url, redisOptions);
    connectionStatus = "connecting";

    if (!listenersAttached) {
      listenersAttached = true;

      redisInstance.on("connect", () => {
        console.log("🔗 [Redis Client] بدء الاتصال...");
      });

      redisInstance.on("ready", () => {
        connectionStatus = "ready";
        console.log("✅ [Redis Client] الاتصال جاهز.");
      });

      redisInstance.on("error", (err: any) => {
        connectionStatus = "error";
        // تجنب طباعة خطأ ETIMEDOUT المتكرر
        if (!err.message.includes("ETIMEDOUT")) {
          console.error("❌ [Redis Client] خطأ في الاتصال:", err.message);
        }
        // إغلاق الاتصال ومنع إعادة المحاولة لمنع "Unhandled Rejection"
        if (redisInstance) {
          try {
            redisInstance.disconnect(false); // false = don't reconnect
          } catch {}
        }
        redisInstance = null; // السماح بإعادة الإنشاء في المحاولة التالية
        listenersAttached = false;
      });

      redisInstance.on("close", () => {
        connectionStatus = "closed";
        console.log("🚪 [Redis Client] تم إغلاق الاتصال.");
        redisInstance = null;
        listenersAttached = false;
      });

      redisInstance.on("reconnecting", () => {
        console.log("⏳ [Redis Client] إعادة محاولة الاتصال...");
      });
    }

    return redisInstance;
  } catch (e: any) {
    connectionStatus = "error";
    console.error(
      "💥 [Redis Client] فشل حاسم في إنشاء اتصال Redis:",
      e.message
    );
    redisInstance = null;
    return null;
  }
}

/**
 * دالة للتحقق من جاهزية الاتصال قبل تنفيذ الأوامر.
 */
export function isRedisReady(): boolean {
  return redisInstance !== null && connectionStatus === "ready";
}

/**
 * دالة للحصول على حالة الاتصال الحالية
 */
export function getConnectionStatus(): string {
  return connectionStatus;
}

// تصدير دالة بدلاً من استدعائها مباشرة لتجنب إنشاء اتصال غير مرغوب فيه
export { getRedisClient as RedisClient };
export default getRedisClient;
