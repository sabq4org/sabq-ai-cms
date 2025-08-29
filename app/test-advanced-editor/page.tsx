'use client';

import React from 'react';
import { EditorTest } from '@/components/AdvancedEditor/test/EditorTest';

/**
 * صفحة اختبار المحرر المتقدم الجديد
 * Advanced Editor Test Page
 * 
 * الرابط: /test-advanced-editor
 */
export default function TestAdvancedEditorPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                المحرر المتقدم الجديد
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                اختبار شامل لجميع ميزات المحرر المطور حديثاً
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                جديد
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                v2.0
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            🚀 ميزات المحرر المتقدم الجديد
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">شريط أدوات متقدم</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">أدوات تحرير شاملة ومتطورة</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">أدوات الألوان والخطوط</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">تحكم كامل في التنسيق</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">الرموز التعبيرية</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">منتقي رموز تعبيرية متقدم</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">الاقتباسات المخصصة</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">اقتباسات بتصاميم متنوعة</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">الجداول المتقدمة</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">جداول قابلة للتخصيص بالكامل</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
              <div className="w-2 h-2 bg-teal-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">وسائل التواصل</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">تضمين YouTube وSocial Media</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">محرر الأكواد</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">تمييز الصيغة والألوان</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
              <div className="w-2 h-2 bg-pink-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">أداء محسن</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">سرعة وكفاءة عالية</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">قابل للتخصيص</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">إمكانية توسيع وتخصيص</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Test Component */}
      <EditorTest />

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            🎯 كيفية استخدام المحرر في مشروعك
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>
              <strong>1. استيراد المحرر:</strong> <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">import {`{ AdvancedEditor }`} from '@/components/AdvancedEditor';</code>
            </p>
            <p>
              <strong>2. استخدام المحرر:</strong> <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{`<AdvancedEditor initialContent={content} config={config} />`}</code>
            </p>
            <p>
              <strong>3. التخصيص:</strong> يمكن تخصيص جميع الإعدادات والألوان والأدوات حسب احتياجاتك
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

