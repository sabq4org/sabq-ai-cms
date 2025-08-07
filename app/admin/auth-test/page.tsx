"use client";

import { useState } from "react";

export default function AuthTestPage() {
  const [authResult, setAuthResult] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleDevLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/dev-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      setAuthResult(data);
    } catch (error) {
      setAuthResult({ error: "خطأ في الاتصال", details: error });
    } finally {
      setLoading(false);
    }
  };

  const handleAuthTest = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth-test", {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({ error: "خطأ في الاتصال", details: error });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAd = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: "اختبار المصادقة",
          image_url: "https://example.com/test.jpg",
          target_url: "https://example.com",
          placement: "sidebar_top",
          start_date: new Date().toISOString(),
          end_date: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          is_always_on: false,
        }),
      });

      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({ error: "خطأ في الاتصال", details: error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">اختبار المصادقة</h1>

      <div className="space-y-4">
        <button
          onClick={handleDevLogin}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "جاري التحميل..." : "تسجيل دخول تجريبي"}
        </button>

        <button
          onClick={handleAuthTest}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 ml-4"
        >
          {loading ? "جاري التحميل..." : "اختبار المصادقة"}
        </button>

        <button
          onClick={handleCreateAd}
          disabled={loading}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50 ml-4"
        >
          {loading ? "جاري التحميل..." : "اختبار إنشاء إعلان"}
        </button>
      </div>

      {authResult && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">نتيجة تسجيل الدخول:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(authResult, null, 2)}
          </pre>
        </div>
      )}

      {testResult && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">نتيجة الاختبار:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
