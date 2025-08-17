// API للإشعارات الذكية - سبق الذكية
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
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
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'all';
    const type = searchParams.get('type') || 'all';

    const pageNum = Math.max(1, page);
    const limitNum = Math.min(50, Math.max(1, limit)); // max 50 items
    const offset = (pageNum - 1) * limitNum;

    // بناء شروط البحث
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

    // جلب الإشعارات
    const [notifications, totalCount, unreadCount] = await Promise.all([
      prisma.smartNotifications.findMany({
        where: whereClause,
        orderBy: { created_at: 'desc' },
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
    ]);

    // إحصائيات إضافية
    // حساب الإحصائيات يدوياً بسبب تغيرات Prisma/pg حول groupBy في بعض النُسَخ
    const unreadByType = await prisma.smartNotifications.findMany({
      where: { user_id: user.id, read_at: null },
      select: { type: true }
    });
    const stats = unreadByType.reduce((acc: Record<string, number>, row: any) => {
      const k = row.type as string;
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          hasMore: offset + notifications.length < totalCount
        },
        unreadCount,
        stats
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
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, name: true, email: true }
    });

    if (!targetUser) {
      return NextResponse.json({
        success: false,
        error: 'المستخدم المستهدف غير موجود',
        code: 'USER_NOT_FOUND'
      }, { status: 404 });
    }

    // إنشاء الإشعار
    const notification = await prisma.smartNotifications.create({
      data: {
        user_id: targetUserId,
        type,
        title,
        message,
        priority,
        status: 'pending',
        // توحيد الحقل إلى data بدل metadata لضمان القراءة الصحيحة من الواجهات الأمامية
        data: metadata || {},
        created_by: user.id
      }
    });

    // إرسال فوري إذا كان مطلوباً (يمكن تطوير هذا لاحقاً)
    if (sendImmediate) {
      // TODO: تكامل مع نظام الإشعارات الفورية
      await prisma.smartNotifications.update({
        where: { id: notification.id },
        data: { 
          status: 'sent',
          sent_at: new Date()
        }
      });
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
