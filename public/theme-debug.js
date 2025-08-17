// 🔧 سكريبت تشخيص نظام الثيم
// قم بتشغيل هذا الكود في Console المتصفح لتشخيص مشاكل الثيم

console.log('🔍 بدء تشخيص نظام الثيم...');

// 1. فحص الإعدادات المحفوظة
const savedSettings = localStorage.getItem('theme-manager-settings');
console.log('💾 الإعدادات المحفوظة:', savedSettings ? JSON.parse(savedSettings) : 'لا توجد');

// 2. فحص متغيرات CSS الحالية
const root = document.documentElement;
const currentVars = {};
['primary', 'secondary', 'accent', 'background', 'surface', 'text', 'border'].forEach(key => {
  currentVars[key] = getComputedStyle(root).getPropertyValue(`--theme-${key}`);
});
console.log('🎨 متغيرات CSS الحالية:', currentVars);

// 3. فحص كلاسات الثيم
const themeClasses = ['theme-emerald', 'theme-purple', 'theme-rose', 'theme-orange'];
const activeThemes = themeClasses.filter(cls => root.classList.contains(cls));
console.log('🏷️ كلاسات الثيم النشطة:', activeThemes);

// 4. فحص الوضع الليلي/النهاري
const isDark = root.classList.contains('dark');
console.log('🌙 الوضع الحالي:', isDark ? 'ليلي' : 'نهاري');

// 5. اختبار تطبيق الثيم الأخضر يدوياً
function testEmeraldTheme() {
  console.log('🧪 اختبار تطبيق الثيم الأخضر...');
  
  // إزالة جميع كلاسات الثيم
  root.classList.remove('theme-sabq', 'theme-emerald', 'theme-purple', 'theme-rose', 'theme-orange');
  
  // تطبيق ألوان الثيم الأخضر
  const emeraldColors = {
    primary: '#059669',
    secondary: '#10b981',
    accent: '#34d399',
    background: '#ffffff',
    surface: '#f0fdf4',
    text: '#064e3b',
    border: '#d1fae5'
  };
  
  Object.entries(emeraldColors).forEach(([key, value]) => {
    root.style.setProperty(`--theme-${key}`, value);
    console.log(`✅ تم تطبيق: --theme-${key} = ${value}`);
  });
  
  // إضافة كلاس الثيم
  root.classList.add('theme-emerald');
  console.log('✅ تم إضافة كلاس: theme-emerald');
  
  // إجبار إعادة تطبيق
  setTimeout(() => {
    document.body.style.display = 'none';
    document.body.offsetHeight;
    document.body.style.display = '';
    console.log('✨ تم إجبار إعادة التطبيق');
  }, 100);
}

// 6. عرض النتائج
console.log('\n📊 ملخص التشخيص:');
console.log('==================');
console.log('الإعدادات محفوظة:', !!savedSettings);
console.log('متغيرات CSS مطبقة:', Object.keys(currentVars).length > 0);
console.log('كلاسات نشطة:', activeThemes.length);
console.log('الوضع:', isDark ? 'ليلي' : 'نهاري');

console.log('\n🔧 للاختبار اليدوي، قم بتشغيل:');
console.log('testEmeraldTheme()');

// إتاحة الدالة عالمياً
window.testEmeraldTheme = testEmeraldTheme;

console.log('✅ تم الانتهاء من التشخيص');
