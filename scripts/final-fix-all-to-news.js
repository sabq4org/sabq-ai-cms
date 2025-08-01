/**
 * إصلاح نهائي: ضمان نقل جميع المقالات إلى قسم الأخبار
 * المشكلة: لا تزال هناك 11 مقال مُصنفة كـ opinion
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function finalFixAllToNews() {
  try {
    console.log('🔧 إصلاح نهائي: نقل الكل إلى الأخبار...\n');
    
    // 1. فحص المقالات المتبقية خارج قسم الأخبار
    console.log('1️⃣ فحص المقالات خارج قسم الأخبار...');
    
    const wronglyClassified = await prisma.articles.findMany({
      where: {
        article_type: { 
          not: 'news' 
        }
      },
      select: {
        id: true,
        title: true,
        article_type: true,
        status: true,
        views: true
      }
    });
    
    console.log(`❌ مقالات خارج قسم الأخبار: ${wronglyClassified.length}`);
    
    if (wronglyClassified.length > 0) {
      console.log('\n📝 المقالات التي تحتاج تصحيح:');
      wronglyClassified.forEach((article, index) => {
        console.log(`  ${index + 1}. ${article.title.substring(0, 60)}...`);
        console.log(`     مُصنفة خطأ كـ: ${article.article_type}`);
        console.log(`     الحالة: ${article.status}`);
        console.log(`     المشاهدات: ${article.views || 0}`);
        console.log('');
      });
    }
    
    // 2. التصحيح الشامل - تحويل كل شيء إلى أخبار
    console.log('2️⃣ تحويل جميع المقالات إلى أخبار (شامل)...');
    
    const totalUpdateResult = await prisma.articles.updateMany({
      where: {
        // بدون شروط = جميع المقالات
      },
      data: {
        article_type: 'news',
        updated_at: new Date()
      }
    });
    
    console.log(`✅ تم تحديث ${totalUpdateResult.count} مقال إلى نوع "أخبار"`);
    
    // 3. التحقق من النتيجة النهائية
    console.log('\n3️⃣ التحقق من النتيجة النهائية...');
    
    const finalStats = await Promise.all([
      prisma.articles.count({ where: { article_type: 'news' } }),
      prisma.articles.count({ where: { article_type: 'opinion' } }),
      prisma.articles.count({ where: { article_type: 'analysis' } }),
      prisma.articles.count({ where: { article_type: 'interview' } }),
      prisma.articles.count()  // الإجمالي
    ]);
    
    console.log('📊 النتيجة النهائية:');
    console.log(`  📰 الأخبار: ${finalStats[0]}`);
    console.log(`  💭 مقالات الرأي: ${finalStats[1]} (الهدف: 0)`);
    console.log(`  📊 التحليلات: ${finalStats[2]} (الهدف: 0)`);
    console.log(`  🎤 المقابلات: ${finalStats[3]} (الهدف: 0)`);
    console.log(`  📈 الإجمالي: ${finalStats[4]}`);
    
    // 4. فحص التطابق المثالي
    const isPerfect = (
      finalStats[0] === finalStats[4] && // جميع المقالات أخبار
      finalStats[1] === 0 &&             // لا توجد مقالات رأي
      finalStats[2] === 0 &&             // لا توجد تحليلات
      finalStats[3] === 0                // لا توجد مقابلات
    );
    
    if (isPerfect) {
      console.log('\n🎉 مثالي! جميع المقالات الآن في قسم الأخبار');
      console.log(`✅ ${finalStats[0]} مقال جميعها مُصنفة كأخبار`);
      console.log('✅ لا توجد مقالات في الأقسام الأخرى');
    } else {
      console.log('\n❌ لا تزال هناك مشكلة في التصنيف');
      console.log('المطلوب مراجعة قاعدة البيانات يدوياً');
    }
    
    // 5. اختبار واجهة الإدارة النهائي
    console.log('\n4️⃣ اختبار واجهة الإدارة النهائي...');
    
    const adminNews = await prisma.articles.count({
      where: {
        article_type: 'news',
        status: 'published'
      }
    });
    
    const adminArticles = await prisma.articles.count({
      where: {
        article_type: { in: ['opinion', 'analysis', 'interview'] },
        status: 'published'
      }
    });
    
    console.log(`📊 /admin/news/ ستعرض: ${adminNews} خبر`);
    console.log(`📝 /admin/articles/ ستعرض: ${adminArticles} مقال`);
    
    if (adminNews > 0 && adminArticles === 0) {
      console.log('✅ واجهات الإدارة ستعمل بشكل مثالي!');
    } else {
      console.log('❌ لا تزال هناك مشكلة في واجهات الإدارة');
    }
    
    // 6. عرض عينة من النتيجة النهائية
    console.log('\n5️⃣ عينة من النتيجة النهائية:');
    
    const finalSample = await prisma.articles.findMany({
      where: {
        status: 'published'
      },
      select: {
        title: true,
        article_type: true,
        status: true,
        views: true
      },
      take: 5,
      orderBy: { published_at: 'desc' }
    });
    
    finalSample.forEach((article, index) => {
      console.log(`  ${index + 1}. ${article.title.substring(0, 60)}...`);
      console.log(`     النوع: ${article.article_type} ${article.article_type === 'news' ? '✅' : '❌'}`);
      console.log(`     الحالة: ${article.status}`);
      console.log('');
    });
    
    console.log('\n💡 ملخص الإصلاح النهائي:');
    console.log(`  📰 إجمالي الأخبار: ${finalStats[0]}`);
    console.log(`  ✅ أخبار منشورة: ${adminNews}`);
    console.log(`  📝 مقالات متبقية: ${adminArticles} (يجب 0)`);
    console.log(`  🎯 نجح الإصلاح: ${isPerfect ? 'نعم ✅' : 'لا ❌'}`);
    
    if (isPerfect) {
      console.log('\n🎉 تم الإصلاح بنجاح! جميع المحتوى الآن في قسم الأخبار');
    }
    
  } catch (error) {
    console.error('❌ خطأ في الإصلاح النهائي:', error);
  } finally {
    await prisma.$disconnect();
  }
}

finalFixAllToNews();