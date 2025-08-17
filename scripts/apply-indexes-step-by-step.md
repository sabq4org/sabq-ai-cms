# تطبيق الفهارس خطوة بخطوة

## 1. فهارس المقالات الأساسية (الأولوية القصوى)

```sql
-- فهرس المقالات المنشورة
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_status_published
ON articles(status, published_at DESC)
WHERE status = 'published';

-- فهرس slug للبحث السريع
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_slug
ON articles(slug);
```

## 2. فهارس مُقترب (مهم جداً)

```sql
-- فهرس مقالات مُقترب المنشورة
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_muqtarab_articles_published
ON muqtarab_articles(status, publish_at DESC)
WHERE status = 'published';

-- فهرس slug مُقترب
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_muqtarab_articles_slug
ON muqtarab_articles(slug);

-- فهرس الزوايا النشطة
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_muqtarab_corners_active
ON muqtarab_corners(is_active, created_at DESC)
WHERE is_active = true;
```

## 3. فحص الفهارس الموجودة

```sql
-- عرض جميع الفهارس على جدول معين
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'articles'
ORDER BY indexname;

-- فحص حجم الفهارس
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexname::regclass) DESC;
```

## 4. مراقبة تقدم إنشاء الفهارس

```sql
-- عرض العمليات الجارية
SELECT
    pid,
    now() - query_start as duration,
    query
FROM pg_stat_activity
WHERE query LIKE '%CREATE INDEX%'
AND state = 'active';
```

## نصائح مهمة:

1. **CONCURRENTLY**: يسمح بإنشاء الفهرس دون قفل الجدول
2. **IF NOT EXISTS**: يتجنب الأخطاء إذا كان الفهرس موجوداً
3. **WHERE conditions**: يقلل حجم الفهرس (partial index)

## التحقق من فعالية الفهارس بعد التطبيق:

```sql
-- تشغيل EXPLAIN على استعلام نموذجي
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM articles
WHERE status = 'published'
ORDER BY published_at DESC
LIMIT 10;

-- يجب أن تشاهد "Index Scan" بدلاً من "Seq Scan"
```
