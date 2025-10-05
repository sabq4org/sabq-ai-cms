# 📢 دليل الإعداد السريع لنظام الإعلانات والتنبيهات

## الخطوة 1: تطبيق المخططات على قاعدة البيانات

```bash
# توليد Prisma Client
npx prisma generate

# تطبيق التغييرات على قاعدة البيانات
npx prisma db push

# (اختياري) إنشاء migration
npx prisma migrate dev --name add_admin_announcements
```

## الخطوة 2: إعداد متغيرات البيئة

أضف إلى ملف `.env.local`:

```env
# مفتاح Cron Job
CRON_SECRET="your-super-secret-cron-key-change-this-in-production"

# تفعيل سجل التدقيق (اختياري)
ENABLE_ACTIVITY_LOGS=true
```

## الخطوة 3: تثبيت التبعيات المطلوبة

```bash
# إذا لم تكن مثبتة مسبقاً
npm install swr zod date-fns
npm install -D @types/node
```

## الخطوة 4: اختبار API

### إنشاء إعلان تجريبي:

```bash
curl -X POST http://localhost:3000/api/admin/announcements \
  -H "Content-Type: application/json" \
  -d '{
    "title": "إعلان تجريبي",
    "bodyMd": "هذا إعلان تجريبي للاختبار",
    "type": "ANNOUNCEMENT",
    "priority": "NORMAL",
    "status": "ACTIVE",
    "audienceRoles": ["editor", "reporter"]
  }'
```

### الحصول على قائمة الإعلانات:

```bash
curl http://localhost:3000/api/admin/announcements
```

### الحصول على الخط الزمني:

```bash
curl http://localhost:3000/api/admin/announcements/timeline
```

## الخطوة 5: اختبار Cron Job يدوياً

```bash
curl -H "Authorization: Bearer your-cron-secret" \
     http://localhost:3000/api/internal/cron/announcements
```

## الخطوة 6: الوصول إلى الصفحة

افتح المتصفح على:
```
http://localhost:3000/admin/announcements
```

## الخطوة 7: إنشاء بيانات تجريبية (اختياري)

أنشئ ملف `scripts/seed-announcements.js`:

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // إنشاء إعلانات تجريبية
  const announcements = [
    {
      title: 'صيانة النظام المجدولة',
      bodyMd: 'سيتم إجراء صيانة دورية للنظام يوم الجمعة من الساعة 2-4 صباحاً',
      type: 'MAINTENANCE',
      priority: 'HIGH',
      status: 'ACTIVE',
      authorId: 'your-user-id',
      audienceRoles: []
    },
    {
      title: 'ميزة جديدة: نظام البودكاست',
      bodyMd: 'تم إضافة نظام بودكاست متطور مع مشغل ذكي',
      type: 'FEATURE',
      priority: 'NORMAL',
      status: 'ACTIVE',
      isPinned: true,
      authorId: 'your-user-id',
      audienceRoles: []
    },
    {
      title: 'تحديث هام في سياسة النشر',
      bodyMd: 'يرجى مراجعة التحديثات الجديدة في سياسة النشر',
      type: 'POLICY',
      priority: 'HIGH',
      status: 'ACTIVE',
      authorId: 'your-user-id',
      audienceRoles: ['editor', 'reporter']
    }
  ];

  for (const announcement of announcements) {
    await prisma.adminAnnouncement.create({
      data: announcement
    });
  }

  console.log('✅ تم إنشاء الإعلانات التجريبية بنجاح');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

ثم قم بتشغيله:

```bash
node scripts/seed-announcements.js
```

## المشاكل الشائعة

### 1. خطأ "Property 'adminAnnouncement' does not exist"

**الحل:** قم بتشغيل:
```bash
npx prisma generate
```

### 2. خطأ "Cannot find module '@/lib/auth'"

**الحل:** تأكد من وجود ملف `lib/auth.ts` أو استخدم نظام المصادقة الحالي في مشروعك.

### 3. Cron Job لا يعمل

**الحل:** 
- تأكد من إضافة `CRON_SECRET` في متغيرات البيئة
- تحقق من إعدادات `vercel.json`
- اختبر يدوياً باستخدام curl

## الخطوات التالية

1. ✅ قم بتخصيص التصميم حسب احتياجاتك
2. ✅ أضف نموذج إنشاء/تعديل إعلانات
3. ✅ نفّذ نظام الإشعارات (Notifications)
4. ✅ أضف اختبارات للمكونات
5. ✅ راجع الصلاحيات حسب نظام RBAC الخاص بك

## الدعم

للمزيد من التفاصيل، راجع:
- [التوثيق الكامل](./docs/admin-announcements-system.md)
- [دليل API](./docs/admin-announcements-system.md#-واجهات-برمجة-التطبيقات)
- [دليل RBAC](./docs/admin-announcements-system.md#-نظام-الصلاحيات)
