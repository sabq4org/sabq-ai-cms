// API مبسط لاختبار الإشعارات بدون توثيق
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    console.log('🧪 [TEST API] بدء اختبار الإشعارات...');
    
    // جلب أول مستخدم من قاعدة البيانات للاختبار
    const testUser = await prisma.users.findFirst({
      select: {
        id: true,
        name: true,
        email: true
      }
    });
    
    if (!testUser) {
      return NextResponse.json({
        success: false,
        error: 'لا يوجد مستخدمون في قاعدة البيانات',
        code: 'NO_USERS'
      }, { status: 404 });
    }
    
    console.log(`🧪 [TEST API] استخدام المستخدم التجريبي: ${testUser.name}`);
    
    // جلب الإشعارات للمستخدم التجريبي
    const [notifications, totalCount, unreadCount] = await Promise.all([
      prisma.smartNotifications.findMany({
        where: { user_id: testUser.id },
        orderBy: [
          { read_at: 'asc' },
          { created_at: 'desc' }
        ],
        take: 10,
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          priority: true,
          status: true,
          read_at: true,
          created_at: true,
          data: true
        }
      }),
      
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
    
    console.log(`🧪 [TEST API] تم جلب ${notifications.length} إشعارات`);
    
    return NextResponse.json({
      success: true,
      message: 'تم جلب الإشعارات التجريبية بنجاح',
      data: {
        testUser: {
          id: testUser.id,
          name: testUser.name,
          email: testUser.email
        },
        notifications: notifications,
        stats: {
          total: totalCount,
          unread: unreadCount,
          fetched: notifications.length
        },
        performance: {
          timestamp: new Date().toISOString(),
          message: 'API اختبار سريع'
        }
      }
    });
    
  } catch (error) {
    console.error('❌ [TEST API] خطأ في الاختبار:', error);
    
    return NextResponse.json({
      success: false,
      error: 'خطأ في اختبار الإشعارات',
      details: error instanceof Error ? error.message : 'خطأ غير معروف',
      code: 'TEST_ERROR'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('🧪 [TEST API] بدء إنشاء إشعار تجريبي...');
    
    // جلب أول مستخدم من قاعدة البيانات للاختبار
    const testUser = await prisma.users.findFirst({
      select: {
        id: true,
        name: true,
        email: true
      }
    });
    
    if (!testUser) {
      return NextResponse.json({
        success: false,
        error: 'لا يوجد مستخدمون في قاعدة البيانات',
        code: 'NO_USERS'
      }, { status: 404 });
    }
    
    const body = await req.json();
    const currentTime = new Date().toLocaleString('ar-SA');
    
    // إنشاء إشعار تجريبي
    const testNotification = await prisma.smartNotifications.create({
      data: {
        user_id: testUser.id,
        type: 'system_alert',
        title: `🧪 اختبار من صفحة التست - ${currentTime}`,
        message: 'هذا إشعار تم إنشاؤه من صفحة الاختبار لفحص عمل النظام',
        priority: 'medium',
        status: 'sent',
        data: {
          source: 'test-page',
          timestamp: new Date().toISOString(),
          userAgent: req.headers.get('user-agent') || 'unknown',
          testData: body
        }
      }
    });
    
    console.log(`🧪 [TEST API] تم إنشاء إشعار تجريبي: ${testNotification.id}`);
    
    // إحصائيات محدثة
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
      message: 'تم إنشاء الإشعار التجريبي بنجاح',
      data: {
        notification: {
          id: testNotification.id,
          title: testNotification.title,
          message: testNotification.message,
          type: testNotification.type,
          priority: testNotification.priority,
          created_at: testNotification.created_at
        },
        testUser: {
          id: testUser.id,
          name: testUser.name
        },
        stats: {
          total: totalCount,
          unread: unreadCount
        }
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ [TEST API] خطأ في إنشاء الإشعار:', error);
    
    return NextResponse.json({
      success: false,
      error: 'خطأ في إنشاء الإشعار التجريبي',
      details: error instanceof Error ? error.message : 'خطأ غير معروف',
      code: 'CREATE_TEST_ERROR'
    }, { status: 500 });
  }
}
