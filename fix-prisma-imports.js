#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// البحث عن جميع ملفات API التي تحتوي على استيراد خاطئ لـ prisma
const findFiles = () => {
  try {
    const result = execSync(`grep -r "import.*{.*prisma.*}.*from.*@/lib/prisma" app/api --include="*.ts"`, { encoding: 'utf8' });
    return result.split('\n').filter(line => line.trim()).map(line => line.split(':')[0]);
  } catch (error) {
    console.log('لا توجد ملفات أخرى تحتاج إصلاح');
    return [];
  }
};

// إصلاح الاستيراد في ملف واحد
const fixFile = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // إصلاح استيراد prisma مع دوال أخرى
    let newContent = content.replace(
      /import\s*{\s*prisma\s*,\s*([^}]+)\s*}\s*from\s*'@\/lib\/prisma';?/g,
      "import prisma, { $1 } from '@/lib/prisma';"
    );
    
    // إصلاح استيراد prisma فقط
    newContent = newContent.replace(
      /import\s*{\s*prisma\s*}\s*from\s*'@\/lib\/prisma';?/g,
      "import prisma from '@/lib/prisma';"
    );
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent);
      console.log(`✅ تم إصلاح: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ خطأ في إصلاح ${filePath}:`, error.message);
    return false;
  }
};

// تشغيل السكريبت
console.log('🔧 بدء إصلاح استيرادات Prisma...');

const files = findFiles();
if (files.length === 0) {
  console.log('✅ جميع الملفات محدثة بالفعل');
  process.exit(0);
}

console.log(`📁 تم العثور على ${files.length} ملف يحتاج إصلاح`);

let fixed = 0;
files.forEach(file => {
  if (fixFile(file)) {
    fixed++;
  }
});

console.log(`🎉 تم إصلاح ${fixed} ملف من أصل ${files.length}`);
