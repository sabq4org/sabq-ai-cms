# 📝 دليل مسارات تحرير المقالات في سبق

## المشكلة المكتشفة
عند النقر على "تعديل المقال" من صفحة `/admin/news`، كان الرابط يتوجه إلى:
```
/dashboard/news/unified?id=article_1753871540813_vlvief9dk
```
بدلاً من مسار التحرير الصحيح.

## الحل المطبق
تم تصحيح الرابط في `app/admin/news/page.tsx` ليصبح:
```
/dashboard/article/edit/${article.id}
```

## المسارات المختلفة في النظام

### 1. مسارات إنشاء مقال جديد
- `/dashboard/news/unified` - واجهة إنشاء موحدة متقدمة
- `/dashboard/article/new` - واجهة إنشاء عادية
- `/dashboard/article/unified/new` - واجهة موحدة جديدة

### 2. مسارات تحرير المقالات
- `/dashboard/article/edit/[id]` - **المسار الرئيسي للتحرير** ✅
- `/dashboard/news/edit/[id]` - مسار بديل للتحرير
- `/dashboard/article/unified/[id]` - واجهة التحرير الموحدة

### 3. مسارات العرض
- `/article/[id]` - عرض المقال للجمهور
- `/dashboard/news/[id]` - عرض المقال في لوحة التحكم

## التوصيات

### للمطورين:
1. استخدم `/dashboard/article/edit/[id]` كمسار رئيسي للتحرير
2. استخدم `/dashboard/news/unified` لإنشاء مقال جديد فقط (بدون معرف)
3. تجنب استخدام query parameters للتحرير

### للمستخدمين:
- عند النقر على "تعديل المقال" من أي مكان، سيتم توجيهك الآن إلى الصفحة الصحيحة
- إذا واجهت مشكلة مشابهة في مكان آخر، يرجى الإبلاغ عنها

## الملفات المعدلة
1. `app/admin/news/page.tsx` - السطر 540

## قبل وبعد
### قبل:
```typescript
onClick={() => router.push(`/dashboard/news/unified?id=${article.id}`)}
```

### بعد:
```typescript
onClick={() => router.push(`/dashboard/article/edit/${article.id}`)}
```

---
**تاريخ التحديث**: يناير 2025