'use client';

import React, { useState } from 'react';
import { debugFormDataRequest, testAllUploadEndpoints } from '@/lib/debug-upload';

export function UploadDebugComponent() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log('📁 ملف محدد:', {
        name: file.name,
        type: file.type,
        size: file.size
      });
    }
  };

  const testSingleEndpoint = async (endpoint: string) => {
    if (!selectedFile) {
      alert('يرجى اختيار ملف أولاً');
      return;
    }

    setIsLoading(true);
    try {
      console.log(`🔍 اختبار ${endpoint}...`);
      const result = await debugFormDataRequest(selectedFile, endpoint);
      setResults(prev => [...prev, { endpoint, ...result, timestamp: new Date().toISOString() }]);
    } catch (error) {
      console.error('خطأ في الاختبار:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testAllEndpoints = async () => {
    if (!selectedFile) {
      alert('يرجى اختيار ملف أولاً');
      return;
    }

    setIsLoading(true);
    setResults([]);
    
    try {
      console.log('🚀 اختبار جميع endpoints...');
      const allResults = await testAllUploadEndpoints(selectedFile);
      setResults(allResults.map(result => ({ 
        ...result, 
        timestamp: new Date().toISOString() 
      })));
    } catch (error) {
      console.error('خطأ في الاختبار الشامل:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          🔧 أداة تشخيص APIs رفع الصور
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          اختبار وتشخيص مشاكل Content-Type في طلبات رفع الصور
        </p>
      </div>

      {/* اختيار الملف */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          اختر ملف للاختبار:
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500 dark:text-gray-400
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100"
        />
        {selectedFile && (
          <p className="mt-2 text-sm text-green-600 dark:text-green-400">
            ✅ تم اختيار: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>

      {/* أزرار الاختبار */}
      <div className="mb-6 space-y-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={() => testSingleEndpoint('/api/upload-image-safe')}
            disabled={!selectedFile || isLoading}
            className="px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Safe API
          </button>
          <button
            onClick={() => testSingleEndpoint('/api/upload')}
            disabled={!selectedFile || isLoading}
            className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Upload API
          </button>
          <button
            onClick={() => testSingleEndpoint('/api/upload-image')}
            disabled={!selectedFile || isLoading}
            className="px-3 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            Image API
          </button>
          <button
            onClick={() => testSingleEndpoint('/api/upload/cloudinary')}
            disabled={!selectedFile || isLoading}
            className="px-3 py-2 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
          >
            Cloudinary API
          </button>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={testAllEndpoints}
            disabled={!selectedFile || isLoading}
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50"
          >
            {isLoading ? '🔄 جاري الاختبار...' : '🚀 اختبار الكل'}
          </button>
          <button
            onClick={clearResults}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            🗑️ مسح النتائج
          </button>
        </div>
      </div>

      {/* النتائج */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            📊 نتائج الاختبار:
          </h3>
          
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${
                result.success
                  ? 'border-green-200 bg-green-50 dark:bg-green-900/20'
                  : 'border-red-200 bg-red-50 dark:bg-red-900/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className={`font-medium ${
                  result.success ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'
                }`}>
                  {result.success ? '✅' : '❌'} {result.endpoint}
                </h4>
                <span className="text-sm text-gray-500">
                  {result.status}
                </span>
              </div>
              
              {result.debugInfo && (
                <div className="text-sm space-y-1 mb-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Content-Type:</span>
                      <span className={`ml-2 ${result.contentType?.includes('multipart/form-data') 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                      }`}>
                        {result.contentType || 'غير محدد'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">FormData:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        {result.debugInfo.formDataCreated ? '✅ تم إنشاؤها' : '❌ فشل'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {result.error && (
                <div className="text-sm text-red-600 dark:text-red-400 mb-2">
                  <strong>خطأ:</strong> {result.error}
                </div>
              )}
              
              {result.data && (
                <details className="text-sm">
                  <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
                    عرض التفاصيل
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UploadDebugComponent;
