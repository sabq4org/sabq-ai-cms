import React from 'react';

async function fetchCategoriesServer() {
  try {
    console.log('🔄 جلب التصنيفات من الخادم...');
    
    // استيراد المكتبة مباشرة
    const { getCachedCategories } = await import('@/lib/cache-utils');
    const categoriesResult = await getCachedCategories();
    
    if (categoriesResult && Array.isArray(categoriesResult)) {
      const categories = categoriesResult.filter((cat: any) => cat.is_active);
      console.log('✅ تم جلب التصنيفات من الخادم:', categories.length);
      return categories;
    }
  } catch (error) {
    console.error('❌ خطأ في جلب التصنيفات من الخادم:', error);
  }
  
  return [];
}

export default async function CategoriesPage() {
  console.log('🏠 CategoriesPage SSR تم تحميله');
  
  const categories = await fetchCategoriesServer();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            تصنيفات الأخبار
          </h1>
          <p className="text-lg text-gray-600">
            استكشف أحدث الأخبار حسب التصنيف ({categories.length} تصنيف متاح)
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              لا توجد تصنيفات متاحة حالياً
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category: any) => (
              <div
                key={category.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
              >
                {/* صورة التصنيف */}
                {category.metadata?.cover_image && (
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    <img
                      src={category.metadata.cover_image}
                      alt={category.metadata?.name_ar || category.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                {/* محتوى التصنيف */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {category.metadata?.name_ar || category.name}
                    </h3>
                    {category.icon && (
                      <span className="text-2xl">{category.icon}</span>
                    )}
                  </div>
                  
                  {category.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {category.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <span className="text-sm text-gray-500">
                        📰 {category.articles_count || 0} مقال
                      </span>
                      {category.color && (
                        <span 
                          className="w-4 h-4 rounded-full inline-block"
                          style={{ backgroundColor: category.color }}
                        />
                      )}
                    </div>
                    
                    <a
                      href={`/categories/${category.slug}`}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      عرض المقالات
                      <svg
                        className="mr-2 w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* إحصائيات */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-6 space-x-reverse text-sm text-gray-500">
            <span>📊 إجمالي التصنيفات: {categories.length}</span>
            <span>📈 إجمالي المقالات: {categories.reduce((sum: number, cat: any) => sum + (cat.articles_count || 0), 0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
