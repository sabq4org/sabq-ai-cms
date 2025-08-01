/**
 * فحص بنية التصنيفات وعلاقتها بالمقالات
 * التحقق من صحة فلترة المحتوى حسب التصنيف
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCategoriesSchema() {
  try {
    console.log('🔍 فحص بنية التصنيفات وعلاقتها بالمقالات...\n');
    
    // 1. فحص جدول التصنيفات
    console.log('1️⃣ فحص جدول التصنيفات:');
    
    const categories = await prisma.categories.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        is_active: true
      },
      take: 5
    });
    
    console.log(`📊 عدد التصنيفات: ${categories.length}`);
    console.log('📋 عينة من التصنيفات:');
    categories.forEach((cat, index) => {
      console.log(`  ${index + 1}. ID: ${cat.id}, Name: ${cat.name}, Slug: ${cat.slug}, Active: ${cat.is_active}`);
    });
    
    // 2. فحص ربط المقالات بالتصنيفات
    console.log('\n2️⃣ فحص ربط المقالات بالتصنيفات:');
    
    const articlesWithCategories = await prisma.articles.findMany({
      where: {
        status: 'published',
        article_type: 'news'
      },
      select: {
        id: true,
        title: true,
        category_id: true,
        status: true,
        views: true
      },
      take: 10
    });
    
    console.log(`📊 عدد المقالات المنشورة: ${articlesWithCategories.length}`);
    console.log('📋 عينة من المقالات:');
    articlesWithCategories.forEach((article, index) => {
      console.log(`  ${index + 1}. Title: ${article.title.substring(0, 50)}...`);
      console.log(`     Category ID: ${article.category_id || 'غير محدد'}`);
      console.log(`     Views: ${article.views || 0}`);
      console.log('');
    });
    
    // 3. إحصائيات المقالات لكل تصنيف
    console.log('3️⃣ إحصائيات المقالات لكل تصنيف:');
    
    for (const category of categories) {
      const articleCount = await prisma.articles.count({
        where: {
          category_id: category.id.toString(),
          status: 'published',
          article_type: 'news'
        }
      });
      
      const totalViews = await prisma.articles.aggregate({
        where: {
          category_id: category.id.toString(),
          status: 'published',
          article_type: 'news'
        },
        _sum: {
          views: true
        }
      });
      
      console.log(`📊 ${category.name}:`);
      console.log(`    المقالات: ${articleCount}`);
      console.log(`    المشاهدات: ${totalViews._sum.views || 0}`);
      console.log('');
    }
    
    // 4. فحص التصنيفات بدون مقالات
    console.log('4️⃣ فحص التصنيفات بدون مقالات:');
    
    const categoriesWithoutArticles = [];
    for (const category of categories) {
      const count = await prisma.articles.count({
        where: {
          category_id: category.id.toString(),
          status: 'published'
        }
      });
      
      if (count === 0) {
        categoriesWithoutArticles.push(category);
      }
    }
    
    if (categoriesWithoutArticles.length > 0) {
      console.log('⚠️ تصنيفات بدون مقالات:');
      categoriesWithoutArticles.forEach(cat => {
        console.log(`  - ${cat.name} (${cat.slug})`);
      });
    } else {
      console.log('✅ جميع التصنيفات تحتوي على مقالات');
    }
    
    // 5. اختبار API فلترة التصنيف
    console.log('\n5️⃣ اختبار API فلترة التصنيف:');
    
    if (categories.length > 0) {
      const testCategory = categories[0];
      console.log(`🧪 اختبار التصنيف: ${testCategory.name} (ID: ${testCategory.id})`);
      
      // محاكاة استدعاء API
      console.log(`🔗 محاكاة: GET /api/articles?category_id=${testCategory.id}&status=published`);
      
      const filteredArticles = await prisma.articles.findMany({
        where: {
          category_id: testCategory.id.toString(),
          status: 'published'
        },
        select: {
          id: true,
          title: true,
          views: true
        },
        take: 5
      });
      
      console.log(`📊 النتيجة: ${filteredArticles.length} مقال مفلتر`);
      if (filteredArticles.length > 0) {
        console.log('📋 عينة من المقالات المفلترة:');
        filteredArticles.forEach((article, index) => {
          console.log(`  ${index + 1}. ${article.title.substring(0, 40)}...`);
        });
      }
    }
    
    // 6. فحص أنواع البيانات
    console.log('\n6️⃣ فحص أنواع البيانات:');
    
    const sampleCategory = categories[0];
    const sampleArticle = articlesWithCategories[0];
    
    if (sampleCategory && sampleArticle) {
      console.log(`📋 أنواع البيانات:`);
      console.log(`  Category ID Type: ${typeof sampleCategory.id} (${sampleCategory.id})`);
      console.log(`  Article category_id Type: ${typeof sampleArticle.category_id} (${sampleArticle.category_id})`);
      
      // التحقق من التطابق
      const matches = sampleCategory.id.toString() === sampleArticle.category_id;
      console.log(`  التطابق: ${matches ? '✅ نعم' : '❌ لا'}`);
      
      if (!matches) {
        console.log('⚠️ عدم تطابق في أنواع البيانات - قد يؤثر على الفلترة');
      }
    }
    
    // 7. اختبار slug-based filtering
    console.log('\n7️⃣ اختبار الفلترة بواسطة slug:');
    
    if (categories.length > 0) {
      const testCategory = categories[0];
      console.log(`🧪 اختبار slug: ${testCategory.slug}`);
      
      // البحث عن التصنيف بواسطة slug
      const categoryBySlug = await prisma.categories.findFirst({
        where: {
          slug: testCategory.slug
        }
      });
      
      if (categoryBySlug) {
        console.log(`✅ التصنيف موجود بـ slug: ${categoryBySlug.name}`);
        
        // جلب المقالات بواسطة category_id
        const articlesByCategory = await prisma.articles.count({
          where: {
            category_id: categoryBySlug.id.toString(),
            status: 'published'
          }
        });
        
        console.log(`📊 المقالات في هذا التصنيف: ${articlesByCategory}`);
      } else {
        console.log('❌ التصنيف غير موجود بهذا الـ slug');
      }
    }
    
    // 8. خلاصة الفحص
    console.log('\n📋 خلاصة فحص بنية التصنيفات:');
    
    const issues = [];
    
    // فحص وجود مقالات بدون تصنيف
    const articlesWithoutCategory = await prisma.articles.count({
      where: {
        category_id: null,
        status: 'published'
      }
    });
    
    if (articlesWithoutCategory > 0) {
      issues.push(`${articlesWithoutCategory} مقال بدون تصنيف`);
    }
    
    // فحص التصنيفات غير النشطة
    const inactiveCategories = await prisma.categories.count({
      where: {
        is_active: false
      }
    });
    
    if (inactiveCategories > 0) {
      issues.push(`${inactiveCategories} تصنيف غير نشط`);
    }
    
    if (issues.length > 0) {
      console.log('⚠️ مشاكل محتملة:');
      issues.forEach(issue => console.log(`  - ${issue}`));
    } else {
      console.log('✅ لا توجد مشاكل في بنية التصنيفات');
    }
    
    console.log('\n🎯 توصيات للتحسين:');
    console.log('  1. تأكد من ربط جميع المقالات بتصنيفات');
    console.log('  2. استخدم category_id في API للفلترة');
    console.log('  3. تأكد من تطابق أنواع البيانات (string vs number)');
    console.log('  4. فعّل Cache للإحصائيات لتحسين الأداء');
    
  } catch (error) {
    console.error('❌ خطأ في فحص بنية التصنيفات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategoriesSchema();