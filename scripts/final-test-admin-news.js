#!/usr/bin/env node

/**
 * اختبار نهائي شامل لصفحة إدارة الأخبار
 * بعد جميع الإصلاحات
 */

const fetch = require('node-fetch');

async function runFinalTest() {
  console.log('🎯 الاختبار النهائي لصفحة إدارة الأخبار\n');
  
  const tests = [
    {
      name: 'API أخبار منشورة',
      url: 'http://localhost:3002/api/admin/news?status=published',
      expectedCount: 14,
      expectedSuccess: true
    },
    {
      name: 'API جميع الأخبار', 
      url: 'http://localhost:3002/api/admin/news?status=all',
      expectedCount: 22,
      expectedSuccess: true
    },
    {
      name: 'الصفحة الرئيسية لإدارة الأخبار',
      url: 'http://localhost:3002/admin/news',
      expectedStatus: 200,
      checkContent: true
    }
  ];
  
  let passedTests = 0;
  
  for (const test of tests) {
    try {
      console.log(`🔍 اختبار: ${test.name}`);
      
      const response = await fetch(test.url);
      
      if (test.checkContent) {
        // اختبار الصفحة
        if (response.ok) {
          const html = await response.text();
          console.log(`   ✅ الصفحة تحمل: HTTP ${response.status}`);
          
          if (html.includes('إدارة الأخبار')) {
            console.log('   ✅ العنوان موجود');
          } else {
            console.log('   ⚠️ العنوان قد يكون مفقود');
          }
          
          if (html.includes('script')) {
            console.log('   ✅ JavaScript موجود');
          }
          
          passedTests++;
        } else {
          console.log(`   ❌ فشل تحميل الصفحة: HTTP ${response.status}`);
        }
      } else {
        // اختبار API
        if (response.ok) {
          const data = await response.json();
          
          console.log(`   📊 النجاح: ${data.success}`);
          console.log(`   📈 العدد: ${data.total} إجمالي، ${data.articles?.length || 0} في الصفحة`);
          
          if (data.success === test.expectedSuccess) {
            console.log('   ✅ حالة النجاح صحيحة');
          } else {
            console.log('   ❌ حالة النجاح خاطئة');
          }
          
          if (test.expectedCount && data.total >= test.expectedCount) {
            console.log('   ✅ العدد متوافق مع المتوقع');
            passedTests++;
          } else if (test.expectedCount) {
            console.log(`   ⚠️ العدد أقل من المتوقع (${data.total} < ${test.expectedCount})`);
          }
          
          if (data.articles?.length > 0) {
            console.log(`   📰 عينة: "${data.articles[0].title?.substring(0, 40)}..."`);
          }
        } else {
          console.log(`   ❌ فشل API: HTTP ${response.status}`);
        }
      }
      
      console.log(''); // سطر فارغ
      
    } catch (error) {
      console.log(`   ❌ خطأ: ${error.message}\n`);
    }
  }
  
  // ملخص النتائج
  console.log('═'.repeat(60));
  console.log(`🎯 نتائج الاختبار النهائي:`);
  console.log(`✅ نجح: ${passedTests}/${tests.length} اختبار`);
  
  if (passedTests === tests.length) {
    console.log('🎉 جميع الاختبارات نجحت! صفحة إدارة الأخبار تعمل بشكل مثالي');
    
    console.log('\n💡 التوصيات:');
    console.log('1. تأكد من مسح cache المتصفح (Ctrl+Shift+R)');
    console.log('2. تحقق من console المتصفح لرسائل debugging');
    console.log('3. استخدم window.sabqDebug.getLogs() لتشخيص إضافي');
    
  } else {
    console.log('⚠️ بعض الاختبارات فشلت، قد تحتاج لمراجعة إضافية');
    
    console.log('\n🔧 خطوات الإصلاح:');
    console.log('1. تحقق من logs التطبيق');
    console.log('2. راجع console المتصفح');
    console.log('3. أعد تشغيل التطبيق إذا لزم الأمر');
  }
  
  console.log('\n📱 اختبار الصفحة:');
  console.log('🌐 افتح: http://localhost:3002/admin/news');
  console.log('🔍 توقع: عرض 14 خبر منشور');
  console.log('⚡ تفاعل: أزرار الفلترة والبحث');
}

// تشغيل الاختبار
if (require.main === module) {
  runFinalTest().catch(console.error);
}

module.exports = { runFinalTest };