/**
 * سكريبت اختبار API تحديث التصنيف
 */

async function testCategoryUpdate() {
  console.log('🧪 بدء اختبار API تحديث التصنيف...\n');
  
  const baseUrl = 'http://localhost:3002';
  const categoryId = 'cat-001'; // معرف تصنيف للاختبار
  
  // بيانات الاختبار
  const updateData = {
    name: 'اختبار تحديث',
    slug: 'test-update',
    description: 'وصف اختباري محدث',
    color: '#FF6B6B',
    icon: '🧪',
    display_order: 99,
    is_active: true,
    metadata: {
      cover_image: 'https://example.com/test-image.jpg'
    }
  };
  
  try {
    console.log('📡 إرسال طلب PUT إلى:', `${baseUrl}/api/categories/${categoryId}`);
    console.log('📋 البيانات المرسلة:', JSON.stringify(updateData, null, 2));
    
    const response = await fetch(`${baseUrl}/api/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    console.log('\n📊 معلومات الاستجابة:');
    console.log('- الحالة:', response.status, response.statusText);
    console.log('- نوع المحتوى:', response.headers.get('content-type'));
    console.log('- حجم المحتوى:', response.headers.get('content-length'));
    
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('\n✅ استجابة JSON:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      console.log('\n❌ استجابة نصية غير متوقعة:');
      console.log(text.substring(0, 500) + (text.length > 500 ? '...' : ''));
      
      // محاولة تحديد نوع الخطأ
      if (text.includes('<!DOCTYPE') || text.includes('<html')) {
        console.log('\n⚠️ يبدو أن الاستجابة صفحة HTML - قد يكون هناك خطأ في المسار');
      }
    }
    
  } catch (error) {
    console.error('\n❌ خطأ في الاختبار:', error.message);
    console.error(error.stack);
  }
}

// تشغيل الاختبار
testCategoryUpdate(); 