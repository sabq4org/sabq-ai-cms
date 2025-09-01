const { PrismaClient } = require('@prisma/client');

async function deleteTestArticle() {
  const client = new PrismaClient();
  
  try {
    const articleId = 'article_1756565621808_utd5jyfm6';
    
    console.log('🗑️ جاري حذف المقال التجريبي...');
    console.log('معرف المقال:', articleId);
    
    // التحقق من وجود المقال أولاً
    const article = await client.articles.findUnique({
      where: { id: articleId },
      select: { id: true, title: true, status: true }
    });
    
    if (!article) {
      console.log('❌ المقال غير موجود أو محذوف مسبقاً');
      return;
    }
    
    console.log('📄 المقال الموجود:');
    console.log('- المعرف:', article.id);
    console.log('- العنوان:', article.title);
    console.log('- الحالة:', article.status);
    
    // حذف المقال
    const deleted = await client.articles.delete({
      where: { id: articleId }
    });
    
    console.log('✅ تم حذف المقال بنجاح!');
    console.log('المقال المحذوف:', deleted.title);
    
    // التحقق النهائي
    const checkDeleted = await client.articles.findUnique({
      where: { id: articleId }
    });
    
    if (!checkDeleted) {
      console.log('✅ تأكيد: المقال محذوف نهائياً من قاعدة البيانات');
      console.log('🔄 سيختفي من الواجهة خلال دقيقتين (مدة الكاش)');
    } else {
      console.log('⚠️ تحذير: المقال ما زال موجود');
    }
    
  } catch (error) {
    if (error.code === 'P2025') {
      console.log('❌ المقال غير موجود (قد يكون محذوف مسبقاً)');
    } else {
      console.error('❌ خطأ في الحذف:', error.message);
    }
  } finally {
    await client.$disconnect();
    console.log('🔌 تم قطع الاتصال مع قاعدة البيانات');
  }
}

// تشغيل الحذف
deleteTestArticle()
  .then(() => {
    console.log('🎉 عملية الحذف مكتملة');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 فشل في عملية الحذف:', error);
    process.exit(1);
  });
