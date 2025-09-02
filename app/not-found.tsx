"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDarkMode } from '@/hooks/useDarkMode';

export default function NotFoundPage() {
  const [emergencyArticles, setEmergencyArticles] = useState<any[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const { darkMode } = useDarkMode();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // التحقق من حالة قاعدة البيانات
    const checkDbStatus = async () => {
      try {
        const response = await fetch("/api/db-status", {
          cache: "no-store",
        });
        const data = await response.json();
        setDbConnected(data.success);
      } catch (error) {
        console.error("فشل في التحقق من حالة قاعدة البيانات:", error);
        setDbConnected(false);
      }
    };

    // جلب قائمة المقالات الطارئة
    const fetchEmergencyArticles = async () => {
      try {
        const response = await fetch("/api/emergency/status", {
          cache: "no-store",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.supportedArticleIds) {
            // تحويل المعرفات إلى مقالات وهمية للعرض
            const articles = data.supportedArticleIds.map(
              (id: string, index: number) => ({
                id,
                title: `مقال طارئ ${index + 1}`,
                category: "أخبار",
              })
            );

            setEmergencyArticles(articles);
          }
        }
      } catch (error) {
        console.error("فشل في جلب قائمة المقالات الطارئة:", error);
      } finally {
        setLoadingArticles(false);
      }
    };

    checkDbStatus();
    fetchEmergencyArticles();
  }, []);

  // استخدام darkMode من useDarkMode hook

  if (!isMounted) {
    // Render a skeleton or null during server-side rendering & initial client-side render
    return null;
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex flex-col`}>
      <div className="flex-grow container mx-auto px-4 py-12">
        <div className={`max-w-2xl mx-auto ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg overflow-hidden`}>
          <div className="p-6 md:p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative w-24 h-24">
                <Image
                  src="/images/database-error.svg"
                  alt="صفحة غير موجودة"
                  width={100}
                  height={100}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            </div>

            <h1 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              الصفحة غير موجودة
            </h1>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-8`}>
              عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
              {dbConnected === false && (
                <span className="block mt-2 text-red-500">
                  لاحظنا وجود مشكلة في الاتصال بقاعدة البيانات، قد تكون هذه هي
                  المشكلة.
                </span>
              )}
            </p>

            {/* حالة قاعدة البيانات */}
            {dbConnected !== null && (
              <div
                className={`p-4 mb-6 rounded-lg text-center ${
                  dbConnected
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                }`}
              >
                <p className="font-medium">
                  {dbConnected
                    ? "✓ قاعدة البيانات متصلة"
                    : "✗ قاعدة البيانات غير متصلة"}
                </p>
              </div>
            )}

            {/* عرض المقالات الطارئة في حالة انقطاع الاتصال */}
            {dbConnected === false && emergencyArticles.length > 0 && (
              <div className={`mb-8 text-right ${darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'} p-4 rounded-lg`}>
                <h2 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                  المقالات المتاحة في وضع الطوارئ:
                </h2>
                <ul className="space-y-2">
                  {emergencyArticles.map((article) => (
                    <li
                      key={article.id}
                      className={`${darkMode ? 'hover:bg-yellow-800/30' : 'hover:bg-yellow-100'} rounded-lg p-2 transition-colors`}
                    >
                      <Link href={`/emergency/${article.id}`} className={`block ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700'}`}>
                        {article.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col space-y-3">
              <Link
                href="/"
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-center"
              >
                العودة للصفحة الرئيسية
              </Link>

              {dbConnected === false && (
                <Link
                  href="/emergency"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg text-center"
                >
                  الذهاب لصفحة الطوارئ
                </Link>
              )}

              <button
                onClick={() => window.location.reload()}
                className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} py-2 px-4 rounded-lg`}
              >
                تحديث الصفحة
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
