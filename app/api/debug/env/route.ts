import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Only allow in development or with secret key
  const secret = request.headers.get('x-debug-secret');
  if (process.env.NODE_ENV === 'production' && secret !== 'sabq-debug-2025') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    env: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? '✅ Set' : '❌ Not set',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Not set',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || '❌ Not set',
      AWS_REGION: process.env.AWS_REGION || 'Not set',
      AWS_EXECUTION_ENV: process.env.AWS_EXECUTION_ENV || 'Not set',
      LAMBDA_TASK_ROOT: process.env.LAMBDA_TASK_ROOT || 'Not set',
      _HANDLER: process.env._HANDLER || 'Not set',
    },
    prisma: {
      binaryPath: process.env.PRISMA_QUERY_ENGINE_BINARY || 'Default',
      queryEnginePath: `/var/task/node_modules/.prisma/client`,
    },
    system: {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
    },
    timestamp: new Date().toISOString(),
  });
} 