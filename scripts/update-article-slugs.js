const { PrismaClient } = require('../lib/generated/prisma');
const prisma = new PrismaClient();

// دالة تحويل النص العربي إلى slug
function generateSlug(text) {
  // إزالة التشكيل العربي
  const withoutDiacritics = text.replace(/[\u064B-\u065F\u0670]/g, '');
  
  // استبدال الأحرف الخاصة
  const replacements = {
    'أ': 'a', 'إ': 'e', 'آ': 'a', 'ا': 'a',
    'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j',
    'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'dh',
    'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh',
    'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z',
    'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q',
    'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
    'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a',
    'ة': 'h', 'ء': 'a', 'ئ': 'e', 'ؤ': 'o',
    ' ': '-'
  };
  
  // تحويل الأحرف العربية
  let slug = withoutDiacritics.split('').map(char => 
    replacements[char] || char
  ).join('');
  
  // تنظيف النص
  slug = slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-') // استبدال الأحرف غير المسموحة
    .replace(/-+/g, '-') // دمج الشرطات المتعددة
    .replace(/^-|-$/g, ''); // إزالة الشرطات من البداية والنهاية
  
  // قص الطول إذا كان طويلاً جداً
  if (slug.length > 60) {
    slug = slug.substring(0, 60).replace(/-[^-]*$/, '');
  }
  
  return slug || 'article';
}

async function updateArticleSlugs() {
  try {
    console.log('🔍 البحث عن المقالات بدون slug...');
    
    // جلب جميع المقالات أولاً لفحصها
    const allArticles = await prisma.articles.findMany({
      select: {
        id: true,
        title: true,
        slug: true
      }
    });
    
    console.log(`📋 إجمالي عدد المقالات: ${allArticles.length}`);
    
    // فلترة المقالات التي ليس لديها slug صالح
    const articlesWithoutSlug = allArticles.filter(article => {
      return !article.slug || article.slug.trim() === '' || article.slug === 'null';
    });
    
    console.log(`📋 عدد المقالات بدون slug صالح: ${articlesWithoutSlug.length}`);
    
    if (articlesWithoutSlug.length === 0) {
      console.log('✅ جميع المقالات لديها slug!');
      
      // طباعة بعض الأمثلة من المقالات الموجودة
      console.log('\n📌 أمثلة من المقالات الموجودة:');
      allArticles.slice(0, 3).forEach(article => {
        console.log(`- "${article.title.substring(0, 50)}..." => ${article.slug}`);
      });
      
      return;
    }
    
    // تحديث كل مقال
    let updatedCount = 0;
    const slugMap = new Map();
    
    for (const article of articlesWithoutSlug) {
      try {
        // توليد slug من العنوان
        let baseSlug = generateSlug(article.title);
        let finalSlug = baseSlug;
        let counter = 1;
        
        // التحقق من عدم تكرار الـ slug
        while (slugMap.has(finalSlug) || await prisma.articles.findFirst({
          where: { slug: finalSlug, NOT: { id: article.id } }
        })) {
          finalSlug = `${baseSlug}-${counter}`;
          counter++;
        }
        
        slugMap.set(finalSlug, true);
        
        // تحديث المقال
        await prisma.articles.update({
          where: { id: article.id },
          data: { slug: finalSlug }
        });
        
        updatedCount++;
        console.log(`✅ تم تحديث: "${article.title.substring(0, 50)}..." => ${finalSlug}`);
        
      } catch (error) {
        console.error(`❌ خطأ في تحديث المقال ${article.id}:`, error.message);
      }
    }
    
    console.log(`\n✨ تم تحديث ${updatedCount} من ${articlesWithoutSlug.length} مقال`);
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
updateArticleSlugs(); 