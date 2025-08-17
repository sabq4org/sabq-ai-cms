const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkArticlesCount() {
  try {
    console.log('🔍 فحص عدد المقالات في قاعدة البيانات...');
    
    // إجمالي عدد المقالات
    const totalArticles = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM articles;
    `;
    console.log('📊 إجمالي المقالات:', Number(totalArticles[0]?.count) || 0);
    
    // المقالات المنشورة
    const publishedArticles = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM articles WHERE status = 'published';
    `;
    console.log('✅ المقالات المنشورة:', Number(publishedArticles[0]?.count) || 0);
    
    // حالات المقالات المختلفة
    const articleStates = await prisma.$queryRaw`
      SELECT status, COUNT(*) as count 
      FROM articles 
      GROUP BY status;
    `;
    console.log('📊 حالات المقالات:');
    articleStates.forEach(state => {
      console.log(`  - ${state.status}: ${Number(state.count)} مقال`);
    });
    
    // فحص عينة من المقالات مع تصنيفاتها
    const sampleArticles = await prisma.$queryRaw`
      SELECT id, title, category_id, status 
      FROM articles 
      LIMIT 5;
    `;
    console.log('📋 عينة من المقالات:');
    sampleArticles.forEach((article, index) => {
      console.log(`  ${index + 1}. ${article.title || 'بدون عنوان'} - تصنيف: ${article.category_id} - حالة: ${article.status}`);
    });
    
    // فحص التصنيفات وعدد المقالات
    const categoriesWithCount = await prisma.$queryRaw`
      SELECT 
        c.id, 
        c.name, 
        COUNT(a.id) as articles_count
      FROM categories c
      LEFT JOIN articles a ON c.id = a.category_id 
        AND a.status = 'published'
      WHERE c.is_active = true
      GROUP BY c.id, c.name
      ORDER BY articles_count DESC;
    `;
    
    console.log('🏷️ التصنيفات مع عدد المقالات:');
    categoriesWithCount.forEach(cat => {
      console.log(`  - ${cat.name}: ${Number(cat.articles_count)} مقال`);
    });
    
  } catch (error) {
    console.error('❌ خطأ في فحص المقالات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkArticlesCount();