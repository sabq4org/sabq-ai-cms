#!/usr/bin/env node

/**
 * سكريبت رفع سجلات البناء إلى DigitalOcean Spaces
 * يتم تشغيله تلقائياً بعد عملية البناء
 */

const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// تحميل متغيرات البيئة
require('dotenv').config({ path: '.env.local' });

// التحقق من وجود المتغيرات المطلوبة
const requiredEnvVars = [
  'DO_SPACES_KEY',
  'DO_SPACES_SECRET',
  'DO_SPACES_REGION',
  'DO_SPACES_BUCKET',
  'DO_SPACES_ENDPOINT'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.log('⚠️ تخطي رفع السجلات - متغيرات Spaces غير موجودة');
  // لا نريد أن يفشل البناء بسبب عدم وجود Spaces
  process.exit(0);
}

// إعداد DigitalOcean Spaces
const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT);
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_SPACES_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET,
  region: process.env.DO_SPACES_REGION,
  s3ForcePathStyle: true,
  signatureVersion: 'v4'
});

/**
 * جمع معلومات النظام والبناء
 */
function collectSystemInfo() {
  const info = {
    timestamp: new Date().toISOString(),
    node_version: process.version,
    npm_version: execSync('npm --version').toString().trim(),
    platform: process.platform,
    arch: process.arch,
    app_version: process.env.APP_VERSION || require('../package.json').version,
    environment: process.env.NODE_ENV || 'development',
    build_command: process.env.npm_lifecycle_event || 'unknown',
    git_branch: '',
    git_commit: '',
    memory_usage: process.memoryUsage(),
  };

  // محاولة الحصول على معلومات Git
  try {
    info.git_branch = execSync('git branch --show-current').toString().trim();
    info.git_commit = execSync('git rev-parse --short HEAD').toString().trim();
  } catch (e) {
    // تجاهل أخطاء Git
  }

  return info;
}

/**
 * قراءة سجلات البناء من Next.js
 */
function readBuildLogs() {
  const logs = [];
  
  // ملفات البناء المهمة
  const buildFiles = [
    '.next/BUILD_ID',
    '.next/build-manifest.json',
    '.next/prerender-manifest.json',
    '.next/routes-manifest.json',
  ];

  buildFiles.forEach(file => {
    try {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        logs.push({
          file: file,
          content: content.substring(0, 1000) // أول 1000 حرف فقط
        });
      }
    } catch (e) {
      // تجاهل الأخطاء
    }
  });

  // إحصائيات البناء
  try {
    const buildStats = execSync('find .next -type f -name "*.js" | wc -l').toString().trim();
    logs.push({
      file: 'build-stats',
      content: `Total JS files: ${buildStats}`
    });
  } catch (e) {
    // تجاهل
  }

  return logs;
}

/**
 * رفع السجلات إلى Spaces
 */
async function uploadBuildLogs() {
  console.log('\n📤 بدء رفع سجلات البناء إلى DigitalOcean Spaces...');
  
  try {
    // جمع المعلومات
    const systemInfo = collectSystemInfo();
    const buildLogs = readBuildLogs();
    
    // إنشاء محتوى السجل
    const logContent = {
      system_info: systemInfo,
      build_logs: buildLogs,
      environment_variables: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL: process.env.DATABASE_URL ? 'configured' : 'missing',
        JWT_SECRET: process.env.JWT_SECRET ? 'configured' : 'missing',
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'missing',
      }
    };

    // اسم الملف مع الطابع الزمني
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const logFileName = `build-log-${timestamp}.json`;
    
    // رفع السجل الرئيسي
    const mainLogParams = {
      Bucket: process.env.DO_SPACES_BUCKET,
      Key: `appbuild-logs/${logFileName}`,
      Body: JSON.stringify(logContent, null, 2),
      ContentType: 'application/json',
      ACL: 'private',
      Metadata: {
        'app-version': systemInfo.app_version,
        'git-commit': systemInfo.git_commit || 'unknown',
        'node-version': systemInfo.node_version
      }
    };

    const uploadResult = await s3.upload(mainLogParams).promise();
    console.log(`✅ تم رفع السجل الرئيسي: ${logFileName}`);

    // رفع ملف "آخر بناء" للوصول السريع
    const latestLogParams = {
      ...mainLogParams,
      Key: 'appbuild-logs/latest-build.json',
    };
    
    await s3.upload(latestLogParams).promise();
    console.log('✅ تم تحديث latest-build.json');

    // حفظ نسخة محلية
    const localLogPath = path.join(__dirname, '..', 'logs', 'build');
    if (!fs.existsSync(localLogPath)) {
      fs.mkdirSync(localLogPath, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(localLogPath, logFileName),
      JSON.stringify(logContent, null, 2)
    );
    console.log('💾 تم حفظ نسخة محلية من السجل');

    // تنظيف السجلات القديمة (احتفظ بآخر 10 فقط)
    await cleanupOldLogs();

    console.log('\n✅ اكتمل رفع سجلات البناء بنجاح! 🎉\n');

  } catch (error) {
    console.error('❌ فشل رفع سجلات البناء:', error.message);
    // لا نريد أن يفشل البناء بسبب فشل رفع السجلات
    console.log('⚠️ سيستمر البناء بدون رفع السجلات');
  }
}

/**
 * حذف السجلات القديمة
 */
async function cleanupOldLogs() {
  try {
    // جلب قائمة السجلات
    const listParams = {
      Bucket: process.env.DO_SPACES_BUCKET,
      Prefix: 'appbuild-logs/build-log-',
    };

    const objects = await s3.listObjectsV2(listParams).promise();
    
    if (objects.Contents && objects.Contents.length > 10) {
      // ترتيب حسب التاريخ وحذف الأقدم
      const sortedObjects = objects.Contents
        .sort((a, b) => b.LastModified - a.LastModified)
        .slice(10); // احتفظ بأحدث 10

      // حذف الملفات القديمة
      for (const obj of sortedObjects) {
        await s3.deleteObject({
          Bucket: process.env.DO_SPACES_BUCKET,
          Key: obj.Key
        }).promise();
        console.log(`🗑️ تم حذف سجل قديم: ${obj.Key}`);
      }
    }
  } catch (error) {
    // تجاهل أخطاء التنظيف
  }
}

// تشغيل السكريبت
if (require.main === module) {
  uploadBuildLogs();
}

module.exports = uploadBuildLogs; 