# إصلاح مشكلة رفع الصور للتصنيفات 🖼️

## المشكلة
عند رفع صورة للتصنيف كان يظهر خطأ:
```
JSON.parse: unexpected end of data at line 1 column 1 of the JSON data
```

## الأسباب

### 1. **تعارض في المسارات**
- وجود مجلدين بأسماء معاملات مختلفة:
  - `/api/categories/[id]/`
  - `/api/categories/[categorySlug]/`
- Next.js لا يمكنه التمييز بينهما مما يسبب خطأ 405 Method Not Allowed

### 2. **معالجة ضعيفة للأخطاء**
- عدم التحقق من نوع المحتوى قبل تحليل JSON
- عدم معالجة الاستجابات غير JSON بشكل صحيح

## الإصلاحات

### 1. **حل تعارض المسارات**
```bash
# نقل [categorySlug] إلى مسار منفصل
mv app/api/categories/[categorySlug] app/api/categories/by-slug
mkdir -p app/api/categories/by-slug/[slug]
mv app/api/categories/by-slug/route.ts app/api/categories/by-slug/[slug]/route.ts
```

الآن لدينا:
- `/api/categories/[id]` - للعمليات بواسطة ID
- `/api/categories/by-slug/[slug]` - للبحث بواسطة slug

### 2. **تحسين معالجة الأخطاء في FeaturedImageUpload**
```typescript
// التحقق من نوع المحتوى قبل تحليل JSON
const contentType = response.headers.get('content-type');
if (!contentType || !contentType.includes('application/json')) {
  const text = await response.text();
  console.error('❌ استجابة غير JSON:', text);
  throw new Error('الخادم أرجع استجابة غير صالحة');
}
```

### 3. **تحسين معالجة الأخطاء في EditCategoryModal**
نفس التحسين تم إضافته لنموذج التحرير

## النتيجة
✅ حل تعارض المسارات
✅ معالجة أفضل للأخطاء
✅ رسائل خطأ أوضح للمستخدم
✅ رفع الصور يعمل بشكل صحيح

## الاختبار
تم إنشاء سكريبت اختبار: `scripts/test-category-update.js`
```bash
node scripts/test-category-update.js
```

## الملفات المحدثة
1. `components/FeaturedImageUpload.tsx`
2. `components/admin/categories/EditCategoryModal.tsx`
3. إعادة هيكلة مجلدات API 