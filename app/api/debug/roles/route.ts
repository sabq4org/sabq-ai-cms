import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: {
      status: 'unknown',
      connection: false,
      rolesTable: false,
      rolesCount: 0,
      sampleRoles: []
    },
    prisma: {
      status: 'unknown',
      version: 'unknown'
    }
  };

  try {
    console.log('🔍 DEBUG: بدء تشخيص الأدوار...');
    
    // اختبار الاتصال بقاعدة البيانات
    try {
      await prisma.$connect();
      debugInfo.database.connection = true;
      console.log('✅ DEBUG: الاتصال بقاعدة البيانات نجح');
      
      // اختبار وجود جدول الأدوار
      try {
        const rolesCount = await prisma.roles.count();
        debugInfo.database.rolesTable = true;
        debugInfo.database.rolesCount = rolesCount;
        console.log(`📊 DEBUG: عدد الأدوار في قاعدة البيانات: ${rolesCount}`);
        
        // جلب عينة من الأدوار
        if (rolesCount > 0) {
          const sampleRoles = await prisma.roles.findMany({
            take: 3,
            select: {
              id: true,
              name: true,
              display_name: true,
              description: true,
              is_system: true,
              created_at: true
            }
          });
          debugInfo.database.sampleRoles = sampleRoles;
          console.log('📋 DEBUG: عينة الأدوار:', sampleRoles);
        }
        
        debugInfo.database.status = 'healthy';
        
      } catch (tableError) {
        console.error('❌ DEBUG: خطأ في الوصول لجدول الأدوار:', tableError);
        debugInfo.database.status = 'table_error';
        debugInfo.database.error = tableError instanceof Error ? tableError.message : 'Unknown table error';
      }
      
    } catch (connectionError) {
      console.error('❌ DEBUG: فشل الاتصال بقاعدة البيانات:', connectionError);
      debugInfo.database.status = 'connection_failed';
      debugInfo.database.error = connectionError instanceof Error ? connectionError.message : 'Unknown connection error';
    }
    
    // معلومات Prisma
    try {
      debugInfo.prisma.status = 'available';
    } catch (prismaError) {
      debugInfo.prisma.status = 'error';
      debugInfo.prisma.error = prismaError instanceof Error ? prismaError.message : 'Unknown prisma error';
    }
    
    console.log('🎯 DEBUG: معلومات التشخيص الكاملة:', debugInfo);
    
    return NextResponse.json({
      success: true,
      data: debugInfo,
      message: 'تم التشخيص بنجاح'
    });
    
  } catch (error) {
    console.error('❌ DEBUG: خطأ عام في التشخيص:', error);
    
    debugInfo.database.status = 'error';
    debugInfo.error = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({
      success: false,
      data: debugInfo,
      error: 'خطأ في التشخيص'
    }, { status: 500 });
    
  } finally {
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('⚠️ DEBUG: خطأ في قطع الاتصال:', disconnectError);
    }
  }
}
