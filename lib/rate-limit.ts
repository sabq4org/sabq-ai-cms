import { getRedisClient, isRedisReady } from "./redis-client";

let inMemoryCounters: Map<string, { count: number; expiresAt: number }> | null =
  null;

export async function rateLimit(key: string, max: number, windowSec: number) {
  const now = Date.now();
  const bucket = Math.floor(now / (windowSec * 1000));
  const k = `rl:${key}:${bucket}`;
  const r = getRedisClient();

  if (r && isRedisReady()) {
    try {
      const usage = await r.incr(k);
      if (usage === 1) await r.expire(k, windowSec);
      if (usage > max) {
        const err: any = new Error("Too many requests");
        err.status = 429;
        throw err;
      }
      return;
    } catch (error: any) {
      console.warn(
        `⚠️ فشل أمر Redis في rate-limit، العودة للذاكرة: ${error.message}`
      );
    }
  }

  // in-memory fallback
  if (!inMemoryCounters) inMemoryCounters = new Map();
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
