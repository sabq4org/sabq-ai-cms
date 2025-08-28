-- تحسينات الأداء لقاعدة بيانات سبق الذكية
-- يجب تشغيل هذه الاستعلامات على قاعدة البيانات لتحسين الأداء

-- ===== INDEXES للمقالات =====

-- Index للبحث بالـ slug والحالة (الأكثر استخداماً)
CREATE INDEX IF NOT EXISTS idx_articles_slug_status 
ON articles(slug, status) 
WHERE status = 'published';

-- Index لترتيب المقالات حسب تاريخ النشر
CREATE INDEX IF NOT EXISTS idx_articles_published_at 
ON articles(published_at DESC) 
WHERE status = 'published' AND published_at IS NOT NULL;

-- Index للمقالات المميزة
CREATE INDEX IF NOT EXISTS idx_articles_featured 
ON articles(is_featured, published_at DESC) 
WHERE status = 'published' AND is_featured = true;

-- Index للمقالات حسب الفئة وتاريخ النشر
CREATE INDEX IF NOT EXISTS idx_articles_category_published 
ON articles(category_id, published_at DESC) 
WHERE status = 'published';

-- Index للمقالات حسب المؤلف
CREATE INDEX IF NOT EXISTS idx_articles_author_published 
ON articles(author_id, published_at DESC) 
WHERE status = 'published';

-- Index للبحث النصي في العنوان والمحتوى
CREATE INDEX IF NOT EXISTS idx_articles_search 
ON articles USING gin(to_tsvector('arabic', title || ' ' || COALESCE(content, ''))) 
WHERE status = 'published';

-- ===== INDEXES للعلاقات =====

-- Index لعلامات المقالات
CREATE INDEX IF NOT EXISTS idx_article_tags_article_id 
ON article_tags(article_id);

CREATE INDEX IF NOT EXISTS idx_article_tags_tag_id 
ON article_tags(tag_id);

-- Index لأصول المقالات (الصور)
CREATE INDEX IF NOT EXISTS idx_news_article_assets_article_id 
ON "NewsArticleAssets"(article_id);

-- Index للتعليقات
CREATE INDEX IF NOT EXISTS idx_comments_article_status 
ON comments(article_id, status) 
WHERE status = 'approved';

CREATE INDEX IF NOT EXISTS idx_comments_parent_created 
ON comments(parent_id, created_at DESC) 
WHERE status = 'approved';

-- ===== INDEXES للفئات والعلامات =====

-- Index للفئات حسب الـ slug
CREATE INDEX IF NOT EXISTS idx_categories_slug 
ON categories(slug) 
WHERE active = true;

-- Index للعلامات حسب الـ slug
CREATE INDEX IF NOT EXISTS idx_tags_slug 
ON tags(slug);

-- ===== INDEXES للمستخدمين والمؤلفين =====

-- Index للمستخدمين حسب البريد الإلكتروني
CREATE INDEX IF NOT EXISTS idx_users_email 
ON users(email) 
WHERE active = true;

-- Index لمؤلفي المقالات حسب الـ slug
CREATE INDEX IF NOT EXISTS idx_article_authors_slug 
ON article_authors(slug) 
WHERE active = true;

-- ===== INDEXES للإحصائيات =====

-- Index للمشاهدات والتفاعلات
CREATE INDEX IF NOT EXISTS idx_articles_stats 
ON articles(views DESC, likes DESC, shares DESC) 
WHERE status = 'published';

-- ===== INDEXES للبحث المتقدم =====

-- Index مركب للبحث المتقدم
CREATE INDEX IF NOT EXISTS idx_articles_advanced_search 
ON articles(category_id, author_id, published_at DESC) 
WHERE status = 'published';

-- ===== تحسينات الجداول =====

-- تحسين جدول المقالات
VACUUM ANALYZE articles;
VACUUM ANALYZE categories;
VACUUM ANALYZE tags;
VACUUM ANALYZE article_tags;
VACUUM ANALYZE comments;

-- ===== إحصائيات الجداول =====

-- تحديث إحصائيات الجداول لتحسين خطط الاستعلام
ANALYZE articles;
ANALYZE categories;
ANALYZE tags;
ANALYZE article_tags;
ANALYZE comments;
ANALYZE users;
ANALYZE article_authors;

-- ===== تحسينات PostgreSQL =====

-- تحسين إعدادات PostgreSQL (يجب تشغيلها من قبل مدير قاعدة البيانات)
/*
-- زيادة shared_buffers
ALTER SYSTEM SET shared_buffers = '256MB';

-- تحسين work_mem
ALTER SYSTEM SET work_mem = '4MB';

-- تحسين maintenance_work_mem
ALTER SYSTEM SET maintenance_work_mem = '64MB';

-- تحسين effective_cache_size
ALTER SYSTEM SET effective_cache_size = '1GB';

-- تحسين random_page_cost
ALTER SYSTEM SET random_page_cost = 1.1;

-- إعادة تحميل الإعدادات
SELECT pg_reload_conf();
*/

-- ===== مراقبة الأداء =====

-- استعلام لمراقبة الاستعلامات البطيئة
/*
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC
LIMIT 10;
*/

-- استعلام لمراقبة استخدام الـ indexes
/*
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
*/

-- ===== تنظيف البيانات القديمة =====

-- حذف المقالات المحذوفة نهائياً (أقدم من 30 يوم)
/*
DELETE FROM articles 
WHERE status = 'deleted' 
AND updated_at < NOW() - INTERVAL '30 days';
*/

-- حذف التعليقات المرفوضة القديمة
/*
DELETE FROM comments 
WHERE status = 'rejected' 
AND created_at < NOW() - INTERVAL '90 days';
*/

-- ===== نصائح إضافية =====

/*
1. تشغيل VACUUM FULL شهرياً لتحسين المساحة
2. مراقبة حجم الجداول والـ indexes
3. استخدام pg_stat_statements لمراقبة الأداء
4. تحديث إحصائيات الجداول أسبوعياً
5. مراقبة استخدام الذاكرة والـ CPU
6. استخدام connection pooling (مثل PgBouncer)
7. تحسين استعلامات N+1 باستخدام include/select
8. استخدام Redis للـ caching
9. تحسين الصور باستخدام CDN
10. مراقبة slow queries وتحسينها
*/

