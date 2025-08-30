-- 8 critical indexes
CREATE INDEX IF NOT EXISTS idx_articles_cat_pub ON articles(category_id, status, published_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_trending ON articles(status, views_count DESC, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_author_cat ON articles(author_id, category_id);

CREATE INDEX IF NOT EXISTS idx_comments_art_approved_time ON comments(article_id, is_approved, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_time ON user_activities(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_event_time ON analytics_data(event_type, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_article ON bookmarks(user_id, article_id);
