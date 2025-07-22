const { PrismaClient } = require('../lib/generated/prisma');
const prisma = new PrismaClient();

async function optimizePerformanceUrgent() {
  console.log('🚀 بدء تحسين الأداء العاجل...\n');

  try {
    // 1. إضافة الـ indexes الأساسية للمقالات
    console.log('📌 إضافة indexes محسنة للمقالات...');
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_articles_performance_main 
      ON articles(status, published_at DESC, created_at DESC) 
      WHERE status = 'published';
    `;
    console.log('✅ Index أساسي للمقالات المنشورة');

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_articles_category_fast 
      ON articles(category_id, status, published_at DESC) 
      WHERE status = 'published';
    `;
    console.log('✅ Index للبحث بالتصنيف');

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_articles_featured_fast 
      ON articles(featured, status, published_at DESC) 
      WHERE featured = true AND status = 'published';
    `;
    console.log('✅ Index للمقالات المميزة');

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_articles_views_fast 
      ON articles(views DESC, published_at DESC) 
      WHERE status = 'published' AND views IS NOT NULL;
    `;
    console.log('✅ Index للمقالات الأكثر قراءة');

    // 2. فهارس للتصنيفات
    console.log('\n📂 إضافة indexes للتصنيفات...');
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_categories_active_fast 
      ON categories(is_active, display_order, name) 
      WHERE is_active = true;
    `;
    console.log('✅ Index للتصنيفات النشطة');

    // 3. فهارس للتفاعلات
    console.log('\n❤️ إضافة indexes للتفاعلات...');
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_interactions_article_type 
      ON interactions(article_id, type, created_at DESC);
    `;
    console.log('✅ Index للتفاعلات');

    // 4. تحديث إحصائيات الجداول
    console.log('\n📊 تحديث إحصائيات الجداول...');
    
    await prisma.$executeRaw`ANALYZE articles;`;
    await prisma.$executeRaw`ANALYZE categories;`;
    await prisma.$executeRaw`ANALYZE interactions;`;
    console.log('✅ تم تحديث الإحصائيات');

    // 5. اختبار سرعة الاستعلام
    console.log('\n⏱️ اختبار سرعة الأداء...');
    
    const startTime = Date.now();
    
    const testResult = await prisma.articles.findMany({
      where: { status: 'published' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        published_at: true,
        featured_image: true,
        views: true,
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true
          }
        }
      },
      orderBy: [
        { published_at: 'desc' },
        { created_at: 'desc' }
      ],
      take: 16
    });
    
    const endTime = Date.now();
    const queryTime = endTime - startTime;
    
    console.log(`✅ زمن جلب 16 مقال: ${queryTime}ms`);
    console.log(`📊 عدد المقالات المسترجعة: ${testResult.length}`);
    
    if (queryTime < 200) {
      console.log('🎉 الأداء ممتاز! (أقل من 200ms)');
    } else if (queryTime < 500) {
      console.log('✅ الأداء جيد (أقل من 500ms)');
    } else {
      console.log('⚠️ الأداء يحتاج مزيد من التحسين');
    }

    // 6. عرض معلومات الأداء
    console.log('\n📈 إحصائيات النظام:');
    
    const stats = await Promise.all([
      prisma.articles.count({ where: { status: 'published' } }),
      prisma.categories.count({ where: { is_active: true } }),
      prisma.interactions.count()
    ]);
    
    console.log(`- المقالات المنشورة: ${stats[0]}`);
    console.log(`- التصنيفات النشطة: ${stats[1]}`);
    console.log(`- إجمالي التفاعلات: ${stats[2]}`);

    console.log('\n🎯 تم تحسين قاعدة البيانات بنجاح!');
    console.log('📝 النصائح التالية:');
    console.log('  1. إعادة تشغيل الخادم لتطبيق التحسينات');
    console.log('  2. مراقبة الأداء في الـ logs');
    console.log('  3. استخدام Redis caching للمزيد من السرعة');

  } catch (error) {
    console.error('❌ خطأ في تحسين قاعدة البيانات:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل التحسين
optimizePerformanceUrgent()
  .then(() => {
    console.log('\n✅ انتهى تحسين الأداء بنجاح!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ فشل في تحسين الأداء:', error);
    process.exit(1);
  });
