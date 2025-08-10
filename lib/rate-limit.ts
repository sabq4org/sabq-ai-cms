import type { Redis as RedisType } from "ioredis";

let redis: RedisType | null = null;
let inMemoryCounters: Map<string, { count: number; expiresAt: number }> | null = null;

function getRedis(): RedisType | null {
  if (redis !== null) return redis;
  try {
    // lazy require لتجنب مشاكل Edge/runtime
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Redis } = require("ioredis");
    if (!process.env.REDIS_URL) throw new Error("NO_REDIS_URL");
    redis = new Redis(process.env.REDIS_URL);
    return redis;
  } catch {
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


