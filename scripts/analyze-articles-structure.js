#!/usr/bin/env node

/**
 * تحليل البنية الحالية لجدول articles
 * لفهم توزيع البيانات قبل فصل الأخبار عن مقالات الرأي
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function analyzeArticlesStructure() {
  console.log('📊 تحليل البنية الحالية لجدول articles...\n');
  
  try {
    // إجمالي المقالات
    const totalCount = await prisma.articles.count();
    console.log(`📋 إجمالي المقالات: ${totalCount}\n`);
    
    // تحليل أنواع المقالات
    const typeCount = await prisma.articles.groupBy({
      by: ['article_type'],
      _count: { article_type: true },
      orderBy: { _count: { article_type: 'desc' } }
    });
    
    console.log('📋 توزيع أنواع المقالات:');
    typeCount.forEach(type => {
      const typeName = type.article_type || 'غير محدد';
      console.log(`   ${typeName}: ${type._count.article_type} مقال`);
    });
    
    // تحليل الحالة
    const statusCount = await prisma.articles.groupBy({
      by: ['status'],
      _count: { status: true },
      orderBy: { _count: { status: 'desc' } }
    });
    
    console.log('\n📋 توزيع حالات المقالات:');
    statusCount.forEach(status => {
      console.log(`   ${status.status}: ${status._count.status} مقال`);
    });
    
    // تحليل التصنيفات
    const categoryCount = await prisma.articles.groupBy({
      by: ['category_id'],
      _count: { category_id: true },
      where: { 
        category_id: { not: null },
        status: { in: ['published', 'draft'] }
      },
      orderBy: { _count: { category_id: 'desc' } }
    });
    
    console.log('\n📋 أكثر التصنيفات استخداماً:');
    for (const cat of categoryCount.slice(0, 5)) {
      try {
        const category = await prisma.categories.findUnique({
          where: { id: cat.category_id },
          select: { name: true }
        });
        console.log(`   ${category?.name || 'غير معروف'}: ${cat._count.category_id} مقال`);
      } catch (err) {
        console.log(`   [${cat.category_id}]: ${cat._count.category_id} مقال`);
      }
    }
    
    // تحليل المؤلفين
    const authorStats = await prisma.articles.groupBy({
      by: ['author_id'],
      _count: { author_id: true },
      where: { 
        status: { in: ['published', 'draft'] }
      }
    });
    
    const articleAuthorStats = await prisma.articles.groupBy({
      by: ['article_author_id'],
      _count: { article_author_id: true },
      where: { 
        status: { in: ['published', 'draft'] }
      }
    });
    
    console.log(`\n📋 إحصائيات المؤلفين:`);
    console.log(`   مؤلفين في author_id: ${authorStats.length}`);
    console.log(`   مؤلفين في article_author_id: ${articleAuthorStats.length}`);
    
    // عينة من البيانات
    console.log('\n📋 عينة من آخر المقالات:');
    const sampleArticles = await prisma.articles.findMany({
      take: 10,
      select: {
        id: true,
        title: true,
        article_type: true,
        status: true,
        author_id: true,
        article_author_id: true,
        categories: { select: { name: true } },
        published_at: true
      },
      orderBy: { created_at: 'desc' }
    });
    
    sampleArticles.forEach((article, index) => {
      const title = article.title.substring(0, 60) + '...';
      const type = article.article_type || 'غير محدد';
      const category = article.categories?.name || 'بدون تصنيف';
      const authorType = article.article_author_id ? 'article_author' : 'user_author';
      
      console.log(`   ${index + 1}. ${title}`);
      console.log(`      نوع: ${type} | حالة: ${article.status} | تصنيف: ${category} | مؤلف: ${authorType}`);
    });
    
    // توصيات للفصل
    console.log('\n');
    console.log('═'.repeat(80));
    console.log('🎯 توصيات لفصل البيانات:');
    console.log('═'.repeat(80));
    
    const newsTypes = ['news', 'breaking'];
    const opinionTypes = ['opinion', 'analysis', 'interview', 'editorial'];
    
    const newsCount = await prisma.articles.count({
      where: { 
        article_type: { in: newsTypes },
        status: { in: ['published', 'draft'] }
      }
    });
    
    const opinionCount = await prisma.articles.count({
      where: { 
        article_type: { in: opinionTypes },
        status: { in: ['published', 'draft'] }
      }
    });
    
    const totalPublishedDraft = await prisma.articles.count({
      where: { status: { in: ['published', 'draft'] } }
    });
    
    const unknownCount = totalPublishedDraft - newsCount - opinionCount;
    
    console.log(`📰 الأخبار المحتملة: ${newsCount} مقال`);
    console.log(`📝 مقالات الرأي المحتملة: ${opinionCount} مقال`);
    console.log(`❓ محتوى غير محدد النوع: ${unknownCount} مقال`);
    
    console.log('\n📋 خطة الترحيل المقترحة:');
    console.log('1. news_articles ← article_type في [news, breaking]');
    console.log('2. opinion_articles ← article_type في [opinion, analysis, interview, editorial]');
    console.log('3. مراجعة يدوية للمحتوى غير المحدد');
    
  } catch (error) {
    console.error('❌ خطأ في التحليل:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل التحليل
if (require.main === module) {
  analyzeArticlesStructure().catch(console.error);
}

module.exports = { analyzeArticlesStructure };