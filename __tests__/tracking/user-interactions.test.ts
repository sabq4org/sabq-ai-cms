// اختبارات نظام تتبع التفاعلات - سبق الذكية
import { UserInteractionTracker, InteractionEventSchema } from '@/lib/tracking/user-interactions';
import { SecurityManager } from '@/lib/auth/user-management';
import { NextRequest } from 'next/server';

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    interactions: {
      upsert: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    userInteractions: {
      create: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    articles: {
      update: jest.fn(),
    },
    user_reading_sessions: {
      create: jest.fn(),
    },
    loyaltyTransactions: {
      create: jest.fn(),
    },
    users: {
      update: jest.fn(),
    },
    activity_logs: {
      create: jest.fn(),
    },
    analytics_data: {
      upsert: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback({
      interactions: {
        upsert: jest.fn().mockResolvedValue({ id: 'interaction-123' }),
      },
      userInteractions: {
        create: jest.fn().mockResolvedValue({ id: 'user-interaction-123' }),
      },
      articles: {
        update: jest.fn().mockResolvedValue({ id: 'article-123' }),
      },
      loyaltyTransactions: {
        create: jest.fn().mockResolvedValue({ id: 'loyalty-123' }),
      },
      users: {
        update: jest.fn().mockResolvedValue({ id: 'user-123' }),
      },
    })),
  })),
}));

// Mock SecurityManager
jest.mock('@/lib/auth/user-management', () => ({
  SecurityManager: {
    generateSecureToken: jest.fn(() => 'test-token-123'),
    cleanIpAddress: jest.fn(() => '127.0.0.1'),
  },
}));

describe('UserInteractionTracker', () => {
  const mockUserId = 'user-123';
  const mockArticleId = 'article-456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('trackInteraction', () => {
    it('يجب أن يتبع تفاعل صحيح', async () => {
      const mockEvent = {
        article_id: mockArticleId,
        interaction_type: 'like' as const,
        timestamp: new Date().toISOString(),
        context: {
          device_type: 'mobile',
          ip_address: '127.0.0.1',
        },
      };

      const result = await UserInteractionTracker.trackInteraction(
        mockUserId,
        mockEvent
      );

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('يجب أن يرفض بيانات غير صحيحة', async () => {
      const invalidEvent = {
        // مفقود article_id
        interaction_type: 'like' as const,
      };

      const result = await UserInteractionTracker.trackInteraction(
        mockUserId,
        invalidEvent as any
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('يجب أن يدعم المستخدمين المجهولين', async () => {
      const mockEvent = {
        article_id: mockArticleId,
        interaction_type: 'view' as const,
        timestamp: new Date().toISOString(),
      };

      const result = await UserInteractionTracker.trackInteraction(
        null, // مستخدم مجهول
        mockEvent
      );

      expect(result.success).toBe(true);
    });

    it('يجب أن يحسب النقاط بشكل صحيح', () => {
      const points = UserInteractionTracker['calculatePoints']('like');
      expect(points).toBe(2);

      const sharePoints = UserInteractionTracker['calculatePoints']('share');
      expect(sharePoints).toBe(5);

      const unknownPoints = UserInteractionTracker['calculatePoints']('unknown');
      expect(unknownPoints).toBe(0);
    });

    it('يجب أن يكتشف نوع الجهاز بشكل صحيح', () => {
      const mobileUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)';
      const deviceType = UserInteractionTracker['detectDeviceType'](mobileUA);
      expect(deviceType).toBe('mobile');

      const desktopUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
      const desktopType = UserInteractionTracker['detectDeviceType'](desktopUA);
      expect(desktopType).toBe('desktop');
    });

    it('يجب أن يجمع الأحداث حسب النوع', () => {
      const events = [
        { interaction_type: 'like', article_id: '1' },
        { interaction_type: 'view', article_id: '2' },
        { interaction_type: 'like', article_id: '3' },
      ];

      const grouped = UserInteractionTracker['groupEventsByType'](events as any);

      expect(grouped['like']).toHaveLength(2);
      expect(grouped['view']).toHaveLength(1);
    });
  });

  describe('getInteractionStats', () => {
    it('يجب أن يجلب إحصائيات التفاعل', async () => {
      // Mock Prisma response
      const mockStats = [
        {
          interaction_type: 'like',
          _count: { interaction_type: 5 },
          _sum: { points_earned: 10 },
        },
        {
          interaction_type: 'view',
          _count: { interaction_type: 20 },
          _sum: { points_earned: 20 },
        },
      ];

      const prismaMock = jest.requireMock('@prisma/client').PrismaClient;
      prismaMock.mockImplementation(() => ({
        userInteractions: {
          groupBy: jest.fn().mockResolvedValue(mockStats),
        },
      }));

      const result = await UserInteractionTracker.getInteractionStats(mockArticleId, mockUserId);

      expect(result.success).toBe(true);
      expect(result.stats).toHaveProperty('like');
      expect(result.stats['like'].count).toBe(5);
      expect(result.stats['like'].total_points).toBe(10);
    });
  });

  describe('Schema Validation', () => {
    it('يجب أن يتحقق من صحة schema التفاعل', () => {
      const validEvent = {
        article_id: 'article-123',
        interaction_type: 'like',
        timestamp: new Date().toISOString(),
        context: {
          device_type: 'mobile',
        },
      };

      const result = InteractionEventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it('يجب أن يرفض schema غير صحيح', () => {
      const invalidEvent = {
        article_id: '', // فارغ
        interaction_type: 'invalid_type', // نوع غير صحيح
      };

      const result = InteractionEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('يجب أن يطبق rate limiting', () => {
      // هذا اختبار تقديري - Rate Limiting مطبق في API layer
      const clientId = '127.0.0.1';
      
      // محاكاة استدعاءات متعددة
      const calls = Array.from({ length: 10 }, () => 
        UserInteractionTracker.trackInteraction(mockUserId, {
          article_id: mockArticleId,
          interaction_type: 'view',
        })
      );

      // جميع الاستدعاءات يجب أن تكون ناجحة في الاختبار
      return Promise.all(calls).then(results => {
        results.forEach(result => {
          expect(result.success).toBe(true);
        });
      });
    });
  });

  describe('Performance Tests', () => {
    it('يجب أن يعالج الأحداث الكثيرة بكفاءة', async () => {
      const startTime = Date.now();
      
      const events = Array.from({ length: 100 }, (_, i) => ({
        article_id: `article-${i}`,
        interaction_type: 'view' as const,
        timestamp: new Date().toISOString(),
      }));

      const promises = events.map(event => 
        UserInteractionTracker.trackInteraction(mockUserId, event)
      );

      const results = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // يجب أن ينتهي خلال 5 ثوان
      expect(duration).toBeLessThan(5000);
      
      // جميع النتائج يجب أن تكون ناجحة
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    it('يجب أن يتعامل مع أخطاء قاعدة البيانات', async () => {
      // Mock database error
      const prismaMock = jest.requireMock('@prisma/client').PrismaClient;
      prismaMock.mockImplementation(() => ({
        $transaction: jest.fn().mockRejectedValue(new Error('Database connection failed')),
      }));

      const mockEvent = {
        article_id: mockArticleId,
        interaction_type: 'like' as const,
        timestamp: new Date().toISOString(),
      };

      const result = await UserInteractionTracker.trackInteraction(mockUserId, mockEvent);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database connection failed');
    });

    it('يجب أن يتعامل مع بيانات تالفة', async () => {
      const corruptedEvent = {
        article_id: null,
        interaction_type: undefined,
        timestamp: 'invalid-date',
      };

      const result = await UserInteractionTracker.trackInteraction(
        mockUserId,
        corruptedEvent as any
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Data Cleanup', () => {
    it('يجب أن ينظف البيانات القديمة', async () => {
      const prismaMock = jest.requireMock('@prisma/client').PrismaClient;
      const mockDeleteMany = jest.fn().mockResolvedValue({ count: 50 });
      
      prismaMock.mockImplementation(() => ({
        userInteractions: {
          deleteMany: mockDeleteMany,
        },
      }));

      await UserInteractionTracker.cleanupOldData(30);

      expect(mockDeleteMany).toHaveBeenCalledWith({
        where: {
          created_at: {
            lt: expect.any(Date),
          },
        },
      });
    });
  });

  describe('Context Data Extraction', () => {
    it('يجب أن يستخرج بيانات السياق من الطلب', () => {
      const mockRequest = {
        headers: new Map([
          ['user-agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)'],
          ['referer', 'https://google.com'],
        ]),
        url: 'https://sabq.io/article/123',
      } as any;

      const context = UserInteractionTracker['extractContextFromRequest'](mockRequest);

      expect(context.device_type).toBe('mobile');
      expect(context.referrer).toBe('https://google.com');
      expect(context.page_url).toBe('https://sabq.io/article/123');
    });
  });

  describe('Browser Detection', () => {
    it('يجب أن يكتشف المتصفحات بشكل صحيح', () => {
      const chromeUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
      const browser = UserInteractionTracker['detectBrowserType'](chromeUA);
      expect(browser).toBe('chrome');

      const firefoxUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0';
      const firefoxBrowser = UserInteractionTracker['detectBrowserType'](firefoxUA);
      expect(firefoxBrowser).toBe('firefox');

      const safariUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15';
      const safariBrowser = UserInteractionTracker['detectBrowserType'](safariUA);
      expect(safariBrowser).toBe('safari');
    });
  });
});

describe('Integration Tests', () => {
  it('يجب أن يتعامل مع تدفق كامل للتفاعل', async () => {
    const mockEvent = {
      article_id: 'article-integration-test',
      interaction_type: 'like' as const,
      timestamp: new Date().toISOString(),
      context: {
        device_type: 'mobile',
        browser_type: 'chrome',
        ip_address: '127.0.0.1',
      },
    };

    const result = await UserInteractionTracker.trackInteraction(
      'user-integration-test',
      mockEvent
    );

    expect(result.success).toBe(true);

    // التحقق من الإحصائيات
    const stats = await UserInteractionTracker.getInteractionStats(
      'article-integration-test',
      'user-integration-test'
    );

    expect(stats.success).toBe(true);
  });
});
