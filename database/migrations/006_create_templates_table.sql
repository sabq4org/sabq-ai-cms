-- جدول القوالب لإدارة الهيدر والفوتر والعناصر الثابتة
CREATE TABLE templates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('header', 'footer', 'sidebar', 'banner')) NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  settings JSONB DEFAULT '{}', -- إعدادات إضافية
  is_active BOOLEAN DEFAULT FALSE,
  is_default BOOLEAN DEFAULT FALSE,
  starts_at TIMESTAMP,
  ends_at TIMESTAMP,
  country_code TEXT, -- رمز الدولة (SA, AE, etc.)
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  created_by INT REFERENCES users(id),
  updated_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- فهرس للبحث السريع
CREATE INDEX idx_templates_type ON templates(type);
CREATE INDEX idx_templates_active ON templates(is_active);
CREATE INDEX idx_templates_dates ON templates(starts_at, ends_at);
CREATE INDEX idx_templates_country ON templates(country_code);

-- تأكد من وجود قالب افتراضي واحد فقط لكل نوع
CREATE UNIQUE INDEX idx_templates_default ON templates(type, is_default) WHERE is_default = TRUE;

-- دالة لتحديث updated_at
CREATE OR REPLACE FUNCTION update_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_templates_updated_at_trigger
BEFORE UPDATE ON templates
FOR EACH ROW EXECUTE FUNCTION update_templates_updated_at();

-- بيانات افتراضية
INSERT INTO templates (name, type, content, is_active, is_default, created_by) VALUES 
('الهيدر الافتراضي', 'header', '{
  "logo": {
    "url": "/images/sabq-logo.svg",
    "alt": "صحيفة سبق الإلكترونية",
    "width": 180,
    "height": 60
  },
  "navigation": {
    "items": [
      {"label": "الرئيسية", "url": "/", "order": 1},
      {"label": "محليات", "url": "/local", "order": 2},
      {"label": "دولي", "url": "/international", "order": 3},
      {"label": "اقتصاد", "url": "/economy", "order": 4},
      {"label": "رياضة", "url": "/sports", "order": 5},
      {"label": "ثقافة", "url": "/culture", "order": 6},
      {"label": "تقنية", "url": "/tech", "order": 7}
    ]
  },
  "topBar": {
    "showBreakingNews": true,
    "showDateTime": true,
    "showWeather": true,
    "backgroundColor": "#1e40af"
  },
  "socialLinks": [
    {"platform": "twitter", "url": "https://twitter.com/sabqorg"},
    {"platform": "facebook", "url": "https://facebook.com/sabqorg"},
    {"platform": "youtube", "url": "https://youtube.com/sabqorg"},
    {"platform": "instagram", "url": "https://instagram.com/sabqorg"}
  ]
}', true, true, 1),

('الفوتر الافتراضي', 'footer', '{
  "sections": [
    {
      "title": "عن سبق",
      "links": [
        {"label": "من نحن", "url": "/about"},
        {"label": "رؤيتنا ورسالتنا", "url": "/vision"},
        {"label": "فريق العمل", "url": "/team"},
        {"label": "اتصل بنا", "url": "/contact"}
      ]
    },
    {
      "title": "خدمات",
      "links": [
        {"label": "الإعلانات", "url": "/advertising"},
        {"label": "الاشتراكات", "url": "/subscriptions"},
        {"label": "RSS", "url": "/rss"},
        {"label": "API", "url": "/api-docs"}
      ]
    },
    {
      "title": "سياسات",
      "links": [
        {"label": "سياسة الخصوصية", "url": "/privacy"},
        {"label": "شروط الاستخدام", "url": "/terms"},
        {"label": "حقوق النشر", "url": "/copyright"}
      ]
    }
  ],
  "newsletter": {
    "enabled": true,
    "title": "اشترك في النشرة البريدية",
    "description": "احصل على آخر الأخبار في بريدك الإلكتروني"
  },
  "apps": {
    "ios": "https://apps.apple.com/app/sabq",
    "android": "https://play.google.com/store/apps/sabq"
  },
  "copyright": "© 2024 صحيفة سبق الإلكترونية. جميع الحقوق محفوظة."
}', true, true, 1);

-- قالب هيدر رمضان (مثال)
INSERT INTO templates (name, type, content, starts_at, ends_at, created_by) VALUES 
('هيدر رمضان', 'header', '{
  "logo": {
    "url": "/images/sabq-logo-ramadan.svg",
    "alt": "صحيفة سبق - رمضان كريم"
  },
  "theme": {
    "primaryColor": "#4B0082",
    "backgroundColor": "#F8F8FF",
    "specialBanner": {
      "text": "رمضان كريم",
      "icon": "🌙",
      "backgroundColor": "#FFD700"
    }
  }
}', '2024-03-11', '2024-04-10', 1); 