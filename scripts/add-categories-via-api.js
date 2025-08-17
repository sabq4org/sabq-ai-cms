const categories = [
  {
    name: 'محليات',
    name_en: 'Local',
    description: 'أخبار المناطق والمدن السعودية',
    slug: 'local',
    color: '#3B82F6',
    icon: '🗺️',
    display_order: 1,
    is_active: true
  },
  {
    name: 'العالم',
    name_en: 'World',
    description: 'أخبار العالم والتحليلات الدولية',
    slug: 'world',
    color: '#6366F1',
    icon: '🌍',
    display_order: 2,
    is_active: true
  },
  {
    name: 'حياتنا',
    name_en: 'Life',
    description: 'نمط الحياة، الصحة، الأسرة والمجتمع',
    slug: 'life',
    color: '#F472B6',
    icon: '🌱',
    display_order: 3,
    is_active: true
  },
  {
    name: 'محطات',
    name_en: 'Stations',
    description: 'تقارير خاصة وملفات متنوعة',
    slug: 'stations',
    color: '#FBBF24',
    icon: '🛤️',
    display_order: 4,
    is_active: true
  },
  {
    name: 'رياضة',
    name_en: 'Sports',
    description: 'أخبار رياضية محلية وعالمية',
    slug: 'sports',
    color: '#F59E0B',
    icon: '⚽',
    display_order: 5,
    is_active: true
  },
  {
    name: 'سياحة',
    name_en: 'Tourism',
    description: 'تقارير سياحية ومواقع مميزة',
    slug: 'tourism',
    color: '#34D399',
    icon: '🧳',
    display_order: 6,
    is_active: true
  },
  {
    name: 'أعمال',
    name_en: 'Business',
    description: 'أخبار الأعمال والشركات وريادة الأعمال',
    slug: 'business',
    color: '#10B981',
    icon: '💼',
    display_order: 7,
    is_active: true
  },
  {
    name: 'تقنية',
    name_en: 'Technology',
    description: 'أخبار وتطورات التقنية والذكاء الاصطناعي',
    slug: 'technology',
    color: '#8B5CF6',
    icon: '💻',
    display_order: 8,
    is_active: true
  },
  {
    name: 'سيارات',
    name_en: 'Cars',
    description: 'أخبار وتقارير السيارات',
    slug: 'cars',
    color: '#0EA5E9',
    icon: '🚗',
    display_order: 9,
    is_active: true
  },
  {
    name: 'ميديا',
    name_en: 'Media',
    description: 'فيديوهات وصور وإعلام رقمي',
    slug: 'media',
    color: '#EAB308',
    icon: '🎬',
    display_order: 10,
    is_active: true
  },
  {
    name: 'مقالات',
    name_en: 'Articles',
    description: 'تحليلات ووجهات نظر وتقارير رأي',
    slug: 'articles',
    color: '#7C3AED',
    icon: '✍️',
    display_order: 11,
    is_active: true
  }
];

async function addCategoriesViaAPI() {
  console.log('🚀 بدء إضافة التصنيفات عبر API...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const category of categories) {
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
        console.log(`✅ تمت إضافة: ${category.name} (${category.name_en})`);
        successCount++;
      } else {
        console.error(`❌ فشل إضافة ${category.name}:`, result.error || 'خطأ غير معروف');
        errorCount++;
      }
    } catch (error) {
      console.error(`❌ خطأ في إضافة ${category.name}:`, error.message);
      errorCount++;
    }
  }
  
  console.log('\n📊 ملخص النتائج:');
  console.log(`✅ تمت إضافة ${successCount} تصنيف بنجاح`);
  if (errorCount > 0) {
    console.log(`❌ فشل إضافة ${errorCount} تصنيف`);
  }
  
  // التحقق من التصنيفات
  try {
    const response = await fetch('http://localhost:3000/api/categories');
    const result = await response.json();
    
    if (result.success && result.data) {
      console.log(`\n📋 إجمالي التصنيفات في قاعدة البيانات: ${result.data.length}`);
    }
  } catch (error) {
    console.error('❌ فشل التحقق من التصنيفات:', error.message);
  }
}

// تشغيل السكريبت
addCategoriesViaAPI(); 