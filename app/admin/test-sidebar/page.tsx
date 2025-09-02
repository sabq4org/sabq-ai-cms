"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSidebarPreferences } from "@/contexts/SidebarPreferencesContext";
import { AlertCircle, CheckCircle, RefreshCw, Settings } from "lucide-react";
import React from "react";

export default function SidebarTestPage() {
  const { preferences, loading, updatePreferences, resetPreferences } =
    useSidebarPreferences();
  const [testResult, setTestResult] = React.useState<string>("");

  const runApiTest = async () => {
    setTestResult("جاري الاختبار...");

    try {
      // اختبار GET
      const getResponse = await fetch("/api/user/preferences/sidebar");
      const getData = await getResponse.json();

      if (!getResponse.ok) {
        throw new Error(`GET failed: ${getData.error}`);
      }

      // اختبار POST
      const testPreferences = {
        sidebar_order: ["dashboard", "analytics", "settings"],
        sidebar_hidden: ["comments"],
      };

      const postResponse = await fetch("/api/user/preferences/sidebar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testPreferences),
      });

      const postData = await postResponse.json();

      if (!postResponse.ok) {
        throw new Error(`POST failed: ${postData.error}`);
      }

      // اختبار DELETE
      const deleteResponse = await fetch("/api/user/preferences/sidebar", {
        method: "DELETE",
      });

      const deleteData = await deleteResponse.json();

      if (!deleteResponse.ok) {
        throw new Error(`DELETE failed: ${deleteData.error}`);
      }

      setTestResult("✅ جميع الاختبارات نجحت! API يعمل بشكل صحيح.");
    } catch (error) {
      setTestResult(
        `❌ فشل في الاختبار: ${
          error instanceof Error ? error.message : "خطأ غير معروف"
        }`
      );
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* العنوان */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                darkMode ? "bg-green-900/30" : "bg-green-100"
              }`}
            >
              <Settings
                className={`w-6 h-6 ${
                  darkMode ? "text-green-400" : "text-green-600"
                }`}
              />
            </div>
            <div>
              <h1
                className={`text-3xl font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                اختبار نظام تخصيص الشريط الجانبي
              </h1>
              <p
                className={`text-base ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                صفحة اختبار للتحقق من عمل النظام بشكل صحيح
              </p>
            </div>
          </div>
        </div>

        {/* معلومات الحالة الحالية */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card
            className={
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }
          >
            <CardHeader>
              <CardTitle
                className={`flex items-center gap-2 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                📊 حالة التفضيلات الحالية
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري التحميل...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      ترتيب العناصر:
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {preferences.sidebar_order.length > 0 ? (
                        preferences.sidebar_order.map((item, index) => (
                          <Badge
                            key={item}
                            variant="outline"
                            className="text-xs"
                          >
                            {index + 1}. {item}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          الترتيب الافتراضي
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <p
                      className={`text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      العناصر المخفية:
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {preferences.sidebar_hidden.length > 0 ? (
                        preferences.sidebar_hidden.map((item) => (
                          <Badge
                            key={item}
                            variant="destructive"
                            className="text-xs"
                          >
                            {item}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          لا توجد عناصر مخفية
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}
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
                className={`flex items-center gap-2 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                🔧 أدوات الاختبار
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  onClick={runApiTest}
                  className="w-full"
                  variant="outline"
                >
                  اختبار API Endpoints
                </Button>

                <Button
                  onClick={() => {
                    updatePreferences({
                      sidebar_order: ["analytics", "dashboard", "settings"],
                      sidebar_hidden: ["media", "comments"],
                    });
                  }}
                  className="w-full"
                  variant="outline"
                >
                  تطبيق تفضيلات تجريبية
                </Button>

                <Button
                  onClick={resetPreferences}
                  className="w-full"
                  variant="outline"
                >
                  إعادة تعيين التفضيلات
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* نتائج الاختبار */}
        {testResult && (
          <Card
            className={
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }
          >
            <CardHeader>
              <CardTitle
                className={`flex items-center gap-2 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {testResult.includes("✅") ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                نتائج الاختبار
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`p-4 rounded-lg font-mono text-sm ${
                  testResult.includes("✅")
                    ? darkMode
                      ? "bg-green-900/20 text-green-300"
                      : "bg-green-50 text-green-800"
                    : darkMode
                    ? "bg-red-900/20 text-red-300"
                    : "bg-red-50 text-red-800"
                }`}
              >
                {testResult}
              </div>
            </CardContent>
          </Card>
        )}

        {/* إرشادات */}
        <Card
          className={`mt-8 ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <CardHeader>
            <CardTitle
              className={`${darkMode ? "text-white" : "text-gray-900"}`}
            >
              📝 كيفية الاختبار
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`space-y-2 text-sm ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              <p>
                <strong>1.</strong> اضغط "اختبار API Endpoints" للتحقق من عمل
                الخادم
              </p>
              <p>
                <strong>2.</strong> اضغط "تطبيق تفضيلات تجريبية" لاختبار التحديث
              </p>
              <p>
                <strong>3.</strong> انتقل إلى{" "}
                <code>/admin/settings/sidebar</code> لاختبار الواجهة
              </p>
              <p>
                <strong>4.</strong> جرب السحب والإفلات في صفحة الإعدادات
              </p>
              <p>
                <strong>5.</strong> احفظ التغييرات وحدث الصفحة لرؤية النتائج
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
