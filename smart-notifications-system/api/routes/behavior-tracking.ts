/**
 * واجهات API لتتبع السلوك
 * Behavior Tracking API Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { 
  BehaviorTrackingRequest,
  BehaviorAnalysisResponse 
} from '../../types';
import { BehaviorTrackingService } from '../../services/behavior-tracking-service';
import { validateUserAuth, validateBehaviorEvent } from '../middleware/validation';

const router = Router();
const behaviorService = new BehaviorTrackingService();

/**
 * تتبع حدث سلوكي
 * POST /api/behavior/track
 */
router.post('/track',
  validateBehaviorEvent,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const trackingRequest: BehaviorTrackingRequest = {
        userId: req.body.userId || req.session?.userId,
        sessionId: req.body.sessionId || req.sessionID,
        eventType: req.body.eventType,
        eventData: req.body.eventData,
        timestamp: new Date(req.body.timestamp || Date.now()),
        deviceInfo: {
          type: req.body.deviceInfo?.type || req.headers['x-device-type'] || 'unknown',
          os: req.body.deviceInfo?.os || req.headers['x-device-os'] || 'unknown',
          browser: req.body.deviceInfo?.browser || req.headers['user-agent'] || 'unknown',
          screenSize: req.body.deviceInfo?.screenSize || req.headers['x-screen-size'] || 'unknown'
        }
      };

      const analysis = await behaviorService.trackBehavior(trackingRequest);

      res.status(200).json({
        success: true,
        data: analysis
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * تتبع أحداث متعددة
 * POST /api/behavior/track-batch
 */
router.post('/track-batch',
  validateUserAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { events } = req.body;
      
      if (!Array.isArray(events) || events.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'يجب توفير مصفوفة من الأحداث'
        });
      }

      const results = await Promise.allSettled(
        events.map(event => behaviorService.trackBehavior(event))
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      res.status(200).json({
        success: true,
        data: {
          total: events.length,
          successful,
          failed,
          results: results.map((r, i) => ({
            index: i,
            status: r.status,
            result: r.status === 'fulfilled' ? r.value : undefined,
            error: r.status === 'rejected' ? r.reason?.message : undefined
          }))
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * تحليل سلوك المستخدم
 * GET /api/behavior/analyze/:userId
 */
router.get('/analyze/:userId',
  validateUserAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { 
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 يوم
        endDate = new Date() 
      } = req.query;

      const analysis = await behaviorService.analyzeUserBehavior(
        userId,
        {
          start: new Date(startDate as string),
          end: new Date(endDate as string)
        }
      );

      res.status(200).json({
        success: true,
        data: analysis
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * الحصول على أنماط السلوك
 * GET /api/behavior/patterns/:userId
 */
router.get('/patterns/:userId',
  validateUserAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      
      const patterns = await behaviorService.getUserBehaviorPatterns(userId);

      res.status(200).json({
        success: true,
        data: patterns
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * الحصول على جلسات القراءة
 * GET /api/behavior/reading-sessions/:userId
 */
router.get('/reading-sessions/:userId',
  validateUserAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { limit = 20, offset = 0 } = req.query;

      const sessions = await behaviorService.getReadingSessions(
        userId,
        {
          limit: Number(limit),
          offset: Number(offset)
        }
      );

      res.status(200).json({
        success: true,
        data: {
          sessions,
          total: sessions.length,
          hasMore: sessions.length === Number(limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * الحصول على رحلة المستخدم
 * GET /api/behavior/journey/:userId
 */
router.get('/journey/:userId',
  validateUserAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { sessionId } = req.query;

      const journey = await behaviorService.getUserJourney(
        userId,
        sessionId as string
      );

      res.status(200).json({
        success: true,
        data: journey
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * الحصول على توصيات بناءً على السلوك
 * GET /api/behavior/recommendations/:userId
 */
router.get('/recommendations/:userId',
  validateUserAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { type = 'content', limit = 10 } = req.query;

      const recommendations = await behaviorService.getBehaviorBasedRecommendations(
        userId,
        {
          type: type as string,
          limit: Number(limit)
        }
      );

      res.status(200).json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * الحصول على إحصائيات السلوك
 * GET /api/behavior/stats/:userId
 */
router.get('/stats/:userId',
  validateUserAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { period = '7d' } = req.query;

      const stats = await behaviorService.getBehaviorStats(
        userId,
        period as string
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
 * تحديد نقاط الاهتمام
 * POST /api/behavior/interests/:userId
 */
router.post('/interests/:userId',
  validateUserAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { contentId, interestLevel } = req.body;

      await behaviorService.markInterest(
        userId,
        contentId,
        interestLevel
      );

      res.status(200).json({
        success: true,
        message: 'تم تسجيل الاهتمام بنجاح'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * الحصول على خريطة الحرارة السلوكية
 * GET /api/behavior/heatmap/:userId
 */
router.get('/heatmap/:userId',
  validateUserAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { contentId, type = 'scroll' } = req.query;

      const heatmap = await behaviorService.getBehaviorHeatmap(
        userId,
        {
          contentId: contentId as string,
          type: type as string
        }
      );

      res.status(200).json({
        success: true,
        data: heatmap
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * الحصول على تقرير السلوك الشامل
 * GET /api/behavior/report/:userId
 */
router.get('/report/:userId',
  validateUserAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { format = 'json' } = req.query;

      const report = await behaviorService.generateBehaviorReport(
        userId,
        format as string
      );

      if (format === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=behavior-report-${userId}.pdf`);
        res.send(report);
      } else {
        res.status(200).json({
          success: true,
          data: report
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

/**
 * حذف بيانات السلوك
 * DELETE /api/behavior/:userId
 */
router.delete('/:userId',
  validateUserAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { startDate, endDate, confirm } = req.body;

      if (confirm !== true) {
        return res.status(400).json({
          success: false,
          error: 'يجب تأكيد عملية الحذف'
        });
      }

      await behaviorService.deleteBehaviorData(
        userId,
        {
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined
        }
      );

      res.status(200).json({
        success: true,
        message: 'تم حذف بيانات السلوك بنجاح'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * تصدير بيانات السلوك
 * GET /api/behavior/export/:userId
 */
router.get('/export/:userId',
  validateUserAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { format = 'json' } = req.query;

      const exportData = await behaviorService.exportBehaviorData(
        userId,
        format as string
      );

      const contentType = format === 'csv' ? 'text/csv' : 'application/json';
      const extension = format === 'csv' ? 'csv' : 'json';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', 
        `attachment; filename=behavior-data-${userId}.${extension}`
      );
      
      res.send(exportData);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * الحصول على الأحداث الشاذة
 * GET /api/behavior/anomalies/:userId
 */
router.get('/anomalies/:userId',
  validateUserAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { limit = 50 } = req.query;

      const anomalies = await behaviorService.getAnomalousEvents(
        userId,
        Number(limit)
      );

      res.status(200).json({
        success: true,
        data: anomalies
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * إعادة تعيين نموذج السلوك
 * POST /api/behavior/reset-model/:userId
 */
router.post('/reset-model/:userId',
  validateUserAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { confirm } = req.body;

      if (confirm !== true) {
        return res.status(400).json({
          success: false,
          error: 'يجب تأكيد عملية إعادة التعيين'
        });
      }

      await behaviorService.resetUserBehaviorModel(userId);

      res.status(200).json({
        success: true,
        message: 'تم إعادة تعيين نموذج السلوك بنجاح'
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
  console.error('خطأ في API تتبع السلوك:', error);
  
  res.status(error.status || 500).json({
    success: false,
    error: {
      message: error.message || 'حدث خطأ في معالجة الطلب',
      code: error.code || 'INTERNAL_ERROR'
    }
  });
});

export default router;
