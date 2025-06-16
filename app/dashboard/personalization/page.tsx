'use client';

import React, { useState, useEffect } from 'react';
import { Cpu, Users, Target, Settings, Brain, BarChart3, Filter, Zap } from 'lucide-react';

export default function PersonalizationPage() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  return (
    <div className={`p-8 transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : ''
    }`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>التخصيص الذكي 🎯</h1>
        <p className={`transition-colors duration-300 ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>إدارة أنظمة التخصيص وخوارزميات الذكاء الاصطناعي</p>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className={`text-sm transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>المستخدمون النشطون</p>
              <p className={`text-2xl font-bold transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>456,789</p>
            </div>
          </div>
        </div>

        <div className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className={`text-sm transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>دقة التخصيص</p>
              <p className={`text-2xl font-bold transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>87.3%</p>
            </div>
          </div>
        </div>

        <div className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className={`text-sm transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>نماذج AI نشطة</p>
              <p className={`text-2xl font-bold transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>6</p>
            </div>
          </div>
        </div>

        <div className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className={`text-sm transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>معدل التحسن</p>
              <p className={`text-2xl font-bold transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>+23%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className={`rounded-2xl p-6 border transition-colors duration-300 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-bold mb-4 transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>🎯 قواعد التخصيص النشطة</h3>
          <div className="space-y-4">
            {[
              { name: 'إخفاء الأخبار غير المرغوبة', status: 'نشط', users: '456K' },
              { name: 'ترتيب حسب الاهتمام', status: 'نشط', users: '523K' },
              { name: 'توقيت التنبيهات الذكي', status: 'تجريبي', users: '123K' },
              { name: 'التوصيات المتقاطعة', status: 'نشط', users: '234K' }
            ].map((rule, index) => (
              <div key={index} className={`p-4 rounded-lg border transition-colors duration-300 ${
                darkMode ? 'border-gray-600' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-medium transition-colors duration-300 ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}>{rule.name}</p>
                    <p className={`text-sm transition-colors duration-300 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>{rule.users} مستخدم</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    rule.status === 'نشط' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {rule.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-2xl p-6 border transition-colors duration-300 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-bold mb-4 transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>🧠 نماذج الذكاء الاصطناعي</h3>
          <div className="space-y-4">
            {[
              { name: 'نموذج تحليل الاهتمامات', accuracy: '94.2%', status: 'نشط' },
              { name: 'خوارزمية الترتيب الذكي', accuracy: '91.8%', status: 'نشط' },
              { name: 'تحليل المشاعر', accuracy: '87.5%', status: 'قيد التحديث' }
            ].map((model, index) => (
              <div key={index} className={`p-4 rounded-lg border transition-colors duration-300 ${
                darkMode ? 'border-gray-600' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <p className={`font-medium transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>{model.name}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    model.status === 'نشط' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {model.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>دقة النموذج</span>
                  <span className={`font-bold transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>{model.accuracy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 