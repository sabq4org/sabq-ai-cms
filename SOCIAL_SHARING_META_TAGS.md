# 🚀 Open Graph Tags - إعداد المشاركة الاجتماعية

## ✅ تم التطبيق بنجاح

تم إضافة Open Graph Tags بشكل شامل لجميع صفحات المقالات في الموقع.

## 📋 ما تم تطبيقه

### 1. Server Components مع generateMetadata

تم تحويل صفحة المقال (`app/article/[id]/page.tsx`) إلى Server Component مع:

```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const article = await getArticle(id);
  
  return {
    title: `${article.title} | صحيفة سبق الإلكترونية`,
    description: article.excerpt || article.summary,
    
    // Open Graph للمشاركة الاجتماعية
    openGraph: {
      title: article.title,
      description: article.excerpt || article.summary,
      url: `https://sabq.org/article/${id}`,
      siteName: 'صحيفة سبق الإلكترونية',
      locale: 'ar_SA',
      type: 'article',
      publishedTime: article.published_at,
      authors: [article.author?.name],
      images: [{
        url: article.featured_image,
        width: 1200,
        height: 630,
        alt: article.title,
      }],
    },
    
    // Twitter Cards
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [article.featured_image],
      site: '@sabqorg',
    },
  };
}
```

### 2. Client Components منفصلة

تم فصل منطق التفاعل في `app/article/[id]/client.tsx` للحفاظ على:
- إدارة الحالة (useState, useEffect)
- التفاعلات الذكية
- مشغل الصوت
- شريط التقدم

### 3. Meta Tags شاملة

#### للمقالات:
- `og:title` - عنوان المقال
- `og:description` - موجز المقال
- `og:image` - صورة المقال البارزة
- `og:url` - رابط المقال الكامل
- `og:type` - نوع المحتوى (article)
- `og:site_name` - اسم الموقع
- `og:locale` - اللغة العربية (ar_SA)
- `article:author` - اسم الكاتب
- `article:published_time` - تاريخ النشر
- `article:section` - التصنيف
- `twitter:card` - Twitter Card نوع large image

#### للموقع الرئيسي:
- Meta tags أساسية في `app/layout.tsx`
- Open Graph للصفحة الرئيسية
- Twitter Cards للموقع
- SEO optimization

## 🧪 كيفية الاختبار

### 1. اختبار محلي
1. شغل السيرفر: `npm run dev`
2. اذهب إلى: http://localhost:3000/test-meta-tags
3. افحص source code الصفحة للتأكد من وجود Meta Tags

### 2. اختبار المشاركة الفعلية
1. انسخ رابط أي مقال (مثل: https://sabq.org/article/123)
2. شاركه في:
   - واتساب WhatsApp
   - تويتر Twitter  
   - تيليجرام Telegram
   - فيسبوك Facebook
3. ستظهر معاينة تحتوي على العنوان والوصف والصورة

### 3. أدوات التحقق
- **Facebook Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **Open Graph Debugger**: https://www.opengraph.xyz/

## 📁 الملفات المعدلة

```
app/
├── layout.tsx              # Meta tags رئيسية
├── article/[id]/
│   ├── page.tsx            # Server Component + generateMetadata  
│   └── client.tsx          # Client Component للتفاعل
└── test-meta-tags/
    └── page.tsx            # صفحة اختبار Meta Tags
```

## 🔧 الإعدادات المطلوبة

### متغيرات البيئة
```env
NEXT_PUBLIC_SITE_URL=https://sabq.org
NEXT_PUBLIC_SITE_NAME="صحيفة سبق الإلكترونية"
```

### صورة اجتماعية افتراضية
تأكد من وجود صورة افتراضية في:
```
public/images/sabq-logo-social.jpg
```
بأبعاد: 1200x630 بكسل

## 🎯 النتائج المتوقعة

### قبل التطبيق:
❌ رابط نصي فقط بدون معاينة
❌ عدم ظهور صورة أو وصف
❌ مظهر غير احترافي

### بعد التطبيق:
✅ معاينة كاملة مع الصورة والعنوان
✅ وصف مختصر جذاب
✅ عرض احترافي في جميع المنصات
✅ زيادة معدل النقر (CTR)

## 📱 المنصات المدعومة

- **WhatsApp** ✅
- **Twitter/X** ✅  
- **Telegram** ✅
- **Facebook** ✅
- **LinkedIn** ✅
- **Discord** ✅
- **Slack** ✅

## 🚨 ملاحظات مهمة

1. **Cache المنصات**: قد تحتاج المنصات وقت لتحديث المعاينة (5-30 دقيقة)
2. **أبعاد الصورة**: يُفضل 1200x630 للحصول على أفضل جودة
3. **طول النص**: 
   - العنوان: أقل من 60 حرف
   - الوصف: بين 120-160 حرف
4. **HTTPS مطلوب**: للعمل في الإنتاج

## 🔄 التحديثات التلقائية

Meta Tags تتحدث تلقائياً عند:
- تعديل عنوان المقال
- تغيير الوصف أو الموجز
- تحديث الصورة البارزة
- تغيير الكاتب أو التصنيف

---

## 🆘 استكشاف الأخطاء

### المعاينة لا تظهر:
1. تأكد من وجود HTTPS
2. افحص صحة رابط الصورة
3. استخدم Facebook Debugger للفحص
4. امسح Cache المنصة

### صورة لا تظهر:
1. تأكد من صحة رابط الصورة
2. تأكد من أن الصورة accessible من الإنترنت
3. تأكد من أبعاد الصورة (1200x630)

### نص مقطوع:
1. اختصر العنوان لأقل من 60 حرف
2. اختصر الوصف لبين 120-160 حرف

---

**✨ النتيجة**: المقالات الآن ستظهر بمعاينة احترافية عند المشاركة في جميع المنصات الاجتماعية!
