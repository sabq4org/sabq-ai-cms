'use client';

import React, { useState } from 'react';
import { 
  Moon, Sun, Eye, CheckCircle, XCircle, AlertTriangle, 
  Star, Heart, MessageCircle, Share, Settings, User,
  Home, Search, Bell, Menu, ChevronDown, Play, Pause
} from 'lucide-react';
import { useDarkModeContext } from '@/contexts/DarkModeContext';

export default function TestDarkModeComprehensive() {
  const { darkMode, toggleDarkMode } = useDarkModeContext();
  const [activeTab, setActiveTab] = useState('cards');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const testComponents = [
    { id: 'cards', name: 'البطاقات والكروت', icon: <Star className="w-4 h-4" /> },
    { id: 'forms', name: 'النماذج والمدخلات', icon: <Settings className="w-4 h-4" /> },
    { id: 'buttons', name: 'الأزرار والروابط', icon: <Play className="w-4 h-4" /> },
    { id: 'navigation', name: 'التنقل والقوائم', icon: <Menu className="w-4 h-4" /> },
    { id: 'content', name: 'المحتوى والنصوص', icon: <MessageCircle className="w-4 h-4" /> },
    { id: 'interactive', name: 'العناصر التفاعلية', icon: <Heart className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-300">
      {/* هيدر الاختبار */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Eye className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">
                اختبار شامل للوضع الليلي
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                الوضع الحالي: {darkMode ? 'ليلي' : 'عادي'}
              </span>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* تبويبات التصفح */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8">
              {testComponents.map((component) => (
                <button
                  key={component.id}
                  onClick={() => setActiveTab(component.id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === component.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {component.icon}
                  {component.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* محتوى التبويبات */}
        <div className="space-y-8">
          
          {/* اختبار البطاقات */}
          {activeTab === 'cards' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">اختبار البطاقات والكروت</h2>
              
              {/* بطاقات المقالات */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="article-card bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gray-100">
                    <img 
                      src="/api/placeholder/400/225" 
                      alt="صورة المقال"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      عنوان المقال الرئيسي
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      هذا نص تجريبي لوصف المقال ومحتواه الأساسي...
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="category-badge bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        تقنية
                      </span>
                      <span className="text-gray-500 text-xs">
                        منذ ساعتين
                      </span>
                    </div>
                  </div>
                </div>

                <div className="stat-card bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">إحصائيات اليوم</h3>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">المقالات المنشورة</span>
                      <span className="font-medium text-gray-900">24</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">القراءات</span>
                      <span className="font-medium text-gray-900">1,250</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">التفاعلات</span>
                      <span className="font-medium text-gray-900">89</span>
                    </div>
                  </div>
                </div>

                <div className="deep-analysis-card bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">تحليل عميق</h3>
                  <p className="text-gray-600 mb-4">
                    تحليل شامل للأحداث الجارية والتطورات المهمة
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="keyword-tag bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                      اقتصاد
                    </span>
                    <span className="keyword-tag bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                      سياسة
                    </span>
                    <span className="keyword-tag bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                      تحليل
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* اختبار النماذج */}
          {activeTab === 'forms' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">اختبار النماذج والمدخلات</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">نموذج تسجيل الدخول</h3>
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        البريد الإلكتروني
                      </label>
                      <input
                        type="email"
                        placeholder="أدخل بريدك الإلكتروني"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        كلمة المرور
                      </label>
                      <input
                        type="password"
                        placeholder="أدخل كلمة المرور"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        التصنيف
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>اختر التصنيف</option>
                        <option>أخبار</option>
                        <option>رياضة</option>
                        <option>تقنية</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ملاحظات
                      </label>
                      <textarea
                        rows={3}
                        placeholder="أضف ملاحظاتك هنا..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </form>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">عناصر التحكم</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" id="checkbox1" className="rounded" />
                      <label htmlFor="checkbox1" className="text-gray-700">
                        موافق على الشروط والأحكام
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="radio" id="radio1" name="radio" className="rounded" />
                      <label htmlFor="radio1" className="text-gray-700">
                        خيار أول
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="radio" id="radio2" name="radio" className="rounded" />
                      <label htmlFor="radio2" className="text-gray-700">
                        خيار ثاني
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        مستوى التقييم
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        defaultValue="50"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* اختبار الأزرار */}
          {activeTab === 'buttons' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">اختبار الأزرار والروابط</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">أنواع الأزرار</h3>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-3">
                      <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                        زر أساسي
                      </button>
                      <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
                        زر نجاح
                      </button>
                      <button className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
                        زر خطر
                      </button>
                      <button className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600">
                        زر تحذير
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50">
                        زر ثانوي
                      </button>
                      <button className="text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50">
                        زر نص
                      </button>
                      <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200">
                        زر رمادي
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">الروابط والتنقل</h3>
                  <div className="space-y-3">
                    <a href="#" className="block text-blue-600 hover:text-blue-800 hover:underline">
                      رابط عادي
                    </a>
                    <a href="#" className="block text-green-600 hover:text-green-800 hover:underline">
                      رابط أخضر
                    </a>
                    <a href="#" className="block text-red-600 hover:text-red-800 hover:underline">
                      رابط أحمر
                    </a>
                    <a href="#" className="block text-gray-600 hover:text-gray-800 hover:underline">
                      رابط رمادي
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* اختبار التنقل */}
          {activeTab === 'navigation' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">اختبار التنقل والقوائم</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">قائمة التنقل</h3>
                  <nav className="space-y-2">
                    <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                      <Home className="w-4 h-4" />
                      الرئيسية
                    </a>
                    <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                      <Search className="w-4 h-4" />
                      البحث
                    </a>
                    <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md bg-blue-50 text-blue-700">
                      <Bell className="w-4 h-4" />
                      الإشعارات
                    </a>
                    <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                      <User className="w-4 h-4" />
                      الملف الشخصي
                    </a>
                  </nav>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">قائمة منسدلة</h3>
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center justify-between w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
                    >
                      اختر خياراً
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                        <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                          خيار أول
                        </a>
                        <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                          خيار ثاني
                        </a>
                        <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                          خيار ثالث
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* اختبار المحتوى */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">اختبار المحتوى والنصوص</h2>
              
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">تدرج العناوين</h3>
                <div className="space-y-4">
                  <h1 className="text-3xl font-bold text-gray-900">عنوان H1</h1>
                  <h2 className="text-2xl font-semibold text-gray-800">عنوان H2</h2>
                  <h3 className="text-xl font-semibold text-gray-700">عنوان H3</h3>
                  <h4 className="text-lg font-medium text-gray-600">عنوان H4</h4>
                  <h5 className="text-base font-medium text-gray-500">عنوان H5</h5>
                  <h6 className="text-sm font-medium text-gray-400">عنوان H6</h6>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">أنواع النصوص</h3>
                <div className="space-y-3">
                  <p className="text-gray-900">نص أساسي باللون الرمادي الداكن</p>
                  <p className="text-gray-700">نص ثانوي باللون الرمادي المتوسط</p>
                  <p className="text-gray-500">نص باهت باللون الرمادي الفاتح</p>
                  <p className="text-gray-400">نص خفيف باللون الرمادي الأفتح</p>
                  <p className="text-blue-600">نص أزرق للروابط والعناصر التفاعلية</p>
                  <p className="text-green-600">نص أخضر للحالات الإيجابية</p>
                  <p className="text-red-600">نص أحمر للتحذيرات والأخطاء</p>
                </div>
              </div>
            </div>
          )}

          {/* اختبار العناصر التفاعلية */}
          {activeTab === 'interactive' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">اختبار العناصر التفاعلية</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">الأيقونات والرموز</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <Heart className="w-6 h-6 text-red-500" />
                      <span className="text-xs text-gray-600">إعجاب</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <MessageCircle className="w-6 h-6 text-blue-500" />
                      <span className="text-xs text-gray-600">تعليق</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Share className="w-6 h-6 text-green-500" />
                      <span className="text-xs text-gray-600">مشاركة</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Star className="w-6 h-6 text-yellow-500" />
                      <span className="text-xs text-gray-600">تقييم</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">حالات التفاعل</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-md">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-green-800">تمت العملية بنجاح</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-md">
                      <XCircle className="w-5 h-5 text-red-500" />
                      <span className="text-red-800">حدث خطأ في العملية</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      <span className="text-yellow-800">تحذير مهم</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ملخص الاختبار */}
        <div className="mt-12 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">ملخص نتائج الاختبار</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="font-semibold text-green-800">النصوص</div>
              <div className="text-sm text-green-600">تباين عالي وواضح</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Eye className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="font-semibold text-blue-800">الخلفيات</div>
              <div className="text-sm text-blue-600">ألوان متوازنة</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="font-semibold text-purple-800">التفاعل</div>
              <div className="text-sm text-purple-600">استجابة ممتازة</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 