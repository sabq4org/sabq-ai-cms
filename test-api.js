// استخدام fetch المدمج في Node.js 18+
async function testAPI() {
  try {
    console.log('🔍 اختبار API التصنيفات...');
    
    const response = await fetch('http://localhost:3000/api/categories?is_active=true');
    const data = await response.json();
    
    console.log('📊 استجابة API:');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers.get('content-type'));
    console.log('Data:', JSON.stringify(data, null, 2));
    
    console.log('\n🔍 اختبار API المقالات...');
    
    const articlesResponse = await fetch('http://localhost:3000/api/articles?status=published&limit=5');
    const articlesData = await articlesResponse.json();
    
    console.log('📊 استجابة API المقالات:');
    console.log('Status:', articlesResponse.status);
    console.log('Data:', JSON.stringify(articlesData, null, 2));

    console.log('\n🔍 اختبار API المستخدمين...');

    const usersResponse = await fetch('http://localhost:3000/api/users?limit=5');
    const usersData = await usersResponse.json();

    console.log('📊 استجابة API المستخدمين:');
    console.log('Status:', usersResponse.status);
    console.log('Data:', JSON.stringify(usersData, null, 2));
    
  } catch (error) {
    console.error('❌ خطأ في اختبار API:', error);
  }
}

testAPI(); 