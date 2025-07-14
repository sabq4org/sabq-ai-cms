#!/usr/bin/env node

const { PrismaClient } = require('../lib/generated/prisma');
const prisma = new PrismaClient();

async function createIndexes() {
  console.log('🚀 بدء إنشاء الفهارس لتحسين الأداء...\n');

  const indexes = [
    // فهارس المقالات
    {
      name: 'idx_articles_status_published',
      query: `CREATE INDEX IF NOT EXISTS idx_articles_status_published ON articles(status, published_at DESC) WHERE status != 'deleted';`
    },
    {
      name: 'idx_articles_category_status',
      query: `CREATE INDEX IF NOT EXISTS idx_articles_category_status ON articles(category_id, status) WHERE status = 'published';`
    },
    {
      name: 'idx_articles_author_status',
      query: `CREATE INDEX IF NOT EXISTS idx_articles_author_status ON articles(author_id, status) WHERE status = 'published';`
    },
    {
      name: 'idx_articles_featured',
      query: `CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(featured, published_at DESC) WHERE featured = true AND status = 'published';`
    },
    {
      name: 'idx_articles_breaking',
      query: `CREATE INDEX IF NOT EXISTS idx_articles_breaking ON articles(breaking, published_at DESC) WHERE breaking = true AND status = 'published';`
    },
    {
      name: 'idx_articles_search',
      query: `CREATE INDEX IF NOT EXISTS idx_articles_search ON articles USING gin(to_tsvector('arabic', title || ' ' || COALESCE(content, '') || ' ' || COALESCE(excerpt, '')));`
    },
    {
      name: 'idx_articles_created_at',
      query: `CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);`
    },
    
    // فهارس التصنيفات
    {
      name: 'idx_categories_active',
      query: `CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active, display_order) WHERE is_active = true;`
    },
    {
      name: 'idx_categories_slug',
      query: `CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);`
    },
    
    // فهارس المستخدمين
    {
      name: 'idx_users_role',
      query: `CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`
    },
    {
      name: 'idx_users_email',
      query: `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`
    },
    
    // فهارس التعليقات
    {
      name: 'idx_comments_article',
      query: `CREATE INDEX IF NOT EXISTS idx_comments_article ON comments(article_id, created_at DESC) WHERE status = 'approved';`
    },
    {
      name: 'idx_comments_user',
      query: `CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id, created_at DESC);`
    }
  ];

  for (const index of indexes) {
    try {
      console.log(`📊 إنشاء فهرس: ${index.name}`);
      await prisma.$executeRawUnsafe(index.query);
      console.log(`✅ تم إنشاء الفهرس بنجاح\n`);
    } catch (error) {
      console.error(`❌ خطأ في إنشاء الفهرس ${index.name}:`, error.message, '\n');
    }
  }
}

async function analyzePerformance() {
  console.log('\n📈 تحليل الأداء الحالي...\n');

  try {
    // تحليل أبطأ الاستعلامات
    const slowQueries = await prisma.$queryRaw`
      SELECT 
        query,
        calls,
        mean_exec_time,
        total_exec_time
      FROM pg_stat_statements
      WHERE query NOT LIKE '%pg_stat_statements%'
      ORDER BY mean_exec_time DESC
      LIMIT 10;
    `;

    console.log('🐌 أبطأ 10 استعلامات:');
    console.table(slowQueries);
  } catch (error) {
    console.log('⚠️ تعذر تحليل الاستعلامات البطيئة (قد تحتاج صلاحيات إضافية)');
  }

  // إحصائيات الجداول
  try {
    const tableStats = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
        n_live_tup AS row_count
      FROM pg_stat_user_tables
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
    `;

    console.log('\n📊 إحصائيات الجداول:');
    console.table(tableStats);
  } catch (error) {
    console.error('❌ خطأ في جلب إحصائيات الجداول:', error.message);
  }
}

async function optimizeQueries() {
  console.log('\n🔧 تحسين الاستعلامات...\n');

  try {
    // تشغيل VACUUM ANALYZE
    console.log('🧹 تشغيل VACUUM ANALYZE...');
    await prisma.$executeRawUnsafe('VACUUM ANALYZE;');
    console.log('✅ تم تحسين الجداول\n');

    // إعادة بناء الإحصائيات
    console.log('📊 إعادة بناء الإحصائيات...');
    await prisma.$executeRawUnsafe('ANALYZE;');
    console.log('✅ تم تحديث الإحصائيات\n');
  } catch (error) {
    console.error('❌ خطأ في تحسين الاستعلامات:', error.message);
  }
}

async function main() {
  try {
    console.log('🏁 بدء عملية تحسين أداء قاعدة البيانات...\n');
    
    // إنشاء الفهارس
    await createIndexes();
    
    // تحليل الأداء
    await analyzePerformance();
    
    // تحسين الاستعلامات
    await optimizeQueries();
    
    console.log('\n✅ اكتملت عملية تحسين الأداء بنجاح!');
  } catch (error) {
    console.error('\n❌ خطأ عام:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 