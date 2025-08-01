#!/usr/bin/env node

/**
 * سكريبت إصلاح بيانات الأخبار في لوحة التحكم
 * يتحقق من سلامة البيانات ويصلح أي مشاكل
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDataIntegrity() {
  console.log('🔍 بدء فحص سلامة بيانات الأخبار...');
  
  try {
    // جلب جميع الأخبار مع الفلترة
    const articles = await prisma.articles.findMany({
      where: {
        article_type: { notIn: ['opinion', 'analysis', 'interview'] }
      },
      include: {
        categories: { select: { id: true, name: true, slug: true } },
        author: { select: { id: true, name: true, email: true } }
      }
    });
    
    console.log(`📊 إجمالي الأخبار: ${articles.length}`);
    
    // فحص البيانات المعطلة
    let corruptedCount = 0;
    let fixedCount = 0;
    const issues = [];
    
    for (const article of articles) {
      const articleIssues = [];
      
      // فحص الحقول الأساسية
      if (!article.id) articleIssues.push('معرف مفقود');
      if (!article.title || article.title.trim() === '') articleIssues.push('عنوان فارغ');
      if (!article.created_at) articleIssues.push('تاريخ الإنشاء مفقود');
      if (!article.status) articleIssues.push('حالة مفقودة');
      
      // فحص التواريخ
      if (article.published_at) {
        const publishedDate = new Date(article.published_at);
        if (isNaN(publishedDate.getTime())) {
          articleIssues.push('تاريخ نشر غير صالح');
        }
      }
      
      if (article.created_at) {
        const createdDate = new Date(article.created_at);
        if (isNaN(createdDate.getTime())) {
          articleIssues.push('تاريخ إنشاء غير صالح');
        }
      }
      
      // فحص المؤلف
      if (!article.author && !article.author_name) {
        articleIssues.push('مؤلف مفقود');
      }
      
      if (articleIssues.length > 0) {
        corruptedCount++;
        issues.push({
          id: article.id,
          title: article.title?.substring(0, 50) || 'بدون عنوان',
          issues: articleIssues
        });
      }
    }
    
    console.log(`❌ مقالات معطلة: ${corruptedCount}`);
    console.log(`✅ مقالات سليمة: ${articles.length - corruptedCount}`);
    
    if (issues.length > 0) {
      console.log('\n🔧 المشاكل المكتشفة:');
      issues.slice(0, 10).forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.title}`);
        console.log(`   المشاكل: ${issue.issues.join(', ')}`);
      });
      
      if (issues.length > 10) {
        console.log(`   ... و ${issues.length - 10} مشاكل أخرى`);
      }
    }
    
    return { articles, issues, corruptedCount };
    
  } catch (error) {
    console.error('❌ خطأ في فحص البيانات:', error);
    throw error;
  }
}

async function fixDataIssues() {
  console.log('\n🔧 بدء إصلاح البيانات...');
  
  try {
    let fixedCount = 0;
    
    // إصلاح المقالات بدون عناوين
    const articlesWithoutTitles = await prisma.articles.findMany({
      where: {
        OR: [
          { title: null },
          { title: '' }
        ],
        article_type: { notIn: ['opinion', 'analysis', 'interview'] }
      }
    });
    
    if (articlesWithoutTitles.length > 0) {
      console.log(`🔧 إصلاح ${articlesWithoutTitles.length} مقال بدون عنوان...`);
      
      for (const article of articlesWithoutTitles) {
        await prisma.articles.update({
          where: { id: article.id },
          data: {
            title: `خبر بدون عنوان - ${article.id.substring(0, 8)}`
          }
        });
        fixedCount++;
      }
    }
    
    // إصلاح المقالات بدون حالة
    const articlesWithoutStatus = await prisma.articles.findMany({
      where: {
        status: null,
        article_type: { notIn: ['opinion', 'analysis', 'interview'] }
      }
    });
    
    if (articlesWithoutStatus.length > 0) {
      console.log(`🔧 إصلاح ${articlesWithoutStatus.length} مقال بدون حالة...`);
      
      for (const article of articlesWithoutStatus) {
        await prisma.articles.update({
          where: { id: article.id },
          data: {
            status: 'draft'
          }
        });
        fixedCount++;
      }
    }
    
    // إصلاح التواريخ المعطلة
    const articlesWithBadDates = await prisma.articles.findMany({
      where: {
        article_type: { notIn: ['opinion', 'analysis', 'interview'] },
        created_at: null
      }
    });
    
    if (articlesWithBadDates.length > 0) {
      console.log(`🔧 إصلاح ${articlesWithBadDates.length} مقال بتواريخ معطلة...`);
      
      for (const article of articlesWithBadDates) {
        await prisma.articles.update({
          where: { id: article.id },
          data: {
            created_at: new Date()
          }
        });
        fixedCount++;
      }
    }
    
    console.log(`✅ تم إصلاح ${fixedCount} مقال`);
    return fixedCount;
    
  } catch (error) {
    console.error('❌ خطأ في إصلاح البيانات:', error);
    throw error;
  }
}

async function testNewsAPI() {
  console.log('\n🧪 اختبار API إدارة الأخبار...');
  
  try {
    const testUrl = 'http://localhost:3002/api/admin/news?limit=5';
    const response = await fetch(testUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('✅ API يعمل بنجاح');
    console.log(`📊 النتائج: ${data.articles?.length || 0} مقال`);
    
    if (data.articles && data.articles.length > 0) {
      console.log('📋 عينة من البيانات:');
      data.articles.slice(0, 3).forEach((article, index) => {
        console.log(`  ${index + 1}. ${article.title?.substring(0, 40) || 'بدون عنوان'}...`);
        console.log(`     الحالة: ${article.status || 'غير محدد'}`);
        console.log(`     المؤلف: ${article.author?.name || article.author_name || 'غير محدد'}`);
      });
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ خطأ في اختبار API:', error.message);
    return false;
  }
}

async function runDiagnostics() {
  console.log('🚀 بدء تشخيص وإصلاح بيانات الأخبار\n');
  
  try {
    // 1. فحص سلامة البيانات
    const { articles, issues, corruptedCount } = await checkDataIntegrity();
    
    // 2. إصلاح المشاكل
    if (corruptedCount > 0) {
      const fixedCount = await fixDataIssues();
      
      if (fixedCount > 0) {
        console.log('\n🔄 إعادة فحص البيانات بعد الإصلاح...');
        await checkDataIntegrity();
      }
    }
    
    // 3. اختبار API
    const apiWorking = await testNewsAPI();
    
    // 4. تقرير نهائي
    console.log('\n📋 تقرير التشخيص النهائي:');
    console.log('════════════════════════════════════');
    console.log(`📊 إجمالي الأخبار: ${articles.length}`);
    console.log(`❌ مشاكل مكتشفة: ${issues.length}`);
    console.log(`🔧 مشاكل تم إصلاحها: ${corruptedCount > 0 ? 'تم الإصلاح' : 'لا توجد'}`);
    console.log(`🧪 حالة API: ${apiWorking ? '✅ يعمل' : '❌ معطل'}`);
    
    if (issues.length === 0 && apiWorking) {
      console.log('\n🎉 جميع البيانات سليمة والنظام يعمل بشكل طبيعي!');
    } else if (issues.length > 0) {
      console.log('\n⚠️ هناك مشاكل تحتاج لمراجعة يدوية');
    }
    
    return {
      totalArticles: articles.length,
      issues: issues.length,
      apiWorking
    };
    
  } catch (error) {
    console.error('❌ فشل التشخيص:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل التشخيص
if (require.main === module) {
  runDiagnostics().catch(console.error);
}

module.exports = {
  checkDataIntegrity,
  fixDataIssues,
  testNewsAPI,
  runDiagnostics
};