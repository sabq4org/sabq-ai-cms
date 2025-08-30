-- Simple key-value aggregates store
CREATE TABLE IF NOT EXISTS aggregates (
  key VARCHAR(100) PRIMARY KEY,
  value BIGINT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial values
INSERT INTO aggregates (key, value) VALUES
  ('articles_count', 0),
  ('users_count', 0),
  ('comments_count', 0)
ON CONFLICT (key) DO NOTHING;

-- Update function (call from pg_cron every 5min)
CREATE OR REPLACE FUNCTION refresh_aggregates() 
RETURNS void AS $$
BEGIN
  UPDATE aggregates SET value = (SELECT COUNT(*) FROM articles WHERE status = 'published'), updated_at = NOW() WHERE key = 'articles_count';
  UPDATE aggregates SET value = (SELECT COUNT(*) FROM users), updated_at = NOW() WHERE key = 'users_count';  
  UPDATE aggregates SET value = (SELECT COUNT(*) FROM comments WHERE is_approved = true), updated_at = NOW() WHERE key = 'comments_count';
END;
$$ LANGUAGE plpgsql;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_aggregates_key ON aggregates(key);
