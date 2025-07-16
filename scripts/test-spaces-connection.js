#!/usr/bin/env node

/**
 * سكريبت اختبار اتصال DigitalOcean Spaces
 * يتحقق من إمكانية الوصول للبكت وإنشاء المجلدات المطلوبة
 */

require('dotenv').config({ path: '.env.local' });
const AWS = require('aws-sdk');

// التحقق من وجود المتغيرات المطلوبة
const requiredEnvVars = [
  'DO_SPACES_KEY',
  'DO_SPACES_SECRET',
  'DO_SPACES_REGION',
  'DO_SPACES_BUCKET',
  'DO_SPACES_ENDPOINT'
];

console.log('🔍 فحص متغيرات البيئة...\n');

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ متغيرات مفقودة:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.log('\n💡 تأكد من إضافة هذه المتغيرات في .env.local أو App Platform');
  process.exit(1);
}

// إعداد اتصال Spaces
const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT);
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_SPACES_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET,
  region: process.env.DO_SPACES_REGION,
  s3ForcePathStyle: true,
  signatureVersion: 'v4'
});

console.log('✅ متغيرات البيئة موجودة\n');
console.log('🔗 محاولة الاتصال بـ DigitalOcean Spaces...\n');

async function testConnection() {
  try {
    // 1. اختبار القدرة على قراءة البكتات
    console.log('📋 جلب قائمة البكتات...');
    const bucketsResult = await s3.listBuckets().promise();
    console.log(`✅ تم العثور على ${bucketsResult.Buckets.length} بكت\n`);

    // 2. التحقق من وجود البكت المطلوب
    const bucketName = process.env.DO_SPACES_BUCKET;
    const bucketExists = bucketsResult.Buckets.some(b => b.Name === bucketName);
    
    if (!bucketExists) {
      console.log(`⚠️ البكت "${bucketName}" غير موجود`);
      console.log('📝 يجب إنشاء البكت من لوحة تحكم DigitalOcean\n');
    } else {
      console.log(`✅ البكت "${bucketName}" موجود\n`);

      // 3. فحص محتويات مجلد appbuild-logs
      console.log('📁 فحص مجلد appbuild-logs...');
      const objects = await s3.listObjectsV2({
        Bucket: bucketName,
        Prefix: 'appbuild-logs/',
        MaxKeys: 10
      }).promise();

      if (objects.Contents && objects.Contents.length > 0) {
        console.log(`✅ تم العثور على ${objects.Contents.length} ملف في appbuild-logs:\n`);
        objects.Contents.forEach(obj => {
          const size = (obj.Size / 1024).toFixed(2);
          const date = new Date(obj.LastModified).toLocaleString('ar');
          console.log(`   📄 ${obj.Key}`);
          console.log(`      الحجم: ${size} KB | آخر تعديل: ${date}\n`);
        });
      } else {
        console.log('📭 مجلد appbuild-logs فارغ أو غير موجود\n');
        
        // محاولة إنشاء ملف اختباري
        console.log('🧪 محاولة إنشاء ملف اختباري...');
        const testKey = 'appbuild-logs/test-connection.txt';
        const testContent = `اختبار الاتصال - ${new Date().toISOString()}`;
        
        await s3.putObject({
          Bucket: bucketName,
          Key: testKey,
          Body: testContent,
          ContentType: 'text/plain; charset=utf-8',
          ACL: 'private'
        }).promise();
        
        console.log('✅ تم إنشاء ملف الاختبار بنجاح\n');

        // حذف ملف الاختبار
        console.log('🗑️ حذف ملف الاختبار...');
        await s3.deleteObject({
          Bucket: bucketName,
          Key: testKey
        }).promise();
        console.log('✅ تم حذف ملف الاختبار\n');
      }

      // 4. عرض معلومات الاتصال
      console.log('📊 معلومات الاتصال:');
      console.log(`   - Endpoint: ${process.env.DO_SPACES_ENDPOINT}`);
      console.log(`   - Region: ${process.env.DO_SPACES_REGION}`);
      console.log(`   - Bucket: ${bucketName}`);
      console.log(`   - Access Key: ${process.env.DO_SPACES_KEY.substring(0, 10)}...`);
      console.log('\n✅ الاتصال بـ DigitalOcean Spaces يعمل بشكل صحيح! 🎉');
    }

  } catch (error) {
    console.error('❌ فشل الاتصال بـ DigitalOcean Spaces:\n');
    console.error(`   الخطأ: ${error.message}`);
    console.error(`   الكود: ${error.code}`);
    
    if (error.code === 'InvalidAccessKeyId') {
      console.log('\n💡 تأكد من صحة Access Key');
    } else if (error.code === 'SignatureDoesNotMatch') {
      console.log('\n💡 تأكد من صحة Secret Key');
    } else if (error.code === 'NoSuchBucket') {
      console.log('\n💡 البكت المحدد غير موجود، يجب إنشاؤه من لوحة التحكم');
    } else if (error.code === 'AccessDenied') {
      console.log('\n💡 ليس لديك صلاحيات كافية، تحقق من إعدادات Access Key');
    }
    
    process.exit(1);
  }
}

// تشغيل الاختبار
testConnection(); 