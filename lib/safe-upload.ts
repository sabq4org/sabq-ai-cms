/**
 * 🔧 مكتبة آمنة لرفع الصور - خالية من مشاكل Content-Type
 * تضمن عدم تداخل headers مع FormData
 */

// أداة لرفع الصورة باستخدام fetch المباشر (الأكثر أماناً)
export async function safeUploadImage(file: File, type: string = 'general', endpoint: string = '/api/upload-image-safe') {
  console.log('🔐 [SAFE-UPLOAD] بدء رفع آمن:', {
    fileName: file.name,
    fileType: file.type,
    fileSize: (file.size / 1024).toFixed(1) + ' KB',
    uploadType: type,
    endpoint
  });

  try {
    // إنشاء FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    console.log('📋 [SAFE-UPLOAD] FormData تم إنشاؤها بنجاح');

    // ⚠️ CRITICAL: لا نضع أي headers يدوياً!
    // المتصفح سيضع Content-Type: multipart/form-data; boundary=... تلقائياً
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      credentials: 'include', // لإرسال الكوكيز
      // لا نضع headers هنا أبداً!
    });

    console.log('📨 [SAFE-UPLOAD] استجابة من الخادم:', {
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type')
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || `HTTP ${response.status}` };
      }

      console.error('❌ [SAFE-UPLOAD] خطأ من الخادم:', errorData);
      throw new Error(errorData.error || `فشل الرفع: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('✅ [SAFE-UPLOAD] تم الرفع بنجاح:', {
      success: result.success,
      url: result.url ? result.url.substring(0, 50) + '...' : null,
      fallback: result.fallback
    });

    return result;

  } catch (error: any) {
    console.error('❌ [SAFE-UPLOAD] خطأ في العملية:', error);
    throw new Error(error.message || 'فشل في رفع الصورة');
  }
}

// أداة لرفع متعدد الـ endpoints مع fallback
export async function uploadImageWithFallback(
  file: File, 
  type: string = 'general',
  endpoints: string[] = [
    '/api/upload-image-safe',
    '/api/upload',
    '/api/upload-image'
  ]
) {
  console.log('🔄 [FALLBACK-UPLOAD] بدء رفع مع fallback:', {
    fileName: file.name,
    endpoints: endpoints.length
  });

  for (let i = 0; i < endpoints.length; i++) {
    const endpoint = endpoints[i];
    
    try {
      console.log(`🔍 [FALLBACK-UPLOAD] محاولة ${i + 1}/${endpoints.length}: ${endpoint}`);
      
      const result = await safeUploadImage(file, type, endpoint);
      
      console.log(`✅ [FALLBACK-UPLOAD] نجحت المحاولة ${i + 1}`);
      return result;
      
    } catch (error: any) {
      console.warn(`⚠️ [FALLBACK-UPLOAD] فشلت المحاولة ${i + 1}:`, error.message);
      
      // إذا كانت آخر محاولة، نرمي الخطأ
      if (i === endpoints.length - 1) {
        throw error;
      }
      
      // وإلا نتابع للمحاولة التالية
      console.log(`🔄 [FALLBACK-UPLOAD] الانتقال للمحاولة التالية...`);
    }
  }
}

// أداة للاختبار السريع
export async function testUploadEndpoint(endpoint: string): Promise<boolean> {
  try {
    console.log(`🧪 [TEST-ENDPOINT] اختبار ${endpoint}...`);
    
    const response = await fetch(endpoint, {
      method: 'GET',
      credentials: 'include'
    });
    
    const isWorking = response.ok;
    console.log(`${isWorking ? '✅' : '❌'} [TEST-ENDPOINT] ${endpoint}: ${response.status}`);
    
    return isWorking;
    
  } catch (error) {
    console.error(`❌ [TEST-ENDPOINT] خطأ في ${endpoint}:`, error);
    return false;
  }
}

// أداة لإنشاء ملف اختبار سريع
export function createTestImageFile(): File {
  // إنشاء canvas صغير
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, 1, 1);
  }
  
  // تحويل لـ blob ثم file
  return new Promise<File>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'test-image.png', { type: 'image/png' });
        resolve(file);
      }
    }, 'image/png');
  }) as any;
}

// دالة مساعدة لفحص صحة الملف قبل الرفع
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // فحص النوع
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `نوع الملف غير مدعوم. المسموح: ${allowedTypes.join(', ')}`
    };
  }
  
  // فحص الحجم (10MB max)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `حجم الملف كبير جداً. الحد الأقصى: 10MB`
    };
  }
  
  // فحص اسم الملف
  if (!file.name || file.name.length < 1) {
    return {
      valid: false,
      error: 'اسم الملف مطلوب'
    };
  }
  
  return { valid: true };
}

// تصدير الدوال المساعدة لاستخدامها في window (للتشخيص)
if (typeof window !== 'undefined') {
  (window as any).safeUpload = {
    uploadImage: safeUploadImage,
    uploadWithFallback: uploadImageWithFallback,
    testEndpoint: testUploadEndpoint,
    createTestFile: createTestImageFile,
    validateFile: validateImageFile
  };
  
  console.log('🛠️ [SAFE-UPLOAD] أدوات الرفع الآمن متاحة في window.safeUpload');
}
