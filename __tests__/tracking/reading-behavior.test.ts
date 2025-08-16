// اختبارات نظام تتبع سلوك القراءة - سبق الذكية
import { ReadingBehaviorAnalyzer, ReadingBehaviorSchema } from '@/lib/tracking/reading-behavior';
import { SecurityManager } from '@/lib/auth/user-management';

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user_reading_sessions: {
      create: jest.fn().mockResolvedValue({
        id: 'session-123',
        user_id: 'user-123',
        article_id: 'article-456',
        duration_seconds: 120,
        read_percentage: 85,
        scroll_depth: 90,
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'session-1',
          duration_seconds: 120,
          read_percentage: 85,
          scroll_depth: 90,
          time_of_day: 14,
          device_type: 'mobile',
          created_at: new Date(),
        },
        {
          id: 'session-2',
          duration_seconds: 180,
          read_percentage: 95,
          scroll_depth: 100,
          time_of_day: 20,
          device_type: 'desktop',
          created_at: new Date(),
        },
      ]),
    },
    user_insights: {
      upsert: jest.fn().mockResolvedValue({
        id: 'insight-123',
        user_id: 'user-123',
        total_reads: 1,
        avg_read_time: 85,
      }),
    },
  })),
}));

// Mock SecurityManager
jest.mock('@/lib/auth/user-management', () => ({
  SecurityManager: {
    generateSecureToken: jest.fn(() => 'test-session-id'),
  },
}));

describe('ReadingBehaviorAnalyzer', () => {
  const mockReadingData = {
    session_id: 'test-session-123',
    article_id: 'article-456',
    user_id: 'user-123',
    started_at: new Date('2024-01-15T14:30:00Z').toISOString(),
    ended_at: new Date('2024-01-15T14:32:00Z').toISOString(),
    duration_seconds: 120,
    read_percentage: 85,
    scroll_depth: 90,
    reading_speed: 250,
    pause_points: [
      {
        timestamp: 30000,
        scroll_position: 25,
        duration_ms: 5000,
      },
      {
        timestamp: 80000,
        scroll_position: 60,
        duration_ms: 3000,
      },
    ],
    interactions: [
      {
        type: 'click' as const,
        element: 'paragraph',
        timestamp: 45000,
        position: { x: 100, y: 200 },
      },
      {
        type: 'select' as const,
        element: 'text',
        timestamp: 70000,
      },
    ],
    highlights: [
      {
        text: 'نص مهم للاختبار',
        position: { start: 100, end: 120 },
        timestamp: 60000,
      },
    ],
    reading_pattern: {
      is_sequential: true,
      back_tracking_count: 2,
      jumping_sections: 1,
      focus_areas: [
        {
          section: 'introduction',
          time_spent: 30,
          revisits: 1,
        },
        {
          section: 'main_content',
          time_spent: 60,
          revisits: 0,
        },
        {
          section: 'conclusion',
          time_spent: 30,
          revisits: 1,
        },
      ],
    },
    device_orientation: 'portrait' as const,
    reading_environment: {
      theme: 'light' as const,
      font_size: 'medium',
      zoom_level: 1.0,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('recordReadingSession', () => {
    it('يجب أن يسجل جلسة قراءة صحيحة', async () => {
      const result = await ReadingBehaviorAnalyzer.recordReadingSession(mockReadingData);

      expect(result.success).toBe(true);
      expect(result.insights).toBeDefined();
      expect(result.insights.session_id).toBe('test-session-id');
    });

    it('يجب أن يرفض بيانات غير صحيحة', async () => {
      const invalidData = {
        ...mockReadingData,
        duration_seconds: -10, // قيمة سالبة غير صحيحة
      };

      const result = await ReadingBehaviorAnalyzer.recordReadingSession(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('يجب أن يحلل جودة القراءة بشكل صحيح', async () => {
      const result = await ReadingBehaviorAnalyzer.recordReadingSession(mockReadingData);

      expect(result.success).toBe(true);
      expect(result.insights.reading_quality).toBeDefined();
      expect(result.insights.reading_quality.is_quality_reading).toBe(true);
      expect(result.insights.reading_quality.quality_score).toBeGreaterThan(0);
    });

    it('يجب أن يحسب مستوى التفاعل', async () => {
      const result = await ReadingBehaviorAnalyzer.recordReadingSession(mockReadingData);

      expect(result.success).toBe(true);
      expect(result.insights.engagement_level).toBeDefined();
      expect(result.insights.engagement_level.engagement_score).toBeGreaterThan(0);
      expect(result.insights.engagement_level.engagement_level).toBeTruthy();
    });

    it('يجب أن يحدد نمط القراءة', async () => {
      const result = await ReadingBehaviorAnalyzer.recordReadingSession(mockReadingData);

      expect(result.success).toBe(true);
      expect(result.insights.reading_style).toBeDefined();
      expect(result.insights.reading_style.primary_style).toBeTruthy();
      expect(result.insights.reading_style.reading_speed_wpm).toBeGreaterThan(0);
    });

    it('يجب أن يحلل فترات الانتباه', async () => {
      const result = await ReadingBehaviorAnalyzer.recordReadingSession(mockReadingData);

      expect(result.success).toBe(true);
      expect(result.insights.attention_spans).toBeDefined();
      expect(result.insights.attention_spans.total_focus_spans).toBeGreaterThanOrEqual(0);
    });

    it('يجب أن يستخرج تفضيلات المحتوى', async () => {
      const result = await ReadingBehaviorAnalyzer.recordReadingSession(mockReadingData);

      expect(result.success).toBe(true);
      expect(result.insights.content_preferences).toBeDefined();
      expect(result.insights.content_preferences.reading_environment).toBeDefined();
    });

    it('يجب أن يحلل النمط الزمني', async () => {
      const result = await ReadingBehaviorAnalyzer.recordReadingSession(mockReadingData);

      expect(result.success).toBe(true);
      expect(result.insights.time_pattern).toBeDefined();
      expect(result.insights.time_pattern.reading_time).toBeTruthy();
      expect(result.insights.time_pattern.day_type).toBeTruthy();
    });

    it('يجب أن يكتشف استخدام ميزات الوصول', async () => {
      const dataWithAccessibility = {
        ...mockReadingData,
        reading_environment: {
          theme: 'dark' as const,
          font_size: 'large',
          zoom_level: 1.5,
        },
      };

      const result = await ReadingBehaviorAnalyzer.recordReadingSession(dataWithAccessibility);

      expect(result.success).toBe(true);
      expect(result.insights.accessibility_insights).toBeDefined();
      expect(result.insights.accessibility_insights.uses_accessibility_features).toBe(true);
      expect(result.insights.accessibility_insights.features_detected).toContain('تعديل حجم الخط');
    });
  });

  describe('getUserReadingAnalysis', () => {
    it('يجب أن يحلل سلوك القراءة للمستخدم', async () => {
      const timeRange = {
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
      };

      const result = await ReadingBehaviorAnalyzer.getUserReadingAnalysis(
        'user-123',
        timeRange
      );

      expect(result.success).toBe(true);
      expect(result.analysis).toBeDefined();
      expect(result.analysis.total_sessions).toBe(2);
      expect(result.analysis.total_reading_time).toBeGreaterThan(0);
      expect(result.analysis.average_session_duration).toBeGreaterThan(0);
    });

    it('يجب أن يعيد رسالة مناسبة عند عدم وجود جلسات', async () => {
      // Mock empty sessions
      const prismaMock = jest.requireMock('@prisma/client').PrismaClient;
      prismaMock.mockImplementation(() => ({
        user_reading_sessions: {
          findMany: jest.fn().mockResolvedValue([]),
        },
      }));

      const result = await ReadingBehaviorAnalyzer.getUserReadingAnalysis('user-empty');

      expect(result.success).toBe(true);
      expect(result.analysis).toBeNull();
      expect(result.message).toBe('لا توجد جلسات قراءة');
    });

    it('يجب أن يحلل تفضيلات الوقت', async () => {
      const result = await ReadingBehaviorAnalyzer.getUserReadingAnalysis('user-123');

      expect(result.success).toBe(true);
      expect(result.analysis.time_preferences).toBeDefined();
      expect(result.analysis.time_preferences.preferred_hour).toBeDefined();
      expect(result.analysis.time_preferences.reading_times).toBeDefined();
    });

    it('يجب أن يحلل استخدام الأجهزة', async () => {
      const result = await ReadingBehaviorAnalyzer.getUserReadingAnalysis('user-123');

      expect(result.success).toBe(true);
      expect(result.analysis.device_usage).toBeDefined();
      expect(result.analysis.device_usage.mobile).toBeDefined();
      expect(result.analysis.device_usage.desktop).toBeDefined();
    });

    it('يجب أن يولد اقتراحات للتحسين', async () => {
      const result = await ReadingBehaviorAnalyzer.getUserReadingAnalysis('user-123');

      expect(result.success).toBe(true);
      expect(result.analysis.improvement_suggestions).toBeDefined();
      expect(Array.isArray(result.analysis.improvement_suggestions)).toBe(true);
    });
  });

  describe('Schema Validation', () => {
    it('يجب أن يتحقق من صحة schema سلوك القراءة', () => {
      const result = ReadingBehaviorSchema.safeParse(mockReadingData);
      expect(result.success).toBe(true);
    });

    it('يجب أن يرفض نسبة قراءة غير صحيحة', () => {
      const invalidData = {
        ...mockReadingData,
        read_percentage: 150, // أكبر من 100
      };

      const result = ReadingBehaviorSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('يجب أن يرفض عمق تمرير غير صحيح', () => {
      const invalidData = {
        ...mockReadingData,
        scroll_depth: -10, // قيمة سالبة
      };

      const result = ReadingBehaviorSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('يجب أن يتحقق من صحة نقاط التوقف', () => {
      const validData = {
        ...mockReadingData,
        pause_points: [
          {
            timestamp: 30000,
            scroll_position: 25.5,
            duration_ms: 5000,
          },
        ],
      };

      const result = ReadingBehaviorSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('يجب أن يتحقق من صحة التفاعلات', () => {
      const validData = {
        ...mockReadingData,
        interactions: [
          {
            type: 'click',
            element: 'button',
            timestamp: 45000,
            position: { x: 100, y: 200 },
          },
        ],
      };

      const result = ReadingBehaviorSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('يجب أن يرفض نوع تفاعل غير صحيح', () => {
      const invalidData = {
        ...mockReadingData,
        interactions: [
          {
            type: 'invalid_interaction',
            element: 'button',
            timestamp: 45000,
          },
        ],
      };

      const result = ReadingBehaviorSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Reading Quality Assessment', () => {
    it('يجب أن يقيم قراءة عالية الجودة', () => {
      const highQualityData = {
        duration_seconds: 180,
        read_percentage: 95,
        scroll_depth: 100,
        interactions: [{ type: 'select' }],
        highlights: [{ text: 'important text' }],
      };

      const quality = ReadingBehaviorAnalyzer['assessReadingQuality'](highQualityData as any);

      expect(quality.is_quality_reading).toBe(true);
      expect(quality.quality_score).toBeGreaterThan(80);
    });

    it('يجب أن يقيم قراءة منخفضة الجودة', () => {
      const lowQualityData = {
        duration_seconds: 5,
        read_percentage: 10,
        scroll_depth: 15,
        interactions: [],
        highlights: [],
      };

      const quality = ReadingBehaviorAnalyzer['assessReadingQuality'](lowQualityData as any);

      expect(quality.is_quality_reading).toBe(false);
      expect(quality.quality_score).toBeLessThan(30);
    });

    it('يجب أن يقدر الفهم بناءً على السلوك', () => {
      const comprehensionData = {
        duration_seconds: 120,
        scroll_depth: 85,
        interactions: [{ type: 'select' }, { type: 'click' }],
        pause_points: [{ duration_ms: 5000 }],
        highlights: [{ text: 'key point' }],
      };

      const comprehension = ReadingBehaviorAnalyzer['estimateComprehension'](comprehensionData as any);

      expect(comprehension).toBeGreaterThan(70);
      expect(comprehension).toBeLessThanOrEqual(100);
    });
  });

  describe('Engagement Level Calculation', () => {
    it('يجب أن يحسب مستوى تفاعل عالي', () => {
      const highEngagementData = {
        scroll_depth: 95,
        duration_seconds: 180,
        article_id: 'test-article',
        interactions: [
          { type: 'click' },
          { type: 'select' },
          { type: 'hover' },
        ],
        highlights: [{ text: 'highlighted text' }],
        reading_pattern: {
          is_sequential: true,
          back_tracking_count: 1,
          focus_areas: [
            { section: 'intro', time_spent: 30, revisits: 1 },
            { section: 'main', time_spent: 120, revisits: 0 },
          ],
        },
        pause_points: [
          { duration_ms: 3000 },
          { duration_ms: 5000 },
        ],
      };

      const engagement = ReadingBehaviorAnalyzer['calculateEngagementLevel'](highEngagementData as any);

      expect(engagement.engagement_score).toBeGreaterThan(70);
      expect(engagement.engagement_level).toBe('عالي');
      expect(engagement.contributing_factors.length).toBeGreaterThan(0);
    });

    it('يجب أن يحسب مستوى تفاعل منخفض', () => {
      const lowEngagementData = {
        scroll_depth: 25,
        duration_seconds: 10,
        article_id: 'test-article',
        interactions: [],
        highlights: [],
        reading_pattern: {
          is_sequential: false,
          back_tracking_count: 0,
          focus_areas: [],
        },
        pause_points: [],
      };

      const engagement = ReadingBehaviorAnalyzer['calculateEngagementLevel'](lowEngagementData as any);

      expect(engagement.engagement_score).toBeLessThan(40);
      expect(['منخفض', 'منخفض جداً']).toContain(engagement.engagement_level);
    });
  });

  describe('Reading Style Identification', () => {
    it('يجب أن يحدد قارئ سريع', () => {
      const fastReaderData = {
        duration_seconds: 60,
        read_percentage: 90,
        reading_speed: 400, // أسرع من المتوسط
        reading_pattern: {
          back_tracking_count: 0,
          jumping_sections: 3,
        },
      };

      const style = ReadingBehaviorAnalyzer['identifyReadingStyle'](fastReaderData as any);

      expect(style.primary_style).toBe('سريع');
      expect(style.characteristics).toContain('قارئ سريع');
    });

    it('يجب أن يحدد قارئ متأني', () => {
      const slowReaderData = {
        duration_seconds: 300,
        read_percentage: 95,
        reading_speed: 150, // أبطأ من المتوسط
        reading_pattern: {
          back_tracking_count: 5,
          jumping_sections: 0,
        },
      };

      const style = ReadingBehaviorAnalyzer['identifyReadingStyle'](slowReaderData as any);

      expect(style.primary_style).toBe('متأني');
      expect(style.characteristics).toContain('قارئ متأني');
    });

    it('يجب أن يحدد قارئ تحليلي', () => {
      const analyticalReaderData = {
        duration_seconds: 240,
        read_percentage: 90,
        reading_speed: 200,
        reading_pattern: {
          back_tracking_count: 8, // مراجعة كثيرة
          jumping_sections: 2,
        },
      };

      const style = ReadingBehaviorAnalyzer['identifyReadingStyle'](analyticalReaderData as any);

      expect(style.primary_style).toBe('تحليلي');
      expect(style.characteristics).toContain('مراجعة متكررة');
    });
  });

  describe('Time Pattern Analysis', () => {
    it('يجب أن يحدد وقت الصباح', () => {
      const morningData = {
        started_at: '2024-01-15T09:30:00Z',
      };

      const timePattern = ReadingBehaviorAnalyzer['analyzeTimePattern'](morningData as any);

      expect(timePattern.reading_time).toBe('صباحاً');
      expect(timePattern.hour_of_day).toBe(9);
    });

    it('يجب أن يحدد وقت الذروة', () => {
      const peakTimeData = {
        started_at: '2024-01-15T20:00:00Z', // 8 PM
      };

      const timePattern = ReadingBehaviorAnalyzer['analyzeTimePattern'](peakTimeData as any);

      expect(timePattern.is_peak_reading_time).toBe(true);
    });

    it('يجب أن يحدد عطلة نهاية الأسبوع', () => {
      const weekendData = {
        started_at: '2024-01-13T14:00:00Z', // Saturday
      };

      const timePattern = ReadingBehaviorAnalyzer['analyzeTimePattern'](weekendData as any);

      expect(timePattern.day_type).toBe('عطلة نهاية الأسبوع');
    });
  });

  describe('Error Handling', () => {
    it('يجب أن يتعامل مع أخطاء قاعدة البيانات', async () => {
      // Mock database error
      const prismaMock = jest.requireMock('@prisma/client').PrismaClient;
      prismaMock.mockImplementation(() => ({
        user_reading_sessions: {
          create: jest.fn().mockRejectedValue(new Error('Database connection failed')),
        },
      }));

      const result = await ReadingBehaviorAnalyzer.recordReadingSession(mockReadingData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database connection failed');
    });

    it('يجب أن يتعامل مع بيانات ناقصة', async () => {
      const incompleteData = {
        session_id: 'test-session',
        article_id: 'article-123',
        // مفقود started_at
        duration_seconds: 120,
        read_percentage: 85,
        scroll_depth: 90,
      };

      const result = await ReadingBehaviorAnalyzer.recordReadingSession(incompleteData as any);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Performance Tests', () => {
    it('يجب أن يعالج جلسات قراءة كثيرة بكفاءة', async () => {
      const startTime = Date.now();

      const sessions = Array.from({ length: 50 }, (_, i) => ({
        ...mockReadingData,
        session_id: `session-${i}`,
        article_id: `article-${i}`,
      }));

      const promises = sessions.map(session =>
        ReadingBehaviorAnalyzer.recordReadingSession(session)
      );

      const results = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // يجب أن ينتهي خلال 10 ثوان
      expect(duration).toBeLessThan(10000);

      // جميع النتائج يجب أن تكون ناجحة
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });
  });
});

describe('Integration Tests', () => {
  it('يجب أن يتعامل مع تدفق كامل لتحليل القراءة', async () => {
    // تسجيل جلسة قراءة
    const sessionResult = await ReadingBehaviorAnalyzer.recordReadingSession(mockReadingData);
    expect(sessionResult.success).toBe(true);

    // الحصول على تحليل المستخدم
    const analysisResult = await ReadingBehaviorAnalyzer.getUserReadingAnalysis('user-123');
    expect(analysisResult.success).toBe(true);
    expect(analysisResult.analysis).toBeDefined();
  });
});
