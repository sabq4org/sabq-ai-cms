'use client';

import React, { useState, useEffect } from 'react';

interface Category {
  id: string | number;
  name: string;
  name_ar?: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  cover_image?: string;
  articles_count?: number;
  is_active: boolean;
  metadata?: {
    name_ar?: string;
    name_en?: string;
    cover_image?: string;
    icon?: string;
    color_hex?: string;
    [key: string]: any;
  };
}

export default function CategoriesClient() {
  console.log('🏗️ CategoriesClient component تم إنشاؤه');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🚀 CategoriesClient useEffect تم تشغيله!');
    console.log('🔧 نوع المتصفح:', typeof window);
    console.log('🌍 البيئة:', process.env.NODE_ENV);
    
    // تأخير صغير للتأكد من أن الـ DOM جاهز
    const timer = setTimeout(() => {
      console.log('⏰ Timer executed - سيتم استدعاء fetchCategories');
      fetchCategories();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const fetchCategories = async () => {
    try {
      console.log('📞 بدء استدعاء fetchCategories...');
      setLoading(true);
      setError(null);
      
      console.log('🌐 إرسال طلب إلى /api/categories...');
      const response = await fetch('/api/categories');
      console.log('📡 استجابة الخادم:', { status: response.status, ok: response.ok });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📦 البيانات المستلمة الكاملة:', data);
        
        if (data.success) {
          const categoriesData = data.categories || data.data || [];
          console.log('🔍 البيانات المستلمة من API:', { 
            total: categoriesData.length, 
            sample: categoriesData[0] 
          });
          
          // تحويل البيانات للتأكد من وجود name_ar في المكان الصحيح
          const normalizedCategories = categoriesData.map((cat: any) => {
            const normalized = { ...cat };
            // إذا كان name_ar في metadata، انقله للمستوى الرئيسي
            if (!normalized.name_ar && normalized.metadata?.name_ar) {
              normalized.name_ar = normalized.metadata.name_ar;
            }
            // إذا لم يكن هناك name_ar على الإطلاق، استخدم name
            if (!normalized.name_ar && normalized.name) {
              normalized.name_ar = normalized.name;
            }
            return normalized;
          });
          
          console.log('🔄 البيانات بعد التطبيع:', { 
            total: normalizedCategories.length, 
            sample: normalizedCategories[0] 
          });
          
          // فلترة التصنيفات النشطة والتحقق من وجود البيانات المطلوبة
          const activeCategories = normalizedCategories
            .filter((cat: Category) => cat && typeof cat === 'object') // التأكد من أنه كائن صالح
            .filter((cat: Category) => {
              const isValid = cat.is_active && (cat.name_ar || cat.name);
              if (!isValid) {
                console.log('❌ تصنيف مُهمل:', { 
                  id: cat.id, 
                  name: cat.name, 
                  name_ar: cat.name_ar, 
                  is_active: cat.is_active 
                });
              }
              return isValid;
            });
          
          console.log('✅ التصنيفات النشطة النهائية:', activeCategories.length);
          setCategories(activeCategories);
        } else {
          setError(data.message || 'فشل في تحميل التصنيفات');
          setCategories([]);
        }
      } else {
        setError('حدث خطأ في تحميل التصنيفات');
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('فشل في الاتصال بالخادم');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">جاري تحميل التصنيفات...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">خطأ: {error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">التصنيفات ({categories.length})</h1>
      
      {categories.length === 0 ? (
        <div className="text-center text-gray-500">
          لا توجد تصنيفات متاحة
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div key={category.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2">
                {category.name_ar || category.name}
              </h3>
              {category.description && (
                <p className="text-gray-600 text-sm mb-2">{category.description}</p>
              )}
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>المقالات: {category.articles_count || 0}</span>
                {category.icon && <span>{category.icon}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
