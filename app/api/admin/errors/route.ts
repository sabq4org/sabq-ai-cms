import { NextRequest, NextResponse } from 'next/server';
import { monitoring } from '@/lib/services/monitoring';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // التحقق من صلاحيات المستخدم
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('key');
    
    // في production، نتحقق من مفتاح الإدارة
    if (process.env.NODE_ENV === 'production') {
      const validKey = process.env.ADMIN_ERROR_KEY;
      if (!validKey || adminKey !== validKey) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }
    
    // جلب الأخطاء الأخيرة
    const recentErrors = monitoring.getRecentErrors(20);
    
    // جلب معلومات إضافية عن حالة النظام
    let dbStatus = 'unknown';
    let dbError = null;
    
    try {
      // اختبار اتصال قاعدة البيانات
      await prisma.$queryRaw`SELECT 1 as test`;
      dbStatus = 'connected';
    } catch (error) {
      dbStatus = 'disconnected';
      dbError = error instanceof Error ? error.message : 'Unknown error';
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      system: {
        database: {
          status: dbStatus,
          error: dbError,
          url: process.env.DATABASE_URL ? 'configured' : 'missing'
        },
        memory: process.memoryUsage ? process.memoryUsage() : null,
        uptime: process.uptime ? process.uptime() : null
      },
      errors: recentErrors,
      errorCount: recentErrors.length
    });
    
  } catch (error) {
    console.error('Error in admin errors API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch errors',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// إمكانية مسح السجلات
export async function DELETE(request: NextRequest) {
  try {
    // التحقق من صلاحيات المستخدم
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('key');
    
    // في production، نتحقق من مفتاح الإدارة
    if (process.env.NODE_ENV === 'production') {
      const validKey = process.env.ADMIN_ERROR_KEY;
      if (!validKey || adminKey !== validKey) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }
    
    monitoring.clearLogs();
    
    return NextResponse.json({
      success: true,
      message: 'تم مسح سجل الأخطاء'
    });
    
  } catch (error) {
    console.error('Error clearing error logs:', error);
    return NextResponse.json(
      { 
        error: 'Failed to clear logs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 