/**
 * سكربت لإنشاء بيانات تجريبية لنظام الإعلانات والتنبيهات
 * Script to seed test data for announcements system
 * 
 * Usage: node scripts/seed-announcements.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sampleAnnouncements = [
  {
    title: '🔧 صيانة النظام المجدولة',
    bodyMd: `## صيانة دورية

سيتم إجراء صيانة دورية للنظام يوم **الجمعة القادم** من الساعة **2:00 - 4:00 صباحاً**.

### المتأثر:
- جميع أنظمة التحرير
- نظام رفع الصور
- API الخارجي

### يرجى:
- حفظ جميع الأعمال قبل الموعد
- عدم محاولة الوصول خلال فترة الصيانة`,
    type: 'MAINTENANCE',
    priority: 'HIGH',
    status: 'SCHEDULED',
    isPinned: true,
    startAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // بعد يومين
    endAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    audienceRoles: []
  },
  {
    title: '🎉 ميزة جديدة: نظام البودكاست الذكي',
    bodyMd: `## مرحباً بنظام البودكاست!

يسعدنا الإعلان عن إطلاق **نظام البودكاست الذكي** في سبق الذكية.

### المميزات:
- 🎙️ مشغل صوتي متطور
- 📊 تحليلات شاملة
- 🎨 تصميم عصري ومتجاوب
- 🌙 دعم الوضع المظلم

[اقرأ المزيد في دليل البودكاست](/docs/PODCAST_README.md)`,
    type: 'FEATURE',
    priority: 'NORMAL',
    status: 'ACTIVE',
    isPinned: true,
    audienceRoles: []
  },
  {
    title: '📋 تحديث مهم في سياسة النشر',
    bodyMd: `## تحديثات سياسة النشر 2025

تم تحديث **سياسة النشر** لتشمل إرشادات جديدة حول:

1. **التحقق من المصادر**: وجوب التحقق من 3 مصادر على الأقل
2. **حقوق النشر**: الالتزام بحقوق الملكية الفكرية
3. **المراجعة**: مراجعة إلزامية من المحرر الأول

يرجى مراجعة السياسة الكاملة في [دليل التحرير](/docs/editorial-policy.md)`,
    type: 'POLICY',
    priority: 'HIGH',
    status: 'ACTIVE',
    audienceRoles: ['editor', 'reporter', 'trainee']
  },
  {
    title: '✅ تمت الموافقة على صورة الوزير',
    bodyMd: `تمت الموافقة على استخدام **صورة وزير الإعلام** في المقال الرئيسي.

يمكنك الآن نشر المقال دون قيود.`,
    type: 'ASSET_APPROVED',
    priority: 'CRITICAL',
    status: 'ACTIVE',
    audienceRoles: ['editor', 'reporter', 'media'],
    audienceUsers: []
  },
  {
    title: '📚 إرشادات جديدة للكتابة بالذكاء الاصطناعي',
    bodyMd: `## دليل استخدام الذكاء الاصطناعي

### متى نستخدم AI:
- ✅ التلخيص والاختصار
- ✅ التدقيق اللغوي
- ✅ اقتراح العناوين

### متى لا نستخدم AI:
- ❌ كتابة المحتوى الأساسي
- ❌ التحقق من المصادر
- ❌ القرارات التحريرية

استخدم الذكاء الاصطناعي كأداة مساعدة، وليس بديلاً عن الصحافة الحقيقية.`,
    type: 'GUIDELINE',
    priority: 'NORMAL',
    status: 'ACTIVE',
    isPinned: false,
    audienceRoles: ['editor', 'reporter']
  },
  {
    title: '⚠️ تحذير: مشكلة في نظام رفع الصور',
    bodyMd: `## مشكلة مؤقتة

نواجه حالياً مشكلة مؤقتة في **نظام رفع الصور** تؤدي إلى بطء في التحميل.

### الحل المؤقت:
1. قلل حجم الصور قبل الرفع
2. استخدم صيغة WebP إن أمكن
3. تجنب رفع أكثر من 5 صور في نفس الوقت

يعمل الفريق التقني على حل المشكلة.`,
    type: 'CRITICAL',
    priority: 'CRITICAL',
    status: 'ACTIVE',
    audienceRoles: []
  },
  {
    title: '📅 اجتماع الفريق التحريري - الأحد القادم',
    bodyMd: `**اجتماع دوري** للفريق التحريري يوم **الأحد** الساعة **10:00 صباحاً**.

### جدول الأعمال:
- مراجعة أداء الأسبوع
- خطة المحتوى للأسبوع القادم
- نقاش المقترحات الجديدة

الحضور إلزامي. الرابط سيُرسل قبل الموعد بـ 30 دقيقة.`,
    type: 'ANNOUNCEMENT',
    priority: 'NORMAL',
    status: 'SCHEDULED',
    startAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // غداً
    audienceRoles: ['editor', 'reporter']
  },
  {
    title: '🎓 دورة تدريبية: SEO للصحفيين',
    bodyMd: `## دورة تحسين محركات البحث (SEO)

ندعوكم لحضور **دورة تدريبية مكثفة** حول تحسين المحتوى لمحركات البحث.

### التفاصيل:
- **المدرب**: أحمد السيد - خبير SEO
- **المدة**: 3 أيام (2 ساعة يومياً)
- **التاريخ**: 15-17 أكتوبر
- **المكان**: قاعة التدريب - الطابق الثالث

للتسجيل: [رابط التسجيل](#)`,
    type: 'ANNOUNCEMENT',
    priority: 'LOW',
    status: 'ACTIVE',
    isPinned: false,
    audienceRoles: ['reporter', 'trainee']
  }
];

async function main() {
  try {
    console.log('🚀 بدء إنشاء البيانات التجريبية...\n');

    // الحصول على أول مستخدم من قاعدة البيانات ليكون المؤلف
    const firstUser = await prisma.users.findFirst({
      select: { id: true, name: true }
    });

    if (!firstUser) {
      console.error('❌ خطأ: لا يوجد مستخدمين في قاعدة البيانات');
      console.log('💡 قم بإنشاء مستخدم أولاً باستخدام:');
      console.log('   npm run seed');
      process.exit(1);
    }

    console.log(`✅ تم العثور على المستخدم: ${firstUser.name} (${firstUser.id})\n`);

    // إنشاء الإعلانات
    let created = 0;
    for (const announcement of sampleAnnouncements) {
      try {
        const result = await prisma.adminAnnouncement.create({
          data: {
            ...announcement,
            authorId: firstUser.id
          }
        });

        console.log(`✅ ${announcement.title}`);
        created++;
      } catch (error) {
        console.error(`❌ فشل إنشاء: ${announcement.title}`);
        console.error(`   ${error.message}`);
      }
    }

    console.log(`\n🎉 تم إنشاء ${created} إعلان تجريبي بنجاح!`);
    console.log(`\n📊 الإحصائيات:`);
    
    const stats = await prisma.adminAnnouncement.groupBy({
      by: ['status', 'priority'],
      _count: true
    });

    console.log('\nحسب الحالة والأولوية:');
    stats.forEach(stat => {
      console.log(`  - ${stat.status} (${stat.priority}): ${stat._count} إعلان`);
    });

    console.log('\n💡 يمكنك الآن الوصول إلى:');
    console.log('   http://localhost:3000/admin/announcements');

  } catch (error) {
    console.error('\n❌ خطأ عام:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكربت
main();
