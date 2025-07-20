import React from 'react';

export default function BreakingNewsTest() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          🔥 اختبار الأخبار العاجلة
        </h1>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">🔍 اختبار API</h2>
            <div id="api-test" className="text-gray-600">
              جاري الفحص...
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">📱 مكون LightBreakingNews</h2>
            <div className="border p-4 rounded">
              <div id="light-breaking-news">
                {/* سيتم إدراج المكون هنا */}
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">🔧 معلومات التشخيص</h2>
            <div id="debug-info" className="text-sm text-gray-600">
              افتح وحدة تحكم المطور (F12) لمراقبة رسائل التشخيص
            </div>
          </div>
        </div>
      </div>
      
      <script dangerouslySetInnerHTML={{
        __html: `
          // اختبار API للأخبار العاجلة
          async function testBreakingNewsAPI() {
            try {
              console.log('🔍 Testing breaking news API...');
              const response = await fetch('/api/breaking-news');
              const data = await response.json();
              
              document.getElementById('api-test').innerHTML = 
                '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
              
              console.log('API Response:', data);
            } catch (error) {
              console.error('API Test Error:', error);
              document.getElementById('api-test').innerHTML = 
                '<div class="text-red-600">خطأ في API: ' + error.message + '</div>';
            }
          }
          
          // تشغيل الاختبار عند تحميل الصفحة
          window.addEventListener('load', testBreakingNewsAPI);
        `
      }} />
    </div>
  );
}
