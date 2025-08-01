/**
 * سكريبت لاختبار صفحة إدارة الأخبار من console المتصفح
 * انسخ هذا الكود والصقه في console المتصفح أثناء تصفح صفحة /admin/news
 */

console.log('🔍 بدء اختبار تشخيص الأخبار من المتصفح...');

// 1. اختبار API مباشرة من المتصفح
async function testNewsAPI() {
  try {
    console.log('📡 اختبار API الأخبار مباشرة...');
    
    const response = await fetch('/api/admin/news?status=published&limit=50&sort=published_at&order=desc&article_type=news');
    console.log('📊 حالة الاستجابة:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ بيانات API:', {
        success: data.success,
        total: data.total,
        articlesCount: data.articles?.length || 0
      });
      
      if (data.articles && data.articles.length > 0) {
        console.log('📰 عينة من الأخبار:');
        data.articles.slice(0, 3).forEach((article, index) => {
          console.log(`  ${index + 1}. ${article.title.substring(0, 50)}...`);
        });
        return data.articles;
      } else {
        console.log('❌ لا توجد أخبار في الاستجابة');
        return [];
      }
    } else {
      console.log('❌ فشل في API:', response.status, response.statusText);
      return [];
    }
  } catch (error) {
    console.error('❌ خطأ في API:', error);
    return [];
  }
}

// 2. فحص DOM لعناصر الجدول
function checkTableElements() {
  console.log('🔍 فحص عناصر DOM...');
  
  const loadingElement = document.querySelector('[class*="animate-spin"]');
  const noDataElement = document.querySelector(':contains("لا توجد أخبار")');
  const tableElement = document.querySelector('table');
  const tableRows = document.querySelectorAll('table tbody tr');
  
  console.log('📊 حالة DOM:', {
    hasLoadingSpinner: !!loadingElement,
    hasNoDataMessage: !!noDataElement,
    hasTable: !!tableElement,
    tableRowsCount: tableRows.length
  });
  
  if (tableRows.length > 0) {
    console.log('✅ يوجد صفوف في الجدول:', tableRows.length);
    tableRows.forEach((row, index) => {
      const titleCell = row.querySelector('td:nth-child(2)');
      if (titleCell && index < 3) {
        console.log(`  ${index + 1}. ${titleCell.textContent?.trim().substring(0, 50)}...`);
      }
    });
  } else {
    console.log('❌ لا توجد صفوف في الجدول');
  }
}

// 3. فحص حالة React (إذا كان متاحاً)
function checkReactState() {
  console.log('🔍 محاولة فحص حالة React...');
  
  // محاولة الوصول لحالة React عبر React DevTools
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('✅ React DevTools متاح');
  } else {
    console.log('❌ React DevTools غير متاح');
  }
  
  // فحص الأخطاء في console
  const errors = window.console.error._errors || [];
  if (errors.length > 0) {
    console.log('⚠️ أخطاء موجودة في console:', errors);
  } else {
    console.log('✅ لا توجد أخطاء واضحة في console');
  }
}

// 4. اختبار شامل
async function runFullDiagnosis() {
  console.log('🚀 تشغيل التشخيص الشامل...\n');
  
  // اختبار API
  const apiData = await testNewsAPI();
  console.log('');
  
  // فحص DOM
  checkTableElements();
  console.log('');
  
  // فحص React
  checkReactState();
  console.log('');
  
  // خلاصة التشخيص
  console.log('📋 خلاصة التشخيص:');
  
  if (apiData.length > 0) {
    console.log('✅ API يعمل ويُرجع بيانات');
    
    const tableRows = document.querySelectorAll('table tbody tr');
    if (tableRows.length > 0) {
      console.log('✅ الجدول يحتوي على بيانات');
      console.log('🎉 النظام يعمل بشكل صحيح!');
    } else {
      console.log('❌ API يعمل لكن الجدول فارغ');
      console.log('💡 المشكلة: في React أو معالجة البيانات في الواجهة الأمامية');
      console.log('🔧 اقتراح: تحقق من console للأخطاء أو مشاهدة network tab');
    }
  } else {
    console.log('❌ API لا يُرجع بيانات');
    console.log('💡 المشكلة: في الخادم أو قاعدة البيانات');
  }
}

// تشغيل التشخيص
runFullDiagnosis();

// إضافة دوال للاختبار اليدوي
window.testNewsAPI = testNewsAPI;
window.checkTableElements = checkTableElements;
window.runFullDiagnosis = runFullDiagnosis;

console.log('\n🛠️ تم إضافة دوال للاختبار اليدوي:');
console.log('  - testNewsAPI()');
console.log('  - checkTableElements()');
console.log('  - runFullDiagnosis()');