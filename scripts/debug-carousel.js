// سكريبت لتشخيص مشكلة الكاروسيل
const fetch = require('node-fetch');

async function debugCarousel() {
  try {
    console.log('🔍 تشخيص مشكلة كاروسيل الأخبار المميزة...\n');
    
    // 1. اختبار API
    console.log('1️⃣ اختبار API endpoint:');
    const response = await fetch('http://localhost:3002/api/featured-news-carousel');
    const data = await response.json();
    
    console.log(`   - حالة الاستجابة: ${response.status}`);
    console.log(`   - نجاح: ${data.success}`);
    console.log(`   - عدد المقالات: ${data.articles?.length || 0}`);
    
    if (data.articles && data.articles.length > 0) {
      console.log('\n   📰 المقالات المستلمة:');
      data.articles.forEach((article, index) => {
        console.log(`   ${index + 1}. ${article.title}`);
        console.log(`      - ID: ${article.id}`);
        console.log(`      - صورة: ${article.featured_image ? '✅' : '❌'}`);
        console.log(`      - مقتطف: ${article.excerpt ? '✅' : '❌'}`);
      });
    }
    
    // 2. فحص البيانات المطلوبة
    console.log('\n\n2️⃣ فحص البيانات المطلوبة للكاروسيل:');
    if (data.articles && data.articles.length > 0) {
      const requiredFields = ['id', 'title', 'slug', 'featured_image', 'published_at'];
      const firstArticle = data.articles[0];
      
      requiredFields.forEach(field => {
        const hasField = firstArticle.hasOwnProperty(field) && firstArticle[field] !== null;
        console.log(`   - ${field}: ${hasField ? '✅' : '❌'} ${hasField ? `(${firstArticle[field]?.substring(0, 50)}...)` : ''}`);
      });
    }
    
    // 3. نصائح لحل المشكلة
    console.log('\n\n3️⃣ نصائح لحل المشكلة:');
    console.log('   1. تأكد من تحديث الصفحة (Ctrl+F5)');
    console.log('   2. افتح Developer Tools وتحقق من Console');
    console.log('   3. تحقق من Network tab أن API يرجع 3 مقالات');
    console.log('   4. تأكد من عدم وجود أخطاء JavaScript');
    
    // 4. اقتراح كود تشخيصي للواجهة
    console.log('\n\n4️⃣ كود تشخيصي للواجهة الأمامية:');
    console.log(`
// أضف هذا في مكون FeaturedCarousel:
console.log('🎠 FeaturedCarousel - Articles:', articles);
console.log('🎠 Current Index:', currentIndex);
console.log('🎠 Articles Length:', articles.length);

// في useEffect:
console.log('🔄 Auto-play interval created');
    `);
    
  } catch (error) {
    console.error('❌ خطأ في التشخيص:', error);
  }
}

debugCarousel();