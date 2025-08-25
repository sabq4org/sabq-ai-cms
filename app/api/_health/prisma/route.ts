import { NextRequest, NextResponse } from "next/server";
import prisma, { ensureDbConnected } from "@/lib/prisma";

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [Health Check] فحص اتصال Prisma...');
    
    // محاولة الاتصال بقاعدة البيانات
    await ensureDbConnected();
    
    // تشغيل استعلام بسيط للتأكد من عمل الاتصال
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    console.log('✅ [Health Check] Prisma يعمل بشكل صحيح');
    
    return NextResponse.json({
      ok: true,
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      test_query: result
    });
    
  } catch (error: any) {
    console.error('❌ [Health Check] فشل فحص Prisma:', error);
    
    return NextResponse.json({
      ok: false,
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}
