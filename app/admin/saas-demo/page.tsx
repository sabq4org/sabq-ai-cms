"use client";

import SAASActivityCards from "@/components/saas-dashboard/SAASActivityCards";
import SAASLayout, { SAASMainDashboard } from "@/components/saas-dashboard/SAASLayout";
import { SabqSAASTabs } from "@/components/saas-dashboard/SAASTabs";
import "@/styles/saas-dashboard.css";
import { useState } from "react";

export default function SAASDemoPage() {
  const [activeView, setActiveView] = useState<'dashboard' | 'tabs' | 'activities'>('dashboard');

  const ViewSelector = () => (
    <div className="mb-8">
      <div className="flex space-x-1 bg-white p-1 rounded-lg border border-gray-200 w-fit">
        <button
          onClick={() => setActiveView('dashboard')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            activeView === 'dashboard' 
              ? 'bg-yellow-400 text-gray-900' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🏠 لوحة التحكم الرئيسية
        </button>
        <button
          onClick={() => setActiveView('tabs')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            activeView === 'tabs' 
              ? 'bg-yellow-400 text-gray-900' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📑 التبويبات المتقدمة
        </button>
        <button
          onClick={() => setActiveView('activities')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            activeView === 'activities' 
              ? 'bg-yellow-400 text-gray-900' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🎯 بطاقات الأنشطة
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <SAASMainDashboard />;
      case 'tabs':
        return (
          <div className="space-y-8">
            <div className="saas-card">
              <h2 className="text-xl font-bold mb-4">نظام التبويبات المتقدم</h2>
              <p className="text-gray-600 mb-6">
                مثال على التبويبات التفاعلية مع المحتوى الديناميكي والإحصائيات المتقدمة
              </p>
              <SabqSAASTabs />
            </div>
          </div>
        );
      case 'activities':
        return <SAASActivityCards showFilters={true} />;
      default:
        return <SAASMainDashboard />;
    }
  };

  return (
    <SAASLayout
      pageTitle="معاينة تصميم SaaS"
      pageSubtitle="تصميم لوحة تحكم احترافي مستوحى من أفضل منصات SaaS"
      showEditButton={false}
    >
      {/* Demo Header */}
      <div className="saas-card mb-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🎨 تصميم SaaS احترافي لسبق الذكية
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            لوحة تحكم حديثة مستوحاة من أفضل منصات الـ SaaS العالمية
          </p>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="font-semibold text-gray-900">تصميم متقدم</h3>
              <p className="text-sm text-gray-600 mt-1">
                ألوان متوازنة وتصميم عصري
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="font-semibold text-gray-900">متجاوب تماماً</h3>
              <p className="text-sm text-gray-600 mt-1">
                يعمل على جميع الأجهزة
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-semibold text-gray-900">أداء عالي</h3>
              <p className="text-sm text-gray-600 mt-1">
                تحميل سريع وتفاعل سلس
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* View Selector */}
      <ViewSelector />

      {/* Dynamic Content */}
      <div className="saas-animate-in">
        {renderContent()}
      </div>

      {/* Design System Info */}
      <div className="mt-12 saas-card">
        <h2 className="text-xl font-bold mb-6">🎯 مكونات النظام التصميمي</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Color Palette */}
          <div>
            <h3 className="font-semibold mb-3">🎨 لوحة الألوان</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F5F6FA' }}></div>
                <span className="text-sm">#F5F6FA - خلفية رئيسية</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#1A1E24' }}></div>
                <span className="text-sm">#1A1E24 - شريط جانبي</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FACC15' }}></div>
                <span className="text-sm">#FACC15 - لون التمييز</span>
              </div>
            </div>
          </div>

          {/* Components */}
          <div>
            <h3 className="font-semibold mb-3">🧱 المكونات</h3>
            <ul className="text-sm space-y-1">
              <li>✅ شريط جانبي ذكي</li>
              <li>✅ هيدر متقدم</li>
              <li>✅ تبويبات تفاعلية</li>
              <li>✅ بطاقات الأنشطة</li>
              <li>✅ مؤشرات الحالة</li>
            </ul>
          </div>

          {/* Technical Stack */}
          <div>
            <h3 className="font-semibold mb-3">⚡ التقنيات</h3>
            <ul className="text-sm space-y-1">
              <li>🎨 Tailwind CSS 3.x</li>
              <li>🔍 Lucide React Icons</li>
              <li>⚛️ React 18 + TypeScript</li>
              <li>🎭 Framer Motion</li>
              <li>📱 Responsive Design</li>
            </ul>
          </div>
        </div>
      </div>
    </SAASLayout>
  );
}