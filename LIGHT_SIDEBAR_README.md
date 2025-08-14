# Light Sidebar (القائمة الجانبية للنسخة الخفيفة)

مكوّن حديث سريع الاستجابة يدعم العربية (RTL) والوضعين الفاتح والداكن.

## الميزات
- حركة انزلاق (Framer Motion)
- دعم RTL كامل
- تمييز العنصر النشط
- إغلاق عبر الخلفية أو ESC
- Trap Focus أساسي + إعادة التركيز لزر الفتح
- Mobile-first (عرض 78% / حد أقصى 300px)
- قفل تمرير الخلفية عند الفتح

## المسارات الافتراضية
| العنصر | المسار |
|--------|--------|
| الرئيسية | / |
| الأخبار | /news |
| الأقسام | /categories |
| المقالات | /articles |
| مُقترب | /muqtareb |
| عمق | /depth |

عدّل المسارات داخل `LightSidebar.tsx` حسب الحاجة.

## الاستخدام
```tsx
import { LightSidebar } from '@/components/light/LightSidebar';

export default function LightHeader() {
  return (
    <header className="flex items-center justify-between px-4 h-14 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800" dir="rtl">
      <LightSidebar />
      <h1 className="text-base font-bold text-gray-800 dark:text-gray-100 tracking-tight">سبق الذكية</h1>
    </header>
  );
}
```

أو وضع زر مخصص:
```tsx
import { LightSidebar, useLightSidebar } from '@/components/light/LightSidebar';

export default function Layout() {
  const sidebar = useLightSidebar();
  return (
    <>
      <button onClick={sidebar.toggle}>القائمة</button>
      {sidebar.isOpen && <LightSidebar initialOpen />}
    </>
  );
}
```

## التخصيص
- لاستبدال الألوان: عدّل كلاسات Tailwind في NavItem أو حالة العنصر النشط.
- لإضافة عناصر: عدّل مصفوفة `NAV_ITEMS`.

## إمكانية الوصول
- role="dialog" + aria-modal
- aria-current للعنصر النشط
- ESC للإغلاق
- Overlay لإغلاق سريع

## تحسينات مستقبلية مقترحة
- سحب للإغلاق على الهواتف
- دمج بحث سريع
- Lazy Load للأيقونات بديناميكية
- إضافة إعدادات / تبديل الوضع الداكن داخل اللوحة

## ملاحظات الأداء
- Framer Motion مستخدم فقط لانزلاق الحاوية والـ overlay.
- لا توجد عمليات مكثفة أو استدعاءات بيانات داخلية.

بُني خصيصاً لمنصة "سبق الذكية" مع مراعاة بساطة للتوسع لاحقاً.
