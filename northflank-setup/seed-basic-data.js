const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedDatabase() {
  console.log('🌱 بدء إضافة البيانات الأساسية...\n');
  
  try {
    // 1. إضافة التصنيفات الأساسية
    console.log('📁 إضافة التصنيفات...');
    const categories = [
      { id: 'cat-001', name: 'محليات', slug: 'local', color: '#3B82F6', icon: 'home', display_order: 1 },
      { id: 'cat-002', name: 'دولي', slug: 'international', color: '#10B981', icon: 'globe', display_order: 2 },
      { id: 'cat-003', name: 'رياضة', slug: 'sports', color: '#F59E0B', icon: 'activity', display_order: 3 },
      { id: 'cat-004', name: 'اقتصاد', slug: 'economy', color: '#8B5CF6', icon: 'trending-up', display_order: 4 },
      { id: 'cat-005', name: 'تقنية', slug: 'tech', color: '#EF4444', icon: 'cpu', display_order: 5 },
      { id: 'cat-006', name: 'ثقافة', slug: 'culture', color: '#6366F1', icon: 'book', display_order: 6 },
    ];
    
    for (const cat of categories) {
      await prisma.categories.upsert({
        where: { id: cat.id },
        update: cat,
        create: {
          ...cat,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    }
    console.log(`✅ تم إضافة ${categories.length} تصنيفات\n`);
    
    // 2. إضافة مستخدم افتراضي (admin)
    console.log('👤 إضافة مستخدم افتراضي...');
    const adminUser = await prisma.users.upsert({
      where: { email: 'admin@sabq.io' },
      update: {},
      create: {
        id: 'user-admin-001',
        email: 'admin@sabq.io',
        name: 'مدير الموقع',
        role: 'admin',
        is_admin: true,
        is_verified: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    console.log('✅ تم إضافة المستخدم الافتراضي\n');
    
    // 3. إضافة بعض المقالات التجريبية
    console.log('📰 إضافة مقالات تجريبية...');
    const articles = [
      {
        id: 'article-001',
        title: 'مرحباً بكم في موقع سبق الإخباري',
        slug: 'welcome-to-sabq',
        excerpt: 'نرحب بكم في موقع سبق الإخباري، مصدركم الموثوق للأخبار',
        content: '<p>مرحباً بكم في موقع سبق الإخباري. نحن نسعى لتقديم أفضل تغطية إخبارية.</p>',
        category_id: 'cat-001',
        author_id: adminUser.id,
        status: 'published',
        article_type: 'news',
        featured: true,
        published_at: new Date(),
        views: 100
      },
      {
        id: 'article-002',
        title: 'تطورات جديدة في عالم التقنية',
        slug: 'tech-news-update',
        excerpt: 'آخر التطورات في عالم التكنولوجيا والذكاء الاصطناعي',
        content: '<p>شهد عالم التقنية تطورات مذهلة في الفترة الأخيرة...</p>',
        category_id: 'cat-005',
        author_id: adminUser.id,
        status: 'published',
        article_type: 'news',
        published_at: new Date(),
        views: 50
      },
      {
        id: 'article-003',
        title: 'الاقتصاد السعودي يحقق نمواً قوياً',
        slug: 'saudi-economy-growth',
        excerpt: 'تقرير عن نمو الاقتصاد السعودي في الربع الأخير',
        content: '<p>حقق الاقتصاد السعودي نمواً ملحوظاً...</p>',
        category_id: 'cat-004',
        author_id: adminUser.id,
        status: 'published',
        article_type: 'news',
        breaking: true,
        published_at: new Date(),
        views: 200
      }
    ];
    
    for (const article of articles) {
      await prisma.articles.upsert({
        where: { id: article.id },
        update: article,
        create: {
          ...article,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    }
    console.log(`✅ تم إضافة ${articles.length} مقالات تجريبية\n`);
    
    console.log('🎉 تمت إضافة البيانات الأساسية بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في إضافة البيانات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
seedDatabase();
