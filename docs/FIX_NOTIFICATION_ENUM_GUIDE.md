# 🔧 دليل إصلاح NotificationType Enum

## 🐛 المشكلة

```
❌ Invalid `prisma.smartNotifications.findMany()` invocation
❌ Value 'article_recommendation' not found in enum 'NotificationType'
```

---

## 🎯 الحل: تحديث Enum في قاعدة البيانات

### الطريقة 1: عبر Vercel Dashboard (الأسهل) ✅

#### الخطوات:

1. **افتح Vercel Dashboard**
   - اذهب إلى: https://vercel.com/sabq4org/sabq-ai-cms
   - اضغط على **Storage** → **Postgres Database**

2. **افتح Query Editor**
   - اضغط على **Query** أو **SQL Editor**
   - أو اضغط على **Data** → **Query**

3. **نفّذ الأمر SQL**
   
   انسخ والصق هذا الكود:

```sql
-- إضافة القيم المفقودة إلى NotificationType enum
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'article_recommendation';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'new_article';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'new_comment';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'daily_digest';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'author_follow';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'article_published';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'article_breaking';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'article_featured';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'comments_spike';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'reads_top';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'user_reply';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'system_announcement';
```

4. **اضغط Run** أو **Execute**

5. **تحقق من النتيجة**
   
   نفّذ هذا الأمر للتحقق:

```sql
SELECT enumlabel as notification_type
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'NotificationType'
ORDER BY e.enumsortorder;
```

   يجب أن ترى **17 قيمة** في النتيجة.

---

### الطريقة 2: عبر psql (للمتقدمين)

إذا كان لديك وصول مباشر لقاعدة البيانات:

```bash
# 1. الاتصال بقاعدة البيانات
psql $DATABASE_URL

# 2. تنفيذ الأوامر
\i fix-notification-type-enum.sql

# 3. الخروج
\q
```

---

### الطريقة 3: عبر pgAdmin

1. افتح pgAdmin
2. اتصل بقاعدة البيانات
3. افتح **Query Tool**
4. الصق الكود SQL أعلاه
5. اضغط **Execute** (F5)

---

## ✅ التحقق من الإصلاح

بعد تنفيذ SQL، تحقق من:

### 1. عدد القيم في Enum

```sql
SELECT COUNT(*) as total_types
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'NotificationType';
```

**النتيجة المتوقعة**: `17`

---

### 2. اختبار جلب الإشعارات

```sql
SELECT type, COUNT(*) as count
FROM "SmartNotifications"
GROUP BY type
ORDER BY count DESC;
```

**النتيجة المتوقعة**: لا أخطاء، قائمة بجميع الأنواع

---

### 3. اختبار من الموقع

1. افتح الموقع: https://www.sabq.io
2. اضغط على زر الإشعارات في الهيدر
3. ✅ يجب أن تظهر الإشعارات بدون خطأ 500

---

## 📋 القيم المضافة

| # | القيمة | الوصف |
|---|--------|-------|
| 1 | `article_recommendation` | توصية بمقال |
| 2 | `new_article` | مقال جديد |
| 3 | `new_comment` | تعليق جديد |
| 4 | `daily_digest` | ملخص يومي |
| 5 | `author_follow` | متابعة كاتب |
| 6 | `article_published` | نشر مقال |
| 7 | `article_breaking` | خبر عاجل |
| 8 | `article_featured` | مقال مميز |
| 9 | `comments_spike` | زيادة التعليقات |
| 10 | `reads_top` | الأكثر قراءة |
| 11 | `user_reply` | رد مستخدم |
| 12 | `system_announcement` | إعلان نظام |

---

## 🚨 ملاحظات مهمة

### ⚠️ لا يمكن حذف قيم من Enum

PostgreSQL **لا يسمح** بحذف قيم من enum بعد إضافتها. إذا أردت حذف قيمة:

1. إنشاء enum جديد
2. تحديث جميع الجداول
3. حذف enum القديم
4. إعادة تسمية enum الجديد

**لذلك**: تأكد من أن جميع القيم المضافة **مطلوبة فعلاً**.

---

### ✅ القيم الحالية آمنة

جميع القيم المضافة في هذا الإصلاح **مستخدمة فعلاً** في:
- `SmartNotificationEngine`
- قاعدة البيانات الحالية
- الكود الموجود

---

## 🎉 بعد الإصلاح

بعد تنفيذ SQL بنجاح:

1. ✅ **الإشعارات تُجلب** بدون أخطاء
2. ✅ **دعم 17 نوع** من الإشعارات
3. ✅ **لا حاجة لإعادة البناء** - التغيير فوري
4. ✅ **متوافق مع Prisma schema** الجديد

---

## 📞 الدعم

إذا واجهت مشاكل:

1. تحقق من أن لديك صلاحيات `ALTER TYPE`
2. تحقق من اسم الجدول: `SmartNotifications` (حساس لحالة الأحرف)
3. تحقق من اسم Enum: `NotificationType` (حساس لحالة الأحرف)

---

**تاريخ الإنشاء**: 2025-10-17  
**الحالة**: ✅ جاهز للتطبيق  
**الأولوية**: 🔴 عالية جداً (Critical)

