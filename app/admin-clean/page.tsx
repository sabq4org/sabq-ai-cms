'use client';

// تعطيل static rendering لهذه الصفحة
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import Link from 'next/link';

// نسخة نظيفة تماماً من لوحة التحكم بتصميم مبسط
export default function AdminClean() {
  const [currentTheme, setCurrentTheme] = useState('blue');

  // ثيمات الألوان
  const themes = {
    blue: { color: '#3B82F6', name: 'الأزرق' },
    green: { color: '#10B981', name: 'الأخضر' },
    purple: { color: '#8B5CF6', name: 'البنفسجي' },
    orange: { color: '#F59E0B', name: 'البرتقالي' },
    red: { color: '#EF4444', name: 'الأحمر' },
  };

  const currentThemeColor = themes[currentTheme as keyof typeof themes]?.color || '#3B82F6';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* الشريط الجانبي */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg p-6">
        {/* شعار بسيط */}
        <div className="mb-8">
          <div 
            style={{ backgroundColor: currentThemeColor }}
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-2xl font-bold mb-3"
          >
            س
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">الإدارة</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">نظام إدارة المحتوى</p>
        </div>

        {/* التنقل */}
        <nav className="space-y-2">
          <Link 
            href="/admin-clean" 
            style={{ backgroundColor: currentThemeColor }}
            className="w-full flex items-center justify-center px-4 py-3 text-white rounded-lg font-medium"
          >
            📊 الرئيسية
          </Link>
          <Link href="/admin/articles" className="w-full flex items-center justify-center px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
            📝 المقالات
          </Link>
          <Link href="/admin/analytics" className="w-full flex items-center justify-center px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
            📈 التحليلات
          </Link>
          <Link href="/admin/users" className="w-full flex items-center justify-center px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
            👥 المستخدمون
          </Link>
          <Link href="/admin/settings" className="w-full flex items-center justify-center px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
            ⚙️ الإعدادات
          </Link>
        </nav>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          {/* تغيير الثيم */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">🎨 اللون</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(themes).map(([key, theme]) => (
                <button
                  key={key}
                  className={`px-3 py-1 rounded-md text-xs font-medium ${
                    currentTheme === key 
                      ? 'text-white' 
                      : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  style={{ 
                    backgroundColor: currentTheme === key ? theme.color : undefined 
                  }}
                  onClick={() => setCurrentTheme(key)}
                >
                  {theme.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* المحتوى */}
      <main className="flex-1 p-8">
        {/* هيدر */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">الإدارة</h1>
            <p className="text-gray-600 dark:text-gray-400">نظام إدارة المحتوى</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
              🔔
            </button>
            <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
              👤
            </button>
          </div>
        </header>

        {/* الإحصائيات */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { icon: '📝', value: '2,847', label: 'المقالات' },
            { icon: '👥', value: '45.2K', label: 'المستخدمون' },
            { icon: '📊', value: '128K', label: 'المشاهدات' },
            { icon: '📈', value: '89%', label: 'التفاعل' }
          ].map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div style={{ color: currentThemeColor }} className="text-2xl font-bold mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* بطاقة النجاح */}
        <section>
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center border-2"
            style={{ 
              borderColor: currentThemeColor + '40',
              backgroundColor: `${currentThemeColor}08`
            }}
          >
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              تم إصلاح مشاكل البناء!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              صفحة نظيفة بدون مكتبات خارجية، متوافقة مع Vercel
            </p>
            
            <div className="flex gap-3 justify-center flex-wrap">
              <Link 
                href="/admin" 
                className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                النسخة الكاملة
              </Link>
              <Link 
                href="/dashboard-simple" 
                className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                لوحة التحكم
              </Link>
              <button 
                style={{ backgroundColor: currentThemeColor }}
                className="px-6 py-3 text-white rounded-lg"
              >
                النسخة النظيفة
              </button>
              <Link 
                href="/" 
                className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                الموقع الرئيسي
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
