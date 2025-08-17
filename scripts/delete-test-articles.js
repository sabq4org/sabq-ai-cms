const slugsToDelete = [
  'xjpyasrg',
  'local-news-test-1755423704304'
];

async function deleteArticles() {
  console.log('🗑️ بدء حذف المقالات التجريبية...');
  
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  try {
    // البحث عن المقالات بواسطة slug
    const articles = await prisma.articles.findMany({
      where: {
        slug: {
          in: slugsToDelete
        }
      },
      select: {
        id: true,
        title: true,
        slug: true
      }
    });
    
    console.log(`📄 تم العثور على ${articles.length} مقال للحذف`);
    
    for (const article of articles) {
      console.log(`🗑️ حذف المقال: ${article.title} (${article.slug})`);
      
      // حذف التعليقات المرتبطة
      await prisma.comments.deleteMany({
        where: { article_id: article.id }
      });
      
      // حذف التفاعلات المرتبطة
      await prisma.interactions.deleteMany({
        where: { article_id: article.id }
      });
      
      // حذف الإشعارات المرتبطة
      await prisma.smartNotifications.deleteMany({
        where: {
          OR: [
            { data: { path: ['articleId'], equals: article.id } },
            { data: { path: ['entityId'], equals: article.id } }
          ]
        }
      });
      
      // حذف المقال
      await prisma.articles.delete({
        where: { id: article.id }
      });
      
      console.log(`✅ تم حذف المقال: ${article.title}`);
    }
    
    console.log('✅ تم حذف جميع المقالات التجريبية بنجاح');
    
  } catch (error) {
    console.error('❌ خطأ في حذف المقالات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteArticles();