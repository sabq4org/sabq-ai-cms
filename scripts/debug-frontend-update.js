const fetch = require('node-fetch');

async function debugFrontendUpdate() {
  console.log('🔍 تشخيص تحديث المقال من الواجهة...\n');
  
  const articleId = 'article_1753871540813_vlvief9dk';
  const url = `http://localhost:3002/api/articles/${articleId}`;
  
  // محاكاة البيانات المرسلة من الواجهة
  const frontendData = {
    title: 'عنوان محدث من الواجهة',
    excerpt: 'ملخص محدث',
    content: '<p>محتوى محدث من الواجهة</p>',
    featured_image: null,
    category_id: 'cat-001', // محليات
    author_id: 'default-editor-sabq',
    status: 'draft',
    external_link: null,
    // حقول SEO مباشرة
    seo_title: null,
    seo_description: null,
    seo_keywords: null,
    // metadata كـ JSON
    metadata: {
      subtitle: null,
      type: 'local',
      image_caption: null,
      keywords: [],
      is_featured: false,
      is_breaking: false,
      gallery: []
    }
  };
  
  console.log('📤 البيانات المرسلة (محاكاة الواجهة):');
  console.log(JSON.stringify(frontendData, null, 2));
  
  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Mode': 'true'
      },
      body: JSON.stringify(frontendData)
    });
    
    console.log('\n📡 الاستجابة:');
    console.log('الحالة:', response.status, response.statusText);
    console.log('Headers:', response.headers.raw());
    
    const text = await response.text();
    console.log('\n📋 محتوى الاستجابة الخام:');
    console.log(text);
    
    try {
      const result = JSON.parse(text);
      console.log('\n📋 النتيجة المحللة:');
      console.log(JSON.stringify(result, null, 2));
    } catch (e) {
      console.log('❌ فشل تحليل JSON:', e.message);
    }
    
  } catch (error) {
    console.error('\n❌ خطأ في الطلب:', error);
  }
}

// تشغيل التشخيص
debugFrontendUpdate().catch(console.error);