#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

async function checkTestArticles() {
  try {
    console.log('🔍 Checking for test articles...');
    
    // البحث عن المقالات التي تحتوي على كلمات تجريبية
    const testPatterns = [
      { title: { contains: 'اختبار' } },
      { title: { contains: 'تجريبي' } },
      { title: { contains: 'تجريبية' } },
      { title: { contains: 'مقال اختبار' } },
      { title: { contains: 'مقال تجريبي' } },
      { slug: { equals: '4ihzpplc' } },
      { slug: { contains: 'test' } },
      { slug: { contains: 'demo' } },
    ];
    
    for (const pattern of testPatterns) {
      const articles = await prisma.articles.findMany({
        where: {
          ...pattern,
          status: 'published'
        },
        select: {
          id: true,
          title: true,
          slug: true,
          published_at: true,
          status: true,
          featured: true,
        }
      });
      
      if (articles.length > 0) {
        console.log(`\n📰 Found ${articles.length} articles matching pattern:`, pattern);
        articles.forEach(article => {
          console.log(`  - ID: ${article.id}`);
          console.log(`    Title: ${article.title}`);
          console.log(`    Slug: ${article.slug}`);
          console.log(`    Status: ${article.status}`);
          console.log(`    Featured: ${article.featured}`);
          console.log(`    Published: ${article.published_at}`);
          console.log('');
        });
      }
    }
    
    // البحث العام عن المقالات الحديثة
    console.log('\n📊 Recent articles (last 10):');
    const recentArticles = await prisma.articles.findMany({
      where: {
        status: 'published'
      },
      orderBy: {
        published_at: 'desc'
      },
      take: 10,
      select: {
        id: true,
        title: true,
        slug: true,
        published_at: true,
        featured: true,
      }
    });
    
    recentArticles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title} (${article.slug}) - Featured: ${article.featured}`);
    });
    
    console.log('\n✅ Check complete');
    
  } catch (error) {
    console.error('❌ Error checking test articles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTestArticles().catch(console.error);
