#!/usr/bin/env node

/**
 * إنشاء Migration لفصل الأخبار عن مقالات الرأي
 * هذا السكريبت ينشئ الجداول الجديدة والعلاقات المطلوبة
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function createSeparationMigration() {
  console.log('🛠️ إنشاء Migration لفصل الأخبار عن مقالات الرأي...\n');
  
  // إنشاء مجلد migrations إن لم يكن موجوداً
  const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }
  
  // إنشاء اسم المجلد بالتاريخ
  const timestamp = new Date().toISOString().replace(/[-T:\.Z]/g, '').slice(0, 14);
  const migrationName = `${timestamp}_separate_news_opinion_tables`;
  const migrationDir = path.join(migrationsDir, migrationName);
  
  if (!fs.existsSync(migrationDir)) {
    fs.mkdirSync(migrationDir, { recursive: true });
  }
  
  // محتوى ملف SQL للمايقريشن
  const migrationSql = `-- CreateTable لفصل الأخبار عن مقالات الرأي
-- Migration: ${migrationName}

-- ═══════════════════════════════════════════════════════════════════════════
-- 📰 جدول الأخبار المنفصل
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE "news_articles" (
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
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_articles_pkey" PRIMARY KEY ("id")
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 📝 جدول مقالات الرأي المنفصل
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE "opinion_articles" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "slug" VARCHAR(500) NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMP(3),
    "scheduled_for" TIMESTAMP(3),
    "writer_id" TEXT NOT NULL,
    "writer_role" VARCHAR(100),
    "writer_specialty" VARCHAR(255),
    "article_type" TEXT NOT NULL DEFAULT 'opinion',
    "opinion_category" VARCHAR(100),
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "is_leader_opinion" BOOLEAN NOT NULL DEFAULT false,
    "difficulty_level" TEXT DEFAULT 'medium',
    "estimated_read" INTEGER,
    "quality_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "engagement_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "ai_rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "featured_image" TEXT,
    "quote_image" TEXT,
    "author_image" TEXT,
    "tags" TEXT[],
    "topics" TEXT[],
    "related_entities" TEXT[],
    "seo_title" VARCHAR(255),
    "seo_description" VARCHAR(500),
    "seo_keywords" TEXT[],
    "social_image" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "saves" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "comments_count" INTEGER NOT NULL DEFAULT 0,
    "reading_time" INTEGER,
    "allow_comments" BOOLEAN NOT NULL DEFAULT true,
    "allow_rating" BOOLEAN NOT NULL DEFAULT true,
    "allow_sharing" BOOLEAN NOT NULL DEFAULT true,
    "ai_summary" TEXT,
    "key_quotes" TEXT[],
    "main_points" TEXT[],
    "conclusion" TEXT,
    "audio_summary_url" TEXT,
    "podcast_url" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opinion_articles_pkey" PRIMARY KEY ("id")
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 📊 جداول الإحصائيات المفصلة
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE "news_analytics" (
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
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_analytics_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "opinion_analytics" (
    "id" TEXT NOT NULL,
    "opinion_article_id" TEXT NOT NULL,
    "total_views" INTEGER NOT NULL DEFAULT 0,
    "unique_views" INTEGER NOT NULL DEFAULT 0,
    "repeat_visits" INTEGER NOT NULL DEFAULT 0,
    "scroll_depth" DOUBLE PRECISION DEFAULT 0.0,
    "completion_rate" DOUBLE PRECISION DEFAULT 0.0,
    "reading_pattern" JSONB,
    "interaction_heat" JSONB,
    "avg_rating" DOUBLE PRECISION DEFAULT 0.0,
    "total_ratings" INTEGER NOT NULL DEFAULT 0,
    "sentiment_score" DOUBLE PRECISION DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opinion_analytics_pkey" PRIMARY KEY ("id")
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 🔗 الفهارس للأداء
-- ═══════════════════════════════════════════════════════════════════════════

-- فهارس جدول الأخبار
CREATE UNIQUE INDEX "news_articles_slug_key" ON "news_articles"("slug");
CREATE INDEX "news_articles_status_published_at_idx" ON "news_articles"("status", "published_at");
CREATE INDEX "news_articles_category_id_idx" ON "news_articles"("category_id");
CREATE INDEX "news_articles_author_id_idx" ON "news_articles"("author_id");
CREATE INDEX "news_articles_breaking_idx" ON "news_articles"("breaking");
CREATE INDEX "news_articles_featured_idx" ON "news_articles"("featured");
CREATE INDEX "news_articles_created_at_idx" ON "news_articles"("created_at");

-- فهارس جدول مقالات الرأي
CREATE UNIQUE INDEX "opinion_articles_slug_key" ON "opinion_articles"("slug");
CREATE INDEX "opinion_articles_status_published_at_idx" ON "opinion_articles"("status", "published_at");
CREATE INDEX "opinion_articles_writer_id_idx" ON "opinion_articles"("writer_id");
CREATE INDEX "opinion_articles_article_type_idx" ON "opinion_articles"("article_type");
CREATE INDEX "opinion_articles_is_leader_opinion_idx" ON "opinion_articles"("is_leader_opinion");
CREATE INDEX "opinion_articles_featured_idx" ON "opinion_articles"("featured");
CREATE INDEX "opinion_articles_tags_idx" ON "opinion_articles" USING GIN ("tags");
CREATE INDEX "opinion_articles_topics_idx" ON "opinion_articles" USING GIN ("topics");
CREATE INDEX "opinion_articles_created_at_idx" ON "opinion_articles"("created_at");
CREATE INDEX "opinion_articles_quality_score_idx" ON "opinion_articles"("quality_score");

-- فهارس جداول الإحصائيات
CREATE UNIQUE INDEX "news_analytics_news_article_id_key" ON "news_analytics"("news_article_id");
CREATE UNIQUE INDEX "opinion_analytics_opinion_article_id_key" ON "opinion_analytics"("opinion_article_id");

-- ═══════════════════════════════════════════════════════════════════════════
-- 🔗 المفاتيح الخارجية والعلاقات
-- ═══════════════════════════════════════════════════════════════════════════

-- العلاقات لجدول الأخبار
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- العلاقات لجدول مقالات الرأي
ALTER TABLE "opinion_articles" ADD CONSTRAINT "opinion_articles_writer_id_fkey" FOREIGN KEY ("writer_id") REFERENCES "article_authors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- العلاقات لجداول الإحصائيات
ALTER TABLE "news_analytics" ADD CONSTRAINT "news_analytics_news_article_id_fkey" FOREIGN KEY ("news_article_id") REFERENCES "news_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "opinion_analytics" ADD CONSTRAINT "opinion_analytics_opinion_article_id_fkey" FOREIGN KEY ("opinion_article_id") REFERENCES "opinion_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
`;

  // كتابة ملف SQL
  const migrationFilePath = path.join(migrationDir, 'migration.sql');
  fs.writeFileSync(migrationFilePath, migrationSql);
  
  console.log(`✅ تم إنشاء ملف Migration بنجاح:`);
  console.log(`📁 ${migrationFilePath}`);
  
  console.log('\n📋 محتويات Migration:');
  console.log('✅ جدول news_articles للأخبار');
  console.log('✅ جدول opinion_articles لمقالات الرأي');
  console.log('✅ جدول news_analytics للإحصائيات');
  console.log('✅ جدول opinion_analytics للتحليلات');
  console.log('✅ جميع الفهارس المطلوبة');
  console.log('✅ العلاقات والمفاتيح الخارجية');
  
  console.log('\n🚀 لتطبيق Migration:');
  console.log('npx prisma db push');
  console.log('أو');
  console.log('npx prisma migrate deploy');
  
  return migrationFilePath;
}

// دالة لإنشاء script ترحيل البيانات
async function createDataMigrationScript() {
  console.log('\n📦 إنشاء سكريبت ترحيل البيانات...');
  
  const dataMigrationScript = `#!/usr/bin/env node

/**
 * سكريبت ترحيل البيانات من جدول articles إلى الجداول المنفصلة
 * يجب تشغيله بعد تطبيق migration الجداول الجديدة
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateExistingData() {
  console.log('🔄 بدء ترحيل البيانات من articles إلى الجداول المنفصلة...');
  
  try {
    // جلب جميع المقالات من الجدول الأصلي
    const allArticles = await prisma.articles.findMany({
      where: {
        status: { in: ['published', 'draft'] }
      },
      include: {
        categories: true,
        author: true,
        article_author: true
      }
    });
    
    console.log(\`📊 تم العثور على \${allArticles.length} مقال للترحيل\`);
    
    let newsCount = 0;
    let opinionCount = 0;
    let errorCount = 0;
    
    for (const article of allArticles) {
      try {
        if (article.article_type === 'news' || article.article_type === 'breaking') {
          // ترحيل للأخبار
          await prisma.news_articles.create({
            data: {
              id: article.id,
              title: article.title,
              slug: article.slug,
              content: article.content,
              excerpt: article.excerpt,
              status: article.status,
              published_at: article.published_at,
              scheduled_for: article.scheduled_for,
              category_id: article.category_id,
              author_id: article.author_id,
              breaking: article.article_type === 'breaking' || article.breaking,
              featured: article.featured,
              urgent: false, // قيمة افتراضية
              source: null, // قيمة افتراضية
              location: null, // قيمة افتراضية
              featured_image: article.featured_image,
              gallery: null, // قيمة افتراضية
              video_url: null, // قيمة افتراضية
              seo_title: article.seo_title,
              seo_description: article.seo_description,
              seo_keywords: article.seo_keywords ? [article.seo_keywords] : [],
              social_image: article.social_image,
              views: article.views,
              likes: article.likes,
              shares: article.shares,
              reading_time: article.reading_time,
              allow_comments: article.allow_comments,
              ai_summary: article.summary,
              audio_summary_url: article.audio_summary_url,
              metadata: article.metadata,
              created_at: article.created_at,
              updated_at: article.updated_at
            }
          });
          newsCount++;
          
        } else if (['opinion', 'analysis', 'interview', 'editorial'].includes(article.article_type)) {
          // ترحيل لمقالات الرأي
          const writerId = article.article_author_id || article.author_id;
          
          await prisma.opinion_articles.create({
            data: {
              id: article.id,
              title: article.title,
              slug: article.slug,
              content: article.content,
              excerpt: article.excerpt,
              status: article.status,
              published_at: article.published_at,
              scheduled_for: article.scheduled_for,
              writer_id: writerId,
              writer_role: null, // يتم تحديثه لاحقاً
              writer_specialty: null, // يتم تحديثه لاحقاً
              article_type: article.article_type,
              opinion_category: null, // يتم تحديثه لاحقاً
              featured: article.featured,
              is_leader_opinion: article.is_opinion_leader || false,
              difficulty_level: 'medium',
              estimated_read: article.reading_time,
              quality_score: 7.0, // قيمة افتراضية
              engagement_score: 0.0,
              ai_rating: 0.0,
              featured_image: article.featured_image,
              quote_image: null,
              author_image: null,
              tags: article.tags || [],
              topics: [],
              related_entities: [],
              seo_title: article.seo_title,
              seo_description: article.seo_description,
              seo_keywords: article.seo_keywords ? [article.seo_keywords] : [],
              social_image: article.social_image,
              views: article.views,
              likes: article.likes,
              saves: article.saves,
              shares: article.shares,
              comments_count: 0,
              reading_time: article.reading_time,
              allow_comments: article.allow_comments,
              allow_rating: true,
              allow_sharing: true,
              ai_summary: article.summary,
              key_quotes: article.ai_quotes || [],
              main_points: [],
              conclusion: null,
              audio_summary_url: article.audio_summary_url,
              podcast_url: null,
              metadata: article.metadata,
              created_at: article.created_at,
              updated_at: article.updated_at
            }
          });
          opinionCount++;
        }
        
      } catch (error) {
        console.error(\`❌ خطأ في ترحيل المقال \${article.id}: \${error.message}\`);
        errorCount++;
      }
    }
    
    console.log(\`\\n✅ انتهى الترحيل:\`);
    console.log(\`📰 أخبار: \${newsCount} مقال\`);
    console.log(\`📝 مقالات رأي: \${opinionCount} مقال\`);
    console.log(\`❌ أخطاء: \${errorCount} مقال\`);
    
    if (errorCount === 0) {
      console.log(\`\\n🎉 تم ترحيل جميع البيانات بنجاح!\`);
    } else {
      console.log(\`\\n⚠️ تم الترحيل مع بعض الأخطاء - راجع التفاصيل أعلاه\`);
    }
    
  } catch (error) {
    console.error('❌ خطأ عام في الترحيل:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الترحيل
if (require.main === module) {
  migrateExistingData().catch(console.error);
}

module.exports = { migrateExistingData };
`;

  const scriptPath = path.join(process.cwd(), 'scripts', 'migrate-articles-data.js');
  fs.writeFileSync(scriptPath, dataMigrationScript);
  
  console.log(`✅ تم إنشاء سكريبت ترحيل البيانات:`);
  console.log(`📁 ${scriptPath}`);
  
  return scriptPath;
}

// تشغيل السكريبت الرئيسي
async function main() {
  try {
    const migrationPath = await createSeparationMigration();
    const dataScriptPath = await createDataMigrationScript();
    
    console.log('\n');
    console.log('═'.repeat(80));
    console.log('🎯 خطوات التنفيذ:');
    console.log('═'.repeat(80));
    console.log('1. تطبيق Migration الجداول الجديدة:');
    console.log('   npx prisma db push');
    console.log('');
    console.log('2. ترحيل البيانات الموجودة:');
    console.log('   node scripts/migrate-articles-data.js');
    console.log('');
    console.log('3. تحديث schema.prisma لإضافة النماذج الجديدة');
    console.log('');
    console.log('4. إنشاء APIs منفصلة للأخبار ومقالات الرأي');
    console.log('');
    console.log('5. تحديث الواجهة الأمامية');
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء Migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل عند استدعاء السكريبت مباشرة
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createSeparationMigration, createDataMigrationScript };`;

  const scriptPath = path.join(process.cwd(), 'scripts', 'create-separated-tables-migration.js');
  fs.writeFileSync(scriptPath, scriptContent);
  
  console.log(`✅ تم إنشاء سكريبت Migration:`);
  console.log(`📁 ${scriptPath}`);
}

// تشغيل إنشاء Migration
if (require.main === module) {
  createSeparationMigration().catch(console.error);
}