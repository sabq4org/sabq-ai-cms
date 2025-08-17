// API للإشعارات الذكية - سبق الذكية
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { SmartNotificationEngine } from '@/lib/notifications/smart-engine';

interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    email?: string;
    name?: string;
  };
}

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    // المصادقة
    const authResult = await verifyToken(req);
    
    if (!authResult.success || !authResult.user) {
      return res.status(401).json({
        success: false,
        error: 'مطلوب تسجيل الدخول',
        code: 'UNAUTHORIZED'
      });
    }

    req.user = authResult.user;

    switch (req.method) {
      case 'GET':
        return await handleGetNotifications(req, res);
      case 'POST':
        return await handleCreateNotification(req, res);
      default:
        return res.status(405).json({
          success: false,
          error: 'طريقة غير مدعومة',
          code: 'METHOD_NOT_ALLOWED'
        });
    }

  } catch (error) {
    console.error('❌ خطأ في API الإشعارات:', error);
    return res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
      code: 'INTERNAL_ERROR'
    });
  }
}

/**
 * جلب إشعارات المستخدم
 */
async function handleGetNotifications(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { page = '1', limit = '20', status = 'all', type = 'all' } = req.query;
    const userId = req.user!.id;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // بناء شروط البحث
    const whereClause: any = {
      user_id: userId
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
    const notifications = await prisma.smartNotifications.findMany({
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
        metadata: true
      }
    });

    // عدد الإشعارات الإجمالي
    const totalCount = await prisma.smartNotifications.count({
      where: whereClause
    });

    // عدد الإشعارات غير المقروءة
    const unreadCount = await prisma.smartNotifications.count({
      where: {
        user_id: userId,
        read_at: null
      }
    });

    // إحصائيات إضافية
    const stats = await prisma.smartNotifications.groupBy({
      by: ['type'],
      where: {
        user_id: userId,
        read_at: null
      },
      _count: {
        type: true
      }
    });

    return res.status(200).json({
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
        stats: stats.reduce((acc, stat) => {
          acc[stat.type] = stat._count.type;
          return acc;
        }, {} as Record<string, number>)
      }
    });

  } catch (error) {
    console.error('❌ خطأ في جلب الإشعارات:', error);
    return res.status(500).json({
      success: false,
      error: 'خطأ في جلب الإشعارات',
      code: 'FETCH_ERROR'
    });
  }
}

/**
 * إنشاء إشعار جديد (للمطورين والنظام)
 */
async function handleCreateNotification(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const {
      targetUserId,
      type,
      title,
      message,
      priority = 'medium',
      metadata = {},
      sendImmediate = true
    } = req.body;

    // التحقق من البيانات المطلوبة
    if (!targetUserId || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        error: 'البيانات غير مكتملة',
        code: 'MISSING_FIELDS',
        required: ['targetUserId', 'type', 'title', 'message']
      });
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
      return res.status(400).json({
        success: false,
        error: 'نوع إشعار غير صحيح',
        code: 'INVALID_TYPE',
        validTypes
      });
    }

    // التحقق من وجود المستخدم المستهدف
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, name: true, email: true }
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: 'المستخدم المستهدف غير موجود',
        code: 'USER_NOT_FOUND'
      });
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
        metadata: metadata || {},
        created_by: req.user!.id
      }
    });

    // إرسال فوري إذا كان مطلوباً
    if (sendImmediate) {
      try {
        const notificationManager = (await import('@/lib/notifications/websocket-manager')).default;
        
        const pendingNotification = {
          id: notification.id,
          userId: targetUserId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          priority: notification.priority,
          createdAt: notification.created_at
        };

        const sent = await notificationManager.sendToUser(targetUserId, pendingNotification);
        
        if (sent) {
          // تحديث حالة الإشعار
          await prisma.smartNotifications.update({
            where: { id: notification.id },
            data: { 
              status: 'sent',
              sent_at: new Date()
            }
          });
        }
      } catch (sendError) {
        console.error('❌ خطأ في إرسال الإشعار الفوري:', sendError);
        // لا نفشل العملية، فقط نسجل الخطأ
      }
    }

    return res.status(201).json({
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
    });

  } catch (error) {
    console.error('❌ خطأ في إنشاء الإشعار:', error);
    return res.status(500).json({
      success: false,
      error: 'خطأ في إنشاء الإشعار',
      code: 'CREATE_ERROR'
    });
  }
}
