'use client';

import React from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

export default function WasApiStatus({ darkMode }: { darkMode: boolean }) {
  return (
    <div className={`rounded-2xl border p-8 ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              حالة خدمة واس API
            </h2>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              آخر تحديث: {new Date().toLocaleString('ar-SA', {
                calendar: 'gregory',
                numberingSystem: 'latn'
              })}
            </p>
          </div>
        </div>

        {/* Current Status */}
        <div className="mb-8 p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">
                تحديث مهم: API واس يواجه مشاكل تقنية
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-400 mb-3">
                خدمة API الخاصة بوكالة الأنباء السعودية تواجه حالياً مشاكل تقنية من جهة السيرفر. 
                جميع الطلبات تعود برسالة خطأ "Invalid request format" حتى مع استخدام البيانات الصحيحة.
              </p>
              <div className="text-xs text-yellow-700 dark:text-yellow-500 space-y-1">
                <p>• رمز الخطأ: 400 Bad Request</p>
                <p>• الرسالة: Invalid request format. Please ensure all values are correctly formatted as JSON</p>
                <p>• التأثير: جميع endpoints غير متاحة حالياً</p>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mb-8">
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            التفاصيل التقنية
          </h3>
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border ${
              darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  GetStatus
                </span>
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-500">400 Error</span>
                </div>
              </div>
              <code className="text-xs text-gray-500 dark:text-gray-400">
                GET /ClientAppV1/GetStatus
              </code>
            </div>

            <div className={`p-4 rounded-lg border ${
              darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  GetNextNews
                </span>
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-500">400 Error</span>
                </div>
              </div>
              <code className="text-xs text-gray-500 dark:text-gray-400">
                GET /ClientAppV1/GetNextNews
              </code>
            </div>

            <div className={`p-4 rounded-lg border ${
              darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  مفتاح API
                </span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">صحيح ومُحدث</span>
                </div>
              </div>
              <code className="text-xs text-gray-500 dark:text-gray-400">
                X-API-Key: ••••••••••••••••••••••••••••••••
              </code>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="mb-8">
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            السجل الزمني
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  يوليو 2025 - نجاح الاتصال الأول
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  تم تحقيق أول اتصال ناجح مع API واس (200 OK)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  يوليو 2025 - تغيير في API
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  بدأت جميع الطلبات تعود بخطأ 400 "Invalid request format"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className={`p-6 rounded-xl border ${
          darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
        }`}>
          <h3 className={`font-semibold mb-3 ${
            darkMode ? 'text-blue-300' : 'text-blue-900'
          }`}>
            التوصيات
          </h3>
          <ul className={`space-y-2 text-sm ${
            darkMode ? 'text-blue-400' : 'text-blue-800'
          }`}>
            <li>• التواصل مع الدعم الفني لوكالة الأنباء السعودية</li>
            <li>• طلب الوثائق المحدثة لـ API</li>
            <li>• التحقق من وجود تحديثات في طريقة الاستخدام</li>
            <li>• الانتظار حتى يتم حل المشكلة من جهة واس</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 