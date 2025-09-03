"use client";

/**
 * صفحة اختبار الخط العربي المعتمد
 */

import React from 'react';

export default function TestFontPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        
        {/* رأس الصفحة */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎨 اختبار الخط العربي المعتمد
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            هذه الصفحة لاختبار ظهور خط IBM Plex Sans Arabic في جميع عناصر الموقع
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">معلومات الخط:</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• الخط الأساسي: IBM Plex Sans Arabic</li>
                <li>• الخطوط الاحتياطية: Tajawal, Noto Sans Arabic</li>
                <li>• المصدر: Google Fonts</li>
                <li>• الأوزان: 100-700</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">خصائص العرض:</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• تحسين العرض: optimizeLegibility</li>
                <li>• تنعيم الخط: antialiased</li>
                <li>• دعم الربط: ligatures</li>
                <li>• عرض سريع: font-display swap</li>
              </ul>
            </div>
          </div>
        </div>

        {/* اختبار الأوزان المختلفة */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">اختبار أوزان الخط</h2>
          
          <div className="space-y-4">
            <div className="font-thin text-xl">
              <span className="text-gray-500 text-sm">100 - رفيع:</span> النص العربي بخط IBM Plex Sans Arabic
            </div>
            <div className="font-extralight text-xl">
              <span className="text-gray-500 text-sm">200 - رفيع جداً:</span> النص العربي بخط IBM Plex Sans Arabic
            </div>
            <div className="font-light text-xl">
              <span className="text-gray-500 text-sm">300 - خفيف:</span> النص العربي بخط IBM Plex Sans Arabic
            </div>
            <div className="font-normal text-xl">
              <span className="text-gray-500 text-sm">400 - عادي:</span> النص العربي بخط IBM Plex Sans Arabic
            </div>
            <div className="font-medium text-xl">
              <span className="text-gray-500 text-sm">500 - متوسط:</span> النص العربي بخط IBM Plex Sans Arabic
            </div>
            <div className="font-semibold text-xl">
              <span className="text-gray-500 text-sm">600 - شبه عريض:</span> النص العربي بخط IBM Plex Sans Arabic
            </div>
            <div className="font-bold text-xl">
              <span className="text-gray-500 text-sm">700 - عريض:</span> النص العربي بخط IBM Plex Sans Arabic
            </div>
          </div>
        </div>

        {/* اختبار الأحجام المختلفة */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">اختبار أحجام الخط</h2>
          
          <div className="space-y-4">
            <div className="text-xs">
              <span className="text-gray-500">12px:</span> النص العربي بحجم صغير جداً
            </div>
            <div className="text-sm">
              <span className="text-gray-500">14px:</span> النص العربي بحجم صغير
            </div>
            <div className="text-base">
              <span className="text-gray-500">16px:</span> النص العربي بحجم عادي
            </div>
            <div className="text-lg">
              <span className="text-gray-500">18px:</span> النص العربي بحجم كبير
            </div>
            <div className="text-xl">
              <span className="text-gray-500">20px:</span> النص العربي بحجم كبير جداً
            </div>
            <div className="text-2xl">
              <span className="text-gray-500">24px:</span> النص العربي بحجم عنوان
            </div>
            <div className="text-3xl">
              <span className="text-gray-500">30px:</span> النص العربي بحجم عنوان كبير
            </div>
          </div>
        </div>

        {/* اختبار المحتوى المختلط */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">اختبار المحتوى المختلط</h2>
          
          <div className="prose prose-lg max-w-none">
            <p>
              هذا نص عربي يحتوي على <strong>كلمات عريضة</strong> و <em>كلمات مائلة</em> 
              وأيضاً <code>كود برمجي</code> ورقم <span className="text-blue-600">123456</span> 
              وتاريخ 2025/08/24 ورابط <a href="#" className="text-blue-600 hover:underline">اضغط هنا</a>.
            </p>
            
            <blockquote className="border-r-4 border-blue-500 pr-4 py-2 bg-blue-50 italic">
              "هذا اقتباس مهم يجب أن يظهر بخط واضح ومقروء باستخدام IBM Plex Sans Arabic"
            </blockquote>
            
            <ul>
              <li>عنصر قائمة أول</li>
              <li>عنصر قائمة ثاني مع <strong>نص عريض</strong></li>
              <li>عنصر قائمة ثالث مع رقم 456</li>
            </ul>
          </div>
        </div>

        {/* اختبار العناصر التفاعلية */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">اختبار العناصر التفاعلية</h2>
          
          <div className="space-y-6">
            {/* أزرار */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">الأزرار:</h3>
              <div className="flex gap-3 flex-wrap">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  زر أساسي
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                  زر ثانوي
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  زر حدود
                </button>
              </div>
            </div>

            {/* حقول الإدخال */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">حقول الإدخال:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="اكتب نصاً عربياً هنا"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>اختر خياراً</option>
                  <option>الخيار الأول</option>
                  <option>الخيار الثاني</option>
                </select>
              </div>
              <textarea 
                placeholder="اكتب نصاً طويلاً هنا لاختبار الخط في منطقة النص..."
                className="w-full mt-4 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* معلومات تقنية */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            ℹ️ معلومات تقنية
          </h3>
          <div className="text-blue-800 text-sm space-y-2">
            <p>• إذا كان الخط يظهر بشكل صحيح، ستلاحظ وضوحاً وجمالاً في النص العربي</p>
            <p>• يمكنك فتح أدوات المطور (F12) والتحقق من font-family في تبويب Elements</p>
            <p>• الخط المتوقع: IBM Plex Sans Arabic أو أحد البدائل المحددة</p>
            <p>• في حالة عدم ظهور الخط، تحقق من اتصال الإنترنت وGoogle Fonts</p>
          </div>
        </div>

      </div>
    </div>
  );
}
