#!/usr/bin/env node

/**
 * سكريبت للتحقق من صحة البيئة الإنتاجية
 * Production Health Check Script
 */

const https = require('https');
const http = require('http');

const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://sabq.io';

// قائمة نقاط النهاية للتحقق
const endpoints = [
  { path: '/', name: 'الصفحة الرئيسية' },
  { path: '/api/health', name: 'صحة API' },
  { path: '/api/categories', name: 'التصنيفات' },
  { path: '/api/articles?limit=1', name: 'المقالات' },
  { path: '/api/news/stats', name: 'إحصائيات الأخبار' },
  { path: '/api/health/database', name: 'اتصال قاعدة البيانات' }
];

async function checkEndpoint(endpoint) {
  const url = new URL(endpoint.path, PRODUCTION_URL);
  const protocol = url.protocol === 'https:' ? https : http;
  
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    protocol.get(url.toString(), (res) => {
      const responseTime = Date.now() - startTime;
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          endpoint: endpoint.name,
          path: endpoint.path,
          status: res.statusCode,
          responseTime,
          success: res.statusCode >= 200 && res.statusCode < 400,
          error: null,
          data: data.substring(0, 100) // أول 100 حرف فقط
        });
      });
    }).on('error', (err) => {
      resolve({
        endpoint: endpoint.name,
        path: endpoint.path,
        status: 0,
        responseTime: Date.now() - startTime,
        success: false,
        error: err.message
      });
    });
  });
}

async function main() {
  console.log(`\n🔍 فحص صحة الموقع: ${PRODUCTION_URL}\n`);
  console.log('═'.repeat(60));
  
  const results = [];
  
  for (const endpoint of endpoints) {
    process.stdout.write(`⏳ فحص ${endpoint.name}...`);
    const result = await checkEndpoint(endpoint);
    results.push(result);
    
    if (result.success) {
      console.log(` ✅ (${result.status}) - ${result.responseTime}ms`);
    } else {
      console.log(` ❌ (${result.status}) - ${result.error || 'فشل'}`);
    }
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('\n📊 ملخص النتائج:\n');
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  const successRate = (successCount / totalCount * 100).toFixed(1);
  
  console.log(`✅ نجح: ${successCount}/${totalCount} (${successRate}%)`);
  console.log(`❌ فشل: ${totalCount - successCount}/${totalCount}`);
  
  // عرض الأخطاء بالتفصيل
  const failures = results.filter(r => !r.success);
  if (failures.length > 0) {
    console.log('\n🚨 الأخطاء المكتشفة:\n');
    failures.forEach(f => {
      console.log(`- ${f.endpoint} (${f.path})`);
      console.log(`  الحالة: ${f.status || 'لا يوجد اتصال'}`);
      if (f.error) console.log(`  الخطأ: ${f.error}`);
      if (f.data) console.log(`  البيانات: ${f.data}`);
      console.log();
    });
  }
  
  // التوصيات
  console.log('\n💡 التوصيات:\n');
  
  if (failures.some(f => f.path.includes('/api/health/database'))) {
    console.log('1. تحقق من متغير DATABASE_URL في البيئة الإنتاجية');
    console.log('2. تأكد من أن قاعدة البيانات متاحة ويمكن الوصول إليها');
  }
  
  if (failures.some(f => f.status === 500)) {
    console.log('3. راجع سجلات الخطأ في السيرفر');
    console.log('4. تحقق من جميع متغيرات البيئة المطلوبة');
  }
  
  if (failures.some(f => f.status === 0)) {
    console.log('5. تحقق من أن الموقع يعمل وأن SSL صحيح');
  }
  
  console.log('\n✨ انتهى الفحص!\n');
  
  // إرجاع كود خروج مناسب
  process.exit(failures.length > 0 ? 1 : 0);
}

// تشغيل السكريبت
main().catch(console.error); 