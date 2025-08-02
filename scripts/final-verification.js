#!/usr/bin/env node

/**
 * التحقق النهائي من نجاح فصل المحتوى
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function finalVerification() {
  console.log('🎯 التحقق النهائي من نجاح فصل المحتوى...\n');
  
  try {
    // فحص البيانات في الجداول المختلفة
    const originalCount = await prisma.articles.count();
    
    const newsCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM news_articles`;
    const opinionCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM opinion_articles`;
    
    const newsNum = Number(newsCount[0].count);
    const opinionNum = Number(opinionCount[0].count);
    
    console.log('📊 مقارنة البيانات:');
    console.log(`   articles (الأصلي): ${originalCount} مقال`);
    console.log(`   news_articles: ${newsNum} مقال`);
    console.log(`   opinion_articles: ${opinionNum} مقال`);
    console.log(`   إجمالي المرحل: ${newsNum + opinionNum} مقال`);
    
    // فحص عينة من البيانات المرحلة
    console.log('\n📋 عينة من الأخبار المرحلة:');
    const sampleNews = await prisma.$queryRaw`
      SELECT id, title, status, breaking, featured, author_id, category_id, created_at 
      FROM news_articles 
      ORDER BY created_at DESC 
      LIMIT 3
    `;
    
    sampleNews.forEach((news, index) => {
      const flags = [];
      if (news.breaking) flags.push('عاجل');
      if (news.featured) flags.push('مميز');
      const flagsText = flags.length > 0 ? ` [${flags.join(', ')}]` : '';
      
      console.log(`   ${index + 1}. ${news.title.substring(0, 60)}...${flagsText}`);
      console.log(`      الحالة: ${news.status} | المؤلف: ${news.author_id} | التصنيف: ${news.category_id || 'بدون'}`);
    });
    
    console.log('\n📋 عينة من مقالات الرأي المرحلة:');
    const sampleOpinions = await prisma.$queryRaw`
      SELECT id, title, status, article_type, is_leader_opinion, writer_id, quality_score, created_at 
      FROM opinion_articles 
      ORDER BY created_at DESC 
      LIMIT 3
    `;
    
    sampleOpinions.forEach((opinion, index) => {
      const flags = [];
      if (opinion.is_leader_opinion) flags.push('قائد رأي');
      const flagsText = flags.length > 0 ? ` [${flags.join(', ')}]` : '';
      
      console.log(`   ${index + 1}. ${opinion.title.substring(0, 60)}...${flagsText}`);
      console.log(`      النوع: ${opinion.article_type} | الكاتب: ${opinion.writer_id} | الجودة: ${opinion.quality_score}`);
    });
    
    // فحص الفهارس
    console.log('\n🔍 فحص الفهارس:');
    const indexes = await prisma.$queryRaw`
      SELECT 
        schemaname, 
        tablename, 
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE tablename IN ('news_articles', 'opinion_articles')
      ORDER BY tablename, indexname;
    `;
    
    const newsIndexes = indexes.filter(idx => idx.tablename === 'news_articles');
    const opinionIndexes = indexes.filter(idx => idx.tablename === 'opinion_articles');
    
    console.log(`   news_articles: ${newsIndexes.length} فهرس`);
    console.log(`   opinion_articles: ${opinionIndexes.length} فهرس`);
    
    // اختبار APIs الجديدة
    console.log('\n🌐 اختبار APIs الجديدة:');
    
    try {
      const newsApiResponse = await fetch('http://localhost:3002/api/news?limit=1');
      const newsApiData = await newsApiResponse.json();
      console.log(`   ✅ /api/news: ${newsApiData.success ? 'يعمل' : 'خطأ'}`);
    } catch (e) {
      console.log(`   ❌ /api/news: غير متاح (${e.message})`);
    }
    
    try {
      const opinionsApiResponse = await fetch('http://localhost:3002/api/opinions?limit=1');
      const opinionsApiData = await opinionsApiResponse.json();
      console.log(`   ✅ /api/opinions: ${opinionsApiData.success ? 'يعمل' : 'خطأ'}`);
    } catch (e) {
      console.log(`   ❌ /api/opinions: غير متاح (${e.message})`);
    }
    
    console.log('\n' + '═'.repeat(80));
    console.log('🎯 ملخص نتائج فصل المحتوى:');
    console.log('═'.repeat(80));
    
    const successRate = Math.round(((newsNum + opinionNum) / originalCount) * 100);
    
    console.log(`📊 معدل نجاح الترحيل: ${successRate}%`);
    console.log(`📰 أخبار مرحلة: ${newsNum}/${originalCount}`);
    console.log(`📝 مقالات رأي مرحلة: ${opinionNum}/${originalCount}`);
    
    if (successRate >= 80) {
      console.log('\n🎉 تم فصل المحتوى بنجاح!');
      console.log('\n📍 الوضع الحالي للأخبار الجديدة:');
      console.log('   💾 يتم حفظها في: جدول news_articles');
      console.log('   🌐 API المتاح: /api/news');
      console.log('   📱 واجهة الإدارة: تحتاج تحديث');
      
      console.log('\n📍 الوضع الحالي لمقالات الرأي الجديدة:');
      console.log('   💾 يتم حفظها في: جدول opinion_articles');
      console.log('   🌐 API المتاح: /api/opinions');
      console.log('   📱 واجهة الإدارة: تحتاج تحديث');
      
    } else {
      console.log('\n⚠️ هناك مشاكل في الترحيل تحتاج مراجعة');
    }
    
    console.log('\n📋 الخطوات التالية:');
    console.log('   1. تحديث واجهات الإدارة لاستخدام APIs الجديدة');
    console.log('   2. إنشاء صفحات /news/[slug] و /opinion/[slug]');
    console.log('   3. تحديث الصفحة الرئيسية لاستخدام /api/news');
    console.log('   4. اختبار شامل للنظام الجديد');
    
    return {
      success: successRate >= 80,
      originalCount,
      newsCount: newsNum,
      opinionCount: opinionNum,
      successRate
    };
    
  } catch (error) {
    console.error('❌ خطأ في التحقق:', error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل التحقق
if (require.main === module) {
  finalVerification().catch(console.error);
}

module.exports = { finalVerification };