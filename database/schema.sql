-- 🗄️ مخطط قاعدة بيانات صحيفة سبق
-- Database: sabq_ai_cms
-- Platform: Supabase/PostgreSQL

-- تفعيل الإضافات المطلوبة
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- للبحث النصي المتقدم

-- جدول الأقسام
CREATE TABLE IF NOT EXISTS sections (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#00BFFF',
    icon TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- جدول الأدوار
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    is_system BOOLEAN DEFAULT false, -- أدوار النظام لا يمكن حذفها
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- جدول الصلاحيات
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL, -- articles, users, system, etc
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- جدول ربط الأدوار بالصلاحيات
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INT REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INT REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id)
);

-- جدول المستخدمين المحدّث
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT,
    avatar_url TEXT,
    role_id INT REFERENCES roles(id),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending', 'archived')),
    phone TEXT,
    bio TEXT,
    last_login_at TIMESTAMP,
    email_verified_at TIMESTAMP,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret TEXT,
    invite_token TEXT UNIQUE,
    invited_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- جدول الصلاحيات الإضافية للمستخدمين
CREATE TABLE IF NOT EXISTS user_permissions (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    permission_id INT REFERENCES permissions(id) ON DELETE CASCADE,
    granted BOOLEAN DEFAULT true, -- true للإضافة، false للإلغاء
    expires_at TIMESTAMP, -- صلاحية مؤقتة
    granted_by UUID REFERENCES users(id),
    reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, permission_id)
);

-- جدول ربط المستخدمين بالأقسام
CREATE TABLE IF NOT EXISTS user_sections (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    section_id INT REFERENCES sections(id) ON DELETE CASCADE,
    can_publish BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, section_id)
);

-- جدول سجل نشاطات المستخدمين
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_type TEXT, -- article, user, category, etc
    target_id TEXT,
    target_title TEXT,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- جدول جلسات المستخدمين
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    ip_address INET,
    user_agent TEXT,
    last_activity TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- جدول التصنيفات المحدّث
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    parent_id INT REFERENCES categories(id),
    section_id INT REFERENCES sections(id),
    description TEXT,
    seo_title TEXT,
    seo_description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- جدول المقالات المحدّث
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    author_id UUID REFERENCES users(id),
    editor_id UUID REFERENCES users(id),
    category_id INT REFERENCES categories(id),
    section_id INT REFERENCES sections(id),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'scheduled', 'published', 'archived')),
    featured_image TEXT,
    featured_image_caption TEXT,
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT[],
    is_breaking BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    publish_at TIMESTAMP,
    published_at TIMESTAMP,
    views_count INT DEFAULT 0,
    reading_time INT,
    ai_generated_titles JSONB,
    ai_generated_summaries JSONB,
    ai_analysis JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- جدول تاريخ تعديلات المقالات
CREATE TABLE IF NOT EXISTS article_revisions (
    id SERIAL PRIMARY KEY,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    editor_id UUID REFERENCES users(id),
    title TEXT,
    content TEXT,
    summary TEXT,
    change_summary TEXT,
    version INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- جدول الإشعارات
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- جدول تقارير الأداء
CREATE TABLE IF NOT EXISTS user_performance (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    articles_written INT DEFAULT 0,
    articles_edited INT DEFAULT 0,
    articles_published INT DEFAULT 0,
    total_views INT DEFAULT 0,
    avg_reading_time FLOAT,
    breaking_news_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- جدول الدعوات
CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    role_id INT REFERENCES roles(id),
    sections INT[],
    invited_by UUID REFERENCES users(id),
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    accepted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- جدول إعدادات النظام
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- الفهارس لتحسين الأداء
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_articles_author ON articles(author_id);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_published ON articles(published_at);
CREATE INDEX idx_articles_section ON articles(section_id);
CREATE INDEX idx_activity_logs_user ON user_activity_logs(user_id);
CREATE INDEX idx_activity_logs_created ON user_activity_logs(created_at);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- دوال مساعدة
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- تطبيق التحديث التلقائي للوقت
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    
CREATE TRIGGER update_sections_updated_at BEFORE UPDATE ON sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 📊 عرض للمقالات الشائعة
CREATE OR REPLACE VIEW popular_articles AS
SELECT 
    a.*,
    COUNT(DISTINCT uai.user_id) as unique_readers,
    AVG(uai.duration) as avg_reading_time,
    COUNT(CASE WHEN uai.action = 'SHARE' THEN 1 END) as total_shares
FROM articles a
LEFT JOIN user_article_interactions uai ON a.id = uai.article_id
WHERE a.status = 'published'
GROUP BY a.id
ORDER BY unique_readers DESC;

-- 🎯 عرض لتفضيلات المستخدمين المحسوبة
CREATE OR REPLACE VIEW user_category_preferences AS
SELECT 
    uai.user_id,
    a.category,
    COUNT(*) as interaction_count,
    SUM(uai.duration) as total_time_spent,
    AVG(CASE WHEN uai.scroll_depth IS NOT NULL THEN uai.scroll_depth ELSE 0 END) as avg_scroll_depth
FROM user_article_interactions uai
JOIN articles a ON uai.article_id = a.id
WHERE uai.action IN ('VIEW', 'READ')
GROUP BY uai.user_id, a.category
ORDER BY uai.user_id, interaction_count DESC;

-- 🔐 سياسات الأمان (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- سياسات أساسية (يمكن تخصيصها حسب الحاجة)
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Published articles are viewable by everyone" ON articles
    FOR SELECT USING (status = 'published');

CREATE POLICY "Users can create comments" ON comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id); 