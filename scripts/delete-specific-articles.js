/**
 * حذف مقالات محددة من قسم الأخبار
 * المقالات المطلوب حذفها:
 * - التحولات الجيوسياسية في الشرق الأوسط
 * - الذكاء الاصطناعي وتحول مستقبل العمل
 * - مستقبل الاقتصاد السعودي في ظل رؤية 2030
 * - انطلاق مؤتمر الاستثمار السعودي بمشاركة دولية واسعة
 * - السعودية تستضيف قمة إقليمية لمناقشة التحديات البيئية
 * - السعودية تؤكد دعمها للحل السلمي في الشرق الأوسط
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteSpecificArticles() {
  try {
    console.log('🗑️ حذف المقالات المحددة من قسم الأخبار...\n');
    
    // قائمة المقالات المطلوب حذفها
    const articlesToDelete = [
      'التحولات الجيوسياسية في الشرق الأوسط',
      'الذكاء الاصطناعي وتحول مستقبل العمل',
      'مستقبل الاقتصاد السعودي في ظل رؤية 2030',
      'انطلاق مؤتمر الاستثمار السعودي بمشاركة دولية واسعة',
      'السعودية تستضيف قمة إقليمية لمناقشة التحديات البيئية',
      'السعودية تؤكد دعمها للحل السلمي في الشرق الأوسط'
    ];
    
    console.log('📋 المقالات المطلوب حذفها:');
    articlesToDelete.forEach((title, index) => {
      console.log(`  ${index + 1}. ${title}`);
    });
    
    // 1. البحث عن المقالات الموجودة
    console.log('\n1️⃣ البحث عن المقالات في قاعدة البيانات...');
    
    const foundArticles = [];
    const notFoundArticles = [];
    
    for (const title of articlesToDelete) {
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
          status: true,
          article_type: true,
          views: true,
          published_at: true
        }
      });
      
      if (article) {
        foundArticles.push(article);
        console.log(`✅ موجود: ${article.title}`);
        console.log(`   ID: ${article.id}`);
        console.log(`   الحالة: ${article.status}`);
        console.log(`   النوع: ${article.article_type}`);
        console.log(`   المشاهدات: ${article.views || 0}`);
        console.log('');
      } else {
        notFoundArticles.push(title);
        console.log(`❌ غير موجود: ${title}`);
      }
    }
    
    console.log(`📊 النتائج: ${foundArticles.length} موجود، ${notFoundArticles.length} غير موجود`);
    
    if (foundArticles.length === 0) {
      console.log('\n⚠️ لم يتم العثور على أي من المقالات المحددة');
      console.log('💡 ربما تم حذفها مسبقاً أو تم تعديل عناوينها');
      return;
    }
    
    // 2. عرض المقالات التي سيتم حذفها
    console.log('\n2️⃣ المقالات التي سيتم حذفها:');
    foundArticles.forEach((article, index) => {
      console.log(`  ${index + 1}. ${article.title}`);
      console.log(`     الحالة: ${article.status}`);
      console.log(`     المشاهدات: ${article.views || 0}`);
      console.log(`     تاريخ النشر: ${article.published_at ? article.published_at.toLocaleDateString('ar') : 'غير محدد'}`);
      console.log('');
    });
    
    // 3. إحصائيات ما قبل الحذف
    console.log('3️⃣ إحصائيات ما قبل الحذف...');
    
    const beforeStats = await Promise.all([
      prisma.articles.count({ where: { status: 'published', article_type: 'news' } }),
      prisma.articles.count({ where: { article_type: 'news' } }),
      prisma.articles.count()
    ]);
    
    console.log(`📊 قبل الحذف:`);
    console.log(`  أخبار منشورة: ${beforeStats[0]}`);
    console.log(`  إجمالي الأخبار: ${beforeStats[1]}`);
    console.log(`  إجمالي المقالات: ${beforeStats[2]}`);
    
    // 4. تنفيذ الحذف
    console.log('\n4️⃣ تنفيذ الحذف...');
    
    const articleIds = foundArticles.map(article => article.id);
    
    console.log('🗑️ حذف المقالات من قاعدة البيانات...');
    
    const deleteResult = await prisma.articles.deleteMany({
      where: {
        id: {
          in: articleIds
        }
      }
    });
    
    console.log(`✅ تم حذف ${deleteResult.count} مقال بنجاح`);
    
    // 5. إحصائيات ما بعد الحذف
    console.log('\n5️⃣ إحصائيات ما بعد الحذف...');
    
    const afterStats = await Promise.all([
      prisma.articles.count({ where: { status: 'published', article_type: 'news' } }),
      prisma.articles.count({ where: { article_type: 'news' } }),
      prisma.articles.count()
    ]);
    
    console.log(`📊 بعد الحذف:`);
    console.log(`  أخبار منشورة: ${afterStats[0]}`);
    console.log(`  إجمالي الأخبار: ${afterStats[1]}`);
    console.log(`  إجمالي المقالات: ${afterStats[2]}`);
    
    // 6. حساب الفرق
    console.log('\n6️⃣ ملخص التغييرات:');
    
    const publishedDiff = beforeStats[0] - afterStats[0];
    const newsDiff = beforeStats[1] - afterStats[1];
    const totalDiff = beforeStats[2] - afterStats[2];
    
    console.log(`📉 التغييرات:`);
    console.log(`  الأخبار المنشورة: ${beforeStats[0]} → ${afterStats[0]} (${publishedDiff > 0 ? '-' : '+'}${Math.abs(publishedDiff)})`);
    console.log(`  إجمالي الأخبار: ${beforeStats[1]} → ${afterStats[1]} (${newsDiff > 0 ? '-' : '+'}${Math.abs(newsDiff)})`);
    console.log(`  إجمالي المقالات: ${beforeStats[2]} → ${afterStats[2]} (${totalDiff > 0 ? '-' : '+'}${Math.abs(totalDiff)})`);
    
    // 7. تأكيد نجاح العملية
    if (deleteResult.count === foundArticles.length) {
      console.log('\n🎉 تم حذف جميع المقالات المحددة بنجاح!');
      console.log(`✅ تم حذف ${deleteResult.count} مقال`);
      
      if (notFoundArticles.length > 0) {
        console.log(`ℹ️ ${notFoundArticles.length} مقال لم يتم العثور عليه (ربما محذوف مسبقاً)`);
      }
    } else {
      console.log('\n⚠️ هناك مشكلة في الحذف');
      console.log(`المطلوب حذف: ${foundArticles.length}`);
      console.log(`تم حذف فعلياً: ${deleteResult.count}`);
    }
    
    // 8. عرض المقالات المتبقية في الأخبار
    console.log('\n7️⃣ عينة من الأخبار المتبقية:');
    
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
      take: 5,
      orderBy: { published_at: 'desc' }
    });
    
    if (remainingNews.length > 0) {
      remainingNews.forEach((news, index) => {
        console.log(`  ${index + 1}. ${news.title.substring(0, 60)}...`);
        console.log(`     المشاهدات: ${news.views || 0}`);
        console.log('');
      });
    } else {
      console.log('  لا توجد أخبار منشورة متبقية');
    }
    
    // 9. تأثير على واجهات الإدارة
    console.log('8️⃣ تأثير على واجهات الإدارة:');
    console.log(`📰 /admin/news/ ستعرض الآن: ${afterStats[0]} خبر منشور`);
    console.log(`📝 /admin/articles/ ستبقى: 0 مقال (فارغة)`);
    
    console.log('\n🎯 ملخص العملية:');
    console.log(`✅ تم حذف ${deleteResult.count} مقال من المقالات المطلوبة`);
    console.log(`📊 الأخبار المنشورة الآن: ${afterStats[0]}`);
    console.log('🗑️ تم تنظيف قسم الأخبار من المحتوى غير المرغوب فيه');
    
  } catch (error) {
    console.error('❌ خطأ في حذف المقالات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteSpecificArticles();