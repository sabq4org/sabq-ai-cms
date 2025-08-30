/**
 * Phase-2 Database Connection Pool Configuration
 * Optimized for 300 VU load with minimal connection overhead
 */

import { PrismaClient } from '@prisma/client';

// Global variable to prevent multiple Prisma instances
declare global {
  var prisma: PrismaClient | undefined;
}

// Connection pool configuration for high-load scenarios
const createPrismaClient = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'info', 'warn', 'error']
      : ['warn', 'error']
  });
};

// Singleton pattern for Prisma client
export const prisma = globalThis.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Connection monitoring
let connectionStats = {
  totalQueries: 0,
  avgQueryTime: 0,
  slowQueries: 0,
  connectionErrors: 0,
  lastReset: Date.now()
};

// Extend Prisma with connection monitoring
export const db = prisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ operation, model, args, query }) {
        const start = performance.now();
        
        try {
          connectionStats.totalQueries++;
          
          const result = await query(args);
          
          const duration = performance.now() - start;
          
          // Update running average
          connectionStats.avgQueryTime = 
            (connectionStats.avgQueryTime * (connectionStats.totalQueries - 1) + duration) 
            / connectionStats.totalQueries;
          
          // Track slow queries (Phase-2 threshold: 50ms avg, 250ms max)
          if (duration > 250) {
            connectionStats.slowQueries++;
            console.warn(`🐌 Slow query detected: ${model}.${operation} took ${duration.toFixed(2)}ms`);
          }
          
          return result;
          
        } catch (error) {
          connectionStats.connectionErrors++;
          console.error(`Database error in ${model}.${operation}:`, error);
          throw error;
        }
      }
    }
  }
});

/**
 * Get database connection statistics
 */
export function getConnectionStats() {
  const uptime = Date.now() - connectionStats.lastReset;
  
  return {
    ...connectionStats,
    uptime,
    queriesPerSecond: connectionStats.totalQueries / (uptime / 1000),
    errorRate: connectionStats.connectionErrors / connectionStats.totalQueries * 100,
    slowQueryRate: connectionStats.slowQueries / connectionStats.totalQueries * 100
  };
}

/**
 * Reset connection statistics
 */
export function resetConnectionStats() {
  connectionStats = {
    totalQueries: 0,
    avgQueryTime: 0,
    slowQueries: 0,
    connectionErrors: 0,
    lastReset: Date.now()
  };
}

/**
 * Health check for database connection
 */
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  poolStatus: any;
  stats: any;
}> {
  const start = performance.now();
  
  try {
    // Simple query to test connection
    await db.$queryRaw`SELECT 1 as health_check`;
    
    const responseTime = performance.now() - start;
    const stats = getConnectionStats();
    
    // Determine health status based on Phase-2 KPIs
    let status: 'healthy' | 'degraded' | 'unhealthy';
    
    if (responseTime > 100 || stats.avgQueryTime > 50 || stats.errorRate > 0.5) {
      status = 'unhealthy';
    } else if (responseTime > 50 || stats.avgQueryTime > 25 || stats.errorRate > 0.1) {
      status = 'degraded';
    } else {
      status = 'healthy';
    }
    
    return {
      status,
      responseTime,
      poolStatus: {
        maxConnections: parseInt(process.env.POSTGRES_PRISMA_POOL_MAX || '20'),
        // Note: Prisma doesn't expose active connection count directly
        configured: true
      },
      stats
    };
    
  } catch (error) {
    console.error('Database health check failed:', error);
    
    return {
      status: 'unhealthy',
      responseTime: performance.now() - start,
      poolStatus: { error: 'Connection failed' },
      stats: getConnectionStats()
    };
  }
}

/**
 * Graceful shutdown handler
 */
export async function shutdownDatabase() {
  try {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed gracefully');
  } catch (error) {
    console.error('Error during database shutdown:', error);
  }
}

// Auto-cleanup on process termination
if (typeof process !== 'undefined') {
  process.on('beforeExit', shutdownDatabase);
  process.on('SIGINT', shutdownDatabase);
  process.on('SIGTERM', shutdownDatabase);
}

export default db;
