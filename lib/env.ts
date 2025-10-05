import { getRequestContext } from '@cloudflare/next-on-pages';

export function env() {
  return getRequestContext().env as {
    ASSETS: R2Bucket;
    CACHE: KVNamespace;
    NEON_DATABASE_URL: string;
    NEXTAUTH_SECRET: string;
    OPENAI_API_KEY: string;
    // Add other secrets here as needed
  };
}

// Ultra-fast cache helpers
export class EdgeCache {
  private kv: KVNamespace;

  constructor(kv: KVNamespace) {
    this.kv = kv;
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      const cached = await this.kv.get(key, 'json');
      return cached as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    try {
      await this.kv.put(key, JSON.stringify(value), { 
        expirationTtl: ttl 
      });
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.kv.delete(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  // Batch operations for ultimate performance
  async mget<T = any>(keys: string[]): Promise<Record<string, T | null>> {
    const results: Record<string, T | null> = {};
    
    try {
      const promises = keys.map(async (key) => {
        const value = await this.get<T>(key);
        return { key, value };
      });
      
      const resolved = await Promise.all(promises);
      
      for (const { key, value } of resolved) {
        results[key] = value;
      }
    } catch (error) {
      console.error('Cache mget error:', error);
    }
    
    return results;
  }

  // Smart cache invalidation
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      // This would require a custom implementation based on your cache key patterns
      // For now, we'll implement specific invalidation methods
      if (pattern === 'news:*') {
        await this.delete('home:top-news');
        await this.delete('news:categories');
        await this.delete('news:trending');
      } else if (pattern === 'announcements:*') {
        await this.delete('announcements:active');
        await this.delete('announcements:timeline');
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }
}

// Performance monitoring helpers
export function measurePerformance<T>(
  operation: () => Promise<T>,
  name: string
): Promise<T> {
  const start = Date.now();
  
  return operation().then(
    (result) => {
      const duration = Date.now() - start;
      console.log(`⚡ ${name} completed in ${duration}ms`);
      return result;
    },
    (error) => {
      const duration = Date.now() - start;
      console.error(`❌ ${name} failed after ${duration}ms:`, error);
      throw error;
    }
  );
}
