// Prisma singleton with sane pooling defaults for serverless + PgBouncer
import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

const poolMax = Number(process.env.POSTGRES_PRISMA_POOL_MAX ?? 20);
const poolMin = Number(process.env.POSTGRES_PRISMA_POOL_MIN ?? 5);
const poolTimeout = Number(process.env.POSTGRES_PRISMA_POOL_TIMEOUT ?? 5);

export const prisma =
  global.prismaGlobal ??
  new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } },
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') global.prismaGlobal = prisma;

// Notes:
// - Use a connection pooler (PgBouncer) on Supabase/PG when serverless.
// - Keep queries narrow with `select` & `include` minimal.
// - Prefer 2 wide queries over N+1.
