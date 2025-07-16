const category = {
  name: 'مقالات',
  name_en: 'Articles',
  description: 'تحليلات ووجهات نظر وتقارير رأي',
  slug: 'articles',
  color: '#7C3AED',
  icon: '✍️',
  display_order: 11,
  is_active: true
};

async function addArticlesCategory() {
  try {
    const response = await fetch('http://localhost:3000/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(category)
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ تمت إضافة تصنيف "مقالات" بنجاح');
      console.log('📋 البيانات:', result.category);
    } else {
      console.error('❌ فشل إضافة التصنيف:', result.error || 'خطأ غير معروف');
    }
    
    // عرض جميع التصنيفات
    const allCategories = await fetch('http://localhost:3000/api/categories');
    const allData = await allCategories.json();
    
    if (allData.success) {
      console.log(`\n📊 إجمالي التصنيفات: ${allData.data.length}`);
      console.log('\n📋 جميع التصنيفات:');
      allData.data.forEach((cat, index) => {
        console.log(`${index + 1}. ${cat.icon} ${cat.name} (${cat.name_en}) - ${cat.slug}`);
      });
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

addArticlesCategory(); 