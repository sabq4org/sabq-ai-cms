#!/usr/bin/env node

/**
 * إصلاح مشاكل الترحيل وتحديث البيانات
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixMigrationIssues() {
  console.log('🔧 إصلاح مشاكل الترحيل...\n');
  
  try {
    // 1. فحص البيانات الموجودة
    console.log('📊 فحص البيانات الحالية...');
    
    const articlesCount = await prisma.articles.count();
    console.log(`   articles: ${articlesCount} مقال`);
    
    // 2. فحص الجداول الجديدة بـ Raw SQL
    const tablesCheck = await prisma.$queryRaw`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_name IN ('news_articles', 'opinion_articles', 'news_analytics', 'opinion_analytics')
      ORDER BY table_name;
    `;
    
    console.log('\n📋 الجداول الجديدة:');
    tablesCheck.forEach(table => {
      console.log(`   ✅ ${table.table_name} (${table.column_count} أعمدة)`);
    });
    
    // 3. ترحيل البيانات يدوياً باستخدام Raw SQL
    console.log('\n🔄 بدء ترحيل البيانات باستخدام Raw SQL...');
    
    // ترحيل الأخبار
    const newsInsertResult = await prisma.$executeRaw`
      INSERT INTO news_articles (
        id, title, slug, content, excerpt, status, published_at, scheduled_for,
        category_id, author_id, breaking, featured, urgent,
        featured_image, seo_title, seo_description, seo_keywords, social_image,
        views, likes, shares, reading_time, allow_comments,
        ai_summary, audio_summary_url, metadata, created_at, updated_at
      )
      SELECT 
        id, title, slug, content, excerpt, status, published_at, scheduled_for,
        category_id, author_id, 
        COALESCE(breaking, false) as breaking,
        COALESCE(featured, false) as featured,
        false as urgent,
        featured_image, seo_title, seo_description, 
        CASE WHEN seo_keywords IS NOT NULL THEN ARRAY[seo_keywords] ELSE ARRAY[]::text[] END as seo_keywords,
        social_image,
        COALESCE(views, 0) as views,
        COALESCE(likes, 0) as likes, 
        COALESCE(shares, 0) as shares,
        reading_time,
        COALESCE(allow_comments, true) as allow_comments,
        summary as ai_summary,
        audio_summary_url,
        COALESCE(metadata, '{}') as metadata,
        created_at, updated_at
      FROM articles 
      WHERE article_type = 'news' 
      AND status IN ('published', 'draft')
      ON CONFLICT (id) DO NOTHING;
    `;
    
    console.log(`✅ تم ترحيل ${newsInsertResult} خبر إلى news_articles`);
    
    // ترحيل مقالات الرأي
    const opinionInsertResult = await prisma.$executeRaw`
      INSERT INTO opinion_articles (
        id, title, slug, content, excerpt, status, published_at, scheduled_for,
        writer_id, article_type, featured, is_leader_opinion,
        difficulty_level, estimated_read, quality_score, engagement_score, ai_rating,
        featured_image, tags, topics, related_entities,
        seo_title, seo_description, seo_keywords, social_image,
        views, likes, saves, shares, comments_count, reading_time,
        allow_comments, allow_rating, allow_sharing,
        ai_summary, key_quotes, main_points,
        audio_summary_url, metadata, created_at, updated_at
      )
      SELECT 
        id, title, slug, content, excerpt, status, published_at, scheduled_for,
        COALESCE(article_author_id, author_id) as writer_id,
        article_type,
        COALESCE(featured, false) as featured,
        COALESCE(is_opinion_leader, false) as is_leader_opinion,
        'medium' as difficulty_level,
        reading_time as estimated_read,
        7.0 as quality_score,
        0.0 as engagement_score,
        0.0 as ai_rating,
        featured_image,
        COALESCE(tags, ARRAY[]::text[]) as tags,
        ARRAY[]::text[] as topics,
        ARRAY[]::text[] as related_entities,
        seo_title, seo_description,
        CASE WHEN seo_keywords IS NOT NULL THEN ARRAY[seo_keywords] ELSE ARRAY[]::text[] END as seo_keywords,
        social_image,
        COALESCE(views, 0) as views,
        COALESCE(likes, 0) as likes,
        COALESCE(saves, 0) as saves,
        COALESCE(shares, 0) as shares,
        0 as comments_count,
        reading_time,
        COALESCE(allow_comments, true) as allow_comments,
        true as allow_rating,
        true as allow_sharing,
        summary as ai_summary,
        COALESCE(ai_quotes, ARRAY[]::text[]) as key_quotes,
        ARRAY[]::text[] as main_points,
        audio_summary_url,
        COALESCE(metadata, '{}') as metadata,
        created_at, updated_at
      FROM articles 
      WHERE article_type IN ('opinion', 'analysis', 'interview', 'editorial')
      AND status IN ('published', 'draft')
      ON CONFLICT (id) DO NOTHING;
    `;
    
    console.log(`✅ تم ترحيل ${opinionInsertResult} مقال رأي إلى opinion_articles`);
    
    // 4. التحقق من النتائج
    console.log('\n🔍 التحقق من النتائج...');
    
    const finalNewsCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM news_articles`;
    const finalOpinionCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM opinion_articles`;
    
    console.log(`📰 news_articles: ${finalNewsCount[0].count} مقال`);
    console.log(`📝 opinion_articles: ${finalOpinionCount[0].count} مقال`);
    
    // 5. عرض عينة من البيانات المرحلة
    const sampleNews = await prisma.$queryRaw`
      SELECT id, title, status, created_at 
      FROM news_articles 
      ORDER BY created_at DESC 
      LIMIT 3
    `;
    
    const sampleOpinions = await prisma.$queryRaw`
      SELECT id, title, status, created_at 
      FROM opinion_articles 
      ORDER BY created_at DESC 
      LIMIT 3
    `;
    
    console.log('\n📋 عينة من الأخبار المرحلة:');
    sampleNews.forEach((news, index) => {
      console.log(`   ${index + 1}. ${news.title.substring(0, 50)}... (${news.status})`);
    });
    
    console.log('\n📋 عينة من مقالات الرأي المرحلة:');
    sampleOpinions.forEach((opinion, index) => {
      console.log(`   ${index + 1}. ${opinion.title.substring(0, 50)}... (${opinion.status})`);
    });
    
    console.log('\n🎉 تم إصلاح مشاكل الترحيل بنجاح!');
    
    return {
      success: true,
      newsCount: Number(finalNewsCount[0].count),
      opinionCount: Number(finalOpinionCount[0].count)
    };
    
  } catch (error) {
    console.error('❌ خطأ في إصلاح الترحيل:', error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الإصلاح
if (require.main === module) {
  fixMigrationIssues().catch(console.error);
}

module.exports = { fixMigrationIssues };