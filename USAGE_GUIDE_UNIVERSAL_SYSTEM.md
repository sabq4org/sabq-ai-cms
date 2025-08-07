# دليل استخدام النظام الجديد للصور

## 🚀 كيفية الاستخدام

### 1. استخدام UniversalNewsCard في الصفحات

```tsx
import UniversalNewsCard from "@/components/ui/UniversalNewsCard";

// في الصفحة الرئيسية - عرض شبكي
function HomePage({ articles }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <UniversalNewsCard
          key={article.id}
          article={article}
          viewMode="grid"
          showExcerpt={true}
        />
      ))}
    </div>
  );
}

// في صفحة التصنيف - عرض قائمة
function CategoryPage({ articles }) {
  return (
    <div className="space-y-6">
      {articles.map((article) => (
        <UniversalNewsCard
          key={article.id}
          article={article}
          viewMode="list"
          showExcerpt={true}
        />
      ))}
    </div>
  );
}

// في الموبايل - عرض مضغوط
function MobileNewsList({ articles }) {
  return (
    <div className="space-y-3">
      {articles.map((article) => (
        <UniversalNewsCard
          key={article.id}
          article={article}
          viewMode="compact"
          showExcerpt={false}
        />
      ))}
    </div>
  );
}
```

### 2. استخدام SmartImage مباشرة

```tsx
import SmartImage from "@/components/ui/SmartImage";

// للمقالات - استخراج تلقائي من جميع المسارات
function ArticleImage({ article }) {
  return (
    <SmartImage
      article={article}
      alt={article.title}
      width={800}
      height={400}
      fallbackType="article"
      className="rounded-lg"
    />
  );
}

// للصور العادية مع احتياط
function ProfileImage({ user }) {
  return (
    <SmartImage
      src={user.avatar}
      alt={user.name}
      width={64}
      height={64}
      fallbackType="avatar"
      className="rounded-full"
    />
  );
}

// للصور بـ fill
function HeroImage({ article }) {
  return (
    <div className="relative h-96 w-full">
      <SmartImage
        article={article}
        alt={article.title}
        fill
        fallbackType="article"
        className="object-cover"
        sizes="100vw"
      />
    </div>
  );
}
```

### 3. استبدال المكونات الحالية

```tsx
// ❌ بدلاً من ArticleCard القديم
import ArticleCard from "@/components/ArticleCard";
<ArticleCard article={article} viewMode="grid" />

// ✅ استخدم UniversalNewsCard الجديد
import UniversalNewsCard from "@/components/ui/UniversalNewsCard";
<UniversalNewsCard article={article} viewMode="grid" />

// ❌ بدلاً من NewsCard القديم
import NewsCard from "@/components/NewsCard";
<NewsCard news={article} viewMode="list" />

// ✅ استخدم UniversalNewsCard الجديد
import UniversalNewsCard from "@/components/ui/UniversalNewsCard";
<UniversalNewsCard article={article} viewMode="list" />

// ❌ بدلاً من SafeImage
import SafeImage from "@/components/ui/SafeImage";
<SafeImage src={imageUrl} alt="صورة" />

// ✅ استخدم SmartImage الجديد
import SmartImage from "@/components/ui/SmartImage";
<SmartImage src={imageUrl} alt="صورة" fallbackType="general" />
```

## 🔧 أوضاع العرض المختلفة

### Grid View - للصفحة الرئيسية والأقسام
```tsx
<UniversalNewsCard
  article={article}
  viewMode="grid"
  showExcerpt={true}
  className="h-full" // للحفاظ على ارتفاع موحد
/>
```

### List View - لصفحات التصنيفات
```tsx
<UniversalNewsCard
  article={article}
  viewMode="list"
  showExcerpt={true}
  className="mb-6" // مسافة بين البطاقات
/>
```

### Compact View - للموبايل والشريط الجانبي
```tsx
<UniversalNewsCard
  article={article}
  viewMode="compact"
  showExcerpt={false}
  className="mb-3" // مسافة أقل للمظهر المضغوط
/>
```

## 🎨 التخصيص والتصميم

### CSS Classes المدعومة
- `className` - فئات CSS إضافية للبطاقة
- جميع فئات Tailwind CSS مدعومة
- تصميم متجاوب تلقائياً

### المتغيرات القابلة للتخصيص
```tsx
interface UniversalNewsCardProps {
  article: any;           // المقال أو الخبر
  viewMode?: "grid" | "list" | "compact";  // وضع العرض
  showExcerpt?: boolean;  // إظهار المقتطف
  className?: string;     // فئات CSS إضافية
}
```

## 🔄 مسارات الصور المدعومة

النظام يبحث تلقائياً في المسارات التالية:
- `article.featured_image`
- `article.image_url`
- `article.image`
- `article.thumbnail`
- `article.cover`
- `article.media[0].url`
- `article.meta.image`
- `article.metadata.image`
- `article.images[0]`
- `article.attachments[0].url`
- `article.customFields.image`
- `article.seo.image`
- `article.openGraph.image`

## 🛡️ الصور الاحتياطية

### التدرج الهرمي للاحتياط:
1. **الصورة الأصلية** من أي من المسارات أعلاه
2. **معالجة الإنتاج** (Cloudinary/S3) حسب البيئة
3. **صورة احتياطية محلية** من المجلد العام
4. **صورة Cloudinary الافتراضية** عالية الجودة

### أنواع الصور الافتراضية:
- `article` - للمقالات والأخبار
- `avatar` - للملفات الشخصية
- `category` - للتصنيفات
- `general` - عام

## 📱 التوافق مع الأجهزة

### الموبايل
- عرض مضغوط محسن
- صور محسنة للشاشات الصغيرة
- تحميل سريع ومحسن للبيانات

### الجهاز اللوحي
- عرض متوسط متوازن
- انتقال سلس بين الأوضاع
- دعم اللمس المحسن

### سطح المكتب
- عرض كامل غني بالتفاصيل
- تأثيرات hover متقدمة
- تخطيط محسن للشاشات الكبيرة

---

## 🚀 نصائح للأداء الأمثل

1. **استخدم viewMode المناسب** لكل سياق
2. **اضبط showExcerpt حسب المساحة** المتاحة
3. **استخدم className للتخصيص** بدلاً من تعديل المكون
4. **اختبر على أجهزة مختلفة** للتأكد من التجاوب
