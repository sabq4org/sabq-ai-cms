#!/usr/bin/env node

/**
 * سكريبت إعداد S3 Bucket للوصول العام
 * يقوم بتطبيق Bucket Policy و CORS Policy
 */

const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// إعداد AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || process.env.S3_REGION || 'us-east-1',
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'sabq-ai-cms-images';

// Bucket Policy للوصول العام
const bucketPolicy = {
  Version: '2012-10-17',
  Statement: [
    {
      Sid: 'PublicReadGetObject',
      Effect: 'Allow',
      Principal: '*',
      Action: 's3:GetObject',
      Resource: `arn:aws:s3:::${BUCKET_NAME}/*`,
      Condition: {
        StringLike: {
          's3:prefix': [
            'articles/*',
            'categories/*',
            'featured/*',
            'thumbnails/*',
            'uploads/*'
          ]
        }
      }
    }
  ]
};

// CORS Configuration
const corsConfiguration = {
  CORSRules: [
    {
      AllowedHeaders: ['*'],
      AllowedMethods: ['GET', 'HEAD'],
      AllowedOrigins: [
        'https://sabq.io',
        'https://www.sabq.io',
        'http://localhost:3000',
        'http://localhost:3002',
        'http://localhost:3001'
      ],
      ExposeHeaders: [
        'ETag',
        'Content-Type',
        'Content-Length',
        'x-amz-server-side-encryption',
        'x-amz-request-id',
        'x-amz-id-2'
      ],
      MaxAgeSeconds: 3600
    }
  ]
};

async function setupBucketPolicy() {
  console.log('🔧 إعداد Bucket Policy...');
  
  try {
    // تطبيق Bucket Policy
    await s3.putBucketPolicy({
      Bucket: BUCKET_NAME,
      Policy: JSON.stringify(bucketPolicy)
    }).promise();
    
    console.log('✅ تم تطبيق Bucket Policy بنجاح');
  } catch (error) {
    console.error('❌ خطأ في تطبيق Bucket Policy:', error.message);
    throw error;
  }
}

async function setupCORS() {
  console.log('🔧 إعداد CORS Configuration...');
  
  try {
    // تطبيق CORS Configuration
    await s3.putBucketCors({
      Bucket: BUCKET_NAME,
      CORSConfiguration: corsConfiguration
    }).promise();
    
    console.log('✅ تم تطبيق CORS Configuration بنجاح');
  } catch (error) {
    console.error('❌ خطأ في تطبيق CORS:', error.message);
    throw error;
  }
}

async function disableBlockPublicAccess() {
  console.log('🔧 إلغاء حظر الوصول العام...');
  
  try {
    await s3.deletePublicAccessBlock({
      Bucket: BUCKET_NAME
    }).promise();
    
    console.log('✅ تم إلغاء حظر الوصول العام');
  } catch (error) {
    if (error.code === 'NoSuchPublicAccessBlockConfiguration') {
      console.log('ℹ️ الوصول العام غير محظور بالفعل');
    } else {
      console.error('❌ خطأ في إلغاء حظر الوصول العام:', error.message);
      throw error;
    }
  }
}

async function verifySetup() {
  console.log('\n🔍 التحقق من الإعدادات...');
  
  try {
    // التحقق من Bucket Policy
    const policy = await s3.getBucketPolicy({ Bucket: BUCKET_NAME }).promise();
    console.log('✅ Bucket Policy موجود');
    
    // التحقق من CORS
    const cors = await s3.getBucketCors({ Bucket: BUCKET_NAME }).promise();
    console.log('✅ CORS Configuration موجود');
    
    // التحقق من Public Access Block
    try {
      await s3.getPublicAccessBlock({ Bucket: BUCKET_NAME }).promise();
      console.log('⚠️ تحذير: Public Access Block موجود - قد يمنع الوصول العام');
    } catch (error) {
      if (error.code === 'NoSuchPublicAccessBlockConfiguration') {
        console.log('✅ Public Access Block غير موجود (جيد)');
      }
    }
    
    console.log('\n✨ تم إعداد S3 Bucket بنجاح للوصول العام!');
    
  } catch (error) {
    console.error('❌ خطأ في التحقق:', error.message);
  }
}

async function saveBackup() {
  console.log('\n💾 حفظ نسخة احتياطية من الإعدادات...');
  
  const backupDir = path.join(__dirname, '..', 's3-backup');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  // حفظ Bucket Policy
  fs.writeFileSync(
    path.join(backupDir, 'bucket-policy.json'),
    JSON.stringify(bucketPolicy, null, 2)
  );
  
  // حفظ CORS Configuration
  fs.writeFileSync(
    path.join(backupDir, 'cors-config.json'),
    JSON.stringify(corsConfiguration, null, 2)
  );
  
  console.log('✅ تم حفظ النسخة الاحتياطية في:', backupDir);
}

async function main() {
  console.log(`
🚀 إعداد S3 Bucket للوصول العام
================================
Bucket: ${BUCKET_NAME}
Region: ${process.env.AWS_REGION || 'us-east-1'}
================================
`);

  try {
    // 1. إلغاء حظر الوصول العام
    await disableBlockPublicAccess();
    
    // 2. تطبيق Bucket Policy
    await setupBucketPolicy();
    
    // 3. تطبيق CORS Configuration
    await setupCORS();
    
    // 4. حفظ نسخة احتياطية
    await saveBackup();
    
    // 5. التحقق من الإعدادات
    await verifySetup();
    
    console.log(`
🎉 تم الانتهاء بنجاح!

الخطوات التالية:
1. تحديث الكود لاستخدام الروابط العامة
2. اختبار رفع وعرض الصور
3. مراقبة Console للتأكد من عدم وجود أخطاء CORS

ملاحظة: قد تحتاج لانتظار بضع دقائق حتى تصبح التغييرات فعالة.
`);
    
  } catch (error) {
    console.error('\n❌ فشل الإعداد:', error);
    process.exit(1);
  }
}

// تشغيل السكريبت
if (require.main === module) {
  main();
} 