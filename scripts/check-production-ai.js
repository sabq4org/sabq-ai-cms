#!/usr/bin/env node

/**
 * اختبار نظام الذكاء الاصطناعي في بيئة الإنتاج
 * تشغيل: npm run ai:check-production
 */

const https = require('https');
const http = require('http');

async function checkProductionAI() {
  console.log('🚀 اختبار نظام الذكاء الاصطناعي في الإنتاج...\n');

  // عناوين الإنتاج المحتملة
  const productionUrls = [
    'https://sabq-ai-cms.vercel.app',
    'https://sabq.org',
    'https://your-production-domain.com'
  ];

  console.log('🌐 جاري اختبار عناوين الإنتاج:');
  productionUrls.forEach((url, index) => {
    console.log(`   ${index + 1}. ${url}`);
  });
  console.log('');

  for (const baseUrl of productionUrls) {
    try {
      console.log(`🔍 اختبار: ${baseUrl}`);
      
      // اختبار endpoint الذكاء الاصطناعي
      const testUrl = `${baseUrl}/api/ai-recommendations?articleId=test`;
      const response = await makeRequest(testUrl);
      
      if (response.status === 200) {
        const data = JSON.parse(response.body);
        
        console.log(`✅ نجح الاتصال مع: ${baseUrl}`);
        console.log(`📊 عدد التوصيات: ${data.recommendations?.length || 0}`);
        console.log(`🎯 متوسط الثقة: ${data.averageConfidence || 'غير متاح'}%`);
        console.log(`🤖 نوع النظام: ${data.method || 'غير محدد'}`);
        
        if (data.method === 'ai-powered') {
          console.log('🎉 الذكاء الاصطناعي مفعّل ويعمل بشكل مثالي!');
        } else if (data.method === 'rule-based') {
          console.log('⚠️  النظام يعمل بالخوارزمية التقليدية (OpenAI غير متوفر)');
        }
        
        console.log('');
        return true;
        
      } else if (response.status === 404) {
        console.log(`❌ API غير موجود في: ${baseUrl}`);
        console.log('💡 تأكد من نشر التحديثات الجديدة\n');
      } else {
        console.log(`❌ خطأ HTTP ${response.status}: ${baseUrl}\n`);
      }
    } catch (error) {
      console.log(`❌ فشل الاتصال مع: ${baseUrl}`);
      console.log(`   الخطأ: ${error.message}\n`);
    }
  }

  console.log('📝 نصائح للإصلاح:');
  console.log('   1. تأكد من نشر آخر تحديث (git push + deploy)');
  console.log('   2. أضف OPENAI_API_KEY في متغيرات بيئة الإنتاج');
  console.log('   3. تحقق من logs الإنتاج للأخطاء');
  console.log('   4. راجع ملف PRODUCTION_AI_SETUP.md للإرشادات\n');
  
  return false;
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    
    const req = client.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: body,
          headers: res.headers
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// تشغيل الاختبار
checkProductionAI().then((success) => {
  process.exit(success ? 0 : 1);
}).catch((error) => {
  console.error('❌ خطأ في الاختبار:', error);
  process.exit(1);
});
