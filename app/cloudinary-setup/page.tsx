'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  CheckCircle, XCircle, AlertTriangle, Loader2, 
  ExternalLink, Copy, RefreshCw, Settings, Cloud
} from 'lucide-react';

interface TestResult {
  success: boolean;
  message?: string;
  error?: string;
  details?: any;
  testResult?: {
    url: string;
    publicId: string;
    cloudName: string;
  };
  missingVariables?: string[];
  troubleshooting?: any;
}

export default function CloudinarySetupPage() {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSetupInstructions, setShowSetupInstructions] = useState(false);

  // تشغيل الاختبار عند تحميل الصفحة
  useEffect(() => {
    runTest();
  }, []);

  const runTest = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/test-cloudinary-setup');
      const data = await response.json();
      setTestResult(data);
      
      if (data.success) {
        toast.success('✅ Cloudinary يعمل بشكل صحيح!');
      } else {
        toast.error('❌ يوجد مشكلة في إعداد Cloudinary');
      }
    } catch (error) {
      console.error('خطأ في الاختبار:', error);
      setTestResult({
        success: false,
        error: 'فشل في الاتصال بالخادم',
        message: 'تأكد من أن الخادم يعمل'
      });
      toast.error('❌ فشل في الاختبار');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('تم النسخ!');
  };

  const StatusIcon = ({ success }: { success: boolean }) => {
    if (isLoading) return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
    return success ? 
      <CheckCircle className="w-5 h-5 text-green-500" /> : 
      <XCircle className="w-5 h-5 text-red-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* رأس الصفحة */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Cloud className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            إعداد Cloudinary
          </h1>
          <p className="text-gray-600">
            تشخيص وإعداد خدمة رفع الصور السحابية
          </p>
        </div>

        {/* حالة الاختبار */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              حالة الإعداد
            </h2>
            <button
              onClick={runTest}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              إعادة الاختبار
            </button>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50">
            <StatusIcon success={testResult?.success || false} />
            <div className="flex-1">
              <div className="font-medium text-gray-800">
                {isLoading ? 'جاري الاختبار...' : 
                 testResult?.success ? 'Cloudinary يعمل بشكل صحيح' : 
                 'يوجد مشكلة في إعداد Cloudinary'}
              </div>
              {testResult?.message && (
                <div className="text-sm text-gray-600 mt-1">
                  {testResult.message}
                </div>
              )}
            </div>
          </div>

          {/* عرض نتيجة الاختبار الناجح */}
          {testResult?.success && testResult.testResult && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-800 mb-2">✅ تم رفع صورة تجريبية بنجاح</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Cloud Name:</strong> {testResult.testResult.cloudName}</div>
                <div><strong>Public ID:</strong> {testResult.testResult.publicId}</div>
                <div className="flex items-center gap-2">
                  <strong>URL:</strong>
                  <a 
                    href={testResult.testResult.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    عرض الصورة <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* عرض المتغيرات المفقودة */}
          {testResult && !testResult.success && testResult.missingVariables && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-medium text-red-800 mb-2">❌ متغيرات البيئة مفقودة</h3>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {testResult.missingVariables.map((variable) => (
                  <li key={variable}>{variable}</li>
                ))}
              </ul>
              <button
                onClick={() => setShowSetupInstructions(true)}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
              >
                عرض تعليمات الإعداد
              </button>
            </div>
          )}

          {/* عرض مشاكل أخرى */}
          {testResult && !testResult.success && !testResult.missingVariables && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-medium text-yellow-800 mb-2">⚠️ مشكلة في Cloudinary</h3>
              <div className="text-sm text-yellow-700 mb-3">
                {testResult.error || testResult.message}
              </div>
              
              {testResult.troubleshooting && (
                <div className="space-y-3">
                  {testResult.troubleshooting.possibleCauses && (
                    <div>
                      <strong className="text-yellow-800">الأسباب المحتملة:</strong>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        {testResult.troubleshooting.possibleCauses.map((cause: string, index: number) => (
                          <li key={index} className="text-sm">{cause}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {testResult.troubleshooting.nextSteps && (
                    <div>
                      <strong className="text-yellow-800">الخطوات التالية:</strong>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        {testResult.troubleshooting.nextSteps.map((step: string, index: number) => (
                          <li key={index} className="text-sm">{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              <button
                onClick={() => setShowSetupInstructions(true)}
                className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors"
              >
                عرض تعليمات الإعداد
              </button>
            </div>
          )}
        </div>

        {/* تعليمات الإعداد */}
        {showSetupInstructions && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">🛠️ خطوات إعداد Cloudinary</h2>
              <button
                onClick={() => setShowSetupInstructions(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* الخطوة 1 */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-medium text-gray-800 mb-2">1. إنشاء حساب Cloudinary</h3>
                <p className="text-gray-600 mb-3">أنشئ حساب مجاني في Cloudinary</p>
                <a
                  href="https://cloudinary.com/users/register/free"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  إنشاء حساب <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* الخطوة 2 */}
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-medium text-gray-800 mb-2">2. الحصول على بيانات الاعتماد</h3>
                <p className="text-gray-600 mb-2">من Dashboard، انسخ المعلومات التالية:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li><strong>Cloud Name</strong></li>
                  <li><strong>API Key</strong></li>
                  <li><strong>API Secret</strong></li>
                </ul>
              </div>

              {/* الخطوة 3 */}
              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="font-medium text-gray-800 mb-2">3. إنشاء Upload Preset</h3>
                <p className="text-gray-600 mb-2">اذهب إلى Settings › Upload › Add upload preset</p>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <div><strong>Preset Name:</strong> sabq_preset</div>
                  <div><strong>Signing Mode:</strong> Unsigned</div>
                  <div><strong>Folder:</strong> sabq-cms</div>
                  <div><strong>Allowed formats:</strong> jpg, png, gif, webp</div>
                </div>
              </div>

              {/* الخطوة 4 */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-medium text-gray-800 mb-2">4. تحديث متغيرات البيئة</h3>
                <p className="text-gray-600 mb-3">أضف هذه المتغيرات في ملف <code>.env.local</code>:</p>
                
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400"># إعدادات Cloudinary</span>
                    <button
                      onClick={() => copyToClipboard(`# إعدادات Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=sabq_preset`)}
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-xs"
                    >
                      <Copy className="w-3 h-3" /> نسخ
                    </button>
                  </div>
                  <div>CLOUDINARY_CLOUD_NAME=your-cloud-name</div>
                  <div>CLOUDINARY_API_KEY=your-api-key</div>
                  <div>CLOUDINARY_API_SECRET=your-api-secret</div>
                  <div>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name</div>
                  <div>NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=sabq_preset</div>
                </div>

                <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <strong>مهم:</strong> استبدل القيم الوهمية بالقيم الحقيقية من Cloudinary Dashboard، 
                      ثم أعد تشغيل الخادم لتطبيق التغييرات.
                    </div>
                  </div>
                </div>
              </div>

              {/* زر إعادة الاختبار */}
              <div className="pt-4 border-t">
                <button
                  onClick={() => {
                    setShowSetupInstructions(false);
                    setTimeout(runTest, 1000);
                  }}
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  تم الإعداد - إعادة الاختبار
                </button>
              </div>
            </div>
          </div>
        )}

        {/* روابط مفيدة */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-4 text-sm text-gray-600">
            <a
              href="https://cloudinary.com/documentation"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 flex items-center gap-1"
            >
              التوثيق <ExternalLink className="w-3 h-3" />
            </a>
            <span>•</span>
            <a
              href="https://cloudinary.com/pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 flex items-center gap-1"
            >
              الأسعار <ExternalLink className="w-3 h-3" />
            </a>
            <span>•</span>
            <a
              href="/dashboard/news"
              className="hover:text-blue-600"
            >
              العودة للوحة التحكم
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 