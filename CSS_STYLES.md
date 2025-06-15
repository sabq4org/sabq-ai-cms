# 🎨 أكواد CSS المستخدمة - صحيفة سبق

## الأكواد الأساسية في globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
    
    /* Sabq Custom Colors */
    --primary: #007bff;
    --primary-hover: #0056b3;
    --primary-light: #e7f1ff;
    --primary-dark: #004085;
  }
}

@layer components {
  /* بطاقات ناعمة */
  .smooth-card {
    @apply bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300;
  }

  /* بطاقات الإحصائيات */
  .stat-card {
    @apply relative p-6 rounded-2xl bg-white border border-gray-100 overflow-hidden;
  }
  
  .stat-card::before {
    content: '';
    @apply absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary-dark;
  }

  /* الأزرار */
  .btn-primary {
    @apply bg-primary text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-primary-hover hover:shadow-lg hover:-translate-y-0.5;
  }

  .btn-secondary {
    @apply bg-white text-gray-700 px-4 py-2 rounded-lg font-medium border border-gray-200 transition-all duration-200 hover:bg-gray-50 hover:border-gray-300;
  }

  /* الجداول الحديثة */
  .modern-table {
    @apply w-full bg-white rounded-xl shadow-sm overflow-hidden;
  }

  .modern-table thead {
    @apply bg-gray-50/80 backdrop-blur-sm;
  }

  .modern-table th {
    @apply px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider;
  }

  .modern-table tbody tr {
    @apply border-b border-gray-100 hover:bg-gray-50/50 transition-colors;
  }

  .modern-table td {
    @apply px-6 py-4 text-sm text-gray-900;
  }

  /* الشارات */
  .badge {
    @apply inline-flex items-center px-3 py-1 text-xs font-medium rounded-full gap-1;
  }

  .badge-success {
    @apply bg-green-100 text-green-800;
  }

  .badge-warning {
    @apply bg-yellow-100 text-yellow-800;
  }

  .badge-danger {
    @apply bg-red-100 text-red-800;
  }

  .badge-info {
    @apply bg-blue-100 text-blue-800;
  }

  /* حقول الإدخال */
  .modern-input {
    @apply w-full px-4 py-3 border border-gray-200 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20;
  }

  /* الشريط الجانبي */
  .sabq-sidebar {
    @apply bg-gray-50/50 backdrop-blur-sm border-l border-gray-100;
  }

  .sabq-sidebar-item {
    @apply text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200;
  }

  .sabq-sidebar-item.active {
    @apply text-primary bg-primary-light font-semibold border-r-4 border-primary;
  }

  /* شريط التنقل */
  .sabq-navbar {
    @apply bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm;
  }

  /* بطاقات لوحة التحكم */
  .console-card {
    @apply bg-gradient-to-br from-purple-500 to-purple-700 text-white p-6 rounded-2xl relative overflow-hidden;
  }

  .console-card::after {
    content: '';
    @apply absolute -top-1/2 -right-1/2 w-full h-full bg-white/10 rounded-full blur-3xl;
  }
}

@layer utilities {
  /* حركات مخصصة */
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

  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out;
  }

  /* نبضة للتحميل */
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  /* تدوير للتحميل */
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }

  /* شريط التمرير المخصص */
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    @apply bg-gray-100 rounded-full;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-gray-400 rounded-full hover:bg-gray-500;
  }

  /* Firefox */
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #9ca3af #f3f4f6;
  }
}

/* أنماط خاصة بالعربية */
body {
  direction: rtl;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans Arabic', 'Cairo', sans-serif;
}

/* ظلال ناعمة */
.soft-shadow {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
}

.soft-shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
}

/* خلفيات متدرجة */
.gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.gradient-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.gradient-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.gradient-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

/* تأثيرات hover متقدمة */
.hover-lift {
  transition: all 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

/* زجاج مموه */
.glass {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* الوضع الليلي */
@media (prefers-color-scheme: dark) {
  :root {
    --background: 224 71.4% 4.1%;
    --foreground: 210 20% 98%;
    --primary: #3b82f6;
    --primary-hover: #2563eb;
  }

  .smooth-card {
    @apply bg-gray-800 border-gray-700;
  }

  .modern-table {
    @apply bg-gray-800;
  }

  .modern-table thead {
    @apply bg-gray-900/50;
  }

  .modern-table tbody tr {
    @apply border-gray-700 hover:bg-gray-700/50;
  }
}

/* تحسينات الطباعة */
.prose-ar {
  line-height: 1.8;
  font-size: 1.0625rem;
}

.prose-ar h1,
.prose-ar h2,
.prose-ar h3 {
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.prose-ar p {
  margin-bottom: 1.25rem;
}

/* أنماط خاصة بلوحة التحكم */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* تأثيرات التركيز */
*:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
  border-radius: 4px;
}

/* منع تحديد النص في الأزرار */
button {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* تحسين أداء الحركات */
* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* تخصيص رسائل الخطأ */
.error-message {
  @apply text-red-600 text-sm mt-1 flex items-center gap-1;
}

.success-message {
  @apply text-green-600 text-sm mt-1 flex items-center gap-1;
}

/* شريط التقدم */
.progress-bar {
  @apply h-2 bg-gray-200 rounded-full overflow-hidden;
}

.progress-bar-fill {
  @apply h-full bg-primary transition-all duration-300 ease-out;
}

/* تأثير التموج عند النقر */
.ripple {
  position: relative;
  overflow: hidden;
}

.ripple::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.ripple:active::before {
  width: 300px;
  height: 300px;
}
```

---

📅 آخر تحديث: ديسمبر 2024
🏢 صحيفة سبق الإلكترونية 