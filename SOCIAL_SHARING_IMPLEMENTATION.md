# تطبيق Open Graph Tags و Twitter Cards للمشاركة الاجتماعية

## 📋 ملخص التحديث

تم تطبيق نظام شامل للـ Open Graph tags و Twitter Cards لضمان عرض مثالي للمقالات عند المشاركة على منصات التواصل الاجتماعي.

## 🎯 المنصات المدعومة

- ✅ **WhatsApp** - عرض العنوان، الوصف، والصورة
- ✅ **Twitter/X** - بطاقة كبيرة مع صورة
- ✅ **Telegram** - عرض تلقائي للعنوان والصورة
- ✅ **Facebook** - معاينة كاملة مع metadata
- ✅ **LinkedIn** - مشاركة احترافية مع تفاصيل المقال

## 🛠️ الملفات المطبقة

### 1. **Server-side Metadata** (`/app/article/[id]/metadata.ts`)
```typescript
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  // جلب المقال من قاعدة البيانات
  // تنسيق البيانات للمشاركة الاجتماعية
  // إرجاع Open Graph و Twitter Cards
}
```

**المميزات:**
- جلب ديناميكي لبيانات المقال
- تحسين العناوين والأوصاف للمشاركة
- تحديد الصور المناسبة أو استخدام صورة افتراضية
- معالجة حالات الخطأ بـ fallback metadata

### 2. **Client-side Dynamic Updates** (`ArticleClientComponent.tsx`)
```typescript
// تحديث Open Graph meta tags ديناميكياً للمشاركة الاجتماعية
const updateMetaTag = (property: string, content: string) => {
  let metaTag = document.querySelector(`meta[property="${property}"]`);
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute('property', property);
    document.head.appendChild(metaTag);
  }
  metaTag.setAttribute('content', content);
};
```

**المميزات:**
- تحديث فوري للـ meta tags عند تحميل المقال
- إضافة tags مفقودة ديناميكياً
- تحديث صورة المقال، العنوان، والوصف
- دعم Twitter Cards و Open Graph

### 3. **Social Sharing Configuration** (`/lib/social-sharing-config.ts`)
```typescript
export const SOCIAL_SHARING_CONFIG = {
  siteName: "صحيفة سبق الإلكترونية",
  siteDescription: "أخبار السعودية والعالم...",
  social: {
    twitter: "@sabq_news",
    facebook: "sabq.news",
  },
  // إعدادات محددة لكل منصة
};
```

**المميزات:**
- إعدادات مركزية للمشاركة الاجتماعية
- قوالب نصوص مخصصة لكل منصة
- أبعاد الصور المثلى (1200x630)
- حدود النصوص لكل منصة

### 4. **Social Sharing Buttons** (`/components/article/SocialSharingButtons.tsx`)
```typescript
export default function SocialSharingButtons({ article }) {
  const sharingLinks = generateSharingLinks(article);
  // أزرار مشاركة تفاعلية لجميع المنصات
}
```

**المميزات:**
- أزرار مشاركة سريعة لجميع المنصات
- نوافذ منبثقة مخصصة للمشاركة
- نسخ الرابط بنقرة واحدة
- تصميم responsive مع Tailwind CSS

## 🎨 الصورة الافتراضية

تم إنشاء صورة افتراضية احترافية بصيغة SVG:
- **المسار:** `/public/images/sabq-logo-social.svg`
- **الأبعاد:** 1200x630 (مثلى للمشاركة الاجتماعية)
- **التصميم:** خلفية متدرجة مع نص "صحيفة سبق الإلكترونية"

## 🔧 متغيرات البيئة المطلوبة

```bash
NEXT_PUBLIC_SITE_URL=https://production-branch.dvdwfd4vy831i.amplifyapp.com
```

## 📱 النتائج المتوقعة

### WhatsApp
- عرض العنوان كاملاً
- الوصف (أول 160 حرف)
- الصورة المميزة أو الافتراضية
- رابط الموقع

### Twitter/X
- بطاقة "summary_large_image"
- العنوان مع اسم الصحيفة
- الوصف المختصر
- صورة بأبعاد 1200x630

### Telegram
- معاينة تلقائية للرابط
- العنوان والصورة من og:title و og:image
- وصف المقال

### Facebook
- بطاقة مشاركة كاملة
- جميع بيانات Open Graph
- صورة عالية الدقة
- معلومات المؤلف والتصنيف

## ✅ التحقق من النجاح

### أدوات التحقق:
1. **Facebook Sharing Debugger:** https://developers.facebook.com/tools/debug/
2. **Twitter Card Validator:** https://cards-dev.twitter.com/validator
3. **LinkedIn Post Inspector:** https://www.linkedin.com/post-inspector/

### اختبار سريع:
1. انسخ رابط أي مقال
2. الصق الرابط في WhatsApp أو Telegram
3. تحقق من ظهور العنوان والصورة والوصف

## 🚀 المميزات المضافة

- ✅ **Server-side rendering** للـ metadata
- ✅ **Client-side dynamic updates**
- ✅ **Error handling** مع fallback defaults
- ✅ **Arabic language support** (ar_SA locale)
- ✅ **Responsive social buttons**
- ✅ **Professional default image**
- ✅ **Schema.org structured data**
- ✅ **Multiple platform optimization**

## 📈 تحسين الأداء

- تحميل الصور بكسل مناسب لكل منصة
- ضغط النصوص لتتناسب مع حدود كل منصة
- cache-friendly metadata generation
- lazy loading للأزرار الاجتماعية

هذا التطبيق يضمن أن جميع مقالات صحيفة سبق ستظهر بشكل احترافي ومتسق عند مشاركتها على أي منصة تواصل اجتماعي.
