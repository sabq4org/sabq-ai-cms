# نظام التصميم الموحد للوحة التحكم
## Admin Dashboard Design System

---

## 🎨 نظام الألوان

### الألوان الأساسية
```css
--brand-primary: #1e40af;    /* أزرق داكن */
--brand-accent: #10b981;     /* أخضر */
--brand-secondary: #6b7280;  /* رمادي */
```

### ألوان الحالة
```css
--success: #10b981;  /* أخضر */
--warning: #f59e0b;  /* برتقالي */
--error: #ef4444;    /* أحمر */
--info: #3b82f6;     /* أزرق */
```

### ألوان الخلفية
```css
--bg-primary: #ffffff;       /* أبيض (Light Mode) */
--bg-secondary: #f9fafb;     /* رمادي فاتح جداً */
--bg-dark: #111827;          /* أسود (Dark Mode) */
--bg-dark-secondary: #1f2937; /* رمادي داكن */
```

---

## 📏 نظام المسافات (Spacing)

### الهوامش الخارجية (Margins)
```
- xs: 4px   (0.25rem)
- sm: 8px   (0.5rem)
- md: 16px  (1rem)
- lg: 24px  (1.5rem)
- xl: 32px  (2rem)
- 2xl: 48px (3rem)
```

### الحشو الداخلي (Padding)
```
Container:
- Mobile: 16px (p-4)
- Tablet: 24px (p-6)
- Desktop: 32px-40px (p-8 - p-10)

Cards:
- Small: 16px (p-4)
- Medium: 24px (p-6)
- Large: 32px (p-8)

Buttons:
- Small: 8px 16px (px-4 py-2)
- Medium: 12px 24px (px-6 py-3)
- Large: 16px 32px (px-8 py-4)
```

### الفجوات (Gaps)
```
Grid/Flex:
- Small: 16px (gap-4)
- Medium: 24px (gap-6)
- Large: 32px (gap-8)
```

---

## 📐 التخطيط (Layout)

### الهيدر (Header)
```
- Height: 56px (h-14)
- Position: fixed top-0
- z-index: 50
- Background: white/gray-800
- Border-bottom: 1px
```

### الشريط الجانبي (Sidebar)
```
Desktop:
- Width (Open): 256px (w-64)
- Width (Collapsed): 80px (w-20)
- Position: fixed
- Top: 56px (top-14)
- Height: calc(100vh - 56px)
- Padding: 16px (p-4)

Mobile:
- Width: 256px (w-64)
- Position: fixed
- Overlay: backdrop blur
```

### منطقة المحتوى (Main Content)
```
Desktop:
- Margin-right: 256px (sidebar width)
- Padding: 24px-40px (p-6 - p-10)
- Max-width: 1280px (max-w-7xl)

Mobile:
- Margin-right: 0
- Padding: 16px-24px (p-4 - p-6)
```

---

## 🔤 الخطوط (Typography)

### العناوين (Headings)
```
H1: text-2xl md:text-3xl font-bold (24px-30px)
H2: text-xl md:text-2xl font-semibold (20px-24px)
H3: text-lg font-semibold (18px)
H4: text-base font-medium (16px)
```

### النصوص (Body Text)
```
Large: text-base (16px)
Medium: text-sm (14px)
Small: text-xs (12px)
```

### الأوزان (Font Weights)
```
Regular: font-normal (400)
Medium: font-medium (500)
Semibold: font-semibold (600)
Bold: font-bold (700)
```

---

## 🎴 المكونات (Components)

### البطاقات (Cards)
```tsx
<AdminCard
  title="عنوان البطاقة"
  description="وصف البطاقة"
  padding="md"
  className="..."
>
  {children}
</AdminCard>
```

**الأنماط:**
- Background: white/gray-800
- Border: 1px solid gray-200/gray-700
- Border-radius: 8px (rounded-lg)
- Shadow: sm
- Hover: shadow-md

### الأزرار (Buttons)
```tsx
// Primary
<button className="px-6 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg font-medium transition-colors">
  زر أساسي
</button>

// Secondary
<button className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors">
  زر ثانوي
</button>

// Outline
<button className="px-6 py-2.5 border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white rounded-lg font-medium transition-colors">
  زر محدد
</button>
```

### الحقول (Inputs)
```tsx
<input
  type="text"
  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
  placeholder="..."
/>
```

---

## 📱 Responsive Design

### Breakpoints
```
sm: 640px   (Mobile)
md: 768px   (Tablet)
lg: 1024px  (Desktop)
xl: 1280px  (Large Desktop)
2xl: 1536px (Extra Large)
```

### Grid System
```tsx
// 1 Column (Mobile)
<div className="grid grid-cols-1 gap-4">

// 2 Columns (Tablet+)
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

// 3 Columns (Desktop+)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// 4 Columns (Large Desktop)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
```

---

## 🎯 أمثلة الاستخدام

### صفحة داخلية كاملة
```tsx
import AdminPageContainer, { AdminCard, AdminGrid } from "@/components/admin/modern-dashboard/AdminPageContainer";

export default function MyAdminPage() {
  return (
    <AdminPageContainer
      title="عنوان الصفحة"
      description="وصف الصفحة"
      breadcrumbs={[
        { label: "القسم", href: "/admin/modern/section" },
        { label: "الصفحة الحالية" }
      ]}
      actions={
        <button className="px-6 py-2.5 bg-brand-primary text-white rounded-lg">
          إجراء جديد
        </button>
      }
    >
      {/* المحتوى */}
      <AdminGrid cols={3} gap="md">
        <AdminCard title="بطاقة 1" padding="md">
          محتوى البطاقة
        </AdminCard>
        <AdminCard title="بطاقة 2" padding="md">
          محتوى البطاقة
        </AdminCard>
        <AdminCard title="بطاقة 3" padding="md">
          محتوى البطاقة
        </AdminCard>
      </AdminGrid>
    </AdminPageContainer>
  );
}
```

---

## ✅ قواعد التصميم

### 1. الاتساق (Consistency)
- ✅ استخدم المكونات الموحدة دائماً
- ✅ التزم بنظام المسافات المحدد
- ✅ استخدم الألوان من النظام فقط

### 2. الوضوح (Clarity)
- ✅ هوامش واضحة ومتوازنة
- ✅ تباين كافٍ بين النص والخلفية
- ✅ أيقونات واضحة ومفهومة

### 3. الاستجابة (Responsiveness)
- ✅ تصميم يعمل على جميع الأجهزة
- ✅ استخدم breakpoints بشكل صحيح
- ✅ اختبر على شاشات مختلفة

### 4. الأداء (Performance)
- ✅ استخدم Tailwind CSS
- ✅ تجنب inline styles
- ✅ lazy loading للمكونات الثقيلة

---

## 🚀 الخطوات التالية

1. ✅ استخدم `AdminPageContainer` لجميع الصفحات الجديدة
2. ✅ استبدل الصفحات القديمة تدريجياً
3. ✅ التزم بنظام التصميم الموحد
4. ✅ اختبر على جميع الأجهزة

---

## 📚 المراجع

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Material Design Guidelines](https://material.io/design)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

