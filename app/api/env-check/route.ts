import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL ? 'موجود (' + process.env.DATABASE_URL.substring(0, 30) + '...)' : 'مفقود',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'موجود' : 'مفقود',
    timestamp: new Date().toISOString()
  };

  return NextResponse.json({
    success: true,
    environment: envVars,
    message: 'متغيرات البيئة الحالية'
  });
}
