# 📐 دليل نظام التخطيط للوحة التحكم

## 🎯 المبادئ الأساسية

نظام التخطيط في لوحة تحكم "سبق الذكية" مبني على مبدأين أساسيين:

1. **التنفس البصري (Visual Breathing)**: تجنب امتداد المحتوى على كامل الشاشة لتقليل إجهاد العين
2. **التركيز على المحتوى (Content Focus)**: محاذاة مركزية ذكية مع هوامش مناسبة

---

## 🏗️ مكونات النظام

### 1. PageContainer

**الوظيفة**: المكون الأساسي لتغليف محتوى أي صفحة في لوحة التحكم.

**المميزات**:
- يحدد أقصى عرض للمحتوى (`max-width`)
- محاذاة تلقائية في المنتصف (`mx-auto`)
- هوامش داخلية متجاوبة للتنفس البصري
- دعم أحجام مختلفة حسب نوع المحتوى

**أحجام المحتوى**:
```typescript
size?: 'default' | 'wide' | 'narrow' | 'full'
```

- **`default`** (max-w-7xl): للصفحات العادية (النماذج، البطاقات، القوائم)
- **`wide`** (max-w-[1920px]): للجداول والمحتوى العريض (مع هوامش داخلية)
- **`narrow`** (max-w-4xl): للنماذج والمحتوى النصي الطويل
- **`full`**: للحالات الخاصة جداً (استخدم بحذر)

**مثال الاستخدام**:
```tsx
import { PageContainer } from '@/components/admin/layout';

export default function MyPage() {
  return (
    <PageContainer size="default">
      {/* محتوى الصفحة */}
    </PageContainer>
  );
}
```

**مع خلفية بطاقة**:
```tsx
<PageContainer size="narrow" withCard>
  {/* محتوى داخل بطاقة */}
</PageContainer>
```

---

### 2. PageHeader

**الوظيفة**: توحيد شكل عناوين الصفحات في كامل لوحة التحكم.

**المميزات**:
- عنوان رئيسي وصفي
- نص فرعي اختياري
- منطقة للأزرار والإجراءات
- خط فاصل اختياري
- متجاوب تماماً

**الخصائص**:
```typescript
interface PageHeaderProps {
  title: string;           // العنوان الرئيسي (مطلوب)
  subtitle?: string;       // النص الفرعي
  actions?: React.ReactNode; // أزرار أو إجراءات
  withDivider?: boolean;   // خط فاصل (default: true)
  className?: string;      // كلاسات إضافية
}
```

**مثال الاستخدام**:
```tsx
import { PageHeader } from '@/components/admin/layout';
import { Button } from '@/components/ui/button';

<PageHeader
  title="إدارة الأخبار"
  subtitle="عرض، تعديل، ونشر جميع الأخبار في المنصة."
  actions={
    <>
      <Button variant="outline">تصدير</Button>
      <Button>إضافة خبر جديد</Button>
    </>
  }
/>
```

---

## 📋 الأنماط الشائعة (Patterns)

### 1. صفحة قائمة/جدول

```tsx
import { PageContainer, PageHeader } from '@/components/admin/layout';

export default function ListPage() {
  return (
    <PageContainer size="wide">
      <PageHeader
        title="العنوان"
        subtitle="الوصف"
        actions={<Button>إضافة</Button>}
      />
      
      {/* فلاتر وبحث */}
      <div className="mb-6">
        <SearchAndFilters />
      </div>

      {/* الجدول داخل بطاقة */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <DataTable />
      </div>
    </PageContainer>
  );
}
```

### 2. صفحة لوحة معلومات (Dashboard)

```tsx
import { PageContainer, PageHeader } from '@/components/admin/layout';

export default function DashboardPage() {
  return (
    <PageContainer size="default">
      <PageHeader
        title="لوحة التحكم"
        subtitle="نظرة عامة على أداء المنصة"
      />

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard />
        <StatsCard />
        <StatsCard />
        <StatsCard />
      </div>

      {/* رسوم بيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <Chart />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <Chart />
        </div>
      </div>
    </PageContainer>
  );
}
```

### 3. صفحة نموذج

```tsx
import { PageContainer, PageHeader } from '@/components/admin/layout';

export default function FormPage() {
  return (
    <PageContainer size="narrow">
      <PageHeader
        title="إنشاء مقال جديد"
        subtitle="املأ الحقول أدناه لإنشاء مقال جديد"
      />

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <Form />
      </div>
    </PageContainer>
  );
}
```

### 4. صفحة تفاصيل

```tsx
import { PageContainer, PageHeader } from '@/components/admin/layout';

export default function DetailPage() {
  return (
    <PageContainer size="default">
      <PageHeader
        title="تفاصيل المقال"
        subtitle="عرض ومراجعة تفاصيل المقال"
        actions={
          <>
            <Button variant="outline">حذف</Button>
            <Button>تعديل</Button>
          </>
        }
      />

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <ArticleContent />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <ArticleMetadata />
        </div>
      </div>
    </PageContainer>
  );
}
```

---

## ✅ أفضل الممارسات

### 1. متى تستخدم كل حجم؟

| الحجم | متى تستخدمه | أمثلة |
|-------|-------------|--------|
| `default` | معظم الصفحات | لوحات المعلومات، النماذج متوسطة الحجم، التفاصيل |
| `wide` | محتوى يحتاج مساحة أفقية | جداول البيانات، قوائم طويلة |
| `narrow` | محتوى نصي أو نماذج بسيطة | إنشاء/تعديل المقالات، الإعدادات |
| `full` | حالات خاصة فقط | المحررات بملء الشاشة (نادر) |

### 2. تجنب هذه الأخطاء

❌ **خطأ**: إضافة `padding` أو `margin` خارجي على `PageContainer`
```tsx
<div className="p-8">
  <PageContainer>...</PageContainer>
</div>
```

✅ **صحيح**: استخدم `PageContainer` مباشرة
```tsx
<PageContainer>...</PageContainer>
```

---

❌ **خطأ**: عدم استخدام `PageHeader` لتوحيد العناوين
```tsx
<PageContainer>
  <h1 className="text-3xl mb-4">العنوان</h1>
  ...
</PageContainer>
```

✅ **صحيح**: استخدم `PageHeader` دائماً
```tsx
<PageContainer>
  <PageHeader title="العنوان" />
  ...
</PageContainer>
```

---

❌ **خطأ**: وضع `PageContainer` داخل `<main>` بخلفية مختلفة
```tsx
<main className="bg-white">
  <PageContainer>...</PageContainer>
</main>
```

✅ **صحيح**: اجعل `<main>` بالخلفية الرمادية الفاتحة
```tsx
<main className="bg-gray-50 dark:bg-gray-900 min-h-screen">
  <PageContainer>...</PageContainer>
</main>
```

---

### 3. الهيكل العام الموصى به

```tsx
// app/admin/[page]/page.tsx

import { PageContainer, PageHeader } from '@/components/admin/layout';

export default function AdminPage() {
  return (
    // الخلفية الرمادية الفاتحة للتباين
    <main className="flex-1 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <PageContainer size="default">
        {/* العنوان الموحد */}
        <PageHeader
          title="عنوان الصفحة"
          subtitle="وصف مختصر"
          actions={<Button>إجراء</Button>}
        />

        {/* المحتوى */}
        <div className="space-y-6">
          {/* بطاقات المحتوى */}
        </div>
      </PageContainer>
    </main>
  );
}
```

---

## 🎨 التخصيص

### تجاوز الأنماط

يمكنك تمرير `className` لتخصيص أي مكون:

```tsx
<PageContainer 
  size="default"
  className="bg-gradient-to-r from-blue-50 to-purple-50"
>
  {/* محتوى مع خلفية متدرجة */}
</PageContainer>
```

### إضافة أحجام مخصصة

في `PageContainer.tsx`:
```tsx
const pageContainerVariants = cva(
  'w-full mx-auto px-4 sm:px-6 lg:px-8 py-6',
  {
    variants: {
      size: {
        default: 'max-w-7xl',
        wide: 'max-w-[1920px]',
        narrow: 'max-w-4xl',
        full: 'max-w-full',
        // أضف حجماً جديداً
        custom: 'max-w-5xl',
      },
    },
  }
);
```

---

## 📱 التجاوب

جميع المكونات متجاوبة بشكل كامل:
- **الهوامش**: `px-4 sm:px-6 lg:px-8` (تزداد مع حجم الشاشة)
- **العناوين**: تتقلص على الشاشات الصغيرة
- **الأزرار**: تنتقل لأسفل على الموبايل في `PageHeader`

---

## 🌙 الوضع المظلم

المكونات تدعم الوضع المظلم تلقائياً باستخدام Tailwind `dark:`:
```tsx
<PageHeader 
  title="العنوان" // text-gray-900 dark:text-white
  subtitle="الوصف" // text-gray-600 dark:text-gray-400
/>
```

---

## 📊 قبل وبعد

### قبل (مشكلة):
```tsx
// صفحة تمتد على كامل الشاشة - مرهقة للعين
export default function NewsPage() {
  return (
    <div className="w-full">
      <h1>إدارة الأخبار</h1>
      <table>...</table>
    </div>
  );
}
```

### بعد (الحل):
```tsx
import { PageContainer, PageHeader } from '@/components/admin/layout';

export default function NewsPage() {
  return (
    <PageContainer size="wide">
      <PageHeader 
        title="إدارة الأخبار"
        subtitle="عرض وإدارة جميع الأخبار"
      />
      <div className="bg-white rounded-lg shadow-sm border">
        <table>...</table>
      </div>
    </PageContainer>
  );
}
```

---

## 🚀 النشر التدريجي

يمكنك تطبيق النظام تدريجياً:

1. **الصفحات الجديدة**: استخدم النظام من البداية
2. **الصفحات الحالية**: قم بالتحديث عند أول تعديل
3. **الأولوية**: ابدأ بالصفحات الأكثر استخداماً

---

## 🔧 استكشاف الأخطاء

### المحتوى لا يظهر في المنتصف؟
- تأكد من استخدام `mx-auto` (موجود افتراضياً في `PageContainer`)
- تحقق من عدم وجود `width: 100%` على العنصر الأب

### الهوامش غير كافية؟
- استخدم حجماً أصغر (`narrow` بدلاً من `wide`)
- أضف `className="px-8 lg:px-12"` للمزيد من الهوامش

### الجدول يتقطع على الشاشات الكبيرة؟
- استخدم `size="wide"` بدلاً من `default`
- أضف `overflow-x-auto` للجدول

---

## 📞 الدعم

للأسئلة أو المساعدة، راجع:
- 📁 الأمثلة في هذا المستند
- 💻 الكود في `components/admin/layout/`
- 👥 فريق التطوير

---

**آخر تحديث**: أكتوبر 2025  
**الإصدار**: 1.0.0  
**المطور**: فريق سبق الذكية 🚀
