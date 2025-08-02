#!/usr/bin/env node

/**
 * فحص حالة فصل المحتوى ومكان تخزين الأخبار الجديدة
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSeparationStatus() {
  console.log('🔍 فحص حالة فصل المحتوى...\n');
  
  try {
    // فحص وجود الجداول الجديدة
    const tablesExist = {
      news_articles: false,
      opinion_articles: false,
      news_analytics: false,
      opinion_analytics: false
    };
    
    // محاولة الوصول للجداول الجديدة
    try {
      await prisma.$queryRaw`SELECT COUNT(*) FROM news_articles LIMIT 1`;
      tablesExist.news_articles = true;
    } catch (error) {
      console.log('❌ جدول news_articles غير موجود');
    }
    
    try {
      await prisma.$queryRaw`SELECT COUNT(*) FROM opinion_articles LIMIT 1`;
      tablesExist.opinion_articles = true;
    } catch (error) {
      console.log('❌ جدول opinion_articles غير موجود');
    }
    
    try {
      await prisma.$queryRaw`SELECT COUNT(*) FROM news_analytics LIMIT 1`;
      tablesExist.news_analytics = true;
    } catch (error) {
      console.log('❌ جدول news_analytics غير موجود');
    }
    
    try {
      await prisma.$queryRaw`SELECT COUNT(*) FROM opinion_analytics LIMIT 1`;
      tablesExist.opinion_analytics = true;
    } catch (error) {
      console.log('❌ جدول opinion_analytics غير موجود');
    }
    
    // فحص البيانات في جدول articles الأصلي
    const articlesStats = await prisma.articles.groupBy({
      by: ['article_type'],
      _count: { article_type: true },
      where: { status: { in: ['published', 'draft'] } }
    });
    
    console.log('📊 البيانات الحالية في جدول articles:');
    articlesStats.forEach(stat => {
      console.log(`   ${stat.article_type}: ${stat._count.article_type} مقال`);
    });
    
    // تحديد المرحلة الحالية
    let currentPhase = '';
    let nextSteps = [];
    
    if (!tablesExist.news_articles && !tablesExist.opinion_articles) {
      currentPhase = '❌ المرحلة 0: لم يتم تطبيق الفصل بعد';
      nextSteps = [
        '1. تطبيق Migration: npx prisma db push',
        '2. ترحيل البيانات: node scripts/migrate-articles-data.js',
        '3. تحديث الواجهة الأمامية'
      ];
      
      console.log(`\n🎯 مكان تخزين الأخبار الجديدة: جدول articles (article_type = 'news')`);
      
    } else if (tablesExist.news_articles && tablesExist.opinion_articles) {
      // فحص عدد البيانات في الجداول الجديدة
      const newsCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM news_articles`;
      const opinionCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM opinion_articles`;
      
      const newsNum = Number(newsCount[0].count);
      const opinionNum = Number(opinionCount[0].count);
      
      console.log(`\n📊 البيانات في الجداول الجديدة:`);
      console.log(`   news_articles: ${newsNum} مقال`);
      console.log(`   opinion_articles: ${opinionNum} مقال`);
      
      if (newsNum === 0 && opinionNum === 0) {
        currentPhase = '🟡 المرحلة 1: الجداول موجودة لكن فارغة';
        nextSteps = [
          '1. ترحيل البيانات: node scripts/migrate-articles-data.js',
          '2. تحديث الواجهة الأمامية'
        ];
        
        console.log(`\n🎯 مكان تخزين الأخبار الجديدة: لا يزال في جدول articles`);
        
      } else {
        currentPhase = '🟢 المرحلة 2: تم ترحيل البيانات';
        nextSteps = [
          '1. تحديث APIs لاستخدام الجداول الجديدة',
          '2. تحديث الواجهة الأمامية',
          '3. تحويل الإدخال الجديد للجداول المنفصلة'
        ];
        
        console.log(`\n🎯 مكان تخزين الأخبار الجديدة: يمكن تحويله لـ news_articles`);
      }
    }
    
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`📍 المرحلة الحالية: ${currentPhase}`);
    console.log(`${'═'.repeat(60)}`);
    
    console.log('\n📋 الخطوات التالية:');
    nextSteps.forEach(step => {
      console.log(`   ${step}`);
    });
    
    // جدول مقارنة
    console.log('\n📊 جدول مقارنة الجداول:');
    console.log('┌─────────────────────┬──────────┬────────────────────────┐');
    console.log('│ الجدول              │ الحالة   │ الاستخدام              │');
    console.log('├─────────────────────┼──────────┼────────────────────────┤');
    console.log(`│ articles            │    ✅    │ نشط (جميع المحتويات)   │`);
    console.log(`│ news_articles       │ ${tablesExist.news_articles ? '   ✅' : '   ❌'}    │ ${tablesExist.news_articles ? 'جاهز للأخبار' : 'غير موجود'}          │`);
    console.log(`│ opinion_articles    │ ${tablesExist.opinion_articles ? '   ✅' : '   ❌'}    │ ${tablesExist.opinion_articles ? 'جاهز لمقالات الرأي' : 'غير موجود'}    │`);
    console.log(`│ news_analytics      │ ${tablesExist.news_analytics ? '   ✅' : '   ❌'}    │ ${tablesExist.news_analytics ? 'إحصائيات الأخبار' : 'غير موجود'}       │`);
    console.log(`│ opinion_analytics   │ ${tablesExist.opinion_analytics ? '   ✅' : '   ❌'}    │ ${tablesExist.opinion_analytics ? 'إحصائيات مقالات الرأي' : 'غير موجود'} │`);
    console.log('└─────────────────────┴──────────┴────────────────────────┘');
    
  } catch (error) {
    console.error('❌ خطأ في فحص الحالة:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الفحص
if (require.main === module) {
  checkSeparationStatus().catch(console.error);
}

module.exports = { checkSeparationStatus };