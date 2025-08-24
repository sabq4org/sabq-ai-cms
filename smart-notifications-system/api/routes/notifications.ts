/**
 * واجهات API للإشعارات الذكية
 * Smart Notifications API Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { 
  SmartNotification,
  NotificationType,
  NotificationPriority,
  DeliveryChannel,
  UserProfile,
  ContentItem
} from '../../types';
import { SmartNotificationService } from '../services/smart-notification-service';
import { validateNotificationRequest, validateUserAuth } from '../middleware/validation';

const router = Router();
const notificationService = new SmartNotificationService();

/**
 * إرسال إشعار ذكي
 * POST /api/notifications/send
 */
router.post('/send', 
  validateUserAuth,
  validateNotificationRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, type, contentId, customData } = req.body;
      
      console.log(`طلب إرسال إشعار للمستخدم: ${userId}`);

      // إنشاء الإشعار
      const notification = await notificationService.createNotification({
        userId,
        type: type as NotificationType,
        contentId,
        customData
      });

      // معالجة وإرسال الإشعار
      const result = await notificationService.processAndSend(notification);

      res.status(200).json({
        success: true,
        data: {
          notificationId: result.notificationId,
          status: result.status,
          scheduledTime: result.scheduledTime,
          channels: result.channels
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * إرسال إشعارات مجمعة
 * POST /api/notifications/send-batch
 */
router.post('/send-batch',
  validateUserAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userIds, notification } = req.body;
      
      console.log(`إرسال إشعارات مجمعة لـ ${userIds.length} مستخدم`);

      const results = await notificationService.sendBatchNotifications(
        userIds,
        notification
      );

      res.status(200).json({
        success: true,
        data: {
          total: userIds.length,
          sent: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          results
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * جدولة إشعار
 * POST /api/notifications/schedule
 */
router.post('/schedule',
  validateUserAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, notification, scheduledTime } = req.body;
      
      const scheduled = await notificationService.scheduleNotification(
        userId,
        notification,
        new Date(scheduledTime)
      );

      res.status(200).json({
        success: true,
        data: {
          scheduledNotificationId: scheduled.id,
          scheduledTime: scheduled.scheduledTime,
          status: 'scheduled'
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * إلغاء إشعار مجدول
 * DELETE /api/notifications/schedule/:notificationId
 */
router.delete('/schedule/:notificationId',
  validateUserAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { notificationId } = req.params;
      
      await notificationService.cancelScheduledNotification(notificationId);

      res.status(200).json({
        success: true,
        message: 'تم إلغاء الإشعار المجدول بنجاح'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * الحصول على إشعارات المستخدم
 * GET /api/notifications/user/:userId
 */
router.get('/user/:userId',
  validateUserAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { status, limit = 20, offset = 0 } = req.query;
      
      const notifications = await notificationService.getUserNotifications(
        userId,
        {
          status: status as string,
          limit: Number(limit),
          offset: Number(offset)
        }
      );

      res.status(200).json({
        success: true,
        data: {
          notifications,
          total: notifications.length,
          hasMore: notifications.length === Number(limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * تحديث حالة الإشعار
 * PATCH /api/notifications/:notificationId/status
 */
router.patch('/:notificationId/status',
  validateUserAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { notificationId } = req.params;
      const { status, readAt, clickedAt } = req.body;
      
      await notificationService.updateNotificationStatus(
        notificationId,
        {
          status,
          readAt: readAt ? new Date(readAt) : undefined,
          clickedAt: clickedAt ? new Date(clickedAt) : undefined
        }
      );

      res.status(200).json({
        success: true,
        message: 'تم تحديث حالة الإشعار بنجاح'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * الحصول على إحصائيات الإشعارات
 * GET /api/notifications/stats/:userId
 */
router.get('/stats/:userId',
  validateUserAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { startDate, endDate } = req.query;
      
      const stats = await notificationService.getUserNotificationStats(
        userId,
        {
          startDate: startDate ? new Date(startDate as string) : undefined,
          endDate: endDate ? new Date(endDate as string) : undefined
        }
      );

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * اختبار الإشعارات
 * POST /api/notifications/test
 */
router.post('/test',
  validateUserAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, channel } = req.body;
      
      const testResult = await notificationService.sendTestNotification(
        userId,
        channel as DeliveryChannel
      );

      res.status(200).json({
        success: true,
        data: {
          delivered: testResult.delivered,
          channel: testResult.channel,
          message: testResult.delivered ? 
            'تم إرسال الإشعار التجريبي بنجاح' : 
            'فشل إرسال الإشعار التجريبي'
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * الحصول على قوالب الإشعارات
 * GET /api/notifications/templates
 */
router.get('/templates',
  validateUserAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type, active = true } = req.query;
      
      const templates = await notificationService.getNotificationTemplates({
        type: type as NotificationType,
        active: active === 'true'
      });

      res.status(200).json({
        success: true,
        data: templates
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * إنشاء قالب إشعار جديد
 * POST /api/notifications/templates
 */
router.post('/templates',
  validateUserAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const template = req.body;
      
      const created = await notificationService.createNotificationTemplate(template);

      res.status(201).json({
        success: true,
        data: created
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * تحديث قالب إشعار
 * PUT /api/notifications/templates/:templateId
 */
router.put('/templates/:templateId',
  validateUserAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { templateId } = req.params;
      const updates = req.body;
      
      const updated = await notificationService.updateNotificationTemplate(
        templateId,
        updates
      );

      res.status(200).json({
        success: true,
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * حذف قالب إشعار
 * DELETE /api/notifications/templates/:templateId
 */
router.delete('/templates/:templateId',
  validateUserAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { templateId } = req.params;
      
      await notificationService.deleteNotificationTemplate(templateId);

      res.status(200).json({
        success: true,
        message: 'تم حذف القالب بنجاح'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * إدارة الحملات
 * GET /api/notifications/campaigns
 */
router.get('/campaigns',
  validateUserAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, limit = 10, offset = 0 } = req.query;
      
      const campaigns = await notificationService.getCampaigns({
        status: status as string,
        limit: Number(limit),
        offset: Number(offset)
      });

      res.status(200).json({
        success: true,
        data: campaigns
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * إنشاء حملة إشعارات
 * POST /api/notifications/campaigns
 */
router.post('/campaigns',
  validateUserAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const campaign = req.body;
      
      const created = await notificationService.createCampaign(campaign);

      res.status(201).json({
        success: true,
        data: created
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * بدء حملة إشعارات
 * POST /api/notifications/campaigns/:campaignId/start
 */
router.post('/campaigns/:campaignId/start',
  validateUserAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { campaignId } = req.params;
      
      await notificationService.startCampaign(campaignId);

      res.status(200).json({
        success: true,
        message: 'تم بدء الحملة بنجاح'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * إيقاف حملة إشعارات
 * POST /api/notifications/campaigns/:campaignId/stop
 */
router.post('/campaigns/:campaignId/stop',
  validateUserAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { campaignId } = req.params;
      
      await notificationService.stopCampaign(campaignId);

      res.status(200).json({
        success: true,
        message: 'تم إيقاف الحملة بنجاح'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * الحصول على إحصائيات الحملة
 * GET /api/notifications/campaigns/:campaignId/stats
 */
router.get('/campaigns/:campaignId/stats',
  validateUserAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { campaignId } = req.params;
      
      const stats = await notificationService.getCampaignStats(campaignId);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * معالج الأخطاء
 */
router.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('خطأ في API الإشعارات:', error);
  
  res.status(error.status || 500).json({
    success: false,
    error: {
      message: error.message || 'حدث خطأ في معالجة الطلب',
      code: error.code || 'INTERNAL_ERROR'
    }
  });
});

export default router;
