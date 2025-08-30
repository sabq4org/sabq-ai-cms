-- Aggregates table to eliminate expensive COUNT(*) operations
-- Updated every 5 minutes by background job

CREATE TABLE IF NOT EXISTS aggregates (
    key VARCHAR(255) PRIMARY KEY,
    value BIGINT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initial aggregates population
INSERT INTO aggregates (key, value, updated_at) VALUES
('articles:published_count', 0, NOW()),
('articles:draft_count', 0, NOW()),
('articles:total_views', 0, NOW()),
('comments:approved_count', 0, NOW()),
('users:active_count', 0, NOW()),
('categories:with_articles', 0, NOW())
ON CONFLICT (key) DO NOTHING;

-- Function to update aggregates (called by cron job every 5 minutes)
CREATE OR REPLACE FUNCTION update_aggregates()
RETURNS void AS $$
BEGIN
    -- Published articles count
    INSERT INTO aggregates (key, value, updated_at)
    SELECT 'articles:published_count', COUNT(*), NOW()
    FROM articles WHERE status = 'published'
    ON CONFLICT (key) DO UPDATE SET 
        value = EXCLUDED.value, 
        updated_at = EXCLUDED.updated_at;

    -- Draft articles count
    INSERT INTO aggregates (key, value, updated_at)
    SELECT 'articles:draft_count', COUNT(*), NOW()
    FROM articles WHERE status = 'draft'
    ON CONFLICT (key) DO UPDATE SET 
        value = EXCLUDED.value, 
        updated_at = EXCLUDED.updated_at;

    -- Total views across all articles
    INSERT INTO aggregates (key, value, updated_at)
    SELECT 'articles:total_views', COALESCE(SUM(views_count), 0), NOW()
    FROM articles WHERE status = 'published'
    ON CONFLICT (key) DO UPDATE SET 
        value = EXCLUDED.value, 
        updated_at = EXCLUDED.updated_at;

    -- Approved comments count
    INSERT INTO aggregates (key, value, updated_at)
    SELECT 'comments:approved_count', COUNT(*), NOW()
    FROM comments WHERE is_approved = true
    ON CONFLICT (key) DO UPDATE SET 
        value = EXCLUDED.value, 
        updated_at = EXCLUDED.updated_at;

    -- Active users count (logged in within last 30 days)
    INSERT INTO aggregates (key, value, updated_at)
    SELECT 'users:active_count', COUNT(*), NOW()
    FROM users WHERE last_login_at > NOW() - INTERVAL '30 days'
    ON CONFLICT (key) DO UPDATE SET 
        value = EXCLUDED.value, 
        updated_at = EXCLUDED.updated_at;

    -- Categories with articles
    INSERT INTO aggregates (key, value, updated_at)
    SELECT 'categories:with_articles', COUNT(DISTINCT category_id), NOW()
    FROM articles WHERE status = 'published'
    ON CONFLICT (key) DO UPDATE SET 
        value = EXCLUDED.value, 
        updated_at = EXCLUDED.updated_at;

END;
$$ LANGUAGE plpgsql;

-- Create index on aggregates for fast lookups
CREATE INDEX IF NOT EXISTS idx_aggregates_key ON aggregates(key);
CREATE INDEX IF NOT EXISTS idx_aggregates_updated ON aggregates(updated_at);

-- Initial population
SELECT update_aggregates();
