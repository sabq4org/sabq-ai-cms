const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkArticleLinks() {
  try {
    console.log('🔍 فحص روابط المقالات الحالية...\n');
    
    // جلب عينة من المقالات المنشورة
    const articles = await prisma.articles.findMany({
      where: {
        status: 'published'
      },
      select: {
        id: true,
        title: true,
        slug: true,
        categories: {
          select: {
            name: true,
            slug: true
          }
        }
      },
      orderBy: {
        published_at: 'desc'
      },
      take: 10
    });
    
    console.log(`📊 عرض آخر ${articles.length} مقالات منشورة:\n`);
    
    articles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   ID: ${article.id}`);
      console.log(`   Slug الحالي: ${article.slug || 'لا يوجد'}`);
      console.log(`   التصنيف: ${article.categories?.name || 'غير محدد'}`);
      
      // عرض الروابط المختلفة
      console.log(`   الروابط المحتملة:`);
      console.log(`   - باستخدام ID: /article/${article.id}`);
      console.log(`   - باستخدام Slug: /article/${article.slug || article.id}`);
      
      // توليد slug عربي من العنوان
      const arabicSlug = article.title
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\u0600-\u06FF\u0750-\u077Fa-zA-Z0-9\-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      console.log(`   - Slug عربي مقترح: /article/${arabicSlug}`);
      console.log('\n');
    });
    
    // إحصائيات عن الـ slugs
    const totalArticles = await prisma.articles.count({
      where: { status: 'published' }
    });
    
    const articlesWithSlug = await prisma.articles.count({
      where: {
        status: 'published',
        slug: { not: null },
        slug: { not: '' }
      }
    });
    
    const articlesWithArabicSlug = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM articles 
      WHERE status = 'published' 
      AND slug IS NOT NULL 
      AND slug != ''
      AND slug ~ '[\\u0600-\\u06FF]'
    `;
    
    console.log('📊 إحصائيات الـ Slugs:');
    console.log(`- إجمالي المقالات المنشورة: ${totalArticles}`);
    console.log(`- المقالات التي لديها slug: ${articlesWithSlug}`);
    console.log(`- المقالات التي لديها slug عربي: ${articlesWithArabicSlug[0]?.count || 0}`);
    console.log(`- المقالات بدون slug: ${totalArticles - articlesWithSlug}`);
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الفحص
checkArticleLinks();