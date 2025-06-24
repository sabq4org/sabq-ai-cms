'use client';

import { useState } from 'react';
import { Upload, CheckCircle, XCircle, Loader } from 'lucide-react';

export default function TestUploadPage() {
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('يرجى اختيار ملف أولاً');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', 'featured');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUploadResult(data);
      } else {
        setError(data.error || 'فشل رفع الملف');
      }
    } catch (err) {
      setError('خطأ في الاتصال: ' + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          اختبار رفع الصور
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="space-y-6">
            {/* معلومات البيئة */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">معلومات البيئة</h3>
              <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                <p>الموقع: {typeof window !== 'undefined' ? window.location.origin : 'غير متاح'}</p>
                <p>API Endpoint: /api/upload</p>
                <p>الأنواع المدعومة: JPG, PNG, GIF, WebP, AVIF, SVG</p>
                <p>الحجم الأقصى: 5MB</p>
              </div>
            </div>

            {/* منطقة الرفع */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
              />
              
              <label
                htmlFor="file-input"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3" />
                <span className="text-gray-600 dark:text-gray-300">
                  اضغط لاختيار صورة
                </span>
              </label>

              {selectedFile && (
                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>الملف المحدد:</strong> {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>الحجم:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>النوع:</strong> {selectedFile.type}
                  </p>
                </div>
              )}
            </div>

            {/* زر الرفع */}
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                !selectedFile || uploading
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="w-5 h-5 animate-spin" />
                  جارٍ الرفع...
                </span>
              ) : (
                'رفع الصورة'
              )}
            </button>

            {/* النتائج */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-900 dark:text-red-100">خطأ في الرفع</h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {uploadResult && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900 dark:text-green-100">تم الرفع بنجاح!</h4>
                    <div className="mt-3 space-y-2">
                      <p className="text-sm text-green-700 dark:text-green-300">
                        <strong>الرابط:</strong> {uploadResult.data?.url}
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        <strong>اسم الملف:</strong> {uploadResult.data?.fileName}
                      </p>
                      
                      {uploadResult.data?.url && (
                        <div className="mt-4">
                          <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">
                            معاينة الصورة:
                          </p>
                          <img
                            src={uploadResult.data.url}
                            alt="الصورة المرفوعة"
                            className="w-full max-w-md rounded-lg shadow-md"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* تفاصيل تقنية */}
            <details className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                تفاصيل تقنية للمطورين
              </summary>
              <div className="mt-3 space-y-2 text-xs font-mono">
                <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto">
{`// كود الرفع
const formData = new FormData();
formData.append('file', file);
formData.append('type', 'featured');

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});`}
                </pre>
                
                {uploadResult && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">استجابة API:</p>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto">
{JSON.stringify(uploadResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
} 