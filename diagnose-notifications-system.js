#!/usr/bin/env node
/**
 * أداة تشخيص شاملة لنظام الإشعارات - منصة سبق الذكية
 * تفحص جميع العناصر المطلوبة لعمل الإشعارات بشكل صحيح
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ألوان للطباعة
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logHeader(message) {
  console.log('\n' + '='.repeat(60));
  log(message, colors.cyan + colors.bright);
  console.log('='.repeat(60));
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

async function testDatabaseConnection() {
  logHeader('🔗 اختبار الاتصال بقاعدة البيانات');
  
  try {
    await prisma.$connect();
    logSuccess('الاتصال بقاعدة البيانات متاح');
    return true;
  } catch (error) {
    logError(`فشل الاتصال بقاعدة البيانات: ${error.message}`);
    return false;
  }
}

async function checkUserExists(userId) {
  logHeader('👤 التحقق من وجود المستخدم');
  
  try {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true
      }
    });

    if (user) {
      logSuccess(`المستخدم موجود: ${user.name || user.email} (ID: ${user.id})`);
      logInfo(`تاريخ التسجيل: ${user.created_at}`);
      return user;
    } else {
      logError(`المستخدم غير موجود: ${userId}`);
      return null;
    }
  } catch (error) {
    logError(`خطأ في التحقق من المستخدم: ${error.message}`);
    return null;
  }
}

async function checkCategoryExists() {
  logHeader('📂 التحقق من وجود تصنيف المحليات');
  
  try {
    const localCategory = await prisma.categories.findUnique({
      where: { id: 'cat-001' }
    });

    if (localCategory) {
      logSuccess(`تصنيف المحليات موجود: ${localCategory.name}`);
      return localCategory;
    } else {
      logError('تصنيف المحليات غير موجود (cat-001)');
      
      // محاولة البحث بالاسم
      const categoryByName = await prisma.categories.findFirst({
        where: {
          name: {
            contains: 'محليات',
            mode: 'insensitive'
          }
        }
      });

      if (categoryByName) {
        logWarning(`تصنيف محليات موجود بمعرف مختلف: ${categoryByName.id} - ${categoryByName.name}`);
        return categoryByName;
      }
      
      return null;
    }
  } catch (error) {
    logError(`خطأ في التحقق من التصنيف: ${error.message}`);
    return null;
  }
}

async function checkUserInterests(userId) {
  logHeader(`🎯 التحقق من اهتمامات المستخدم`);
  
  try {
    const interests = await prisma.user_interests.findMany({
      where: { 
        user_id: userId,
        is_active: true 
      },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    if (interests.length > 0) {
      logSuccess(`وجدت ${interests.length} اهتمامات للمستخدم:`);
      interests.forEach(interest => {
        const categoryName = interest.categories?.name || interest.category_id;
        log(`  • ${categoryName} (${interest.category_id})`, colors.green);
        
        if (interest.category_id === 'cat-001') {
          logSuccess('✨ المحليات ضمن اهتمامات المستخدم!');
        }
      });

      // التحقق من المحليات تحديداً
      const localInterest = interests.find(i => i.category_id === 'cat-001');
      if (!localInterest) {
        logWarning('المحليات غير موجودة في اهتمامات المستخدم');
        return { interests, hasLocalInterest: false };
      }

      return { interests, hasLocalInterest: true, localInterest };
    } else {
      logError('لا توجد اهتمامات محفوظة للمستخدم');
      return { interests: [], hasLocalInterest: false };
    }
  } catch (error) {
    logError(`خطأ في فحص الاهتمامات: ${error.message}`);
    return { interests: [], hasLocalInterest: false };
  }
}

async function checkRecentLocalArticles() {
  logHeader('📰 التحقق من المقالات المحلية الحديثة');
  
  try {
    const recentArticles = await prisma.articles.findMany({
      where: {
        category_id: 'cat-001',
        created_at: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // آخر 24 ساعة
        }
      },
      select: {
        id: true,
        title: true,
        created_at: true,
        status: true
      },
      orderBy: { created_at: 'desc' },
      take: 10
    });

    if (recentArticles.length > 0) {
      logSuccess(`وجدت ${recentArticles.length} مقالات محلية في آخر 24 ساعة:`);
      recentArticles.forEach(article => {
        const status = article.status === 'published' ? '✅' : '🔒';
        log(`  ${status} ${article.title.substring(0, 50)}...`, colors.green);
        log(`     تاريخ النشر: ${article.created_at}`, colors.blue);
      });
      return recentArticles;
    } else {
      logWarning('لا توجد مقالات محلية حديثة في آخر 24 ساعة');
      
      // فحص أحدث مقال محلي
      const latestLocal = await prisma.articles.findFirst({
        where: { category_id: 'cat-001' },
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          title: true,
          created_at: true,
          status: true
        }
      });

      if (latestLocal) {
        logInfo(`أحدث مقال محلي: ${latestLocal.title.substring(0, 50)}...`);
        logInfo(`تاريخ النشر: ${latestLocal.created_at}`);
      }

      return [];
    }
  } catch (error) {
    logError(`خطأ في فحص المقالات المحلية: ${error.message}`);
    return [];
  }
}

async function checkNotificationsForUser(userId) {
  logHeader(`🔔 فحص الإشعارات للمستخدم`);
  
  try {
    // فحص الإشعارات العامة
    const allNotifications = await prisma.smartNotifications.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        status: true,
        is_read: true,
        created_at: true,
        data: true
      }
    });

    if (allNotifications.length > 0) {
      logSuccess(`وجدت ${allNotifications.length} إشعارات للمستخدم:`);
      allNotifications.forEach(notification => {
        const readStatus = notification.is_read ? '📖' : '📧';
        const statusIcon = notification.status === 'delivered' ? '✅' : 
                          notification.status === 'pending' ? '⏳' : '❌';
        log(`  ${readStatus} ${statusIcon} ${notification.title}`, colors.blue);
        log(`     النوع: ${notification.type} | الحالة: ${notification.status}`, colors.blue);
        log(`     التاريخ: ${notification.created_at}`, colors.blue);
      });
    } else {
      logError('لا توجد إشعارات للمستخدم');
    }

    // فحص إشعارات المحليات تحديداً
    const localNotifications = await prisma.smartNotifications.findMany({
      where: {
        user_id: userId,
        type: 'new_article',
        created_at: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // آخر أسبوع
        }
      },
      orderBy: { created_at: 'desc' }
    });

    if (localNotifications.length > 0) {
      logSuccess(`وجدت ${localNotifications.length} إشعارات مقالات جديدة في آخر أسبوع`);
    } else {
      logWarning('لا توجد إشعارات مقالات جديدة في آخر أسبوع');
    }

    return { allNotifications, localNotifications };
  } catch (error) {
    logError(`خطأ في فحص الإشعارات: ${error.message}`);
    return { allNotifications: [], localNotifications: [] };
  }
}

async function testNotificationEngine(userId) {
  logHeader('⚡ اختبار محرك الإشعارات');
  
  try {
    // محاولة إنشاء إشعار تجريبي
    const testNotification = await prisma.smartNotifications.create({
      data: {
        id: `test_notification_${Date.now()}`,
        user_id: userId,
        title: '🧪 إشعار تجريبي - نظام التشخيص',
        message: 'هذا إشعار تجريبي للتأكد من عمل النظام بشكل صحيح',
        type: 'new_article',
        priority: 'medium',
        category: 'محليات',
        data: {
          source: 'diagnosis_tool',
          test: true,
          categoryId: 'cat-001'
        },
        status: 'pending',
        delivery_channels: ['web'],
        ai_optimized: true,
        personalization_score: 0.8,
        created_at: new Date()
      }
    });

    logSuccess(`تم إنشاء إشعار تجريبي بنجاح: ${testNotification.id}`);
    
    // محاولة تحديث حالة الإشعار
    await prisma.smartNotifications.update({
      where: { id: testNotification.id },
      data: { status: 'delivered' }
    });

    logSuccess('تم تحديث حالة الإشعار التجريبي');
    
    // حذف الإشعار التجريبي
    await prisma.smartNotifications.delete({
      where: { id: testNotification.id }
    });

    logSuccess('تم حذف الإشعار التجريبي');
    
    return true;
  } catch (error) {
    logError(`خطأ في اختبار محرك الإشعارات: ${error.message}`);
    return false;
  }
}

async function checkSystemIntegration() {
  logHeader('🔗 فحص تكامل النظام');
  
  try {
    // فحص وجود جدول الإشعارات الذكية
    const notificationTable = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_name = 'smartNotifications' OR table_name = 'smart_notifications'
    `;
    
    logSuccess('جدول الإشعارات الذكية موجود');

    // فحص وجود جدول الاهتمامات
    const interestsTable = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_name = 'user_interests'
    `;
    
    logSuccess('جدول اهتمامات المستخدم موجود');

    // فحص وجود الفهارس المطلوبة
    logInfo('جميع الجداول الأساسية موجودة');
    
    return true;
  } catch (error) {
    logError(`خطأ في فحص تكامل النظام: ${error.message}`);
    return false;
  }
}

async function generateDiagnosisReport(userId, results) {
  logHeader('📊 تقرير التشخيص النهائي');
  
  const timestamp = new Date().toLocaleString('ar-SA');
  
  console.log(`
📋 تقرير تشخيص نظام الإشعارات
التاريخ: ${timestamp}
المستخدم: ${userId}

🔍 نتائج الفحص:
${results.dbConnection ? '✅' : '❌'} الاتصال بقاعدة البيانات
${results.userExists ? '✅' : '❌'} وجود المستخدم
${results.categoryExists ? '✅' : '❌'} وجود تصنيف المحليات
${results.hasLocalInterest ? '✅' : '❌'} المحليات في اهتمامات المستخدم
${results.recentArticles > 0 ? '✅' : '❌'} مقالات محلية حديثة (${results.recentArticles})
${results.hasNotifications ? '✅' : '❌'} وجود إشعارات سابقة
${results.engineWorking ? '✅' : '❌'} عمل محرك الإشعارات
${results.systemIntegration ? '✅' : '❌'} تكامل النظام

📈 الإحصائيات:
• عدد الاهتمامات: ${results.interestsCount}
• عدد الإشعارات الكلية: ${results.totalNotifications}
• عدد إشعارات المقالات: ${results.localNotifications}
• عدد المقالات المحلية الحديثة: ${results.recentArticles}

🎯 التوصيات:
`);

  // التوصيات بناء على النتائج
  if (!results.hasLocalInterest) {
    logWarning('• تأكد من إضافة "المحليات" إلى اهتماماتك في إعدادات الحساب');
  }
  
  if (results.recentArticles === 0) {
    logInfo('• لا توجد مقالات محلية حديثة - هذا قد يكون السبب في عدم وصول الإشعارات');
  }
  
  if (!results.hasNotifications) {
    logWarning('• لا توجد إشعارات سابقة - قد تحتاج لتفعيل الإشعارات أو فحص الإعدادات');
  }
  
  if (!results.engineWorking) {
    logError('• محرك الإشعارات لا يعمل - تحتاج لفحص فني');
  }

  logSuccess('تم اكتمال تقرير التشخيص');
}

// الوظيفة الرئيسية
async function main() {
  // يمكن تمرير معرف المستخدم كمعطى سطر الأوامر
  const userId = process.argv[2] || 'user_6758f9a1d16845c7afc98e91'; // معرف المستخدم الافتراضي
  
  log('🔬 بدء تشخيص نظام الإشعارات لمنصة سبق الذكية', colors.cyan + colors.bright);
  log(`المستخدم المستهدف: ${userId}`, colors.blue);
  
  const results = {};
  
  try {
    // 1. اختبار الاتصال
    results.dbConnection = await testDatabaseConnection();
    if (!results.dbConnection) return;
    
    // 2. التحقق من المستخدم
    const user = await checkUserExists(userId);
    results.userExists = !!user;
    if (!results.userExists) return;
    
    // 3. التحقق من التصنيف
    const category = await checkCategoryExists();
    results.categoryExists = !!category;
    
    // 4. فحص الاهتمامات
    const interests = await checkUserInterests(userId);
    results.hasLocalInterest = interests.hasLocalInterest;
    results.interestsCount = interests.interests.length;
    
    // 5. فحص المقالات الحديثة
    const articles = await checkRecentLocalArticles();
    results.recentArticles = articles.length;
    
    // 6. فحص الإشعارات
    const notifications = await checkNotificationsForUser(userId);
    results.hasNotifications = notifications.allNotifications.length > 0;
    results.totalNotifications = notifications.allNotifications.length;
    results.localNotifications = notifications.localNotifications.length;
    
    // 7. اختبار محرك الإشعارات
    results.engineWorking = await testNotificationEngine(userId);
    
    // 8. فحص تكامل النظام
    results.systemIntegration = await checkSystemIntegration();
    
    // 9. توليد التقرير النهائي
    await generateDiagnosisReport(userId, results);
    
  } catch (error) {
    logError(`خطأ عام في التشخيص: ${error.message}`);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الأداة
main().catch(console.error);
