const testArticle = {
  title: "مقال اختبار جديد - " + new Date().toLocaleString('ar-SA'),
  content: "هذا مقال اختبار للتأكد من ظهور الأخبار الجديدة في الواجهة بعد إصلاح مشكلة التخزين المؤقت.",
  category_id: "cat-001", // محليات
  article_author_id: "author_1754125848205_lmmpexfx4", // علي الحازمي
  status: "published",
  published_at: new Date().toISOString(),
  article_type: "news"
};

async function createTestArticle() {
  try {
    console.log('🆕 Creating test article...');
    
    const response = await fetch('http://localhost:3000/api/articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testArticle)
    });
    
    const result = await response.json();
    
    if (result.ok) {
      console.log('✅ Test article created successfully!');
      console.log('📄 Article ID:', result.data.id);
      console.log('🔗 Article Slug:', result.data.slug);
      console.log('📰 Title:', result.data.title);
      
      // Test if it appears in the API immediately
      console.log('\n🔍 Testing if article appears in API...');
      
      const checkResponse = await fetch('http://localhost:3000/api/articles?status=published&limit=5&page=1&_t=' + Date.now());
      const checkData = await checkResponse.json();
      
      const foundArticle = checkData.articles?.find(a => a.id === result.data.id);
      
      if (foundArticle) {
        console.log('✅ Article appears in API! Title:', foundArticle.title);
        console.log('✅ Cache fix is working!');
      } else {
        console.log('❌ Article not found in API immediately');
        console.log('First article in response:', checkData.articles?.[0]?.title);
      }
      
    } else {
      console.error('❌ Failed to create test article:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTestArticle();
