# نظام إدارة المقالات المميزة - يناير 2025

## نظرة عامة
تم تطوير نظام مركزي لإدارة المقالات المميزة يضمن وجود مقال مميز واحد فقط في أي وقت.

## المشكلة السابقة
- عند نشر مقال جديد مميز، كان يبقى المقال المميز السابق أيضاً
- كان يمكن أن يكون هناك أكثر من مقال مميز في نفس الوقت
- عدم وجود atomicity في عملية تحديث المقالات المميزة

## الحل المطبّق

### 1. مدير مركزي للمقالات المميزة
تم إنشاء `FeaturedArticleManager` في `lib/services/featured-article-manager.ts` والذي يوفر:

```typescript
// تعيين مقال كمميز (مع إلغاء تمييز الآخرين تلقائياً)
FeaturedArticleManager.setFeaturedArticle(articleId, options)

// إلغاء تمييز مقال
FeaturedArticleManager.unsetFeaturedArticle(articleId)

// جلب المقال المميز الحالي
FeaturedArticleManager.getCurrentFeatured(categoryId?)

// إلغاء تمييز جميع المقالات
FeaturedArticleManager.clearAllFeatured(categoryId?)

// عدد المقالات المميزة (للتشخيص)
FeaturedArticleManager.getFeaturedCount(categoryId?)
```

### 2. استخدام Transactions
- جميع العمليات تستخدم Prisma transactions لضمان الـ atomicity
- لا يمكن أن يكون هناك حالة وسطية مع أكثر من مقال مميز

### 3. تحديث APIs
تم تحديث جميع APIs للاستخدام المدير المركزي:

#### POST /api/articles
- عند إنشاء مقال جديد مميز، يتم استخدام `FeaturedArticleManager.setFeaturedArticle()`
- يتم إنشاء المقال أولاً، ثم تعيينه كمميز

#### PATCH /api/articles/[id]
- عند تحديث مقال ليصبح مميز، يتم استخدام `FeaturedArticleManager.setFeaturedArticle()`
- عند إلغاء التمييز، يتم استخدام `FeaturedArticleManager.unsetFeaturedArticle()`

#### POST /api/articles/set-featured
- API مخصص لتعيين/إلغاء تمييز المقالات
- يستخدم المدير المركزي بالكامل

#### GET /api/featured-news
- يستخدم `FeaturedArticleManager.getCurrentFeatured()` لجلب المقال المميز

## كيفية الاستخدام

### من لوحة التحكم
1. عند نشر مقال جديد، قم بتفعيل خيار "مميز"
2. سيتم تلقائياً إلغاء تمييز أي مقال آخر مميز

### من الواجهة البرمجية
```javascript
// تعيين مقال كمميز
await fetch('/api/articles/set-featured', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    articleId: 'article_123',
    featured: true
  })
})

// إلغاء تمييز مقال
await fetch('/api/articles/set-featured', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    articleId: 'article_123',
    featured: false
  })
})
```

## الفوائد
1. **ضمان مقال مميز واحد فقط**: لا يمكن أن يكون هناك أكثر من مقال مميز
2. **Atomic Operations**: استخدام transactions يضمن عدم وجود حالات وسطية
3. **أداء محسّن**: استخدام dbConnectionManager لإدارة الاتصالات
4. **سهولة الصيانة**: كل المنطق في مكان واحد
5. **دعم التصنيفات**: يمكن تقييد العملية حسب التصنيف

## التشخيص والاختبار
تم إنشاء سكريبت اختبار في `scripts/test-featured-article-manager.js`:

```bash
node scripts/test-featured-article-manager.js
```

هذا السكريبت يقوم بـ:
- فحص عدد المقالات المميزة
- اختبار API جلب الخبر المميز
- تنظيف المقالات المميزة المكررة (إذا وجدت)
- التحقق النهائي من صحة النظام

## ملاحظات مهمة
1. يجب استخدام APIs المحدثة في جميع الأماكن
2. عند تحديث مقال مميز، يتم إعادة تحقق صحة الصفحة الرئيسية تلقائياً
3. النظام يدعم تقييد العملية حسب التصنيف (اختياري)
4. جميع العمليات تُسجل في console للتتبع

## الملفات المحدثة
- `lib/services/featured-article-manager.ts` - المدير المركزي (جديد)
- `app/api/articles/route.ts` - POST endpoint
- `app/api/articles/[id]/route.ts` - PATCH endpoint
- `app/api/articles/set-featured/route.ts` - API مخصص
- `app/api/featured-news/route.ts` - جلب الخبر المميز
- `scripts/test-featured-article-manager.js` - سكريبت اختبار (جديد)