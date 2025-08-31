// Universal Redis wrapper (Upstash or ioredis). JSON-safe + getOrSet pattern.
import crypto from 'crypto';

type RedisClient = {
  get: (k: string) => Promise<string | null>;
  set: (k: string, v: string, opts?: { ex?: number }) => Promise<any>;
  del: (k: string) => Promise<any>;
};

let client: RedisClient;

// حراس البيئة لتعطيل Redis بأمان أو التبديل لذاكرة مؤقتة عند غياب الإعدادات
const redisDisabled = process.env.DISABLE_REDIS === 'true' || process.env.REDIS_ENABLED === 'false';
const hasUpstash = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
const hasRedisUrl = Boolean(process.env.REDIS_URL && process.env.REDIS_URL.trim().length > 0);

// عميل ذاكرة بسيط كبديل آمن عند عدم توفر Redis
class MemoryRedis implements RedisClient {
  private store = new Map<string, string>();
  async get(k: string) {
    return this.store.has(k) ? this.store.get(k)! : null;
  }
  async set(k: string, v: string, opts?: { ex?: number }) {
    this.store.set(k, v);
    if (opts?.ex && opts.ex > 0) {
      setTimeout(() => this.store.delete(k), opts.ex * 1000).unref?.();
    }
  }
  async del(k: string) {
    this.store.delete(k);
  }
}

if (redisDisabled || (!hasUpstash && !hasRedisUrl)) {
  // تعطيل Redis أو عدم توفر إعدادات الاتصال → استخدام ذاكرة محلية آمنة
  client = new MemoryRedis();
} else if (hasUpstash) {
  // Upstash REST
  const base = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  client = {
    async get(k) {
      const r = await fetch(`${base}/get/${encodeURIComponent(k)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!r.ok) return null;
      const j = await r.json();
      return j.result ?? null;
    },
    async set(k, v, opts) {
      const ex = opts?.ex ? `/EX/${opts.ex}` : '';
      await fetch(`${base}/set/${encodeURIComponent(k)}/${encodeURIComponent(v)}${ex}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    async del(k) {
      await fetch(`${base}/del/${encodeURIComponent(k)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
  };
} else {
  // ioredis عبر REDIS_URL مع إعدادات آمنة لمنع التعليق/الأخطاء غير المعالجة
  const IORedis = require('ioredis');
  const r = new IORedis(process.env.REDIS_URL!, {
    enableAutoPipelining: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    lazyConnect: true,
    retryStrategy: (times: number) => (times > 3 ? null : Math.min(times * 50, 2000)),
    tls: process.env.REDIS_TLS === 'true' || (process.env.REDIS_URL || '').startsWith('rediss://') ? {} : undefined,
  });

  // منع كسر التطبيق بسبب أحداث خطأ غير معالَجة
  try {
    r.on('error', (err: any) => {
      if (!err?.message?.includes('ECONNREFUSED')) {
        // طباعة مختصرة فقط للأخطاء غير المتكررة/المعروفة
        console.warn('[redis-cache-v2] Redis connection error:', err?.message || err);
      }
    });
  } catch {}

  client = {
    get: async (k) => {
      try {
        // اتصال كسول: اتصل فقط عند الطلب
        if (!(r as any).status || (r as any).status === 'wait') await r.connect();
        return await r.get(k);
      } catch {
        return null;
      }
    },
    set: async (k, v, opts) => {
      try {
        if (!(r as any).status || (r as any).status === 'wait') await r.connect();
        const ttl = (opts?.ex ?? 0) || 1;
        return await r.set(k, v, 'EX', ttl);
      } catch {}
    },
    del: async (k) => {
      try {
        if (!(r as any).status || (r as any).status === 'wait') await r.connect();
        return await r.del(k);
      } catch {}
    },
  };
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const raw = await client.get(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function cacheSet<T>(key: string, value: T, ttlSec: number) {
  await client.set(key, JSON.stringify(value), { ex: ttlSec });
}

export async function cacheGetOrSet<T>(
  key: string,
  ttlSec: number,
  fetcher: () => Promise<T>
): Promise<{ data: T; hit: boolean }> {
  const cached = await cacheGet<T>(key);
  if (cached) return { data: cached, hit: true };
  const data = await fetcher();
  await cacheSet(key, data, ttlSec);
  return { data, hit: false };
}

export function makeETag(payload: unknown) {
  return `"W/${crypto.createHash('sha1').update(JSON.stringify(payload)).digest('hex')}"`;
}

export async function purgePattern(prefix: string) {
  // Upstash REST doesn't support scan directly; keep prefixes simple.
  // Keep an explicit list of keys when writing to cache if you need bulk purge.
  // Placeholder for custom implementation.
  return prefix;
}
