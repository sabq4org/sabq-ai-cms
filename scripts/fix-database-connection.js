#!/usr/bin/env node

/**
 * سكريبت إصلاح اتصال قاعدة البيانات MySQL مع Prisma
 * يقوم بتحديث رابط قاعدة البيانات ليكون متوافق مع Prisma
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 بدء إصلاح اتصال قاعدة البيانات...\n');

// التحقق من وجود Vercel CLI
const vercelCmd = 'npx vercel';
try {
  execSync(`${vercelCmd} --version`, { stdio: 'ignore' });
  console.log('✅ Vercel CLI متاح');
} catch (error) {
  console.log('❌ Vercel CLI غير متاح');
  process.exit(1);
}

// جلب متغيرات البيئة الحالية
console.log('\n📥 جلب متغيرات البيئة الحالية...');
try {
  execSync(`${vercelCmd} env pull .env.production --yes`, { stdio: 'inherit' });
  console.log('✅ تم جلب متغيرات البيئة');
} catch (error) {
  console.log('⚠️  لم يتم جلب متغيرات البيئة - سنستمر بدونها');
}

// قراءة DATABASE_URL الحالي إن وجد
let currentDatabaseUrl = '';
if (fs.existsSync('.env.production')) {
  const envContent = fs.readFileSync('.env.production', 'utf8');
  const match = envContent.match(/DATABASE_URL=(.+)/);
  if (match) {
    currentDatabaseUrl = match[1].replace(/"/g, '');
    console.log('📋 DATABASE_URL الحالي:', currentDatabaseUrl.substring(0, 30) + '...');
  }
}

// إصلاح رابط قاعدة البيانات
let fixedDatabaseUrl = currentDatabaseUrl;
if (currentDatabaseUrl.startsWith('mysql://')) {
  // إضافة SSL parameters إذا لم تكن موجودة
  if (!currentDatabaseUrl.includes('sslaccept')) {
    const separator = currentDatabaseUrl.includes('?') ? '&' : '?';
    fixedDatabaseUrl = currentDatabaseUrl + separator + 'sslaccept=strict&connect_timeout=60';
    console.log('🔧 إضافة SSL parameters للرابط');
  }
} else {
  console.log('⚠️  تنسيق DATABASE_URL غير متوقع');
}

// تحديث متغيرات البيئة
console.log('\n🔄 تحديث متغيرات البيئة...');

const envVars = {
  'DATABASE_URL': fixedDatabaseUrl,
  'DIRECT_URL': fixedDatabaseUrl,
  'JWT_SECRET': 'sabq-secret-key-2024-ultra-secure',
  'ADMIN_SECRET': 'admin-secret-2024',
  'CLOUDINARY_CLOUD_NAME': 'dybhezmvb',
  'CLOUDINARY_API_KEY': '559894124915114',
  'CLOUDINARY_API_SECRET': 'vuiA8rLNm7d1U-UAOTED6FyC4hY'
};

// تطبيق متغيرات البيئة
for (const [key, value] of Object.entries(envVars)) {
  if (value) {
    try {
      console.log(`📝 تحديث ${key}...`);
      execSync(`${vercelCmd} env add ${key} production`, {
        input: value + '\n',
        stdio: ['pipe', 'inherit', 'inherit']
      });
    } catch (error) {
      // المتغير موجود مسبقاً، نحاول تحديثه
      try {
        execSync(`${vercelCmd} env rm ${key} production --yes`, { stdio: 'ignore' });
        execSync(`${vercelCmd} env add ${key} production`, {
          input: value + '\n',
          stdio: ['pipe', 'inherit', 'inherit']
        });
        console.log(`✅ تم تحديث ${key}`);
      } catch (updateError) {
        console.log(`⚠️  تعذر تحديث ${key}`);
      }
    }
  }
}

// إعادة نشر المشروع
console.log('\n🚀 إعادة نشر المشروع...');
try {
  execSync(`${vercelCmd} --prod --yes`, { stdio: 'inherit' });
  console.log('✅ تم إعادة النشر بنجاح');
} catch (error) {
  console.error('❌ فشل في إعادة النشر:', error.message);
  process.exit(1);
}

// اختبار النتيجة
console.log('\n🧪 اختبار الاتصال...');
setTimeout(() => {
  try {
    const testResult = execSync('curl -s https://sabq-ai-cms.vercel.app/api/test-db', { encoding: 'utf8' });
    const result = JSON.parse(testResult);
    
    if (result.success) {
      console.log('🎉 نجح الإصلاح! قاعدة البيانات تعمل بشكل صحيح');
      console.log('📊 حالة الجداول:', result.database?.tables || 'غير محدد');
    } else {
      console.log('⚠️  لا تزال هناك مشكلة:', result.error);
      console.log('💡 جرب الحلول البديلة في MYSQL_CONNECTION_FIX.md');
    }
  } catch (testError) {
    console.log('⚠️  تعذر اختبار الاتصال، جرب يدوياً:');
    console.log('curl https://sabq-ai-cms.vercel.app/api/test-db');
  }
}, 10000); // انتظار 10 ثوان للنشر

console.log('\n✨ انتهى الإصلاح! تحقق من النتائج خلال دقيقتين.'); 