/**
 * إصلاح نوع المقال الأخير ليظهر في الأخبار
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log('🔧 إصلاح نوع المقال الأخير...\n');

async function fixLatestArticleType() {
  try {
    // جلب المقال الأخير المنشور نوع opinion
    const latestOpinionArticle = await prisma.articles.findFirst({
      where: {
        status: 'published',
        article_type: 'opinion'
      },
      orderBy: {
        created_at: 'desc'
      },
      select: {
        id: true,
        title: true,
        article_type: true,
        created_at: true
      }
    });

    if (!latestOpinionArticle) {
      console.log('❌ لم أجد مقالات نوع opinion للإصلاح');
      return;
    }

    console.log('📋 المقال المراد إصلاحه:');
    console.log(`📝 العنوان: ${latestOpinionArticle.title}`);
    console.log(`🏷️  النوع الحالي: ${latestOpinionArticle.article_type}`);
    console.log(`📅 تاريخ الإنشاء: ${latestOpinionArticle.created_at}`);
    console.log(`🆔 المعرف: ${latestOpinionArticle.id}`);

    // تأكيد من المستخدم (لا - سنقوم بالإصلاح مباشرة)
    console.log('\n🔧 تغيير النوع من "opinion" إلى "news"...');

    // تحديث نوع المقال
    const updatedArticle = await prisma.articles.update({
      where: {
        id: latestOpinionArticle.id
      },
      data: {
        article_type: 'news'
      },
      select: {
        id: true,
        title: true,
        article_type: true,
        status: true
      }
    });

    console.log('✅ تم تحديث المقال بنجاح!');
    console.log('📊 البيانات الجديدة:');
    console.log(`📝 العنوان: ${updatedArticle.title}`);
    console.log(`🏷️  النوع الجديد: ${updatedArticle.article_type}`);
    console.log(`✅ الحالة: ${updatedArticle.status}`);

    console.log('\n🎯 النتيجة:');
    console.log('✅ المقال سيظهر الآن في الأخبار');
    console.log('✅ يجب أن يكون مرئياً في /api/news');
    console.log('✅ يجب أن يكون مرئياً في الصفحة الرئيسية');

  } catch (error) {
    console.error('❌ خطأ في إصلاح المقال:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixLatestArticleType();