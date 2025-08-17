// API لتحديد الإشعارات كمقروءة - سبق الذكية
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

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

    if (req.method !== 'PATCH') {
      return res.status(405).json({
        success: false,
        error: 'طريقة غير مدعومة',
        code: 'METHOD_NOT_ALLOWED'
      });
    }

    return await handleMarkAsRead(req, res);

  } catch (error) {
    console.error('❌ خطأ في API تحديد كمقروء:', error);
    return res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
      code: 'INTERNAL_ERROR'
    });
  }
}

/**
 * تحديد الإشعارات كمقروءة
 */
async function handleMarkAsRead(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { notificationIds, markAll = false } = req.body;
    const userId = req.user!.id;

    if (!markAll && (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0)) {
      return res.status(400).json({
        success: false,
        error: 'مطلوب معرفات الإشعارات أو تحديد markAll',
        code: 'MISSING_NOTIFICATION_IDS'
      });
    }

    let updatedCount = 0;
    
    if (markAll) {
      // تحديد جميع الإشعارات غير المقروءة كمقروءة
      const result = await prisma.smartNotifications.updateMany({
        where: {
          user_id: userId,
          read_at: null
        },
        data: {
          read_at: new Date(),
          status: 'read'
        }
      });
      
      updatedCount = result.count;
      
    } else {
      // تحديد إشعارات محددة كمقروءة
      const result = await prisma.smartNotifications.updateMany({
        where: {
          id: { in: notificationIds },
          user_id: userId,
          read_at: null // فقط الإشعارات غير المقروءة
        },
        data: {
          read_at: new Date(),
          status: 'read'
        }
      });
      
      updatedCount = result.count;
    }

    // جلب العدد الجديد للإشعارات غير المقروءة
    const newUnreadCount = await prisma.smartNotifications.count({
      where: {
        user_id: userId,
        read_at: null
      }
    });

    // إشعار مدير الإشعارات بالتحديث
    try {
      const notificationManager = (await import('@/lib/notifications/websocket-manager')).default;
      
      if (notificationManager.isUserConnected(userId)) {
        const callback = notificationManager['subscribers']?.get(userId);
        if (callback) {
          callback({
            type: 'notifications_updated',
            data: {
              unreadCount: newUnreadCount,
              updatedCount,
              markAll
            }
          });
        }
      }
    } catch (wsError) {
      console.error('❌ خطأ في إشعار WebSocket:', wsError);
      // لا نفشل العملية بسبب خطأ في WebSocket
    }

    return res.status(200).json({
      success: true,
      data: {
        updatedCount,
        newUnreadCount,
        markAll,
        processedNotifications: markAll ? 'all' : notificationIds
      },
      message: markAll 
        ? `تم تحديد جميع الإشعارات كمقروءة (${updatedCount} إشعار)`
        : `تم تحديد ${updatedCount} إشعار كمقروء`
    });

  } catch (error) {
    console.error('❌ خطأ في تحديد الإشعارات كمقروءة:', error);
    
    // التحقق من نوع الخطأ
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return res.status(409).json({
        success: false,
        error: 'تعارض في البيانات',
        code: 'CONFLICT_ERROR'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'خطأ في تحديد الإشعارات',
      code: 'UPDATE_ERROR'
    });
  }
}
