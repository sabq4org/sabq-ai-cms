const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function optimizeDatabaseForProduction() {
  console.log('🚀 بدء تحسين قاعدة البيانات للإنتاج...');
  
  try {
    // 1. إضافة Indices للمقالات
    console.log('\n📌 إضافة Indices محسنة للمقالات...');
    
    // Index مركب للصفحة الرئيسية (المقالات المنشورة)
    await prisma.$executeRaw`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_homepage 
      ON articles(status, published_at DESC, created_at DESC) 
      WHERE status = 'published';
    `;
    console.log('✅ Index الصفحة الرئيسية');
    
    // Index للبحث بالـ slug (للمقالات الفردية)
    await prisma.$executeRaw`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_slug 
      ON articles(slug) 
      WHERE status != 'deleted';
    `;
    console.log('✅ Index البحث بـ slug');
    
    // Index للبحث بالتصنيف
    await prisma.$executeRaw`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_category_published 
      ON articles(category_id, published_at DESC) 
      WHERE status = 'published';
    `;
    console.log('✅ Index البحث بالتصنيف');
    
    // Index للبحث بالمؤلف
    await prisma.$executeRaw`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_author_published 
      ON articles(author_id, published_at DESC) 
      WHERE status = 'published';
    `;
    console.log('✅ Index البحث بالمؤلف');
    
    // Index للمقالات المميزة
    await prisma.$executeRaw`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_featured 
      ON articles(featured, published_at DESC) 
      WHERE status = 'published' AND featured = true;
    `;
    console.log('✅ Index المقالات المميزة');
    
    // Index للعد السريع
    await prisma.$executeRaw`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_count 
      ON articles(status) 
      WHERE status = 'published';
    `;
    console.log('✅ Index العد السريع');

    // 2. إضافة Indices للتصنيفات
    console.log('\n📌 إضافة Indices للتصنيفات...');
    
    await prisma.$executeRaw`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_active 
      ON categories(is_active, display_order, name) 
      WHERE is_active = true;
    `;
    console.log('✅ Index التصنيفات النشطة');

    // 3. إضافة Indices للمستخدمين
    console.log('\n📌 إضافة Indices للمستخدمين...');
    
    await prisma.$executeRaw`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role 
      ON users(role, created_at DESC);
    `;
    console.log('✅ Index أدوار المستخدمين');

    // 4. إضافة Indices للتعليقات
    console.log('\n📌 إضافة Indices للتعليقات...');
    
    await prisma.$executeRaw`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_article 
      ON comments(article_id, created_at DESC);
    `;
    console.log('✅ Index التعليقات حسب المقال');

    // 5. تحديث إحصائيات الجداول
    console.log('\n📊 تحديث إحصائيات الجداول...');
    
    await prisma.$executeRaw`ANALYZE articles;`;
    await prisma.$executeRaw`ANALYZE categories;`;
    await prisma.$executeRaw`ANALYZE users;`;
    await prisma.$executeRaw`ANALYZE comments;`;
    console.log('✅ تم تحديث الإحصائيات');

    // 6. عرض معلومات الـ Indices
    console.log('\n📋 معلومات الـ Indices الحالية:');
    
    const indices = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        indexname,
        pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
      FROM pg_indexes
      JOIN pg_class ON pg_indexes.indexname = pg_class.relname
      WHERE schemaname = 'public' 
      AND tablename IN ('articles', 'categories', 'users', 'comments')
      ORDER BY tablename, indexname;
    `;
    
    console.table(indices);

    // 7. معلومات الأداء
    console.log('\n📈 معلومات أداء الجداول:');
    
    const tableStats = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        n_live_tup as "عدد السجلات الحية",
        n_dead_tup as "عدد السجلات الميتة",
        pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as "حجم الجدول"
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
      AND tablename IN ('articles', 'categories', 'users', 'comments')
      ORDER BY n_live_tup DESC;
    `;
    
    console.table(tableStats);

    console.log('\n✅ تم تحسين قاعدة البيانات بنجاح!');
    
    // توصيات إضافية
    console.log('\n💡 توصيات إضافية للإنتاج:');
    console.log('1. تفعيل Redis للتخزين المؤقت');
    console.log('2. تفعيل Cloudflare CDN مع Page Rules');
    console.log('3. ضبط connection pooling في Prisma');
    console.log('4. استخدام PM2 أو similar للـ process management');
    console.log('5. تفعيل compression في Next.js');

  } catch (error) {
    console.error('❌ خطأ في تحسين قاعدة البيانات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل التحسينات
optimizeDatabaseForProduction(); 