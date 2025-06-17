'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Heart, Check, ArrowRight, Sparkles, 
  Newspaper, Trophy, Globe, Briefcase, 
  Activity, Tv, BookOpen, Users 
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Category {
  id: number;
  name_ar: string;
  name_en: string;
  icon: string;
  color_hex: string;
  position: number;
  is_active: boolean;
}

// أيقونات التصنيفات
const categoryIcons: { [key: string]: React.ReactNode } = {
  '📰': <Newspaper className="w-6 h-6" />,
  '🏆': <Trophy className="w-6 h-6" />,
  '🌍': <Globe className="w-6 h-6" />,
  '💼': <Briefcase className="w-6 h-6" />,
  '❤️': <Activity className="w-6 h-6" />,
  '📺': <Tv className="w-6 h-6" />,
  '📚': <BookOpen className="w-6 h-6" />,
  '👥': <Users className="w-6 h-6" />
};

export default function PreferencesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    // التحقق من وجود المستخدم
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/register');
      return;
    }
    setUser(JSON.parse(userData));

    // تحميل التصنيفات
    fetchCategories();
  }, []);

  useEffect(() => {
    // جلب الاهتمامات السابقة إذا كان المستخدم موجوداً
    if (user) {
      fetchUserPreferences();
    }
  }, [user]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        const activeCategories = data.data.filter((cat: Category) => cat.is_active);
        setCategories(activeCategories);
      }
    } catch (error) {
      console.error('خطأ في تحميل التصنيفات:', error);
      toast.error('حدث خطأ في تحميل التصنيفات');
    }
  };

  const fetchUserPreferences = async () => {
    try {
      const response = await fetch(`/api/user/preferences/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data) {
          // استخراج معرفات التصنيفات المختارة مسبقاً
          const selectedIds = data.data.map((pref: any) => pref.category_id);
          setSelectedCategories(selectedIds);
          setIsEditMode(true); // إشارة أن المستخدم يعدّل اهتماماته
        }
      }
    } catch (error) {
      console.error('خطأ في جلب الاهتمامات السابقة:', error);
    }
  };

  const toggleCategory = (categoryId: number) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const selectAll = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categories.map(cat => cat.id));
    }
  };

  const handleSubmit = async () => {
    if (selectedCategories.length === 0) {
      toast.error('يرجى اختيار تصنيف واحد على الأقل');
      return;
    }

    setLoading(true);
    try {
      // حفظ التفضيلات
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          categoryIds: selectedCategories,
          source: isEditMode ? 'update' : 'manual'
        })
      });

      if (!response.ok) {
        throw new Error('فشل حفظ التفضيلات');
      }

      // منح نقاط إضافية للمستخدمين الجدد فقط
      if (!isEditMode) {
        await fetch('/api/user/loyalty-points', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            points: 10,
            action: 'select_preferences',
            description: 'اختيار التفضيلات الأولية'
          })
        });
        toast.success('🎉 رائع! لقد حصلت على 10 نقاط إضافية');
      } else {
        toast.success('تم تحديث اهتماماتك بنجاح');
      }
      
      // توجيه إلى الصفحة الرئيسية (واجهة المستخدم العامة)
      router.push('/newspaper');
    } catch (error) {
      toast.error('حدث خطأ في حفظ التفضيلات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full blur-3xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300 rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* رسالة الترحيب */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full shadow-lg mb-6">
            <Sparkles className="w-10 h-10 text-white animate-pulse" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {isEditMode ? 'تحديث اهتماماتك' : 'أهلاً بك في سبق'} 👋
          </h1>
          
          <p className="text-xl text-gray-600 mb-2">
            {isEditMode ? 'يمكنك تغيير اهتماماتك في أي وقت' : 'دعنا نُفهمك أكثر… حتى نُقدّم لك وجبة أخبار ذكية'}
          </p>
          
          <p className="text-lg text-gray-500">
            {selectedCategories.length > 0 
              ? `اخترت ${selectedCategories.length} من ${categories.length} تصنيف`
              : 'اختر اهتماماتك لتخصيص صفحتك الرئيسية!'}
          </p>
        </div>

        {/* زر اختيار الكل */}
        <div className="text-center mb-8">
          <button
            onClick={selectAll}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl hover:bg-white hover:shadow-md transition-all duration-300"
          >
            <Check className={`w-5 h-5 ${selectedCategories.length === categories.length ? 'text-blue-600' : 'text-gray-400'}`} />
            <span className="font-medium text-gray-700">
              {selectedCategories.length === categories.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
            </span>
          </button>
        </div>

        {/* شبكة التصنيفات */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
          {categories.map((category) => {
            const isSelected = selectedCategories.includes(category.id);
            return (
              <button
                key={category.id}
                onClick={() => toggleCategory(category.id)}
                className={`relative p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  isSelected 
                    ? 'border-transparent shadow-lg' 
                    : 'border-gray-200 bg-white/80 backdrop-blur-sm hover:border-gray-300 hover:shadow-md'
                }`}
                style={{
                  backgroundColor: isSelected ? category.color_hex + '20' : undefined,
                  borderColor: isSelected ? category.color_hex : undefined
                }}
              >
                {/* شارة التحديد */}
                {isSelected && (
                  <div 
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md"
                    style={{ backgroundColor: category.color_hex }}
                  >
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}

                {/* محتوى البطاقة */}
                <div className="flex flex-col items-center gap-3">
                  <div 
                    className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                      isSelected ? 'shadow-md' : 'bg-gray-100'
                    }`}
                    style={{
                      backgroundColor: isSelected ? category.color_hex : undefined,
                      color: isSelected ? 'white' : category.color_hex
                    }}
                  >
                    {categoryIcons[category.icon] || (
                      <span className="text-2xl">{category.icon}</span>
                    )}
                  </div>
                  
                  <h3 className={`font-semibold text-center ${
                    isSelected ? 'text-gray-800' : 'text-gray-700'
                  }`}>
                    {category.name_ar}
                  </h3>
                </div>
              </button>
            );
          })}
        </div>

        {/* عداد التصنيفات المختارة */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-md rounded-full shadow-md">
            <Heart className="w-5 h-5 text-red-500" />
            <span className="font-medium text-gray-700">
              اخترت {selectedCategories.length} من {categories.length} تصنيف
            </span>
          </div>
        </div>

        {/* زر الانطلاق */}
        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={loading || selectedCategories.length === 0}
            className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg ${
              selectedCategories.length > 0
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span>{isEditMode ? 'حفظ التغييرات' : 'انطلق'}</span>
            <span className="text-2xl">🚀</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* رسالة تحفيزية */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            {isEditMode 
              ? '💡 سيتم تحديث صفحتك الرئيسية بناءً على اهتماماتك الجديدة'
              : '💡 نصيحة: يمكنك تغيير اهتماماتك في أي وقت من إعدادات حسابك'}
          </p>
        </div>
      </div>
    </div>
  );
} 