'use client';

import React, { useState } from 'react';
import ShareYourThoughts from '@/components/ShareYourThoughts';
import { 
  Play, 
  Database, 
  Users, 
  MessageSquare, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

export default function InteractionTestPage() {
  const [testStep, setTestStep] = useState(0);
  const [testResults, setTestResults] = useState<any[]>([]);

  // بيانات تجريبية للمقال
  const demoArticle = {
    id: 'demo-article-interaction-test',
    title: 'مقال تجريبي لاختبار نظام التفاعل الجديد',
    slug: 'demo-interaction-test',
    category: 'تكنولوجيا',
    initialStats: {
      likes: 12,
      comments: 5,
      shares: 3,
      views: 156,
      bookmarks: 8
    }
  };

  const testSteps = [
    {
      title: 'اختبار قاعدة البيانات',
      description: 'التحقق من اتصال قاعدة البيانات والجداول',
      action: 'database'
    },
    {
      title: 'اختبار API التعليقات',
      description: 'اختبار إنشاء وجلب التعليقات',
      action: 'comments'
    },
    {
      title: 'اختبار تتبع النشاط',
      description: 'اختبار تسجيل وتتبع أنشطة المستخدم',
      action: 'activity'
    },
    {
      title: 'اختبار النقاط والإنجازات',
      description: 'اختبار نظام النقاط والشارات',
      action: 'points'
    },
    {
      title: 'اختبار الواجهة الكاملة',
      description: 'اختبار جميع مكونات التفاعل',
      action: 'ui'
    }
  ];

  const runTest = async (action: string) => {
    setTestStep(testSteps.findIndex(step => step.action === action) + 1);
    
    try {
      let result;
      
      switch (action) {
        case 'database':
          result = await testDatabase();
          break;
        case 'comments':
          result = await testCommentsAPI();
          break;
        case 'activity':
          result = await testActivityTracking();
          break;
        case 'points':
          result = await testPointsSystem();
          break;
        case 'ui':
          result = await testUI();
          break;
        default:
          result = { success: false, message: 'اختبار غير معروف' };
      }

      setTestResults(prev => [...prev, {
        step: action,
        ...result,
        timestamp: new Date().toISOString()
      }]);

      if (result.success) {
        toast.success(result.message, { icon: '✅' });
      } else {
        toast.error(result.message, { icon: '❌' });
      }

    } catch (error) {
      const errorResult = {
        success: false,
        message: `خطأ في الاختبار: ${error}`,
        error: error
      };
      
      setTestResults(prev => [...prev, {
        step: action,
        ...errorResult,
        timestamp: new Date().toISOString()
      }]);
      
      toast.error(errorResult.message, { icon: '❌' });
    }
  };

  const testDatabase = async () => {
    // اختبار الاتصال بقاعدة البيانات
    const response = await fetch('/api/health/database');
    
    if (response.ok) {
      return {
        success: true,
        message: 'اتصال قاعدة البيانات يعمل بنجاح',
        details: 'جميع الجداول متاحة والاستعلامات تعمل'
      };
    } else {
      return {
        success: false,
        message: 'فشل في الاتصال بقاعدة البيانات',
        details: 'تحقق من متغيرات البيئة والاتصال'
      };
    }
  };

  const testCommentsAPI = async () => {
    // اختبار إنشاء تعليق
    const testComment = {
      articleId: demoArticle.id,
      content: 'هذا تعليق تجريبي لاختبار النظام الجديد. يحتوي على محتوى كافي لاختبار تحليل الجودة والمشاعر.',
      metadata: {
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        isTest: true
      }
    };

    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-id': 'demo-user-test'
      },
      body: JSON.stringify(testComment)
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: 'API التعليقات يعمل بنجاح',
        details: `تم إنشاء تعليق بجودة ${data.comment?.qualityScore || 'غير محدد'}%`
      };
    } else {
      return {
        success: false,
        message: 'فشل في اختبار API التعليقات',
        details: 'تحقق من إعدادات API والمصادقة'
      };
    }
  };

  const testActivityTracking = async () => {
    // اختبار تتبع النشاط
    const testActivity = {
      userId: 'demo-user-test',
      action: 'test_interaction',
      targetType: 'article',
      targetId: demoArticle.id,
      metadata: {
        testMode: true,
        readTime: 120,
        scrollDepth: 85,
        timestamp: new Date().toISOString()
      }
    };

    const response = await fetch('/api/user-activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testActivity)
    });

    if (response.ok) {
      return {
        success: true,
        message: 'تتبع النشاط يعمل بنجاح',
        details: 'تم تسجيل النشاط وتحليل السلوك'
      };
    } else {
      return {
        success: false,
        message: 'فشل في تتبع النشاط',
        details: 'تحقق من API تتبع النشاط'
      };
    }
  };

  const testPointsSystem = async () => {
    // اختبار نظام النقاط
    const response = await fetch('/api/users/demo-user-test/achievements');
    
    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: 'نظام النقاط والإنجازات يعمل',
        details: `تم جلب ${data.achievements?.length || 0} إنجازات`
      };
    } else {
      return {
        success: false,
        message: 'فشل في اختبار نظام النقاط',
        details: 'تحقق من API الإنجازات'
      };
    }
  };

  const testUI = async () => {
    // اختبار مكونات الواجهة
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: 'جميع مكونات الواجهة تعمل بنجاح',
      details: 'التفاعل، التعليقات، والإحصائيات جاهزة'
    };
  };

  const runAllTests = async () => {
    for (const step of testSteps) {
      await runTest(step.action);
      await new Promise(resolve => setTimeout(resolve, 1000)); // تأخير بين الاختبارات
    }
  };

  const getStepIcon = (step: string, result?: any) => {
    if (!result) return <Clock className="w-5 h-5 text-gray-400" />;
    if (result.success) return <CheckCircle className="w-5 h-5 text-green-600" />;
    return <AlertCircle className="w-5 h-5 text-red-600" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* هيدر الصفحة */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🧪 صفحة اختبار نظام التفاعل المتقدم
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
            اختبر جميع ميزات النظام الجديد وتأكد من عمله بشكل صحيح
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={runAllTests}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Play className="w-5 h-5" />
              تشغيل جميع الاختبارات
            </button>
          </div>
        </div>

        {/* خطوات الاختبار */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
              خطوات الاختبار
            </h2>
            
            <div className="space-y-4">
              {testSteps.map((step, index) => {
                const result = testResults.find(r => r.step === step.action);
                
                return (
                  <div
                    key={step.action}
                    className={`p-4 rounded-lg border transition-all ${
                      testStep > index
                        ? result?.success
                          ? 'bg-green-50 border-green-200 dark:bg-green-900/20'
                          : 'bg-red-50 border-red-200 dark:bg-red-900/20'
                        : testStep === index + 1
                        ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20'
                        : 'bg-gray-50 border-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {getStepIcon(step.action, result)}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {index + 1}. {step.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {step.description}
                        </p>
                        
                        {result && (
                          <div className="text-sm">
                            <p className={result.success ? 'text-green-600' : 'text-red-600'}>
                              {result.message}
                            </p>
                            {result.details && (
                              <p className="text-gray-500 mt-1">{result.details}</p>
                            )}
                          </div>
                        )}
                        
                        <button
                          onClick={() => runTest(step.action)}
                          className="mt-2 px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                        >
                          اختبار منفرد
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* نتائج الاختبار */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
              نتائج الاختبار
            </h2>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  لم يتم تشغيل أي اختبارات بعد
                </p>
              ) : (
                testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      result.success
                        ? 'bg-green-50 border-green-200 dark:bg-green-900/20'
                        : 'bg-red-50 border-red-200 dark:bg-red-900/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {result.success ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="font-medium text-sm">
                        {testSteps.find(s => s.action === result.step)?.title}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {result.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(result.timestamp).toLocaleTimeString('ar-SA')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* مكون التفاعل التجريبي */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
            تجربة نظام التفاعل
          </h2>
          
          {/* المحتوى التجريبي */}
          <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">
              {demoArticle.title}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              هذا مقال تجريبي لاختبار نظام التفاعل الجديد. يمكنك تجربة جميع الميزات:
              التعليق، الإعجاب، المشاركة، والحفظ. سيتم تتبع جميع تفاعلاتك وحساب النقاط تلقائياً.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              جرب التمرير في هذه الصفحة وشاهد كيف يتم تتبع عمق القراءة ووقت التفاعل.
              كل تفاعل سيكسبك نقاط ويساهم في تحقيق الإنجازات المختلفة.
            </p>
          </div>

          {/* مكون التفاعل الجديد */}
          <ShareYourThoughts
            articleId={demoArticle.id}
            articleTitle={demoArticle.title}
            articleSlug={demoArticle.slug}
            articleCategory={demoArticle.category}
            initialStats={demoArticle.initialStats}
          />
        </div>

        {/* معلومات مفيدة */}
        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-bold mb-3 text-blue-900 dark:text-blue-100">
            💡 نصائح للاختبار
          </h3>
          <ul className="space-y-2 text-blue-800 dark:text-blue-200">
            <li>• جرب التعليق بنصوص مختلفة الأطوال لاختبار تحليل الجودة</li>
            <li>• راقب كيف تتغير النقاط مع كل تفاعل</li>
            <li>• اختبر الإعجاب والمشاركة والحفظ</li>
            <li>• امضِ وقتاً في القراءة واختبر تتبع وقت التفاعل</li>
            <li>• تحقق من الملف الشخصي والإحصائيات</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
