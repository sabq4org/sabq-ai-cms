#!/usr/bin/env node

/**
 * سكريبت فحص حالة الموقع الحي
 * يتحقق من APIs والصفحات الرئيسية
 */

// Using built-in fetch in Node.js 18+

const PRODUCTION_URL = 'https://sabq.io';
const ENDPOINTS = [
  { name: 'الصفحة الرئيسية', url: '/', method: 'GET' },
  { name: 'صفحة التصنيفات', url: '/categories', method: 'GET' },
  { name: 'API التصنيفات', url: '/api/categories?is_active=true', method: 'GET' },
  { name: 'API المقالات', url: '/api/articles?status=published&limit=10', method: 'GET' },
  { name: 'API الإحصائيات', url: '/api/news/stats', method: 'GET' },
];

async function checkEndpoint(endpoint) {
  console.log(`\n🔍 فحص ${endpoint.name}...`);
  const url = `${PRODUCTION_URL}${endpoint.url}`;
  
  try {
    const startTime = Date.now();
    const response = await fetch(url, {
      method: endpoint.method,
      headers: {
        'User-Agent': 'SABQ-Health-Check/1.0',
        'Accept': 'application/json, text/html',
      },
      timeout: 30000, // 30 seconds
    });
    
    const responseTime = Date.now() - startTime;
    
    // معلومات الاستجابة
    console.log(`📊 حالة الاستجابة: ${response.status} ${response.statusText}`);
    console.log(`⏱️  وقت الاستجابة: ${responseTime}ms`);
    console.log(`📦 نوع المحتوى: ${response.headers.get('content-type')}`);
    
    // فحص المحتوى
    if (endpoint.url.startsWith('/api/')) {
      try {
        const data = await response.json();
        console.log(`✅ API يعمل بشكل صحيح`);
        
        // عرض بعض المعلومات
        if (data.categories) {
          console.log(`   - عدد التصنيفات: ${data.categories.length}`);
        }
        if (data.articles) {
          console.log(`   - عدد المقالات: ${data.articles.length}`);
        }
        if (data.stats) {
          console.log(`   - الإحصائيات متوفرة`);
        }
      } catch (jsonError) {
        console.log(`⚠️  فشل تحليل JSON: ${jsonError.message}`);
      }
    } else {
      const text = await response.text();
      
      // فحص محتوى HTML
      if (text.includes('جاري التحميل...') || text.includes('Loading...')) {
        console.log(`⚠️  الصفحة عالقة على حالة التحميل`);
      } else if (text.includes('<!DOCTYPE html>')) {
        console.log(`✅ الصفحة HTML تم تحميلها`);
        
        // فحص وجود محتوى
        if (text.includes('الأقسام') || text.includes('التصنيفات')) {
          console.log(`   - محتوى التصنيفات موجود`);
        }
        if (text.includes('article') || text.includes('مقال')) {
          console.log(`   - محتوى المقالات موجود`);
        }
      }
    }
    
    return {
      endpoint: endpoint.name,
      url: url,
      status: response.status,
      responseTime: responseTime,
      success: response.ok,
      error: null
    };
    
  } catch (error) {
    console.log(`❌ خطأ: ${error.message}`);
    return {
      endpoint: endpoint.name,
      url: url,
      status: 0,
      responseTime: 0,
      success: false,
      error: error.message
    };
  }
}

async function checkProductionHealth() {
  console.log('🏥 بدء فحص صحة الموقع الحي...');
  console.log(`🌐 URL: ${PRODUCTION_URL}`);
  console.log('━'.repeat(50));
  
  const results = [];
  
  // فحص جميع النقاط
  for (const endpoint of ENDPOINTS) {
    const result = await checkEndpoint(endpoint);
    results.push(result);
  }
  
  // ملخص النتائج
  console.log('\n' + '━'.repeat(50));
  console.log('📊 ملخص النتائج:');
  console.log('━'.repeat(50));
  
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  const avgResponseTime = results
    .filter(r => r.responseTime > 0)
    .reduce((sum, r) => sum + r.responseTime, 0) / results.length || 0;
  
  console.log(`✅ نجح: ${successCount}`);
  console.log(`❌ فشل: ${failCount}`);
  console.log(`⏱️  متوسط وقت الاستجابة: ${Math.round(avgResponseTime)}ms`);
  
  // النقاط الفاشلة
  if (failCount > 0) {
    console.log('\n⚠️  النقاط الفاشلة:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.endpoint}: ${r.error}`);
    });
  }
  
  // توصيات
  console.log('\n💡 التوصيات:');
  if (failCount > 0) {
    console.log('1. تحقق من إعدادات Amplify ومتغيرات البيئة');
    console.log('2. راجع CloudWatch Logs للأخطاء التفصيلية');
    console.log('3. تأكد من صحة اتصال قاعدة البيانات');
  } else if (avgResponseTime > 3000) {
    console.log('1. الأداء بطيء - فكر في تحسين الكاش');
    console.log('2. استخدم CloudFront CDN');
    console.log('3. قم بتحسين استعلامات قاعدة البيانات');
  } else {
    console.log('✨ الموقع يعمل بشكل ممتاز!');
  }
  
  // حفظ التقرير
  const report = {
    timestamp: new Date().toISOString(),
    url: PRODUCTION_URL,
    results: results,
    summary: {
      total: results.length,
      success: successCount,
      failed: failCount,
      avgResponseTime: Math.round(avgResponseTime)
    }
  };
  
  require('fs').writeFileSync(
    'production-health-report.json',
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n📄 تم حفظ التقرير في: production-health-report.json');
}

// تشغيل الفحص
checkProductionHealth().catch(error => {
  console.error('❌ خطأ في تشغيل الفحص:', error);
  process.exit(1);
}); 