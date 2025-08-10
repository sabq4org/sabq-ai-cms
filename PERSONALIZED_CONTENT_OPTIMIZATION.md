# تحسين أداء المحتوى المخصص

## المشكلة
بطء في تحميل التوصيات عند الدخول من المحتوى المخصص أسفل تفاصيل الخبر.

## الحلول المطبقة

### 1. مكون OptimizedPersonalizedContent جديد
- **LocalStorage Caching**: حفظ التوصيات محلياً لمدة 5 دقائق
- **Prefetch Links**: تفعيل `prefetch={true}` على روابط المقالات
- **Lazy Loading**: تحميل الصور بشكل كسول
- **Memoization**: استخدام `memo()` لمنع إعادة الرسم غير الضرورية

### 2. API Route محسّن (/api/recommendations)
- **Cache Headers**: `s-maxage=300, stale-while-revalidate=600`
- **Optimized Query**: استعلام محسّن مع select محدد
- **Error Handling**: معالجة أخطاء مع fallback

### 3. تحسينات الأداء
```typescript
// Cache في localStorage
const cacheKey = `recommendations_${articleId}_${categoryId}`;
const cached = localStorage.getItem(cacheKey);

// Prefetch للروابط
<Link href={url} prefetch={true}>

// Lazy loading للصور
<Image loading="lazy" sizes="...">
```

### 4. تقليل حجم البيانات
- جلب الحقول المطلوبة فقط
- تحديد عدد التوصيات بـ 6 مقالات
- استخدام `select` بدلاً من `include`

## النتائج المتوقعة

### قبل التحسين:
- تأخير 2-3 ثواني عند النقر
- إعادة جلب عند كل زيارة
- تحميل كامل للبيانات

### بعد التحسين:
- **سرعة أولى**: من cache إذا كان متاحاً
- **Prefetch**: تحميل مسبق عند hover
- **أداء أفضل**: تقليل البيانات المنقولة
- **تجربة سلسة**: لا يوجد تأخير ملحوظ

## كيفية الاختبار

1. افتح أي خبر
2. انزل للمحتوى المخصص
3. انقر على أي مقال مقترح
4. يجب أن يفتح فوراً

## ملاحظات
- Cache يُحفظ لمدة 5 دقائق
- يمكن تعديل مدة الـ cache حسب الحاجة
- التوصيات تُحدث تلقائياً بعد انتهاء الـ cache
