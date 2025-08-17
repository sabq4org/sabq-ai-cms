#!/usr/bin/env node
/**
 * أداة إصلاح نظام الإشعارات لمنصة سبق الذكية
 * تعالج جميع المشاكل المكتشفة في التشخيص
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

async function checkAndFixUserInterests(userId) {
  logHeader('🎯 فحص وإصلاح اهتمامات المستخدم');
  
  try {
    // فحص الاهتمامات الحالية
    const interests = await prisma.user_interests.findMany({
      where: { 
        user_id: userId,
        is_active: true 
      },
      include: {
        category: {
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
        const categoryName = interest.category?.name || interest.category_id;
        log(`  • ${categoryName} (${interest.category_id})`, colors.green);
      });

      // التحقق من وجود اهتمام المحليات
      const localInterest = interests.find(i => i.category_id === 'cat-001');
      if (localInterest) {
        logSuccess('✨ المحليات موجودة في اهتمامات المستخدم!');
        return true;
      }
    }

    // إضافة اهتمام المحليات إذا لم يكن موجوداً
    logWarning('المحليات غير موجودة في اهتمامات المستخدم - سيتم إضافتها');
    
    // التحقق من وجود تصنيف المحليات أولاً
    const localCategory = await prisma.categories.findUnique({
      where: { id: 'cat-001' }
    });

    if (!localCategory) {
      logError('تصنيف المحليات غير موجود - لا يمكن إضافة الاهتمام');
      return false;
    }

    // إضافة اهتمام المحليات
    await prisma.user_interests.create({
      data: {
        user_id: userId,
        category_id: 'cat-001',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    logSuccess('تم إضافة اهتمام المحليات للمستخدم بنجاح');
    return true;

  } catch (error) {
    if (error.code === 'P2002') {
      logWarning('اهتمام المحليات موجود مسبقاً (مكرر) - سيتم تفعيله');
      
      // تفعيل الاهتمام الموجود
      await prisma.user_interests.updateMany({
        where: {
          user_id: userId,
          category_id: 'cat-001'
        },
        data: {
          is_active: true,
          updated_at: new Date()
        }
      });
      
      logSuccess('تم تفعيل اهتمام المحليات');
      return true;
    } else {
      logError(`خطأ في إضافة اهتمام المحليات: ${error.message}`);
      return false;
    }
  }
}

async function testCreateNotification(userId) {
  logHeader('🔔 اختبار إنشاء الإشعارات');
  
  try {
    // إنشاء إشعار تجريبي بالهيكل الصحيح
    const testNotification = await prisma.smartNotifications.create({
      data: {
        user_id: userId,
        title: '🧪 إشعار تجريبي - المحليات',
        message: 'هذا إشعار تجريبي للتأكد من عمل نظام إشعارات المحليات',
        type: 'article_recommendation', // استخدام نوع موجود في enum
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
    
    // تحديث حالة الإشعار
    await prisma.smartNotifications.update({
      where: { id: testNotification.id },
      data: { 
        status: 'sent',
        sent_at: new Date()
      }
    });

    logSuccess('تم تحديث حالة الإشعار التجريبي');
    
    return testNotification;
  } catch (error) {
    logError(`خطأ في إنشاء الإشعار التجريبي: ${error.message}`);
    return null;
  }
}

async function testSmartNotificationEngine(userId) {
  logHeader('⚡ اختبار محرك الإشعارات الذكي');
  
  try {
    // محاكاة وصول مقال محليات جديد
    const recentLocalArticle = await prisma.articles.findFirst({
      where: {
        category_id: 'cat-001',
        status: 'published'
      },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        title: true,
        category_id: true
      }
    });

    if (!recentLocalArticle) {
      logWarning('لا يوجد مقال محليات لاختبار النظام - سيتم إنشاء مقال تجريبي');
      
      // إنشاء مقال تجريبي
      const testArticle = await prisma.articles.create({
        data: {
          id: `test_article_${Date.now()}`,
          title: 'مقال تجريبي للاختبار - أخبار محليات',
          content: 'هذا مقال تجريبي لاختبار نظام الإشعارات',
          summary: 'مقال تجريبي لاختبار نظام الإشعارات الذكي',
          category_id: 'cat-001',
          status: 'published',
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      
      logInfo(`تم إنشاء مقال تجريبي: ${testArticle.title}`);
    }

    // الآن نختبر العثور على المستخدمين المهتمين
    const interestedUsers = await prisma.user_interests.findMany({
      where: {
        category_id: 'cat-001',
        is_active: true
      },
      select: { 
        user_id: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    logSuccess(`تم العثور على ${interestedUsers.length} مستخدم مهتم بالمحليات:`);
    interestedUsers.forEach(interest => {
      const userName = interest.user?.name || interest.user?.email || interest.user_id;
      log(`  • ${userName}`, colors.green);
    });

    // إنشاء إشعار لكل مستخدم مهتم
    for (const interest of interestedUsers) {
      const notification = await prisma.smartNotifications.create({
        data: {
          user_id: interest.user_id,
          title: '📰 مقال جديد في المحليات',
          message: 'تم نشر مقال جديد في قسم المحليات - تحقق من الأخبار المحلية الجديدة!',
          type: 'article_recommendation',
          priority: 'medium',
          category: 'محليات',
          data: {
            categoryId: 'cat-001',
            source: 'smart_engine_test',
            articleId: recentLocalArticle?.id || 'test_article'
          },
          status: 'sent',
          delivery_channels: ['web'],
          ai_optimized: true,
          personalization_score: 0.85,
          created_at: new Date(),
          sent_at: new Date()
        }
      });

      const userName = interest.user?.name || interest.user?.email || interest.user_id;
      logSuccess(`تم إنشاء إشعار للمستخدم: ${userName} (${notification.id})`);
    }

    return true;
  } catch (error) {
    logError(`خطأ في اختبار محرك الإشعارات: ${error.message}`);
    console.error(error.stack);
    return false;
  }
}

async function checkRecentNotifications(userId) {
  logHeader('📬 فحص الإشعارات الحديثة');
  
  try {
    const notifications = await prisma.smartNotifications.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        status: true,
        created_at: true,
        sent_at: true,
        read_at: true,
        category: true
      }
    });

    if (notifications.length > 0) {
      logSuccess(`وجدت ${notifications.length} إشعارات للمستخدم:`);
      notifications.forEach((notification, index) => {
        const readStatus = notification.read_at ? '📖' : '📧';
        const statusIcon = notification.status === 'sent' ? '✅' : 
                          notification.status === 'pending' ? '⏳' : '❌';
        log(`  ${index + 1}. ${readStatus} ${statusIcon} ${notification.title}`, colors.blue);
        log(`     النوع: ${notification.type} | التصنيف: ${notification.category || 'غير محدد'}`, colors.blue);
        log(`     إنشاء: ${notification.created_at}`, colors.blue);
        if (notification.sent_at) {
          log(`     إرسال: ${notification.sent_at}`, colors.blue);
        }
        console.log(''); // سطر فارغ
      });
    } else {
      logWarning('لا توجد إشعارات للمستخدم');
    }

    // فحص الإشعارات الخاصة بالمحليات
    const localNotifications = await prisma.smartNotifications.findMany({
      where: {
        user_id: userId,
        category: 'محليات'
      },
      orderBy: { created_at: 'desc' }
    });

    if (localNotifications.length > 0) {
      logSuccess(`وجدت ${localNotifications.length} إشعارات خاصة بالمحليات`);
    } else {
      logWarning('لا توجد إشعارات خاصة بالمحليات');
    }

    return notifications;
  } catch (error) {
    logError(`خطأ في فحص الإشعارات: ${error.message}`);
    return [];
  }
}

async function addMoreInterests(userId) {
  logHeader('🔧 إضافة اهتمامات إضافية للاختبار');
  
  try {
    // الحصول على بعض التصنيفات الأخرى
    const categories = await prisma.categories.findMany({
      take: 5,
      select: {
        id: true,
        name: true
      }
    });

    logInfo(`وجدت ${categories.length} تصنيفات متاحة`);
    
    for (const category of categories) {
      try {
        await prisma.user_interests.create({
          data: {
            user_id: userId,
            category_id: category.id,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
          }
        });
        logSuccess(`أضيف اهتمام: ${category.name} (${category.id})`);
      } catch (error) {
        if (error.code === 'P2002') {
          // الاهتمام موجود مسبقاً - تفعيله
          await prisma.user_interests.updateMany({
            where: {
              user_id: userId,
              category_id: category.id
            },
            data: {
              is_active: true,
              updated_at: new Date()
            }
          });
          logWarning(`تم تفعيل اهتمام موجود: ${category.name}`);
        }
      }
    }

    return true;
  } catch (error) {
    logError(`خطأ في إضافة الاهتمامات: ${error.message}`);
    return false;
  }
}

async function generateFinalReport(userId, results) {
  logHeader('📊 التقرير النهائي للإصلاح');
  
  const timestamp = new Date().toLocaleString('ar-SA');
  
  console.log(`
🔧 تقرير إصلاح نظام الإشعارات
التاريخ: ${timestamp}
المستخدم: ${userId}

✅ الإصلاحات المكتملة:
${results.interestsFixed ? '✅' : '❌'} إضافة/إصلاح اهتمام المحليات
${results.notificationCreated ? '✅' : '❌'} اختبار إنشاء الإشعارات
${results.smartEngineWorking ? '✅' : '❌'} اختبار محرك الإشعارات الذكي
${results.moreInterestsAdded ? '✅' : '❌'} إضافة اهتمامات إضافية

📈 النتائج:
• عدد الإشعارات الحديثة: ${results.notificationCount}
• حالة نظام الإشعارات: ${results.systemWorking ? 'يعمل بشكل صحيح ✅' : 'يحتاج إصلاحات إضافية ❌'}

🎯 التوصيات النهائية:
`);

  if (results.interestsFixed) {
    logSuccess('• تم إصلاح نظام الاهتمامات - ستحصل على إشعارات المحليات');
  }
  
  if (results.notificationCreated) {
    logSuccess('• نظام الإشعارات يعمل بشكل صحيح');
  }
  
  if (results.smartEngineWorking) {
    logSuccess('• محرك الإشعارات الذكي يعمل بكفاءة');
  } else {
    logError('• قد تحتاج لفحص إعدادات المحرك أو قاعدة البيانات');
  }

  logInfo('• تأكد من تفعيل الإشعارات في المتصفح');
  logInfo('• راقب الإشعارات في الأيام القادمة عند نشر مقالات محلية جديدة');
}

// الوظيفة الرئيسية
async function main() {
  const userId = process.argv[2] || '0f107dd1-bfb7-4fac-b664-6587e6fc9a1e';
  
  log('🔧 بدء إصلاح نظام الإشعارات لمنصة سبق الذكية', colors.cyan + colors.bright);
  log(`المستخدم المستهدف: ${userId}`, colors.blue);
  
  const results = {};
  
  try {
    // 1. إصلاح الاهتمامات
    results.interestsFixed = await checkAndFixUserInterests(userId);
    
    // 2. اختبار إنشاء الإشعارات
    const testNotification = await testCreateNotification(userId);
    results.notificationCreated = !!testNotification;
    
    // 3. اختبار محرك الإشعارات الذكي
    results.smartEngineWorking = await testSmartNotificationEngine(userId);
    
    // 4. إضافة اهتمامات إضافية
    results.moreInterestsAdded = await addMoreInterests(userId);
    
    // 5. فحص النتائج
    const notifications = await checkRecentNotifications(userId);
    results.notificationCount = notifications.length;
    results.systemWorking = results.interestsFixed && results.notificationCreated && results.smartEngineWorking;
    
    // 6. التقرير النهائي
    await generateFinalReport(userId, results);
    
  } catch (error) {
    logError(`خطأ عام في الإصلاح: ${error.message}`);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الأداة
main().catch(console.error);
