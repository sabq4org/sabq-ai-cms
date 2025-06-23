#!/usr/bin/env node

/**
 * سكريبت اختبار وإصلاح مشكلة التبديل الفوري للوضع المظلم
 * يقوم بفحص جميع المكونات والتأكد من عمل التبديل بشكل صحيح
 */

const fs = require('fs');
const path = require('path');

console.log('🌙 اختبار نظام الوضع المظلم...\n');

const checks = [];

// 1. فحص تكوين Tailwind
console.log('1️⃣ فحص تكوين Tailwind CSS...');
try {
  const tailwindConfig = fs.readFileSync(path.join(__dirname, '..', 'tailwind.config.js'), 'utf-8');
  if (tailwindConfig.includes('darkMode: \'class\'')) {
    checks.push({ name: 'تكوين Tailwind', status: '✅', details: 'darkMode: class مُفعل' });
  } else {
    checks.push({ name: 'تكوين Tailwind', status: '❌', details: 'darkMode غير مُفعل بشكل صحيح' });
  }
} catch (error) {
  checks.push({ name: 'تكوين Tailwind', status: '❌', details: 'خطأ في قراءة الملف' });
}

// 2. فحص hook الوضع المظلم
console.log('2️⃣ فحص useDarkMode hook...');
try {
  const hookFile = fs.readFileSync(path.join(__dirname, '..', 'hooks', 'useDarkMode.ts'), 'utf-8');
  if (hookFile.includes('updateDarkMode') && hookFile.includes('toggleDarkMode')) {
    checks.push({ name: 'useDarkMode hook', status: '✅', details: 'جميع الدوال موجودة' });
  } else {
    checks.push({ name: 'useDarkMode hook', status: '❌', details: 'دوال مفقودة' });
  }
} catch (error) {
  checks.push({ name: 'useDarkMode hook', status: '❌', details: 'ملف غير موجود' });
}

// 3. فحص DarkModeProvider
console.log('3️⃣ فحص DarkModeProvider...');
try {
  const providerFile = fs.readFileSync(path.join(__dirname, '..', 'contexts', 'DarkModeContext.tsx'), 'utf-8');
  if (providerFile.includes('DarkModeProvider') && providerFile.includes('useDarkMode')) {
    checks.push({ name: 'DarkModeProvider', status: '✅', details: 'Provider مُعد بشكل صحيح' });
  } else {
    checks.push({ name: 'DarkModeProvider', status: '❌', details: 'إعداد غير صحيح' });
  }
} catch (error) {
  checks.push({ name: 'DarkModeProvider', status: '❌', details: 'ملف غير موجود' });
}

// 4. فحص Layout الرئيسي
console.log('4️⃣ فحص Layout الرئيسي...');
try {
  const layoutFile = fs.readFileSync(path.join(__dirname, '..', 'app', 'layout.tsx'), 'utf-8');
  if (layoutFile.includes('DarkModeProvider') && layoutFile.includes('dark:bg-gray-900')) {
    checks.push({ name: 'Layout الرئيسي', status: '✅', details: 'DarkModeProvider مُضمن' });
  } else {
    checks.push({ name: 'Layout الرئيسي', status: '❌', details: 'DarkModeProvider غير مُضمن' });
  }
} catch (error) {
  checks.push({ name: 'Layout الرئيسي', status: '❌', details: 'خطأ في قراءة الملف' });
}

// 5. فحص CSS للانتقالات
console.log('5️⃣ فحص CSS للانتقالات...');
try {
  const cssFile = fs.readFileSync(path.join(__dirname, '..', 'app', 'globals.css'), 'utf-8');
  if (cssFile.includes('Enhanced dark mode transitions') && cssFile.includes('html.dark')) {
    checks.push({ name: 'CSS الانتقالات', status: '✅', details: 'انتقالات محسنة موجودة' });
  } else {
    checks.push({ name: 'CSS الانتقالات', status: '❌', details: 'انتقالات غير موجودة' });
  }
} catch (error) {
  checks.push({ name: 'CSS الانتقالات', status: '❌', details: 'خطأ في قراءة الملف' });
}

// عرض النتائج
console.log('\n📊 نتائج الفحص:');
console.log('================');
checks.forEach((check, index) => {
  console.log(`${index + 1}. ${check.name}: ${check.status} - ${check.details}`);
});

const passedChecks = checks.filter(check => check.status === '✅').length;
const totalChecks = checks.length;

console.log(`\n🏆 النتيجة النهائية: ${passedChecks}/${totalChecks} فحوصات نجحت`);

if (passedChecks === totalChecks) {
  console.log('\n✅ نظام الوضع المظلم مُعد بشكل صحيح!');
  console.log('\n💡 نصائح للاختبار:');
  console.log('1. تأكد من تشغيل الخادم: npm run dev');
  console.log('2. افتح المتصفح واضغط على زر الوضع المظلم');
  console.log('3. يجب أن يتغير الوضع فوراً دون الحاجة لتحديث الصفحة');
  console.log('4. تحقق من حفظ التفضيل في localStorage');
} else {
  console.log('\n❌ يوجد مشاكل في إعداد الوضع المظلم');
  console.log('\n🔧 خطوات الإصلاح:');
  
  checks.forEach(check => {
    if (check.status === '❌') {
      console.log(`- إصلاح: ${check.name} - ${check.details}`);
    }
  });
}

console.log('\n🔍 تشخيص إضافي:');
console.log('================');

// فحص ملفات المكونات الرئيسية
const componentsToCheck = [
  'components/DarkModeToggle.tsx',
  'components/Header.tsx',
  'app/dashboard/layout.tsx'
];

componentsToCheck.forEach(componentPath => {
  try {
    const componentFile = fs.readFileSync(path.join(__dirname, '..', componentPath), 'utf-8');
    if (componentFile.includes('useDarkMode') || componentFile.includes('DarkModeToggle')) {
      console.log(`✅ ${componentPath}: يستخدم نظام الوضع المظلم`);
    } else {
      console.log(`⚠️  ${componentPath}: لا يستخدم نظام الوضع المظلم`);
    }
  } catch (error) {
    console.log(`❌ ${componentPath}: ملف غير موجود`);
  }
});

console.log('\n🎯 خطوات التحقق اليدوي:');
console.log('========================');
console.log('1. افتح أدوات المطور في المتصفح (F12)');
console.log('2. انتقل إلى تبويب Console');
console.log('3. اضغط على زر الوضع المظلم');
console.log('4. تحقق من ظهور رسائل console.log');
console.log('5. تحقق من إضافة/إزالة class "dark" في <html>');
console.log('6. تحقق من تحديث localStorage بالقيمة الجديدة');

console.log('\n📝 كود اختبار JavaScript (للمتصفح):');
console.log('======================================');
console.log(`
// تشغيل هذا الكود في console المتصفح
console.log('🔍 فحص حالة الوضع المظلم:');
console.log('HTML has dark class:', document.documentElement.classList.contains('dark'));
console.log('localStorage darkMode:', localStorage.getItem('darkMode'));
console.log('Color scheme:', document.documentElement.style.colorScheme);

// اختبار التبديل
console.log('\\n🧪 اختبار التبديل:');
const isDark = document.documentElement.classList.contains('dark');
document.documentElement.classList.toggle('dark');
console.log('After toggle - dark class:', document.documentElement.classList.contains('dark'));
`); 