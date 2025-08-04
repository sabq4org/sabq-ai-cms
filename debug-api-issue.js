const fetch = require('node-fetch');

async function testAPIMultipleTimes() {
  console.log('🔍 اختبار API عدة مرات لتشخيص Race Conditions...\n');
  
  const results = [];
  
  // تشغيل 10 requests متتالية
  for (let i = 1; i <= 10; i++) {
    try {
      console.log(`📡 Request ${i}:`);
      const startTime = Date.now();
      
      const response = await fetch('http://localhost:3002/api/muqtarib/angles', {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ نجح - ${response.status} (${duration}ms) - زوايا: ${data.angles?.length || 0}`);
        results.push({request: i, status: response.status, success: true, duration, angles: data.angles?.length || 0});
      } else {
        const errorText = await response.text();
        console.log(`❌ فشل - ${response.status} (${duration}ms) - خطأ: ${errorText.substring(0, 100)}`);
        results.push({request: i, status: response.status, success: false, duration, error: errorText});
      }
      
      // انتظار قصير بين الطلبات
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.log(`💥 خطأ في الشبكة - Request ${i}: ${error.message}`);
      results.push({request: i, status: 'network_error', success: false, error: error.message});
    }
  }
  
  console.log('\n📊 ملخص النتائج:');
  console.log('==================');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ نجح: ${successful}/10`);
  console.log(`❌ فشل: ${failed}/10`);
  
  if (failed > 0) {
    console.log('\n❌ الطلبات الفاشلة:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  Request ${r.request}: ${r.status} - ${r.error?.substring(0, 50) || 'غير محدد'}`);
    });
  }
  
  console.log('\n⏱️ أوقات الاستجابة:');
  const avgTime = results.filter(r => r.duration).reduce((sum, r) => sum + r.duration, 0) / results.filter(r => r.duration).length;
  console.log(`متوسط الوقت: ${Math.round(avgTime)}ms`);
}

// تشغيل الاختبار
testAPIMultipleTimes().catch(console.error);