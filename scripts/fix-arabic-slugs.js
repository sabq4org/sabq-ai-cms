const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// دالة توليد معرف فريد
function generateUniqueId(prefix = 'art') {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 9);
  
  return `${prefix}-${year}${month}-${timestamp}${random}`;
}

async function fixArabicSlugs() {
  try {
    console.log('🔧 بدء إصلاح الروابط العربية...');
    
    // البحث عن جميع المقالات
    const articles = await prisma.articles.findMany({
      select: {
        id: true,
        title: true,
        slug: true
      }
    });
    
    const arabicArticles = articles.filter(article => 
      article.slug && /[\u0600-\u06FF]/.test(article.slug)
    );
    
    console.log(`📊 وجدت ${arabicArticles.length} مقال مع روابط عربية`);
    
    let updated = 0;
    for (const article of arabicArticles) {
      try {
        // توليد معرف فريد جديد
        const newSlug = generateUniqueId();
        
        await prisma.articles.update({
          where: { id: article.id },
          data: { slug: newSlug }
        });
        
        console.log(`✅ تم تحديث: "${article.title?.substring(0, 40)}..."`);
        console.log(`   من: ${article.slug}`);
        console.log(`   إلى: ${newSlug}`);
        console.log('');
        
        updated++;
      } catch (error) {
        console.error(`❌ فشل تحديث المقال ${article.id}:`, error.message);
      }
    }
    
    console.log(`🎉 تم إصلاح ${updated} مقال بنجاح!`);
    console.log('✅ جميع الروابط الآن تستخدم معرفات فريدة بالإنجليزية');
    
  } catch (error) {
    console.error('❌ خطأ في إصلاح الروابط:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixArabicSlugs();
