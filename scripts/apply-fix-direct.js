#!/usr/bin/env node

/**
 * سكريبت تطبيق الإصلاح مباشرة
 * يطبق الإصلاح عبر migration API endpoint
 */

const https = require('https');

console.log('🚀 تطبيق الإصلاح مباشرة...\n');

// الرابط الصحيح لقاعدة البيانات
const correctDatabaseUrl = 'mysql://5k3qivqt4ihe0f7xcln5:***REMOVED***WNm5lf1LEHln8AChFN8aMk8V3WVzvR14oW99Re38C7H@aws.connect.psdb.cloud/j3uar_sabq_ai?sslaccept=strict&connect_timeout=60&pool_timeout=60';

console.log('📋 الرابط الصحيح:');
console.log(correctDatabaseUrl.substring(0, 50) + '...\n');

// دالة لإجراء HTTP request
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ status: res.statusCode, data: result });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// تطبيق الإصلاح
async function applyFix() {
  console.log('🔧 محاولة تطبيق الإصلاح عبر migration API...');
  
  try {
    // محاولة تشغيل migration مع الرابط الجديد
    const migrationResult = await makeRequest('https://sabq-ai-cms.vercel.app/api/admin/migrate-db', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        secret: 'admin-secret-2024',
        force_url: correctDatabaseUrl
      })
    });
    
    console.log('📊 نتيجة Migration:');
    console.log(`الحالة: ${migrationResult.status}`);
    console.log(`البيانات: ${JSON.stringify(migrationResult.data, null, 2)}`);
    
    if (migrationResult.status === 200) {
      console.log('✅ نجح Migration!');
    } else {
      console.log('⚠️  Migration لم ينجح كما متوقع');
    }
    
  } catch (error) {
    console.log('❌ خطأ في Migration:', error.message);
  }
  
  // انتظار قليل ثم اختبار النتيجة
  console.log('\n⏳ انتظار 5 ثوان ثم اختبار النتيجة...');
  
  setTimeout(async () => {
    try {
      console.log('🧪 اختبار النتيجة...');
      
      // اختبار قاعدة البيانات
      const dbTest = await makeRequest('https://sabq-ai-cms.vercel.app/api/test-db');
      console.log('\n📊 اختبار قاعدة البيانات:');
      console.log(`الحالة: ${dbTest.status}`);
      
      if (dbTest.status === 200 && dbTest.data.success) {
        console.log('✅ قاعدة البيانات تعمل!');
        console.log('📋 تفاصيل:', JSON.stringify(dbTest.data.database, null, 2));
      } else {
        console.log('❌ قاعدة البيانات لا تعمل:');
        console.log(JSON.stringify(dbTest.data, null, 2));
      }
      
      // اختبار API الفئات
      const categoriesTest = await makeRequest('https://sabq-ai-cms.vercel.app/api/categories');
      console.log('\n📊 اختبار API الفئات:');
      console.log(`الحالة: ${categoriesTest.status}`);
      
      if (categoriesTest.status === 200) {
        console.log('✅ API الفئات يعمل!');
        console.log(`عدد الفئات: ${Array.isArray(categoriesTest.data) ? categoriesTest.data.length : 'غير محدد'}`);
      } else {
        console.log('❌ API الفئات لا يعمل');
      }
      
      // النتيجة النهائية
      if (dbTest.status === 200 && categoriesTest.status === 200) {
        console.log('\n🎉 تهانينا! الإصلاح نجح بالكامل');
        console.log('🚀 الموقع يعمل بشكل صحيح الآن');
      } else {
        console.log('\n⚠️  الإصلاح لم ينجح بالكامل');
        console.log('💡 تحتاج لتطبيق الإصلاح يدوياً في Vercel Dashboard');
        console.log('📖 راجع CORRECT_DATABASE_URL.md للتفاصيل');
      }
      
    } catch (testError) {
      console.log('❌ خطأ في الاختبار:', testError.message);
    }
  }, 5000);
}

// تشغيل الإصلاح
applyFix().catch(console.error); 