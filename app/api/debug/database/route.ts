import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API تشخيص قاعدة البيانات...');
    
    // استيراد آمن لـ Prisma
    const { prisma, ensureConnection, diagnosePrismaConnection } = await import('@/lib/prisma');
    
    const diagnosis = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrl: !!process.env.DATABASE_URL,
        databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) + '...',
      },
      connection: {
        canConnect: false,
        error: null as any,
        categoriesCount: 0,
        testQuery: false,
      },
      performance: {
        connectionTime: 0,
        queryTime: 0,
      }
    };
    
    // اختبار الاتصال
    const connectionStart = Date.now();
    try {
      const isConnected = await ensureConnection();
      diagnosis.connection.canConnect = isConnected;
      diagnosis.performance.connectionTime = Date.now() - connectionStart;
      
      if (isConnected) {
        // اختبار استعلام سريع
        const queryStart = Date.now();
        const testResult = await prisma.$queryRaw`SELECT 1 as test`;
        diagnosis.connection.testQuery = true;
        diagnosis.performance.queryTime = Date.now() - queryStart;
        
        // عد التصنيفات
        const categoriesCount = await prisma.categories.count();
        diagnosis.connection.categoriesCount = categoriesCount;
      }
      
    } catch (error: any) {
      diagnosis.connection.error = error?.message || String(error);
      diagnosis.performance.connectionTime = Date.now() - connectionStart;
    }
    
    // تشخيص إضافي
    const fullDiagnosis = await diagnosePrismaConnection();
    
    return NextResponse.json({
      success: diagnosis.connection.canConnect,
      diagnosis,
      fullDiagnosis,
      message: diagnosis.connection.canConnect 
        ? `قاعدة البيانات تعمل بنجاح - ${diagnosis.connection.categoriesCount} تصنيف`
        : 'فشل الاتصال بقاعدة البيانات'
    });
    
  } catch (error: any) {
    console.error('❌ خطأ في API التشخيص:', error);
    
    return NextResponse.json({
      success: false,
      error: 'فشل تشخيص النظام',
      details: error?.message || String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
