import { Redis } from "ioredis";

const redis = new Redis(process.env.REDIS_URL!);

export async function rateLimit(key: string, max: number, windowSec: number) {
  const now = Date.now();
  const bucket = Math.floor(now / (windowSec * 1000));
  const k = `rl:${key}:${bucket}`;
  const usage = await redis.incr(k);
  if (usage === 1) await redis.expire(k, windowSec);
  if (usage > max) {
    const err: any = new Error("Too many requests");
    err.status = 429;
    throw err;
  }
}


