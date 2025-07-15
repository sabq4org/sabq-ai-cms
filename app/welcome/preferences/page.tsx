'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Header from '@/components/Header';
import { Settings, ArrowRight, Check } from 'lucide-react';

interface Category {
  id: number;
  name_ar: string;
  name_en: string;
  description: string;
  slug: string;
  color_hex: string;
  icon: string;
  position: number;
  is_active: boolean;
}

export default function PreferencesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [user, setUser] = useState<any>(null);

  // جلب المستخدم الحالي
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    }
  }, []);

  // جلب التصنيفات من API أو ملف JSON
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        
        // محاولة جلب من API أولاً
        let response = await fetch('/api/categories');
        let result;
        
        if (response.ok) {
          result = await response.json();
          if (result.success && result.data) {
            setCategories(result.data);
            return;
          }
        }
        
        // إذا فشل API، جلب من ملف JSON
        response = await fetch('/data/categories.json');
        result = await response.json();
        
        if (result.categories) {
          setCategories(result.categories);
        } else {
          throw new Error('فشل في جلب التصنيفات');
        }
        
      } catch (error) {
        console.error('خطأ في جلب التصنيفات:', error);
        toast.error('فشل في تحميل التصنيفات');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // معالجة اختيار/إلغاء اختيار التصنيف
  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategoryIds(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        if (prev.length >= 5) {
          toast.error('يمكنك اختيار 5 اهتمامات كحد أقصى');
          return prev;
        }
        return [...prev, categoryId];
      }
    });
  };

  // حفظ الاهتمامات
  const handleSubmit = async () => {
    if (selectedCategoryIds.length === 0) {
      toast.error('يرجى اختيار اهتمام واحد على الأقل');
      return;
    }

    setLoading(true);
    
    try {
      // الحصول على معرف المستخدم
      let userId = user?.id;
      
      if (!userId) {
        // إنشاء مستخدم ضيف إذا لم يكن موجود
        userId = 'guest-' + Date.now();
        const guestUser = {
          id: userId,
          name: 'ضيف',
          email: null,
          interests: selectedCategoryIds
        };
        localStorage.setItem('user', JSON.stringify(guestUser));
        setUser(guestUser);
      }

      // حفظ الاهتمامات في قاعدة البيانات
      const response = await fetch('/api/user/interests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          categoryIds: selectedCategoryIds,
          source: 'onboarding'
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'فشل حفظ الاهتمامات');
      }

      // تحديث localStorage بالاهتمامات
      const currentUserData = localStorage.getItem('user');
      if (currentUserData) {
        const updatedUser = JSON.parse(currentUserData);
        updatedUser.interests = selectedCategoryIds;
        updatedUser.categoryIds = selectedCategoryIds;
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      // منح نقاط الولاء للمستخدمين المسجلين
      if (userId && !userId.startsWith('guest-')) {
        try {
          await fetch('/api/loyalty', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              action: 'complete_interests',
              points: 5,
              description: 'إتمام اختيار الاهتمامات'
            })
          });
        } catch (loyaltyError) {
          console.error('خطأ في منح نقاط الولاء:', loyaltyError);
          // لا نوقف العملية بسبب خطأ النقاط
        }
      }

      toast.success('تم حفظ اهتماماتك بنجاح! 🎉');
      
      // انتظار ثانية ثم التوجيه
      setTimeout(() => {
        router.push('/');
      }, 1000);

    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('حدث خطأ في حفظ الاهتمامات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingCategories) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل التصنيفات...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            
            {/* العنوان الرئيسي */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
                <Settings className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                اختر اهتماماتك
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                اختر من <span className="font-bold text-blue-600">{categories.length}</span> تصنيف لنقدم لك محتوى مخصص يناسب اهتماماتك
                <br />
                <span className="text-lg text-gray-500">يمكنك اختيار حتى 5 تصنيفات</span>
              </p>
            </div>

            {/* شبكة التصنيفات */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
              {categories
                .filter(category => category.is_active)
                .sort((a, b) => a.position - b.position)
                .map((category) => {
                  const isSelected = selectedCategoryIds.includes(category.id);
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryToggle(category.id)}
                      className={`relative p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                      }`}
                    >
                      {/* علامة الاختيار */}
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                      
                      {/* محتوى التصنيف */}
                      <div className="text-center">
                        <div 
                          className="text-4xl mb-3"
                          style={{ color: category.color_hex }}
                        >
                          {category.icon}
                        </div>
                        
                        <h3 className="font-bold text-lg text-gray-900 mb-2">
                          {category.name_ar}
                        </h3>
                        
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {category.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
            </div>

            {/* معلومات الاختيار */}
            <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    اختياراتك الحالية
                  </h3>
                  <p className="text-gray-600">
                    {selectedCategoryIds.length} من 5 تصنيفات
                  </p>
                </div>
                
                <div className="flex items-center space-x-1 rtl:space-x-reverse">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full ${
                        index < selectedCategoryIds.length
                          ? 'bg-blue-600'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              {/* عرض التصنيفات المختارة */}
              {selectedCategoryIds.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {selectedCategoryIds.map(categoryId => {
                      const category = categories.find(c => c.id === categoryId);
                      if (!category) return null;
                      
                      return (
                        <span
                          key={categoryId}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          style={{ 
                            backgroundColor: category.color_hex + '20',
                            color: category.color_hex 
                          }}
                        >
                          <span>{category.icon}</span>
                          {category.name_ar}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* أزرار التحكم */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleSubmit}
                disabled={selectedCategoryIds.length === 0 || loading}
                className={`flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all transform ${
                  selectedCategoryIds.length === 0 || loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:scale-105 shadow-lg'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    احفظ اهتماماتي
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
              
              <button
                onClick={() => router.push('/')}
                className="px-8 py-4 rounded-xl font-bold text-lg border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all"
              >
                تخطي الآن
              </button>
            </div>

            {/* ملاحظة */}
            <div className="text-center mt-8">
              <p className="text-sm text-gray-500">
                💡 يمكنك تغيير اهتماماتك في أي وقت من خلال صفحة الملف الشخصي
              </p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}