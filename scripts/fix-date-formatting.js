#!/usr/bin/env node

/**
 * سكريبت لإصلاح جميع استخدامات toLocaleDateString في المشروع
 * يقوم بتحديث الكود لاستخدام دوال التنسيق الثابتة من lib/date-utils
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 بدء إصلاح تنسيق التواريخ...\n');

// الملفات التي تحتاج لإصلاح
const filesToFix = [
  // Smart blocks
  'components/smart-blocks/CarouselBlock.tsx',
  'components/smart-blocks/ImageLeftBlock.tsx',
  'components/smart-blocks/HeadlineListBlock.tsx',
  'components/smart-blocks/CardGridBlock.tsx',
  
  // Mobile components
  'components/mobile/EnhancedMobileNewsCard.tsx',
  'components/mobile/MobileCard.tsx',
  
  // Other components
  'components/PersonalizedFeed.tsx',
  'components/deep-analysis/DeepAnalysisCard.tsx',
  'components/layout/DynamicHeader.tsx',
  'components/layout/StaticHeader.tsx'
];

// دالة لقراءة ملف
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.log(`⚠️  تعذر قراءة الملف: ${filePath}`);
    return null;
  }
}

// دالة لكتابة ملف
function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.log(`❌ تعذرت كتابة الملف: ${filePath}`);
    return false;
  }
}

// دالة لإصلاح محتوى الملف
function fixFileContent(content, filePath) {
  let modified = false;
  let newContent = content;
  
  // التحقق من وجود import للدالة
  if (!content.includes("import { formatDate") && 
      !content.includes("import { formatDateShort") &&
      content.includes("toLocaleDateString('ar-SA'")) {
    
    // إضافة import في بداية الملف
    const importMatch = content.match(/^(.*?)(import.*?from.*?['"]\w)/gms);
    if (importMatch) {
      newContent = content.replace(
        /(import.*?from.*?['"][^'"]*['"];?\n)/,
        '$1import { formatDateShort } from \'@/lib/date-utils\';\n'
      );
      modified = true;
    }
  }
  
  // استبدال استخدامات toLocaleDateString البسيطة
  const patterns = [
    // نمط بسيط مع month: 'short', day: 'numeric'
    {
      pattern: /new Date\([^)]+\)\.toLocaleDateString\('ar-SA',\s*\{\s*month:\s*['"]short['"],\s*day:\s*['"]numeric['"](?:,\s*calendar:\s*['"]gregory['"],?\s*numberingSystem:\s*['"]latn['"])?\s*\}\)/g,
      replacement: 'formatDateShort($1)'
    },
    
    // نمط أكثر تعقيداً
    {
      pattern: /new Date\(([^)]+)\)\.toLocaleDateString\('ar-SA',\s*\{[^}]*\}\)/g,
      replacement: 'formatDateShort($1)'
    }
  ];
  
  patterns.forEach(({ pattern, replacement }) => {
    if (pattern.test(newContent)) {
      newContent = newContent.replace(pattern, replacement);
      modified = true;
    }
  });
  
  return { content: newContent, modified };
}

// معالجة الملفات
let fixedCount = 0;
let totalFiles = 0;

filesToFix.forEach(relativeFilePath => {
  const fullPath = path.join(process.cwd(), relativeFilePath);
  totalFiles++;
  
  console.log(`🔍 فحص: ${relativeFilePath}`);
  
  const content = readFile(fullPath);
  if (!content) return;
  
  const { content: newContent, modified } = fixFileContent(content, relativeFilePath);
  
  if (modified) {
    if (writeFile(fullPath, newContent)) {
      console.log(`✅ تم إصلاح: ${relativeFilePath}`);
      fixedCount++;
    }
  } else {
    console.log(`⏭️  لا يحتاج إصلاح: ${relativeFilePath}`);
  }
});

console.log(`\n📊 النتائج:`);
console.log(`📁 إجمالي الملفات المفحوصة: ${totalFiles}`);
console.log(`✅ الملفات المُصلحة: ${fixedCount}`);
console.log(`⏭️  الملفات التي لا تحتاج إصلاح: ${totalFiles - fixedCount}`);

if (fixedCount > 0) {
  console.log(`\n🎉 تم إصلاح مشكلة تنسيق التاريخ بنجاح!`);
  console.log(`⚠️  يرجى إعادة تشغيل الخادم لرؤية التغييرات`);
} else {
  console.log(`\n✨ جميع الملفات محدثة بالفعل!`);
} 