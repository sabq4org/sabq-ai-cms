const { PrismaClient } = require('../lib/generated/prisma');
const prisma = new PrismaClient();

// دالة توليد معرف فريد
function generateUniqueId(prefix = 'art') {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `${prefix}-${year}${month}-${randomPart}`;
}

async function updateArticlesWithUniqueIds() {
  try {
    console.log('🔄 بدء تحديث المقالات بمعرفات فريدة...');
    
    // جلب جميع المقالات
    const articles = await prisma.articles.findMany({
      select: {
        id: true,
        title: true,
        slug: true
      }
    });
    
    console.log(`📊 إجمالي عدد المقالات: ${articles.length}`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const article of articles) {
      try {
        // التحقق من المعرف الحالي
        const currentIdIsArabic = /[\u0600-\u06FF]/.test(article.slug || '');
        const currentIdIsUUID = article.id && article.id.length === 36 && article.id.includes('-');
        const currentIdIsSafe = article.slug && /^[a-z0-9-]+$/.test(article.slug);
        
        if (currentIdIsSafe && !currentIdIsArabic) {
          console.log(`✅ المقال له معرف آمن بالفعل: ${article.slug}`);
          skippedCount++;
          continue;
        }
        
        // توليد معرف فريد جديد
        let newId = generateUniqueId('art');
        
        // التأكد من عدم تكرار المعرف
        let attempts = 0;
        while (attempts < 10) {
          const existing = await prisma.articles.findFirst({
            where: { 
              OR: [
                { id: newId },
                { slug: newId }
              ]
            }
          });
          
          if (!existing) break;
          
          newId = generateUniqueId('art');
          attempts++;
        }
        
        // تحديث المقال
        await prisma.articles.update({
          where: { id: article.id },
          data: { 
            slug: newId,
            updated_at: new Date()
          }
        });
        
        updatedCount++;
        console.log(`🔄 تم تحديث: "${article.title.substring(0, 50)}..." => ${newId}`);
        
      } catch (error) {
        console.error(`❌ خطأ في تحديث المقال ${article.id}:`, error.message);
      }
    }
    
    console.log(`
✨ تم الانتهاء!
- تم تحديث: ${updatedCount} مقال
- تم تخطي: ${skippedCount} مقال (لديها معرفات آمنة)
- الإجمالي: ${articles.length} مقال
    `);
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
updateArticlesWithUniqueIds(); 