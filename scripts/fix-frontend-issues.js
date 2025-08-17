#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 إصلاح مشاكل الواجهة الأمامية...\n');

// 1. إيقاف جميع عمليات Next.js
console.log('1️⃣ إيقاف الخادم...');
try {
  execSync('pkill -f "next start" || true', { stdio: 'inherit' });
  execSync('pkill -f "node.*next" || true', { stdio: 'inherit' });
} catch (e) {
  // تجاهل الأخطاء
}

// 2. تنظيف الكاش
console.log('\n2️⃣ تنظيف الكاش...');
const dirsToClean = ['.next', 'node_modules/.cache'];
dirsToClean.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`   حذف ${dir}...`);
    execSync(`rm -rf ${dir}`, { stdio: 'inherit' });
  }
});

// 3. التحقق من الملفات المهمة
console.log('\n3️⃣ فحص الملفات المهمة...');
const requiredFiles = [
  'middleware.ts',
  'next.config.js',
  'app/layout.tsx',
  'app/page.tsx',
  'app/page-client.tsx'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - مفقود!`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.error('\n❌ بعض الملفات المهمة مفقودة!');
  process.exit(1);
}

// 4. بناء المشروع
console.log('\n4️⃣ بناء المشروع...');
execSync('npm run build:production', { stdio: 'inherit' });

// 5. التحقق من نجاح البناء
console.log('\n5️⃣ التحقق من البناء...');
if (!fs.existsSync('.next')) {
  console.error('❌ فشل البناء - مجلد .next غير موجود!');
  process.exit(1);
}

const chunksDir = '.next/static/chunks';
if (fs.existsSync(chunksDir)) {
  const chunks = fs.readdirSync(chunksDir);
  console.log(`   ✅ تم العثور على ${chunks.length} chunk files`);
} else {
  console.error('❌ مجلد chunks غير موجود!');
  process.exit(1);
}

// 6. تشغيل الخادم
console.log('\n6️⃣ تشغيل الخادم...');
console.log('   🌐 http://localhost:3000\n');

// استخدام spawn بدلاً من execSync لإبقاء الخادم يعمل
const { spawn } = require('child_process');
const server = spawn('npm', ['run', 'start:safe'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: '3000' }
});

server.on('error', (err) => {
  console.error('❌ خطأ في تشغيل الخادم:', err);
});

// معالجة إيقاف السكريبت
process.on('SIGINT', () => {
  console.log('\n\n👋 إيقاف الخادم...');
  server.kill();
  process.exit(0);
}); 