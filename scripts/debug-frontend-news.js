#!/usr/bin/env node

/**
 * تشخيص مشكلة عدم ظهور الأخبار في الواجهة الأمامية
 * يحاكي الطلبات التي تقوم بها الواجهة الأمامية
 */

const API_BASE_URL = 'http://localhost:3002';

async function debugFrontendNews() {
  console.log('🔍 تشخيص مشكلة الواجهة الأمامية...\n');
  
  try {
    // محاكاة الطلب الذي تقوم به الواجهة الأمامية
    console.log('📡 محاكاة طلب الواجهة الأمامية:');
    
    // الطلب الافتراضي (published status)
    const params = new URLSearchParams({
      status: 'published',
      limit: '50',
      sort: 'published_at',
      order: 'desc',
      article_type: 'news'
    });
    
    console.log(`🔗 URL: /api/admin/news?${params.toString()}`);
    
    const response = await fetch(`${API_BASE_URL}/api/admin/news?${params.toString()}`);
    console.log(`📊 HTTP Status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ خطأ HTTP: ${errorText}`);
      return;
    }
    
    const data = await response.json();
    console.log(`✅ استجابة API:`);
    console.log(`  success: ${data.success}`);
    console.log(`  total: ${data.total}`);
    console.log(`  articles count: ${data.articles?.length || 0}`);
    
    if (data.articles && data.articles.length > 0) {
      console.log('\n📰 عينة من الأخبار المُرجعة:');
      
      data.articles.slice(0, 5).forEach((article, index) => {
        console.log(`\n  ${index + 1}. ${article.title.substring(0, 60)}...`);
        console.log(`     ID: ${article.id}`);
        console.log(`     حالة: ${article.status}`);
        console.log(`     نوع: ${article.article_type || 'غير محدد'}`);
        console.log(`     تصنيف: ${article.categories?.name || 'غير مصنف'}`);
        console.log(`     تاريخ النشر: ${article.published_at || 'غير منشور'}`);
        
        // فحص إذا كان المقال يحتوي على كلمات تجريبية
        const title = article.title.toLowerCase();
        const isTestArticle = title.includes('test') || 
                              title.includes('تجربة') || 
                              title.includes('demo') ||
                              title.includes('example');
        
        if (isTestArticle) {
          console.log(`     ⚠️  مقال تجريبي (يجب استبعاده)`);
        }
        
        if (article.status === 'scheduled') {
          console.log(`     ⚠️  مقال مجدول (يجب استبعاده)`);
        }
      });
      
      // فحص الفلترة
      console.log('\n🔍 تحليل الفلترة:');
      
      const testArticles = data.articles.filter(article => {
        const title = article.title.toLowerCase();
        return title.includes('test') || 
               title.includes('تجربة') || 
               title.includes('demo') ||
               title.includes('example');
      });
      
      const scheduledArticles = data.articles.filter(article => 
        article.status === 'scheduled'
      );
      
      const validArticles = data.articles.filter(article => {
        const title = article.title.toLowerCase();
        const isTestArticle = title.includes('test') || 
                              title.includes('تجربة') || 
                              title.includes('demo') ||
                              title.includes('example');
        
        return !isTestArticle && article.status !== 'scheduled';
      });
      
      console.log(`  📊 إجمالي الأخبار: ${data.articles.length}`);
      console.log(`  🧪 مقالات تجريبية: ${testArticles.length}`);
      console.log(`  📅 مقالات مجدولة: ${scheduledArticles.length}`);
      console.log(`  ✅ مقالات صالحة للعرض: ${validArticles.length}`);
      
      if (validArticles.length === 0) {
        console.log('\n❌ المشكلة: جميع الأخبار مفلترة!');
        console.log('💡 الحل: إما تعديل الفلترة أو إضافة أخبار جديدة غير تجريبية');
      } else {
        console.log('\n✅ يجب أن تظهر الأخبار في الواجهة الأمامية');
        console.log('💡 إذا لم تظهر، فالمشكلة في الكود JavaScript أو React');
      }
      
    } else {
      console.log('\n❌ لا توجد أخبار في الاستجابة');
      
      // اختبار طلب بدون فلاتر
      console.log('\n🔄 محاولة بدون فلاتر...');
      const allParams = new URLSearchParams({
        status: 'all',
        limit: '50'
      });
      
      const allResponse = await fetch(`${API_BASE_URL}/api/admin/news?${allParams.toString()}`);
      const allData = await allResponse.json();
      
      console.log(`📊 جميع المقالات: ${allData.articles?.length || 0}`);
      
      if (allData.articles && allData.articles.length > 0) {
        console.log('💡 المشكلة: الفلترة أو معايير البحث');
      } else {
        console.log('💡 المشكلة: لا توجد بيانات في قاعدة البيانات');
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ في التشخيص:', error.message);
    console.log('\n💡 تأكد من:');
    console.log('  1. تشغيل الخادم على localhost:3002');
    console.log('  2. عدم وجود أخطاء في الـ API');
    console.log('  3. صحة الاتصال بقاعدة البيانات');
  }
}

// تشغيل التشخيص
if (require.main === module) {
  debugFrontendNews().catch(console.error);
}

module.exports = debugFrontendNews;