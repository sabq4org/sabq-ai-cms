#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 مسح ملفات الكاش والبناء...');

// المجلدات التي يجب حذفها
const dirsToDelete = [
  '.next',
  '.turbo',
  '.vercel',
  'node_modules/.cache',
  '.cache'
];

dirsToDelete.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    console.log(`❌ حذف: ${dir}`);
    fs.rmSync(fullPath, { recursive: true, force: true });
  }
});

console.log('✅ تم مسح الكاش بنجاح!');
console.log('📦 قم بتشغيل: npm run build');
