/**
 * Phase-2 Redis Cache Layer
 * High-performance caching with purge hooks for P95 ≤ 1.5s target
 */

import { createClient } from 'redis';
import { timing } from './server-timing';

// Redis client singleton
let redis: any = null;

export const getRedisClient = async () => {
  if (!redis) {
    redis = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    
    redis.on('error', (err: Error) => console.error('Redis Client Error', err));
    redis.on('connect', () => console.log('🔗 Redis Connected'));
    redis.on('ready', () => console.log('⚡ Redis Ready'));
    
    await redis.connect();
  }
  return redis;
};

// Cache configuration with TTLs
export const CACHE_CONFIG = {
  home: {
    key: 'cache:v2:home',
    ttl: 120 // 2 minutes
  },
  article: {
    key: (slug: string) => `cache:v2:article:${slug}`,
    ttl: 300 // 5 minutes
  },
  categoryList: {
    key: (categoryId: string, page: number) => `cache:v2:list:cat:${categoryId}:page:${page}`,
    ttl: 180 // 3 minutes
  },
  featuredNews: {
    key: 'cache:v2:featured-news',
    ttl: 240 // 4 minutes
  },
  trending: {
    key: 'cache:v2:trending',
    ttl: 300 // 5 minutes
  }
};

/**
 * Generic cache wrapper with performance timing
 */
export async function withCache<T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T>,
  options: {
    staleWhileRevalidate?: boolean;
    tags?: string[];
    description?: string;
  } = {}
): Promise<T> {
  const client = await getRedisClient();
  
  timing.start('cache');
  
  try {
    // Try to get from cache
    const cached = await client.get(key);
    
    if (cached) {
      timing.end('cache', `HIT: ${options.description || key}`);
      
      // Add cache headers info (server-side only)
      if (typeof window === 'undefined' && (globalThis as any).res) {
        (globalThis as any).res.setHeader('X-Cache', 'HIT');
        (globalThis as any).res.setHeader('X-Redis-Key', key);
      }
      
      return JSON.parse(cached);
    }
    
    // Cache miss - fetch data
    timing.end('cache', `MISS: ${options.description || key}`);
    timing.start('db');
    
    const data = await fetcher();
    
    timing.end('db', options.description || 'fetch data');
    
    // Store in cache
    await client.setEx(key, ttl, JSON.stringify(data));
    
    // Add cache headers info (server-side only)
    if (typeof window === 'undefined' && (globalThis as any).res) {
      (globalThis as any).res.setHeader('X-Cache', 'MISS');
      (globalThis as any).res.setHeader('X-Redis-Key', key);
    }
    
    return data;
    
  } catch (error) {
    console.error('Cache error:', error);
    timing.end('cache', `ERROR: ${options.description || key}`);
    
    // Fallback to direct fetch if cache fails
    return fetcher();
  }
}

/**
 * Cache purge hooks for content updates
 */
export class CachePurge {
  private static client: any = null;
  
  private static async getClient() {
    if (!this.client) {
      this.client = await getRedisClient();
    }
    return this.client;
  }
  
  /**
   * Purge all home page related cache
   */
  static async purgeHome() {
    const client = await this.getClient();
    
    const keys = [
      CACHE_CONFIG.home.key,
      CACHE_CONFIG.featuredNews.key,
      CACHE_CONFIG.trending.key
    ];
    
    await Promise.all(keys.map(key => client.del(key)));
    console.log('🧹 Purged home page cache');
  }
  
  /**
   * Purge article cache and related listings
   */
  static async purgeArticle(slug: string, categoryId?: string) {
    const client = await this.getClient();
    
    const keys = [
      CACHE_CONFIG.article.key(slug)
    ];
    
    // Purge category listings if provided
    if (categoryId) {
      // Purge multiple pages of category listings
      for (let page = 1; page <= 10; page++) {
        keys.push(CACHE_CONFIG.categoryList.key(categoryId, page));
      }
    }
    
    await Promise.all(keys.map(key => client.del(key)));
    console.log(`🧹 Purged article cache: ${slug}`);
  }
  
  /**
   * Purge category listings
   */
  static async purgeCategory(categoryId: string) {
    const client = await this.getClient();
    
    // Use scan to find all category pages
    const pattern = `cache:v2:list:cat:${categoryId}:page:*`;
    const keys = [];
    
    let cursor = '0';
    do {
      const result = await client.scan(cursor, { MATCH: pattern, COUNT: 100 });
      cursor = result.cursor;
      keys.push(...result.keys);
    } while (cursor !== '0');
    
    if (keys.length > 0) {
      await Promise.all(keys.map(key => client.del(key)));
      console.log(`🧹 Purged ${keys.length} category cache keys for: ${categoryId}`);
    }
  }
  
  /**
   * Purge on article publish/update
   */
  static async purgeOnPublish(slug: string, categoryId?: string) {
    await Promise.all([
      this.purgeHome(),
      this.purgeArticle(slug, categoryId),
      categoryId ? this.purgeCategory(categoryId) : Promise.resolve()
    ]);
  }
  
  /**
   * Purge all cache (emergency)
   */
  static async purgeAll() {
    const client = await this.getClient();
    
    const pattern = 'cache:v2:*';
    const keys = [];
    
    let cursor = '0';
    do {
      const result = await client.scan(cursor, { MATCH: pattern, COUNT: 100 });
      cursor = result.cursor;
      keys.push(...result.keys);
    } while (cursor !== '0');
    
    if (keys.length > 0) {
      await Promise.all(keys.map(key => client.del(key)));
      console.log(`🧹 Emergency purge: ${keys.length} cache keys cleared`);
    }
  }
}

/**
 * Cache statistics for monitoring
 */
export async function getCacheStats() {
  const client = await getRedisClient();
  
  try {
    const info = await client.info('memory');
    const keyspace = await client.info('keyspace');
    
    // Count our cache keys
    const pattern = 'cache:v2:*';
    let totalKeys = 0;
    let cursor = '0';
    
    do {
      const result = await client.scan(cursor, { MATCH: pattern, COUNT: 100 });
      cursor = result.cursor;
      totalKeys += result.keys.length;
    } while (cursor !== '0');
    
    return {
      totalCacheKeys: totalKeys,
      memoryInfo: info,
      keyspaceInfo: keyspace,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Failed to get cache stats:', error);
    return { error: (error as Error).message };
  }
}

/**
 * Test cache hit rate for monitoring
 */
export async function testCacheHitRate(testKey: string = 'cache:test:hit-rate'): Promise<number> {
  const client = await getRedisClient();
  
  const testData = { test: true, timestamp: Date.now() };
  
  // Set test data
  await client.setEx(testKey, 10, JSON.stringify(testData));
  
  // Test multiple reads
  const reads = 10;
  let hits = 0;
  
  for (let i = 0; i < reads; i++) {
    const result = await client.get(testKey);
    if (result) hits++;
  }
  
  // Cleanup
  await client.del(testKey);
  
  return (hits / reads) * 100;
}
