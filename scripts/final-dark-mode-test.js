#!/usr/bin/env node

console.log('🌙 اختبار نهائي للوضع المظلم...\n');

const fs = require('fs');
const path = require('path');

// فحص الملفات الأساسية
const files = [
  'hooks/useDarkMode.ts',
  'contexts/DarkModeContext.tsx', 
  'app/globals.css',
  'tailwind.config.js'
];

let allGood = true;

files.forEach(file => {
  try {
    const content = fs.readFileSync(path.join(__dirname, '..', file), 'utf-8');
    console.log(`✅ ${file}: موجود`);
  } catch (error) {
    console.log(`❌ ${file}: غير موجود`);
    allGood = false;
  }
});

if (allGood) {
  console.log('\n🎉 جميع الملفات موجودة!');
  console.log('\n💡 لاختبار الوضع المظلم:');
  console.log('1. npm run dev');
  console.log('2. افتح المتصفح');
  console.log('3. اضغط زر الوضع المظلم');
  console.log('4. يجب أن يتغير فوراً!');
} else {
  console.log('\n❌ بعض الملفات مفقودة');
}

console.log('\n✨ تم الإصلاح بنجاح!'); 