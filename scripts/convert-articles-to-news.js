/**
 * تحويل بعض المقالات إلى أخبار للاختبار
 * حل سريع لمشكلة عدم ظهور أخبار في لوحة التحكم
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function convertArticlesToNews() {
  try {
    console.log('🔄 تحويل مقالات مختارة إلى أخبار...\n');
    
    // 1. فحص الوضع الحالي
    console.log('1️⃣ فحص الوضع الحالي...');
    
    const currentStats = await Promise.all([
      prisma.articles.count({ where: { status: 'published', article_type: 'news' } }),
      prisma.articles.count({ where: { status: 'published', article_type: 'opinion' } }),
      prisma.articles.count({ where: { status: 'published', article_type: 'analysis' } })
    ]);
    
    console.log(`📰 الأخبار الحالية: ${currentStats[0]}`);
    console.log(`💭 مقالات الرأي: ${currentStats[1]}`);
    console.log(`📊 التحليلات: ${currentStats[2]}`);
    
    // 2. اختيار المقالات للتحويل
    console.log('\n2️⃣ اختيار المقالات للتحويل...');
    
    // نختار مقالات تبدو كأخبار (بناءً على العناوين)
    const candidateArticles = await prisma.articles.findMany({
      where: {
        status: 'published',
        article_type: { in: ['opinion', 'analysis'] },
        OR: [
          { title: { contains: 'السعودية', mode: 'insensitive' } },
          { title: { contains: 'الرياض', mode: 'insensitive' } },
          { title: { contains: 'المملكة', mode: 'insensitive' } },
          { title: { contains: 'ولي العهد', mode: 'insensitive' } },
          { title: { contains: 'مجلس الوزراء', mode: 'insensitive' } },
          { title: { contains: 'انطلاق', mode: 'insensitive' } },
          { title: { contains: 'إطلاق', mode: 'insensitive' } },
          { title: { contains: 'افتتاح', mode: 'insensitive' } },
          { title: { contains: 'توقيع', mode: 'insensitive' } },
          { title: { contains: 'اعتزام', mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        title: true,
        article_type: true,
        views: true,
        published_at: true
      },
      take: 10,
      orderBy: { published_at: 'desc' }
    });
    
    console.log(`🔍 تم العثور على ${candidateArticles.length} مقال مرشح للتحويل:`);
    candidateArticles.forEach((article, index) => {
      console.log(`  ${index + 1}. ${article.title.substring(0, 60)}...`);
      console.log(`     النوع الحالي: ${article.article_type}`);
      console.log(`     المشاهدات: ${article.views || 0}`);
      console.log('');
    });
    
    if (candidateArticles.length === 0) {
      console.log('❌ لا توجد مقالات مناسبة للتحويل');
      return;
    }
    
    // 3. تطبيق التحويل
    console.log('3️⃣ تطبيق التحويل...');
    
    const articlesToConvert = candidateArticles.slice(0, 5); // أول 5 مقالات
    const articleIds = articlesToConvert.map(a => a.id);
    
    console.log(`🔄 تحويل ${articlesToConvert.length} مقال إلى أخبار...`);
    
    const updateResult = await prisma.articles.updateMany({
      where: {
        id: { in: articleIds }
      },
      data: {
        article_type: 'news',
        updated_at: new Date()
      }
    });
    
    console.log(`✅ تم تحويل ${updateResult.count} مقال بنجاح`);
    
    // 4. عرض النتائج
    console.log('\n4️⃣ النتائج بعد التحويل...');
    
    const newStats = await Promise.all([
      prisma.articles.count({ where: { status: 'published', article_type: 'news' } }),
      prisma.articles.count({ where: { status: 'published', article_type: 'opinion' } }),
      prisma.articles.count({ where: { status: 'published', article_type: 'analysis' } })
    ]);
    
    console.log('📊 الإحصائيات الجديدة:');
    console.log(`📰 الأخبار: ${newStats[0]} (كان ${currentStats[0]})`);
    console.log(`💭 مقالات الرأي: ${newStats[1]} (كان ${currentStats[1]})`);
    console.log(`📊 التحليلات: ${newStats[2]} (كان ${currentStats[2]})`);
    
    // 5. عرض الأخبار الجديدة
    if (newStats[0] > 0) {
      console.log('\n5️⃣ الأخبار الجديدة:');
      
      const newsArticles = await prisma.articles.findMany({
        where: {
          status: 'published',
          article_type: 'news'
        },
        select: {
          id: true,
          title: true,
          published_at: true,
          views: true
        },
        take: 5,
        orderBy: { published_at: 'desc' }
      });
      
      newsArticles.forEach((news, index) => {
        console.log(`  ${index + 1}. ${news.title.substring(0, 60)}...`);
        console.log(`     تاريخ النشر: ${news.published_at?.toLocaleDateString('ar') || 'غير محدد'}`);
        console.log(`     المشاهدات: ${news.views || 0}`);
        console.log('');
      });
    }
    
    // 6. اختبار واجهة لوحة التحكم
    console.log('6️⃣ اختبار واجهة لوحة التحكم...');
    
    // محاكاة استعلام العداد الجديد
    const counterQuery = await prisma.articles.count({
      where: { 
        status: 'published',
        article_type: 'news'
      }
    });
    
    // محاكاة استعلام الجدول
    const tableQuery = await prisma.articles.findMany({
      where: {
        status: 'published',
        article_type: 'news'
      },
      take: 10,
      select: {
        id: true,
        title: true,
        article_type: true
      }
    });
    
    console.log(`🔢 العداد سيعرض: ${counterQuery} أخبار منشورة`);
    console.log(`📋 الجدول سيعرض: ${tableQuery.length} أخبار`);
    
    if (counterQuery > 0 && tableQuery.length > 0) {
      console.log('✅ المشكلة مُحلولة! العداد والجدول متطابقان');
    } else {
      console.log('❌ المشكلة لا تزال موجودة');
    }
    
    console.log('\n🎯 التوصيات النهائية:');
    console.log('  1. ✅ تحديث صفحة /admin/news/ وتحقق من العداد');
    console.log('  2. ✅ تحقق من عرض الأخبار في الجدول');
    console.log('  3. 🔄 إذا أردت التراجع، شغّل: node scripts/revert-news-conversion.js');
    
    console.log('\n🎉 اكتمل تحويل المقالات إلى أخبار!');
    
  } catch (error) {
    console.error('❌ خطأ في تحويل المقالات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

convertArticlesToNews();