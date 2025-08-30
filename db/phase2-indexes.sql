-- Phase-2 Database Performance Optimization
-- Critical indexes for performance under 300 VU load
-- Target: P95 ≤ 1.5s, DB queries ≤ 50ms average, no query > 250ms

-- قوائم حسب التصنيف والنشر (Category listings with published status)
CREATE INDEX IF NOT EXISTS idx_articles_cat_pub ON articles(category_id, status, published_at DESC);

-- slug للقراءة السريعة (Fast slug lookups)
CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug) WHERE slug IS NOT NULL;

-- العلاقات داخل التفاصيل (Approved comments with recent first)
CREATE INDEX IF NOT EXISTS idx_comments_art_approved_time ON comments(article_id, is_approved, created_at DESC) WHERE is_approved = true;

-- العلاقات الشائعة في الهيدر/التِريند (Trending articles)
CREATE INDEX IF NOT EXISTS idx_articles_trending ON articles(status, views_count DESC, published_at DESC) WHERE status = 'published';

-- Featured articles optimization
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(is_featured, status, published_at DESC) WHERE is_featured = true AND status = 'published';

-- User articles for author pages
CREATE INDEX IF NOT EXISTS idx_articles_author_status ON articles(author_id, status, published_at DESC);

-- Categories with article counts
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active, name) WHERE is_active = true;

-- Search optimization (if using text search)
CREATE INDEX IF NOT EXISTS idx_articles_search ON articles USING gin(to_tsvector('arabic', title || ' ' || COALESCE(content, ''))) WHERE status = 'published';

-- Performance monitoring: slow query detection
-- This will help identify queries taking > 250ms
-- Enable in PostgreSQL config: log_min_duration_statement = 250

-- Analyze tables after index creation
ANALYZE articles;
ANALYZE comments; 
ANALYZE categories;

-- Baseline performance queries for measurement
-- Run these BEFORE implementing optimizations and save results

-- Test query 1: Homepage articles
EXPLAIN ANALYZE 
SELECT id, title, slug, excerpt, published_at, category_id, views_count
FROM articles 
WHERE status = 'published' 
ORDER BY published_at DESC 
LIMIT 10;

-- Test query 2: Category listings
EXPLAIN ANALYZE
SELECT a.id, a.title, a.slug, a.excerpt, a.published_at, a.views_count,
       c.name as category_name
FROM articles a
JOIN categories c ON c.id = a.category_id
WHERE a.status = 'published' AND a.category_id = 1
ORDER BY a.published_at DESC
LIMIT 20;

-- Test query 3: Single article with comments
EXPLAIN ANALYZE
SELECT a.*, 
       (SELECT COUNT(*) FROM comments WHERE article_id = a.id AND is_approved = true) as comment_count
FROM articles a
WHERE a.slug = 'sample-slug' AND a.status = 'published';

-- Test query 4: Trending articles
EXPLAIN ANALYZE
SELECT id, title, slug, views_count, published_at
FROM articles
WHERE status = 'published'
ORDER BY views_count DESC, published_at DESC
LIMIT 5;

-- Test query 5: Featured articles
EXPLAIN ANALYZE
SELECT id, title, slug, excerpt, published_at, image_url
FROM articles
WHERE status = 'published' AND is_featured = true
ORDER BY published_at DESC
LIMIT 6;
