#!/usr/bin/env node

/**
 * التحقق من المقال في قاعدة البيانات المحلية
 */

const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

const ARTICLE_ID = '46594dc4-f022-40c9-bfc8-2e92005c29e1';

async function checkArticle() {
  try {
    console.log('\n🔍 البحث عن المقال في قاعدة البيانات...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'محدد ✓' : 'غير محدد ✗');
    
    // محاولة الاتصال
    await prisma.$connect();
    console.log('✅ تم الاتصال بقاعدة البيانات');
    
    // البحث عن المقال
    const article = await prisma.articles.findUnique({
      where: { id: ARTICLE_ID },
      include: {
        categories: true
      }
    });
    
    if (article) {
      console.log('\n✅ تم العثور على المقال:');
      console.log('- العنوان:', article.title);
      console.log('- الحالة:', article.status);
      console.log('- التصنيف:', article.categories?.name || 'غير محدد');
      console.log('- معرف الكاتب:', article.author_id || 'غير محدد');
      console.log('- تاريخ النشر:', article.published_at);
      console.log('- المشاهدات:', article.views || 0);
      
      if (article.status !== 'published') {
        console.log('\n⚠️ تحذير: المقال غير منشور!');
      }
    } else {
      console.log('\n❌ المقال غير موجود في قاعدة البيانات');
      
      // البحث عن مقالات مشابهة
      console.log('\n🔍 البحث عن مقالات حديثة...');
      const recentArticles = await prisma.articles.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          created_at: true
        }
      });
      
      if (recentArticles.length > 0) {
        console.log('\nآخر المقالات:');
        recentArticles.forEach(a => {
          console.log(`- ${a.id.substring(0, 8)}... | ${a.title.substring(0, 50)}... | ${a.status}`);
        });
      }
    }
    
  } catch (error) {
    console.error('\n❌ خطأ:', error.message);
    
    if (error.message.includes('P1001')) {
      console.log('\n💡 المشكلة: لا يمكن الوصول إلى قاعدة البيانات');
      console.log('تحقق من:');
      console.log('1. DATABASE_URL صحيح');
      console.log('2. قاعدة البيانات تعمل');
      console.log('3. الشبكة تسمح بالاتصال');
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkArticle(); 