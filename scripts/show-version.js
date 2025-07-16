#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// قراءة النسخة من package.json
const packagePath = path.join(__dirname, '..', 'package.json');
const package = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

console.log('======================================');
console.log(`🏷️  اسم المشروع: ${package.name}`);
console.log(`📱 رقم النسخة: ${package.version}`);
console.log(`🚀 البيئة: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔧 Node.js: ${process.version}`);
console.log(`📅 التاريخ: ${new Date().toISOString()}`);
console.log('======================================');

// إضافة النسخة كمتغير بيئي
process.env.APP_VERSION = package.version;

// كتابة النسخة إلى ملف إذا كان في بيئة البناء
if (process.env.DO_BUILD || process.env.DIGITALOCEAN_APP_ID) {
  const versionFile = path.join(__dirname, '..', '.version');
  fs.writeFileSync(versionFile, package.version);
  console.log(`✅ تم كتابة النسخة إلى ملف .version`);
} 