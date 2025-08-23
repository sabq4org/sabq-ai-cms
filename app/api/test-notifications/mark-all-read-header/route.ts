// API لتحديد جميع الإشعارات كمقروءة - نسخة تجريبية 
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    console.log('🧪 [TEST MARK ALL] بدء تحديد جميع الإشعارات كمقروءة...');
    
    // جلب المستخدم التجريبي
    const testUser = await prisma.users.findFirst({
      select: {
        id: true,
        name: true
      }
    });
    
    if (!testUser) {
      return NextResponse.json({
        success: false,
        error: 'لا يوجد مستخدم تجريبي',
        code: 'NO_TEST_USER'
      }, { status: 404 });
    }
    
    const currentTime = new Date();
    
    // تحديد جميع الإشعارات غير المقروءة كمقروءة
    const result = await prisma.smartNotifications.updateMany({
      where: {
        user_id: testUser.id,
        read_at: null // فقط غير المقروءة
      },
      data: {
        read_at: currentTime,
        status: 'read'
      }
    });
    
    console.log(`✅ [TEST MARK ALL] تم تحديد ${result.count} إشعارات كمقروءة`);
    
    // حساب الإحصائيات المحدثة
    const [totalCount, unreadCount] = await Promise.all([
      prisma.smartNotifications.count({
        where: { user_id: testUser.id }
      }),
      prisma.smartNotifications.count({
        where: { 
          user_id: testUser.id,
          read_at: null 
        }
      })
    ]);
    
    return NextResponse.json({
      success: true,
      message: `تم تحديد ${result.count} إشعارات كمقروءة`,
      data: {
        user: {
          id: testUser.id,
          name: testUser.name
        },
        processed: {
          count: result.count,
          markedAt: currentTime.toISOString()
        },
        stats: {
          total: totalCount,
          unread: unreadCount,
          read: totalCount - unreadCount,
          justMarked: result.count
        },
        performance: {
          timestamp: new Date().toISOString(),
          source: 'test-mark-all-api'
        }
      }
    });
    
  } catch (error: any) {
    console.error('❌ [TEST MARK ALL] خطأ:', error);
    
    return NextResponse.json({
      success: false,
      error: 'خطأ في تحديد الإشعارات',
      details: error.message,
      code: 'MARK_ALL_ERROR'
    }, { status: 500 });
  }
}
