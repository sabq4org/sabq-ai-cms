'use client';

import React, { useState } from 'react';
import CategoryFormModal from '@/components/CategoryFormModal';
import CategoriesAnalytics from '@/components/dashboard/CategoriesAnalytics';
import { Button } from '@/components/ui/button';
import { Plus, BarChart2 } from 'lucide-react';

// بيانات تجريبية
const mockCategories = [
  {
    id: '1',
    name: 'أخبار',
    name_ar: 'أخبار',
    name_en: 'News',
    slug: 'news',
    description: 'آخر الأخبار المحلية والعالمية',
    color: '#FF0000',
    color_hex: '#FF0000',
    icon: '📰',
    articles_count: 150,
    is_active: true,
    parent_id: null,
    position: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'رياضة',
    name_ar: 'رياضة',
    name_en: 'Sports',
    slug: 'sports',
    description: 'أخبار الرياضة والمباريات',
    color: '#00FF00',
    color_hex: '#00FF00',
    icon: '⚽',
    articles_count: 120,
    is_active: true,
    parent_id: null,
    position: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'تقنية',
    name_ar: 'تقنية',
    name_en: 'Technology',
    slug: 'tech',
    description: 'آخر أخبار التقنية والتكنولوجيا',
    color: '#0000FF',
    color_hex: '#0000FF',
    icon: '💻',
    articles_count: 80,
    is_active: true,
    parent_id: null,
    position: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'اقتصاد',
    name_ar: 'اقتصاد',
    name_en: 'Economy',
    slug: 'economy',
    description: 'أخبار الاقتصاد والأعمال',
    color: '#FFA500',
    color_hex: '#FFA500',
    icon: '💰',
    articles_count: 60,
    is_active: true,
    parent_id: null,
    position: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    name: 'ثقافة',
    name_ar: 'ثقافة',
    name_en: 'Culture',
    slug: 'culture',
    description: 'أخبار الثقافة والفنون',
    color: '#8B5CF6',
    color_hex: '#8B5CF6',
    icon: '🎭',
    articles_count: 40,
    is_active: false,
    parent_id: null,
    position: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export default function TestCategoriesComponents() {
  const [showModal, setShowModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleSaveCategory = async (data: any) => {
    console.log('حفظ التصنيف:', data);
    // محاكاة حفظ البيانات
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          اختبار مكونات التصنيفات الجديدة
        </h1>

        {/* أزرار التحكم */}
        <div className="flex gap-4 mb-8">
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 ml-2" />
            إضافة تصنيف جديد
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => setShowAnalytics(!showAnalytics)}
          >
            <BarChart2 className="w-4 h-4 ml-2" />
            {showAnalytics ? 'إخفاء الإحصائيات' : 'عرض الإحصائيات'}
          </Button>
        </div>

        {/* عرض الإحصائيات */}
        {showAnalytics && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              إحصائيات التصنيفات
            </h2>
            <CategoriesAnalytics categories={mockCategories} />
          </div>
        )}

        {/* قائمة التصنيفات */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            التصنيفات المتاحة
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockCategories.map((category) => (
              <div 
                key={category.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedCategory(category);
                  setShowModal(true);
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ 
                      backgroundColor: category.color_hex,
                      color: '#fff'
                    }}
                  >
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {category.name_ar}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {category.articles_count} مقال
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  {category.description}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    /{category.slug}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    category.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {category.is_active ? 'نشط' : 'مخفي'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* نموذج إضافة/تعديل التصنيف */}
        <CategoryFormModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedCategory(null);
          }}
          onSave={handleSaveCategory}
          category={selectedCategory}
          categories={mockCategories}
        />
      </div>
    </div>
  );
} 