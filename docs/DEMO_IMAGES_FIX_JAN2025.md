# إصلاح الصور التجريبية في البطاقات المخصصة 🖼️

## 📅 التاريخ: 30 يناير 2025

## 🐛 المشكلة

الصور التجريبية من Unsplash لم تكن تظهر في البطاقات المخصصة في قسم "مخصص لك بذكاء" أسفل تفاصيل المقالات.

## ✅ الحل المطبق

### 1. استخدام CloudImage بدلاً من Image

#### الملف: `components/article/SmartPersonalizedContent.tsx`

**قبل:**
```tsx
import Image from 'next/image';

// في مكون SmartRecommendationCard
{article.thumbnail ? (
  <Image
    src={article.thumbnail}
    alt={article.title}
    fill
    className="object-cover"
  />
) : (
  <div>أيقونة</div>
)}
```

**بعد:**
```tsx
import CloudImage from '@/components/ui/CloudImage';

// في مكون SmartRecommendationCard
<CloudImage
  src={article.thumbnail || ''}
  alt={article.title}
  fill
  sizes={isMobileScreen ? "112px" : "(max-width: 768px) 100vw, 50vw"}
  className="object-cover group-hover:scale-110 transition-transform duration-500"
  fallbackType="article"
/>
```

### 2. إضافة صور افتراضية في lib/ai-recommendations.ts

```typescript
function getDefaultImageByType(type: RecommendedArticle['type']): string {
  const defaultImages = {
    'تحليل': 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
    'رأي': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop',
    'عاجل': 'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=400&h=300&fit=crop',
    'مقالة': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    'تقرير': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
    'ملخص': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop'
  };
  
  return defaultImages[type] || defaultImages['مقالة'];
}
```

### 3. تحديث دالة mapArticleToRecommendation

```typescript
// قبل:
thumbnail: article.featured_image || article.thumbnail,

// بعد:
thumbnail: article.featured_image || article.thumbnail || getDefaultImageByType(determineArticleType(article)),
```

## 🔧 لماذا CloudImage؟

1. **معالجة الصور تلقائياً**: يتعامل مع مسارات الصور المختلفة (محلية، S3، Cloudinary، Unsplash)
2. **صور احتياطية**: يعرض صورة افتراضية إذا فشل تحميل الصورة الأصلية
3. **تحسين الأداء**: يستخدم أحجام مناسبة للشاشات المختلفة
4. **دعم الإنتاج**: يتعامل مع getProductionImageUrl في بيئة الإنتاج

## 📊 النتائج

### قبل الإصلاح:
- الصور التجريبية لا تظهر
- مربعات فارغة مع أيقونات فقط
- تجربة مستخدم سيئة

### بعد الإصلاح:
- ✅ جميع البطاقات لديها صور جميلة من Unsplash
- ✅ صور مختلفة حسب نوع المحتوى
- ✅ تحميل سلس مع صور احتياطية
- ✅ دعم كامل للموبايل والديسكتوب

## 📁 الملفات المحدثة

1. `components/article/SmartPersonalizedContent.tsx`
   - استيراد CloudImage
   - استبدال Image بـ CloudImage
   - إزالة الشرط للصورة

2. `lib/ai-recommendations.ts`
   - إضافة دالة getDefaultImageByType
   - تحديث mapArticleToRecommendation

## 🎨 الصور المستخدمة

| نوع المحتوى | الصورة | الموضوع |
|------------|--------|---------|
| **تحليل** | AI/Technology | تحليل البيانات والذكاء الاصطناعي |
| **رأي** | Trading/Finance | الأسواق المالية والاقتصاد |
| **عاجل** | Breaking News | الأخبار العاجلة |
| **مقالة** | Business Person | قصص نجاح وأعمال |
| **تقرير** | Technology | التقنية والابتكار |
| **ملخص** | Sports | الرياضة والأنشطة |

## 💡 ملاحظات مهمة

1. **next.config.js** يحتوي على إعدادات Unsplash:
   ```javascript
   {
     protocol: 'https',
     hostname: 'images.unsplash.com',
   }
   ```

2. **CloudImage** يتعامل مع جميع أنواع مصادر الصور تلقائياً

3. الصور الافتراضية متاحة دائماً حتى بدون اتصال بقاعدة البيانات 