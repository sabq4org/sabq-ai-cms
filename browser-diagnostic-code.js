
// 🔍 أداة التشخيص السريع لرفع الصور في المتصفح

(async function() {
  console.log('🚀 بدء التشخيص السريع...');
  
  // معلومات البيئة
  console.log('📋 معلومات البيئة:');
  console.log('- المتصفح:', navigator.userAgent);
  console.log('- fetch مُعرف مسبقاً:', typeof fetch !== 'undefined');
  console.log('- FormData متاح:', typeof FormData !== 'undefined');
  console.log('- emergency-fixes محمل:', window.fetch?.toString?.()?.includes?.('emergency') || false);
  
  // إنشاء ملف اختبار
  function createTestFile() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, 1, 1);
    
    return new Promise(resolve => {
      canvas.toBlob(blob => {
        const file = new File([blob], 'test.png', { type: 'image/png' });
        resolve(file);
      }, 'image/png');
    });
  }
  
  // اختبار fetch مباشر
  async function testDirectFetch() {
    console.log('\n🧪 اختبار fetch مباشر...');
    
    try {
      const file = await createTestFile();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'general');
      
      console.log('📋 FormData created:', formData);
      console.log('📋 File info:', {
        name: file.name,
        type: file.type,
        size: file.size
      });
      
      // طلب مع تسجيل headers
      console.log('📤 إرسال طلب...');
      const response = await fetch('/api/upload-image-safe', {
        method: 'POST',
        body: formData
      });
      
      console.log('📨 Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ نجح الاختبار:', result);
        return { success: true, result };
      } else {
        const error = await response.text();
        console.log('❌ فشل الاختبار:', error);
        return { success: false, error };
      }
      
    } catch (error) {
      console.error('❌ خطأ في الاختبار:', error);
      return { success: false, error: error.message };
    }
  }
  
  // اختبار XMLHttpRequest
  async function testXHR() {
    console.log('\n🧪 اختبار XMLHttpRequest...');
    
    return new Promise(async (resolve) => {
      try {
        const file = await createTestFile();
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'general');
        
        const xhr = new XMLHttpRequest();
        
        xhr.onload = function() {
          console.log('📨 XHR Response:', {
            status: xhr.status,
            statusText: xhr.statusText,
            responseText: xhr.responseText
          });
          
          if (xhr.status === 200) {
            console.log('✅ XHR نجح');
            resolve({ success: true, result: JSON.parse(xhr.responseText) });
          } else {
            console.log('❌ XHR فشل');
            resolve({ success: false, error: xhr.responseText });
          }
        };
        
        xhr.onerror = function() {
          console.error('❌ XHR خطأ:', xhr.statusText);
          resolve({ success: false, error: xhr.statusText });
        };
        
        xhr.open('POST', '/api/upload-image-safe');
        xhr.send(formData);
        
      } catch (error) {
        console.error('❌ خطأ في XHR:', error);
        resolve({ success: false, error: error.message });
      }
    });
  }
  
  // تشغيل الاختبارات
  const fetchResult = await testDirectFetch();
  const xhrResult = await testXHR();
  
  // النتائج النهائية
  console.log('\n📊 النتائج النهائية:');
  console.log('- fetch مباشر:', fetchResult.success ? '✅ نجح' : '❌ فشل');
  console.log('- XMLHttpRequest:', xhrResult.success ? '✅ نجح' : '❌ فشل');
  
  if (!fetchResult.success) {
    console.log('❌ خطأ fetch:', fetchResult.error);
  }
  
  if (!xhrResult.success) {
    console.log('❌ خطأ XHR:', xhrResult.error);
  }
  
  // توصيات
  console.log('\n💡 التوصيات:');
  if (fetchResult.success && xhrResult.success) {
    console.log('✅ جميع طرق الرفع تعمل بشكل صحيح');
  } else if (fetchResult.success && !xhrResult.success) {
    console.log('⚠️ fetch يعمل، XHR لا يعمل - مشكلة في XHR');
  } else if (!fetchResult.success && xhrResult.success) {
    console.log('⚠️ XHR يعمل، fetch لا يعمل - مشكلة في fetch interceptor');
  } else {
    console.log('❌ كلا الطريقتين لا تعمل - مشكلة في الخادم أو الشبكة');
  }
  
  return { fetchResult, xhrResult };
})().then(results => {
  console.log('\n🏁 اكتمل التشخيص:', results);
}).catch(error => {
  console.error('❌ خطأ في التشخيص:', error);
});

