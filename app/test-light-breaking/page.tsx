'use client';

import React, { useEffect, useState } from 'react';
import LightBreakingNews from '@/components/LightBreakingNews';

export default function LightBreakingNewsTest() {
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testAPI = async () => {
      try {
        console.log('🔍 Testing API from test page...');
        const response = await fetch('/api/breaking-news');
        const data = await response.json();
        setApiData(data);
        console.log('🔍 API Data:', data);
      } catch (error) {
        console.error('🔍 API Error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    testAPI();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          🔥 اختبار مكون الأخبار العاجلة الخفيفة
        </h1>
        
        <div className="space-y-6">
          {/* معلومات API */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">📡 استجابة API</h2>
            {loading ? (
              <p>جاري التحميل...</p>
            ) : (
              <pre className="text-sm overflow-auto bg-gray-100 p-4 rounded">
                {JSON.stringify(apiData, null, 2)}
              </pre>
            )}
          </div>
          
          {/* مكون الأخبار العاجلة الخفيفة */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">📱 مكون LightBreakingNews</h2>
            <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg">
              <LightBreakingNews darkMode={false} />
            </div>
          </div>
          
          {/* مكون الأخبار العاجلة الخفيفة (الوضع المظلم) */}
          <div className="bg-gray-900 p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-white">🌙 مكون LightBreakingNews (الوضع المظلم)</h2>
            <div className="border-2 border-dashed border-gray-600 p-4 rounded-lg">
              <LightBreakingNews darkMode={true} />
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-600">
          افتح وحدة تحكم المطور (F12) لمراقبة رسائل التشخيص التفصيلية
        </div>
      </div>
    </div>
  );
}
