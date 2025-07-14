const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// رموز الألوان للنتائج
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

// دالة لاختبار endpoint
async function testEndpoint(name, url, expectedStatus = 200) {
  try {
    const response = await axios.get(url);
    if (response.status === expectedStatus) {
      console.log(`${colors.green}✅ ${name}: نجح (${response.status})${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.yellow}⚠️ ${name}: حالة غير متوقعة (${response.status})${colors.reset}`);
      return false;
    }
  } catch (error) {
    if (error.response && error.response.status === expectedStatus) {
      console.log(`${colors.green}✅ ${name}: نجح (${error.response.status})${colors.reset}`);
      return true;
    }
    console.log(`${colors.red}❌ ${name}: فشل - ${error.message}${colors.reset}`);
    return false;
  }
}

// دالة رئيسية لتشغيل الاختبارات
async function runTests() {
  console.log('\n🧪 بدء اختبار API endpoints...\n');
  
  const tests = [
    // الصحة والحالة
    { name: 'Health Check', url: `${BASE_URL}/api/health` },
    
    // المقالات
    { name: 'جلب المقالات', url: `${BASE_URL}/api/articles?status=published&limit=10` },
    { name: 'جلب مقال واحد', url: `${BASE_URL}/api/articles?status=published&limit=1` },
    
    // التصنيفات
    { name: 'جلب التصنيفات', url: `${BASE_URL}/api/categories` },
    { name: 'جلب التصنيفات النشطة', url: `${BASE_URL}/api/categories?active=true` },
    
    // Dashboard
    { name: 'إحصائيات Dashboard', url: `${BASE_URL}/api/dashboard/stats` },
    { name: 'أنشطة Dashboard', url: `${BASE_URL}/api/dashboard/activities` },
    
    // المصادقة (يتوقع 401 للمستخدم غير المسجل)
    { name: 'التحقق من المصادقة', url: `${BASE_URL}/api/auth/me`, expectedStatus: 401 },
    
    // المؤلفون
    { name: 'جلب المؤلفين', url: `${BASE_URL}/api/authors?role=correspondent,editor,author` },
    
    // أخبار وآس
    { name: 'أخبار وآس', url: `${BASE_URL}/api/was-news` },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await testEndpoint(test.name, test.url, test.expectedStatus);
    if (result) passed++;
    else failed++;
    
    // انتظار قليل بين الطلبات
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n📊 النتائج النهائية:');
  console.log(`${colors.green}✅ نجح: ${passed}${colors.reset}`);
  console.log(`${colors.red}❌ فشل: ${failed}${colors.reset}`);
  console.log(`📈 نسبة النجاح: ${Math.round((passed / (passed + failed)) * 100)}%\n`);
}

// تشغيل الاختبارات
runTests().catch(console.error); 