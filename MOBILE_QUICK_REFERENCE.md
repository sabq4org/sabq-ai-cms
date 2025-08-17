# 📱 مرجع سريع - النظام المحمول

## 🚀 بدء التشغيل السريع

```bash
# تشغيل الخادم
npm run dev

# زيارة النظام المحمول
http://localhost:3000/mobile/dashboard
```

## 📋 الصفحات المتاحة

| الرابط | الوصف | الميزات |
|--------|-------|---------|
| `/mobile/dashboard` | لوحة التحكم الرئيسية | إحصائيات، نشاط حديث، تنقل سريع |
| `/mobile/articles` | إدارة المقالات | بحث، فلترة، إضافة، تحرير |
| `/mobile/editor` | محرر المقالات | تحرير نص، معاينة، إعدادات |
| `/mobile/settings` | إعدادات التطبيق | مظهر، تفاعل، أداء، أمان |

## 🎯 المكونات الأساسية

### أزرار محسنة للمس
```tsx
import { MobileButton } from '@/components/mobile/MobileComponents';

<MobileButton variant="primary" size="lg">
  إجراء مهم
</MobileButton>
```

### بطاقات المحتوى
```tsx
import { MobileArticleCard } from '@/components/mobile/MobileComponents';

<MobileArticleCard
  title="عنوان المقال"
  excerpt="نص مختصر..."
  author="الكاتب"
  date="2024-01-15"
  status="published"
/>
```

### شريط البحث
```tsx
import { MobileSearchBar } from '@/components/mobile/MobileComponents';

<MobileSearchBar
  placeholder="البحث عن مقالات..."
  onSearch={handleSearch}
  value={searchQuery}
  onChange={setSearchQuery}
/>
```

## 🔧 الهوكس المتاحة

### اكتشاف الجهاز
```tsx
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

const { deviceType, isMobile, isTablet, isDesktop } = useDeviceDetection();
```

### إعدادات الهاتف
```tsx
import { useMobileSettings, useMobileTheme, useHapticFeedback } from '@/lib/mobile-settings';

const { settings, updateSetting } = useMobileSettings();
const { isDark, toggleTheme } = useMobileTheme();
const { triggerHaptic } = useHapticFeedback();
```

## 🎨 فئات CSS المهمة

### للحاويات
```css
.device-mobile          /* الحاوي الرئيسي */
.mobile-header          /* الشريط العلوي */
.mobile-bottom-nav      /* التنقل السفلي */
.mobile-card            /* البطاقات */
```

### للعناصر التفاعلية
```css
.mobile-button          /* الأزرار */
.mobile-input           /* حقول الإدخال */
.mobile-search          /* شريط البحث */
.mobile-list-item       /* عناصر القائمة */
```

### للشبكة والتخطيط
```css
.mobile-grid-2          /* شبكة عمودين */
.mobile-grid-3          /* شبكة ثلاثة أعمدة */
.mobile-grid-4          /* شبكة أربعة أعمدة */
```

## ⚡ أمثلة سريعة

### صفحة بسيطة
```tsx
'use client';

import React from 'react';
import { MobileButton } from '@/components/mobile/MobileComponents';
import Link from 'next/link';

export default function MyMobilePage() {
  return (
    <div className="device-mobile min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* الشريط العلوي */}
      <div className="mobile-header">
        <h1 className="text-xl font-bold">صفحتي</h1>
      </div>

      {/* المحتوى */}
      <div className="p-4">
        <div className="mobile-card p-4">
          <h2 className="text-lg font-semibold mb-3">مرحباً</h2>
          <p className="text-gray-600 mb-4">هذا محتوى الصفحة</p>
          
          <div className="mobile-grid-2 gap-3">
            <MobileButton variant="primary">
              إجراء أول
            </MobileButton>
            <MobileButton variant="secondary">
              إجراء ثاني
            </MobileButton>
          </div>
        </div>
      </div>

      {/* التنقل السفلي */}
      <div className="mobile-bottom-nav">
        <div className="grid grid-cols-3 p-2">
          <Link href="/mobile/dashboard" className="mobile-nav-item">
            الرئيسية
          </Link>
          <Link href="/mobile/articles" className="mobile-nav-item">
            المقالات
          </Link>
          <Link href="/mobile/settings" className="mobile-nav-item">
            الإعدادات
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### إضافة اهتزاز لمسي
```tsx
import { useHapticFeedback } from '@/lib/mobile-settings';

function MyButton() {
  const { triggerHaptic } = useHapticFeedback();

  const handleClick = () => {
    triggerHaptic('medium'); // light, medium, heavy
    // باقي المنطق...
  };

  return (
    <MobileButton onClick={handleClick}>
      اضغط هنا
    </MobileButton>
  );
}
```

### تغيير المظهر
```tsx
import { useMobileTheme } from '@/lib/mobile-settings';

function ThemeToggle() {
  const { isDark, toggleTheme, setTheme } = useMobileTheme();

  return (
    <div className="mobile-grid-3 gap-2">
      <MobileButton 
        variant={isDark ? "secondary" : "primary"}
        onClick={() => setTheme('light')}
      >
        فاتح
      </MobileButton>
      <MobileButton 
        variant="secondary"
        onClick={() => setTheme('auto')}
      >
        تلقائي
      </MobileButton>
      <MobileButton 
        variant={isDark ? "primary" : "secondary"}
        onClick={() => setTheme('dark')}
      >
        داكن
      </MobileButton>
    </div>
  );
}
```

## 🔍 نصائح للتطوير

### 1. اختبار على أجهزة حقيقية
- استخدم أدوات المطور في Chrome
- فعل وضع الجهاز المحمول
- جرب أحجام شاشات مختلفة

### 2. تحسين الأداء
- استخدم `lazy loading` للصور
- قلل من استعلامات الـ API
- استخدم `useCallback` و `useMemo`

### 3. إمكانية الوصول
- تأكد من حجم الأزرار (44px+)
- استخدم تباين ألوان كافي
- أضف `aria-labels` للعناصر

### 4. تجربة المستخدم
- اجعل التحميل سريع
- قدم ردود فعل فورية
- استخدم الرسوم المتحركة بحكمة

## 📞 الدعم

- **الوثائق الكاملة**: `MOBILE_SYSTEM_README.md`
- **فحص النظام**: `./check-mobile-system.sh`
- **أمثلة الكود**: في مجلد `/mobile/`

---
*آخر تحديث: 2024* ✨
