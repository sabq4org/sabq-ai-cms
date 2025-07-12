#!/usr/bin/env node

/**
 * سكريبت فحص صحة المشروع
 * الاستخدام: node scripts/health-check.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🏥 فحص صحة مشروع سبق AI CMS...\n');

const checks = [];

// 1. فحص الملفات الأساسية
console.log('📁 فحص الملفات الأساسية...');
const requiredFiles = [
  'package.json',
  'next.config.js',
  'tsconfig.json',
  '.env.example',
  'prisma/schema.prisma'
];

requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  checks.push({
    name: `وجود ${file}`,
    status: exists ? '✅' : '❌',
    message: exists ? 'موجود' : 'مفقود!'
  });
});

// 2. فحص المتغيرات البيئية
console.log('\n🔐 فحص المتغيرات البيئية...');
if (fs.existsSync('.env') || fs.existsSync('.env.local')) {
  checks.push({
    name: 'ملف البيئة',
    status: '✅',
    message: 'موجود'
  });
} else {
  checks.push({
    name: 'ملف البيئة',
    status: '⚠️',
    message: 'يجب إنشاء .env أو .env.local'
  });
}

// 3. فحص الحزم
console.log('\n📦 فحص الحزم...');
try {
  execSync('npm list --depth=0', { stdio: 'ignore' });
  checks.push({
    name: 'تثبيت الحزم',
    status: '✅',
    message: 'جميع الحزم مثبتة'
  });
} catch {
  checks.push({
    name: 'تثبيت الحزم',
    status: '❌',
    message: 'يجب تشغيل npm install'
  });
}

// 4. فحص TypeScript
console.log('\n📘 فحص TypeScript...');
try {
  execSync('npx tsc --noEmit', { stdio: 'ignore' });
  checks.push({
    name: 'أخطاء TypeScript',
    status: '✅',
    message: 'لا توجد أخطاء'
  });
} catch {
  checks.push({
    name: 'أخطاء TypeScript',
    status: '⚠️',
    message: 'توجد أخطاء TypeScript'
  });
}

// 5. فحص الملفات المؤقتة
console.log('\n🗑️ فحص الملفات المؤقتة...');
const tempPatterns = ['*.backup', '*.old', '*.tmp', 'test-*'];
let tempFiles = 0;
tempPatterns.forEach(pattern => {
  try {
    const files = execSync(`find . -name "${pattern}" | grep -v node_modules | wc -l`, { encoding: 'utf8' });
    tempFiles += parseInt(files.trim());
  } catch {}
});

checks.push({
  name: 'الملفات المؤقتة',
  status: tempFiles > 10 ? '⚠️' : '✅',
  message: `${tempFiles} ملف مؤقت`
});

// 6. فحص حجم المشروع
console.log('\n💾 فحص حجم المشروع...');
try {
  const size = execSync('du -sh . | cut -f1', { encoding: 'utf8' }).trim();
  checks.push({
    name: 'حجم المشروع',
    status: '📊',
    message: size
  });
} catch {}

// عرض النتائج
console.log('\n' + '='.repeat(50));
console.log('📊 نتائج الفحص:\n');

checks.forEach(check => {
  console.log(`${check.status} ${check.name}: ${check.message}`);
});

// الملخص
const errors = checks.filter(c => c.status === '❌').length;
const warnings = checks.filter(c => c.status === '⚠️').length;

console.log('\n' + '='.repeat(50));
console.log('📈 الملخص:');
console.log(`- الأخطاء: ${errors}`);
console.log(`- التحذيرات: ${warnings}`);
console.log(`- النجاحات: ${checks.filter(c => c.status === '✅').length}`);

if (errors === 0 && warnings === 0) {
  console.log('\n✨ المشروع في حالة ممتازة!');
} else if (errors === 0) {
  console.log('\n⚠️ المشروع يعمل لكن يحتاج بعض التحسينات');
} else {
  console.log('\n❌ المشروع يحتاج إصلاحات عاجلة!');
} 