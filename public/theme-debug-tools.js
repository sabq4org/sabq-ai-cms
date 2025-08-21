// 🧪 اختبار سريع لإعادة ضبط نظام الألوان
// يمكن تشغيل هذا في Console للتشخيص

// إعادة ضبط الثيم للافتراضي (الأزرق)
function resetThemeToDefault() {
  localStorage.setItem('theme-color', 'blue');
  localStorage.removeItem('theme-color-backup');
  location.reload();
  console.log('✅ Theme reset to default (blue)');
}

// مسح كامل لجميع بيانات الثيم
function clearAllThemeData() {
  localStorage.removeItem('theme-color');
  localStorage.removeItem('theme-color-backup');
  localStorage.removeItem('theme-settings');
  
  // إزالة CSS variables
  const root = document.documentElement;
  root.removeAttribute('data-theme');
  root.style.removeProperty('--theme-primary');
  root.style.removeProperty('--theme-primary-rgb');
  root.style.removeProperty('--accent');
  
  location.reload();
  console.log('🧹 All theme data cleared');
}

// فحص حالة الثيم الحالية
function debugCurrentTheme() {
  console.log('🔍 Theme Debug Info:');
  console.log('localStorage theme-color:', localStorage.getItem('theme-color'));
  console.log('CSS --theme-primary:', getComputedStyle(document.documentElement).getPropertyValue('--theme-primary'));
  console.log('CSS --accent:', getComputedStyle(document.documentElement).getPropertyValue('--accent'));
  console.log('data-theme attribute:', document.documentElement.getAttribute('data-theme'));
}

// تشغيل automatic
console.log('🎨 Theme Debug Tools Loaded');
console.log('Available functions:');
console.log('- resetThemeToDefault()');
console.log('- clearAllThemeData()');
console.log('- debugCurrentTheme()');

// فحص فوري للحالة
debugCurrentTheme();
