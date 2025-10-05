import { Pool } from '@neondatabase/serverless';
import mysql from 'mysql2/promise';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Edge-optimized Neon Postgres Pool
const createNeonPool = (connectionString: string) => {
  return new Pool({
    connectionString,
    // Edge runtime optimizations
    max: 1, // Single connection for edge
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
};

// Legacy MySQL pool (fallback)
const mysqlPool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: 'utf8mb4'
});

// Determine which database to use
const USE_NEON = process.env.NEON_DATABASE_URL && process.env.NODE_ENV === 'production';

// Types for query results
export type QueryResult<T = any> = T & RowDataPacket;
export type InsertResult = ResultSetHeader;

// Ultra-fast database query function (Edge optimized)
export async function query<T = any>(
  sql: string,
  params?: any[]
): Promise<QueryResult<T>[]> {
  try {
    if (USE_NEON) {
      // Use Neon Postgres for ultra-fast edge queries
      const pool = createNeonPool(process.env.NEON_DATABASE_URL!);
      const client = await pool.connect();
      
      try {
        const start = Date.now();
        const res = await client.query<T>(sql, params);
        const duration = Date.now() - start;
        
        console.log(`⚡ Neon query completed in ${duration}ms`);
        return res.rows as QueryResult<T>[];
      } finally {
        client.release();
      }
    } else {
      // Fallback to MySQL
      const [results] = await mysqlPool.execute<QueryResult<T>[]>(sql, params);
      return results;
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// دالة لتنفيذ INSERT/UPDATE/DELETE
export async function execute(
  sql: string,
  params?: any[]
): Promise<InsertResult> {
  try {
    if (USE_NEON) {
      // Use Neon for write operations
      const pool = createNeonPool(process.env.NEON_DATABASE_URL!);
      const client = await pool.connect();
      
      try {
        const start = Date.now();
        const res = await client.query(sql, params);
        const duration = Date.now() - start;
        
        console.log(`⚡ Neon execute completed in ${duration}ms`);
        return { affectedRows: res.rowCount || 0 } as InsertResult;
      } finally {
        client.release();
      }
    } else {
      const [result] = await mysqlPool.execute<InsertResult>(sql, params);
      return result;
    }
  } catch (error) {
    console.error('Database execute error:', error);
    throw error;
  }
}

// دالة للحصول على صف واحد
export async function queryOne<T = any>(
  sql: string,
  params?: any[]
): Promise<QueryResult<T> | null> {
  const results = await query<T>(sql, params);
  return results[0] || null;
}

// دالة للتحقق من الاتصال
export async function checkConnection() {
  try {
    if (USE_NEON) {
      const pool = createNeonPool(process.env.NEON_DATABASE_URL!);
      const client = await pool.connect();
      try {
        await client.query('SELECT 1');
        console.log('✅ Neon Database connected successfully');
        return true;
      } finally {
        client.release();
      }
    } else {
      await mysqlPool.execute('SELECT 1');
      console.log('✅ MySQL Database connected successfully');
      return true;
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// دالة لإغلاق pool عند إيقاف التطبيق
export async function closePool() {
  try {
    if (!USE_NEON) {
      await mysqlPool.end();
      console.log('MySQL Database pool closed');
    }
  } catch (error) {
    console.error('Error closing database pool:', error);
  }
}

// Helper functions للتعامل مع التواريخ
export function formatDateForMySQL(date: Date | string | null): string | null {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

// Transaction helper
export async function withTransaction<T>(
  callback: (connection: any) => Promise<T>
): Promise<T> {
  if (USE_NEON) {
    // Neon transaction
    const pool = createNeonPool(process.env.NEON_DATABASE_URL!);
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } else {
    // MySQL transaction
    const connection = await mysqlPool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default USE_NEON ? null : mysqlPool; 