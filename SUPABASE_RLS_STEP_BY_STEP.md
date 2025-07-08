# دليل حل مشكلة Supabase RLS خطوة بخطوة

## 🔍 الخطوة 1: فحص الوضع الحالي

### افتح Supabase Dashboard:
1. اذهب إلى https://app.supabase.com
2. اختر مشروعك
3. اذهب إلى **SQL Editor** من القائمة الجانبية

### شغّل سكريبت الفحص:
انسخ والصق محتوى `scripts/check-supabase-rls-status.sql` في SQL Editor واضغط Run.

سترى 4 جداول نتائج:
- حالة RLS لكل جدول
- السياسات الموجودة
- الصلاحيات الممنوحة
- الجداول الموجودة

### احفظ النتائج:
خذ لقطة شاشة أو انسخ النتائج للمقارنة لاحقاً.

---

## 🛠️ الخطوة 2: تطبيق الحل المؤقت (للاختبار السريع)

### تعطيل RLS مؤقتاً:
```sql
-- تعطيل RLS للجداول الأساسية (مؤقتاً فقط!)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE articles DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;

-- منح الصلاحيات
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
```

### اختبر التطبيق:
1. جرب تسجيل الدخول على https://your-app.ondigitalocean.app
2. جرب جلب التصنيفات
3. إذا عمل كل شيء، فالمشكلة كانت في RLS

⚠️ **تحذير**: هذا حل مؤقت فقط! يجب إعادة تفعيل RLS.

---

## 🔐 الخطوة 3: تطبيق الحل الدائم

### أ. تطبيق سياسات RLS الصحيحة:

في SQL Editor، شغّل الأوامر التالية **بالترتيب**:

#### 1. جدول categories (الأسهل):
```sql
-- تفعيل RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- حذف السياسات القديمة
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;

-- إضافة سياسة القراءة للجميع
CREATE POLICY "Enable read access for all users" ON categories
FOR SELECT USING (true);

-- اختبر
SELECT * FROM categories LIMIT 5;
```

#### 2. جدول users:
```sql
-- تفعيل RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- حذف السياسات القديمة
DROP POLICY IF EXISTS "Public users are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Users can update own record" ON users;

-- سياسة القراءة للجميع
CREATE POLICY "Public profiles are viewable by everyone" ON users
FOR SELECT USING (true);

-- سياسة التحديث للمستخدم نفسه
CREATE POLICY "Users can update own record" ON users
FOR UPDATE USING (auth.uid()::text = id);

-- اختبر
SELECT id, email, name FROM users LIMIT 5;
```

#### 3. جدول articles:
```sql
-- تفعيل RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- حذف السياسات القديمة
DROP POLICY IF EXISTS "Published articles are viewable by everyone" ON articles;
DROP POLICY IF EXISTS "Authors can manage own articles" ON articles;

-- سياسة القراءة للمقالات المنشورة
CREATE POLICY "Published articles are viewable by everyone" ON articles
FOR SELECT USING (is_published = true);

-- سياسة للكتّاب
CREATE POLICY "Authors can manage own articles" ON articles
FOR ALL USING (author_id = auth.uid()::text);

-- اختبر
SELECT id, title FROM articles WHERE is_published = true LIMIT 5;
```

### ب. منح الصلاحيات الصحيحة:
```sql
-- منح صلاحيات القراءة للمستخدم anon
GRANT SELECT ON categories TO anon;
GRANT SELECT ON users TO anon;
GRANT SELECT ON articles TO anon;

-- منح صلاحيات كاملة للمستخدم authenticated
GRANT ALL ON categories TO authenticated;
GRANT ALL ON users TO authenticated;
GRANT ALL ON articles TO authenticated;
GRANT ALL ON comments TO authenticated;
GRANT ALL ON loyalty_points TO authenticated;

-- منح صلاحيات للـ sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
```

---

## 🧪 الخطوة 4: اختبار الحل

### أ. اختبر في SQL Editor:
```sql
-- اختبر كمستخدم anon
SET ROLE anon;
SELECT * FROM categories LIMIT 5; -- يجب أن يعمل
SELECT * FROM users LIMIT 5; -- يجب أن يعمل
SELECT * FROM articles WHERE is_published = true LIMIT 5; -- يجب أن يعمل

-- عد للـ role الأصلي
RESET ROLE;
```

### ب. اختبر عبر API:
```bash
# اختبر جلب التصنيفات
curl https://your-project.supabase.co/rest/v1/categories \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your-anon-key"
```

### ج. اختبر في التطبيق:
1. امسح الكوكيز والكاش
2. جرب تسجيل الدخول
3. جرب جلب البيانات

---

## 🚨 إذا لم يعمل الحل

### 1. تحقق من الأخطاء:
في Supabase Dashboard:
- اذهب إلى **Logs** > **API logs**
- ابحث عن أخطاء RLS

### 2. جرب استخدام Service Role:
في DigitalOcean، أضف:
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

ثم في الكود، استخدم:
```typescript
// للعمليات التي تتطلب تجاوز RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

### 3. تحقق من JWT:
```sql
-- في SQL Editor
SELECT auth.uid(); -- يجب أن يرجع null إذا لم تكن مصادق
SELECT auth.jwt(); -- عرض JWT الحالي
```

---

## 📋 قائمة التحقق النهائية

- [ ] تم فحص حالة RLS الحالية
- [ ] تم تجربة الحل المؤقت (تعطيل RLS)
- [ ] تم تطبيق سياسات RLS الصحيحة
- [ ] تم منح الصلاحيات المناسبة
- [ ] تم اختبار في SQL Editor
- [ ] تم اختبار عبر API
- [ ] تم اختبار في التطبيق
- [ ] تم إعادة تفعيل RLS إذا كان معطلاً

---

## 🆘 للمساعدة الإضافية

إذا استمرت المشكلة:
1. شارك نتائج سكريبت الفحص
2. شارك أي أخطاء من API logs
3. شارك كيف تستدعي Supabase في الكود 