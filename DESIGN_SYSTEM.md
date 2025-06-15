# 🎨 نظام التصميم - صحيفة سبق الإلكترونية

## 🎯 نظرة عامة
نظام التصميم الموحد لصحيفة سبق الإلكترونية، يوفر مكونات وأنماط متسقة لجميع أجزاء النظام.

## 🎨 الألوان

### الألوان الأساسية
```css
/* اللون الأساسي - أزرق سبق */
--primary: #007bff;
--primary-hover: #0056b3;
--primary-light: #e7f1ff;
--primary-dark: #004085;

/* الألوان الثانوية */
--secondary: #6c757d;
--secondary-hover: #5a6268;
--secondary-light: #e2e3e5;
--secondary-dark: #383d41;
```

### ألوان الحالات
```css
/* النجاح */
--success: #28a745;
--success-light: #d4edda;
--success-dark: #155724;

/* التحذير */
--warning: #ffc107;
--warning-light: #fff3cd;
--warning-dark: #856404;

/* الخطر */
--danger: #dc3545;
--danger-light: #f8d7da;
--danger-dark: #721c24;

/* المعلومات */
--info: #17a2b8;
--info-light: #d1ecf1;
--info-dark: #0c5460;
```

### ألوان الخلفيات والنصوص
```css
/* الخلفيات */
--bg-primary: #ffffff;
--bg-secondary: #f8f9fa;
--bg-tertiary: #e9ecef;
--bg-dark: #343a40;

/* النصوص */
--text-primary: #212529;
--text-secondary: #6c757d;
--text-muted: #adb5bd;
--text-white: #ffffff;

/* الحدود */
--border-color: #dee2e6;
--border-light: #f1f3f5;
--border-dark: #adb5bd;
```

## 📐 التصميم والمكونات

### 1. البطاقات (Cards)
```css
.smooth-card {
  background: white;
  border-radius: 1rem; /* rounded-2xl */
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.smooth-card:hover {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}
```

### 2. بطاقات الإحصائيات
```css
.stat-card {
  position: relative;
  padding: 1.5rem;
  border-radius: 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--primary);
}
```

### 3. الأزرار
```css
/* الزر الأساسي */
.btn-primary {
  background-color: #007bff;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #0056b3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

/* الزر الثانوي */
.btn-secondary {
  background-color: white;
  color: #374151;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover {
  background-color: #f9fafb;
  border-color: #d1d5db;
}
```

### 4. الجداول
```css
.modern-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.modern-table thead {
  background-color: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
}

.modern-table th {
  padding: 1rem;
  text-align: right;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.modern-table tbody tr {
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s;
}

.modern-table tbody tr:hover {
  background-color: #f9fafb;
}
```

### 5. الشارات (Badges)
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 9999px;
  gap: 0.25rem;
}

.badge-success {
  background-color: #d4edda;
  color: #155724;
}

.badge-warning {
  background-color: #fff3cd;
  color: #856404;
}

.badge-danger {
  background-color: #f8d7da;
  color: #721c24;
}

.badge-info {
  background-color: #d1ecf1;
  color: #0c5460;
}
```

### 6. حقول الإدخال
```css
.modern-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
  background-color: white;
}

.modern-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}
```

### 7. شريط التمرير المخصص
```css
/* Chrome, Safari */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c4c4c4;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a0a0a0;
}

/* Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: #c4c4c4 #f1f1f1;
}
```

## 🎭 الحركات والانتقالات

### تأثيرات الظهور
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.5s ease-out;
}
```

### تأثيرات التحميل
```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

## 📱 التصميم المتجاوب

### نقاط التوقف
```css
/* Mobile: < 640px */
@media (max-width: 639px) { }

/* Tablet: 640px - 1024px */
@media (min-width: 640px) and (max-width: 1023px) { }

/* Desktop: 1024px - 1280px */
@media (min-width: 1024px) and (max-width: 1279px) { }

/* Large Desktop: > 1280px */
@media (min-width: 1280px) { }
```

## 🧩 مكونات خاصة

### 1. الشريط الجانبي
```css
.sabq-sidebar {
  background-color: #f8f9fa;
  border-left: 1px solid #e9ecef;
}

.sabq-sidebar-item {
  color: #6c757d;
  transition: all 0.2s ease;
}

.sabq-sidebar-item:hover {
  color: #212529;
  background-color: #e9ecef;
}

.sabq-sidebar-item.active {
  color: #007bff;
  background-color: #e7f1ff;
  font-weight: 600;
  border-right: 3px solid #007bff;
}
```

### 2. شريط التنقل العلوي
```css
.sabq-navbar {
  background-color: white;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
```

### 3. بطاقات لوحة التحكم
```css
.console-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 1rem;
  position: relative;
  overflow: hidden;
}

.console-card::after {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  transform: rotate(45deg);
}
```

## 🌙 الوضع الليلي (Dark Mode)

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1a202c;
    --bg-secondary: #2d3748;
    --text-primary: #e2e8f0;
    --text-secondary: #a0aec0;
    --border-color: #4a5568;
  }
  
  .smooth-card {
    background-color: var(--bg-secondary);
    border-color: var(--border-color);
  }
}
```

## 📏 المسافات والأبعاد

### نظام المسافات
```css
/* Spacing Scale */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

### أقصى عرض للمحتوى
```css
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}
```

## 🔤 الخطوط

### تسلسل الخطوط
```css
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans Arabic', 
               'Cairo', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  direction: rtl;
}
```

### أحجام الخطوط
```css
--text-xs: 0.75rem;   /* 12px */
--text-sm: 0.875rem;  /* 14px */
--text-base: 1rem;    /* 16px */
--text-lg: 1.125rem;  /* 18px */
--text-xl: 1.25rem;   /* 20px */
--text-2xl: 1.5rem;   /* 24px */
--text-3xl: 1.875rem; /* 30px */
--text-4xl: 2.25rem;  /* 36px */
```

---

📅 آخر تحديث: ديسمبر 2024
🏢 صحيفة سبق الإلكترونية 