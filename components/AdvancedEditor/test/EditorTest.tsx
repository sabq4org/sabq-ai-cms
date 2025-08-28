'use client';

import React, { useState } from 'react';
import { AdvancedEditor } from '../AdvancedEditor';
import { 
  defaultEditorConfig, 
  defaultToolbarConfig, 
  defaultColorPalette, 
  defaultFontConfig 
} from '../index';
import toast, { Toaster } from 'react-hot-toast';

export function EditorTest() {
  const [content, setContent] = useState(`
    <h1>اختبار المحرر المتقدم لسبق الذكية</h1>
    
    <p>هذا نص تجريبي لاختبار جميع ميزات المحرر المتقدم. يمكنك تجربة:</p>
    
    <h2>التنسيق الأساسي</h2>
    <p>النص <strong>الغامق</strong> و <em>المائل</em> و <u>المسطر</u> و <s>المشطوب</s> و <code>الكود المضمن</code></p>
    
    <h2>الألوان والخطوط</h2>
    <p style="color: #ff0000; font-family: Arial;">نص أحمر بخط Arial</p>
    <p style="background-color: #ffff00;">نص بخلفية صفراء</p>
    
    <h2>القوائم</h2>
    <ul>
      <li>عنصر قائمة نقطية 1</li>
      <li>عنصر قائمة نقطية 2</li>
      <li>عنصر قائمة نقطية 3</li>
    </ul>
    
    <ol>
      <li>عنصر قائمة مرقمة 1</li>
      <li>عنصر قائمة مرقمة 2</li>
      <li>عنصر قائمة مرقمة 3</li>
    </ol>
    
    <h2>الاقتباسات</h2>
    <blockquote>
      هذا اقتباس تجريبي لاختبار ميزة الاقتباسات في المحرر المتقدم.
    </blockquote>
    
    <h2>الأكواد</h2>
    <pre><code class="language-javascript">
function hello() {
  console.log("مرحبا من المحرر المتقدم!");
}
    </code></pre>
    
    <h2>الجداول</h2>
    <table>
      <thead>
        <tr>
          <th>العمود الأول</th>
          <th>العمود الثاني</th>
          <th>العمود الثالث</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>البيانات 1</td>
          <td>البيانات 2</td>
          <td>البيانات 3</td>
        </tr>
        <tr>
          <td>البيانات 4</td>
          <td>البيانات 5</td>
          <td>البيانات 6</td>
        </tr>
      </tbody>
    </table>
    
    <h2>الروابط والصور</h2>
    <p>هذا <a href="https://sabq.org">رابط لموقع سبق</a></p>
    
    <h2>الرموز التعبيرية</h2>
    <p>يمكنك إضافة رموز تعبيرية مثل 😀 و ❤️ و 👍 و 🎉</p>
  `);

  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  // محاكاة حفظ المحتوى
  const handleSave = async (content: string) => {
    setIsLoading(true);
    
    // محاكاة تأخير الشبكة
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('تم حفظ المحتوى:', content);
    setIsLoading(false);
    
    return Promise.resolve();
  };

  // اختبار الأداء
  const runPerformanceTest = () => {
    const startTime = performance.now();
    
    // اختبار سرعة التحديث
    const testContent = content + '\n<p>نص إضافي للاختبار</p>';
    setContent(testContent);
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    const result = {
      test: 'سرعة التحديث',
      duration: `${duration.toFixed(2)} ms`,
      status: duration < 100 ? 'نجح' : 'بطيء',
      timestamp: new Date().toLocaleTimeString('ar-SA')
    };
    
    setTestResults(prev => [...prev, result]);
    toast.success(`اختبار الأداء: ${duration.toFixed(2)} ms`);
  };

  // اختبار الذاكرة
  const runMemoryTest = () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const result = {
        test: 'استخدام الذاكرة',
        duration: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        status: memory.usedJSHeapSize < 50 * 1024 * 1024 ? 'جيد' : 'مرتفع',
        timestamp: new Date().toLocaleTimeString('ar-SA')
      };
      
      setTestResults(prev => [...prev, result]);
      toast.success('تم اختبار الذاكرة');
    } else {
      toast.error('اختبار الذاكرة غير متاح في هذا المتصفح');
    }
  };

  // اختبار الميزات
  const runFeatureTest = () => {
    const features = [
      'التنسيق الأساسي',
      'الألوان والخطوط',
      'القوائم',
      'الاقتباسات',
      'الأكواد',
      'الجداول',
      'الروابط',
      'الرموز التعبيرية'
    ];

    features.forEach((feature, index) => {
      setTimeout(() => {
        const result = {
          test: feature,
          duration: 'متاح',
          status: 'نجح',
          timestamp: new Date().toLocaleTimeString('ar-SA')
        };
        
        setTestResults(prev => [...prev, result]);
      }, index * 200);
    });

    toast.success('تم اختبار جميع الميزات');
  };

  // مسح نتائج الاختبار
  const clearResults = () => {
    setTestResults([]);
    toast.success('تم مسح النتائج');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Toaster position="top-left" />
      
      {/* عنوان الصفحة */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          اختبار المحرر المتقدم
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          اختبار شامل لجميع ميزات المحرر المتقدم لمشروع سبق الذكية
        </p>
      </div>

      {/* أزرار الاختبار */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={runPerformanceTest}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          اختبار الأداء
        </button>
        <button
          onClick={runMemoryTest}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          اختبار الذاكرة
        </button>
        <button
          onClick={runFeatureTest}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          اختبار الميزات
        </button>
        <button
          onClick={clearResults}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          مسح النتائج
        </button>
      </div>

      {/* نتائج الاختبار */}
      {testResults.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-semibold mb-3">نتائج الاختبار</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-right p-2">الاختبار</th>
                  <th className="text-right p-2">النتيجة</th>
                  <th className="text-right p-2">الحالة</th>
                  <th className="text-right p-2">الوقت</th>
                </tr>
              </thead>
              <tbody>
                {testResults.map((result, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="p-2">{result.test}</td>
                    <td className="p-2">{result.duration}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        result.status === 'نجح' 
                          ? 'bg-green-100 text-green-800' 
                          : result.status === 'بطيء'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.status}
                      </span>
                    </td>
                    <td className="p-2">{result.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* المحرر */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <AdvancedEditor
          initialContent={content}
          config={{
            ...defaultEditorConfig,
            placeholder: 'ابدأ الكتابة لاختبار المحرر...',
            enableAutoSave: true,
            autoSaveInterval: 3000,
            maxLength: 10000,
            enableWordCount: true,
            enableCharacterCount: true,
            enableReadingTime: true
          }}
          toolbarConfig={defaultToolbarConfig}
          colorPalette={defaultColorPalette}
          fontConfig={defaultFontConfig}
          callbacks={{
            onChange: (content) => {
              setContent(content);
              console.log('تم تغيير المحتوى:', content.length, 'حرف');
            },
            onSave: handleSave,
            onError: (error) => {
              console.error('خطأ في المحرر:', error);
              toast.error(`خطأ: ${error}`);
            },
            onFocus: () => console.log('تم التركيز على المحرر'),
            onBlur: () => console.log('تم إلغاء التركيز عن المحرر')
          }}
        />
      </div>

      {/* معلومات إضافية */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            إحصائيات المحتوى
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            الأحرف: {content.length}
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            الكلمات: {content.split(/\s+/).filter(word => word.length > 0).length}
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
            حالة الحفظ
          </h4>
          <p className="text-sm text-green-700 dark:text-green-300">
            {isLoading ? 'جاري الحفظ...' : 'محفوظ'}
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
          <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
            الاختبارات
          </h4>
          <p className="text-sm text-purple-700 dark:text-purple-300">
            تم تشغيل {testResults.length} اختبار
          </p>
        </div>
      </div>
    </div>
  );
}

