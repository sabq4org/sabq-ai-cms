#!/usr/bin/env node

/**
 * سكريبت ترحيل البيانات من جدول articles إلى الجداول المنفصلة
 * يجب تشغيله بعد تطبيق migration الجداول الجديدة
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateExistingData() {
  console.log('🔄 بدء ترحيل البيانات من articles إلى الجداول المنفصلة...\n');
  
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
    
    console.log(`📊 تم العثور على ${allArticles.length} مقال للترحيل`);
    
    let newsCount = 0;
    let opinionCount = 0;
    let errorCount = 0;
    
    for (const article of allArticles) {
      try {
        console.log(`⏳ معالجة: ${article.title.substring(0, 50)}...`);
        
        if (article.article_type === 'news') {
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
              breaking: article.breaking || false,
              featured: article.featured || false,
              urgent: false,
              featured_image: article.featured_image,
              seo_title: article.seo_title,
              seo_description: article.seo_description,
              seo_keywords: article.seo_keywords ? [article.seo_keywords] : [],
              social_image: article.social_image,
              views: article.views || 0,
              likes: article.likes || 0,
              shares: article.shares || 0,
              reading_time: article.reading_time,
              allow_comments: article.allow_comments !== false,
              ai_summary: article.summary,
              audio_summary_url: article.audio_summary_url,
              metadata: article.metadata || {},
              created_at: article.created_at,
              updated_at: article.updated_at
            }
          });
          newsCount++;
          console.log(`  ✅ تم ترحيل الخبر`);
          
        } else if (['opinion', 'analysis', 'interview', 'editorial'].includes(article.article_type)) {
          // ترحيل لمقالات الرأي
          const writerId = article.article_author_id || article.author_id;
          
          // التحقق من وجود الكاتب
          const writerExists = article.article_author_id ? 
            await prisma.article_authors.findUnique({ where: { id: writerId } }) :
            await prisma.users.findUnique({ where: { id: writerId } });
            
          if (!writerExists) {
            console.log(`  ⚠️ الكاتب غير موجود: ${writerId}`);
            errorCount++;
            continue;
          }
          
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
              article_type: article.article_type,
              featured: article.featured || false,
              is_leader_opinion: article.is_opinion_leader || false,
              difficulty_level: 'medium',
              estimated_read: article.reading_time,
              quality_score: 7.0,
              engagement_score: 0.0,
              ai_rating: 0.0,
              featured_image: article.featured_image,
              tags: article.tags || [],
              topics: [],
              related_entities: [],
              seo_title: article.seo_title,
              seo_description: article.seo_description,
              seo_keywords: article.seo_keywords ? [article.seo_keywords] : [],
              social_image: article.social_image,
              views: article.views || 0,
              likes: article.likes || 0,
              saves: article.saves || 0,
              shares: article.shares || 0,
              comments_count: 0,
              reading_time: article.reading_time,
              allow_comments: article.allow_comments !== false,
              allow_rating: true,
              allow_sharing: true,
              ai_summary: article.summary,
              key_quotes: article.ai_quotes || [],
              main_points: [],
              audio_summary_url: article.audio_summary_url,
              metadata: article.metadata || {},
              created_at: article.created_at,
              updated_at: article.updated_at
            }
          });
          opinionCount++;
          console.log(`  ✅ تم ترحيل مقال الرأي`);
        } else {
          console.log(`  ⚠️ نوع مقال غير مدعوم: ${article.article_type}`);
          errorCount++;
        }
        
      } catch (error) {
        console.error(`  ❌ خطأ في ترحيل المقال ${article.id}: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`✅ انتهى الترحيل:`);
    console.log(`📰 أخبار: ${newsCount} مقال`);
    console.log(`📝 مقالات رأي: ${opinionCount} مقال`);
    console.log(`❌ أخطاء: ${errorCount} مقال`);
    console.log(`${'═'.repeat(60)}`);
    
    if (errorCount === 0) {
      console.log(`\n🎉 تم ترحيل جميع البيانات بنجاح!`);
    } else {
      console.log(`\n⚠️ تم الترحيل مع بعض الأخطاء - راجع التفاصيل أعلاه`);
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