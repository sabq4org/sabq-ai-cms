#!/usr/bin/env node
/**
 * أداة تشخيص المشاكل الثلاث في النظام:
 * 1. نظام الإشعارات مفقود في الهيدر الخفيف
 * 2. مشكلة رفع الصور  
 * 3. مشكلة التوليد التلقائي
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

// فحص وجود ملف
function checkFileExists(filePath, description) {
  const fullPath = path.resolve(filePath);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    logSuccess(`${description}: موجود`);
    return { exists: true, path: fullPath };
  } else {
    logError(`${description}: مفقود - ${fullPath}`);
    return { exists: false, path: fullPath };
  }
}

// فحص محتوى ملف
function checkFileContent(filePath, searchTerms, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const results = {};
    
    searchTerms.forEach(term => {
      const found = content.includes(term);
      results[term] = found;
      
      if (found) {
        logSuccess(`${description} - يحتوي على: ${term}`);
      } else {
        logWarning(`${description} - لا يحتوي على: ${term}`);
      }
    });
    
    return { content, results, size: content.length };
  } catch (error) {
    logError(`فشل في قراءة ${filePath}: ${error.message}`);
    return { content: null, results: {}, size: 0 };
  }
}

// فحص متغيرات البيئة
function checkEnvironmentVariables(required, description) {
  log(`\n🔧 فحص متغيرات البيئة: ${description}`, colors.cyan + colors.bright);
  
  const results = {};
  let allPresent = true;
  
  required.forEach(varName => {
    const value = process.env[varName];
    const exists = !!value;
    
    results[varName] = {
      exists,
      length: value ? value.length : 0,
      masked: value ? `${value.substring(0, 4)}...` : 'غير متوفر'
    };
    
    if (exists) {
      logSuccess(`${varName}: متوفر (${value.length} حرف)`);
    } else {
      logError(`${varName}: مفقود`);
      allPresent = false;
    }
  });
  
  return { results, allPresent };
}

// اختبار الاتصال بقاعدة البيانات
async function testDatabaseConnection() {
  log(`\n🗄️  اختبار الاتصال بقاعدة البيانات`, colors.cyan + colors.bright);
  
  try {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    logSuccess('الاتصال بقاعدة البيانات: نجح');
    
    // فحص الجداول المطلوبة
    const tables = [
      'smartNotifications',
      'users', 
      'mediaAsset',
      'articles',
      'categories'
    ];
    
    for (const table of tables) {
      try {
        const count = await prisma[table].count();
        logSuccess(`جدول ${table}: ${count} سجل`);
      } catch (error) {
        logError(`جدول ${table}: خطأ - ${error.message}`);
      }
    }
    
    return true;
  } catch (error) {
    logError(`فشل الاتصال بقاعدة البيانات: ${error.message}`);
    return false;
  }
}

// اختبار Cloudinary
async function testCloudinaryConnection() {
  log(`\n☁️  اختبار اتصال Cloudinary`, colors.cyan + colors.bright);
  
  const requiredVars = [
    'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY', 
    'CLOUDINARY_API_SECRET'
  ];
  
  const envCheck = checkEnvironmentVariables(requiredVars, 'Cloudinary');
  
  if (!envCheck.allPresent) {
    logError('إعدادات Cloudinary غير مكتملة');
    return false;
  }
  
  try {
    // محاولة إجراء طلب اختبار بسيط
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
    const testUrl = `https://res.cloudinary.com/${cloudName}/image/upload/sample.jpg`;
    
    const response = await fetch(testUrl);
    
    if (response.ok) {
      logSuccess('اتصال Cloudinary: نجح');
      return true;
    } else {
      logWarning(`اتصال Cloudinary: استجابة ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`فشل اختبار Cloudinary: ${error.message}`);
    return false;
  }
}

// اختبار OpenAI للتوليد التلقائي
async function testOpenAIConnection() {
  log(`\n🤖 اختبار اتصال OpenAI`, colors.cyan + colors.bright);
  
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    logError('OPENAI_API_KEY غير متوفر');
    return false;
  }
  
  logSuccess(`OPENAI_API_KEY: متوفر (${apiKey.length} حرف)`);
  
  try {
    // اختبار بسيط لـ OpenAI API
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      logSuccess(`اتصال OpenAI: نجح (${data.data?.length || 0} نماذج متاحة)`);
      return true;
    } else {
      logError(`اتصال OpenAI: فشل - ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    logError(`فشل اختبار OpenAI: ${error.message}`);
    return false;
  }
}

// فحص ملفات الهيدر والإشعارات
function diagnoseLightHeader() {
  log(`\n📱 فحص مشكلة الهيدر الخفيف والإشعارات`, colors.cyan + colors.bright);
  
  // فحص ملفات الهيدر
  const headerFiles = [
    './components/Header.tsx',
    './components/mobile/Header.tsx',
    './components/LightHeader.tsx',
    './components/mobile/LightHeader.tsx'
  ];
  
  const existingHeaders = [];
  
  headerFiles.forEach(file => {
    const check = checkFileExists(file, `هيدر: ${file}`);
    if (check.exists) {
      existingHeaders.push(check.path);
    }
  });
  
  // فحص مكونات الإشعارات
  const notificationFiles = [
    './components/Notifications/NotificationBell.tsx',
    './components/Notifications/NotificationDropdown.tsx',
    './hooks/useSmartNotifications.ts'
  ];
  
  notificationFiles.forEach(file => {
    const check = checkFileExists(file, `إشعارات: ${file}`);
    if (check.exists) {
      // فحص محتوى الملف
      checkFileContent(check.path, [
        'NotificationDropdown',
        'NotificationBell', 
        'useSmartNotifications',
        'hidden md:block',
        'md:flex'
      ], `محتوى ${file}`);
    }
  });
  
  return { existingHeaders, diagnostics: 'completed' };
}

// فحص مشكلة رفع الصور
function diagnoseImageUpload() {
  log(`\n📸 فحص مشكلة رفع الصور`, colors.cyan + colors.bright);
  
  const uploadFiles = [
    './app/api/admin/media/upload/route.ts',
    './app/api/admin/media/assets/route.ts',
    './components/admin/media/MediaUpload.tsx',
    './hooks/useMediaUpload.ts'
  ];
  
  uploadFiles.forEach(file => {
    const check = checkFileExists(file, `رفع الصور: ${file}`);
    if (check.exists) {
      checkFileContent(check.path, [
        'cloudinary',
        'upload',
        'Content-Type',
        'application/json',
        'multipart/form-data',
        'base64'
      ], `محتوى ${file}`);
    }
  });
}

// فحص مشكلة التوليد التلقائي
function diagnoseAIGeneration() {
  log(`\n🤖 فحص مشكلة التوليد التلقائي`, colors.cyan + colors.bright);
  
  const aiFiles = [
    './app/api/admin/articles/generate-ai-content/route.ts',
    './app/api/ai/generate-metadata/route.ts',
    './lib/services/ai-content-service.ts',
    './hooks/useAIGeneration.ts'
  ];
  
  aiFiles.forEach(file => {
    const check = checkFileExists(file, `توليد ذكي: ${file}`);
    if (check.exists) {
      checkFileContent(check.path, [
        'OpenAI',
        'generateAllAIContent',
        'summary',
        'quotes',
        'tags',
        'readingTime'
      ], `محتوى ${file}`);
    }
  });
}

// إجراء اختبار API
async function testAPI(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`http://localhost:3000${endpoint}`, options);
    
    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      data: response.ok ? await response.json().catch(() => null) : null
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// الاختبارات الشاملة
async function runComprehensiveTests() {
  log(`\n🧪 اختبار APIs الأساسية`, colors.cyan + colors.bright);
  
  const apiTests = [
    { endpoint: '/api/notifications/feed', description: 'API الإشعارات' },
    { 
      endpoint: '/api/admin/articles/generate-ai-content', 
      method: 'POST',
      body: { 
        title: 'اختبار التوليد',
        content: 'هذا محتوى اختباري للتحقق من عمل نظام التوليد التلقائي الذكي. يجب أن يكون النص طويلاً بما فيه الكفاية لإجراء التوليد بنجاح.'
      },
      description: 'API التوليد التلقائي' 
    }
  ];
  
  for (const test of apiTests) {
    const result = await testAPI(test.endpoint, test.method, test.body);
    
    if (result.success) {
      logSuccess(`${test.description}: يعمل بنجاح`);
    } else if (result.error) {
      logError(`${test.description}: خطأ في الاتصال - ${result.error}`);
    } else {
      logWarning(`${test.description}: خطأ HTTP ${result.status} - ${result.statusText}`);
    }
  }
}

// إنتاج تقرير شامل
async function generateReport(diagnostics) {
  log(`\n📊 تقرير التشخيص الشامل`, colors.cyan + colors.bright);
  
  const timestamp = new Date().toLocaleString('ar-SA');
  
  const report = {
    timestamp,
    summary: {
      lightHeaderIssue: diagnostics.lightHeader ? 'تم الفحص' : 'مطلوب فحص',
      imageUploadIssue: diagnostics.imageUpload ? 'تم الفحص' : 'مطلوب فحص',
      aiGenerationIssue: diagnostics.aiGeneration ? 'تم الفحص' : 'مطلوب فحص',
      databaseConnection: diagnostics.database || false,
      cloudinaryConnection: diagnostics.cloudinary || false,
      openaiConnection: diagnostics.openai || false
    },
    recommendations: []
  };
  
  console.log(`\n🎯 تقرير التشخيص النهائي`);
  console.log(`التاريخ: ${timestamp}`);
  console.log(`\n📋 ملخص المشاكل:`);
  
  // التوصيات
  if (!diagnostics.database) {
    report.recommendations.push('إصلاح اتصال قاعدة البيانات');
    logError('قاعدة البيانات: تحتاج لإصلاح');
  }
  
  if (!diagnostics.cloudinary) {
    report.recommendations.push('إعادة ضبط إعدادات Cloudinary لرفع الصور');
    logError('Cloudinary: تحتاج لإصلاح');
  }
  
  if (!diagnostics.openai) {
    report.recommendations.push('إعادة ضبط إعدادات OpenAI للتوليد التلقائي');
    logError('OpenAI: تحتاج لإصلاح');
  }
  
  // حفظ التقرير
  const reportFile = `./diagnostic-report-${Date.now()}.json`;
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  logSuccess(`تم حفظ التقرير في: ${reportFile}`);
  
  return report;
}

// الوظيفة الرئيسية
async function main() {
  log('🔍 بدء التشخيص الشامل للمشاكل الثلاث', colors.cyan + colors.bright);
  
  const diagnostics = {};
  
  try {
    // 1. فحص الهيدر الخفيف والإشعارات
    diagnostics.lightHeader = diagnoseLightHeader();
    
    // 2. فحص رفع الصور  
    diagnostics.imageUpload = diagnoseImageUpload();
    
    // 3. فحص التوليد التلقائي
    diagnostics.aiGeneration = diagnoseAIGeneration();
    
    // 4. اختبار قاعدة البيانات
    diagnostics.database = await testDatabaseConnection();
    
    // 5. اختبار Cloudinary
    diagnostics.cloudinary = await testCloudinaryConnection();
    
    // 6. اختبار OpenAI
    diagnostics.openai = await testOpenAIConnection();
    
    // 7. اختبارات API
    await runComprehensiveTests();
    
    // 8. إنتاج التقرير
    const report = await generateReport(diagnostics);
    
    log('\n🎉 التشخيص مكتمل!', colors.green + colors.bright);
    
  } catch (error) {
    logError(`خطأ في التشخيص: ${error.message}`);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل التشخيص
main().catch(console.error);
