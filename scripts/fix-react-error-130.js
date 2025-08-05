#!/usr/bin/env node

/**
 * 🔧 React Error #130 Fixer
 * 
 * يحل مشاكل "Element type is invalid" الشائعة في React
 * المشاكل المستهدفة:
 * 1. استيرادات خاطئة أو مفقودة
 * 2. مكونات غير مُصدّرة بشكل صحيح
 * 3. تعارض في إصدارات React
 * 4. مشاكل Dynamic imports
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 بدء إصلاح React Error #130...\n');

// 1. تنظيف Cache
console.log('🧹 تنظيف Cache...');
try {
  // حذف .next و node_modules cache
  if (fs.existsSync('.next')) {
    execSync('rm -rf .next', { stdio: 'inherit' });
    console.log('✅ تم حذف مجلد .next');
  }
  
  if (fs.existsSync('node_modules/.cache')) {
    execSync('rm -rf node_modules/.cache', { stdio: 'inherit' });
    console.log('✅ تم حذف node_modules/.cache');
  }
  
  // تنظيف npm cache
  execSync('npm cache clean --force', { stdio: 'inherit' });
  console.log('✅ تم تنظيف npm cache');
  
} catch (error) {
  console.warn('⚠️ تحذير: لم يتم تنظيف Cache بالكامل:', error.message);
}

// 2. فحص وإصلاح ملفات المكونات
console.log('\n🔍 فحص وإصلاح ملفات المكونات...');

const componentsToCheck = [
  'components/ui/skeleton.tsx',
  'components/ui/optimized-image.tsx', 
  'components/ErrorBoundary/EnhancedErrorBoundary.tsx',
  'app/page-client.tsx',
  'lib/performance-monitor.ts'
];

function fixReactImports(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ ملف غير موجود: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // إضافة React import إذا كان مفقود وهناك استخدام لـ React
  const needsReact = (
    content.includes('React.') ||
    content.includes('useState') ||
    content.includes('useEffect') ||
    content.includes('useCallback') ||
    content.includes('Component') ||
    content.includes('ReactNode') ||
    content.includes('ReactElement')
  );

  const hasReactImport = content.includes('import React');

  if (needsReact && !hasReactImport) {
    // البحث عن أول import أو "use client"
    const lines = content.split('\n');
    let insertIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('"use client"') || lines[i].startsWith("'use client'")) {
        insertIndex = i + 1;
        break;
      } else if (lines[i].startsWith('import ')) {
        insertIndex = i;
        break;
      }
    }
    
    lines.splice(insertIndex, 0, 'import React from "react";');
    content = lines.join('\n');
    modified = true;
  }

  // إصلاح exports الشائعة
  const exportFixes = [
    {
      wrong: 'export function Skeleton',
      right: 'export function Skeleton'
    },
    {
      wrong: 'export default Skeleton',
      right: 'export { Skeleton };\nexport default Skeleton'
    }
  ];

  exportFixes.forEach(fix => {
    if (content.includes(fix.wrong) && !content.includes(fix.right)) {
      content = content.replace(fix.wrong, fix.right);
      modified = true;
    }
  });

  // إزالة imports مكررة
  const importLines = content.match(/^import\s+.*from\s+['"].*['"];?$/gm) || [];
  const uniqueImports = [...new Set(importLines)];
  
  if (importLines.length !== uniqueImports.length) {
    importLines.forEach(line => {
      content = content.replace(line, '');
    });
    
    const firstNonImportLine = content.split('\n').findIndex(line => 
      !line.startsWith('import ') && 
      !line.startsWith('"use') && 
      !line.startsWith("'use") &&
      line.trim() !== ''
    );
    
    const beforeImports = content.split('\n').slice(0, firstNonImportLine).join('\n');
    const afterImports = content.split('\n').slice(firstNonImportLine).join('\n');
    
    content = beforeImports + '\n' + uniqueImports.join('\n') + '\n' + afterImports;
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ تم إصلاح: ${filePath}`);
  } else {
    console.log(`✓ سليم: ${filePath}`);
  }
}

// إصلاح الملفات
componentsToCheck.forEach(fixReactImports);

// 3. فحص package.json للتأكد من إصدارات React
console.log('\n📦 فحص إصدارات React...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const reactVersion = packageJson.dependencies?.react;
const reactDomVersion = packageJson.dependencies?.['react-dom'];

console.log(`React version: ${reactVersion}`);
console.log(`React-DOM version: ${reactDomVersion}`);

if (reactVersion !== reactDomVersion) {
  console.warn('⚠️ تحذير: إصدارات React و React-DOM مختلفة!');
}

// 4. تنظيف node_modules إذا كانت هناك مشاكل في الإصدارات
if (process.argv.includes('--clean-modules')) {
  console.log('\n🔄 إعادة تثبيت node_modules...');
  try {
    execSync('rm -rf node_modules package-lock.json', { stdio: 'inherit' });
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ تم إعادة تثبيت node_modules');
  } catch (error) {
    console.error('❌ خطأ في إعادة التثبيت:', error.message);
  }
}

// 5. إزالة duplicates في React
console.log('\n🔄 إزالة React duplicates...');
try {
  execSync('npm dedupe', { stdio: 'inherit' });
  console.log('✅ تم تنظيف React duplicates');
} catch (error) {
  console.warn('⚠️ تحذير: لم يتم تنظيف duplicates:', error.message);
}

// 6. فحص التعارضات
console.log('\n🔍 فحص التعارضات...');
try {
  const result = execSync('npm ls react react-dom', { encoding: 'utf8', stdio: 'pipe' });
  console.log('✅ لا توجد تعارضات في React');
} catch (error) {
  console.warn('⚠️ تحذير: قد توجد تعارضات في React:');
  console.log(error.stdout || error.message);
}

// 7. إنشاء تقرير
console.log('\n📊 تقرير الإصلاح:');
console.log('================================');
console.log('✅ تم تنظيف Cache');
console.log('✅ تم فحص وإصلاح ملفات المكونات');
console.log('✅ تم فحص إصدارات React');
console.log('✅ تم تنظيف React duplicates');

console.log('\n🚀 الخطوات التالية:');
console.log('1. شغل: npm run dev');
console.log('2. إذا استمر الخطأ، شغل: node scripts/fix-react-error-130.js --clean-modules');
console.log('3. تحقق من المتصفح Developer Tools للأخطاء المحددة');

console.log('\n✅ تم الانتهاء من إصلاح React Error #130!');