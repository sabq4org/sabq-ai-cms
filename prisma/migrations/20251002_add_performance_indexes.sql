-- Migration: Add Performance Indexes for News Detail Page
-- Date: 2025-10-02
-- Purpose: Optimize queries for article detail, related articles, and comments

-- =====================================================
-- 1. Articles Table Indexes
-- =====================================================

-- Index for fast slug lookup (main article query)
-- Status filter is included for published articles
CREATE INDEX CONCURRENTLY IF NOT EXISTS articles_slug_status_idx 
ON articles(slug, status) 
WHERE status = 'published';

-- Index for related articles query (by category)
-- Includes published_at for sorting
CREATE INDEX CONCURRENTLY IF NOT EXISTS articles_category_published_idx 
ON articles(category_id, published_at DESC) 
WHERE status = 'published';

-- Index for views-based sorting (popular articles)
CREATE INDEX CONCURRENTLY IF NOT EXISTS articles_views_published_idx 
ON articles(views DESC, published_at DESC) 
WHERE status = 'published';

-- Full-text search index for Arabic keywords (GIN index)
-- Useful for searching in seo_keywords field
CREATE INDEX CONCURRENTLY IF NOT EXISTS articles_seo_keywords_gin 
ON articles USING gin(to_tsvector('arabic', COALESCE(seo_keywords, '')));

-- Composite index for breaking news
CREATE INDEX CONCURRENTLY IF NOT EXISTS articles_breaking_published_idx 
ON articles(breaking, published_at DESC) 
WHERE status = 'published' AND breaking = true;

-- =====================================================
-- 2. Comments Table Indexes
-- =====================================================

-- Composite index for fetching article comments
-- Includes parent_id for threaded comments
CREATE INDEX CONCURRENTLY IF NOT EXISTS comments_article_parent_status_idx 
ON comments(article_id, parent_id, status, created_at DESC);

-- Index for counting approved comments per article
CREATE INDEX CONCURRENTLY IF NOT EXISTS comments_article_status_count_idx 
ON comments(article_id, status) 
WHERE status = 'approved';

-- Index for user's comments (for user profile)
CREATE INDEX CONCURRENTLY IF NOT EXISTS comments_user_created_idx 
ON comments(user_id, created_at DESC) 
WHERE status = 'approved';

-- =====================================================
-- 3. Categories Table Indexes
-- =====================================================

-- Index for category lookup by slug (if not exists)
CREATE INDEX CONCURRENTLY IF NOT EXISTS categories_slug_idx 
ON categories(slug);

-- =====================================================
-- 4. Article Authors Table Indexes
-- =====================================================

-- Index for author lookup by slug (if not exists)
CREATE INDEX CONCURRENTLY IF NOT EXISTS article_authors_slug_idx 
ON article_authors(slug);

-- =====================================================
-- 5. Users Table Indexes
-- =====================================================

-- Index for user lookup in comments join (if not exists)
CREATE INDEX CONCURRENTLY IF NOT EXISTS users_id_name_idx 
ON users(id, name);

-- =====================================================
-- 6. Interactions Table Indexes (Likes/Saves)
-- =====================================================

-- Index for checking user interactions
CREATE INDEX CONCURRENTLY IF NOT EXISTS interactions_article_user_type_idx 
ON interactions(article_id, user_id, interaction_type);

-- Index for counting interactions per article
CREATE INDEX CONCURRENTLY IF NOT EXISTS interactions_article_type_count_idx 
ON interactions(article_id, interaction_type);

-- =====================================================
-- 7. Optional: Materialized View for Popular Articles
-- =====================================================

-- Create materialized view for caching popular articles
CREATE MATERIALIZED VIEW IF NOT EXISTS popular_articles_mv AS
SELECT 
  a.id,
  a.title,
  a.slug,
  a.excerpt,
  a.featured_image,
  a.published_at,
  a.views,
  a.reading_time,
  a.category_id,
  c.name as category_name,
  c.slug as category_slug,
  c.color as category_color
FROM articles a
LEFT JOIN categories c ON a.category_id = c.id
WHERE a.status = 'published'
ORDER BY a.views DESC, a.published_at DESC
LIMIT 100;

-- Index on the materialized view
CREATE INDEX IF NOT EXISTS popular_articles_mv_category_idx 
ON popular_articles_mv(category_id);

CREATE INDEX IF NOT EXISTS popular_articles_mv_views_idx 
ON popular_articles_mv(views DESC);

-- =====================================================
-- 8. Verification Queries
-- =====================================================

-- To verify indexes were created, run:
-- SELECT schemaname, tablename, indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename IN ('articles', 'comments', 'categories', 'article_authors', 'interactions')
-- ORDER BY tablename, indexname;

-- To check index usage:
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes
-- WHERE tablename IN ('articles', 'comments')
-- ORDER BY idx_scan DESC;

-- =====================================================
-- 9. Maintenance Functions
-- =====================================================

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_popular_articles_mv()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY popular_articles_mv;
  RAISE NOTICE 'Popular articles materialized view refreshed at %', now();
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission (adjust role as needed)
-- GRANT EXECUTE ON FUNCTION refresh_popular_articles_mv() TO your_app_user;

-- =====================================================
-- 10. Scheduled Refresh (if pg_cron is available)
-- =====================================================

-- Uncomment if you have pg_cron extension
-- SELECT cron.schedule(
--   'refresh-popular-articles-mv',
--   '*/5 * * * *',  -- Every 5 minutes
--   'SELECT refresh_popular_articles_mv();'
-- );

-- =====================================================
-- Notes:
-- =====================================================
-- 1. CONCURRENTLY ensures indexes are built without locking the table
-- 2. Partial indexes (WHERE clause) reduce index size and improve performance
-- 3. GIN index for full-text search supports Arabic text
-- 4. Materialized view should be refreshed periodically (cron or manual)
-- 5. Monitor index usage with pg_stat_user_indexes
-- 6. Consider ANALYZE after creating indexes for query planner

-- Run ANALYZE to update statistics
ANALYZE articles;
ANALYZE comments;
ANALYZE categories;
ANALYZE interactions;

