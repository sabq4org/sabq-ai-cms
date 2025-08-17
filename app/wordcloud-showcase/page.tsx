/**
 * صفحة عرض شاملة لمكونات سحابة الكلمات
 * /app/wordcloud-showcase/page.tsx
 */

'use client';

import WordCloud from '@/components/Analytics/WordCloud';
import CompactWordCloud from '@/components/Analytics/CompactWordCloud';
import AnalyticsDashboard from '@/components/Analytics/AnalyticsDashboard';
import { useState } from 'react';
import { Settings, Eye, Code, BarChart3 } from 'lucide-react';

export default function WordCloudShowcasePage() {
  const [activeDemo, setActiveDemo] = useState<'full' | 'compact' | 'dashboard' | 'settings'>('full');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      {/* رأس الصفحة */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎯 معرض سحابة الكلمات التفاعلية
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            مجموعة شاملة من مكونات سحابة الكلمات المصممة خصيصاً للمواقع الإخبارية العربية
          </p>
        </div>

        {/* شريط التنقل */}
        <div className="bg-white rounded-xl shadow-sm border p-2 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveDemo('full')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeDemo === 'full'
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <Eye className="w-4 h-4" />
              العرض الكامل
            </button>
            
            <button
              onClick={() => setActiveDemo('compact')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeDemo === 'compact'
                  ? 'bg-green-100 text-green-700 font-medium'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <Settings className="w-4 h-4" />
              العرض المصغر
            </button>
            
            <button
              onClick={() => setActiveDemo('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeDemo === 'dashboard'
                  ? 'bg-purple-100 text-purple-700 font-medium'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              لوحة التحليلات
            </button>
            
            <button
              onClick={() => setActiveDemo('settings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeDemo === 'settings'
                  ? 'bg-orange-100 text-orange-700 font-medium'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <Code className="w-4 h-4" />
              الإعدادات
            </button>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="max-w-7xl mx-auto">
        {/* العرض الكامل */}
        {activeDemo === 'full' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🌟 سحابة الكلمات الكاملة
              </h2>
              <p className="text-gray-600 mb-6">
                العرض الكامل مع جميع الميزات والوظائف التفاعلية
              </p>
              <WordCloud 
                autoRefresh={true}
                refreshInterval={30000}
                maxKeywords={25}
              />
            </div>
          </div>
        )}

        {/* العرض المصغر */}
        {activeDemo === 'compact' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                العرض المصغر الأساسي
              </h3>
              <CompactWordCloud maxKeywords={8} />
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                مع زر التحديث
              </h3>
              <CompactWordCloud maxKeywords={10} showRefresh={true} />
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                العرض الموسع
              </h3>
              <CompactWordCloud maxKeywords={15} showRefresh={true} />
            </div>
          </div>
        )}

        {/* لوحة التحليلات */}
        {activeDemo === 'dashboard' && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              📊 لوحة التحليلات مع سحابة الكلمات
            </h2>
            <AnalyticsDashboard 
              showWordCloud={true}
              autoRefresh={true}
              refreshInterval={60000}
            />
          </div>
        )}

        {/* الإعدادات والخيارات */}
        {activeDemo === 'settings' && (
          <div className="space-y-6">
            {/* معلومات API */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🔧 API Endpoints
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">جلب الكلمات المفتاحية</h3>
                  <code className="text-sm text-blue-600">GET /api/analytics/keywords</code>
                  <p className="text-sm text-gray-600 mt-2">
                    يدعم البارامترات: limit, category, trend, minCount
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">تتبع النقرات</h3>
                  <code className="text-sm text-blue-600">POST /api/analytics/keyword-click</code>
                  <p className="text-sm text-gray-600 mt-2">
                    لتسجيل وتتبع النقرات على الكلمات المفتاحية
                  </p>
                </div>
              </div>
            </div>

            {/* أمثلة الاستخدام */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                💻 أمثلة الكود
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">الاستخدام الأساسي</h3>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`import WordCloud from '@/components/Analytics/WordCloud';

<WordCloud 
  autoRefresh={true}
  refreshInterval={300000}
  maxKeywords={25}
/>`}
                  </pre>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">العرض المصغر</h3>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`import CompactWordCloud from '@/components/Analytics/CompactWordCloud';

<CompactWordCloud 
  maxKeywords={10}
  showRefresh={true}
/>`}
                  </pre>
                </div>
              </div>
            </div>

            {/* الميزات المتاحة */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ✨ الميزات المتاحة
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">المكون الكامل</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>✅ عرض تفاعلي كامل</li>
                    <li>✅ تأثيرات بصرية متقدمة</li>
                    <li>✅ نوافذ منبثقة للمعلومات</li>
                    <li>✅ تحديث تلقائي</li>
                    <li>✅ تتبع النقرات</li>
                    <li>✅ دعم RTL كامل</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">المكون المصغر</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>✅ تصميم مضغوط</li>
                    <li>✅ سهولة التضمين</li>
                    <li>✅ أداء محسن</li>
                    <li>✅ خيارات قابلة للتخصيص</li>
                    <li>✅ تحديث اختياري</li>
                    <li>✅ مناسب للشريط الجانبي</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* تذييل الصفحة */}
      <div className="max-w-7xl mx-auto mt-12">
        <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            🚀 جاهز للإنتاج
          </h3>
          <p className="text-gray-600 mb-4">
            جميع المكونات مختبرة ومحسنة للأداء والاستخدام في البيئة الإنتاجية
          </p>
          <div className="flex justify-center gap-4">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              ✅ محسن للأداء
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              🌐 دعم العربية
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
              📱 متجاوب
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
