# 📚 مرجع المكونات الجديدة

---

## 🎨 EnhancedHeroSection - دليل الاستخدام

### الاستيراد البسيط
```tsx
import EnhancedHeroSection from "@/components/home/EnhancedHeroSection";

export default function Page() {
  return <EnhancedHeroSection />;
}
```

### مع Props مخصصة
```tsx
<EnhancedHeroSection 
  className="px-4 py-8"
  variant="default"
/>
```

### Props المتاحة
```tsx
interface HeroSectionProps {
  className?: string;        // classes مخصصة
  variant?: "default" | "compact" | "full";  // حجم Hero
}
```

### المميزات:
- ✅ Background ديناميكي بخلفيات حية
- ✅ رسالة ترحيب ذكية تدعم العربية
- ✅ 3 إحصائيات سريعة
- ✅ 2 زري CTA محسّنان
- ✅ متوافق مع Dark Mode
- ✅ تأثيرات Spring عند الظهور

---

## 🏷️ SectionDivider - دليل الاستخدام

### الاستخدام الأساسي
```tsx
import { SectionDivider } from "@/components/ui/SectionDivider";

<SectionDivider 
  title="الأخبار المميزة"
  color="blue"
  variant="default"
/>
```

### مع العنوان الفرعي
```tsx
<SectionDivider 
  title="الأخبار المميزة"
  subtitle="أهم الأخبار والمقالات"
  color="blue"
  variant="gradient"
/>
```

### Props المتاحة
```tsx
interface SectionDividerProps {
  title?: string;                           // العنوان الرئيسي
  subtitle?: string;                        // العنوان الفرعي
  icon?: React.ReactNode;                   // أيقونة مخصصة
  color?: "blue" | "green" | "purple" | "orange";  // اللون
  variant?: "default" | "light" | "gradient";     // النوع
  showDot?: boolean;                        // إظهار النقاط المتحركة
}
```

### الألوان المتاحة
```tsx
// 🔵 أزرق - للأخبار والمعلومات
<SectionDivider title="الأخبار" color="blue" />

// 🟢 أخضر - للبودكاست والآراء
<SectionDivider title="البودكاست" color="green" />

// 🟣 بنفسجي - للتحليلات والمختارات
<SectionDivider title="التحليل" color="purple" />

// 🟠 برتقالي - للمحتوى المتميز
<SectionDivider title="المتميز" color="orange" />
```

---

## ✨ AnimatedComponents - دليل الاستخدام

### 1. HoverCard - بطاقة مع تأثير Hover
```tsx
import { HoverCard } from "@/components/ui/AnimatedComponents";

<HoverCard 
  title="عنوان البطاقة"
  description="وصف قصير للبطاقة"
/>
```

### 2. AnimatedButton - زر مع تأثيرات
```tsx
import { AnimatedButton } from "@/components/ui/AnimatedComponents";

<AnimatedButton variant="primary">
  اضغط هنا
</AnimatedButton>

<AnimatedButton variant="secondary">
  خيار آخر
</AnimatedButton>
```

### 3. FadeIn - تأثير ظهور تدريجي
```tsx
import { FadeIn } from "@/components/ui/AnimatedComponents";

<FadeIn duration={0.5} delay={0.2}>
  محتوى يظهر تدريجياً
</FadeIn>
```

### 4. StaggerContainer - حاوية متوالية
```tsx
import { StaggerContainer } from "@/components/ui/AnimatedComponents";

<StaggerContainer>
  <motion.div>العنصر الأول</motion.div>
  <motion.div>العنصر الثاني</motion.div>
</StaggerContainer>
```

### 5. Counter - عداد متحرك
```tsx
import { Counter } from "@/components/ui/AnimatedComponents";

<Counter from={0} to={100} />
<Counter from={0} to={50} suffix=" ألف" />
```

---

## 🔄 أمثلة عملية

### مثال 1: قسم محتوى محسّن
```tsx
import { SectionDivider, FadeIn } from "@/components/ui/SectionDivider";

export default function NewsSection() {
  return (
    <FadeIn>
      <SectionDivider 
        title="أحدث الأخبار"
        color="blue"
        variant="gradient"
      />
      {/* محتوى هنا */}
    </FadeIn>
  );
}
```

### مثال 2: إحصائيات متحركة
```tsx
import { Counter } from "@/components/ui/AnimatedComponents";

export default function Statistics() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <Counter from={0} to={1250} suffix="+" />
        <p>مقالة</p>
      </div>
    </div>
  );
}
```

---

**آخر تحديث**: 2024
