#!/usr/bin/env node

/**
 * أداة تشخيص مشاكل الأخبار المجدولة
 * تفحص قاعدة البيانات وتعرض تقريراً مفصلاً
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnoseScheduledNews() {
  console.log('🔍 أداة تشخيص الأخبار المجدولة\n');
  console.log('=' .repeat(50));
  
  const now = new Date();
  console.log(`🕐 الوقت الحالي: ${now.toISOString()}`);
  console.log(`📅 الوقت المحلي: ${now.toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}\n`);

  try {
    // 1. إحصائيات عامة
    console.log('📊 الإحصائيات العامة:');
    console.log('-'.repeat(30));

    const stats = await prisma.articles.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    stats.forEach(stat => {
      const statusLabel = {
        'published': 'منشور',
        'draft': 'مسودة', 
        'scheduled': 'مجدول',
        'archived': 'مؤرشف',
        'deleted': 'محذوف'
      }[stat.status] || stat.status;
      
      console.log(`   ${statusLabel}: ${stat._count.status}`);
    });

    // 2. الأخبار المجدولة - التحليل التفصيلي
    console.log('\n🗓️ تحليل الأخبار المجدولة:');
    console.log('-'.repeat(40));

    const allScheduled = await prisma.articles.findMany({
      where: {
        status: 'scheduled'
      },
      select: {
        id: true,
        title: true,
        scheduled_for: true,
        created_at: true,
        updated_at: true,
        author: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        scheduled_for: 'asc'
      }
    });

    // تصنيف حسب الوقت
    const overdue = [];
    const upcoming = [];
    const invalid = [];

    if (allScheduled.length === 0) {
      console.log('   ✅ لا توجد أخبار مجدولة حالياً');
    } else {
      console.log(`   📄 المجموع: ${allScheduled.length} خبر مجدول\n`);

      allScheduled.forEach(article => {
        if (!article.scheduled_for) {
          invalid.push(article);
        } else if (article.scheduled_for <= now) {
          overdue.push(article);
        } else {
          upcoming.push(article);
        }
      });

      // الأخبار المتأخرة (يجب أن تكون منشورة)
      if (overdue.length > 0) {
        console.log('⚠️ أخبار متأخرة (يجب نشرها):');
        console.log(`   عدد: ${overdue.length}`);
        overdue.forEach((article, index) => {
          const delay = Math.floor((now - article.scheduled_for) / (1000 * 60)); // بالدقائق
          console.log(`   ${index + 1}. "${article.title}"`);
          console.log(`      📅 كان مجدولاً لـ: ${article.scheduled_for.toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}`);
          console.log(`      ⏰ التأخير: ${delay} دقيقة`);
          console.log(`      👤 الكاتب: ${article.author?.name || 'غير محدد'}`);
          console.log(`      🆔 ID: ${article.id}\n`);
        });
      }

      // الأخبار المجدولة في المستقبل
      if (upcoming.length > 0) {
        console.log('📅 أخبار مجدولة في المستقبل:');
        console.log(`   عدد: ${upcoming.length}`);
        upcoming.slice(0, 5).forEach((article, index) => {
          const timeToPublish = Math.floor((article.scheduled_for - now) / (1000 * 60)); // بالدقائق
          console.log(`   ${index + 1}. "${article.title}"`);
          console.log(`      📅 مجدول لـ: ${article.scheduled_for.toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}`);
          console.log(`      ⏰ متبقي: ${timeToPublish} دقيقة`);
          console.log(`      👤 الكاتب: ${article.author?.name || 'غير محدد'}`);
          console.log(`      🆔 ID: ${article.id}\n`);
        });
        
        if (upcoming.length > 5) {
          console.log(`   ... و ${upcoming.length - 5} أخبار أخرى\n`);
        }
      }

      // الأخبار بدون تاريخ جدولة
      if (invalid.length > 0) {
        console.log('❌ أخبار مجدولة بدون تاريخ (مشكلة):');
        console.log(`   عدد: ${invalid.length}`);
        invalid.forEach((article, index) => {
          console.log(`   ${index + 1}. "${article.title}"`);
          console.log(`      🆔 ID: ${article.id}`);
          console.log(`      👤 الكاتب: ${article.author?.name || 'غير محدد'}\n`);
        });
      }
    }

    // 3. فحص سجل النشاط للنشر التلقائي
    console.log('📋 سجل النشاط - النشر التلقائي:');
    console.log('-'.repeat(40));

    const publishLogs = await prisma.activity_logs.findMany({
      where: {
        action: {
          in: ['auto_publish_article', 'auto_publish_error', 'manual_publish_scheduled']
        },
        created_at: {
          gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) // آخر 24 ساعة
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 10
    });

    if (publishLogs.length === 0) {
      console.log('   ⚠️ لم يتم العثور على أي سجلات نشر تلقائي في آخر 24 ساعة');
      console.log('   💡 هذا قد يعني أن النظام التلقائي لا يعمل');
    } else {
      console.log(`   📄 عدد السجلات في آخر 24 ساعة: ${publishLogs.length}\n`);
      
      publishLogs.forEach((log, index) => {
        const details = log.metadata || {};
        const actionLabel = {
          'auto_publish_article': '✅ نشر تلقائي',
          'auto_publish_error': '❌ خطأ نشر تلقائي', 
          'manual_publish_scheduled': '🔧 نشر يدوي'
        }[log.action] || log.action;
        
        console.log(`   ${index + 1}. ${actionLabel}`);
        console.log(`      📰 العنوان: ${details.title || 'غير محدد'}`);
        console.log(`      ⏰ الوقت: ${log.created_at.toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}`);
        if (details.error) {
          console.log(`      ❌ الخطأ: ${details.error}`);
        }
        console.log(`      🆔 المقال: ${log.entity_id}\n`);
      });
    }

    // 4. توصيات الإصلاح
    console.log('💡 التوصيات والإجراءات:');
    console.log('-'.repeat(35));

    if (overdue.length > 0) {
      console.log(`⚠️ يوجد ${overdue.length} خبر متأخر يحتاج نشر فوري:`);
      console.log('   🔧 الحل: تشغيل script النشر اليدوي');
      console.log('   📝 الأمر: node scripts/publish-scheduled.js');
      console.log('');
    }

    if (invalid.length > 0) {
      console.log(`❌ يوجد ${invalid.length} خبر مجدول بدون تاريخ:`);
      console.log('   🔧 الحل: إصلاح التواريخ المفقودة');
      console.log('   📝 الأمر: POST /api/articles/fix-dates');
      console.log('');
    }

    if (publishLogs.length === 0) {
      console.log('⚠️ النظام التلقائي قد لا يعمل:');
      console.log('   🔧 الحلول:');
      console.log('   1. التحقق من Vercel Cron configuration');
      console.log('   2. فحص CRON_SECRET في environment variables'); 
      console.log('   3. تشغيل النشر يدوياً كحل مؤقت');
      console.log('   📝 الاختبار: GET /api/cron/publish-scheduled');
      console.log('');
    }

    // 5. معلومات إضافية
    console.log('ℹ️ معلومات إضافية:');
    console.log('-'.repeat(25));
    console.log('   🌐 Cron Job: /api/cron/publish-scheduled');
    console.log('   ⏰ تكرار: كل دقيقة (* * * * *)');
    console.log('   🔧 اختبار يدوي: GET /api/cron/publish-scheduled');
    console.log('   📝 النشر اليدوي: node scripts/publish-scheduled.js');
    console.log('   🔍 التشخيص: node scripts/diagnose-scheduled.js');

  } catch (error) {
    console.error('\n❌ خطأ في تشغيل التشخيص:', error);
    console.error('تفاصيل الخطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n' + '='.repeat(50));
  console.log('✨ انتهى التشخيص');
}

// تشغيل التشخيص
diagnoseScheduledNews()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 خطأ حرج:', error);
    process.exit(1);
  });
