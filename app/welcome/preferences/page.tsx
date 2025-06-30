'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PreferencesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // جلب التصنيفات من قاعدة البيانات
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories?sortBy=displayOrder');
        const data = await response.json();
        
        if (data.success && data.categories) {
          setCategories(data.categories.filter((cat: any) => cat.isActive));
        } else {
          toast.error('لا توجد تصنيفات متاحة حالياً');
        }
      } catch (error) {
        toast.error('حدث خطأ في تحميل التصنيفات');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategoryIds(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = async () => {
    if (selectedCategoryIds.length < 1) {
      toast.error('اختر اهتماماً واحداً على الأقل');
      return;
    }
    setLoading(true);
    // ... (rest of the submit logic will be reviewed in the next step)
    // For now, let's just make sure the UI works
    console.log('Selected category IDs:', selectedCategoryIds);
    toast.success('تم حفظ اهتماماتك (محاكاة)');
    setLoading(false);
    router.push('/welcome/feed');
  };

  if (loadingCategories) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="relative z-10 max-w-5xl mx-auto pt-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg mb-6">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">مرحباً بك في رحلتك الذكية!</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            اختر التصنيفات التي تهمك لنقدم لك محتوى مخصصاً.
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl p-8 border">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">اختر اهتماماتك</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {categories.map((category) => {
              const isSelected = selectedCategoryIds.includes(category.id);
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryToggle(category.id)}
                  className={`relative p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                    isSelected 
                      ? 'border-blue-500 shadow-lg' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={isSelected ? { borderColor: category.color || '#3B82F6' } : {}}
                >
                   {isSelected && (
                    <div className="absolute inset-0 opacity-10 rounded-2xl" style={{ backgroundColor: category.color }}></div>
                  )}
                  
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg" style={{ backgroundColor: category.color }}>
                      <span className="text-3xl">{category.icon || '📁'}</span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{category.name}</h3>
                    <p className="text-xs text-gray-500 text-center mt-1">{category.description}</p>
                    
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle className="w-6 h-6" style={{ color: category.color || '#3B82F6' }} />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              تخطي الآن
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={selectedCategoryIds.length === 0 || loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
            >
              {loading ? 'جارٍ الحفظ...' : `حفظ الاهتمامات (${selectedCategoryIds.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 