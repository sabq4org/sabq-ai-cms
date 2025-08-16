#!/usr/bin/env node

/**
 * Script لنشر الأخبار المجدولة يدوياً
 * يمكن استخدامه للاختبار أو التشغيل المحلي
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function publishScheduledNews() {
  console.log('🚀 بدء نشر الأخبار المجدولة...\n');
  
  const now = new Date();
  console.log(`🕐 الوقت الحالي: ${now.toISOString()}`);
  console.log(`📅 الوقت المحلي: ${now.toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}\n`);

  try {
    // البحث عن الأخبار المجدولة
    const scheduledArticles = await prisma.articles.findMany({
      where: {
        status: 'scheduled',
        scheduled_for: {
          lte: now
        }
      },
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        },
        categories: {
          select: {
            name: true,
            slug: true
          }
        }
      },
      orderBy: {
        scheduled_for: 'asc'
      }
    });

    if (scheduledArticles.length === 0) {
      console.log('✅ لا توجد أخبار مجدولة للنشر في الوقت الحالي');
      
      // عرض الأخبار المجدولة في المستقبل
      const futureScheduled = await prisma.articles.findMany({
        where: {
          status: 'scheduled',
          scheduled_for: {
            gt: now
          }
        },
        select: {
          id: true,
          title: true,
          scheduled_for: true
        },
        orderBy: {
          scheduled_for: 'asc'
        },
        take: 5
      });

      if (futureScheduled.length > 0) {
        console.log(`\n📅 الأخبار المجدولة في المستقبل (${futureScheduled.length}):`);
        futureScheduled.forEach((article, index) => {
          console.log(`${index + 1}. "${article.title}"`);
          console.log(`   📅 مجدول لـ: ${article.scheduled_for?.toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}`);
          console.log(`   🆔 ID: ${article.id}\n`);
        });
      }
      
      return;
    }

    console.log(`📰 تم العثور على ${scheduledArticles.length} خبر مجدول للنشر:\n`);

    // عرض قائمة الأخبار قبل النشر
    scheduledArticles.forEach((article, index) => {
      console.log(`${index + 1}. "${article.title}"`);
      console.log(`   👤 الكاتب: ${article.author?.name || 'غير محدد'}`);
      console.log(`   📂 التصنيف: ${article.categories?.name || 'بدون تصنيف'}`);
      console.log(`   📅 مجدول لـ: ${article.scheduled_for?.toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}`);
      console.log(`   🆔 ID: ${article.id}\n`);
    });

    // طلب تأكيد (في وضع التفاعل)
    if (process.argv.includes('--interactive')) {
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const confirm = await new Promise((resolve) => {
        rl.question('هل تريد متابعة النشر؟ (y/N): ', (answer) => {
          rl.close();
          resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
        });
      });

      if (!confirm) {
        console.log('❌ تم إلغاء العملية');
        return;
      }
    }

    let publishedCount = 0;
    let failedCount = 0;

    console.log('🔄 بدء عملية النشر...\n');

    // نشر كل خبر
    for (const article of scheduledArticles) {
      try {
        console.log(`📝 نشر: "${article.title}"`);

        // تحديث الخبر
        await prisma.articles.update({
          where: { id: article.id },
          data: {
            status: 'published',
            published_at: now,
            updated_at: now
          }
        });

        // تسجيل النشاط
        await prisma.activity_logs.create({
          data: {
            id: `manual_publish_${article.id}_${Date.now()}`,
            user_id: article.author_id || 'system',
            action: 'manual_publish_scheduled',
            entity_type: 'article',
            entity_id: article.id,
            details: JSON.stringify({
              title: article.title,
              scheduled_for: article.scheduled_for,
              published_at: now,
              manual_publish: true,
              script_execution: true
            }),
            ip_address: '127.0.0.1',
            user_agent: 'Local-Script/1.0',
            timestamp: now
          }
        });

        publishedCount++;
        console.log(`   ✅ تم النشر بنجاح`);

      } catch (error) {
        failedCount++;
        console.log(`   ❌ فشل النشر: ${error.message}`);
        
        // تسجيل الخطأ
        try {
          await prisma.activity_logs.create({
            data: {
              id: `manual_publish_error_${article.id}_${Date.now()}`,
              user_id: article.author_id || 'system',
              action: 'manual_publish_error',
              entity_type: 'article',
              entity_id: article.id,
              details: JSON.stringify({
                title: article.title,
                scheduled_for: article.scheduled_for,
                error: error.message,
                attempted_at: now,
                script_execution: true
              }),
              ip_address: '127.0.0.1',
              user_agent: 'Local-Script/1.0',
              timestamp: now
            }
          });
        } catch (logError) {
          console.warn(`⚠️ فشل تسجيل الخطأ: ${logError.message}`);
        }
      }
    }

    // التقرير النهائي
    console.log('\n📊 النتائج النهائية:');
    console.log(`   ✅ تم النشر: ${publishedCount}`);
    console.log(`   ❌ فشل: ${failedCount}`);
    console.log(`   📄 المجموع: ${scheduledArticles.length}`);

    if (publishedCount > 0) {
      console.log('\n🎉 تم نشر الأخبار بنجاح!');
      console.log('💡 يمكنك مراجعة النتائج في لوحة الإدارة');
    }

  } catch (error) {
    console.error('\n❌ خطأ في تنفيذ Script:', error);
    console.error('تفاصيل الخطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// معلومات الاستخدام
function showUsage() {
  console.log('📖 استخدام Script نشر الأخبار المجدولة:\n');
  console.log('الاستخدام العادي:');
  console.log('  node scripts/publish-scheduled.js\n');
  console.log('الاستخدام التفاعلي (مع تأكيد):');
  console.log('  node scripts/publish-scheduled.js --interactive\n');
  console.log('عرض المساعدة:');
  console.log('  node scripts/publish-scheduled.js --help\n');
  console.log('🔧 يمكن أيضاً إضافة هذا لـ cron job:');
  console.log('  # كل دقيقة');
  console.log('  * * * * * cd /path/to/project && node scripts/publish-scheduled.js');
  console.log('  # كل 5 دقائق');
  console.log('  */5 * * * * cd /path/to/project && node scripts/publish-scheduled.js');
}

// فحص المعاملات
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showUsage();
  process.exit(0);
}

// تشغيل Script
publishScheduledNews()
  .then(() => {
    console.log('\n✨ انتهى Script بنجاح');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 خطأ حرج:', error);
    process.exit(1);
  });
