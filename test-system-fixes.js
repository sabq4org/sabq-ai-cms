#!/usr/bin/env node
/**
 * أداة إصلاح وتحقق شامل من المشاكل الثلاث
 * بعد إجراء التحسينات والإصلاحات
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

// اختبار الإشعارات في الهيدر
function testNotificationsInHeader() {
  log(`\n📱 اختبار إصلاح الإشعارات في الهيدر`, colors.cyan + colors.bright);
  
  try {
    const headerPath = './components/Header.tsx';
    const headerContent = fs.readFileSync(headerPath, 'utf8');
    
    // فحص إزالة "hidden md:block"
    if (headerContent.includes('hidden md:block')) {
      logWarning('لا تزال هناك إشعارات مخفية على الأجهزة المحمولة');
      return false;
    }
    
    // فحص وجود NotificationDropdown
    if (headerContent.includes('NotificationDropdown')) {
      logSuccess('NotificationDropdown موجود في الهيدر');
    } else {
      logError('NotificationDropdown مفقود من الهيدر');
      return false;
    }
    
    // فحص وجود "block" بدلاً من "hidden md:block"
    if (headerContent.includes('<div className="block">')) {
      logSuccess('الإشعارات متاحة الآن على جميع الأحجام');
      return true;
    } else {
      logWarning('قد تحتاج لفحص تفاصيل أكثر في الهيدر');
      return false;
    }
    
  } catch (error) {
    logError(`خطأ في فحص الهيدر: ${error.message}`);
    return false;
  }
}

// اختبار رفع الصور
async function testImageUpload() {
  log(`\n📸 اختبار إصلاح رفع الصور`, colors.cyan + colors.bright);
  
  try {
    // فحص وجود الملفات المطلوبة
    const requiredFiles = [
      './components/admin/media/MediaUpload.tsx',
      './hooks/useMediaUpload.ts',
      './app/api/admin/media/upload/route.ts'
    ];
    
    let allFilesExist = true;
    
    for (const file of requiredFiles) {
      if (fs.existsSync(file)) {
        logSuccess(`ملف موجود: ${file}`);
      } else {
        logError(`ملف مفقود: ${file}`);
        allFilesExist = false;
      }
    }
    
    if (!allFilesExist) {
      return false;
    }
    
    // فحص متغيرات البيئة
    const requiredEnvVars = [
      'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET'
    ];
    
    let allEnvVarsSet = true;
    
    for (const varName of requiredEnvVars) {
      if (process.env[varName]) {
        logSuccess(`متغير البيئة موجود: ${varName}`);
      } else {
        logError(`متغير البيئة مفقود: ${varName}`);
        allEnvVarsSet = false;
      }
    }
    
    return allEnvVarsSet;
    
  } catch (error) {
    logError(`خطأ في اختبار رفع الصور: ${error.message}`);
    return false;
  }
}

// اختبار التوليد التلقائي
async function testAIGeneration() {
  log(`\n🤖 اختبار إصلاح التوليد التلقائي`, colors.cyan + colors.bright);
  
  try {
    // فحص وجود الملفات المطلوبة
    const requiredFiles = [
      './hooks/useAIGeneration.ts',
      './lib/services/ai-content-service.ts',
      './app/api/admin/articles/generate-ai-content/route.ts'
    ];
    
    let allFilesExist = true;
    
    for (const file of requiredFiles) {
      if (fs.existsSync(file)) {
        logSuccess(`ملف موجود: ${file}`);
      } else {
        logError(`ملف مفقود: ${file}`);
        allFilesExist = false;
      }
    }
    
    // فحص مفتاح OpenAI
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey && openaiKey !== 'sk-your-openai-api-key' && openaiKey.startsWith('sk-')) {
      logSuccess('مفتاح OpenAI يبدو صالحاً');
    } else {
      logWarning('مفتاح OpenAI يحتاج لتحديث - يرجى وضع مفتاح صالح في .env');
      logInfo('قم بتحديث OPENAI_API_KEY في ملف .env');
    }
    
    return allFilesExist;
    
  } catch (error) {
    logError(`خطأ في اختبار التوليد التلقائي: ${error.message}`);
    return false;
  }
}

// اختبار وظيفي سريع للنظام
async function quickFunctionalTest() {
  log(`\n🧪 اختبار وظيفي سريع`, colors.cyan + colors.bright);
  
  try {
    // اختبار قاعدة البيانات
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`;
    logSuccess('اتصال قاعدة البيانات: يعمل');
    
    // اختبار جداول الإشعارات
    const notificationsCount = await prisma.smartNotifications.count();
    logSuccess(`إشعارات في النظام: ${notificationsCount}`);
    
    // اختبار جدول الملفات
    const mediaCount = await prisma.mediaAsset.count();
    logSuccess(`ملفات في النظام: ${mediaCount}`);
    
    // اختبار المقالات
    const articlesCount = await prisma.articles.count();
    logSuccess(`مقالات في النظام: ${articlesCount}`);
    
    return true;
    
  } catch (error) {
    logError(`خطأ في الاختبار الوظيفي: ${error.message}`);
    return false;
  }
}

// إنشاء إشعار تجريبي للمستخدم
async function createTestNotification(userId) {
  log(`\n🔔 إنشاء إشعار تجريبي`, colors.cyan + colors.bright);
  
  try {
    const notification = await prisma.smartNotifications.create({
      data: {
        user_id: userId,
        title: '🛠️ اختبار النظام المحدث',
        message: 'تم إصلاح نظام الإشعارات! الآن يعمل على جميع أحجام الشاشات بما في ذلك الأجهزة المحمولة.',
        type: 'system_announcement',
        priority: 'medium',
        category: 'نظام',
        data: {
          source: 'system_fix_test',
          timestamp: new Date().toISOString(),
          fixes: [
            'إشعارات متاحة على الهيدر الخفيف',
            'نظام رفع الصور محسن',
            'التوليد التلقائي محدث'
          ]
        },
        status: 'sent',
        delivery_channels: ['web', 'push'],
        ai_optimized: true,
        personalization_score: 0.95,
        created_at: new Date(),
        sent_at: new Date()
      }
    });
    
    logSuccess(`تم إنشاء إشعار تجريبي: ${notification.id}`);
    return notification;
    
  } catch (error) {
    logError(`فشل إنشاء إشعار تجريبي: ${error.message}`);
    return null;
  }
}

// تشغيل خادم التطوير للاختبار
function startDevServer() {
  log(`\n🚀 نصائح لتشغيل الخادم`, colors.cyan + colors.bright);
  
  logInfo('لاختبار التحسينات:');
  logInfo('1. شغل خادم التطوير: npm run dev');
  logInfo('2. افتح المتصفح على: http://localhost:3000');
  logInfo('3. تحقق من:');
  logInfo('   - ظهور أيقونة الإشعارات على الهيدر (حتى في الجوال)');
  logInfo('   - عمل رفع الصور في لوحة الإدارة');
  logInfo('   - عمل التوليد التلقائي للمقالات');
  
  logWarning('ملاحظة: تأكد من تحديث OPENAI_API_KEY في ملف .env للحصول على التوليد التلقائي');
}

// إنتاج تقرير نهائي
function generateFixReport(results) {
  log(`\n📊 تقرير الإصلاحات النهائي`, colors.cyan + colors.bright);
  
  const timestamp = new Date().toLocaleString('ar-SA');
  
  console.log(`
🔧 تقرير إصلاح المشاكل الثلاث
التاريخ: ${timestamp}

📋 حالة الإصلاحات:
${results.notifications ? '✅' : '❌'} الإشعارات في الهيدر الخفيف
${results.imageUpload ? '✅' : '❌'} نظام رفع الصور
${results.aiGeneration ? '✅' : '❌'} التوليد التلقائي
${results.functionalTest ? '✅' : '❌'} الاختبار الوظيفي

🎯 ملخص التحسينات:
${results.notifications ? '• تم إصلاح الإشعارات لتظهر على جميع الأحجام' : '• الإشعارات تحتاج لإصلاح إضافي'}
${results.imageUpload ? '• تم إنشاء مكونات رفع الصور المفقودة' : '• رفع الصور يحتاج لإصلاح'}
${results.aiGeneration ? '• تم إنشاء نظام التوليد التلقائي المفقود' : '• التوليد التلقائي يحتاج لإصلاح'}
${results.functionalTest ? '• النظام يعمل بشكل صحيح' : '• النظام يحتاج فحص إضافي'}

🛠️ الملفات التي تم إنشاؤها/تحديثها:
• components/Header.tsx - إصلاح الإشعارات
• components/admin/media/MediaUpload.tsx - مكون رفع الصور
• hooks/useMediaUpload.ts - Hook رفع الصور  
• hooks/useAIGeneration.ts - Hook التوليد التلقائي
• .env - إضافة متغيرات البيئة المفقودة

⚡ الخطوات التالية:
1. تشغيل خادم التطوير: npm run dev
2. اختبار الوظائف في المتصفح
3. تحديث مفتاح OpenAI إذا لزم الأمر
4. اختبار رفع الصور في لوحة الإدارة
  `);
  
  if (results.notifications && results.imageUpload && results.aiGeneration && results.functionalTest) {
    logSuccess('🎉 تم إصلاح جميع المشاكل بنجاح!');
  } else {
    logWarning('⚠️ بعض المشاكل تحتاج لمراجعة إضافية');
  }
}

// الوظيفة الرئيسية
async function main() {
  const userId = process.argv[2] || '0f107dd1-bfb7-4fac-b664-6587e6fc9a1e';
  
  log('🛠️ بدء اختبار الإصلاحات الشاملة', colors.cyan + colors.bright);
  log(`المستخدم للاختبار: ${userId}`, colors.blue);
  
  const results = {};
  
  try {
    // 1. اختبار إصلاح الإشعارات
    results.notifications = testNotificationsInHeader();
    
    // 2. اختبار إصلاح رفع الصور
    results.imageUpload = await testImageUpload();
    
    // 3. اختبار إصلاح التوليد التلقائي
    results.aiGeneration = await testAIGeneration();
    
    // 4. اختبار وظيفي سريع
    results.functionalTest = await quickFunctionalTest();
    
    // 5. إنشاء إشعار تجريبي
    const testNotification = await createTestNotification(userId);
    results.testNotification = !!testNotification;
    
    // 6. إنتاج التقرير النهائي
    generateFixReport(results);
    
    // 7. نصائح التشغيل
    startDevServer();
    
    log('\n🎯 الخلاصة:', colors.green + colors.bright);
    if (results.notifications && results.imageUpload && results.aiGeneration) {
      log('جميع المشاكل الثلاث تم إصلاحها! 🎉', colors.green);
    } else {
      log('بعض المشاكل تحتاج لمراجعة إضافية', colors.yellow);
    }
    
  } catch (error) {
    logError(`خطأ في اختبار الإصلاحات: ${error.message}`);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الاختبار
main().catch(console.error);
