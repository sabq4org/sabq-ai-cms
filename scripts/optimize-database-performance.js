#!/usr/bin/env node

const { PrismaClient } = require('../lib/generated/prisma');
const prisma = new PrismaClient();

async function addPerformanceIndices() {
  console.log('🚀 بدء تحسين أداء قاعدة البيانات...');
  
  try {
    // إضافة indices مركبة للمقالات
    console.log('📌 إضافة indices للمقالات...');
    
    // Index مركب للبحث السريع عن المقالات المنشورة
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_articles_status_published_created 
      ON articles(status, published_at DESC, created_at DESC) 
      WHERE status = 'published';
    `;
    
    // Index للبحث بحسب التصنيف والحالة
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_articles_category_status_published 
      ON articles(category_id, status, published_at DESC) 
      WHERE status = 'published';
    `;
    
    // Index للمقالات المميزة والعاجلة
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_articles_featured_breaking 
      ON articles(featured DESC, breaking DESC, published_at DESC) 
      WHERE status = 'published';
    `;
    
    // Index للبحث النصي
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_articles_title_gin 
      ON articles USING gin(to_tsvector('arabic', title));
    `;
    
    // Index للـ views لترتيب المقالات الأكثر قراءة
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_articles_views_published 
      ON articles(views DESC, published_at DESC) 
      WHERE status = 'published';
    `;
    
    console.log('✅ تم إضافة indices المقالات');
    
    // إضافة indices للتصنيفات
    console.log('📌 إضافة indices للتصنيفات...');
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_categories_active_order 
      ON categories(is_active, display_order, name) 
      WHERE is_active = true;
    `;
    
    console.log('✅ تم إضافة indices التصنيفات');
    
    // إضافة indices للمستخدمين
    console.log('📌 إضافة indices للمستخدمين...');
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_users_role 
      ON users(role, is_verified) 
      WHERE is_verified = true;
    `;
    
    console.log('✅ تم إضافة indices المستخدمين');
    
    // تحديث إحصائيات الجداول
    console.log('📊 تحديث إحصائيات الجداول...');
    
    await prisma.$executeRaw`ANALYZE articles;`;
    await prisma.$executeRaw`ANALYZE categories;`;
    await prisma.$executeRaw`ANALYZE users;`;
    
    console.log('✅ تم تحديث الإحصائيات');
    
    // عرض معلومات الأداء
    const articleCount = await prisma.articles.count();
    const publishedCount = await prisma.articles.count({ where: { status: 'published' } });
    
    console.log('\n📈 إحصائيات قاعدة البيانات:');
    console.log(`- إجمالي المقالات: ${articleCount}`);
    console.log(`- المقالات المنشورة: ${publishedCount}`);
    
    // اختبار سرعة الاستعلام
    console.log('\n⏱️ اختبار سرعة الاستعلامات...');
    
    const startTime = Date.now();
    await prisma.articles.findMany({
      where: { status: 'published' },
      orderBy: [
        { published_at: 'desc' },
        { created_at: 'desc' }
      ],
      take: 10,
      include: {
        categories: true
      }
    });
    const endTime = Date.now();
    
    console.log(`✅ وقت جلب 10 مقالات: ${endTime - startTime}ms`);
    
    console.log('\n🎉 تم تحسين أداء قاعدة البيانات بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في تحسين قاعدة البيانات:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
addPerformanceIndices()
  .catch(console.error)
  .finally(() => process.exit()); 