"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function EmergencyPage() {
  const [dbStatus, setDbStatus] = useState<
    "checking" | "connected" | "disconnected"
  >("checking");
  const [emergencyArticles, setEmergencyArticles] = useState<any[]>([]);

  useEffect(() => {
    // التحقق من حالة قاعدة البيانات
    const checkDbStatus = async () => {
      try {
        const response = await fetch("/api/db-status", {
          cache: "no-store",
        });
        const data = await response.json();
        setDbStatus(data.success ? "connected" : "disconnected");
      } catch (error) {
        console.error("خطأ في التحقق من حالة قاعدة البيانات:", error);
        setDbStatus("disconnected");
      }
    };

    // محاولة جلب قائمة المقالات الطارئة
    const fetchEmergencyArticles = async () => {
      try {
        // هنا يمكن إضافة API endpoint لجلب قائمة المقالات الطارئة المتاحة
        // لكن في هذه الحالة سنستخدم بيانات ثابتة للتوضيح
        setEmergencyArticles([
          {
            id: "article_1754300638519_2to0alw7y",
            title: "السعودية تدين الهجوم الإرهابي في أنقرة",
            category: "الأخبار العربية والعالمية",
          },
          {
            id: "article_1754300638520_3to0alw8z",
            title: "صندوق الاستثمارات العامة يطلق شركة تدوير المخلفات",
            category: "اقتصاد",
          },
        ]);
      } catch (error) {
        console.error("خطأ في جلب قائمة المقالات الطارئة:", error);
      }
    };

    checkDbStatus();
    fetchEmergencyArticles();
  }, []);

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="mr-3">
              <p className="text-yellow-700">
                هناك مشكلة مؤقتة في الاتصال بقاعدة البيانات. نعمل على حل المشكلة
                في أسرع وقت ممكن.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
            صفحة الطوارئ
          </h1>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-right text-gray-700">
              حالة الاتصال بقاعدة البيانات
            </h2>
            <div
              className={`p-4 rounded-lg text-right ${
                dbStatus === "connected"
                  ? "bg-green-100"
                  : dbStatus === "disconnected"
                  ? "bg-red-100"
                  : "bg-gray-100"
              }`}
            >
              <p className="font-medium">
                {dbStatus === "connected"
                  ? "✓ متصل بقاعدة البيانات"
                  : dbStatus === "disconnected"
                  ? "✗ غير متصل بقاعدة البيانات"
                  : "⋯ جاري التحقق من الاتصال"}
              </p>
              <p className="mt-2 text-sm">
                {dbStatus === "connected"
                  ? "يمكنك تصفح الموقع بشكل طبيعي الآن."
                  : dbStatus === "disconnected"
                  ? "يتم حاليًا عرض نسخ طارئة من المحتوى حتى يتم حل المشكلة."
                  : "يرجى الانتظار..."}
              </p>
            </div>
          </div>

          {dbStatus === "disconnected" && emergencyArticles.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-right text-gray-700">
                المقالات المتاحة في وضع الطوارئ
              </h2>
              <ul className="space-y-3 text-right">
                {emergencyArticles.map((article) => (
                  <li
                    key={article.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <Link href={`/emergency/${article.id}`} className="block">
                      <h3 className="text-lg font-medium text-blue-600">
                        {article.title}
                      </h3>
                      {article.category && (
                        <p className="text-sm text-gray-500 mt-1">
                          {article.category}
                        </p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col space-y-4 mt-8">
            <Link
              href="/admin/db-status"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-center"
            >
              الانتقال إلى صفحة إدارة قاعدة البيانات
            </Link>
            <Link
              href="/"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg text-center"
            >
              العودة إلى الصفحة الرئيسية
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
            >
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
