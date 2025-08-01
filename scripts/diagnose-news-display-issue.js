/**
 * تشخيص سريع لمشكلة عدم ظهور الأخبار رغم وجود العداد
 * المشكلة: العداد يعرض 27 خبر لكن الجدول يقول "لا توجد أخبار"
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnoseNewsDisplayIssue() {
  try {
    console.log('🔍 تشخيص مشكلة عرض الأخبار في لوحة التحكم...\n');
    
    // 1. فحص العداد - ما يظهر في الأعلى
    console.log('1️⃣ فحص العداد (الإحصائيات العلوية)...');
    
    const publishedCount = await prisma.articles.count({
      where: { status: 'published' }
    });
    
    console.log(`📊 إجمالي المقالات المنشورة: ${publishedCount}`);
    console.log('👆 هذا ما يظهر في العداد العلوي');
    
    // 2. فحص الفلتر الجديد - ما يجب أن يظهر في الجدول
    console.log('\n2️⃣ فحص فلتر الأخبار الجديد...');
    
    const newsCount = await prisma.articles.count({
      where: {
        status: 'published',
        article_type: 'news'  // الفلتر الجديد
      }
    });
    
    console.log(`📰 الأخبار المنشورة (article_type='news'): ${newsCount}`);
    console.log('👆 هذا ما يجب أن يظهر في الجدول');
    
    // 3. تحليل التضارب
    console.log('\n3️⃣ تحليل المشكلة...');
    
    if (publishedCount > 0 && newsCount === 0) {
      console.log('❌ مشكلة مؤكدة: العداد يحسب كل المقالات، الجدول يفلتر الأخبار فقط');
      console.log('🔧 الحل: إما تحديث العداد أو تحويل المحتوى إلى أخبار');
    } else if (newsCount > 0) {
      console.log('✅ البيانات موجودة - المشكلة في عرض الواجهة');
    } else {
      console.log('⚠️ لا توجد مقالات منشورة على الإطلاق');
    }
    
    // 4. تحليل أنواع المقالات الموجودة
    console.log('\n4️⃣ تحليل أنواع المحتوى الموجود...');
    
    const typeBreakdown = await prisma.articles.groupBy({
      by: ['article_type'],
      where: { status: 'published' },
      _count: { id: true }
    });
    
    console.log('📋 توزيع المحتوى المنشور حسب النوع:');
    typeBreakdown.forEach(item => {
      const type = item.article_type || 'غير محدد';
      console.log(`  • ${type}: ${item._count.id} مقال`);
    });
    
    // 5. عرض عينة من المقالات المنشورة
    console.log('\n5️⃣ عينة من المقالات المنشورة...');
    
    const sampleArticles = await prisma.articles.findMany({
      where: { status: 'published' },
      select: {
        id: true,
        title: true,
        article_type: true,
        status: true,
        published_at: true
      },
      take: 5,
      orderBy: { published_at: 'desc' }
    });
    
    console.log('📝 آخر 5 مقالات منشورة:');
    sampleArticles.forEach((article, index) => {
      console.log(`  ${index + 1}. ${article.title.substring(0, 50)}...`);
      console.log(`     النوع: ${article.article_type || 'غير محدد'}`);
      console.log(`     الحالة: ${article.status}`);
      console.log(`     تاريخ النشر: ${article.published_at || 'غير محدد'}`);
      console.log('');
    });
    
    // 6. محاكاة استعلام الواجهة
    console.log('6️⃣ محاكاة استعلام الواجهة الحالي...');
    
    // ما يحدث في العداد (القديم)
    const counterQuery = await prisma.articles.count({
      where: { status: 'published' }
    });
    
    // ما يحدث في الجدول (الجديد)
    const tableQuery = await prisma.articles.findMany({
      where: {
        status: 'published',
        article_type: 'news'  // الفلتر الجديد
      },
      take: 10,
      select: {
        id: true,
        title: true,
        article_type: true,
        status: true
      }
    });
    
    console.log(`🔢 العداد يعرض: ${counterQuery} (كل المقالات المنشورة)`);
    console.log(`📋 الجدول يعرض: ${tableQuery.length} (الأخبار فقط)`);
    
    if (counterQuery > 0 && tableQuery.length === 0) {
      console.log('\n❌ التشخيص: تضارب بين العداد والجدول!');
      console.log('🎯 الحل المطلوب:');
      console.log('  خيار 1: تحديث العداد ليحسب الأخبار فقط');
      console.log('  خيار 2: تحويل بعض المقالات إلى نوع "news"');
      console.log('  خيار 3: إزالة فلتر article_type مؤقتاً');
    }
    
    // 7. اقتراح حل سريع
    console.log('\n💡 اقتراح حل سريع...');
    
    if (newsCount === 0 && publishedCount > 0) {
      console.log('🔧 حل مُقترح: تحويل بعض المقالات إلى أخبار');
      
      // اختيار أول 5 مقالات لتحويلها
      const articlesToConvert = await prisma.articles.findMany({
        where: {
          status: 'published',
          article_type: { in: ['opinion', 'analysis'] }
        },
        take: 5,
        select: { id: true, title: true, article_type: true }
      });
      
      if (articlesToConvert.length > 0) {
        console.log('\n📝 مقالات مُقترحة للتحويل إلى أخبار:');
        articlesToConvert.forEach((article, index) => {
          console.log(`  ${index + 1}. ${article.title.substring(0, 60)}...`);
          console.log(`     النوع الحالي: ${article.article_type}`);
        });
        
        console.log('\n🔄 لتطبيق التحويل، شغّل:');
        console.log('node scripts/convert-articles-to-news.js');
      }
    }
    
    console.log('\n🎯 التوصيات النهائية:');
    console.log('  1. ✅ تحديث العداد ليحسب الأخبار فقط');
    console.log('  2. 🔄 تحويل بعض المقالات إلى نوع "news"');
    console.log('  3. 🧪 اختبار الواجهة بعد التحديث');
    
  } catch (error) {
    console.error('❌ خطأ في التشخيص:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseNewsDisplayIssue();