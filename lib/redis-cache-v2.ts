// Universal Redis wrapper (Upstash or ioredis). JSON-safe + getOrSet pattern.
import crypto from 'crypto';

type RedisClient = {
  get: (k: string) => Promise<string | null>;
  set: (k: string, v: string, opts?: { ex?: number }) => Promise<any>;
  del: (k: string) => Promise<any>;
};

let client: RedisClient;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
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
  // ioredis over REDIS_URL
  const IORedis = require('ioredis');
  const r = new IORedis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: 2,
    enableAutoPipelining: true,
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined
  });
  client = {
    get: (k) => r.get(k),
    set: (k, v, opts) => r.set(k, v, 'EX', (opts?.ex ?? 0) || 1),
    del: (k) => r.del(k)
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
