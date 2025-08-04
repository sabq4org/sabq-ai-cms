const fetch = require('node-fetch');

async function testConcurrentRequests() {
  console.log('🔄 اختبار Concurrent Requests (مثل المتصفح)...\n');
  
  // تشغيل 5 requests في نفس الوقت (مثل ما يحدث مع Race Conditions)
  const promises = [];
  
  for (let i = 1; i <= 5; i++) {
    const promise = fetch('http://localhost:3002/api/muqtarib/angles', {
      headers: {
        'Cache-Control': 'no-cache'
      }
    }).then(async (response) => {
      const startTime = Date.now();
      
      if (response.ok) {
        const data = await response.json();
        return {
          id: i,
          status: response.status,
          success: true,
          angles: data.angles?.length || 0,
          time: Date.now() - startTime
        };
      } else {
        const errorText = await response.text();
        return {
          id: i,
          status: response.status,
          success: false,
          error: errorText,
          time: Date.now() - startTime
        };
      }
    }).catch(error => ({
      id: i,
      status: 'network_error',
      success: false,
      error: error.message,
      time: 0
    }));
    
    promises.push(promise);
  }
  
  console.log('🚀 تشغيل 5 requests متزامنة...');
  const results = await Promise.all(promises);
  
  console.log('\n📊 النتائج:');
  results.forEach(result => {
    if (result.success) {
      console.log(`✅ Request ${result.id}: ${result.status} - زوايا: ${result.angles}`);
    } else {
      console.log(`❌ Request ${result.id}: ${result.status} - خطأ: ${result.error?.substring(0, 50)}`);
    }
  });
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`\n✅ نجح: ${successful}/5`);
  console.log(`❌ فشل: ${failed}/5`);
  
  return {successful, failed, results};
}

// اختبار عدة مرات
async function runMultipleTests() {
  const testResults = [];
  
  for (let test = 1; test <= 3; test++) {
    console.log(`\n=== اختبار ${test} ===`);
    const result = await testConcurrentRequests();
    testResults.push(result);
    
    // انتظار بين الاختبارات
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🎯 الملخص النهائي:');
  console.log('=================');
  
  const totalSuccess = testResults.reduce((sum, test) => sum + test.successful, 0);
  const totalFailed = testResults.reduce((sum, test) => sum + test.failed, 0);
  const totalRequests = totalSuccess + totalFailed;
  
  console.log(`إجمالي الطلبات: ${totalRequests}`);
  console.log(`النجح: ${totalSuccess} (${Math.round(totalSuccess/totalRequests*100)}%)`);
  console.log(`فشل: ${totalFailed} (${Math.round(totalFailed/totalRequests*100)}%)`);
  
  if (totalFailed > 0) {
    console.log('\n⚠️ يبدو أن هناك مشكلة في Concurrent Requests!');
  } else {
    console.log('\n✅ جميع Concurrent Requests نجحت!');
  }
}

runMultipleTests().catch(console.error);