const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  try {
    // حذف المقالات الاختبارية
    const deleted = await prisma.articles.deleteMany({
      where: {
        OR: [
          { title: { contains: 'test article' } },
          { title: { contains: 'عنوان جديد كلياً' } },
          { id: { startsWith: 'test-article-' } }
        ]
      }
    });
    
    console.log(`✅ تم حذف ${deleted.count} مقال اختباري`);
    
    // إعادة المقال المميز لحالته الأصلية
    await prisma.articles.update({
      where: { id: 'article_1753939364394_mnuglolbk' },
      data: {
        featured: true,
        featured_image: 'https://res.cloudinary.com/dybhezmvb/image/upload/v1753939359/sabq-cms/featured/featured-1753939358578-lgp0f4.jpg'
      }
    });
    
    console.log('✅ تم إعادة المقال المميز لحالته الأصلية');
    
  } catch (error) {
    console.error('خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();