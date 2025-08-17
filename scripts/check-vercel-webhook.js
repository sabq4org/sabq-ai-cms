#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔍 فحص حالة Vercel...\n');

// التحقق من آخر commit
console.log('📌 آخر commit:');
try {
  const lastCommit = execSync('git log -1 --oneline', { encoding: 'utf8' });
  console.log(lastCommit);
} catch (error) {
  console.error('خطأ في جلب آخر commit');
}

// التحقق من الحالة الحالية
console.log('\n📊 حالة Git:');
try {
  const status = execSync('git status --short', { encoding: 'utf8' });
  console.log(status || 'لا توجد تغييرات');
} catch (error) {
  console.error('خطأ في جلب حالة Git');
}

console.log('\n💡 حلول مقترحة لمشكلة Vercel:');
console.log('1. تحقق من GitHub Integration في إعدادات Vercel');
console.log('2. تحقق من Deployment Protection Rules');
console.log('3. تحقق من Branch Settings (يجب أن يكون main)');
console.log('4. جرب Redeploy من لوحة تحكم Vercel');
console.log('5. تحقق من GitHub Webhooks:');
console.log('   - اذهب إلى: Settings > Webhooks في GitHub');
console.log('   - تحقق من وجود Vercel webhook');
console.log('   - تحقق من Recent Deliveries');

console.log('\n🔧 خطوات الإصلاح:');
console.log('1. اذهب إلى: https://vercel.com/[your-team]/[your-project]/settings/git');
console.log('2. انقر على "Manage Git Integration"');
console.log('3. تحقق من أن المستودع متصل بشكل صحيح');
console.log('4. في قسم "Ignored Build Step"، تأكد من أنه غير مفعل');
console.log('5. في قسم "Root Directory"، تأكد من أنه فارغ أو "."');

console.log('\n⚡ لإجبار البناء فورًا:');
console.log('1. اذهب إلى لوحة تحكم Vercel');
console.log('2. انقر على النقاط الثلاث بجانب آخر deployment');
console.log('3. اختر "Redeploy"');
console.log('4. أو استخدم Vercel CLI:');
console.log('   vercel --prod --force');

// إنشاء تغيير صغير لإجبار Vercel
console.log('\n🚀 إنشاء تغيير لإجبار Vercel...');
const timestamp = new Date().toISOString();
const content = `Last check: ${timestamp}\nForce rebuild: true`;

try {
  require('fs').writeFileSync('.vercel-check', content);
  console.log('✅ تم إنشاء ملف .vercel-check');
  console.log('   - الآن قم بـ: git add .vercel-check && git commit -m "Force Vercel rebuild" && git push');
} catch (error) {
  console.error('❌ فشل إنشاء الملف');
} 