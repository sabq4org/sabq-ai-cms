'use client';

import React, { useState } from 'react';
import { FileText, Users, Eye, MessageSquare, TrendingUp, Clock, Award, Activity } from 'lucide-react';
import { SabqCard } from '@/components/ui/SabqCard';
import Link from 'next/link';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('behavior');

  // مكون بطاقة الإحصائيات البسيطة
  const StatsCard = ({ title, value, subtitle, iconComponent }: {
    title: string;
    value: string;
    subtitle: string;
    iconComponent: React.ReactNode;
  }) => (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-gray-600 text-sm font-medium mb-2">{title}</h3>
            <div className="text-3xl font-bold text-gray-800 mb-1">{value}</div>
            <p className="text-gray-500 text-xs">{subtitle}</p>
          </div>
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            {iconComponent}
          </div>
        </div>
      </div>
    </div>
  );

  // مكون الجدول التفاعلي
  const UserBehaviorTable = () => {
    const data = [
      {
        id: 'ID: 1',
        category: 'التكنولوجيا',
        accuracy: '90.2%',
        activity: '1442/3/17',
        engagement: 89,
        total: 65,
        status: 'محمد',
        user: 'مستخدم مسجل'
      },
      {
        id: 'ID: 2',
        category: 'التكنولوجيا',
        accuracy: '98.4%',
        activity: '1442/3/17',
        engagement: 76,
        total: 28,
        status: 'فاطمة',
        user: 'مستخدم مسجل'
      }
    ];

    const tabs = [
      { id: 'behavior', name: 'سلوك المستخدمين', active: true },
      { id: 'analysis', name: 'تحليل التفاعلات', active: false },
      { id: 'predictions', name: 'تطوير التفضيلات', active: false },
      { id: 'insights', name: 'رؤى الأفكار', active: false }
    ];

    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* تبويبات الجدول */}
        <div className="px-6 pt-6">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 rounded-md font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* عنوان الجدول */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">سلوك المستخدمين الأكثر نشاطاً</h2>
        </div>

        {/* رأس الجدول */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="grid grid-cols-7 gap-4 px-6 py-4 text-sm font-semibold text-gray-700">
            <div>الفئات المفضلة</div>
            <div>دقة التفضيلات</div>
            <div>آخر نشاط</div>
            <div>نقاط التفاعل</div>
            <div>إجمالي التفاعلات</div>
            <div>المستخدم</div>
            <div>تصنيف العميق</div>
          </div>
        </div>

        {/* بيانات الجدول */}
        <div className="divide-y divide-gray-100">
          {data.map((row, index) => (
            <div
              key={index}
              className="grid grid-cols-7 gap-4 px-6 py-4 text-sm hover:bg-blue-50 transition-colors duration-200"
            >
              <div className="font-medium text-gray-900">{row.category}</div>
              <div className="text-green-600 font-semibold">{row.accuracy}</div>
              <div className="text-gray-500">{row.activity}</div>
              <div className="flex items-center">
                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${row.engagement}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-600">{row.engagement}</span>
              </div>
              <div className="text-blue-600 font-medium">{row.total}</div>
              <div className="font-medium text-gray-900">{row.status}</div>
              <div className="text-gray-600">{row.user}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 50%, #E2E8F0 100%)',
      fontFamily: 'system-ui, -apple-system, "Segoe UI", "Noto Sans Arabic", Arial, sans-serif'
    }}>
      <div className="p-8">
        {/* الرأس المحدث */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                لوحة تحكم النظام الذكي
              </h1>
              <p className="text-gray-600">
                إدارة ومراقبة سلوك المستخدمين والتفضيلات الذكية
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2">
                🔄 تحديث البيانات
              </button>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl shadow-md">
                <span className="text-sm text-gray-600">أسبوع</span>
                <button className="bg-gray-100 px-3 py-1 rounded-lg text-sm font-medium">
                  الفترة الزمنية
                </button>
              </div>
            </div>
          </div>

          {/* شارة الإنجازات */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl shadow-md">
              <span className="text-yellow-500">⭐</span>
              <span className="text-sm font-medium text-gray-700">لوحة تحكم خبرة</span>
              <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-lg text-xs font-bold">نسخة 2.0</span>
            </div>
          </div>
        </div>

              {/* بطاقات الإحصائيات البسيطة */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <StatsCard
            title="دقة التفضيلات"
            value="85.5%"
            subtitle="دقة النظام"
            iconComponent={<TrendingUp className="w-6 h-6 text-blue-600" />}
          />
          <StatsCard
            title="تحديثات التفضيلات"
            value="+"
            subtitle="تحديث لهذان"
            iconComponent={<Activity className="w-6 h-6 text-purple-600" />}
          />
          <StatsCard
            title="متوسط نقاط التفاعل"
            value="65.0"
            subtitle="من 10"
            iconComponent={<Award className="w-6 h-6 text-red-600" />}
          />
          <StatsCard
            title="إجمالي التفاعلات"
            value="٤٢٤"
            subtitle="جميع الأنواع"
            iconComponent={<MessageSquare className="w-6 h-6 text-orange-600" />}
          />
          <StatsCard
            title="المستخدمون النشطون"
            value="٨"
            subtitle="آخر 7 أيام"
            iconComponent={<Users className="w-6 h-6 text-green-600" />}
          />
          <StatsCard
            title="إجمالي المستخدمين"
            value="10"
            subtitle="مستخدم مسجل"
            iconComponent={<Eye className="w-6 h-6 text-cyan-600" />}
          />
        </div>

        {/* الجدول التفاعلي الجديد */}
        <UserBehaviorTable />
      </div>
    </div>
  );
} 