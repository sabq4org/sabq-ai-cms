"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface DatabaseStatus {
  success: boolean;
  status: string;
  error?: string;
  timestamp: string;
}

export default function DatabaseStatusChecker() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const checkDatabaseStatus = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/db-status", {
        cache: "no-store",
      });

      const data = await response.json();
      setStatus(data);
    } catch (err) {
      setError("فشل التحقق من حالة قاعدة البيانات");
      console.error("خطأ أثناء التحقق من حالة قاعدة البيانات:", err);
    } finally {
      setLoading(false);
    }
  };

  const reconnectDatabase = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/db-status", {
        method: "POST",
        cache: "no-store",
      });

      const data = await response.json();
      setStatus(data);

      if (data.success) {
        // إعادة تحميل الصفحة في حالة نجاح إعادة الاتصال
        window.location.reload();
      }
    } catch (err) {
      setError("فشل إعادة الاتصال بقاعدة البيانات");
      console.error("خطأ أثناء إعادة الاتصال بقاعدة البيانات:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto my-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 text-right">
        حالة الاتصال بقاعدة البيانات
      </h2>

      {loading && (
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-right">
          {error}
        </div>
      )}

      {status && (
        <div
          className={`mb-4 p-4 rounded-lg text-right ${
            status.success
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          <p className="font-bold">
            الحالة: {status.success ? "متصل" : "غير متصل"}
          </p>
          {status.error && <p className="mt-2">الخطأ: {status.error}</p>}
          <p className="mt-2 text-sm">
            آخر تحديث: {new Date(status.timestamp).toLocaleString("ar")}
          </p>
        </div>
      )}

      <div className="flex flex-col space-y-3 mt-6">
        <button
          onClick={checkDatabaseStatus}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md focus:outline-none disabled:bg-blue-300"
        >
          تحقق من حالة الاتصال
        </button>

        <button
          onClick={reconnectDatabase}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md focus:outline-none disabled:bg-green-300"
        >
          إعادة الاتصال بقاعدة البيانات
        </button>

        <Link
          href="/"
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md focus:outline-none text-center"
        >
          العودة للصفحة الرئيسية
        </Link>
      </div>
    </div>
  );
}
