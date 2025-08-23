// API للإشعارات الذكية - محسّن وسريع
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withRetry } from '@/lib/prisma-helper';
import { getCurrentUser, requireAuthFromRequest } from '@/app/lib/auth';

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    // المصادقة: تفضيل Authorization header ثم الكوكيز
    let user: any = null;
    try {
      user = await requireAuthFromRequest(req);
    } catch (_) {
      user = null;
    }
    if (!user) {
      user = await getCurrentUser();
    }
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'مطلوب تسجيل الدخول',
        code: 'UNAUTHORIZED'
      }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15'); // قلل العدد لتحسين الأداء
    const status = searchParams.get('status') || 'all';
    const type = searchParams.get('type') || 'all';

    const pageNum = Math.max(1, page);
    const limitNum = Math.min(30, Math.max(1, limit)); // max 30 items
    const offset = (pageNum - 1) * limitNum;

    // بناء شروط البحث مع تحسينات
    const whereClause: any = {
      user_id: user.id
    };

    if (status !== 'all') {
      if (status === 'unread') {
        whereClause.read_at = null;
      } else if (status === 'read') {
        whereClause.read_at = { not: null };
      }
    }

    if (type !== 'all') {
      whereClause.type = type;
    }

    // جلب الإشعارات مع تحسين الأداء والفلترة
    const [notifications, totalCount, unreadCount] = await withRetry(async () => 
      await Promise.all([
        prisma.smartNotifications.findMany({
          where: whereClause,
          orderBy: [
            { read_at: 'asc' }, // غير المقروءة أولاً
            { created_at: 'desc' } // الأحدث ثانياً
          ],
          skip: offset,
          take: limitNum,
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
          where: whereClause
        }),
        
        prisma.smartNotifications.count({
          where: {
            user_id: user.id,
            read_at: null
          }
        })
      ])
    );

    // فلترة الإشعارات المكسورة (أخبار محذوفة) - بشكل محسّن
    const validNotifications = [];
    const brokenNotificationIds = [];
    
    for (const notification of notifications) {
      let isValid = true;
      
      // التحقق من صحة الإشعارات المرتبطة بالمقالات
      if (notification.data && typeof notification.data === 'object') {
        const data = notification.data as any;
        
        if (data.articleId || data.article_id || data.slug) {
          try {
            const articleIdentifier = data.articleId || data.article_id || data.slug;
            const articleExists = await prisma.articles.findFirst({
              where: { 
                OR: [
                  { id: articleIdentifier },
                  { slug: articleIdentifier }
                ],
                status: 'published' // فقط المنشورة
              },
              select: { id: true }
            });
            
            if (!articleExists) {
              isValid = false;
              brokenNotificationIds.push(notification.id);
            }
          } catch (error) {
            console.warn(`تحقق من مقال للإشعار ${notification.id}:`, error);
          }
        }
      }
      
      if (isValid) {
        validNotifications.push(notification);
      }
    }

    // حذف الإشعارات المكسورة بشكل مجمع (أسرع)
    if (brokenNotificationIds.length > 0) {
      try {
        await prisma.smartNotifications.deleteMany({
          where: {
            id: { in: brokenNotificationIds }
          }
        });
        console.log(`🗑️ تم حذف ${brokenNotificationIds.length} إشعار مكسور`);
      } catch (error) {
        console.error('خطأ في حذف الإشعارات المكسورة:', error);
      }
    }

    // إحصائيات محسّنة
    let unreadByType: any[] = [];
    try {
      unreadByType = await prisma.smartNotifications.findMany({
        where: { 
          user_id: user.id, 
          read_at: null,
          id: { notIn: brokenNotificationIds } // استبعاد المكسورة
        },
        select: { type: true }
      });
    } catch {
      unreadByType = [];
    }
    const stats = unreadByType.reduce((acc: Record<string, number>, row: any) => {
      const k = row.type as string;
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: {
        notifications: validNotifications,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: validNotifications.length,
          hasMore: offset + validNotifications.length < totalCount && validNotifications.length === limitNum
        },
        unreadCount: Math.max(0, unreadCount - brokenNotificationIds.length),
        stats,
        performance: {
          filtered: notifications.length,
          removed: brokenNotificationIds.length,
          returned: validNotifications.length
        }
      }
    });

  } catch (error) {
    console.error('❌ خطأ في جلب الإشعارات:', error);
    return NextResponse.json({
      success: false,
      error: 'خطأ في جلب الإشعارات',
      code: 'FETCH_ERROR'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    let user: any = null;
    try {
      user = await requireAuthFromRequest(req);
    } catch (_) {
      user = null;
    }
    if (!user) {
      user = await getCurrentUser();
    }
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'مطلوب تسجيل الدخول',
        code: 'UNAUTHORIZED'
      }, { status: 401 });
    }

    const body = await req.json();
    const {
      targetUserId,
      type,
      title,
      message,
      priority = 'medium',
      metadata = {},
      sendImmediate = true
    } = body;

    // التحقق من البيانات المطلوبة
    if (!targetUserId || !type || !title || !message) {
      return NextResponse.json({
        success: false,
        error: 'البيانات غير مكتملة',
        code: 'MISSING_FIELDS',
        required: ['targetUserId', 'type', 'title', 'message']
      }, { status: 400 });
    }

    // التحقق من صحة نوع الإشعار
    const validTypes = [
      'breaking_news',
      'article_recommendation',
      'user_engagement',
      'comment_reply',
      'author_follow',
      'daily_digest',
      'system_announcement',
      'security_alert'
    ];

    if (!validTypes.includes(type)) {
      return NextResponse.json({
        success: false,
        error: 'نوع إشعار غير صحيح',
        code: 'INVALID_TYPE',
        validTypes
      }, { status: 400 });
    }

    // التحقق من وجود المستخدم المستهدف
    const targetUser = await withRetry(async () => 
      await prisma.users.findUnique({
        where: { id: targetUserId },
        select: { id: true, name: true, email: true }
      })
    );

    if (!targetUser) {
      return NextResponse.json({
        success: false,
        error: 'المستخدم المستهدف غير موجود',
        code: 'USER_NOT_FOUND'
      }, { status: 404 });
    }

    // إنشاء الإشعار
    const notification = await withRetry(async () => 
      await prisma.smartNotifications.create({
        data: {
          user_id: targetUserId,
          type,
          title,
          message,
          priority,
          status: 'pending',
          data: metadata || {}
        }
      })
    );

    // إرسال فوري إذا كان مطلوباً
    if (sendImmediate) {
      await withRetry(async () => 
        await prisma.smartNotifications.update({
          where: { id: notification.id },
          data: { 
            status: 'sent', 
            sent_at: new Date() 
          }
        })
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        notification: {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          priority: notification.priority,
          status: notification.status,
          created_at: notification.created_at,
          target_user: {
            id: targetUser.id,
            name: targetUser.name
          }
        }
      },
      message: 'تم إنشاء الإشعار بنجاح'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ خطأ في إنشاء الإشعار:', error);
    return NextResponse.json({
      success: false,
      error: 'خطأ في إنشاء الإشعار',
      code: 'CREATE_ERROR'
    }, { status: 500 });
  }
}
