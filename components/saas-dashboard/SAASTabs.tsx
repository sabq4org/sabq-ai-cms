"use client";

import {
  BarChart3,
  FileText,
  MessageSquare,
  PenTool,
  Settings,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";

interface TabItem {
  id: string;
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number;
  content?: React.ReactNode;
  disabled?: boolean;
}

interface SAASTabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: "default" | "pills" | "underline";
  size?: "sm" | "md" | "lg";
}

export default function SAASTabs({
  tabs,
  defaultTab,
  onChange,
  variant = "default",
  size = "md",
}: SAASTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    if (tabs.find((tab) => tab.id === tabId)?.disabled) return;
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const renderDefaultTabs = () => (
    <div
      className={`
      flex space-x-1 p-1 rounded-lg
      ${darkMode ? "bg-gray-800" : "bg-gray-100"}
    `}
    >
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = activeTab === tab.id;
        const isDisabled = tab.disabled;

        return (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            disabled={isDisabled}
            className={`
              ${
                sizeClasses[size]
              } font-medium rounded-md transition-all duration-200
              flex items-center space-x-2 relative
              ${
                isActive
                  ? `bg-white shadow-sm ${
                      darkMode ? "text-gray-900" : "text-gray-900"
                    }`
                  : `${
                      darkMode
                        ? "text-gray-300 hover:text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`
              }
              ${
                isDisabled
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer hover:bg-white/50"
              }
            `}
          >
            {IconComponent && (
              <IconComponent
                className={`w-4 h-4 ${isActive ? "text-gray-700" : ""}`}
              />
            )}
            <span>{tab.name}</span>
            {tab.badge && (
              <span
                className={`
                inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold
                rounded-full min-w-[1.25rem] h-5
                ${
                  isActive
                    ? "bg-yellow-400 text-gray-900"
                    : "bg-red-500 text-white"
                }
              `}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  const renderPillTabs = () => (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = activeTab === tab.id;
        const isDisabled = tab.disabled;

        return (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            disabled={isDisabled}
            className={`
              ${
                sizeClasses[size]
              } font-medium rounded-full transition-all duration-200
              flex items-center space-x-2 border
              ${
                isActive
                  ? "bg-yellow-400 text-gray-900 border-yellow-400 shadow-md"
                  : `border-gray-300 ${
                      darkMode
                        ? "text-gray-300 hover:border-gray-600"
                        : "text-gray-600 hover:border-gray-400"
                    }`
              }
              ${
                isDisabled
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer hover:shadow-sm"
              }
            `}
          >
            {IconComponent && <IconComponent className="w-4 h-4" />}
            <span>{tab.name}</span>
            {tab.badge && (
              <span
                className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold
                             rounded-full min-w-[1.25rem] h-5 bg-red-500 text-white ml-1"
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  const renderUnderlineTabs = () => (
    <div
      className={`border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}
    >
      <div className="flex space-x-8">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          const isDisabled = tab.disabled;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              disabled={isDisabled}
              className={`
                ${sizeClasses[size]} font-medium transition-all duration-200
                flex items-center space-x-2 border-b-2 relative
                ${
                  isActive
                    ? `border-yellow-400 ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`
                    : `border-transparent ${
                        darkMode
                          ? "text-gray-400 hover:text-gray-200"
                          : "text-gray-500 hover:text-gray-700"
                      }`
                }
                ${
                  isDisabled
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer hover:border-gray-300"
                }
              `}
            >
              {IconComponent && <IconComponent className="w-4 h-4" />}
              <span>{tab.name}</span>
              {tab.badge && (
                <span
                  className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold
                               rounded-full min-w-[1.25rem] h-5 bg-red-500 text-white ml-1"
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderTabContent = () => {
    const activeTabData = tabs.find((tab) => tab.id === activeTab);
    return activeTabData?.content || null;
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        {variant === "default" && renderDefaultTabs()}
        {variant === "pills" && renderPillTabs()}
        {variant === "underline" && renderUnderlineTabs()}
      </div>

      {renderTabContent() && (
        <div className="saas-animate-in">{renderTabContent()}</div>
      )}
    </div>
  );
}

// مكون تبويبات مخصص لسبق الذكية
export function SabqSAASTabs() {
  const tabs: TabItem[] = [
    {
      id: "general",
      name: "عام",
      icon: Settings,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="saas-card">
            <h3 className="text-lg font-semibold mb-4">إحصائيات عامة</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">إجمالي المقالات</span>
                <span className="font-semibold">1,247</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">المقالات المنشورة</span>
                <span className="font-semibold">1,198</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">المسودات</span>
                <span className="font-semibold">49</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "analytics",
      name: "التحليلات",
      icon: BarChart3,
      badge: 3,
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="saas-card">
            <h3 className="text-lg font-semibold mb-4">مؤشرات الأداء</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    المشاهدات اليومية
                  </span>
                  <span className="text-sm font-semibold">45,231</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: "75%" }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">التفاعل</span>
                  <span className="text-sm font-semibold">12,847</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: "60%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "content",
      name: "المحتوى",
      icon: FileText,
      badge: 12,
      content: (
        <div className="space-y-6">
          <div className="saas-card">
            <h3 className="text-lg font-semibold mb-4">إدارة المحتوى</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <PenTool className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <h4 className="font-semibold">مقالات الرأي</h4>
                <p className="text-2xl font-bold text-blue-600">247</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <h4 className="font-semibold">التحليلات العميقة</h4>
                <p className="text-2xl font-bold text-green-600">89</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                <h4 className="font-semibold">المحتوى الذكي</h4>
                <p className="text-2xl font-bold text-yellow-600">156</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "engagement",
      name: "التفاعل",
      icon: MessageSquare,
      badge: 24,
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="saas-card">
            <h3 className="text-lg font-semibold mb-4">تفاعل القراء</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">تعليقات جديدة</span>
                <span className="saas-status-badge saas-status-progress">
                  24
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">إعجابات</span>
                <span className="saas-status-badge saas-status-success">
                  1,247
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">مشاركات</span>
                <span className="saas-status-badge saas-status-warning">
                  89
                </span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "users",
      name: "المستخدمون",
      icon: Users,
      content: (
        <div className="saas-card">
          <h3 className="text-lg font-semibold mb-4">إحصائيات المستخدمين</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">12,547</p>
              <p className="text-sm text-gray-600">إجمالي المستخدمين</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">1,247</p>
              <p className="text-sm text-gray-600">نشط اليوم</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">247</p>
              <p className="text-sm text-gray-600">مسجل جديد</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">89%</p>
              <p className="text-sm text-gray-600">معدل الاحتفاظ</p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <SAASTabs tabs={tabs} variant="default" size="md" defaultTab="general" />
  );
}
