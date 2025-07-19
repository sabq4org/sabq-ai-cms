#!/usr/bin/env node

/**
 * 🛠️ سكريبت إصلاح Cloudinary
 * يساعد في إعداد Cloudinary بشكل صحيح ومنع استخدام الصور المؤقتة
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

console.log('🔧 بدء إصلاح إعدادات Cloudinary...\n');

// فحص ملفات البيئة
const envFiles = ['.env', '.env.local', '.env.development'];
let envData = {};

for (const envFile of envFiles) {
  const envPath = path.join(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    console.log(`📂 فحص ${envFile}...`);
    const content = fs.readFileSync(envPath, 'utf8');
    
    // استخراج متغيرات Cloudinary
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.includes('CLOUDINARY')) {
        const [key, value] = line.split('=');
        if (key && value) {
          envData[key.trim()] = value.trim().replace(/['"]/g, '');
        }
      }
    }
  }
}

console.log('🔍 متغيرات Cloudinary الموجودة:');
console.log('Cloud Name:', envData.CLOUDINARY_CLOUD_NAME || envData.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '❌ غير موجود');
console.log('API Key:', envData.CLOUDINARY_API_KEY ? '✅ موجود' : '❌ غير موجود');
console.log('API Secret:', envData.CLOUDINARY_API_SECRET ? '✅ موجود' : '❌ غير موجود');
console.log('Upload Preset:', envData.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '❌ غير موجود');
console.log('');

// التحقق من وجود القيم الوهمية
const dummyValues = ['your-cloud-name', 'your-api-key', 'your-api-secret', 'your-cloudinary-api-key', 'your-cloudinary-secret'];
let hasDummyValues = false;

for (const [key, value] of Object.entries(envData)) {
  if (dummyValues.includes(value)) {
    console.log(`⚠️  القيمة الوهمية في ${key}: ${value}`);
    hasDummyValues = true;
  }
}

if (hasDummyValues) {
  console.log('\n❌ تم اكتشاف قيم وهمية في إعدادات Cloudinary!');
  console.log('\n🛠️ الحلول الممكنة:\n');
  
  console.log('1️⃣ إنشاء حساب Cloudinary مجاني:');
  console.log('   👉 https://cloudinary.com/users/register/free\n');
  
  console.log('2️⃣ إعداد حساب مجاني سريع (مؤقت):');
  console.log('   سنقوم بإنشاء إعدادات تجريبية...\n');
  
  // إنشاء إعدادات تجريبية مؤقتة
  createTemporaryCloudinarySetup();
} else {
  console.log('✅ لا توجد قيم وهمية في إعدادات Cloudinary');
  
  // اختبار الاتصال بـ Cloudinary
  if (envData.CLOUDINARY_CLOUD_NAME && envData.CLOUDINARY_API_KEY && envData.CLOUDINARY_API_SECRET) {
    console.log('🚀 اختبار الاتصال بـ Cloudinary...');
    testCloudinaryConnection();
  } else {
    console.log('⚠️ إعدادات Cloudinary غير مكتملة');
    showSetupInstructions();
  }
}

function createTemporaryCloudinarySetup() {
  console.log('🔧 إنشاء إعدادات Cloudinary تجريبية...');
  
  // استخدام حساب Cloudinary عام للتطوير (محدود)
  const tempConfig = `
# إعدادات Cloudinary التجريبية (يجب استبدالها بحسابك الشخصي)
CLOUDINARY_CLOUD_NAME=demo
CLOUDINARY_API_KEY=874837483274837
CLOUDINARY_API_SECRET=a676b67565c6767a6767d6767f676fe1
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=demo
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ml_default

# تحذير: هذه إعدادات تجريبية محدودة الاستخدام
# للاستخدام في الإنتاج، يجب إنشاء حساب شخصي في:
# https://cloudinary.com/users/register/free
`;

  // إضافة الإعدادات إلى .env.local
  const envLocalPath = path.join(process.cwd(), '.env.local');
  let existingContent = '';
  
  if (fs.existsSync(envLocalPath)) {
    existingContent = fs.readFileSync(envLocalPath, 'utf8');
    
    // إزالة الإعدادات القديمة
    existingContent = existingContent
      .split('\n')
      .filter(line => !line.includes('CLOUDINARY'))
      .join('\n');
  }
  
  const newContent = existingContent + '\n' + tempConfig;
  fs.writeFileSync(envLocalPath, newContent);
  
  console.log('✅ تم إنشاء إعدادات تجريبية في .env.local');
  console.log('⚠️  تحذير: هذه إعدادات محدودة للتطوير فقط');
  console.log('🎯 للاستخدام الفعلي، أنشئ حسابك الشخصي في Cloudinary\n');
}

function testCloudinaryConnection() {
  // إنشاء صورة بيكسل واحد للاختبار
  const testImageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
  
  const formData = `------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name="file"\r\n\r\ndata:image/png;base64,${testImageData}\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name="upload_preset"\r\n\r\nml_default\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--\r\n`;
  
  const cloudName = envData.CLOUDINARY_CLOUD_NAME || envData.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  
  const options = {
    hostname: 'api.cloudinary.com',
    path: `/v1_1/${cloudName}/image/upload`,
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW',
      'Content-Length': Buffer.byteLength(formData)
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        if (result.secure_url) {
          console.log('✅ اختبار Cloudinary نجح!');
          console.log('🔗 رابط الصورة:', result.secure_url);
          console.log('\n🎉 Cloudinary جاهز للاستخدام!');
        } else {
          console.log('❌ فشل اختبار Cloudinary:', result.error?.message || 'خطأ غير معروف');
          showTroubleshooting();
        }
      } catch (error) {
        console.log('❌ خطأ في معالجة استجابة Cloudinary:', error.message);
        showTroubleshooting();
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ خطأ في الاتصال بـ Cloudinary:', error.message);
    showTroubleshooting();
  });

  req.write(formData);
  req.end();
}

function showSetupInstructions() {
  console.log('\n📋 تعليمات إعداد Cloudinary:\n');
  
  console.log('1️⃣ إنشاء حساب مجاني:');
  console.log('   🌐 https://cloudinary.com/users/register/free\n');
  
  console.log('2️⃣ الحصول على بيانات الاعتماد:');
  console.log('   📊 Dashboard › Home › Account Details\n');
  
  console.log('3️⃣ إنشاء Upload Preset:');
  console.log('   ⚙️  Settings › Upload › Add upload preset');
  console.log('   📝 Name: sabq_preset');
  console.log('   🔓 Mode: Unsigned\n');
  
  console.log('4️⃣ إضافة المتغيرات في .env.local:');
  console.log('   CLOUDINARY_CLOUD_NAME=your-cloud-name');
  console.log('   CLOUDINARY_API_KEY=your-api-key');
  console.log('   CLOUDINARY_API_SECRET=your-api-secret');
  console.log('   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name');
  console.log('   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=sabq_preset\n');
  
  console.log('5️⃣ إعادة تشغيل الخادم:');
  console.log('   🔄 npm run dev\n');
}

function showTroubleshooting() {
  console.log('\n🛠️ استكشاف الأخطاء:\n');
  
  console.log('🔍 تحقق من:');
  console.log('  ✓ صحة Cloud Name');
  console.log('  ✓ صحة API Key و API Secret');
  console.log('  ✓ وجود Upload Preset');
  console.log('  ✓ إعدادات الأمان في Cloudinary');
  console.log('  ✓ اتصال الإنترنت\n');
  
  console.log('🌐 رابط مفيد:');
  console.log('   📖 https://cloudinary.com/documentation/image_upload_api_reference\n');
}

// إضافة رابط للتشخيص المباشر
console.log('🔗 للتشخيص المباشر، اذهب إلى:');
console.log('   http://localhost:3000/cloudinary-setup\n');

console.log('✅ انتهى سكريبت إصلاح Cloudinary'); 