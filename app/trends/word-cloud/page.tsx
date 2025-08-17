"use client";

import React, { useState } from "react";
import AdvancedWordCloud from "@/components/AdvancedWordCloud";
import { 
  TrendingUp, 
  Tag, 
  Clock, 
  BarChart3,
  Sparkles,
  Globe,
  Users,
  Target
} from "lucide-react";

export default function WordCloudPage() {
  const [selectedCategory, setSelectedCategory] = useState("");

  // معالجة النقر على الكلمة
  const handleWordClick = (word: any) => {
    // الانتقال إلى صفحة العلامة أو فتح modal مع المقالات المرتبطة
    window.open(word.url, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* الهيدر */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              اكتشف الاتجاهات السائدة
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              سحابة الكلمات التفاعلية تعرض أهم الموضوعات والكلمات المفتاحية الرائجة في الأخبار.
              اكتشف ما يتحدث عنه العالم الآن وتابع الاتجاهات الساخنة.
            </p>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">الكلمات الرائجة</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">+127</p>
            <p className="text-sm text-green-600 mt-1">↑ 23% هذا الأسبوع</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Tag className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">إجمالي العلامات</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">2,847</p>
            <p className="text-sm text-blue-600 mt-1">نشطة حالياً</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">التفاعلات</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">84.2K</p>
            <p className="text-sm text-purple-600 mt-1">آخر 30 يوم</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Globe className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">التغطية العالمية</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">94%</p>
            <p className="text-sm text-orange-600 mt-1">من الأخبار الرئيسية</p>
          </div>
        </div>

        {/* سحابة الكلمات الرئيسية */}
        <div className="mb-8">
          <AdvancedWordCloud
            height={600}
            autoUpdate={true}
            updateInterval={300000} // 5 دقائق
            onWordClick={handleWordClick}
            enableControls={true}
            enableAnalytics={true}
            defaultFilters={{
              period: 30,
              colorScheme: "rainbow",
              shape: "cloud"
            }}
            className="mb-6"
          />
        </div>

        {/* معرض العرض بأنماط مختلفة */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* سحابة مصغرة للأخبار الرياضية */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b bg-gradient-to-r from-green-50 to-emerald-50">
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                الرياضة والألعاب
              </h3>
              <p className="text-gray-600 text-sm">أحدث الاتجاهات في عالم الرياضة</p>
            </div>
            <AdvancedWordCloud
              height={300}
              autoUpdate={false}
              enableControls={false}
              enableAnalytics={false}
              onWordClick={handleWordClick}
              defaultFilters={{
                period: 7,
                category: "رياضة",
                colorScheme: "green"
              }}
            />
          </div>

          {/* سحابة مصغرة للتكنولوجيا */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-cyan-50">
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                التكنولوجيا والابتكار
              </h3>
              <p className="text-gray-600 text-sm">آخر التطورات التقنية والذكاء الاصطناعي</p>
            </div>
            <AdvancedWordCloud
              height={300}
              autoUpdate={false}
              enableControls={false}
              enableAnalytics={false}
              onWordClick={handleWordClick}
              defaultFilters={{
                period: 7,
                category: "تكنولوجيا",
                colorScheme: "blue"
              }}
            />
          </div>
        </div>

        {/* نصائح وإرشادات الاستخدام */}
        <div className="bg-white rounded-xl shadow-lg p-8 border">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            كيفية قراءة سحابة الكلمات
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">حجم الكلمة</h4>
                <p className="text-gray-600 text-sm">
                  الكلمات الأكبر حجماً تشير إلى شعبية أعلى واستخدام أكثر في الأخبار الحديثة.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">2</span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">لون الكلمة</h4>
                <p className="text-gray-600 text-sm">
                  الألوان تعكس معدل النمو - الأخضر للنمو السريع، الأحمر للتراجع، والأزرق للاستقرار.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm">3</span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">موقع الكلمة</h4>
                <p className="text-gray-600 text-sm">
                  الكلمات في المركز عادة ما تكون الأكثر أهمية، بينما تتوزع الأخرى حسب الصلة.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-sm">4</span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">التفاعل</h4>
                <p className="text-gray-600 text-sm">
                  انقر على أي كلمة لرؤية المقالات المرتبطة بها والإحصائيات التفصيلية.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <span className="text-indigo-600 font-bold text-sm">5</span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">التخصيص</h4>
                <p className="text-gray-600 text-sm">
                  استخدم أدوات التحكم لتغيير الفترة الزمنية، الألوان، والفلاتر حسب اهتمامك.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 font-bold text-sm">6</span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">التحديث التلقائي</h4>
                <p className="text-gray-600 text-sm">
                  البيانات تُحدث تلقائياً كل 5 دقائق لتعكس أحدث الاتجاهات والأخبار الجديدة.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
          <div className="text-center">
            <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              بيانات محدثة في الوقت الفعلي
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              تعتمد سحابة الكلمات على خوارزميات متقدمة لتحليل الاتجاهات وحساب الشعبية بناءً على 
              عوامل متعددة مثل التكرار، المشاهدات، والحداثة. البيانات محدثة كل بضع دقائق لضمان 
              دقة المعلومات وملاءمتها للأحداث الجارية.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
