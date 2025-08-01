/**
 * إصلاح تصنيف المقالات - إرجاع جميع المحتوى إلى قسم الأخبار
 * المشكلة: تم تصنيف الأخبار خطأ كـ مقالات رأي
 * الحل: إرجاع جميع المحتوى إلى article_type = 'news'
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixArticlesClassification() {
  try {
    console.log('🔧 إصلاح تصنيف المقالات - إرجاع الكل إلى الأخبار...\n');
    
    // 1. فحص الوضع الحالي
    console.log('1️⃣ فحص الوضع الحالي...');
    
    const currentStats = await Promise.all([
      prisma.articles.count({ where: { status: 'published', article_type: 'news' } }),
      prisma.articles.count({ where: { status: 'published', article_type: 'opinion' } }),
      prisma.articles.count({ where: { status: 'published', article_type: 'analysis' } }),
      prisma.articles.count({ where: { status: 'published', article_type: 'interview' } }),
      prisma.articles.count({ where: { status: 'published', article_type: { equals: null } } })
    ]);
    
    console.log('📊 التصنيف الحالي (خطأ):');
    console.log(`  📰 الأخبار: ${currentStats[0]}`);
    console.log(`  💭 مقالات الرأي: ${currentStats[1]}`);
    console.log(`  📊 التحليلات: ${currentStats[2]}`);
    console.log(`  🎤 المقابلات: ${currentStats[3]}`);
    console.log(`  ❓ غير محدد: ${currentStats[4]}`);
    
    const totalContent = currentStats.reduce((sum, count) => sum + count, 0);
    console.log(`  📈 الإجمالي: ${totalContent} مقال منشور`);
    
    // 2. عرض عينة من المحتوى "المُصنف خطأ"
    console.log('\n2️⃣ عينة من المحتوى المُصنف خطأ كـ "مقالات رأي":');
    
    const wronglyClassified = await prisma.articles.findMany({
      where: {
        status: 'published',
        article_type: { in: ['opinion', 'analysis'] }
      },
      select: {
        id: true,
        title: true,
        article_type: true,
        published_at: true,
        views: true
      },
      take: 10,
      orderBy: { published_at: 'desc' }
    });
    
    wronglyClassified.forEach((article, index) => {
      console.log(`  ${index + 1}. ${article.title.substring(0, 60)}...`);
      console.log(`     مُصنف خطأ كـ: ${article.article_type}`);
      console.log(`     المشاهدات: ${article.views || 0}`);
      console.log('');
    });
    
    // 3. تطبيق التصحيح الشامل
    console.log('3️⃣ إرجاع جميع المحتوى إلى قسم الأخبار...');
    
    console.log('🔄 تحويل جميع المقالات المنشورة إلى "أخبار"...');
    
    // تحويل جميع المقالات المنشورة إلى نوع "news"
    const updateResult = await prisma.articles.updateMany({
      where: {
        status: 'published'
        // بدون شرط article_type - سيشمل جميع الأنواع
      },
      data: {
        article_type: 'news',
        updated_at: new Date()
      }
    });
    
    console.log(`✅ تم تحويل ${updateResult.count} مقال إلى قسم الأخبار`);
    
    // 4. تحويل المسودات أيضاً
    console.log('\n🔄 تحويل المسودات إلى أخبار أيضاً...');
    
    const draftUpdate = await prisma.articles.updateMany({
      where: {
        status: 'draft'
      },
      data: {
        article_type: 'news',
        updated_at: new Date()
      }
    });
    
    console.log(`✅ تم تحويل ${draftUpdate.count} مسودة إلى قسم الأخبار`);
    
    // 5. النتائج النهائية
    console.log('\n4️⃣ النتائج بعد التصحيح...');
    
    const finalStats = await Promise.all([
      prisma.articles.count({ where: { article_type: 'news', status: 'published' } }),
      prisma.articles.count({ where: { article_type: 'opinion', status: 'published' } }),
      prisma.articles.count({ where: { article_type: 'analysis', status: 'published' } }),
      prisma.articles.count({ where: { article_type: 'interview', status: 'published' } }),
      prisma.articles.count({ where: { article_type: 'news', status: 'draft' } })
    ]);
    
    console.log('📊 التصنيف الصحيح الآن:');
    console.log(`  📰 الأخبار المنشورة: ${finalStats[0]} ✅`);
    console.log(`  💭 مقالات الرأي: ${finalStats[1]} (يجب أن تكون 0)`);
    console.log(`  📊 التحليلات: ${finalStats[2]} (يجب أن تكون 0)`);
    console.log(`  🎤 المقابلات: ${finalStats[3]} (يجب أن تكون 0)`);
    console.log(`  ✏️ مسودات الأخبار: ${finalStats[4]}`);
    
    // 6. عرض عينة من الأخبار المُصححة
    console.log('\n5️⃣ عينة من الأخبار المُصححة:');
    
    const correctedNews = await prisma.articles.findMany({
      where: {
        article_type: 'news',
        status: 'published'
      },
      select: {
        id: true,
        title: true,
        article_type: true,
        published_at: true,
        views: true
      },
      take: 5,
      orderBy: { published_at: 'desc' }
    });
    
    correctedNews.forEach((article, index) => {
      console.log(`  ${index + 1}. ${article.title.substring(0, 60)}...`);
      console.log(`     النوع الصحيح: ${article.article_type} ✅`);
      console.log(`     المشاهدات: ${article.views || 0}`);
      console.log(`     التاريخ: ${article.published_at?.toLocaleDateString('ar') || 'غير محدد'}`);
      console.log('');
    });
    
    // 7. اختبار واجهة لوحة التحكم
    console.log('6️⃣ اختبار واجهة لوحة التحكم...');
    
    // محاكاة ما سيظهر في /admin/news/
    const newsPageCounter = await prisma.articles.count({
      where: {
        article_type: 'news',
        status: 'published'
      }
    });
    
    const newsPageTable = await prisma.articles.findMany({
      where: {
        article_type: 'news',
        status: 'published'
      },
      take: 10,
      select: { id: true, title: true }
    });
    
    console.log(`📊 واجهة /admin/news/ ستعرض:`);
    console.log(`  العداد: ${newsPageCounter} خبر منشور`);
    console.log(`  الجدول: ${newsPageTable.length} خبر معروض`);
    
    // محاكاة ما سيظهر في /admin/articles/
    const articlesPageCounter = await prisma.articles.count({
      where: {
        article_type: { in: ['opinion', 'analysis', 'interview'] },
        status: 'published'
      }
    });
    
    console.log(`📝 واجهة /admin/articles/ ستعرض:`);
    console.log(`  العداد: ${articlesPageCounter} مقال (يجب أن يكون 0)`);
    console.log(`  الجدول: فارغ أو "لا توجد مقالات"`);
    
    // 8. توصيات نهائية
    console.log('\n💡 النتيجة النهائية:');
    
    if (finalStats[0] === totalContent && finalStats[1] === 0 && finalStats[2] === 0) {
      console.log('✅ تم تصحيح التصنيف بنجاح!');
      console.log(`  📰 جميع المحتوى (${finalStats[0]} مقال) في قسم الأخبار`);
      console.log('  💭 قسم مقالات الرأي فارغ (صحيح)');
      console.log('  📊 قسم التحليلات فارغ (صحيح)');
    } else {
      console.log('❌ هناك مشكلة في التصحيح');
    }
    
    console.log('\n🔗 للاختبار:');
    console.log('  1. افتح /admin/news/ - يجب أن ترى جميع الأخبار');
    console.log('  2. افتح /admin/articles/ - يجب أن ترى "لا توجد مقالات"');
    console.log(`  3. العداد في /admin/news/ = ${finalStats[0]} خبر`);
    
    console.log('\n🎉 تم إصلاح التصنيف! جميع المحتوى الآن في قسم الأخبار الصحيح');
    
  } catch (error) {
    console.error('❌ خطأ في إصلاح التصنيف:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixArticlesClassification();