import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const healthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {
      api: true,
      database: false,
      env_vars: {
        DATABASE_URL: !!process.env.DATABASE_URL,
        JWT_SECRET: !!process.env.JWT_SECRET,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'not set',
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'not set',
      }
    }
  };

  // اختبار قاعدة البيانات
  try {
    await prisma.$queryRaw`SELECT 1`;
    healthCheck.checks.database = true;
  } catch (error) {
    healthCheck.status = 'degraded';
    healthCheck.checks.database = false;
    console.error('Database check failed:', error);
  }

  return NextResponse.json(healthCheck);
} 