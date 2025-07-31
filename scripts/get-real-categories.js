const fetch = require('node-fetch');

async function getCategories() {
  console.log('📋 جلب التصنيفات...\n');
  
  try {
    const response = await fetch('http://localhost:3002/api/categories');
    
    if (response.ok) {
      const data = await response.json();
      const categories = data.categories || data || [];
      
      console.log(`✅ تم جلب ${categories.length} تصنيف:\n`);
      
      categories.forEach(cat => {
        console.log(`- ID: ${cat.id}`);
        console.log(`  الاسم: ${cat.name_ar || cat.name}`);
        console.log(`  Slug: ${cat.slug}`);
        console.log('');
      });
      
      if (categories.length > 0) {
        console.log(`\n💡 استخدم أحد هذه المعرفات في التحديث:`);
        console.log(`   category_id: "${categories[0].id}"`);
      }
    } else {
      console.error('❌ فشل جلب التصنيفات:', response.status);
    }
  } catch (error) {
    console.error('❌ خطأ:', error);
  }
}

getCategories().catch(console.error);