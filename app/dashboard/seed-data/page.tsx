'use client';

import { useState } from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function SeedDataPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
  }>({});

  const seedData = async () => {
    setIsLoading(true);
    setResult({});

    try {
      const response = await fetch('/api/admin/seed-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          security_key: 'sabq-seed-2024'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message || 'تمت إضافة البيانات بنجاح'
        });
      } else {
        setResult({
          success: false,
          error: data.error || 'فشل في إضافة البيانات'
        });
      }
    } catch (error) {
      setResult({
        success: false,
        error: 'حدث خطأ في الاتصال'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            إضافة البيانات الأساسية
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            اضغط على الزر لإضافة الأدوار والفريق والمراسلين إلى قاعدة البيانات
          </p>

          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                سيتم إضافة:
              </h3>
              <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-400 space-y-1">
                <li>6 أدوار (مدير، محرر، كاتب، مراسل، مشرف، مستخدم)</li>
                <li>3 أعضاء فريق</li>
                <li>3 مراسلين</li>
                <li>2 كتاب رأي</li>
              </ul>
            </div>

            <button
              onClick={seedData}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري إضافة البيانات...
                </>
              ) : (
                'إضافة البيانات الأساسية'
              )}
            </button>

            {result.success && (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-300">
                    {result.message}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                    يمكنك الآن استخدام النظام بكامل إمكانياته
                  </p>
                </div>
              </div>
            )}

            {result.error && (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900 dark:text-red-300">
                    {result.error}
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                    تأكد من اتصال قاعدة البيانات وحاول مرة أخرى
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
          <h3 className="font-semibold text-amber-900 dark:text-amber-300 mb-2">
            ملاحظة مهمة:
          </h3>
          <p className="text-sm text-amber-800 dark:text-amber-400">
            بعد إضافة البيانات، يمكنك تسجيل الدخول باستخدام أي من المراسلين:
          </p>
          <ul className="list-disc list-inside text-sm text-amber-700 dark:text-amber-500 mt-2">
            <li>khaled.correspondent@sabq.org</li>
            <li>sara.correspondent@sabq.org</li>
            <li>abdullah.correspondent@sabq.org</li>
          </ul>
          <p className="text-sm text-amber-800 dark:text-amber-400 mt-2">
            كلمة المرور: password123
          </p>
        </div>
      </div>
    </div>
  );
} 