// فحص مقال يحتوي على صور
const { PrismaClient } = require('@prisma/client');

async function checkArticleWithImages() {
  const prisma = new PrismaClient();
  
  try {
    // فحص المقال الأول الذي يحتوي على صور
    const article = await prisma.articles.findUnique({
      where: { id: 'article_1755792011149_5v34gshi5' },
      select: {
        id: true,
        title: true,
        content: true,
        excerpt: true,
        featured_image: true,
        status: true
      }
    });

    if (!article) {
      console.log('❌ المقال غير موجود');
      return;
    }

    console.log('📄 معلومات المقال:');
    console.log('ID:', article.id);
    console.log('العنوان:', article.title);
    console.log('الحالة:', article.status);
    console.log('الصورة البارزة:', article.featured_image);
    console.log('\n📝 المحتوى الكامل:');
    console.log(article.content);

  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkArticleWithImages();
