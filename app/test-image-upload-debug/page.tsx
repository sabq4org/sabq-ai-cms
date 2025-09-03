'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Upload, 
  Server, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  FileImage,
  HardDrive,
  Cloud,
  Database,
  Shield
} from 'lucide-react';

export default function TestImageUploadDebugPage() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // اختبار APIs مختلفة
  const testAPIs = [
    {
      name: 'API الأساسي',
      endpoint: '/api/upload-image',
      method: 'POST',
      description: 'يحفظ الملفات في مجلدات النظام',
      icon: <HardDrive className="w-5 h-5 text-blue-600" />
    },
    {
      name: 'API الآمن',
      endpoint: '/api/upload-image-safe',
      method: 'POST', 
      description: 'يحول الصور إلى Base64',
      icon: <Shield className="w-5 h-5 text-green-600" />
    },
    {
      name: 'API البسيط',
      endpoint: '/api/upload-simple',
      method: 'POST',
      description: 'API قديم للمقارنة',
      icon: <Server className="w-5 h-5 text-orange-600" />
    }
  ];

  const runComprehensiveTest = async () => {
    if (!selectedFile) {
      toast.error('يرجى اختيار ملف أولاً');
      return;
    }

    setTesting(true);
    setResults([]);
    
    console.log('🧪 [Debug] بدء اختبار شامل لرفع الصور');
    
    for (const api of testAPIs) {
      const testResult = {
        api: api.name,
        endpoint: api.endpoint,
        status: 'testing',
        response: null,
        error: null,
        duration: 0,
        details: null
      };
      
      setResults(prev => [...prev, testResult]);
      
      const startTime = Date.now();
      
      try {
        console.log(`🔍 [Debug] اختبار ${api.name}: ${api.endpoint}`);
        
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('type', 'avatar');
        
        const response = await fetch(api.endpoint, {
          method: api.method,
          body: formData
        });
        
        const duration = Date.now() - startTime;
        const responseData = await response.json();
        
        testResult.status = response.ok ? 'success' : 'error';
        testResult.response = responseData;
        testResult.duration = duration;
        testResult.details = {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        };
        
        if (!response.ok) {
          testResult.error = responseData.error || `HTTP ${response.status}`;
        }
        
        console.log(`${response.ok ? '✅' : '❌'} [Debug] ${api.name}:`, {
          status: response.status,
          duration: duration + 'ms',
          success: response.ok,
          data: responseData
        });
        
      } catch (error: any) {
        const duration = Date.now() - startTime;
        testResult.status = 'error';
        testResult.error = error.message;
        testResult.duration = duration;
        
        console.error(`❌ [Debug] ${api.name} خطأ:`, error);
      }
      
      setResults(prev => prev.map(r => r.api === api.name ? testResult : r));
      
      // تأخير قصير بين الاختبارات
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setTesting(false);
    toast.success('تم الانتهاء من جميع الاختبارات');
  };

  const testAPIHealth = async (endpoint: string) => {
    try {
      const response = await fetch(endpoint, { method: 'GET' });
      const data = await response.json();
      return { success: response.ok, data, status: response.status };
    } catch (error: any) {
      return { success: false, error: error.message, status: 0 };
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log('📁 [Debug] تم اختيار ملف:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified).toISOString()
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'testing':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Server className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'testing':
        return 'border-blue-300 bg-blue-50';
      case 'success':
        return 'border-green-300 bg-green-50';
      case 'error':
        return 'border-red-300 bg-red-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">
        🔧 تشخيص مفصل لرفع الصور
      </h1>

      <div className="mb-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h2 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          مشكلة رفع الصور في إضافة عضو الفريق
        </h2>
        <p className="text-yellow-700 text-sm">
          الخطأ: "فشل في إنشاء مجلدات الحفظ" - يحدث في بيئة الإنتاج بسبب قيود نظام الملفات
        </p>
      </div>

      {/* اختيار الملف */}
      <div className="mb-8 p-6 border rounded-lg bg-white">
        <h2 className="text-xl font-semibold mb-4">1. اختيار الملف للاختبار</h2>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600">
            <Upload className="w-4 h-4" />
            اختيار صورة
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
          
          {selectedFile && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileImage className="w-4 h-4" />
              <span>{selectedFile.name}</span>
              <span>({Math.round(selectedFile.size / 1024)} KB)</span>
            </div>
          )}
        </div>
      </div>

      {/* اختبار شامل */}
      <div className="mb-8 p-6 border rounded-lg bg-white">
        <h2 className="text-xl font-semibold mb-4">2. اختبار شامل للـ APIs</h2>
        
        <button
          onClick={runComprehensiveTest}
          disabled={!selectedFile || testing}
          className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {testing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Database className="w-4 h-4" />
          )}
          {testing ? 'جاري الاختبار...' : 'بدء الاختبار الشامل'}
        </button>
      </div>

      {/* نتائج الاختبارات */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">3. نتائج الاختبارات</h2>
          
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-6 border rounded-lg ${getStatusColor(result.status)}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {testAPIs.find(api => api.name === result.api)?.icon}
                  <div>
                    <h3 className="font-semibold">{result.api}</h3>
                    <p className="text-sm text-gray-600">{result.endpoint}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusIcon(result.status)}
                  <span className="text-sm font-medium">
                    {result.duration}ms
                  </span>
                </div>
              </div>

              {result.error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
                  <strong>خطأ:</strong> {result.error}
                </div>
              )}

              {result.response && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">الاستجابة:</h4>
                  <pre className="text-xs bg-white p-3 border rounded overflow-auto max-h-40">
{JSON.stringify(result.response, null, 2)}
                  </pre>
                </div>
              )}

              {result.details && (
                <div className="mt-3 pt-3 border-t">
                  <h4 className="font-medium text-sm mb-2">تفاصيل تقنية:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="font-medium">Status:</span> {result.details.status}
                    </div>
                    <div>
                      <span className="font-medium">Status Text:</span> {result.details.statusText}
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span> {result.duration}ms
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* معلومات الحل */}
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
          <Cloud className="w-5 h-5" />
          الحل المقترح
        </h3>
        <div className="text-blue-700 text-sm space-y-2">
          <div>🔧 <strong>API آمن جديد:</strong> /api/upload-image-safe</div>
          <div>📦 <strong>يستخدم Base64:</strong> لا يحتاج مجلدات في نظام الملفات</div>
          <div>🔄 <strong>Fallback تلقائي:</strong> ينتقل للـ API الآمن عند فشل الأساسي</div>
          <div>🛡️ <strong>متوافق مع الإنتاج:</strong> يعمل في Vercel وبيئات serverless</div>
        </div>
      </div>

      {/* تعليمات للمطور */}
      <div className="mt-6 p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-semibold mb-4">📋 تعليمات للمطور</h3>
        <ol className="list-decimal list-inside text-sm space-y-1">
          <li>افتح Developer Tools (F12)</li>
          <li>راقب تبويب Console للرسائل المفصلة</li>
          <li>راقب تبويب Network لطلبات الـ API</li>
          <li>ابحث عن رسائل تبدأ بـ [Debug]</li>
          <li>لاحظ أي API يعمل وأيها يفشل</li>
          <li>إذا نجح الـ API الآمن، فالمشكلة في صلاحيات المجلدات</li>
        </ol>
      </div>
    </div>
  );
}