# 🎨 دليل تصميم لوحة تحكم صحيفة سبق

## 📘 نظام الألوان الأزرق الخفيف

### نظرة عامة
تم تصميم نظام الألوان خصيصاً لصحيفة سبق باستخدام درجات الأزرق الخفيف التي تعكس الاحترافية والموثوقية، مع توفير تجربة بصرية مريحة للعين خلال ساعات العمل الطويلة.

## 🎯 الألوان الأساسية

### الألوان الرئيسية
| اللون | القيمة | الاستخدام | المعاينة |
|-------|--------|-----------|----------|
| **الأزرق الأساسي** | `#00BFFF` | الأزرار الرئيسية، الروابط | ![#00BFFF](https://via.placeholder.com/60x20/00BFFF/000000?text=+) |
| **الأزرق الفاتح** | `#0EA5E9` | التحويم، التأثيرات | ![#0EA5E9](https://via.placeholder.com/60x20/0EA5E9/000000?text=+) |
| **الأزرق الداكن** | `#0C4A6E` | النصوص، العناوين | ![#0C4A6E](https://via.placeholder.com/60x20/0C4A6E/000000?text=+) |
| **الأزرق المائي** | `#3DD5F3` | العناصر الثانوية | ![#3DD5F3](https://via.placeholder.com/60x20/3DD5F3/000000?text=+) |

### ألوان الخلفيات
| اللون | القيمة | الاستخدام | المعاينة |
|-------|--------|-----------|----------|
| **خلفية أساسية** | `#F0FDFF` | خلفية الصفحة الرئيسية | ![#F0FDFF](https://via.placeholder.com/60x20/F0FDFF/000000?text=+) |
| **خلفية ثانوية** | `#E0F2FE` | الشريط الجانبي، البطاقات | ![#E0F2FE](https://via.placeholder.com/60x20/E0F2FE/000000?text=+) |
| **خلفية بيضاء** | `#FFFFFF` | البطاقات، الجداول | ![#FFFFFF](https://via.placeholder.com/60x20/FFFFFF/000000?text=+) |

## 🌙 الوضع الليلي

في الوضع الليلي، تتحول الألوان لتوفير راحة أكبر للعين:
- الخلفيات تصبح داكنة (`#0F172A`, `#1E293B`)
- الألوان الأساسية تصبح أكثر إشراقاً
- النصوص تتحول للون الفاتح

## 📦 المكونات

### 1. الشريط العلوي (Navbar)
```css
.sabq-navbar {
  background: linear-gradient(to right, #0EA5E9, #00BFFF);
  color: white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
```

### 2. الشريط الجانبي (Sidebar)
```css
.sabq-sidebar {
  background-color: #E0F2FE;
  border-right: 1px solid #CBD5E1;
}

.sabq-sidebar-item:hover {
  background-color: rgba(0, 191, 255, 0.1);
  color: #00BFFF;
}

.sabq-sidebar-item.active {
  background-color: rgba(0, 191, 255, 0.1);
  border-right: 4px solid #00BFFF;
}
```

### 3. البطاقات (Cards)
```css
.sabq-card {
  background-color: #FFFFFF;
  border-radius: 12px;
  border: 1px solid #CBD5E1;
  transition: all 0.3s ease;
}

.sabq-stat-card {
  border-top: 4px solid #00BFFF;
}
```

### 4. الأزرار (Buttons)
```css
/* زر أساسي */
.sabq-btn-primary {
  background: linear-gradient(to right, #0EA5E9, #00BFFF);
  color: white;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.sabq-btn-primary:hover {
  box-shadow: 0 10px 15px -3px rgba(14, 165, 233, 0.3);
  transform: scale(1.05);
}

/* زر ثانوي */
.sabq-btn-secondary {
  background-color: #E0F2FE;
  color: #2A3F5F;
  border: 1px solid #CBD5E1;
}

.sabq-btn-secondary:hover {
  background-color: rgba(0, 191, 255, 0.1);
  border-color: #00BFFF;
}
```

### 5. الجداول (Tables)
```css
.sabq-table {
  background-color: #FFFFFF;
  border-radius: 8px;
  overflow: hidden;
}

.sabq-table-header {
  background-color: #E0F2FE;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.875rem;
}

.sabq-table-row:hover {
  background-color: rgba(0, 191, 255, 0.05);
}
```

### 6. النماذج (Forms)
```css
.sabq-input {
  background-color: #FFFFFF;
  border: 1px solid #CBD5E1;
  border-radius: 8px;
  padding: 10px 16px;
}

.sabq-input:focus {
  outline: none;
  border-color: #00BFFF;
  box-shadow: 0 0 0 3px rgba(0, 191, 255, 0.1);
}
```

## 🏷️ شارات التصنيفات

تستخدم درجات مختلفة من الأزرق للتصنيفات:

| التصنيف | اللون الفاتح | اللون الداكن |
|---------|-------------|--------------|
| سياسة | `bg-blue-100` | `dark:bg-blue-900/30` |
| اقتصاد | `bg-cyan-100` | `dark:bg-cyan-900/30` |
| تقنية | `bg-sky-100` | `dark:bg-sky-900/30` |
| ثقافة | `bg-indigo-100` | `dark:bg-indigo-900/30` |

## ✨ التأثيرات الخاصة

### تأثير الموجة الزرقاء
```css
.sabq-wave-bg {
  background: linear-gradient(135deg, 
    rgba(14, 165, 233, 0.1) 0%,
    rgba(0, 191, 255, 0.05) 50%,
    rgba(61, 213, 243, 0.1) 100%);
}
```

### الظلال الزرقاء
```css
.sabq-shadow-blue {
  box-shadow: 
    0 4px 6px -1px rgba(0, 191, 255, 0.1),
    0 2px 4px -1px rgba(0, 191, 255, 0.06);
}
```

### تأثير التوهج
```css
.sabq-glow {
  box-shadow: 0 0 20px rgba(0, 191, 255, 0.2);
}
```

## 🚀 كيفية الاستخدام

### 1. استيراد ملف CSS
```html
<!-- في ملف HTML الرئيسي -->
<link rel="stylesheet" href="/styles/sabq-theme.css">
```

### 2. في مكونات React
```jsx
// استيراد الأنماط
import '@/styles/sabq-theme.css';

// استخدام الفئات
<button className="sabq-btn-primary">
  مقال جديد
</button>

<div className="sabq-card sabq-shadow-blue">
  محتوى البطاقة
</div>
```

### 3. مع Tailwind CSS
```jsx
// يمكن دمج الفئات مع Tailwind
<div className="sabq-card p-6 hover:sabq-glow">
  <h3 className="text-[hsl(var(--sabq-text-primary))]">
    عنوان البطاقة
  </h3>
</div>
```

## 📱 الاستجابة (Responsive)

النظام مصمم ليكون متجاوباً تماماً:

```css
/* شاشات الموبايل */
@media (max-width: 768px) {
  .sabq-sidebar {
    position: fixed;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .sabq-sidebar.open {
    transform: translateX(0);
  }
}
```

## 🎨 أفضل الممارسات

### 1. التباين
- تأكد من أن التباين بين النص والخلفية لا يقل عن 4.5:1
- استخدم `--sabq-text-primary` للنصوص المهمة
- استخدم `--sabq-text-light` للنصوص الثانوية

### 2. التدرجات
- استخدم التدرجات بحذر وفي العناصر المهمة فقط
- الشريط العلوي والأزرار الرئيسية مناسبة للتدرجات

### 3. الحالات
- استخدم الألوان المخصصة للحالات:
  - `--sabq-success` للنجاح
  - `--sabq-warning` للتحذير
  - `--sabq-error` للأخطاء
  - `--sabq-info` للمعلومات

### 4. الوضع الليلي
- اختبر جميع المكونات في الوضعين النهاري والليلي
- تأكد من أن الألوان تتحول بسلاسة

## 🔧 التخصيص

يمكن تخصيص الألوان بسهولة من خلال تعديل متغيرات CSS:

```css
:root {
  /* تغيير اللون الأساسي */
  --sabq-primary: 200 100% 50%;
  
  /* تغيير ألوان الخلفية */
  --sabq-bg-primary: 204 100% 98%;
}
```

## 📊 مثال متكامل

```jsx
const Dashboard = () => {
  return (
    <div className="min-h-screen bg-[hsl(var(--sabq-bg-primary))]">
      {/* الشريط العلوي */}
      <nav className="sabq-navbar">
        {/* محتوى الشريط */}
      </nav>
      
      <div className="flex">
        {/* الشريط الجانبي */}
        <aside className="sabq-sidebar">
          {/* قائمة التنقل */}
        </aside>
        
        {/* المحتوى الرئيسي */}
        <main className="flex-1 p-6">
          {/* البطاقات الإحصائية */}
          <div className="grid grid-cols-4 gap-6">
            <div className="sabq-stat-card">
              {/* محتوى البطاقة */}
            </div>
          </div>
          
          {/* الجدول */}
          <div className="sabq-table mt-8">
            {/* محتوى الجدول */}
          </div>
        </main>
      </div>
    </div>
  );
};
```

## 🎯 النتيجة

نظام الألوان الأزرق الخفيف لصحيفة سبق يوفر:
- ✅ تجربة بصرية احترافية ومريحة
- ✅ تناسق في جميع أنحاء التطبيق
- ✅ سهولة في الصيانة والتطوير
- ✅ دعم كامل للوضع الليلي
- ✅ إمكانية التخصيص المستقبلي

---

**آخر تحديث**: ديسمبر 2024  
**المسؤول**: فريق التصميم والتطوير 