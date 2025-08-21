// script للفحص المباشر من قاعدة البيانات
const { PrismaClient } = require('@prisma/client');

async function checkArticleContent() {
  const prisma = new PrismaClient();
  
  try {
    // البحث عن المقال
    const article = await prisma.articles.findUnique({
      where: { id: 'a1zk6c82' },
      select: {
        id: true,
        title: true,
        content: true,
        excerpt: true,
        status: true,
        featured_image: true,
        created_at: true,
        updated_at: true
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
    console.log('التاريخ:', article.created_at);
    console.log('آخر تحديث:', article.updated_at);
    console.log('الصورة البارزة:', article.featured_image ? 'موجودة' : 'غير موجودة');
    console.log('الملخص:', article.excerpt ? `موجود (${article.excerpt.length} حرف)` : 'غير موجود');
    console.log('المحتوى:', article.content ? `موجود (${article.content.length} حرف)` : 'غير موجود');
    
    if (article.content) {
      console.log('📝 عينة من المحتوى:', article.content.substring(0, 200) + '...');
    }

  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkArticleContent();
