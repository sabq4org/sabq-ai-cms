/**
 * سكريبت لمسح كاش التصنيفات يدوياً
 * يمكن استخدامه في حالة الحاجة لتحديث فوري
 */

async function clearCategoryCache() {
  console.log('🧹 مسح كاش التصنيفات...\n');
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002';
  
  try {
    // طلب جلب التصنيفات مع تجاوز الكاش
    console.log('📡 إرسال طلب لتجاوز الكاش...');
    const response = await fetch(`${baseUrl}/api/categories?nocache=true`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ تم مسح الكاش وجلب البيانات الجديدة');
      console.log(`📊 عدد التصنيفات: ${data.categories?.length || 0}`);
      
      // عرض أسماء التصنيفات
      if (data.categories && data.categories.length > 0) {
        console.log('\n📋 التصنيفات المحدثة:');
        data.categories.forEach((cat, index) => {
          const hasImage = cat.metadata?.cover_image ? '🖼️' : '  ';
          console.log(`${index + 1}. ${hasImage} ${cat.name} (${cat.slug})`);
        });
      }
    } else {
      console.error('❌ فشل في مسح الكاش:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ خطأ في الاتصال:', error.message);
  }
  
  console.log('\n✨ انتهى!');
}

// تشغيل السكريبت
clearCategoryCache(); 