/**
 * 🔧 أداة تشخيص إرسال الطلبات من الواجهة الأمامية
 * للتحقق من صحة Content-Type headers
 */

export async function debugFormDataRequest(file: File, endpoint: string = '/api/upload-image-safe') {
  console.log('🔍 [DEBUG] بدء تشخيص الطلب...');
  
  // إنشاء FormData
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'test');
  
  console.log('📋 [DEBUG] FormData تم إنشاؤها:', {
    fileExists: !!file,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size
  });
  
  // إنشاء طلب تجريبي
  const requestInit: RequestInit = {
    method: 'POST',
    body: formData,
    // ⚠️ لا نضع Content-Type هنا - سيضعه المتصفح تلقائياً
  };
  
  console.log('🌐 [DEBUG] إعدادات الطلب:', {
    method: requestInit.method,
    bodyType: requestInit.body?.constructor.name,
    headersIncluded: !!requestInit.headers
  });
  
  try {
    console.log('📤 [DEBUG] إرسال الطلب إلى:', endpoint);
    
    // محاكاة inspect لما سيرسله المتصفح
    const tempRequest = new Request('http://localhost:3000' + endpoint, requestInit);
    const actualContentType = tempRequest.headers.get('content-type');
    
    console.log('📋 [DEBUG] Content-Type المُحدد تلقائياً:', actualContentType);
    
    if (actualContentType && actualContentType.includes('multipart/form-data')) {
      console.log('✅ [DEBUG] Content-Type صحيح!');
    } else {
      console.error('❌ [DEBUG] Content-Type خاطئ!');
    }
    
    // إرسال الطلب الفعلي
    const response = await fetch(endpoint, requestInit);
    
    console.log('📨 [DEBUG] الاستجابة:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { rawResponse: responseText };
    }
    
    console.log('📄 [DEBUG] محتوى الاستجابة:', responseData);
    
    return {
      success: response.ok,
      status: response.status,
      data: responseData,
      contentType: actualContentType,
      debugInfo: {
        formDataCreated: true,
        fileIncluded: !!file,
        contentTypeAutoSet: !!actualContentType,
        contentTypeValid: actualContentType?.includes('multipart/form-data') || false
      }
    };
    
  } catch (error: any) {
    console.error('❌ [DEBUG] خطأ في الطلب:', error);
    return {
      success: false,
      error: error.message,
      debugInfo: {
        formDataCreated: true,
        fileIncluded: !!file,
        errorMessage: error.message
      }
    };
  }
}

// أداة لاختبار جميع الـ endpoints
export async function testAllUploadEndpoints(file: File) {
  const endpoints = [
    '/api/upload-image-safe',
    '/api/upload',
    '/api/upload-image',
    '/api/upload/cloudinary'
  ];
  
  console.log('🚀 [TEST ALL] بدء اختبار جميع endpoints...');
  
  const results = [];
  
  for (const endpoint of endpoints) {
    console.log(`\n🔍 اختبار ${endpoint}...`);
    const result = await debugFormDataRequest(file, endpoint);
    results.push({
      endpoint,
      ...result
    });
  }
  
  // ملخص النتائج
  console.log('\n📊 ملخص النتائج:');
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.endpoint}: ${result.status || 'ERROR'}`);
    
    if (!result.success && result.error) {
      console.log(`   خطأ: ${result.error}`);
    }
  });
  
  return results;
}

// مساعد لإنشاء ملف اختبار
export function createTestFile(): File {
  // إنشاء صورة PNG صغيرة
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, 1, 1);
  }
  
  return new Promise<File>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'test.png', { type: 'image/png' });
        resolve(file);
      }
    }, 'image/png');
  }) as any;
}

// استخدام الأداة من console المتصفح
if (typeof window !== 'undefined') {
  (window as any).debugUpload = {
    test: debugFormDataRequest,
    testAll: testAllUploadEndpoints,
    createTestFile
  };
  
  console.log('🛠️ [DEBUG TOOLS] أدوات التشخيص متاحة في window.debugUpload');
  console.log('📝 استخدام: window.debugUpload.testAll(file)');
}
