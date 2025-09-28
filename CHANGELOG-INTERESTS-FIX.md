# إصلاح نظام الاهتمامات - Interests System Fix

## التاريخ: 2025-09-28

## المشكلة الأساسية
- الاهتمامات تظهر ثم تختفي في صفحة البروفايل
- عدم تزامن البيانات بين الواجهة وقاعدة البيانات
- الاختيارات المحفوظة لا تُعرض بشكل صحيح عند إعادة فتح الصفحة
- مشاكل في الكاش تسبب عرض بيانات قديمة

## الحل المطبق

### 1. API موحد جديد (`/api/profile/interests`)
- **GET**: جلب الاهتمامات مع منع الكاش بالكامل
  - Headers: `Cache-Control: no-store, no-cache, must-revalidate`
  - إرجاع البيانات مع timestamp للتحقق من الحداثة
  
- **PUT**: تحديث كامل للاهتمامات (استبدال)
  - استخدام Transaction لضمان الذرية
  - حذف القديم + إضافة الجديد في عملية واحدة
  - تحديث `updated_at` للمستخدم
  - تنظيف الكاش بعد الحفظ
  - `revalidateTag` للصفحات المرتبطة

- **POST**: إضافة/إزالة اهتمام واحد (للتوافقية)
- **DELETE**: حذف جميع الاهتمامات

### 2. React Query Integration
- استخدام `@tanstack/react-query` لإدارة الحالة
- `staleTime: 0` - البيانات تصبح قديمة فوراً
- `gcTime: 0` - عدم الاحتفاظ بالكاش
- `invalidateQueries` بعد كل تحديث
- إعادة الجلب الفوري بعد الحفظ

### 3. مكون InterestsForm محسن
- عرض مرئي واضح للاهتمامات المختارة
- تحديث فوري من السيرفر عند التحميل
- حالة "dirty" لتتبع التغييرات
- زر تراجع للتغييرات غير المحفوظة
- عداد للاختيارات مع حدود min/max
- رسائل تحقق واضحة

### 4. Hook مخصص (`useUserInterests`)
- إدارة مركزية للاهتمامات
- عمليات: جلب، تحديث، تبديل، حذف
- معالجة أخطاء شاملة
- إعادة جلب تلقائية عند التركيز

## التحسينات التقنية

### منع الكاش على جميع المستويات
```typescript
// API Response Headers
{
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
  "Surrogate-Control": "no-store"
}
```

### Transaction للذرية
```typescript
await prisma.$transaction(async (tx) => {
  // 1. حذف القديم
  await tx.user_interests.deleteMany({ where: { user_id } });
  
  // 2. إضافة الجديد
  await tx.user_interests.createMany({ data: newInterests });
  
  // 3. تحديث المستخدم
  await tx.users.update({ where: { id: user_id }, data: { updated_at: new Date() } });
});
```

### إعادة التحقق من الصفحات
```typescript
revalidateTag(`profile:${user.id}`);
revalidateTag(`interests:${user.id}`);
revalidateTag("interests");
```

## قاعدة البيانات

### جدول user_interests
```sql
model user_interests {
  id          Int        @id @default(autoincrement())
  user_id     String     
  category_id String     
  is_active   Boolean    @default(true)
  created_at  DateTime   @default(now())
  updated_at  DateTime   @updatedAt
  
  @@unique([user_id, category_id])
  @@index([user_id])
  @@index([category_id])
}
```

## الملفات المضافة/المعدلة

### ملفات جديدة
1. `/app/api/profile/interests/route.ts` - API الموحد
2. `/hooks/useUserInterests.ts` - Hook لإدارة الاهتمامات
3. `/components/profile/InterestsForm.tsx` - مكون النموذج المحسن
4. `/providers/QueryProvider.tsx` - Provider لـ React Query

### ملفات معدلة
1. `/app/layout.tsx` - إضافة QueryProvider
2. `/app/profile/page.tsx` - استخدام المكون الجديد
3. `/app/welcome/preferences/page.tsx` - تحسينات التحديد المسبق

## التحقق من الإصلاح

### خطوات الاختبار
1. افتح صفحة البروفايل
2. اختر اهتمامات جديدة واحفظها
3. أغلق الصفحة وأعد فتحها
4. تحقق أن الاهتمامات المحفوظة تظهر بشكل صحيح
5. افتح صفحة تعديل الاهتمامات
6. تحقق أن الاختيارات السابقة محددة

### نقاط التحقق
- ✅ الاهتمامات تبقى ثابتة بعد الحفظ
- ✅ عدم وجود تذبذب في العرض
- ✅ التحديد المسبق يعمل بشكل صحيح
- ✅ عدم تسريب البيانات بين المستخدمين
- ✅ الكاش لا يعرض بيانات قديمة

## ملاحظات للمطورين

### Redis (إذا كان متاحاً)
إضافة تنظيف مفاتيح Redis بعد التحديث:
```typescript
await redis.del(`interests:${user.id}`);
await redis.del(`profile:${user.id}`);
await redis.del(`user:${user.id}:*`);
```

### معالجة الأخطاء
- 401: غير مصرح
- 400: بيانات غير صحيحة
- 404: تصنيف غير موجود
- 500: خطأ في السيرفر

### الأداء
- عدم استخدام التحديث المتفائل إلا عند الضرورة
- إعادة الجلب الفوري بعد الحفظ
- استخدام `invalidateQueries` بدلاً من `setQueryData`

## الخلاصة
تم إصلاح مشكلة تذبذب الاهتمامات بشكل جذري من خلال:
1. منع الكاش على جميع المستويات
2. استخدام React Query للتزامن
3. Transaction للذرية في قاعدة البيانات
4. إعادة التحقق من الصفحات بعد التحديث

النظام الآن يضمن عرض البيانات الصحيحة دائماً من السيرفر (Server Truth) دون الاعتماد على الكاش أو البيانات المحلية.
