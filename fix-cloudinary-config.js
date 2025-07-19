#!/usr/bin/env node

// ==============================================
// 🔧 إصلاح إعدادات Cloudinary
// ==============================================

const fs = require('fs');
const path = require('path');

console.log('🔧 بدء إصلاح إعدادات Cloudinary...\n');

// قراءة ملف .env.local
const envPath = '.env.local';
if (!fs.existsSync(envPath)) {
  console.error('❌ ملف .env.local غير موجود!');
  console.log('💡 قم بإنشاءه أولاً أو نسخ من env.production.example');
  process.exit(1);
}

let envContent = fs.readFileSync(envPath, 'utf-8');
console.log('📄 تم قراءة ملف .env.local');

// فحص إعدادات Cloudinary الحالية
const currentCloudName = envContent.match(/CLOUDINARY_CLOUD_NAME=(.+)/)?.[1]?.replace(/"/g, '');
const currentApiKey = envContent.match(/CLOUDINARY_API_KEY=(.+)/)?.[1]?.replace(/"/g, '');
const currentApiSecret = envContent.match(/CLOUDINARY_API_SECRET=(.+)/)?.[1]?.replace(/"/g, '');

console.log('🔍 الإعدادات الحالية:');
console.log(`  - Cloud Name: ${currentCloudName || 'غير محدد'}`);
console.log(`  - API Key: ${currentApiKey || 'غير محدد'}`);
console.log(`  - API Secret: ${currentApiSecret ? 'محدد' : 'غير محدد'}\n`);

// فحص إذا كانت الإعدادات placeholder
const needsUpdate = 
  !currentCloudName || 
  currentCloudName === 'sabq_cloud' ||
  !currentApiKey || 
  currentApiKey === '123456789012345' ||
  currentApiKey === 'your-api-key' ||
  !currentApiSecret || 
  currentApiSecret === 'your_cloudinary_api_secret';

if (needsUpdate) {
  console.log('⚠️  إعدادات Cloudinary تحتاج تحديث!');
  console.log('\n📋 تحتاج إلى إدخال المعلومات التالية من Cloudinary Dashboard:');
  console.log('   1. اذهب إلى: https://cloudinary.com/console');
  console.log('   2. انسخ: Cloud Name, API Key, API Secret');
  console.log('   3. ادخل القيم أدناه:\n');

  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query) => new Promise((resolve) => rl.question(query, resolve));

  (async () => {
    try {
      let cloudName = currentCloudName;
      let apiKey = currentApiKey;
      let apiSecret = currentApiSecret;

      // إدخال Cloud Name
      if (!cloudName || cloudName === 'sabq_cloud') {
        cloudName = await question('🔵 أدخل Cloud Name: ');
      }

      // إدخال API Key
      if (!apiKey || apiKey === '123456789012345' || apiKey === 'your-api-key') {
        apiKey = await question('🔑 أدخل API Key: ');
      }

      // إدخال API Secret
      if (!apiSecret || apiSecret === 'your_cloudinary_api_secret') {
        apiSecret = await question('🔐 أدخل API Secret: ');
      }

      // التحقق من صحة الإدخال
      if (!cloudName || !apiKey || !apiSecret) {
        console.log('\n❌ جميع الحقول مطلوبة!');
        process.exit(1);
      }

      // تحديث ملف .env.local
      const updatedEnv = envContent
        .replace(/CLOUDINARY_CLOUD_NAME=.+/, `CLOUDINARY_CLOUD_NAME="${cloudName}"`)
        .replace(/CLOUDINARY_API_KEY=.+/, `CLOUDINARY_API_KEY="${apiKey}"`)
        .replace(/CLOUDINARY_API_SECRET=.+/, `CLOUDINARY_API_SECRET="${apiSecret}"`);

      // إضافة المتغيرات إذا لم تكن موجودة
      if (!envContent.includes('CLOUDINARY_CLOUD_NAME')) {
        updatedEnv += `\nCLOUDINARY_CLOUD_NAME="${cloudName}"`;
      }
      if (!envContent.includes('CLOUDINARY_API_KEY')) {
        updatedEnv += `\nCLOUDINARY_API_KEY="${apiKey}"`;
      }
      if (!envContent.includes('CLOUDINARY_API_SECRET')) {
        updatedEnv += `\nCLOUDINARY_API_SECRET="${apiSecret}"`;
      }

      // حفظ الملف
      fs.writeFileSync(envPath, updatedEnv);
      
      console.log('\n✅ تم تحديث إعدادات Cloudinary بنجاح!');
      console.log('📁 تم حفظ التغييرات في .env.local');
      console.log('\n🔄 يرجى إعادة تشغيل الخادم لتطبيق التغييرات');

    } catch (error) {
      console.error('\n❌ خطأ في تحديث الإعدادات:', error.message);
    } finally {
      rl.close();
    }
  })();

} else {
  console.log('✅ إعدادات Cloudinary تبدو صحيحة!');
  
  // اختبار الاتصال (اختياري)
  console.log('\n🧪 اختبار الاتصال بـ Cloudinary...');
  try {
    const { v2: cloudinary } = require('cloudinary');
    cloudinary.config({
      cloud_name: currentCloudName,
      api_key: currentApiKey,
      api_secret: currentApiSecret,
    });

    // اختبار بسيط
    cloudinary.api.ping((error, result) => {
      if (error) {
        console.log('❌ فشل الاتصال بـ Cloudinary:', error.message);
        console.log('💡 تحقق من صحة المفاتيح');
      } else {
        console.log('✅ الاتصال بـ Cloudinary ناجح!');
      }
    });
  } catch (error) {
    console.log('⚠️  لا يمكن اختبار الاتصال. تأكد من تثبيت cloudinary package');
  }
} 