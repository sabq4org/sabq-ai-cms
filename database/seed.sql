-- إدراج الأقسام الأساسية
INSERT INTO sections (name, slug, description, color, icon) VALUES
('أخبار محلية', 'local-news', 'الأخبار المحلية والوطنية', '#1E40AF', 'flag'),
('رياضة', 'sports', 'الأخبار الرياضية', '#DC2626', 'football'),
('اقتصاد', 'economy', 'الأخبار الاقتصادية والمالية', '#059669', 'trending-up'),
('تقنية', 'technology', 'أخبار التقنية والابتكار', '#7C3AED', 'cpu'),
('ثقافة وفن', 'culture', 'الأخبار الثقافية والفنية', '#DB2777', 'palette'),
('صحة', 'health', 'الأخبار الصحية والطبية', '#0891B2', 'heart'),
('سياسة', 'politics', 'الأخبار السياسية', '#991B1B', 'building'),
('عالمية', 'international', 'الأخبار العالمية', '#1F2937', 'globe');

-- إدراج الأدوار الأساسية
INSERT INTO roles (name, slug, description, is_system) VALUES
('مشرف عام', 'super-admin', 'صلاحيات كاملة على النظام', true),
('رئيس تحرير', 'editor-in-chief', 'إدارة المحتوى التحريري والفريق', true),
('نائب رئيس تحرير', 'deputy-editor', 'مساعدة رئيس التحرير في المهام', true),
('محرر', 'editor', 'كتابة وتحرير المقالات', true),
('محرر أقسام', 'section-editor', 'إدارة محتوى قسم معين', true),
('مراسل', 'reporter', 'جمع الأخبار وكتابة التقارير', true),
('مدقق لغوي', 'proofreader', 'تدقيق المحتوى لغوياً', true),
('مدير وسائط', 'media-manager', 'إدارة الصور والفيديوهات', true),
('محلل بيانات', 'data-analyst', 'تحليل الأداء والإحصائيات', true),
('مشاهد', 'viewer', 'مشاهدة المحتوى فقط', true),
('متعاون', 'contributor', 'كاتب متعاون خارجي', false);

-- إدراج الصلاحيات
-- صلاحيات المقالات
INSERT INTO permissions (name, slug, category, description) VALUES
('عرض جميع المقالات', 'articles.view.all', 'articles', 'عرض جميع المقالات بغض النظر عن القسم'),
('عرض مقالات القسم', 'articles.view.section', 'articles', 'عرض المقالات في الأقسام المسموح بها فقط'),
('إنشاء مقال', 'articles.create', 'articles', 'إنشاء مقالات جديدة'),
('تعديل مقالاتي', 'articles.edit.own', 'articles', 'تعديل المقالات التي أنشأها المستخدم'),
('تعديل جميع المقالات', 'articles.edit.all', 'articles', 'تعديل أي مقال'),
('حذف مقالاتي', 'articles.delete.own', 'articles', 'حذف المقالات التي أنشأها المستخدم'),
('حذف جميع المقالات', 'articles.delete.all', 'articles', 'حذف أي مقال'),
('نشر مقالات', 'articles.publish', 'articles', 'نشر المقالات على الموقع'),
('جدولة مقالات', 'articles.schedule', 'articles', 'جدولة نشر المقالات'),
('أرشفة مقالات', 'articles.archive', 'articles', 'أرشفة المقالات');

-- صلاحيات الأخبار الخاصة
INSERT INTO permissions (name, slug, category, description) VALUES
('نشر أخبار عاجلة', 'news.breaking.publish', 'articles', 'نشر الأخبار العاجلة'),
('تثبيت أخبار', 'news.pin', 'articles', 'تثبيت الأخبار في الواجهة'),
('إبراز أخبار', 'news.feature', 'articles', 'وضع الأخبار كمميزة');

-- صلاحيات المحتوى
INSERT INTO permissions (name, slug, category, description) VALUES
('تعديل SEO', 'content.seo.edit', 'content', 'تعديل إعدادات تحسين محركات البحث'),
('إدارة التصنيفات', 'content.categories.manage', 'content', 'إضافة وتعديل وحذف التصنيفات'),
('إدارة الوسائط', 'content.media.manage', 'content', 'رفع وإدارة الصور والفيديوهات'),
('إدارة التعليقات', 'content.comments.manage', 'content', 'مراجعة وإدارة التعليقات');

-- صلاحيات المستخدمين
INSERT INTO permissions (name, slug, category, description) VALUES
('عرض المستخدمين', 'users.view', 'users', 'عرض قائمة المستخدمين'),
('إنشاء مستخدمين', 'users.create', 'users', 'إنشاء مستخدمين جدد'),
('تعديل المستخدمين', 'users.edit', 'users', 'تعديل بيانات المستخدمين'),
('حذف المستخدمين', 'users.delete', 'users', 'حذف المستخدمين'),
('إدارة الأدوار', 'users.roles.manage', 'users', 'إدارة الأدوار والصلاحيات'),
('إرسال دعوات', 'users.invite', 'users', 'إرسال دعوات للمستخدمين الجدد'),
('تعليق المستخدمين', 'users.suspend', 'users', 'تعليق أو إيقاف المستخدمين');

-- صلاحيات النظام
INSERT INTO permissions (name, slug, category, description) VALUES
('عرض الإحصائيات', 'system.stats.view', 'system', 'عرض إحصائيات الموقع'),
('عرض سجل النشاطات', 'system.logs.view', 'system', 'عرض سجل نشاطات المستخدمين'),
('إدارة الإعدادات', 'system.settings.manage', 'system', 'تعديل إعدادات النظام'),
('إرسال إشعارات', 'system.notifications.send', 'system', 'إرسال إشعارات للمستخدمين'),
('الوصول للتقارير المتقدمة', 'system.reports.advanced', 'system', 'الوصول للتقارير والتحليلات المتقدمة');

-- صلاحيات الذكاء الاصطناعي
INSERT INTO permissions (name, slug, category, description) VALUES
('استخدام محرر AI', 'ai.editor.use', 'ai', 'استخدام أدوات الذكاء الاصطناعي للتحرير'),
('توليد عناوين AI', 'ai.titles.generate', 'ai', 'توليد عناوين باستخدام AI'),
('توليد ملخصات AI', 'ai.summaries.generate', 'ai', 'توليد ملخصات باستخدام AI'),
('تحليل محتوى AI', 'ai.analysis.use', 'ai', 'استخدام تحليل AI للمحتوى');

-- ربط الصلاحيات بالأدوار
-- مشرف عام - جميع الصلاحيات
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;

-- رئيس تحرير
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions WHERE slug IN (
    'articles.view.all', 'articles.create', 'articles.edit.all', 'articles.delete.all',
    'articles.publish', 'articles.schedule', 'articles.archive',
    'news.breaking.publish', 'news.pin', 'news.feature',
    'content.seo.edit', 'content.categories.manage', 'content.media.manage', 'content.comments.manage',
    'users.view', 'users.create', 'users.edit', 'users.invite', 'users.suspend',
    'system.stats.view', 'system.logs.view', 'system.notifications.send', 'system.reports.advanced',
    'ai.editor.use', 'ai.titles.generate', 'ai.summaries.generate', 'ai.analysis.use'
);

-- نائب رئيس تحرير
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions WHERE slug IN (
    'articles.view.all', 'articles.create', 'articles.edit.all', 'articles.delete.own',
    'articles.publish', 'articles.schedule', 'articles.archive',
    'news.breaking.publish', 'news.pin', 'news.feature',
    'content.seo.edit', 'content.categories.manage', 'content.media.manage', 'content.comments.manage',
    'users.view', 'users.invite',
    'system.stats.view', 'system.logs.view',
    'ai.editor.use', 'ai.titles.generate', 'ai.summaries.generate', 'ai.analysis.use'
);

-- محرر
INSERT INTO role_permissions (role_id, permission_id)
SELECT 4, id FROM permissions WHERE slug IN (
    'articles.view.all', 'articles.create', 'articles.edit.own', 'articles.delete.own',
    'articles.schedule',
    'content.media.manage',
    'system.stats.view',
    'ai.editor.use', 'ai.titles.generate', 'ai.summaries.generate'
);

-- محرر أقسام
INSERT INTO role_permissions (role_id, permission_id)
SELECT 5, id FROM permissions WHERE slug IN (
    'articles.view.section', 'articles.create', 'articles.edit.all', 'articles.delete.own',
    'articles.publish', 'articles.schedule',
    'content.seo.edit', 'content.media.manage',
    'system.stats.view',
    'ai.editor.use', 'ai.titles.generate', 'ai.summaries.generate'
);

-- مراسل
INSERT INTO role_permissions (role_id, permission_id)
SELECT 6, id FROM permissions WHERE slug IN (
    'articles.view.section', 'articles.create', 'articles.edit.own',
    'content.media.manage',
    'ai.editor.use'
);

-- مدقق لغوي
INSERT INTO role_permissions (role_id, permission_id)
SELECT 7, id FROM permissions WHERE slug IN (
    'articles.view.all', 'articles.edit.all',
    'ai.editor.use'
);

-- مدير وسائط
INSERT INTO role_permissions (role_id, permission_id)
SELECT 8, id FROM permissions WHERE slug IN (
    'articles.view.all',
    'content.media.manage'
);

-- محلل بيانات
INSERT INTO role_permissions (role_id, permission_id)
SELECT 9, id FROM permissions WHERE slug IN (
    'articles.view.all',
    'system.stats.view', 'system.logs.view', 'system.reports.advanced'
);

-- مشاهد
INSERT INTO role_permissions (role_id, permission_id)
SELECT 10, id FROM permissions WHERE slug IN (
    'articles.view.all'
);

-- متعاون
INSERT INTO role_permissions (role_id, permission_id)
SELECT 11, id FROM permissions WHERE slug IN (
    'articles.view.section', 'articles.create', 'articles.edit.own',
    'content.media.manage'
);

-- إدراج مستخدمين للاختبار
INSERT INTO users (email, name, role_id, status, phone) VALUES
('admin@sabq.org', 'مدير النظام', 1, 'active', '+966501234567'),
('editor@sabq.org', 'أحمد الشمري', 2, 'active', '+966502345678'),
('deputy@sabq.org', 'فاطمة العتيبي', 3, 'active', '+966503456789'),
('writer1@sabq.org', 'خالد القحطاني', 4, 'active', '+966504567890'),
('sports_editor@sabq.org', 'عبدالله الدوسري', 5, 'active', '+966505678901'),
('reporter@sabq.org', 'نورة الحربي', 6, 'active', '+966506789012'),
('proofreader@sabq.org', 'محمد الزهراني', 7, 'active', '+966507890123'),
('media@sabq.org', 'سارة المطيري', 8, 'active', '+966508901234');

-- ربط المستخدمين بالأقسام
-- محرر الرياضة - قسم الرياضة فقط
INSERT INTO user_sections (user_id, section_id, can_publish) 
SELECT u.id, 2, true FROM users u WHERE u.email = 'sports_editor@sabq.org';

-- المحرر العادي - أقسام متعددة
INSERT INTO user_sections (user_id, section_id, can_publish) 
SELECT u.id, s.id, false 
FROM users u, sections s 
WHERE u.email = 'writer1@sabq.org' AND s.slug IN ('local-news', 'economy', 'technology');

-- المراسل - أخبار محلية وعالمية
INSERT INTO user_sections (user_id, section_id, can_publish) 
SELECT u.id, s.id, false 
FROM users u, sections s 
WHERE u.email = 'reporter@sabq.org' AND s.slug IN ('local-news', 'international');

-- إدراج تصنيفات
INSERT INTO categories (name, slug, section_id, description) VALUES
-- تصنيفات الأخبار المحلية
('أخبار الرياض', 'riyadh-news', 1, 'أخبار منطقة الرياض'),
('أخبار مكة', 'makkah-news', 1, 'أخبار منطقة مكة المكرمة'),
('أخبار المدينة', 'madinah-news', 1, 'أخبار منطقة المدينة المنورة'),
-- تصنيفات الرياضة
('كرة القدم', 'football', 2, 'أخبار كرة القدم المحلية والعالمية'),
('كرة السلة', 'basketball', 2, 'أخبار كرة السلة'),
('رياضات أخرى', 'other-sports', 2, 'باقي الرياضات'),
-- تصنيفات الاقتصاد
('أسواق المال', 'stock-markets', 3, 'أخبار البورصة والأسواق المالية'),
('الأعمال', 'business', 3, 'أخبار الشركات والأعمال'),
('الطاقة', 'energy', 3, 'أخبار النفط والطاقة');

-- إدراج مقالات تجريبية
INSERT INTO articles (
    title, slug, content, summary, 
    author_id, category_id, section_id, 
    status, is_featured, views_count, reading_time,
    published_at
) VALUES
(
    'رؤية 2030 تحقق إنجازات جديدة في قطاع التقنية',
    'vision-2030-tech-achievements',
    'حققت رؤية المملكة 2030 إنجازات متميزة في قطاع التقنية والتحول الرقمي...',
    'تقرير عن أحدث إنجازات رؤية 2030 في مجال التقنية والابتكار',
    (SELECT id FROM users WHERE email = 'writer1@sabq.org'),
    (SELECT id FROM categories WHERE slug = 'business'),
    4,
    'published',
    true,
    1523,
    5,
    NOW() - INTERVAL '2 hours'
),
(
    'الهلال يتأهل لنهائي دوري أبطال آسيا',
    'alhilal-afc-final',
    'تأهل نادي الهلال السعودي إلى نهائي دوري أبطال آسيا بعد فوزه الكبير...',
    'الهلال يحجز مقعده في نهائي البطولة الآسيوية',
    (SELECT id FROM users WHERE email = 'sports_editor@sabq.org'),
    (SELECT id FROM categories WHERE slug = 'football'),
    2,
    'published',
    true,
    3421,
    3,
    NOW() - INTERVAL '5 hours'
);

-- إدراج نشاطات تجريبية
INSERT INTO user_activity_logs (user_id, action, target_type, target_id, target_title) VALUES
((SELECT id FROM users WHERE email = 'writer1@sabq.org'), 'CREATE_ARTICLE', 'article', 
 (SELECT id::text FROM articles WHERE slug = 'vision-2030-tech-achievements'), 
 'رؤية 2030 تحقق إنجازات جديدة في قطاع التقنية'),
((SELECT id FROM users WHERE email = 'editor@sabq.org'), 'PUBLISH_ARTICLE', 'article', 
 (SELECT id::text FROM articles WHERE slug = 'vision-2030-tech-achievements'), 
 'رؤية 2030 تحقق إنجازات جديدة في قطاع التقنية'),
((SELECT id FROM users WHERE email = 'sports_editor@sabq.org'), 'CREATE_ARTICLE', 'article', 
 (SELECT id::text FROM articles WHERE slug = 'alhilal-afc-final'), 
 'الهلال يتأهل لنهائي دوري أبطال آسيا');

-- إدراج إعدادات النظام الأساسية
INSERT INTO system_settings (key, value) VALUES
('site_settings', '{
    "site_name": "صحيفة سبق الإلكترونية",
    "site_url": "https://sabq.org",
    "logo_url": "/images/logo.png",
    "contact_email": "info@sabq.org",
    "social_media": {
        "twitter": "@sabqorg",
        "facebook": "sabqorg",
        "instagram": "sabqorg"
    }
}'::jsonb),
('features', '{
    "two_factor_auth": true,
    "ai_editor": true,
    "comments": true,
    "breaking_news_notifications": true,
    "article_versioning": true
}'::jsonb),
('permissions_config', '{
    "password_min_length": 8,
    "session_timeout_minutes": 60,
    "max_login_attempts": 5,
    "invitation_expiry_days": 7
}'::jsonb); 