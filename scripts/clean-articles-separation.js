/**
 * سكريبت تنظيف فصل المقالات عن الأخبار
 * 1. أرشفة المقالات التجريبية
 * 2. تصنيف المحتوى حسب النوع (news vs opinion/analysis)
 * 3. تنظيف البيانات للفصل الصحيح
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanArticlesSeparation() {
  try {
    console.log('🧹 بدء تنظيف فصل المقالات عن الأخبار...\n');
    
    // 1. البحث عن المقالات التجريبية
    console.log('🔍 البحث عن المقالات التجريبية...');
    
    const testArticles = await prisma.articles.findMany({
      where: {
        OR: [
          { title: { contains: 'test', mode: 'insensitive' } },
          { title: { contains: 'تجربة', mode: 'insensitive' } },
          { title: { contains: 'demo', mode: 'insensitive' } },
          { title: { contains: 'example', mode: 'insensitive' } },
          { title: { contains: 'مقال تجريبي', mode: 'insensitive' } },
          { title: { contains: 'اختبار', mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        title: true,
        status: true,
        article_type: true,
        views: true
      }
    });
    
    console.log(`📝 تم العثور على ${testArticles.length} مقال تجريبي:`);
    testArticles.forEach((article, index) => {
      console.log(`  ${index + 1}. ${article.title}`);
      console.log(`     الحالة: ${article.status}`);
      console.log(`     النوع: ${article.article_type || 'غير محدد'}`);
      console.log(`     المشاهدات: ${article.views || 0}`);
      console.log('');
    });
    
    // أرشفة المقالات التجريبية
    if (testArticles.length > 0) {
      console.log('📦 أرشفة المقالات التجريبية...');
      
      const archiveResult = await prisma.articles.updateMany({
        where: {
          id: { in: testArticles.map(a => a.id) }
        },
        data: {
          status: 'archived'
        }
      });
      
      console.log(`✅ تم أرشفة ${archiveResult.count} مقال تجريبي`);
    }
    
    // 2. تحليل المقالات الحالية حسب النوع
    console.log('\n📊 تحليل المقالات الحالية حسب النوع...');
    
    const typeAnalysis = await prisma.articles.groupBy({
      by: ['article_type'],
      _count: {
        id: true
      },
      where: {
        status: {
          in: ['published', 'draft']
        }
      }
    });
    
    console.log('📈 إحصائيات الأنواع (المنشورة والمسودة):');
    typeAnalysis.forEach(stat => {
      const type = stat.article_type || 'غير محدد';
      console.log(`  ${type}: ${stat._count.id} مقال`);
    });
    
    // 3. عرض المقالات بدون نوع محدد
    const articlesWithoutType = await prisma.articles.findMany({
      where: {
        AND: [
          {
            OR: [
              { article_type: null },
              { article_type: '' }
            ]
          },
          {
            status: {
              in: ['published', 'draft']
            }
          }
        ]
      },
      select: {
        id: true,
        title: true,
        status: true,
        created_at: true,
        views: true
      },
      take: 10
    });
    
    if (articlesWithoutType.length > 0) {
      console.log(`\n🔍 المقالات بدون نوع محدد (${articlesWithoutType.length} مقال):`);
      articlesWithoutType.forEach((article, index) => {
        console.log(`  ${index + 1}. ${article.title}`);
        console.log(`     الحالة: ${article.status}`);
        console.log(`     المشاهدات: ${article.views || 0}`);
        console.log('');
      });
      
      // تصنيف المقالات بدون نوع كـ "أخبار" للتوافق العكسي
      console.log('🏷️ تصنيف المقالات بدون نوع كـ "أخبار" للتوافق العكسي...');
      
      const updateResult = await prisma.articles.updateMany({
        where: {
          AND: [
            {
              OR: [
                { article_type: null },
                { article_type: '' }
              ]
            },
            {
              status: {
                in: ['published', 'draft']
              }
            }
          ]
        },
        data: {
          article_type: 'news'
        }
      });
      
      console.log(`✅ تم تصنيف ${updateResult.count} مقال كأخبار`);
    }
    
    // 4. إحصائيات نهائية بعد التنظيف
    console.log('\n📊 الإحصائيات النهائية بعد التنظيف:');
    
    const finalStats = await Promise.all([
      prisma.articles.count({
        where: {
          article_type: 'news',
          status: 'published'
        }
      }),
      prisma.articles.count({
        where: {
          article_type: 'opinion',
          status: 'published'
        }
      }),
      prisma.articles.count({
        where: {
          article_type: 'analysis',
          status: 'published'
        }
      }),
      prisma.articles.count({
        where: {
          article_type: 'interview',
          status: 'published'
        }
      }),
      prisma.articles.count({
        where: {
          status: 'archived'
        }
      })
    ]);
    
    console.log('✅ النتائج النهائية:');
    console.log(`  📰 الأخبار المنشورة: ${finalStats[0]}`);
    console.log(`  💭 مقالات الرأي المنشورة: ${finalStats[1]}`);
    console.log(`  📊 التحليلات المنشورة: ${finalStats[2]}`);
    console.log(`  🎤 المقابلات المنشورة: ${finalStats[3]}`);
    console.log(`  📦 المقالات المؤرشفة: ${finalStats[4]}`);
    
    // 5. اختبار فلتر الأخبار
    console.log('\n🧪 اختبار فلتر الأخبار...');
    
    const newsOnly = await prisma.articles.findMany({
      where: {
        AND: [
          {
            OR: [
              { article_type: 'news' },
              { article_type: null } // للتوافق العكسي
            ]
          },
          {
            status: 'published'
          }
        ]
      },
      take: 5,
      select: {
        id: true,
        title: true,
        article_type: true,
        status: true
      }
    });
    
    console.log(`📰 عينة من الأخبار (${newsOnly.length} من المجموع):`)
    newsOnly.forEach((article, index) => {
      console.log(`  ${index + 1}. ${article.title}`);
      console.log(`     النوع: ${article.article_type || 'قديم (بدون نوع)'}`);
      console.log('');
    });
    
    // 6. توصيات نهائية
    console.log('💡 توصيات للتطبيق:');
    console.log('  1. ✅ تم تصحيح المصطلحات في واجهة إدارة الأخبار');
    console.log('  2. ✅ تم إضافة فلتر article_type للفصل بين الأخبار والمقالات');
    console.log('  3. ✅ تم أرشفة المقالات التجريبية');
    console.log('  4. ✅ تم تصنيف المحتوى القديم كأخبار للتوافق العكسي');
    console.log('  5. 🔄 يُنصح بتحديث صفحة إنشاء المحتوى لتحديد النوع بوضوح');
    
    console.log('\n🎉 تم تنظيف فصل المقالات عن الأخبار بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في تنظيف البيانات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanArticlesSeparation();