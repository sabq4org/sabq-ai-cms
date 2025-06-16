'use client';

import React, { useState, useEffect } from 'react';
import { Database, Brain, TrendingUp, Target, Clock, Cpu } from 'lucide-react';

export default function AnalyticsPage() {
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
        }`}>تحليلات الذكاء الاصطناعي 🤖</h1>
        <p className={`transition-colors duration-300 ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>رؤى متقدمة حول سلوك المستخدمين وتفضيلاتهم باستخدام الذكاء الاصطناعي</p>
      </div>

      <div className="grid grid-cols-6 gap-6 mb-8">
        <div className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className={`text-sm transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>نقاط البيانات</p>
              <p className={`text-2xl font-bold transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>45.6M</p>
            </div>
          </div>
        </div>

        <div className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className={`text-sm transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>توقعات اليوم</p>
              <p className={`text-2xl font-bold transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>234,567</p>
            </div>
          </div>
        </div>

        <div className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className={`text-sm transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>دقة النماذج</p>
              <p className={`text-2xl font-bold transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>94.2%</p>
            </div>
          </div>
        </div>

        <div className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className={`text-sm transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>أنماط مكتشفة</p>
              <p className={`text-2xl font-bold transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>1,847</p>
            </div>
          </div>
        </div>

        <div className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className={`text-sm transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>وقت المعالجة</p>
              <p className={`text-2xl font-bold transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>2.3s</p>
            </div>
          </div>
        </div>

        <div className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Cpu className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className={`text-sm transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>نماذج نشطة</p>
              <p className={`text-2xl font-bold transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>12</p>
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
          }`}>📊 أهم الاكتشافات</h3>
          <div className="space-y-4">
            {[
              { insight: 'قراء الصباح أكثر تفاعلاً بـ 34%', confidence: 94 },
              { insight: 'المقالات الطويلة تحقق مشاركة أكبر', confidence: 87 },
              { insight: 'مستخدمو الجوال يفضلون الأخبار العاجلة', confidence: 91 },
              { insight: 'القراء الشباب يتابعون الرياضة أكثر', confidence: 89 }
            ].map((item, index) => (
              <div key={index} className={`p-3 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <p className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>{item.insight}</p>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-gray-300 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: `${item.confidence}%` }}
                    />
                  </div>
                  <span className={`text-xs transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>{item.confidence}%</span>
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
          }`}>🎯 أداء النماذج</h3>
          <div className="space-y-4">
            {[
              { name: 'تحليل الاهتمامات', accuracy: 94.2, status: 'ممتاز' },
              { name: 'توقع السلوك', accuracy: 89.7, status: 'جيد جداً' },
              { name: 'تصنيف المحتوى', accuracy: 92.1, status: 'ممتاز' },
              { name: 'تحليل المشاعر', accuracy: 87.4, status: 'جيد' }
            ].map((model, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium transition-colors duration-300 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>{model.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    model.accuracy >= 92 ? 'bg-green-100 text-green-700' :
                    model.accuracy >= 88 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {model.status}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      model.accuracy >= 92 ? 'bg-green-600' :
                      model.accuracy >= 88 ? 'bg-yellow-600' :
                      'bg-red-600'
                    }`}
                    style={{ width: `${model.accuracy}%` }}
                  />
                </div>
                <div className="text-right">
                  <span className={`text-xs transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>{model.accuracy}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
