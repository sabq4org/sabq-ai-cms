// سكريبت لإعادة تحقق صحة الصفحة الرئيسية
const fetch = require('node-fetch');

async function revalidateHomePage() {
  try {
    console.log('🔄 جاري إعادة تحقق صحة الصفحة الرئيسية...');
    
    // إعادة تحقق صحة الصفحة الرئيسية
    const response = await fetch('http://localhost:3000/api/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: '/',
        secret: process.env.REVALIDATION_SECRET || 'sabq-revalidation-secret'
      })
    });
    
    const data = await response.json();
    
    if (data.revalidated) {
      console.log('✅ تم إعادة تحقق صحة الصفحة الرئيسية بنجاح');
    } else {
      console.error('❌ فشل في إعادة تحقق صحة الصفحة الرئيسية:', data.message || 'خطأ غير معروف');
    }
    
  } catch (error) {
    console.error('❌ خطأ في إعادة تحقق صحة الصفحة الرئيسية:', error);
  }
}

// تنفيذ إعادة التحقق
revalidateHomePage();