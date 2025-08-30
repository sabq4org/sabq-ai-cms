/**
 * تحسينات قاعدة البيانات - إضافة فهارس (Indexes) للجداول الأساسية
 * تطبيق توصيات تقرير اختبار التحمل للحصول على P95 < 1.5s
 */

// فهارس الجداول الأساسية
const DATABASE_INDEXES = `
-- 1. فهارس جدول المقالات (Articles)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_published_date 
  ON "Article" (published_at DESC) 
  WHERE published_at IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_category_published 
  ON "Article" (category_id, published_at DESC) 
  WHERE published_at IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_author_published 
  ON "Article" (author_id, published_at DESC) 
  WHERE published_at IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_slug 
  ON "Article" (slug) 
  WHERE slug IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_status 
  ON "Article" (status) 
  WHERE status IN ('published', 'draft');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_featured 
  ON "Article" (is_featured, published_at DESC) 
  WHERE is_featured = true AND published_at IS NOT NULL;

-- 2. فهارس جدول التصنيفات (Categories)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_slug 
  ON "Category" (slug) 
  WHERE slug IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_parent 
  ON "Category" (parent_id) 
  WHERE parent_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_active 
  ON "Category" (is_active) 
  WHERE is_active = true;

-- 3. فهارس جدول المستخدمين (Users)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email 
  ON "User" (email) 
  WHERE email IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role 
  ON "User" (role) 
  WHERE role IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_status 
  ON "User" (status) 
  WHERE status IS NOT NULL;

-- 4. فهارس جدول التعليقات (Comments)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_article_created 
  ON "Comment" (article_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_user 
  ON "Comment" (user_id) 
  WHERE user_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_status 
  ON "Comment" (status) 
  WHERE status IN ('approved', 'pending');

-- 5. فهارس جدول التفاعلات (Interactions)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_interactions_article_type 
  ON "Interaction" (article_id, type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_interactions_user_article 
  ON "Interaction" (user_id, article_id) 
  WHERE user_id IS NOT NULL;

-- 6. فهارس جدول الإشعارات (Notifications)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_read 
  ON "Notification" (user_id, is_read, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_type 
  ON "Notification" (type, created_at DESC);

-- 7. فهارس البحث النصي (Full Text Search)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_search_ar 
  ON "Article" USING gin(to_tsvector('arabic', title || ' ' || COALESCE(content, ''))) 
  WHERE published_at IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_search_en 
  ON "Article" USING gin(to_tsvector('english', title || ' ' || COALESCE(content, ''))) 
  WHERE published_at IS NOT NULL;
`;

// إحصائيات وتحليل الأداء
const PERFORMANCE_ANALYSIS = `
-- تحليل استخدام الفهارس
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_tup_read,
  idx_tup_fetch,
  CASE 
    WHEN idx_tup_read > 0 
    THEN round((idx_tup_fetch::decimal / idx_tup_read) * 100, 2)
    ELSE 0
  END as hit_rate
FROM pg_stat_user_indexes
ORDER BY idx_tup_read DESC;

-- تحليل الاستعلامات البطيئة
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  stddev_time,
  rows,
  100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
WHERE mean_time > 100  -- الاستعلامات التي تستغرق أكثر من 100ms
ORDER BY mean_time DESC
LIMIT 10;

-- حجم الجداول والفهارس
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
  pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as indexes_size
FROM pg_tables
WHERE schemaname NOT IN ('information_schema','pg_catalog')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
`;

// تكوين محسن لقاعدة البيانات
const OPTIMIZED_DB_CONFIG = {
  // إعدادات Connection Pool
  connectionPool: {
    max: 20,                    // الحد الأقصى للاتصالات
    min: 5,                     // الحد الأدنى للاتصالات
    idle: 10000,                // وقت الخمول قبل الإغلاق (10s)
    acquire: 30000,             // مهلة الحصول على اتصال (30s)
    evict: 30000,              // فترة فحص الاتصالات الميتة (30s)
    handleDisconnects: true     // إعادة الاتصال التلقائي
  },

  // إعدادات Query Optimization
  queryOptimization: {
    enableQueryLogging: process.env.NODE_ENV === 'development',
    logQueries: true,
    logParameters: false,       // لا نسجل المعاملات لأمان البيانات
    slowQueryThreshold: 100,    // تسجيل الاستعلامات البطيئة (>100ms)
    enableStatements: true,     // تمكين pg_stat_statements
    maxConnections: 100,        // الحد الأقصى للاتصالات
    sharedBuffers: '256MB',     // حجم الذاكرة المشتركة
    effectiveCacheSize: '1GB',  // حجم الذاكرة المتاحة
    workMem: '16MB',           // ذاكرة العمل لكل استعلام
    maintenanceWorkMem: '64MB', // ذاكرة الصيانة
    checkpointCompletionTarget: 0.9,
    walBuffers: '16MB',
    defaultStatisticsTarget: 100
  },

  // إعدادات الفهارس
  indexStrategy: {
    // استراتيجية إنشاء الفهارس تدريجياً لتجنب إيقاف الخدمة
    createConcurrently: true,
    
    // فهارس مركبة للاستعلامات الشائعة
    compositeIndexes: [
      { table: 'Article', columns: ['category_id', 'published_at', 'status'] },
      { table: 'Article', columns: ['author_id', 'published_at', 'status'] },
      { table: 'Comment', columns: ['article_id', 'status', 'created_at'] },
      { table: 'Interaction', columns: ['user_id', 'article_id', 'type'] },
      { table: 'Notification', columns: ['user_id', 'is_read', 'created_at'] }
    ],

    // فهارس البحث النصي
    fullTextIndexes: [
      { table: 'Article', columns: ['title', 'content'], language: 'arabic' },
      { table: 'Article', columns: ['title', 'content'], language: 'english' }
    ]
  }
};

export { DATABASE_INDEXES, PERFORMANCE_ANALYSIS, OPTIMIZED_DB_CONFIG };
