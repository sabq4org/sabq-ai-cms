'use client';

import { useState, useEffect } from 'react';

export default function TestCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<string>('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 بدء جلب التصنيفات...');
      
      const response = await fetch('/api/categories?active=true');
      const text = await response.text();
      
      console.log('📡 النص الخام:', text);
      setRawResponse(text);
      
      try {
        const data = JSON.parse(text);
        console.log('📦 البيانات المحولة:', data);
        
        if (data.success && data.data) {
          setCategories(data.data);
        } else if (data.categories) {
          setCategories(data.categories);
        } else {
          setError('تنسيق البيانات غير متوقع');
        }
      } catch (parseError) {
        console.error('❌ خطأ في تحليل JSON:', parseError);
        setError('خطأ في تحليل البيانات');
      }
    } catch (error) {
      console.error('❌ خطأ في الطلب:', error);
      setError(error instanceof Error ? error.message : 'خطأ غير معروف');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">اختبار API التصنيفات</h1>
      
      <button 
        onClick={fetchCategories}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        إعادة التحميل
      </button>
      
      {loading && <p>جاري التحميل...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          خطأ: {error}
        </div>
      )}
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">الاستجابة الخام:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
          {rawResponse || 'لا توجد بيانات'}
        </pre>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-2">التصنيفات ({categories.length}):</h2>
        {categories.length > 0 ? (
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li key={cat.id} className="bg-white p-3 rounded shadow">
                <span className="font-medium">{cat.name}</span>
                <span className="text-gray-500 mr-2">({cat.id})</span>
                {cat.is_active && <span className="text-green-500">✓ نشط</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">لا توجد تصنيفات</p>
        )}
      </div>
    </div>
  );
} 