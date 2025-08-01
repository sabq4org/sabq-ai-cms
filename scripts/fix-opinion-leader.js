const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixOpinionLeader() {
  try {
    console.log('🔍 البحث عن مقالة "عبقرية الطفولة"...');
    
    // البحث عن مقالة عبقرية الطفولة
    const targetArticle = await prisma.articles.findFirst({
      where: {
        title: {
          contains: 'عبقرية الطفولة'
        }
      },
      select: {
        id: true,
        title: true,
        article_type: true,
        is_opinion_leader: true,
        status: true
      }
    });

    if (!targetArticle) {
      console.log('❌ لم يتم العثور على مقالة "عبقرية الطفولة"');
      return;
    }

    console.log('✅ تم العثور على المقالة:', {
      id: targetArticle.id,
      title: targetArticle.title,
      type: targetArticle.article_type,
      is_leader: targetArticle.is_opinion_leader,
      status: targetArticle.status
    });

    // إزالة قائد الرأي من جميع المقالات
    console.log('🔄 إزالة قائد الرأي من جميع المقالات...');
    
    const removeResult = await prisma.articles.updateMany({
      where: {
        is_opinion_leader: true
      },
      data: {
        is_opinion_leader: false
      }
    });
    
    console.log(`✅ تم إزالة قائد الرأي من ${removeResult.count} مقال`);

    // تعيين مقالة "عبقرية الطفولة" كقائد رأي اليوم
    console.log('👑 تعيين مقالة "عبقرية الطفولة" كقائد رأي اليوم...');
    
    const updateResult = await prisma.articles.update({
      where: {
        id: targetArticle.id
      },
      data: {
        is_opinion_leader: true,
        article_type: 'opinion', // التأكد من أنها مقال رأي
        status: 'published' // التأكد من أنها منشورة
      }
    });

    console.log('✅ تم تعيين مقالة "عبقرية الطفولة" كقائد رأي اليوم بنجاح!');
    console.log('📝 تفاصيل المقال المحدث:', {
      id: updateResult.id,
      title: updateResult.title,
      article_type: updateResult.article_type,
      is_opinion_leader: updateResult.is_opinion_leader,
      status: updateResult.status
    });

    // التحقق من النتيجة النهائية
    console.log('\n📊 التحقق من قادة الرأي الحاليين...');
    
    const opinionLeaders = await prisma.articles.findMany({
      where: {
        is_opinion_leader: true
      },
      select: {
        id: true,
        title: true,
        article_type: true,
        status: true
      }
    });

    console.log(`✅ إجمالي قادة الرأي: ${opinionLeaders.length}`);
    opinionLeaders.forEach((leader, index) => {
      console.log(`${index + 1}. [${leader.id}] ${leader.title} - ${leader.article_type} - ${leader.status}`);
    });

    // عرض إحصائيات نهائية
    console.log('\n📈 إحصائيات المقالات:');
    
    const [totalArticles, opinionArticles, newsArticles] = await Promise.all([
      prisma.articles.count(),
      prisma.articles.count({
        where: {
          article_type: {
            in: ['opinion', 'analysis', 'interview']
          }
        }
      }),
      prisma.articles.count({
        where: {
          OR: [
            { article_type: 'news' },
            { article_type: { equals: null } },
            { 
              article_type: { 
                notIn: ['opinion', 'analysis', 'interview'] 
              } 
            }
          ]
        }
      })
    ]);

    console.log(`📊 إجمالي المقالات: ${totalArticles}`);
    console.log(`📝 مقالات الرأي: ${opinionArticles}`);
    console.log(`📰 الأخبار: ${newsArticles}`);
    
  } catch (error) {
    console.error('❌ خطأ في إصلاح قائد الرأي:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixOpinionLeader();