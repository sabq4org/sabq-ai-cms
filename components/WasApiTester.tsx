'use client';

import React, { useState } from 'react';
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Loader2,
  PlayCircle,
  Info,
  AlertTriangle
} from 'lucide-react';

interface TestResult {
  endpoint: string;
  status: 'idle' | 'testing' | 'success' | 'error';
  duration?: number;
  response?: any;
  error?: string;
  timestamp?: Date;
}

export default function WasApiTester() {
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [testingAll, setTestingAll] = useState(false);
  const [basketId, setBaskletId] = useState(3);

  const endpoints = [
    { name: 'GetStatus', action: 'status', method: 'POST' },
    { name: 'GetBaskets', action: 'baskets', method: 'POST' },
    { name: 'GetNextNews', action: 'news', method: 'POST', params: { basket_CD: basketId } },
    { name: 'GetAllClassifications', action: 'classifications', method: 'POST' },
    { name: 'GetAllPriorities', action: 'priorities', method: 'POST' },
    { name: 'GetAllRegions', action: 'regions', method: 'POST' },
    { name: 'GetAllSiteSections', action: 'siteSections', method: 'POST', params: { basketId } }
  ];

  const testEndpoint = async (endpoint: typeof endpoints[0]) => {
    const startTime = Date.now();
    
    setResults(prev => ({
      ...prev,
      [endpoint.name]: {
        endpoint: endpoint.name,
        status: 'testing',
        timestamp: new Date()
      }
    }));

    try {
      const body = {
        action: endpoint.action,
        ...endpoint.params
      };

      const response = await fetch('/api/was-news', {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      setResults(prev => ({
        ...prev,
        [endpoint.name]: {
          endpoint: endpoint.name,
          status: response.ok && data.success ? 'success' : 'error',
          duration,
          response: data,
          error: !data.success ? data.error : undefined,
          timestamp: new Date()
        }
      }));

    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      setResults(prev => ({
        ...prev,
        [endpoint.name]: {
          endpoint: endpoint.name,
          status: 'error',
          duration,
          error: error.message,
          timestamp: new Date()
        }
      }));
    }
  };

  const testAllEndpoints = async () => {
    setTestingAll(true);
    
    for (const endpoint of endpoints) {
      await testEndpoint(endpoint);
      // انتظار قصير بين الطلبات
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setTestingAll(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'testing':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-300"></div>;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'testing':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-xl font-bold transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            🧪 اختبار API واس الجديد
          </h2>
          <p className={`text-sm mt-1 transition-colors duration-300 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            اختبار جميع endpoints بناءً على ملف Postman المحدث
          </p>
        </div>
        
        <div className="flex gap-3">
          <div className="flex items-center gap-2">
            <label className={`text-sm transition-colors duration-300 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Basket ID:
            </label>
            <input
              type="number"
              value={basketId}
              onChange={(e) => setBaskletId(Number(e.target.value))}
              className={`w-16 px-2 py-1 rounded border text-sm transition-colors duration-300 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              min="1"
              max="10"
            />
          </div>
          
          <button
            onClick={testAllEndpoints}
            disabled={testingAll}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-300 flex items-center gap-2"
          >
            {testingAll ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري الاختبار...
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4" />
                اختبار الكل
              </>
            )}
          </button>
        </div>
      </div>

      {/* تحديث التحذير */}
      <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">
              🔄 تحديث: استخدام ملف Postman الجديد
            </h3>
            <ul className="text-sm text-yellow-800 dark:text-yellow-400 space-y-1">
              <li>• تم تحديث API ليستخدم X-API-Key في الهيدر</li>
              <li>• تغيير هيكل البيانات لـ GetNextNews</li>
              <li>• إضافة endpoints جديدة: Classifications, Priorities, Regions, SiteSections</li>
              <li>• استخدام GET بدلاً من POST مع body في بعض الطلبات</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {endpoints.map((endpoint) => {
          const result = results[endpoint.name];
          
          return (
            <div
              key={endpoint.name}
              className={`rounded-xl p-4 border transition-colors duration-300 ${
                darkMode ? 'border-gray-600' : 'border-gray-200'
              } ${result?.status === 'success' ? 'bg-green-50 dark:bg-green-900/20' : 
                   result?.status === 'error' ? 'bg-red-50 dark:bg-red-900/20' : 
                   'bg-gray-50 dark:bg-gray-700'}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result?.status || 'idle')}
                  <div>
                    <h3 className={`font-semibold transition-colors duration-300 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {endpoint.name}
                    </h3>
                    <p className={`text-xs transition-colors duration-300 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {endpoint.method} • Action: {endpoint.action}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {result?.duration && (
                    <span className={`text-xs font-mono transition-colors duration-300 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {result.duration}ms
                    </span>
                  )}
                  
                  <button
                    onClick={() => testEndpoint(endpoint)}
                    disabled={result?.status === 'testing'}
                    className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50 transition-colors duration-300"
                  >
                    {result?.status === 'testing' ? 'جاري...' : 'اختبار'}
                  </button>
                </div>
              </div>

              {result?.status && result.status !== 'idle' && (
                <div className="space-y-2">
                  <div className={`text-sm font-medium ${getStatusColor(result.status)}`}>
                    {result.status === 'success' && '✅ نجح الاختبار'}
                    {result.status === 'error' && '❌ فشل الاختبار'}
                    {result.status === 'testing' && '🔄 جاري الاختبار...'}
                  </div>
                  
                  {result.error && (
                    <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                      <strong>خطأ:</strong> {result.error}
                    </div>
                  )}
                  
                  {result.response && result.status === 'success' && (
                    <details className="text-xs">
                      <summary className={`cursor-pointer hover:text-blue-600 transition-colors duration-300 ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        عرض الاستجابة
                      </summary>
                      <pre className={`mt-2 p-3 rounded-lg overflow-x-auto transition-colors duration-300 ${
                        darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {JSON.stringify(result.response, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ملخص النتائج */}
      {Object.keys(results).length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
          <h3 className={`font-semibold mb-3 transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            📊 ملخص النتائج
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className={`text-center p-3 rounded-lg transition-colors duration-300 ${
              darkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <div className="text-2xl font-bold text-green-600">
                {Object.values(results).filter(r => r.status === 'success').length}
              </div>
              <div className={`text-sm transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                نجح
              </div>
            </div>
            <div className={`text-center p-3 rounded-lg transition-colors duration-300 ${
              darkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <div className="text-2xl font-bold text-red-600">
                {Object.values(results).filter(r => r.status === 'error').length}
              </div>
              <div className={`text-sm transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                فشل
              </div>
            </div>
            <div className={`text-center p-3 rounded-lg transition-colors duration-300 ${
              darkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <div className="text-2xl font-bold text-blue-600">
                {Object.values(results).filter(r => r.duration).reduce((acc, r) => acc + (r.duration || 0), 0) / 
                 Object.values(results).filter(r => r.duration).length || 0}ms
              </div>
              <div className={`text-sm transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                متوسط الاستجابة
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
