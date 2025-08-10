import type { Redis as RedisType } from "ioredis";

let redis: RedisType | null = null;
let inMemoryCounters: Map<string, { count: number; expiresAt: number }> | null =
  null;
let listenersAttached = false;

function getRedis(): RedisType | null {
  if (redis !== null) return redis;
  // دعم تعطيل Redis تماماً عبر البيئة
  if (
    process.env.DISABLE_REDIS === "true" ||
    process.env.REDIS_ENABLED === "false"
  ) {
    if (!inMemoryCounters) inMemoryCounters = new Map();
    return null;
  }
  try {
    // lazy require لتجنب مشاكل Edge/runtime
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Redis } = require("ioredis");
    if (!process.env.REDIS_URL) throw new Error("NO_REDIS_URL");

    const url: string = process.env.REDIS_URL;
    const useTls = url.startsWith("rediss://");

    const options: any = {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 0,
      connectTimeout: 5000,
      commandTimeout: 2000,
      retryStrategy: () => null,
    };
    if (useTls) options.tls = {};

    redis = new Redis(url, options);

    if (!listenersAttached && redis) {
      listenersAttached = true;
      redis.on("error", (err: any) => {
        // التراجع إلى الذاكرة عند أخطاء TLS/شبكة لمنع Unhandled error event
        try {
          if (redis) {
            // قطع الاتصال لتجنب إعادة المحاولات المستمرة التي تملأ السجلات
            redis.disconnect();
          }
        } catch {}
        redis = null;
        if (!inMemoryCounters) inMemoryCounters = new Map();
        // سجل مختصر فقط
        // eslint-disable-next-line no-console
        console.warn(
          "⚠️ تعطيل Redis في rate-limit بسبب خطأ:",
          err?.message || err
        );
      });
    }

    // محاولة الاتصال غير الحاجبة
    try {
      (redis as any).connect?.();
    } catch {}

    return redis;
  } catch (e) {
    // fallback إلى ذاكرة مؤقتة داخل العملية
    if (!inMemoryCounters) inMemoryCounters = new Map();
    return null;
  }
}

export async function rateLimit(key: string, max: number, windowSec: number) {
  const now = Date.now();
  const bucket = Math.floor(now / (windowSec * 1000));
  const k = `rl:${key}:${bucket}`;
  const r = getRedis();
  if (r) {
    const usage = await r.incr(k);
    if (usage === 1) await r.expire(k, windowSec);
    if (usage > max) {
      const err: any = new Error("Too many requests");
      err.status = 429;
      throw err;
    }
    return;
  }
  // in-memory fallback
  const entry = inMemoryCounters!.get(k);
  if (!entry || entry.expiresAt < now) {
    inMemoryCounters!.set(k, { count: 1, expiresAt: now + windowSec * 1000 });
    return;
  }
  entry.count += 1;
  if (entry.count > max) {
    const err: any = new Error("Too many requests");
    err.status = 429;
    throw err;
  }
}
