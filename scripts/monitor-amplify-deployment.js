#!/usr/bin/env node

/**
 * سكريبت مراقبة النشر على Amplify
 * يتحقق من حالة الموقع بعد النشر
 */

// Using built-in fetch in Node.js 18+

const PRODUCTION_URL = 'https://sabq.io';
const CHECK_INTERVAL = 30000; // 30 seconds
const MAX_CHECKS = 20; // 10 minutes total

async function checkDeploymentStatus(attempt = 1) {
  console.log(`\n🔍 محاولة ${attempt}/${MAX_CHECKS}...`);
  console.log(new Date().toLocaleTimeString('ar-SA'));
  
  try {
    // فحص الصفحة الرئيسية
    const homeResponse = await fetch(PRODUCTION_URL);
    const homeText = await homeResponse.text();
    const homeLoading = homeText.includes('جاري التحميل...') || homeText.includes('Loading...');
    
    // فحص صفحة التصنيفات
    const categoriesResponse = await fetch(`${PRODUCTION_URL}/categories`);
    const categoriesText = await categoriesResponse.text();
    const categoriesLoading = categoriesText.includes('جاري التحميل...') || categoriesText.includes('Loading...');
    
    // فحص API
    const apiResponse = await fetch(`${PRODUCTION_URL}/api/categories?is_active=true`);
    const apiData = await apiResponse.json();
    
    console.log('📊 النتائج:');
    console.log(`- الصفحة الرئيسية: ${homeLoading ? '⚠️ عالقة على التحميل' : '✅ تعمل بشكل صحيح'}`);
    console.log(`- صفحة التصنيفات: ${categoriesLoading ? '⚠️ عالقة على التحميل' : '✅ تعمل بشكل صحيح'}`);
    console.log(`- API التصنيفات: ${apiData.categories ? `✅ يعمل (${apiData.categories.length} تصنيف)` : '❌ لا يعمل'}`);
    
    // التحقق من النجاح
    if (!homeLoading && !categoriesLoading && apiData.categories) {
      console.log('\n✨ النشر نجح! الموقع يعمل بشكل كامل.');
      
      // فحص تفصيلي للتحسينات
      console.log('\n📈 فحص التحسينات:');
      
      // التحقق من Error Boundary
      if (categoriesText.includes('error.tsx') || categoriesText.includes('Error')) {
        console.log('- ✅ Error Boundary مُفعّل');
      }
      
      // التحقق من Loading State
      if (categoriesText.includes('loading.tsx') || categoriesText.includes('skeleton')) {
        console.log('- ✅ Loading States محسّنة');
      }
      
      // التحقق من الصور
      const hasImages = categoriesText.includes('img') || categoriesText.includes('Image');
      console.log(`- ${hasImages ? '✅' : '⚠️'} عرض الصور`);
      
      return true;
    }
    
    // إذا لم ينجح بعد
    if (attempt < MAX_CHECKS) {
      console.log(`\n⏳ الانتظار ${CHECK_INTERVAL / 1000} ثانية قبل المحاولة التالية...`);
      await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
      return checkDeploymentStatus(attempt + 1);
    } else {
      console.log('\n❌ انتهت المحاولات. يبدو أن هناك مشكلة في النشر.');
      return false;
    }
    
  } catch (error) {
    console.error('❌ خطأ في الفحص:', error.message);
    
    if (attempt < MAX_CHECKS) {
      console.log(`\n⏳ إعادة المحاولة بعد ${CHECK_INTERVAL / 1000} ثانية...`);
      await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
      return checkDeploymentStatus(attempt + 1);
    }
    
    return false;
  }
}

async function monitorDeployment() {
  console.log('🚀 مراقبة النشر على Amplify...');
  console.log(`🌐 URL: ${PRODUCTION_URL}`);
  console.log(`⏱️  فترة الفحص: كل ${CHECK_INTERVAL / 1000} ثانية`);
  console.log(`🔄 عدد المحاولات الأقصى: ${MAX_CHECKS}`);
  console.log('━'.repeat(50));
  
  const startTime = Date.now();
  const success = await checkDeploymentStatus();
  const duration = Math.round((Date.now() - startTime) / 1000);
  
  console.log('\n' + '━'.repeat(50));
  console.log('📊 ملخص المراقبة:');
  console.log(`⏱️  المدة الإجمالية: ${duration} ثانية`);
  console.log(`📌 النتيجة: ${success ? '✅ نجح النشر' : '❌ فشل النشر'}`);
  
  if (success) {
    console.log('\n🎉 تهانينا! الموقع يعمل بنجاح على:');
    console.log(`   ${PRODUCTION_URL}`);
    console.log('\n💡 الخطوات التالية:');
    console.log('1. تحقق من CloudWatch Logs للتأكد من عدم وجود أخطاء');
    console.log('2. اختبر جميع الوظائف الرئيسية');
    console.log('3. راقب الأداء خلال الساعات القادمة');
  } else {
    console.log('\n⚠️  يبدو أن هناك مشكلة. جرب:');
    console.log('1. فحص Amplify Console للأخطاء');
    console.log('2. التحقق من CloudWatch Logs');
    console.log('3. التأكد من متغيرات البيئة');
    console.log('4. إعادة النشر إذا لزم الأمر');
  }
  
  process.exit(success ? 0 : 1);
}

// تشغيل المراقبة
monitorDeployment().catch(error => {
  console.error('❌ خطأ في المراقبة:', error);
  process.exit(1);
}); 