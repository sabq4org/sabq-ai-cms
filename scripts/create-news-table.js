#!/usr/bin/env node

/**
 * إنشاء جدول news_articles فقط
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createNewsTable() {
  console.log('🚀 إنشاء جدول news_articles...\n');
  
  try {
    // إنشاء جدول news_articles
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "news_articles" (
          "id" TEXT NOT NULL,
          "title" VARCHAR(500) NOT NULL,
          "slug" VARCHAR(500) NOT NULL,
          "content" TEXT NOT NULL,
          "excerpt" TEXT,
          "status" TEXT NOT NULL DEFAULT 'draft',
          "published_at" TIMESTAMP(3),
          "scheduled_for" TIMESTAMP(3),
          "category_id" TEXT,
          "author_id" TEXT NOT NULL,
          "breaking" BOOLEAN NOT NULL DEFAULT false,
          "featured" BOOLEAN NOT NULL DEFAULT false,
          "urgent" BOOLEAN NOT NULL DEFAULT false,
          "source" VARCHAR(255),
          "location" VARCHAR(255),
          "featured_image" TEXT,
          "gallery" JSONB,
          "video_url" TEXT,
          "seo_title" VARCHAR(255),
          "seo_description" VARCHAR(500),
          "seo_keywords" TEXT[],
          "social_image" TEXT,
          "views" INTEGER NOT NULL DEFAULT 0,
          "likes" INTEGER NOT NULL DEFAULT 0,
          "shares" INTEGER NOT NULL DEFAULT 0,
          "reading_time" INTEGER,
          "allow_comments" BOOLEAN NOT NULL DEFAULT true,
          "ai_summary" TEXT,
          "audio_summary_url" TEXT,
          "metadata" JSONB,
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "news_articles_pkey" PRIMARY KEY ("id")
      );
    `;
    console.log('✅ تم إنشاء جدول news_articles');
    
    // إنشاء جدول news_analytics
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "news_analytics" (
          "id" TEXT NOT NULL,
          "news_article_id" TEXT NOT NULL,
          "total_views" INTEGER NOT NULL DEFAULT 0,
          "unique_views" INTEGER NOT NULL DEFAULT 0,
          "bounce_rate" DOUBLE PRECISION DEFAULT 0.0,
          "avg_time_spent" INTEGER DEFAULT 0,
          "social_shares" JSONB,
          "peak_hour" INTEGER,
          "peak_day" TEXT,
          "top_countries" JSONB,
          "top_cities" JSONB,
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "news_analytics_pkey" PRIMARY KEY ("id")
      );
    `;
    console.log('✅ تم إنشاء جدول news_analytics');
    
    // إنشاء الفهارس
    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "news_articles_slug_key" ON "news_articles"("slug");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "news_articles_status_published_at_idx" ON "news_articles"("status", "published_at");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "news_articles_category_id_idx" ON "news_articles"("category_id");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "news_articles_author_id_idx" ON "news_articles"("author_id");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "news_articles_breaking_idx" ON "news_articles"("breaking");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "news_articles_featured_idx" ON "news_articles"("featured");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "news_articles_created_at_idx" ON "news_articles"("created_at");`;
    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "news_analytics_news_article_id_key" ON "news_analytics"("news_article_id");`;
    
    console.log('✅ تم إنشاء جميع الفهارس');
    
    // إنشاء العلاقات الخارجية
    try {
      await prisma.$executeRaw`ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;`;
    } catch (e) {
      console.log('⚠️ علاقة categories موجودة بالفعل');
    }
    
    try {
      await prisma.$executeRaw`ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;`;
    } catch (e) {
      console.log('⚠️ علاقة users موجودة بالفعل');
    }
    
    try {
      await prisma.$executeRaw`ALTER TABLE "news_analytics" ADD CONSTRAINT "news_analytics_news_article_id_fkey" FOREIGN KEY ("news_article_id") REFERENCES "news_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;`;
    } catch (e) {
      console.log('⚠️ علاقة analytics موجودة بالفعل');
    }
    
    console.log('✅ تم إنشاء العلاقات الخارجية');
    
    // التحقق من النتيجة
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('news_articles', 'opinion_articles', 'news_analytics', 'opinion_analytics')
      ORDER BY table_name;
    `;
    
    console.log('\n📋 الجداول المتاحة الآن:');
    tables.forEach(table => {
      console.log(`✅ ${table.table_name}`);
    });
    
    console.log('\n🎉 تم إنشاء جداول الأخبار بنجاح!');
    
    return { success: true, tablesCreated: tables.length };
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء الجداول:', error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الإنشاء
if (require.main === module) {
  createNewsTable().catch(console.error);
}

module.exports = { createNewsTable };