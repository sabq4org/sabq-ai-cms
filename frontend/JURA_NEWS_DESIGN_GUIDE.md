# 🎨 دليل استخدام تصميم جُرعة في صفحة الأخبار

## 📁 الملفات الرئيسية

### 1. صفحة الأخبار الجديدة
```
/app/dashboard/news/page.tsx
```

### 2. ملفات الأنماط
```
/app/globals.css          # الأنماط العامة وفئات CSS
/styles/jur3a-colors.css  # متغيرات الألوان
```

### 3. صفحة المثال
```
/public/news-jura-design-example.html
```

## 🎯 المكونات الرئيسية

### 1. بطاقات الإحصائيات (StatCard)
```tsx
<StatCard
  title="إجمالي الأخبار"
  value={stats.totalNews.toLocaleString('ar-SA')}
  icon={<FileText />}
  color="#3b82f6"
  subtitle="جميع المقالات"
  trend={{ type: 'up', value: '+12%' }}
/>
```

**الخصائص:**
- `title`: عنوان البطاقة
- `value`: القيمة الرئيسية
- `icon`: أيقونة React component
- `color`: اللون الأساسي (hex)
- `subtitle`: نص توضيحي
- `trend`: اتجاه التغيير (اختياري)

### 2. التابات (Tabs) - نمط جُرعة الأصلي
```tsx
const statusTabs = [
  { 
    id: 'all', 
    name: 'جميع الأخبار', 
    count: 512,
    icon: <Newspaper className="w-5 h-5" />
  }
];
```

**مواصفات التابات:**
- خلفية شبه شفافة: `rgba(255, 255, 255, 0.6)`
- تأثير blur: `backdrop-filter: blur(8px)`
- حواف مستديرة: `border-radius: 12px`
- padding داخلي: `4px`
- فجوة بين التابات: `gap: 4px`

**التاب النشط:**
- خلفية متدرجة: `linear-gradient(135deg, #3b82f6, #2563eb)`
- لون النص: أبيض
- ظل: `0 2px 8px rgba(59, 130, 246, 0.3)`

**التاب غير النشط:**
- خلفية شفافة
- لون النص: `#374151`
- عند hover: `rgba(0, 0, 0, 0.04)`

### 3. الجدول المتقدم
- تصميم زجاجي شفاف
- تأثيرات hover متحركة
- صفوف ملونة للحالات الخاصة
- أيقونات إجراءات تفاعلية

## 🎨 الألوان المستخدمة

### الألوان الأساسية
```css
/* أزرق - اللون الرئيسي */
--primary-500: #3b82f6;
--primary-600: #2563eb;

/* سماوي - اللون الثانوي */
--secondary-500: #06b6d4;
--secondary-600: #0891b2;

/* ألوان الحالات */
--success: #10b981;  /* أخضر */
--warning: #f59e0b;  /* برتقالي */
--error: #ef4444;    /* أحمر */
--info: #3b82f6;     /* أزرق */
```

### تدرجات الخلفية
```css
/* الخلفية الرئيسية */
background: linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #ecfeff 100%);

/* تأثير الزجاج */
background: rgba(255, 255, 255, 0.9);
backdrop-filter: blur(10px);
```

## 💫 الأنماط والفئات

### 1. تأثير الزجاج
```html
<div class="glass-effect">
  محتوى بتأثير زجاجي
</div>
```

### 2. النص المتدرج
```html
<h1 class="gradient-text">
  عنوان بتدرج لوني
</h1>
```

### 3. الأزرار
```html
<button class="btn-primary">
  زر رئيسي
</button>
```

### 4. الشارات (Badges)
```html
<span class="badge badge-success">منشور</span>
<span class="badge badge-warning">مسودة</span>
<span class="badge badge-primary">مثبت</span>
<span class="badge badge-danger">عاجل</span>
```

### 5. البطاقات
```html
<div class="stat-card">
  <!-- محتوى البطاقة -->
</div>
```

### 6. الجداول
```html
<div class="jura-table-container">
  <div class="jura-table-header">
    <!-- رأس الجدول -->
  </div>
  <div class="jura-table-row">
    <!-- صف الجدول -->
  </div>
</div>
```

## 🔧 التخصيص

### تغيير الألوان
قم بتعديل متغيرات CSS في `/styles/jur3a-colors.css`:
```css
:root {
  --primary-500: #your-color;
  --secondary-500: #your-color;
}
```

### إضافة بطاقة إحصائيات جديدة
```tsx
<StatCard
  title="عنوان مخصص"
  value="123"
  icon={<YourIcon />}
  color="#8b5cf6"
  subtitle="وصف"
  trend={{ type: 'down', value: '-5%' }}
/>
```

### تخصيص التابات
```tsx
const customTabs = [
  {
    id: 'custom',
    name: 'تاب مخصص',
    count: 10,
    icon: <CustomIcon className="w-5 h-5" />
  }
];
```

## 📱 التوافق

- ✅ متوافق مع جميع الشاشات (Responsive)
- ✅ يدعم الوضع الليلي (Dark Mode)
- ✅ يدعم RTL بالكامل
- ✅ يعمل على جميع المتصفحات الحديثة

## 🚀 نصائح للأداء

1. **استخدم lazy loading للأيقونات**:
   ```tsx
   const Icon = lazy(() => import('lucide-react'));
   ```

2. **تجنب إعادة الحسابات**:
   ```tsx
   const memoizedStats = useMemo(() => calculateStats(data), [data]);
   ```

3. **استخدم التحريكات بحذر**:
   - لا تضع تحريكات على عناصر كثيرة
   - استخدم `will-change` للعناصر المتحركة

## 🛠️ استكشاف الأخطاء

### مشكلة: الأنماط لا تظهر
- تأكد من استيراد ملفات CSS في `globals.css`
- تحقق من مسار الملفات

### مشكلة: الخط لا يظهر
- تأكد من تحميل خط Tajawal في `layout.tsx` أو HTML

### مشكلة: تأثير الزجاج لا يعمل
- بعض المتصفحات القديمة لا تدعم `backdrop-filter`
- استخدم fallback بخلفية شبه شفافة

## 📖 مراجع إضافية

- [دليل تصميم جُرعة الأصلي](/docs/JURA_DESIGN_GUIDE.md)
- [مكونات جُرعة المتقدمة](/components/ui/)
- [مثال حي](/public/news-jura-design-example.html) 