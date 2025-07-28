import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'Code Status Check',
    timestamp: new Date().toISOString(),
    build: '2025-07-28-fix-prisma-exports',
    features: {
      prismaExports: 'fixed',
      datasourcesRemoved: true,
      executeWithRetryExported: true,
      ensureConnectionExported: true
    },
    env: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'Set (Accelerate)' : 'Not set',
      DIRECT_URL: process.env.DIRECT_URL ? 'Set' : 'Not set',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL
    }
  })
} 