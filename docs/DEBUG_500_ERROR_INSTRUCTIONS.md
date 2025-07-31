# دليل تشخيص خطأ 500 عند تحديث المقالات

## المشكلة
ظهور خطأ 500 عند محاولة تحديث المقال `article_1753871540813_vlvief9dk` رغم أن:
- المقال موجود في قاعدة البيانات ✅
- API يعمل بشكل صحيح عند الاختبار المباشر ✅
- المشكلة تحدث من الواجهة فقط ❌

## أدوات التشخيص المتاحة

### 1. صفحة التشخيص المخصصة
قم بزيارة: `/admin/debug-update`

هذه الصفحة توفر:
- اختبار مباشر لـ API التحديث
- عرض سجل جميع محاولات التحديث
- أدوات تصحيح متقدمة

### 2. أدوات Console
افتح Console في المتصفح (F12) واستخدم:

```javascript
// اختبار تحديث بسيط
debugArticleUpdate("article_1753871540813_vlvief9dk", {
  title: "عنوان جديد"
})

// تشغيل اختبارات متعددة
testArticleUpdate("article_1753871540813_vlvief9dk")

// اعتراض نماذج التحديث لفحص البيانات
interceptFormSubmit()
```

### 3. فحص Network Tab
1. افتح Developer Tools (F12)
2. اذهب إلى Network Tab
3. فلتر بـ "Fetch/XHR"
4. حاول التحديث من الواجهة
5. افحص:
   - Request Headers
   - Request Payload
   - Response

### 4. تفعيل Debug Mode
تم إضافة Debug Mode لـ API. عند إرسال Header:
```
X-Debug-Mode: true
```
ستحصل على معلومات إضافية في الاستجابة.

## خطوات التشخيص المقترحة

### الخطوة 1: تحديد نوع البيانات المرسلة
في Console، بعد فشل التحديث:
```javascript
// عرض آخر محاولات التحديث
JSON.parse(localStorage.getItem('articleUpdateLogs'))
```

### الخطوة 2: مقارنة البيانات
قارن بين:
- البيانات المرسلة من الواجهة (من Network Tab)
- البيانات الناجحة من صفحة التشخيص

### الخطوة 3: فحص الأخطاء المحتملة
1. **حجم البيانات**: هل البيانات كبيرة جداً؟
2. **تنسيق البيانات**: هل هناك حقول غير صالحة؟
3. **الصلاحيات**: هل المستخدم له صلاحية التحديث؟
4. **Middleware**: هل هناك middleware يعترض الطلب؟

## الحلول المحتملة

### 1. تنظيف البيانات قبل الإرسال
```javascript
// في كود الواجهة
const cleanData = {
  title: formData.title?.trim(),
  featured_image: formData.featuredImage || null,
  is_featured: Boolean(formData.isFeatured),
  // فقط الحقول المطلوبة
};
```

### 2. استخدام ArticleUpdateHandler
```javascript
import { articleUpdateHandler } from '@/components/article/ArticleUpdateHandler';

// تفعيل Debug Mode
articleUpdateHandler.setDebugMode(true);

// تحديث مع معالجة أفضل للأخطاء
const result = await articleUpdateHandler.updateArticle(articleId, data);
```

### 3. تجاوز Validation مؤقتاً
```javascript
const result = await articleUpdateHandler.updateArticle(articleId, data, {
  skipValidation: true,
  debugMode: true
});
```

## معلومات إضافية للمطور

### البيانات المطلوبة من المستخدم:
1. **Screenshot من Console** عند حدوث الخطأ
2. **محتوى Network Tab** (Request & Response)
3. **البيانات من**: `localStorage.getItem('articleUpdateLogs')`

### للحصول على logs الخادم:
```bash
# في terminal الخادم
tail -f logs/app.log | grep "article_1753871540813_vlvief9dk"
```

## ملاحظة مهمة
المقال موجود وAPI يعمل، لذا المشكلة على الأرجح في:
1. تنسيق البيانات المرسلة من الواجهة
2. حجم البيانات (خاصة المحتوى)
3. معالجة خاصة في الواجهة تفسد البيانات
4. مشكلة في Serialization/Deserialization