# معالجة الروابط العربية في نظام CMS

## المشكلة

عند استخدام عناوين (slugs) عربية في روابط المقالات، يحدث خطأ "المقال غير متوفر" في الموقع المباشر.

مثال:
```
https://sabq.io/article/من-جرعات-الأطفال-إلى-تقسيم-القرص-4-أخطاء-شائعة-في-تناول-الأدوية-قد-تعرض-حياتك-للخطر
```

## السبب

1. المتصفحات تقوم بترميز الأحرف العربية في URL (URL encoding)
2. عندما يصل المعرف المرمز إلى API، لا يتم فك ترميزه بشكل صحيح
3. البحث في قاعدة البيانات يفشل لأن القيمة المرمزة لا تطابق القيمة المخزنة

## الحل المطبق

### 1. تحديث API Routes (`app/api/articles/[id]/route.ts`)

```typescript
// فك ترميز المعرف إذا كان مُرمز (للعناوين العربية)
let decodedId = id;
try {
  decodedId = decodeURIComponent(id);
  console.log(`🔍 معالجة معرف المقال: ${id} -> ${decodedId}`);
} catch (error) {
  console.warn('⚠️ تعذر فك ترميز المعرف، استخدام القيمة الأصلية:', id);
}

// البحث بثلاث قيم لضمان العثور على المقال
const dbArticle = await prisma.articles.findFirst({
  where: {
    OR: [
      { id: decodedId },
      { slug: decodedId },
      { slug: id } // البحث بالقيمة الأصلية أيضاً
    ]
  }
});
```

### 2. تحديث صفحة المقال (`app/article/[id]/page.tsx`)

```typescript
// معالجة URL-encoded IDs
let articleId = resolvedParams.id;
try {
  const decodedId = decodeURIComponent(articleId);
  console.log(`[ArticlePage] معالجة المعرف: ${articleId} -> ${decodedId}`);
  articleId = decodedId;
} catch (error) {
  console.error(`[ArticlePage] خطأ في فك ترميز المعرف:`, error);
}
```

### 3. تحديث lib/article-api.ts

```typescript
// ترميز المعرف للتأكد من صحة URL
const encodedId = encodeURIComponent(id);
const apiUrl = `${baseUrl}/api/articles/${encodedId}`;
```

## التحسينات المطبقة

1. **معالجة شاملة للترميز**: فك ترميز في جميع نقاط الدخول (GET, PATCH, DELETE, PUT)
2. **بحث متعدد**: البحث بالقيمة المفكوكة والأصلية لضمان العثور على المقال
3. **معالجة الأخطاء**: try-catch لمعالجة أي أخطاء في فك الترميز
4. **تسجيل شامل**: console.log لتتبع المعالجة وتسهيل تشخيص المشاكل

## اختبار الحل

1. افتح رابط مقال بعنوان عربي
2. تحقق من console logs في السيرفر
3. يجب أن يظهر المقال بشكل صحيح

## مفاهيم مهمة

### URL Encoding
- الأحرف العربية يتم ترميزها إلى %XX format
- مثال: `من` تصبح `%D9%85%D9%86`

### decodeURIComponent
- دالة JavaScript لفك ترميز URL
- يجب استخدامها مع try-catch لمعالجة الأخطاء

## توصيات إضافية

1. **استخدام معرفات بديلة**: فكر في استخدام معرفات رقمية أو alphanumeric بدلاً من العناوين العربية
2. **إضافة معرف ثانوي**: احتفظ بـ slug عربي للعرض ومعرف إنجليزي للروابط
3. **تحسين الأداء**: استخدم indexes في قاعدة البيانات على حقول slug و id

## مثال لنمط URL بديل

```
/article/1234/من-جرعات-الأطفال-إلى-تقسيم-القرص
```

حيث `1234` هو المعرف الفعلي والباقي للعرض فقط. 