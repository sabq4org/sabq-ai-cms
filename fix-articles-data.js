const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixArticlesData() {
  try {
    console.log('🔄 بدء معالجة بيانات المقالات...');
    
    // 1. إصلاح المقالات بدون تصنيف
    console.log('\n📋 معالجة التصنيفات...');
    
    // جلب التصنيفات المتاحة
    const categories = await prisma.categories.findMany({
      where: { is_active: true },
      select: { id: true, name: true }
    });
    
    console.log(`✅ تم العثور على ${categories.length} تصنيف`);
    categories.forEach(cat => console.log(`  - ${cat.name} (${cat.id})`));
    
    // البحث عن المقالات بدون تصنيف
    const articlesWithoutCategory = await prisma.articles.findMany({
      where: { 
        OR: [
          { category_id: null },
          { category_id: '' }
        ]
      },
      select: { id: true, title: true, content: true }
    });
    
    console.log(`\n🔍 وُجد ${articlesWithoutCategory.length} مقال بدون تصنيف`);
    
    // تصنيف المقالات تلقائياً بناءً على المحتوى
    const categoryKeywords = {
      'cat-001': ['محليات', 'السعودية', 'المملكة', 'الرياض', 'جدة', 'مكة', 'المدينة'],
      'cat-002': ['العالم', 'دولي', 'أمريكا', 'أوروبا', 'آسيا', 'إفريقيا', 'عالمي'],
      'cat-003': ['حياتنا', 'صحة', 'طعام', 'أسرة', 'تربية', 'نمط حياة'],
      'cat-004': ['محطات', 'تقرير', 'تحليل', 'رأي', 'استطلاع'],
      'cat-005': ['رياضة', 'كرة قدم', 'كرة السلة', 'أولمبياد', 'بطولة'],
      'cat-006': ['اقتصاد', 'مال', 'استثمار', 'بورصة', 'تداول', 'شركات'],
      'cat-007': ['أعمال', 'تجارة', 'صناعة', 'مشاريع', 'ريادة']
    };
    
    let categorizedCount = 0;
    
    for (const article of articlesWithoutCategory) {
      const content = (article.title + ' ' + (article.content || '')).toLowerCase();
      let bestCategory = 'cat-004'; // تصنيف افتراضي "محطات"
      let maxMatches = 0;
      
      // البحث عن أفضل تصنيف
      for (const [categoryId, keywords] of Object.entries(categoryKeywords)) {
        const matches = keywords.filter(keyword => content.includes(keyword)).length;
        if (matches > maxMatches) {
          maxMatches = matches;
          bestCategory = categoryId;
        }
      }
      
      // تحديث المقال بالتصنيف الجديد
      await prisma.articles.update({
        where: { id: article.id },
        data: { category_id: bestCategory }
      });
      
      console.log(`  ✅ ${article.title.substring(0, 50)}... → ${categories.find(c => c.id === bestCategory)?.name}`);
      categorizedCount++;
    }
    
    console.log(`\n✅ تم تصنيف ${categorizedCount} مقال`);
    
    // 2. إصلاح المؤلفين
    console.log('\n👤 معالجة المؤلفين...');
    
    // البحث عن المقالات بـ author_id غير صحيح
    const articlesWithBadAuthor = await prisma.articles.findMany({
      where: {
        author_id: { 
          startsWith: 'default-' 
        }
      },
      select: { id: true, title: true, author_id: true }
    });
    
    console.log(`🔍 وُجد ${articlesWithBadAuthor.length} مقال بمؤلف افتراضي`);
    
    // إنشاء مؤلف افتراضي إذا لم يكن موجوداً
    let defaultAuthor = await prisma.users.findFirst({
      where: { email: 'editor@sabq.org' }
    });
    
    if (!defaultAuthor) {
      defaultAuthor = await prisma.users.create({
        data: {
          id: 'default-editor-sabq',
          email: 'editor@sabq.org',
          name: 'محرر صبق',
          role: 'editor',
          is_verified: true,
          updated_at: new Date()
        }
      });
      console.log('✅ تم إنشاء مؤلف افتراضي');
    }
    
    // تحديث المقالات بالمؤلف الافتراضي
    for (const article of articlesWithBadAuthor) {
      await prisma.articles.update({
        where: { id: article.id },
        data: { author_id: defaultAuthor.id }
      });
      console.log(`  ✅ ${article.title.substring(0, 50)}... → ${defaultAuthor.name}`);
    }
    
    // 3. تقرير نهائي
    console.log('\n📊 تقرير نهائي:');
    const finalStats = await Promise.all([
      prisma.articles.count(),
      prisma.articles.count({ where: { category_id: { not: null } } }),
      prisma.articles.count({ where: { author_id: { not: '' } } })
    ]);
    
    console.log(`- إجمالي المقالات: ${finalStats[0]}`);
    console.log(`- مقالات مع تصنيف: ${finalStats[1]} (${Math.round(finalStats[1]/finalStats[0]*100)}%)`);
    console.log(`- مقالات مع مؤلف: ${finalStats[2]} (${Math.round(finalStats[2]/finalStats[0]*100)}%)`);
    
    console.log('\n🎉 تمت معالجة البيانات بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في المعالجة:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixArticlesData();
