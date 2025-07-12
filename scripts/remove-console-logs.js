#!/usr/bin/env node

/**
 * سكريبت إزالة console.log من ملفات الإنتاج
 * الاستخدام: node scripts/remove-console-logs.js
 */

const fs = require('fs');
const path = require('path');

const DIRECTORIES_TO_PROCESS = ['./app', './components', './lib'];
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const EXCLUDE_DIRS = ['node_modules', '.next', 'scripts'];

let totalRemoved = 0;
let filesProcessed = 0;

function removeConsoleLogs(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalLength = content.length;
    
    // إزالة console.log مع الحفاظ على البنية
    content = content.replace(/console\.log\([^)]*\);?/g, '');
    content = content.replace(/console\.error\([^)]*\);?/g, '');
    content = content.replace(/console\.warn\([^)]*\);?/g, '');
    content = content.replace(/console\.debug\([^)]*\);?/g, '');
    
    if (content.length !== originalLength) {
      fs.writeFileSync(filePath, content);
      const removed = originalLength - content.length;
      totalRemoved += removed;
      filesProcessed++;
      console.log(`✅ معالج: ${filePath} (حذف ${removed} حرف)`);
    }
  } catch (error) {
    console.error(`❌ خطأ في معالجة ${filePath}:`, error.message);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(file)) {
        processDirectory(fullPath);
      }
    } else if (EXTENSIONS.includes(path.extname(file))) {
      removeConsoleLogs(fullPath);
    }
  });
}

console.log('🧹 بدء إزالة console.log من الملفات...\n');

DIRECTORIES_TO_PROCESS.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`📁 معالجة المجلد: ${dir}`);
    processDirectory(dir);
  }
});

console.log('\n📊 ملخص التنظيف:');
console.log(`- الملفات المعالجة: ${filesProcessed}`);
console.log(`- الأحرف المحذوفة: ${totalRemoved}`);
console.log('\n✨ اكتمل التنظيف!'); 