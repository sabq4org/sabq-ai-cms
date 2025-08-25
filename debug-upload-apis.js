#!/usr/bin/env node

/**
 * 🔍 أداة تشخيص شاملة لـ APIs رفع الصور
 * تختبر جميع endpoints وتحديد مصدر الأخطاء
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// إعدادات التشخيص
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const ENDPOINTS = [
  '/api/upload-image-safe',
  '/api/upload',
  '/api/upload-image'
];

// إنشاء ملف اختبار صغير
function createTestImage() {
  const testImagePath = path.join(__dirname, 'test-image.png');
  
  // صورة PNG صغيرة (1x1 pixel شفاف)
  const pngBuffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
    0x49, 0x48, 0x44, 0x52, // "IHDR"
    0x00, 0x00, 0x00, 0x01, // width = 1
    0x00, 0x00, 0x00, 0x01, // height = 1
    0x08, 0x06, 0x00, 0x00, 0x00, // bit depth = 8, color type = 6 (RGBA), compression = 0, filter = 0, interlace = 0
    0x1F, 0x15, 0xC4, 0x89, // CRC
    0x00, 0x00, 0x00, 0x0A, // IDAT chunk length
    0x49, 0x44, 0x41, 0x54, // "IDAT"
    0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, // compressed data
    0x0D, 0x0A, 0x2D, 0xB4, // CRC
    0x00, 0x00, 0x00, 0x00, // IEND chunk length
    0x49, 0x45, 0x4E, 0x44, // "IEND"
    0xAE, 0x42, 0x60, 0x82  // CRC
  ]);
  
  fs.writeFileSync(testImagePath, pngBuffer);
  return testImagePath;
}

// اختبار endpoint واحد
async function testEndpoint(endpoint, testImagePath) {
  try {
    console.log(`\n🔍 اختبار ${endpoint}...`);
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testImagePath), {
      filename: 'test-image.png',
      contentType: 'image/png'
    });
    formData.append('type', 'general');
    
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      body: formData,
      headers: {
        ...formData.getHeaders()
      }
    });
    
    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { rawResponse: responseText };
    }
    
    console.log(`📊 النتيجة لـ ${endpoint}:`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Headers: ${JSON.stringify(Object.fromEntries(response.headers), null, 2)}`);
    console.log(`   Response: ${JSON.stringify(responseData, null, 2)}`);
    
    return {
      endpoint,
      status: response.status,
      success: response.ok,
      data: responseData,
      headers: Object.fromEntries(response.headers)
    };
    
  } catch (error) {
    console.error(`❌ خطأ في اختبار ${endpoint}:`, error.message);
    return {
      endpoint,
      status: 'ERROR',
      success: false,
      error: error.message,
      data: null
    };
  }
}

// اختبار GET requests للتحقق من حالة الخدمات
async function testGetEndpoint(endpoint) {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET'
    });
    
    const responseData = await response.json();
    
    console.log(`📋 اختبار GET لـ ${endpoint}:`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Data: ${JSON.stringify(responseData, null, 2)}`);
    
    return {
      endpoint,
      status: response.status,
      success: response.ok,
      data: responseData
    };
    
  } catch (error) {
    console.error(`❌ خطأ في GET ${endpoint}:`, error.message);
    return {
      endpoint,
      status: 'ERROR',
      success: false,
      error: error.message
    };
  }
}

// فحص متغيرات البيئة
function checkEnvironmentVariables() {
  console.log('\n🔧 فحص متغيرات البيئة:');
  
  const requiredVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY', 
    'CLOUDINARY_API_SECRET',
    'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME'
  ];
  
  const envStatus = {};
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    envStatus[varName] = {
      exists: !!value,
      length: value ? value.length : 0,
      firstChars: value ? value.substring(0, 4) + '...' : 'N/A'
    };
    
    console.log(`   ${varName}: ${envStatus[varName].exists ? '✅ موجود' : '❌ مفقود'} ${envStatus[varName].exists ? '(' + envStatus[varName].firstChars + ')' : ''}`);
  });
  
  return envStatus;
}

// فحص مجلدات الرفع
function checkUploadDirectories() {
  console.log('\n📁 فحص مجلدات الرفع:');
  
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  const subDirs = ['general', 'articles', 'featured', 'avatar', 'authors'];
  
  const dirStatus = {
    uploadsDir: {
      exists: fs.existsSync(uploadsDir),
      path: uploadsDir
    },
    subDirectories: {}
  };
  
  console.log(`   📂 uploads: ${dirStatus.uploadsDir.exists ? '✅ موجود' : '❌ مفقود'} (${uploadsDir})`);
  
  if (dirStatus.uploadsDir.exists) {
    subDirs.forEach(subDir => {
      const fullPath = path.join(uploadsDir, subDir);
      const exists = fs.existsSync(fullPath);
      dirStatus.subDirectories[subDir] = {
        exists,
        path: fullPath,
        permissions: exists ? (fs.accessSync(fullPath, fs.constants.W_OK) ? 'writable' : 'read-only') : 'N/A'
      };
      
      console.log(`     📁 ${subDir}: ${exists ? '✅ موجود' : '❌ مفقود'}`);
    });
  }
  
  return dirStatus;
}

// التشخيص الشامل
async function runComprehensiveDiagnostics() {
  console.log('🚀 بدء التشخيص الشامل لـ APIs رفع الصور...');
  console.log(`🌐 Base URL: ${BASE_URL}`);
  
  // إنشاء ملف اختبار
  const testImagePath = createTestImage();
  console.log(`📷 تم إنشاء صورة اختبار: ${testImagePath}`);
  
  const results = {
    timestamp: new Date().toISOString(),
    environment: checkEnvironmentVariables(),
    directories: checkUploadDirectories(),
    getTests: [],
    postTests: []
  };
  
  // اختبار GET requests أولاً
  console.log('\n🔍 اختبار GET requests...');
  for (const endpoint of ENDPOINTS) {
    const result = await testGetEndpoint(endpoint);
    results.getTests.push(result);
  }
  
  // اختبار POST requests
  console.log('\n🔍 اختبار POST requests...');
  for (const endpoint of ENDPOINTS) {
    const result = await testEndpoint(endpoint, testImagePath);
    results.postTests.push(result);
  }
  
  // تنظيف ملف الاختبار
  fs.unlinkSync(testImagePath);
  console.log('🧹 تم حذف ملف الاختبار');
  
  // كتابة النتائج
  const reportPath = path.join(__dirname, 'upload-diagnostics-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  
  console.log(`\n📋 تم حفظ تقرير التشخيص: ${reportPath}`);
  
  // ملخص النتائج
  console.log('\n📊 ملخص النتائج:');
  console.log('   GET Tests:');
  results.getTests.forEach(test => {
    console.log(`     ${test.endpoint}: ${test.success ? '✅ نجح' : '❌ فشل'} (${test.status})`);
  });
  
  console.log('   POST Tests:');
  results.postTests.forEach(test => {
    console.log(`     ${test.endpoint}: ${test.success ? '✅ نجح' : '❌ فشل'} (${test.status})`);
  });
  
  // التوصيات
  console.log('\n💡 التوصيات:');
  
  const failedPosts = results.postTests.filter(test => !test.success);
  if (failedPosts.length > 0) {
    console.log('   🔧 يجب إصلاح APIs التالية:');
    failedPosts.forEach(test => {
      console.log(`     - ${test.endpoint}: ${test.error || test.data?.error || 'خطأ غير معروف'}`);
    });
  } else {
    console.log('   ✅ جميع APIs تعمل بشكل صحيح!');
  }
  
  return results;
}

// تشغيل التشخيص إذا تم استدعاء الملف مباشرة
if (require.main === module) {
  runComprehensiveDiagnostics()
    .then(() => {
      console.log('\n✅ اكتمل التشخيص بنجاح');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ خطأ في التشخيص:', error);
      process.exit(1);
    });
}

module.exports = {
  runComprehensiveDiagnostics,
  testEndpoint,
  testGetEndpoint,
  checkEnvironmentVariables,
  checkUploadDirectories
};
