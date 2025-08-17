const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugArticleCreation() {
  try {
    console.log('🔍 فحص البيانات المطلوبة لإنشاء مقال...\n');
    
    // 1. جلب أول مستخدم (للاستخدام كـ author)
    const users = await prisma.users.findMany({
      where: {
        role: {
          in: ['admin', 'editor', 'content-manager']
        }
      },
      take: 3,
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
    
    console.log('👤 المستخدمون المتاحون:');
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email})`);
      console.log(`    ID: ${user.id}`);
      console.log(`    Role: ${user.role}\n`);
    });
    
    if (users.length === 0) {
      console.log('❌ لا يوجد مستخدمون! يجب إنشاء مستخدم أولاً.\n');
    }
    
    // 2. جلب التصنيفات المتاحة
    const categories = await prisma.categories.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        slug: true
      }
    });
    
    console.log('📁 التصنيفات المتاحة:');
    categories.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.slug})`);
      console.log(`    ID: ${cat.id}\n`);
    });
    
    if (categories.length === 0) {
      console.log('❌ لا توجد تصنيفات! يجب إنشاء تصنيف أولاً.\n');
    }
    
    // 3. اقتراح بيانات تجريبية
    if (users.length > 0 && categories.length > 0) {
      console.log('✅ بيانات تجريبية مقترحة لإنشاء مقال:');
      console.log('```json');
      console.log(JSON.stringify({
        title: "مقال تجريبي جديد",
        content: "<p>محتوى المقال التجريبي</p>",
        excerpt: "ملخص المقال التجريبي",
        author_id: users[0].id,
        category_id: categories[0].id,
        status: "draft",
        featured: false,
        breaking: false,
        featured_image: null,
        seo_title: null,
        seo_description: null,
        seo_keywords: null,
        metadata: {
          subtitle: "عنوان فرعي",
          type: "local"
        }
      }, null, 2));
      console.log('```\n');
      
      // 4. محاولة إنشاء مقال تجريبي
      console.log('🧪 محاولة إنشاء مقال تجريبي...');
      try {
        const testArticle = await prisma.articles.create({
          data: {
            id: `test_${Date.now()}`,
            title: `مقال تجريبي - ${new Date().toLocaleString('ar-SA')}`,
            slug: `test-article-${Date.now()}`,
            content: '<p>هذا محتوى تجريبي لاختبار إنشاء المقالات</p>',
            excerpt: 'ملخص تجريبي',
            author_id: users[0].id,
            category_id: categories[0].id,
            status: 'draft',
            featured: false,
            breaking: false,
            created_at: new Date(),
            updated_at: new Date()
          }
        });
        
        console.log('✅ تم إنشاء المقال التجريبي بنجاح!');
        console.log(`   ID: ${testArticle.id}`);
        console.log(`   Title: ${testArticle.title}`);
        
        // حذف المقال التجريبي
        await prisma.articles.delete({
          where: { id: testArticle.id }
        });
        console.log('🗑️  تم حذف المقال التجريبي\n');
        
      } catch (createError) {
        console.error('❌ فشل إنشاء المقال التجريبي:', createError.message);
        if (createError.code === 'P2003') {
          console.error('   السبب: مشكلة في المراجع (author_id أو category_id غير صحيح)');
          console.error('   Meta:', createError.meta);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugArticleCreation();