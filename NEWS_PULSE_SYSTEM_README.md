# 📡 نظام شريط النبض الإخباري - News Pulse Ticker System

## نظرة عامة

شريط النبض الإخباري هو نظام تفاعلي لعرض آخر الأخبار والتحديثات المهمة في أعلى الصفحة الرئيسية. يوفر تجربة مستخدم سلسة مع إشعارات متحركة وإحصائيات تفاعلية.

## ✨ المميزات الرئيسية

### 🎯 للمستخدمين:
- **عرض تلقائي**: إشعارات متحركة تتبدل كل 5 ثوانٍ
- **تصنيفات متنوعة**: عاجل، تحليل عميق، جرعة ذكية، قائد رأي
- **تصميم تفاعلي**: أيقونات وألوان مختلفة لكل نوع
- **مؤشر التقدم**: شريط متحرك يوضح مدة عرض كل إشعار
- **روابط ذكية**: تسجيل المشاهدات والنقرات تلقائياً

### ⚙️ للمشرفين:
- **لوحة إدارة شاملة**: إضافة وإدارة الإشعارات
- **إحصائيات مفصلة**: مشاهدات ونقرات لكل إشعار
- **انتهاء صلاحية تلقائي**: حذف الإشعارات المنتهية الصلاحية
- **أولويات متقدمة**: ترتيب الإشعارات حسب الأهمية

## 🏗️ البنية التقنية

### قاعدة البيانات
```sql
-- جدول الإشعارات
CREATE TABLE pulse_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type pulse_type NOT NULL,
    title TEXT NOT NULL,
    target_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NULL,
    priority INTEGER DEFAULT 1,
    views_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- أنواع الإشعارات
CREATE TYPE pulse_type AS ENUM (
    'deep_analysis',
    'smart_dose',
    'opinion_leader',
    'breaking_news',
    'custom'
);
```

### API Endpoints

#### `GET /api/pulse/active`
جلب الإشعارات النشطة مرتبة حسب الأولوية والتاريخ

**Response:**
```json
{
  "success": true,
  "notifications": [
    {
      "id": "uuid",
      "type": "breaking_news",
      "title": "عنوان الإشعار",
      "target_url": "https://example.com",
      "created_at": "2025-01-28T10:00:00Z",
      "priority": 5,
      "views_count": 150,
      "clicks_count": 25
    }
  ],
  "stats": {
    "total_active": 5,
    "total_views": 1250,
    "total_clicks": 89
  }
}
```

#### `POST /api/pulse/active`
إضافة إشعار جديد

**Request Body:**
```json
{
  "type": "breaking_news",
  "title": "نص الإشعار الجديد",
  "target_url": "https://example.com/article",
  "priority": 5,
  "expires_at": "2025-01-30T23:59:59Z"
}
```

#### `PATCH /api/pulse/active`
تحديث إحصائيات الإشعار

**Request Body:**
```json
{
  "id": "notification-uuid",
  "action": "view" // أو "click"
}
```

## 🎨 المكونات (Components)

### NewsPulseTicker
المكون الرئيسي لعرض شريط النبض

```tsx
<NewsPulseTicker
  className="mb-6"
  autoRefresh={true}
  refreshInterval={30000}
  displayDuration={5000}
/>
```

**Props:**
- `className`: فئات CSS إضافية
- `autoRefresh`: التحديث التلقائي (افتراضي: true)
- `refreshInterval`: فترة التحديث بالميلي ثانية (افتراضي: 30000)
- `displayDuration`: مدة عرض كل إشعار (افتراضي: 5000)

### PulseAdminPanel
لوحة إدارة الإشعارات (مخصصة للمشرفين)

```tsx
// الوصول عبر: /admin/pulse
<PulseAdminPanel />
```

## 🎯 أنواع الإشعارات

| النوع            | الأيقونة | اللون  | الوصف                   |
| ---------------- | -------- | ------ | ----------------------- |
| `breaking_news`  | ⚡        | أحمر   | الأخبار العاجلة والمهمة |
| `deep_analysis`  | 📊        | أزرق   | التحليلات المعمقة       |
| `smart_dose`     | 💡        | أخضر   | الجرعات الذكية          |
| `opinion_leader` | 👤        | بنفسجي | آراء قادة الفكر         |
| `custom`         | ⚪        | رمادي  | إشعارات مخصصة           |

## 🚀 التثبيت والإعداد

### 1. إعداد قاعدة البيانات
```bash
# تشغيل ملف SQL
psql -d your_database -f pulse_notifications.sql
```

### 2. إضافة المتغيرات البيئية
```env
# متطلبات Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
```

### 3. تشغيل تنظيف البيانات التلقائي
```sql
-- إعداد cron job لحذف الإشعارات المنتهية الصلاحية
SELECT cron.schedule('cleanup-expired-pulse', '0 0 * * *', 'SELECT cleanup_expired_pulse_notifications();');
```

## 📊 مراقبة الأداء

### الإحصائيات المتاحة:
- إجمالي الإشعارات النشطة
- إجمالي المشاهدات
- إجمالي النقرات
- معدل النقر (CTR)
- أداء كل نوع من الإشعارات

### الاستعلامات المفيدة:
```sql
-- أفضل الإشعارات أداءً
SELECT title, views_count, clicks_count,
       ROUND((clicks_count::float / NULLIF(views_count, 0)) * 100, 2) as ctr_percentage
FROM pulse_notifications
WHERE views_count > 0
ORDER BY ctr_percentage DESC;

-- إحصائيات يومية
SELECT DATE(created_at) as day,
       COUNT(*) as notifications_count,
       SUM(views_count) as total_views,
       SUM(clicks_count) as total_clicks
FROM pulse_notifications
GROUP BY DATE(created_at)
ORDER BY day DESC;
```

## 🔒 الأمان والصلاحيات

- **إنشاء الإشعارات**: مقصور على المشرفين فقط
- **عرض الإشعارات**: متاح لجميع المستخدمين
- **تحديث الإحصائيات**: تلقائي وآمن
- **حذف الإشعارات**: انتهاء صلاحية تلقائي

## 🛠️ استكشاف الأخطاء

### مشاكل شائعة:

1. **عدم ظهور الإشعارات**
   - تأكد من وجود إشعارات نشطة في قاعدة البيانات
   - فحص اتصال Supabase
   - التحقق من console errors

2. **عدم تسجيل الإحصائيات**
   - فحص API endpoint `/api/pulse/active`
   - التأكد من صلاحيات قاعدة البيانات

3. **بطء في التحميل**
   - فحص الفهارس في قاعدة البيانات
   - تحسين استعلامات SQL

## 📝 التطوير المستقبلي

### مميزات مخططة:
- [ ] دعم الصور في الإشعارات
- [ ] إشعارات مجدولة
- [ ] تكامل مع WebSockets للتحديثات الفورية
- [ ] تخصيص السرعة والاتجاه
- [ ] دعم RTL/LTR ديناميكي
- [ ] تصدير الإحصائيات كـ CSV/Excel

### تحسينات الأداء:
- [ ] Cache للإشعارات النشطة
- [ ] Lazy loading للإحصائيات
- [ ] Service Worker للعمل offline

## 🤝 المساهمة

للمساهمة في تطوير النظام:

1. Fork المشروع
2. إنشاء branch للميزة الجديدة
3. Commit التغييرات
4. Push إلى branch
5. إنشاء Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف LICENSE للتفاصيل.

---

**تم التطوير بواسطة فريق صحيفة سبق الإلكترونية** 🚀
