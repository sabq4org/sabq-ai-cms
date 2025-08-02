/**
 * إصلاح article_type للمقالات الموجودة
 * تحديث المقالات التي لها article_type فارغ أو null
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log('🔧 إصلاح article_type للمقالات الموجودة...\n');

async function fixArticleTypes() {
  try {
    console.log('📋 1. فحص المقالات الحالية...');
    
    // جلب جميع المقالات أولاً
    const allArticles = await prisma.articles.findMany({
      select: {
        id: true,
        title: true,
        article_type: true,
        status: true,
        created_at: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // فلترة المقالات التي تحتاج إصلاح
    const articlesWithoutType = allArticles.filter(article => 
      !article.article_type || article.article_type === '' || article.article_type === null
    );

    console.log(`📊 إجمالي المقالات: ${allArticles.length}`);
    console.log(`📊 وُجد ${articlesWithoutType.length} مقال بحاجة إلى إصلاح article_type`);
    
    if (articlesWithoutType.length === 0) {
      console.log('✅ جميع المقالات لها article_type صحيح!');
      return;
    }

    console.log('\n📋 2. إحصائيات article_type الحالية:');
    const typeStats = await prisma.articles.groupBy({
      by: ['article_type'],
      _count: {
        id: true
      }
    });

    typeStats.forEach(stat => {
      console.log(`🏷️  ${stat.article_type || 'null/undefined'}: ${stat._count.id} مقال`);
    });

    console.log('\n📋 3. تحديث المقالات...');
    
    // قاعدة بسيطة لتصنيف المقالات:
    // - إذا كان العنوان يحتوي على كلمات رأي -> opinion
    // - باقي المقالات -> news
    
    let updatedCount = 0;
    let opinionCount = 0;
    let newsCount = 0;

    for (const article of articlesWithoutType) {
      const title = article.title?.toLowerCase() || '';
      
      // كلمات مفتاحية لمقالات الرأي
      const opinionKeywords = [
        'رأي', 'تحليل', 'وجهة نظر', 'مقال', 'كاتب', 'رؤية', 
        'تعليق', 'نقد', 'دراسة', 'بحث', 'تقييم', 'مناقشة',
        'opinion', 'analysis', 'editorial', 'commentary'
      ];
      
      const isOpinion = opinionKeywords.some(keyword => title.includes(keyword));
      const newType = isOpinion ? 'opinion' : 'news';
      
      // تحديث المقال
      await prisma.articles.update({
        where: { id: article.id },
        data: { article_type: newType }
      });
      
      if (newType === 'opinion') {
        opinionCount++;
      } else {
        newsCount++;
      }
      updatedCount++;
      
      console.log(`📝 ${updatedCount}/${articlesWithoutType.length}: "${article.title?.substring(0, 50)}..." → ${newType}`);
    }

    console.log('\n✅ تم الإصلاح بنجاح!');
    console.log(`📊 النتائج:`);
    console.log(`   📰 تم تصنيف ${newsCount} مقال كـ "news"`);
    console.log(`   💭 تم تصنيف ${opinionCount} مقال كـ "opinion"`);
    console.log(`   🔧 المجموع: ${updatedCount} مقال محدث`);

    // إحصائيات نهائية
    console.log('\n📋 4. إحصائيات نهائية:');
    const finalStats = await prisma.articles.groupBy({
      by: ['article_type'],
      _count: {
        id: true
      }
    });

    finalStats.forEach(stat => {
      console.log(`🏷️  ${stat.article_type || 'null/undefined'}: ${stat._count.id} مقال`);
    });

  } catch (error) {
    console.error('❌ خطأ في إصلاح article_types:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الإصلاح
fixArticleTypes()
  .then(() => {
    console.log('\n🎉 انتهى إصلاح article_types');
    console.log('💡 الآن يجب أن تظهر الأخبار مصنفة صحيحاً في لوحة الإدارة');
  })
  .catch(error => {
    console.error('❌ فشل الإصلاح:', error);
  });