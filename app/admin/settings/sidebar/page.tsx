"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useDarkModeContext } from "@/contexts/DarkModeContext";
import { Info, Settings, Zap } from "lucide-react";
import dynamic from "next/dynamic";

// تحميل المكون بشكل ديناميكي لتجنب مشاكل SSR
const SidebarCustomizer = dynamic(
  () => import("@/components/admin/sidebar/SidebarCustomizer"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        <span className="mr-2">جاري تحميل محرر الشريط الجانبي...</span>
      </div>
    ),
  }
);

export default function SidebarSettingsPage() {
  const { darkMode } = useDarkModeContext();

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* العنوان الرئيسي */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                darkMode ? "bg-blue-900/30" : "bg-blue-100"
              }`}
            >
              <Settings
                className={`w-6 h-6 ${
                  darkMode ? "text-blue-400" : "text-blue-600"
                }`}
              />
            </div>
            <div>
              <h1
                className={`text-3xl font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                إعدادات الشريط الجانبي
              </h1>
              <p
                className={`text-base ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                خصص ترتيب وظهور عناصر الشريط الجانبي في لوحة التحكم
              </p>
            </div>
          </div>

          {/* شريط التنبيه */}
          <Card
            className={`border-blue-200 ${
              darkMode ? "bg-blue-900/10 border-blue-800" : "bg-blue-50"
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Info
                  className={`w-5 h-5 ${
                    darkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                />
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      darkMode ? "text-blue-300" : "text-blue-800"
                    }`}
                  >
                    هذه الميزة متاحة للمديرين فقط
                  </p>
                  <p
                    className={`text-xs ${
                      darkMode ? "text-blue-400" : "text-blue-600"
                    }`}
                  >
                    التغييرات ستؤثر على حسابك فقط وليس على المستخدمين الآخرين
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  <Zap className="w-3 h-3 ml-1" />
                  مدير النظام
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="mb-8" />

        {/* المكون الرئيسي للتخصيص */}
        <SidebarCustomizer />

        {/* معلومات إضافية */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            className={
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }
          >
            <CardHeader>
              <CardTitle
                className={`text-lg ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                💡 نصائح للاستخدام
              </CardTitle>
              <CardDescription
                className={darkMode ? "text-gray-400" : "text-gray-600"}
              >
                نصائح لتحسين تجربة استخدام الشريط الجانبي
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul
                className={`space-y-2 text-sm ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  اسحب العناصر من الأيقونة المخططة لإعادة ترتيبها
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">•</span>
                  استخدم المفتاح لإظهار أو إخفاء العناصر
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold">•</span>
                  احفظ التغييرات لتطبيقها على حسابك
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  يمكنك إعادة تعيين الإعدادات للوضع الافتراضي
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card
            className={
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }
          >
            <CardHeader>
              <CardTitle
                className={`text-lg ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                🔒 الخصوصية والأمان
              </CardTitle>
              <CardDescription
                className={darkMode ? "text-gray-400" : "text-gray-600"}
              >
                معلومات حول أمان وخصوصية إعداداتك
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul
                className={`space-y-2 text-sm ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  التفضيلات محفوظة بشكل آمن في الخادم
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  لا تؤثر على تجربة المستخدمين الآخرين
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  يمكن استردادها عند تسجيل الدخول من أي جهاز
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">ℹ</span>
                  تحديث الصفحة مطلوب لرؤية التغييرات
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
