#!/usr/bin/env node

/**
 * Script للتحقق من حالة البناء على Vercel
 * يساعد في تشخيص مشاكل البناء
 */

const { execSync } = require('child_process');

console.log('🔍 التحقق من حالة البناء على Vercel...\n');

// جلب آخر 5 commits
console.log('📝 آخر 5 commits:');
try {
  const commits = execSync('git log --oneline -n 5 --format="%h %s %ar"', { encoding: 'utf8' });
  console.log(commits);
} catch (error) {
  console.error('❌ خطأ في جلب commits:', error.message);
}

// التحقق من الملفات المهمة
console.log('\n📁 التحقق من الملفات الحرجة:');
const criticalFiles = [
  'app/reporter/[slug]/page.tsx',
  'app/article/[id]/page.tsx',
  '.vercelignore',
  'package.json'
];

criticalFiles.forEach(file => {
  try {
    execSync(`ls -la ${file}`, { stdio: 'ignore' });
    console.log(`✅ ${file} - موجود`);
  } catch {
    console.log(`❌ ${file} - غير موجود`);
  }
});

// التحقق من وجود أخطاء في الكود
console.log('\n🔧 التحقق من أخطاء البناء المحتملة:');
try {
  // التحقق من السطر 1364 في ملف reporter
  const reporterContent = execSync('sed -n "1360,1370p" app/reporter/\\[slug\\]/page.tsx', { encoding: 'utf8' });
  console.log('محتوى السطور 1360-1370 من app/reporter/[slug]/page.tsx:');
  console.log(reporterContent);
  
  // البحث عن أقواس غير مغلقة
  const openDivs = (reporterContent.match(/<div/g) || []).length;
  const closeDivs = (reporterContent.match(/<\/div>/g) || []).length;
  const openSections = (reporterContent.match(/<section/g) || []).length;
  const closeSections = (reporterContent.match(/<\/section>/g) || []).length;
  
  console.log(`\n📊 إحصائيات العناصر:`);
  console.log(`   <div>: ${openDivs}, </div>: ${closeDivs}`);
  console.log(`   <section>: ${openSections}, </section>: ${closeSections}`);
  
  if (openDivs !== closeDivs || openSections !== closeSections) {
    console.log('\n⚠️  تحذير: عدد عناصر الفتح والإغلاق غير متطابق!');
  }
} catch (error) {
  console.error('❌ خطأ في التحقق من الملف:', error.message);
}

// اقتراحات
console.log('\n💡 اقتراحات لحل المشكلة:');
console.log('1. تأكد من أن Vercel يستخدم آخر commit');
console.log('2. اذهب إلى لوحة تحكم Vercel واضغط "Redeploy"');
console.log('3. اختر "Redeploy with existing Build Cache cleared"');
console.log('4. تأكد من اختيار الفرع الصحيح (main)');
console.log('\n✨ آخر commit صحيح يجب أن يكون:', execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim());