const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findArabicUrls() {
  try {
    console.log('🔍 البحث عن المقالات التي تحتوي على روابط عربية...');
    
    // البحث عن slug عربي
    const arabicSlugs = await prisma.articles.findMany({
      where: {
        slug: {
          // البحث عن النصوص التي تحتوي على أحرف عربية
          contains: ''
        }
      },
      select: {
        id: true,
        title: true,
        slug: true,
        created_at: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    
    console.log(`📊 عدد المقالات الكلي: ${await prisma.articles.count()}`);
    
    const arabicUrlsFound = arabicSlugs.filter(article => 
      article.slug && /[\u0600-\u06FF]/.test(article.slug)
    );
    
    console.log(`🔍 عدد المقالات مع روابط عربية: ${arabicUrlsFound.length}`);
    
    if (arabicUrlsFound.length > 0) {
      console.log('\n🔗 المقالات مع روابط عربية:');
      arabicUrlsFound.forEach((article, index) => {
        console.log(`${index + 1}. ${article.title?.substring(0, 50)}...`);
        console.log(`   ID: ${article.id}`);
        console.log(`   Slug: ${article.slug}`);
        console.log(`   التاريخ: ${article.created_at.toISOString().split('T')[0]}`);
        console.log('');
      });
      
      console.log('🔧 سنقوم بتحديث هذه المقالات لاستخدام معرفات فريدة...');
    } else {
      console.log('✅ لم نجد مقالات تحتوي على روابط عربية');
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

findArabicUrls();
