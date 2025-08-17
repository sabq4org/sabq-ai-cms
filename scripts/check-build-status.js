#!/usr/bin/env node

/**
 * سكريبت للتحقق من حالة البناء وإصلاح المشاكل الشائعة
 */

console.log('🚀 فحص حالة البناء...\n');

// 1. فحص دوال التاريخ
console.log('1️⃣ فحص دوال التاريخ:');
try {
  const fs = require('fs');
  const dateUtilsContent = fs.readFileSync('lib/date-utils.ts', 'utf8');
  
  const requiredFunctions = [
    'formatFullDate',
    'formatRelativeDate', 
    'formatDateGregorian',
    'formatDateArabic'
  ];
  
  let missingFunctions = [];
  
  requiredFunctions.forEach(func => {
    if (!dateUtilsContent.includes(`export function ${func}`)) {
      missingFunctions.push(func);
    }
  });
  
  if (missingFunctions.length === 0) {
    console.log('   ✅ جميع دوال التاريخ موجودة ومُصدرة');
  } else {
    console.log('   ❌ دوال مفقودة:', missingFunctions.join(', '));
  }
  
} catch (error) {
  console.log('   ❌ خطأ في فحص دوال التاريخ:', error.message);
}

// 2. فحص ملف package.json
console.log('\n2️⃣ فحص إعدادات المشروع:');
try {
  const packageJson = JSON.parse(require('fs').readFileSync('package.json', 'utf8'));
  
  if (packageJson.scripts && packageJson.scripts.build) {
    console.log('   ✅ سكريبت البناء موجود:', packageJson.scripts.build);
  } else {
    console.log('   ❌ سكريبت البناء مفقود');
  }
  
  if (packageJson.scripts && packageJson.scripts.prebuild) {
    console.log('   ✅ سكريبت ما قبل البناء موجود:', packageJson.scripts.prebuild);
  } else {
    console.log('   ⚠️ سكريبت ما قبل البناء مفقود');
  }
  
} catch (error) {
  console.log('   ❌ خطأ في فحص package.json:', error.message);
}

// 3. فحص إعدادات Next.js
console.log('\n3️⃣ فحص إعدادات Next.js:');
try {
  const fs = require('fs');
  
  if (fs.existsSync('next.config.js')) {
    console.log('   ✅ ملف next.config.js موجود');
  } else if (fs.existsSync('next.config.mjs')) {
    console.log('   ✅ ملف next.config.mjs موجود');
  } else {
    console.log('   ⚠️ ملف إعدادات Next.js غير موجود');
  }
  
} catch (error) {
  console.log('   ❌ خطأ في فحص إعدادات Next.js:', error.message);
}

// 4. فحص Prisma
console.log('\n4️⃣ فحص إعدادات Prisma:');
try {
  const fs = require('fs');
  
  if (fs.existsSync('prisma/schema.prisma')) {
    console.log('   ✅ مخطط Prisma موجود');
  } else {
    console.log('   ❌ مخطط Prisma مفقود');
  }
  
  if (fs.existsSync('scripts/ensure-prisma-generation.js')) {
    console.log('   ✅ سكريبت إنشاء Prisma موجود');
  } else {
    console.log('   ❌ سكريبت إنشاء Prisma مفقود');
  }
  
} catch (error) {
  console.log('   ❌ خطأ في فحص Prisma:', error.message);
}

// 5. توصيات لحل المشاكل
console.log('\n💡 توصيات للإصلاح:');
console.log('   📁 إذا كان البناء يفشل:');
console.log('      - امسح .next و node_modules');
console.log('      - شغل npm install');
console.log('      - شغل npm run build');
console.log('');
console.log('   📧 إذا كانت مشاكل البريد الإلكتروني:');
console.log('      - تحقق من متغيرات SMTP في .env');
console.log('      - هذه رسائل تحذيرية ولن تؤثر على البناء');
console.log('');
console.log('   🚀 لنشر أسرع:');
console.log('      - استخدم clean-main branch');
console.log('      - تأكد من رفع جميع التغييرات');

console.log('\n🎉 انتهى فحص حالة البناء!');