# 🔷 نظام تنظيم مسارات المقالات في منصة سبق

## المبدأ الأساسي

يتم توزيع المقالات في منصة سبق على مسارين منفصلين وحصريين:

### 1. المقالات العادية (أخبار، تقارير، تغطيات)
- **المسار:** `/article/[id]`
- **الوصف:** جميع المقالات الإخبارية والتقارير والتغطيات الصحفية
- **أمثلة:** أخبار محلية، دولية، رياضة، اقتصاد، تقنية، إلخ

### 2. مقالات الرأي (كتّاب، زوايا رأي)
- **المسار:** `/opinion/[id]`
- **الوصف:** مقالات الرأي والتحليل من الكتاب والمفكرين
- **أمثلة:** مقالات رأي، تحليلات، وجهات نظر، زوايا فكرية

## الدالة المركزية `getArticleLink()`

### الموقع
```typescript
// lib/utils.ts
export function getArticleLink(article: any): string
```

### منطق التصنيف

الدالة تفحص المقال بعدة طرق لتحديد نوعه:

#### 1. فحص `category.slug`
```typescript
article.category?.slug === 'opinion' ||
article.category?.slug === 'راي' ||
article.category?.slug === 'رأي'
```

#### 2. فحص `category.name` و `category.name_ar`
```typescript
article.category?.name === 'رأي' ||
article.category?.name === 'راي' ||
article.category?.name === 'Opinion' ||
article.category?.name_ar === 'رأي' ||
article.category?.name_ar === 'راي'
```

#### 3. فحص `category_name`
```typescript
article.category_name === 'رأي' ||
article.category_name === 'راي' ||
article.category_name === 'Opinion'
```

#### 4. فحص `type` field
```typescript
article.type === 'OPINION' ||
article.type === 'opinion'
```

#### 5. فحص metadata
```typescript
article.metadata?.type === 'opinion' ||
article.is_opinion === true
```

#### 6. فحص category_id خاص
```typescript
article.category_id === 'opinion'
```

#### 7. فحص الكلمات المفتاحية (احتياطي)
```typescript
article.title?.includes('رأي') ||
article.title?.includes('وجهة نظر') ||
article.tags?.some((tag: string) => ['رأي', 'راي', 'opinion'].includes(tag?.toLowerCase()))
```

## الاستخدام

### Import
```typescript
import { getArticleLink } from '@/lib/utils';
```

### استخدام في المكونات
```typescript
<Link href={getArticleLink(article)}>
  {article.title}
</Link>
```

## المكونات المحدثة

تم تحديث المكونات التالية لاستخدام النظام الجديد:

- ✅ `app/page.tsx` - الصفحة الرئيسية
- ✅ `components/ArticleCard.tsx` - بطاقة المقال
- ✅ `components/mobile/MobileArticleCard.tsx` - بطاقة الموبايل  
- ✅ `components/smart-blocks/SmartDigestBlock.tsx` - بلوك الملخص الذكي
- ✅ `components/smart-blocks/HeadlineListBlock.tsx` - قائمة العناوين
- ✅ `app/categories/[slug]/page.tsx` - صفحة الفئات
- ✅ `components/TodayOpinionsSection.tsx` - قسم آراء اليوم (كان صحيح مسبقاً)

## ضمانات النظام

### 🚫 منع التداخل
- مقالات الرأي **لا تظهر أبداً** في قسم الأخبار
- المقالات العادية **لا تظهر أبداً** في قسم مقالات الرأي

### 🎯 دقة التوجيه
- فحص شامل ومتعدد المستويات لضمان التصنيف الصحيح
- آلية احتياطية متقدمة للحالات الاستثنائية

### 🔧 سهولة الصيانة
- دالة مركزية واحدة لجميع أنحاء التطبيق
- تحديث واحد يؤثر على النظام بالكامل

## أمثلة عملية

### مقال رأي
```typescript
const opinionArticle = {
  id: "123",
  title: "مستقبل التعليم في المملكة",
  category: { slug: "opinion", name: "رأي" },
  author_name: "د. محمد الأحمد"
};

console.log(getArticleLink(opinionArticle)); 
// Output: "/opinion/123"
```

### مقال إخباري
```typescript
const newsArticle = {
  id: "456", 
  title: "انطلاق بطولة كأس العالم",
  category: { slug: "sports", name: "رياضة" }
};

console.log(getArticleLink(newsArticle));
// Output: "/article/456"
```

## ملاحظات مهمة

1. **الأولوية للدقة:** النظام يفضل الأمان في التصنيف
2. **التوافق مع المستقبل:** يدعم إضافة معايير جديدة بسهولة
3. **المرونة:** يتعامل مع تنسيقات بيانات متعددة
4. **الأداء:** فحص سريع ومحسن للأداء

---

**تم التنفيذ في:** يناير 2025  
**آخر تحديث:** 2025-01-07  
**حالة النظام:** ✅ مفعل ويعمل 