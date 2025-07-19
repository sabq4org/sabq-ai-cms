'use client';

import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  AlertCircle,
  Brain,
  Code,
  MessageSquare,
  FileText,
  Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface TestResult {
  service: string;
  success: boolean;
  message: string;
  time?: number;
}

export default function TestOpenAIIntegrationPage() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const services = [
    {
      name: 'إعدادات OpenAI',
      endpoint: '/api/settings/openai',
      method: 'GET',
      icon: Brain
    },
    {
      name: 'المحرر الذكي',
      endpoint: '/api/ai/smart-editor',
      method: 'POST',
      body: { 
        type: 'improve_text', 
        content: 'اختبار النص',
        context: {}
      },
      icon: Code
    },
    {
      name: 'التحليل العميق',
      endpoint: '/api/deep-analyses/generate',
      method: 'POST',
      body: {
        title: 'اختبار التحليل',
        creationType: 'topic',
        categories: ['test']
      },
      icon: FileText
    },
    {
      name: 'تحليل التعليقات',
      endpoint: '/api/moderation/analyze',
      method: 'POST',
      body: {
        comment: 'هذا تعليق اختباري'
      },
      icon: MessageSquare
    },
    {
      name: 'اختبار الاتصال',
      endpoint: '/api/ai/test-connection',
      method: 'POST',
      body: {},
      icon: Sparkles
    }
  ];

  const runTests = async () => {
    setTesting(true);
    setResults([]);

    for (const service of services) {
      const startTime = Date.now();
      
      try {
        // أولاً نحصل على المفتاح من الإعدادات
        if (service.method === 'POST' && service.name !== 'إعدادات OpenAI') {
          const settingsResponse = await fetch('/api/settings/openai');
          const settingsData = await settingsResponse.json();
          
          if (settingsData.data?.openai?.hasKey) {
            // نضيف المفتاح للطلبات التي تحتاجه
            if (service.name === 'اختبار الاتصال') {
              const keyResponse = await fetch('/api/settings/openai');
              const keyData = await keyResponse.json();
              // لا نستخدم المفتاح مباشرة في الاختبار
            }
          }
        }

        const response = await fetch(service.endpoint, {
          method: service.method,
          headers: service.method === 'POST' ? {
            'Content-Type': 'application/json'
          } : undefined,
          body: service.method === 'POST' ? JSON.stringify(service.body) : undefined
        });

        const data = await response.json();
        const time = Date.now() - startTime;

        if (response.ok && (data.success !== false)) {
          setResults(prev => [...prev, {
            service: service.name,
            success: true,
            message: 'نجح الاختبار',
            time
          }]);
        } else {
          setResults(prev => [...prev, {
            service: service.name,
            success: false,
            message: data.error || 'فشل الاختبار',
            time
          }]);
        }
      } catch (error: any) {
        setResults(prev => [...prev, {
          service: service.name,
          success: false,
          message: error.message || 'خطأ في الاتصال',
          time: Date.now() - startTime
        }]);
      }
    }

    setTesting(false);
    toast.success('اكتمل الاختبار');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* العنوان */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Brain className="w-8 h-8 text-purple-600" />
          اختبار تكامل OpenAI
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          اختبر جميع خدمات الذكاء الاصطناعي للتأكد من عملها بشكل صحيح
        </p>
      </div>

      {/* زر البدء */}
      <div className="mb-6">
        <button
          onClick={runTests}
          disabled={testing}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {testing ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              جاري الاختبار...
            </>
          ) : (
            <>
              <Brain className="w-5 h-5" />
              بدء الاختبار الشامل
            </>
          )}
        </button>
      </div>

      {/* النتائج */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">نتائج الاختبار</h2>
          
          {services.map((service, index) => {
            const result = results.find(r => r.service === service.name);
            const Icon = service.icon;
            
            return (
              <div
                key={service.name}
                className={`p-4 rounded-lg border transition-all ${
                  !result 
                    ? 'border-gray-300 dark:border-gray-700' 
                    : result.success 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                      : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="font-medium">{service.name}</span>
                  </div>
                  
                  {result ? (
                    <div className="flex items-center gap-3">
                      {result.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className={`text-sm ${
                        result.success ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {result.message}
                      </span>
                      {result.time && (
                        <span className="text-xs text-gray-500">
                          ({result.time}ms)
                        </span>
                      )}
                    </div>
                  ) : testing ? (
                    <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ملخص النتائج */}
      {results.length === services.length && !testing && (
        <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">ملخص النتائج</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">نجح:</span>
              <p className="text-2xl font-bold text-green-600">
                {results.filter(r => r.success).length}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">فشل:</span>
              <p className="text-2xl font-bold text-red-600">
                {results.filter(r => !r.success).length}
              </p>
            </div>
          </div>
          
          {results.every(r => r.success) ? (
            <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-700 dark:text-green-300">
                جميع الخدمات تعمل بشكل صحيح!
              </span>
            </div>
          ) : (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-700 dark:text-red-300">
                بعض الخدمات تحتاج إلى مراجعة
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 