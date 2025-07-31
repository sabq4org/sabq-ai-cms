const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * تحويل العنوان إلى slug عربي متوافق مع URL
 */
function generateArabicSlug(title) {
  if (!title) return null;
  
  return title
    .trim()
    .replace(/\s+/g, '-') // استبدال المسافات بشرطات
    .replace(/[^\u0600-\u06FF\u0750-\u077Fa-zA-Z0-9\-]/g, '') // إزالة الرموز غير المسموح بها
    .replace(/-+/g, '-') // دمج الشرطات المتعددة
    .replace(/^-|-$/g, ''); // إزالة الشرطات من البداية والنهاية
}

async function updateArabicSlugs() {
  try {
    console.log('🚀 بدء تحديث slugs العربية للمقالات...\n');
    
    // جلب جميع المقالات التي تحتاج لتحديث slug
    const articles = await prisma.articles.findMany({
      where: {
        OR: [
          { slug: null },
          { slug: '' },
          // المقالات التي لديها slug إنجليزي أو معرف
          { slug: { not: { contains: '-' } } }
        ]
      },
      select: {
        id: true,
        title: true,
        slug: true
      },
      take: 100 // معالجة 100 مقال في كل مرة
    });
    
    console.log(`📊 عدد المقالات التي تحتاج تحديث: ${articles.length}\n`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const article of articles) {
      // توليد slug عربي من العنوان
      const arabicSlug = generateArabicSlug(article.title);
      
      if (!arabicSlug) {
        console.log(`⚠️ تخطي المقال ${article.id} - لا يمكن توليد slug`);
        skippedCount++;
        continue;
      }
      
      // التحقق من أن الـ slug فريد
      const existingArticle = await prisma.articles.findFirst({
        where: {
          slug: arabicSlug,
          id: { not: article.id }
        }
      });
      
      if (existingArticle) {
        // إضافة رقم عشوائي لجعله فريد
        const uniqueSlug = `${arabicSlug}-${Math.random().toString(36).substring(2, 6)}`;
        
        await prisma.articles.update({
          where: { id: article.id },
          data: { slug: uniqueSlug }
        });
        
        console.log(`✅ تحديث: ${article.title.substring(0, 50)}...`);
        console.log(`   Slug القديم: ${article.slug || 'لا يوجد'}`);
        console.log(`   Slug الجديد: ${uniqueSlug}\n`);
      } else {
        await prisma.articles.update({
          where: { id: article.id },
          data: { slug: arabicSlug }
        });
        
        console.log(`✅ تحديث: ${article.title.substring(0, 50)}...`);
        console.log(`   Slug القديم: ${article.slug || 'لا يوجد'}`);
        console.log(`   Slug الجديد: ${arabicSlug}\n`);
      }
      
      updatedCount++;
    }
    
    console.log('\n📊 ملخص التحديث:');
    console.log(`✅ تم تحديث: ${updatedCount} مقال`);
    console.log(`⚠️ تم تخطي: ${skippedCount} مقال`);
    
    // عرض بعض الأمثلة
    console.log('\n📝 أمثلة على المقالات المحدثة:');
    const examples = await prisma.articles.findMany({
      where: {
        slug: { contains: '-' },
        slug: { contains: 'ا' } // التأكد من وجود حرف عربي
      },
      select: {
        id: true,
        title: true,
        slug: true
      },
      take: 5
    });
    
    examples.forEach(article => {
      console.log(`\n- العنوان: ${article.title}`);
      console.log(`  الرابط: /article/${article.slug}`);
    });
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل التحديث
updateArabicSlugs();