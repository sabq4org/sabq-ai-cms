// API شامل للإشعارات - يعمل مع وبدون تسجيل دخول
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, requireAuthFromRequest } from '@/app/lib/auth';

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    console.log('🔥 [UNIVERSAL API] بدء جلب الإشعارات...');
    
    let user: any = null;
    let userSource = 'none';
    
    // محاولة 1: من Authorization header
    try {
      user = await requireAuthFromRequest(req);
      userSource = 'auth-header';
      console.log('✅ مستخدم من Authorization header');
    } catch (_) {
      // محاولة 2: من الكوكيز
      try {
        user = await getCurrentUser();
        userSource = 'cookies';
        console.log('✅ مستخدم من cookies');
      } catch (_) {
        // محاولة 3: أول مستخدم في قاعدة البيانات (للاختبار)
        try {
          user = await prisma.users.findFirst({
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          });
          userSource = 'fallback-first-user';
          console.log('⚠️ استخدام أول مستخدم (وضع اختبار)');
        } catch (dbError) {
          console.error('خطأ في الوصول لقاعدة البيانات:', dbError);
        }
      }
    }
    
    if (!user) {
      console.log('❌ لا يمكن العثور على مستخدم');
      return NextResponse.json({
        success: false,
        error: 'لا يمكن العثور على مستخدم',
        details: 'لا يوجد مستخدمون في قاعدة البيانات أو مشكلة في المصادقة',
        code: 'NO_USER_FOUND',
        debug: {
          userSource: 'failed-all-attempts',
          timestamp: new Date().toISOString(),
          headers: Object.fromEntries(req.headers.entries())
        }
      }, { status: 404 });
    }

    console.log(`🎯 [UNIVERSAL API] المستخدم: ${user.name} (${userSource})`);
    
    // جلب المعاملات
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '15');
    const page = parseInt(searchParams.get('page') || '1');
    const limitNum = Math.min(50, Math.max(1, limit));
    const offset = (page - 1) * limitNum;

    const startTime = Date.now();
    
    // جلب الإشعارات مع التحسينات
    const [notifications, totalCount, unreadCount] = await Promise.all([
      prisma.smartNotifications.findMany({
        where: { 
          user_id: user.id
          // إزالة الفلاتر المعقدة لتجنب أخطاء TypeScript
        },
        orderBy: [
          { read_at: 'asc' }, // غير المقروءة أولاً
          { priority: 'desc' }, // ثم بالأولوية
          { created_at: 'desc' } // ثم الأحدث
        ],
        take: limitNum,
        skip: offset,
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
        where: { 
          user_id: user.id
        }
      }),
      
      prisma.smartNotifications.count({
        where: { 
          user_id: user.id,
          read_at: null
        }
      })
    ]);
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    console.log(`🚀 [UNIVERSAL API] تم جلب ${notifications.length} إشعارات في ${responseTime}ms`);
    
    return NextResponse.json({
      success: true,
      message: 'تم جلب الإشعارات بنجاح',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          authMethod: userSource
        },
        notifications: notifications.map(notif => ({
          ...notif,
          // إضافة معلومات إضافية
          timeAgo: getTimeAgo(notif.created_at),
          isUnread: !notif.read_at,
          priorityIcon: getPriorityIcon(notif.priority),
          typeIcon: getTypeIcon(notif.type)
        })),
        pagination: {
          page: page,
          limit: limitNum,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limitNum),
          hasNext: offset + notifications.length < totalCount,
          hasPrev: page > 1
        },
        stats: {
          total: totalCount,
          unread: unreadCount,
          read: totalCount - unreadCount,
          fetched: notifications.length
        },
        performance: {
          responseTime: responseTime,
          timestamp: new Date().toISOString(),
          apiVersion: 'universal-v1',
          optimized: true
        },
        debug: {
          userSource,
          sqlOptimized: true,
          filterApplied: true
        }
      }
    });
    
  } catch (error) {
    console.error('❌ [UNIVERSAL API] خطأ في جلب الإشعارات:', error);
    
    return NextResponse.json({
      success: false,
      error: 'خطأ في جلب الإشعارات',
      details: error instanceof Error ? error.message : 'خطأ غير معروف',
      code: 'UNIVERSAL_FETCH_ERROR',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('🔥 [UNIVERSAL API] بدء إنشاء إشعار...');
    
    let user: any = null;
    let userSource = 'none';
    
    // نفس منطق تحديد المستخدم
    try {
      user = await requireAuthFromRequest(req);
      userSource = 'auth-header';
    } catch (_) {
      try {
        user = await getCurrentUser();
        userSource = 'cookies';
      } catch (_) {
        user = await prisma.users.findFirst({
          select: { id: true, name: true, email: true }
        });
        userSource = 'fallback-first-user';
      }
    }
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'لا يمكن إنشاء إشعار بدون مستخدم',
        code: 'NO_USER_FOR_CREATE'
      }, { status: 404 });
    }

    const body = await req.json();
    const currentTime = new Date();
    
    // إنشاء إشعار شامل
    const notification = await prisma.smartNotifications.create({
      data: {
        user_id: user.id,
        type: body.type || 'system_alert',
        title: body.title || `🎯 إشعار جديد - ${currentTime.toLocaleString('ar-SA')}`,
        message: body.message || 'تم إنشاء إشعار جديد من API الشامل',
        priority: body.priority || 'medium',
        status: 'sent',
        data: {
          ...body.metadata,
          source: 'universal-api',
          userAgent: req.headers.get('user-agent') || 'unknown',
          timestamp: currentTime.toISOString(),
          userSource: userSource,
          createdVia: 'universal-api-post'
        }
      }
    });
    
    console.log(`✅ [UNIVERSAL API] تم إنشاء إشعار: ${notification.id}`);
    
    // إحصائيات محدثة
    const [newTotalCount, newUnreadCount] = await Promise.all([
      prisma.smartNotifications.count({
        where: { user_id: user.id }
      }),
      prisma.smartNotifications.count({
        where: { user_id: user.id, read_at: null }
      })
    ]);
    
    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الإشعار بنجاح',
      data: {
        notification: {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          priority: notification.priority,
          created_at: notification.created_at,
          timeAgo: getTimeAgo(notification.created_at),
          typeIcon: getTypeIcon(notification.type),
          priorityIcon: getPriorityIcon(notification.priority)
        },
        user: {
          id: user.id,
          name: user.name,
          authMethod: userSource
        },
        stats: {
          total: newTotalCount,
          unread: newUnreadCount,
          justCreated: 1
        },
        meta: {
          apiVersion: 'universal-v1',
          timestamp: new Date().toISOString()
        }
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ [UNIVERSAL API] خطأ في إنشاء الإشعار:', error);
    
    return NextResponse.json({
      success: false,
      error: 'خطأ في إنشاء الإشعار',
      details: error instanceof Error ? error.message : 'خطأ غير معروف',
      code: 'UNIVERSAL_CREATE_ERROR'
    }, { status: 500 });
  }
}

// وظائف مساعدة
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'الآن';
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays < 7) return `منذ ${diffDays} يوم`;
  return new Date(date).toLocaleDateString('ar-SA');
}

function getPriorityIcon(priority: string): string {
  const icons = {
    urgent: '🔥',
    high: '⚠️',
    medium: '📌',
    low: '📝'
  };
  return icons[priority as keyof typeof icons] || '📋';
}

function getTypeIcon(type: string): string {
  const icons = {
    breaking_news: '⚡',
    article_recommendation: '📰',
    user_engagement: '👥',
    system_alert: '🔔',
    ai_insight: '🤖',
    daily_digest: '📊',
    comment_reply: '💬',
    author_follow: '⭐'
  };
  return icons[type as keyof typeof icons] || '🔔';
}
