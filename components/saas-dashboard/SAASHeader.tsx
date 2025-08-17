"use client";

import { useDarkModeContext } from "@/contexts/DarkModeContext";
import {
  Bell,
  Calendar,
  ChevronDown,
  Edit3,
  Search,
  Settings,
  User,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface SAASHeaderProps {
  title?: string;
  subtitle?: string;
  showEditButton?: boolean;
  userName?: string;
  userAvatar?: string;
  onEditClick?: () => void;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export default function SAASHeader({
  title = "لوحة التحكم الرئيسية",
  subtitle = "مرحباً بك في منصة سبق الذكية",
  showEditButton = true,
  userName = "أحمد المطور",
  userAvatar,
  onEditClick,
  onMenuClick,
  showMenuButton = false,
}: SAASHeaderProps) {
  const { darkMode } = useDarkModeContext();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const currentDate = new Date().toLocaleDateString("ar-SA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const notifications = [
    { id: 1, title: "مقال جديد منشور", time: "منذ 5 دقائق", type: "success" },
    { id: 2, title: "تعليق جديد", time: "منذ 15 دقيقة", type: "info" },
    { id: 3, title: "تحديث النظام", time: "منذ ساعة", type: "warning" },
  ];

  return (
    <header
      className={`
        sticky top-0 z-30 border-b transition-all duration-200
        ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}
      `}
      style={{
        backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
        borderColor: darkMode ? "#374151" : "#E5E7EB",
      }}
    >
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left Section - Title & Date */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          {showMenuButton && (
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100
                         lg:hidden transition-colors duration-200"
            >
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <div className="w-6 h-0.5 bg-current"></div>
                <div className="w-6 h-0.5 bg-current"></div>
                <div className="w-6 h-0.5 bg-current"></div>
              </div>
            </button>
          )}

          {/* Title Section */}
          <div>
            <div className="flex items-center space-x-2">
              <h1
                className={`text-xl font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {title}
              </h1>
              {showEditButton && (
                <button
                  onClick={onEditClick}
                  className="p-1.5 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50
                             rounded-lg transition-all duration-200"
                  title="تحرير"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span
                className={`text-sm ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {currentDate}
              </span>
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs
                             font-medium bg-green-100 text-green-800"
              >
                نشط
              </span>
            </div>
          </div>
        </div>

        {/* Right Section - Search, Notifications, User */}
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="hidden md:block relative">
            <div className="relative">
              <Search
                className="absolute right-3 top-1/2 transform -translate-y-1/2
                               text-gray-400 w-4 h-4"
              />
              <input
                type="text"
                placeholder="البحث..."
                className={`
                  w-64 pl-4 pr-10 py-2 text-sm rounded-lg border transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500
                  ${
                    darkMode
                      ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                      : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                  }
                `}
              />
            </div>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`
                relative p-2 rounded-lg transition-all duration-200
                ${
                  darkMode
                    ? "text-gray-300 hover:text-white hover:bg-gray-800"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }
              `}
            >
              <Bell className="w-5 h-5" />
              <span
                className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full
                             flex items-center justify-center"
              >
                <span className="text-xs text-white font-bold">3</span>
              </span>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div
                className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg
                             border border-gray-200 z-50"
              >
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    الإشعارات
                  </h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 border-b border-gray-100 hover:bg-gray-50"
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            notification.type === "success"
                              ? "bg-green-500"
                              : notification.type === "warning"
                              ? "bg-yellow-500"
                              : "bg-blue-500"
                          }`}
                        ></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-gray-50 text-center">
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    عرض جميع الإشعارات
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`
                flex items-center space-x-2 p-2 rounded-lg transition-all duration-200
                ${
                  darkMode
                    ? "text-gray-300 hover:text-white hover:bg-gray-800"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }
              `}
            >
              <div className="flex items-center space-x-2">
                {userAvatar ? (
                  <Image
                    src={userAvatar}
                    alt={userName}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                )}
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-gray-500">مدير النظام</p>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg
                             border border-gray-200 z-50"
              >
                <div className="py-1">
                  <a
                    href="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700
                               hover:bg-gray-100"
                  >
                    <User className="w-4 h-4 mr-3" />
                    الملف الشخصي
                  </a>
                  <a
                    href="/admin/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700
                               hover:bg-gray-100"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    الإعدادات
                  </a>
                  <hr className="my-1" />
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600
                                   hover:bg-red-50"
                  >
                    تسجيل الخروج
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div
        className={`
        px-6 py-2 border-t text-xs
        ${
          darkMode
            ? "bg-gray-800 border-gray-700 text-gray-400"
            : "bg-gray-50 border-gray-200 text-gray-600"
        }
      `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span>آخر تحديث: منذ دقيقتين</span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
              النظام يعمل بشكل طبيعي
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span>v2.1.0</span>
          </div>
        </div>
      </div>
    </header>
  );
}
