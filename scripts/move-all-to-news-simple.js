/**
 * نقل جميع المحتوى إلى قسم الأخبار - مبسط
 * الهدف: تحويل جميع المقالات إلى article_type = 'news'
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function moveAllToNews() {
  try {
    console.log('📰 نقل جميع المحتوى إلى قسم الأخبار...\n');
    
    // 1. إحصائيات سريعة قبل التغيير
    console.log('1️⃣ الوضع قبل التغيير...');
    
    const totalPublished = await prisma.articles.count({
      where: { status: 'published' }
    });
    
    console.log(`📊 إجمالي المقالات المنشورة: ${totalPublished}`);
    
    // 2. التحويل الشامل - جميع المقالات إلى أخبار
    console.log('\n2️⃣ تحويل جميع المقالات إلى أخبار...');
    
    const updateResult = await prisma.articles.updateMany({
      where: {
        status: { in: ['published', 'draft'] }
      },
      data: {
        article_type: 'news',
        updated_at: new Date()
      }
    });
    
    console.log(`✅ تم تحويل ${updateResult.count} مقال إلى قسم الأخبار`);
    
    // 3. التحقق من النتيجة
    console.log('\n3️⃣ التحقق من النتيجة...');
    
    const newsCount = await prisma.articles.count({
      where: { 
        status: 'published',
        article_type: 'news'
      }
    });
    
    const opinionCount = await prisma.articles.count({
      where: { 
        status: 'published',
        article_type: 'opinion'
      }
    });
    
    console.log(`📰 الأخبار المنشورة: ${newsCount}`);
    console.log(`💭 مقالات الرأي: ${opinionCount} (يجب أن تكون 0)`);
    
    // 4. عرض عينة من الأخبار
    console.log('\n4️⃣ عينة من الأخبار المُحوّلة:');
    
    const sampleNews = await prisma.articles.findMany({
      where: {
        status: 'published',
        article_type: 'news'
      },
      select: {
        title: true,
        article_type: true,
        views: true,
        published_at: true
      },
      take: 5,
      orderBy: { published_at: 'desc' }
    });
    
    sampleNews.forEach((news, index) => {
      console.log(`  ${index + 1}. ${news.title.substring(0, 60)}...`);
      console.log(`     النوع: ${news.article_type} ✅`);
      console.log(`     المشاهدات: ${news.views || 0}`);
      console.log('');
    });
    
    // 5. اختبار واجهة الإدارة
    console.log('5️⃣ اختبار واجهة الإدارة...');
    
    // محاكاة ما سيظهر في /admin/news/
    const adminNewsCount = await prisma.articles.count({
      where: {
        article_type: 'news',
        status: 'published'
      }
    });
    
    console.log(`📊 /admin/news/ ستعرض: ${adminNewsCount} خبر`);
    console.log(`📝 /admin/articles/ ستعرض: 0 مقال (فارغ)`);
    
    // 6. النتيجة النهائية
    if (newsCount === totalPublished && opinionCount === 0) {
      console.log('\n🎉 تم النقل بنجاح!');
      console.log(`✅ جميع المقالات (${newsCount}) الآن في قسم الأخبار`);
      console.log('✅ قسم مقالات الرأي فارغ (صحيح)');
      console.log('✅ لوحة التحكم ستعرض جميع المحتوى في /admin/news/');
    } else {
      console.log('\n❌ هناك مشكلة في النقل');
      console.log(`الأخبار: ${newsCount}, الهدف: ${totalPublished}`);
      console.log(`مقالات الرأي: ${opinionCount}, الهدف: 0`);
    }
    
    console.log('\n🔗 للتحقق:');
    console.log('  • افتح /admin/news/ - يجب أن ترى جميع الأخبار');
    console.log('  • افتح /admin/articles/ - يجب أن ترى "لا توجد مقالات"');
    console.log(`  • العداد في الأخبار = ${newsCount}`);
    
  } catch (error) {
    console.error('❌ خطأ في النقل:', error);
  } finally {
    await prisma.$disconnect();
  }
}

moveAllToNews();