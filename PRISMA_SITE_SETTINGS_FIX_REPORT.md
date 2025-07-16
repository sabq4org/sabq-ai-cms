# تقرير إصلاح أخطاء Prisma في site_settings

## 🐛 المشكلة
فشل البناء على DigitalOcean App Platform بسبب خطأ في TypeScript:
```
Type error: Type '{ section: string; }' is not assignable to type 'site_settingsWhereUniqueInput'.
Property 'id' is missing in type '{ section: string; }' but required in type '{ id: string; }'.
```

## 🔍 السبب
- استخدام `findUnique()` مع حقل `section` الذي ليس مفتاح أساسي أو فريد
- `findUnique()` يتطلب استخدام المفتاح الأساسي (id) أو حقل فريد فقط
- نفس المشكلة مع `upsert()` في `where` clause

## ✅ الحل المطبق

### 1. تغيير `findUnique` إلى `findFirst`
تم تعديل 3 ملفات:
- `app/api/ai/deep-analysis/route.ts`
- `app/api/settings/ai/route.ts`
- `app/api/deep-analyses/generate/route.ts`

**قبل:**
```typescript
const settings = await prisma.site_settings.findUnique({
  where: { section: 'ai' }
});
```

**بعد:**
```typescript
const settings = await prisma.site_settings.findFirst({
  where: { section: 'ai' }
});
```

### 2. استبدال `upsert` بـ `findFirst` + `update/create`
في ملف `app/api/settings/ai/route.ts`:

**قبل:**
```typescript
await prisma.site_settings.upsert({
  where: { section: 'ai' },
  update: { data: aiSettings, updated_at: new Date() },
  create: { ... }
});
```

**بعد:**
```typescript
const existingSettings = await prisma.site_settings.findFirst({
  where: { section: 'ai' }
});

if (existingSettings) {
  await prisma.site_settings.update({
    where: { id: existingSettings.id },
    data: { 
      data: aiSettings, 
      updated_at: new Date() 
    }
  });
} else {
  await prisma.site_settings.create({
    data: {
      id: `ai-${Date.now()}`,
      section: 'ai',
      data: aiSettings,
      created_at: new Date(),
      updated_at: new Date()
    }
  });
}
```

## 🚀 النشر
- تم إنشاء فرع جديد: `fix/prisma-site-settings-errors`
- تم رفع الفرع إلى GitHub بنجاح
- يمكن إنشاء Pull Request من: https://github.com/sabq4org/sabq-ai-cms/pull/new/fix/prisma-site-settings-errors

## 📋 الخطوات التالية
1. إنشاء Pull Request ودمجه في `main`
2. سيتم تشغيل البناء تلقائياً على DigitalOcean
3. التحقق من نجاح البناء والنشر

## 💡 توصيات
- يُنصح بإضافة فهرس فريد على حقل `section` في جدول `site_settings` إذا كان يُستخدم كمعرف
- أو استخدام `id` ثابت لكل قسم (مثل: `ai-settings`, `general-settings`, إلخ) 