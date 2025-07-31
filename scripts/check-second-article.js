const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSecondArticle() {
  try {
    console.log('🔍 فحص الخبر الثاني المميز...\n');
    
    // جلب الأخبار المميزة
    const featuredArticles = await prisma.articles.findMany({
      where: {
        featured: true,
        status: 'published'
      },
      select: {
        id: true,
        title: true,
        featured_image: true,
        excerpt: true,
        content: true
      },
      orderBy: {
        published_at: 'desc'
      },
      take: 3
    });
    
    if (featuredArticles.length >= 2) {
      const secondArticle = featuredArticles[1];
      console.log('📰 الخبر الثاني:');
      console.log(`العنوان: ${secondArticle.title}`);
      console.log(`ID: ${secondArticle.id}`);
      console.log(`الصورة: ${secondArticle.featured_image ? '✅ موجودة' : '❌ مفقودة'}`);
      console.log(`رابط الصورة: ${secondArticle.featured_image || 'لا يوجد'}`);
      console.log(`المقتطف: ${secondArticle.excerpt ? '✅ موجود' : '❌ مفقود'}`);
      console.log(`المحتوى: ${secondArticle.content ? '✅ موجود' : '❌ مفقود'}`);
      
      // فحص الصورة
      if (secondArticle.featured_image) {
        console.log('\n🖼️ تفاصيل الصورة:');
        console.log(`الرابط الكامل: ${secondArticle.featured_image}`);
        
        // التحقق من نوع الصورة
        if (secondArticle.featured_image.includes('cloudinary')) {
          console.log('نوع: Cloudinary');
        } else if (secondArticle.featured_image.includes('s3')) {
          console.log('نوع: S3');
        } else if (secondArticle.featured_image.startsWith('/')) {
          console.log('نوع: محلي');
        }
      }
    } else {
      console.log('⚠️ لا يوجد خبر ثاني مميز');
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSecondArticle();