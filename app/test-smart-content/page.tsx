'use client';

import { useState } from 'react';
import SmartPersonalizedContent from '@/components/article/SmartPersonalizedContent';

export default function TestSmartContentPage() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-6xl mx-auto py-8 px-4">
          {/* رأس الصفحة */}
          <div className="mb-8 text-center">
            <h1 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              🧪 اختبار وحدة "مخصص لك بذكاء" المحسنة
            </h1>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              معاينة التحسينات الجديدة على نظام التوصيات الذكي
            </p>
            
            {/* زر تبديل الوضع الليلي */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`mt-4 px-4 py-2 rounded-lg font-medium transition-colors ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              {darkMode ? '☀️ الوضع النهاري' : '🌙 الوضع الليلي'}
            </button>
          </div>

          {/* معلومات المقال الوهمي */}
          <div className={`mb-8 p-6 rounded-xl border ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              📰 معلومات المقال الحالي (للاختبار)
            </h2>
            <div className={`space-y-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <p><strong>معرف المقال:</strong> test-article-123</p>
              <p><strong>التصنيف:</strong> تقنية</p>
              <p><strong>الكلمات المفتاحية:</strong> ذكاء اصطناعي، تقنية، مستقبل</p>
            </div>
          </div>

          {/* وحدة التوصيات الذكية */}
          <div className={`rounded-xl overflow-hidden shadow-lg ${
            darkMode ? 'shadow-gray-800' : 'shadow-gray-200'
          }`}>
            <SmartPersonalizedContent
              articleId="test-article-123"
              categoryId="tech-category"
              categoryName="تقنية"
              tags={['ذكاء اصطناعي', 'تقنية', 'مستقبل']}
              darkMode={darkMode}
              userId="test-user-123"
            />
          </div>

          {/* ملاحظات التحسينات */}
          <div className={`mt-8 p-6 rounded-xl border ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-blue-900'}`}>
              ✨ التحسينات المنفذة:
            </h3>
            <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-blue-800'}`}>
              <li>✅ زيادة عدد البطاقات من 4 إلى 6</li>
              <li>✅ صور كبيرة وجذابة لكل بطاقة</li>
              <li>✅ أيقونات تعبيرية محدثة (📰 🧠 🗣️ ✨)</li>
              <li>✅ عبارات تشويقية مخصصة لكل نوع محتوى</li>
              <li>✅ زر تحديث يدوي مع تحديث تلقائي كل 12 ساعة</li>
              <li>✅ كوكتيل ذكي من أنواع المحتوى المختلفة</li>
              <li>✅ مؤشرات بصرية محسنة (ترتيب، ثقة، إحصائيات)</li>
            </ul>
          </div>
        </div>
      </div>
  );
} 