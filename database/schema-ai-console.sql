-- جداول إضافية للوحة سبق الذكية

-- جدول تفاعلات الذكاء الاصطناعي
CREATE TABLE IF NOT EXISTS ai_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL, -- generate_title, generate_summary, analyze_content, etc
    request_data JSONB NOT NULL,
    response_data JSONB,
    tokens_used INT DEFAULT 0,
    processing_time_ms INT,
    was_accepted BOOLEAN, -- هل تم اعتماد النتيجة
    feedback TEXT,
    article_id UUID REFERENCES articles(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- جدول رؤى المحتوى
CREATE TABLE IF NOT EXISTS content_insights (
    id SERIAL PRIMARY KEY,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    ai_score FLOAT, -- تقييم جودة المقال (0-100)
    seo_score FLOAT, -- تقييم SEO (0-100)
    readability_score FLOAT, -- سهولة القراءة (0-100)
    engagement_prediction FLOAT, -- توقع التفاعل
    recommendations JSONB, -- توصيات التحسين
    similar_articles UUID[], -- مقالات مشابهة
    optimal_publish_time TIMESTAMP,
    keywords_analysis JSONB,
    sentiment_analysis JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- جدول تنبيهات النظام
CREATE TABLE IF NOT EXISTS system_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_type TEXT NOT NULL, -- performance, security, content, ai, system
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB,
    is_resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- جدول مؤشرات الأداء
CREATE TABLE IF NOT EXISTS performance_metrics (
    id SERIAL PRIMARY KEY,
    metric_type TEXT NOT NULL, -- page_views, active_users, articles_published, etc
    value NUMERIC NOT NULL,
    metadata JSONB,
    recorded_at TIMESTAMP DEFAULT NOW()
);

-- جدول سلوك المحررين
CREATE TABLE IF NOT EXISTS editor_behavior (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    ai_usage_count INT DEFAULT 0,
    ai_acceptance_rate FLOAT,
    avg_writing_time_minutes FLOAT,
    avg_editing_time_minutes FLOAT,
    articles_started INT DEFAULT 0,
    articles_completed INT DEFAULT 0,
    peak_activity_hour INT,
    most_used_ai_features JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- جدول التقارير التلقائية
CREATE TABLE IF NOT EXISTS automated_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_type TEXT NOT NULL, -- daily, weekly, monthly, custom
    title TEXT NOT NULL,
    summary TEXT,
    full_report JSONB NOT NULL,
    insights JSONB,
    recommendations JSONB,
    generated_by TEXT DEFAULT 'AI', -- AI or user_id
    report_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- إضافة أعمدة للذكاء الاصطناعي في جدول المقالات
ALTER TABLE articles ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT false;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS ai_score FLOAT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS ai_recommendations JSONB;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS content_quality_score FLOAT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS last_ai_analysis TIMESTAMP;

-- جدول محاولات الدخول
CREATE TABLE IF NOT EXISTS login_attempts (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT false,
    failure_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- جدول سجل تغييرات الصلاحيات
CREATE TABLE IF NOT EXISTS permission_changes (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES users(id),
    change_type TEXT NOT NULL, -- role_change, permission_grant, permission_revoke
    old_value JSONB,
    new_value JSONB,
    reason TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- جدول تتبع المحتوى الفاشل
CREATE TABLE IF NOT EXISTS failed_content (
    id SERIAL PRIMARY KEY,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    failure_type TEXT NOT NULL, -- publish_error, validation_error, ai_error
    error_message TEXT,
    error_details JSONB,
    retry_count INT DEFAULT 0,
    resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- الفهارس لتحسين الأداء
CREATE INDEX idx_ai_interactions_user ON ai_interactions(user_id);
CREATE INDEX idx_ai_interactions_type ON ai_interactions(interaction_type);
CREATE INDEX idx_ai_interactions_created ON ai_interactions(created_at);

CREATE INDEX idx_content_insights_article ON content_insights(article_id);
CREATE INDEX idx_content_insights_scores ON content_insights(ai_score, seo_score);

CREATE INDEX idx_system_alerts_type ON system_alerts(alert_type);
CREATE INDEX idx_system_alerts_severity ON system_alerts(severity);
CREATE INDEX idx_system_alerts_resolved ON system_alerts(is_resolved);

CREATE INDEX idx_performance_metrics_type ON performance_metrics(metric_type);
CREATE INDEX idx_performance_metrics_recorded ON performance_metrics(recorded_at);

CREATE INDEX idx_editor_behavior_user_date ON editor_behavior(user_id, date);

CREATE INDEX idx_login_attempts_email ON login_attempts(email);
CREATE INDEX idx_login_attempts_created ON login_attempts(created_at);

-- Views مفيدة للوحة
CREATE OR REPLACE VIEW v_hourly_activity AS
SELECT 
    DATE_TRUNC('hour', created_at) as hour,
    COUNT(*) as activity_count,
    COUNT(DISTINCT user_id) as unique_users
FROM user_activity_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;

CREATE OR REPLACE VIEW v_ai_usage_stats AS
SELECT 
    interaction_type,
    COUNT(*) as usage_count,
    AVG(CASE WHEN was_accepted THEN 1 ELSE 0 END) * 100 as acceptance_rate,
    AVG(processing_time_ms) as avg_processing_time
FROM ai_interactions
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY interaction_type;

CREATE OR REPLACE VIEW v_content_performance AS
SELECT 
    a.id,
    a.title,
    a.views_count,
    ci.ai_score,
    ci.engagement_prediction,
    COUNT(DISTINCT ual.user_id) as unique_viewers
FROM articles a
LEFT JOIN content_insights ci ON a.id = ci.article_id
LEFT JOIN user_article_interactions ual ON a.id = ual.article_id
WHERE a.published_at > NOW() - INTERVAL '24 hours'
GROUP BY a.id, a.title, a.views_count, ci.ai_score, ci.engagement_prediction
ORDER BY a.views_count DESC; 