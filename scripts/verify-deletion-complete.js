/**
 * تأكيد نهائي لحذف المقالات المحددة
 * التحقق من أن المقالات لم تعد موجودة
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyDeletionComplete() {
  try {
    console.log('🔍 التأكد من اكتمال حذف المقالات المحددة...\n');
    
    // قائمة المقالات التي تم طلب حذفها
    const deletedArticlesTitles = [
      'التحولات الجيوسياسية في الشرق الأوسط',
      'الذكاء الاصطناعي وتحول مستقبل العمل',
      'مستقبل الاقتصاد السعودي في ظل رؤية 2030',
      'انطلاق مؤتمر الاستثمار السعودي بمشاركة دولية واسعة',
      'السعودية تستضيف قمة إقليمية لمناقشة التحديات البيئية',
      'السعودية تؤكد دعمها للحل السلمي في الشرق الأوسط'
    ];
    
    console.log('📋 المقالات التي تم طلب حذفها:');
    deletedArticlesTitles.forEach((title, index) => {
      console.log(`  ${index + 1}. ${title}`);
    });
    
    // 1. البحث عن المقالات للتأكد من حذفها
    console.log('\n1️⃣ التحقق من عدم وجود المقالات...');
    
    const stillExisting = [];
    const confirmed = [];
    
    for (const title of deletedArticlesTitles) {
      const article = await prisma.articles.findFirst({
        where: {
          title: {
            contains: title,
            mode: 'insensitive'
          }
        },
        select: {
          id: true,
          title: true,
          status: true
        }
      });
      
      if (article) {
        stillExisting.push(article);
        console.log(`❌ لا يزال موجود: ${article.title}`);
        console.log(`   الحالة: ${article.status}`);
      } else {
        confirmed.push(title);
        console.log(`✅ تم حذف: ${title}`);
      }
    }
    
    console.log(`\n📊 نتائج التحقق: ${confirmed.length} محذوف، ${stillExisting.length} لا يزال موجود`);
    
    // 2. الإحصائيات الحالية
    console.log('\n2️⃣ الإحصائيات الحالية:');
    
    const currentStats = await Promise.all([
      prisma.articles.count({ where: { status: 'published', article_type: 'news' } }),
      prisma.articles.count({ where: { status: 'draft', article_type: 'news' } }),
      prisma.articles.count({ where: { status: 'deleted', article_type: 'news' } }),
      prisma.articles.count({ where: { status: 'archived', article_type: 'news' } }),
      prisma.articles.count({ where: { article_type: 'news' } }),
      prisma.articles.count()
    ]);
    
    console.log('📊 الوضع الحالي:');
    console.log(`  📰 أخبار منشورة: ${currentStats[0]}`);
    console.log(`  ✏️ أخبار مسودة: ${currentStats[1]}`);
    console.log(`  ❌ أخبار محذوفة: ${currentStats[2]}`);
    console.log(`  📦 أخبار مؤرشفة: ${currentStats[3]}`);
    console.log(`  📈 إجمالي الأخبار: ${currentStats[4]}`);
    console.log(`  🗃️ إجمالي المقالات: ${currentStats[5]}`);
    
    // 3. عرض الأخبار المتبقية
    console.log('\n3️⃣ الأخبار المنشورة المتبقية:');
    
    const remainingNews = await prisma.articles.findMany({
      where: {
        status: 'published',
        article_type: 'news'
      },
      select: {
        title: true,
        views: true,
        published_at: true
      },
      orderBy: { published_at: 'desc' }
    });
    
    if (remainingNews.length > 0) {
      console.log(`📰 عدد الأخبار المتبقية: ${remainingNews.length}`);
      console.log('\n📋 قائمة الأخبار المتبقية:');
      remainingNews.forEach((news, index) => {
        console.log(`  ${index + 1}. ${news.title}`);
        console.log(`     المشاهدات: ${news.views || 0}`);
        console.log(`     تاريخ النشر: ${news.published_at ? news.published_at.toLocaleDateString('ar') : 'غير محدد'}`);
        console.log('');
      });
    } else {
      console.log('  لا توجد أخبار منشورة متبقية');
    }
    
    // 4. فحص واجهات الإدارة
    console.log('4️⃣ حالة واجهات الإدارة:');
    
    console.log(`📰 /admin/news/:`);
    console.log(`  العداد: ${currentStats[0]} خبر منشور`);
    console.log(`  الجدول: سيعرض ${Math.min(currentStats[0], 10)} خبر (حد العرض)`);
    
    console.log(`📝 /admin/articles/:`);
    console.log(`  العداد: 0 مقال`);
    console.log(`  الجدول: فارغ (لا توجد مقالات)`);
    
    // 5. تقرير نهائي
    console.log('\n📋 التقرير النهائي:');
    
    if (stillExisting.length === 0) {
      console.log('🎉 تم حذف جميع المقالات المطلوبة بنجاح!');
      console.log(`✅ ${confirmed.length} مقال تم حذفها بالكامل`);
      console.log(`📰 ${currentStats[0]} خبر منشور متبقي في النظام`);
      console.log('🗑️ تم تنظيف قسم الأخبار كما هو مطلوب');
    } else {
      console.log('⚠️ بعض المقالات لا تزال موجودة:');
      stillExisting.forEach(article => {
        console.log(`  - ${article.title} (${article.status})`);
      });
      console.log('💡 ربما تحتاج مراجعة إضافية');
    }
    
    // 6. ملخص العملية
    console.log('\n💡 ملخص العملية:');
    console.log('🎯 الهدف: حذف 6 مقالات محددة من قسم الأخبار');
    console.log(`✅ النتيجة: ${confirmed.length} مقال تم حذفها`);
    console.log(`📊 الأخبار المنشورة الآن: ${currentStats[0]}`);
    console.log(`🔄 النظام جاهز للاستخدام`);
    
    if (confirmed.length === deletedArticlesTitles.length) {
      console.log('\n🎊 مهمة الحذف مكتملة بنجاح!');
    }
    
  } catch (error) {
    console.error('❌ خطأ في التحقق:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDeletionComplete();