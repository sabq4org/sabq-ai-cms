#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTables() {
  console.log('🔍 فحص الجداول الموجودة...\n');
  
  try {
    // فحص جدول articles الأصلي
    const articlesCount = await prisma.articles.count();
    console.log(`✅ جدول articles: ${articlesCount} مقال`);
    
    // فحص الجداول الجديدة
    try {
      // محاولة إنشاء استعلام للجداول الجديدة
      const result = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('news_articles', 'opinion_articles', 'news_analytics', 'opinion_analytics')
        ORDER BY table_name;
      `;
      
      console.log('\n📋 الجداول الجديدة الموجودة:');
      if (result.length === 0) {
        console.log('❌ لا توجد جداول منفصلة بعد');
      } else {
        result.forEach(row => {
          console.log(`✅ ${row.table_name}`);
        });
      }
      
    } catch (error) {
      console.log('❌ خطأ في فحص الجداول الجديدة:', error.message);
    }
    
  } catch (error) {
    console.error('❌ خطأ عام:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();