#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function optimizeDatabase() {
  console.log('🚀 بدء تحسين أداء قاعدة البيانات...\n');

  try {
    // 1. تحليل وتحديث إحصائيات الجداول
    console.log('📊 تحديث إحصائيات الجداول...');
    await prisma.$executeRaw`ANALYZE articles;`;
    await prisma.$executeRaw`ANALYZE categories;`;
    await prisma.$executeRaw`ANALYZE users;`;
    await prisma.$executeRaw`ANALYZE comments;`;
    console.log('✅ تم تحديث الإحصائيات\n');

    // 2. إضافة فهارس لتحسين الأداء
    console.log('🔍 فحص وإنشاء الفهارس...');
    
    // فهرس للبحث السريع في المقالات
    try {
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_articles_status_published ON articles(status, published_at DESC) WHERE status = 'published';`;
      console.log('✅ فهرس المقالات المنشورة');
    } catch (e) {
      console.log('⚠️  فهرس المقالات موجود مسبقاً');
    }

    // فهرس للبحث بالتصنيف
    try {
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id, status, published_at DESC);`;
      console.log('✅ فهرس التصنيفات');
    } catch (e) {
      console.log('⚠️  فهرس التصنيفات موجود مسبقاً');
    }

    // فهرس للمقالات المميزة
    try {
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(featured, status, published_at DESC) WHERE featured = true;`;
      console.log('✅ فهرس المقالات المميزة');
    } catch (e) {
      console.log('⚠️  فهرس المقالات المميزة موجود مسبقاً');
    }

    // فهرس للتعليقات
    try {
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_comments_article ON comments(article_id, status, created_at DESC);`;
      console.log('✅ فهرس التعليقات');
    } catch (e) {
      console.log('⚠️  فهرس التعليقات موجود مسبقاً');
    }

    // 3. تنظيف البيانات القديمة
    console.log('\n🧹 تنظيف البيانات القديمة...');
    
    // حذف المسودات القديمة (أكثر من 30 يوم)
    const deletedDrafts = await prisma.article.deleteMany({
      where: {
        status: 'draft',
        created_at: {
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    });
    console.log(`✅ تم حذف ${deletedDrafts.count} مسودة قديمة`);

    // 4. تحديث إحصائيات المشاهدات
    console.log('\n📈 تحديث إحصائيات المشاهدات...');
    const articlesWithoutViews = await prisma.article.updateMany({
      where: {
        views: null
      },
      data: {
        views: 0
      }
    });
    console.log(`✅ تم تحديث ${articlesWithoutViews.count} مقال`);

    // 5. فحص الاتصال بقاعدة البيانات
    console.log('\n🔌 فحص سرعة الاتصال...');
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - startTime;
    console.log(`✅ زمن الاستجابة: ${responseTime}ms`);

    if (responseTime > 100) {
      console.log('⚠️  زمن الاستجابة بطيء، قد تحتاج لتحسين الاتصال');
    }

    // 6. عرض إحصائيات عامة
    console.log('\n📊 إحصائيات قاعدة البيانات:');
    const articleCount = await prisma.article.count();
    const userCount = await prisma.user.count();
    const commentCount = await prisma.comment.count();
    const categoryCount = await prisma.category.count();

    console.log(`- عدد المقالات: ${articleCount}`);
    console.log(`- عدد المستخدمين: ${userCount}`);
    console.log(`- عدد التعليقات: ${commentCount}`);
    console.log(`- عدد التصنيفات: ${categoryCount}`);

    console.log('\n✅ تم تحسين أداء قاعدة البيانات بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في تحسين قاعدة البيانات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل التحسين
optimizeDatabase(); 