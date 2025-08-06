"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type DbErrorLog = {
  timestamp: string;
  error: string;
  message?: string;
  context?: string;
  stack?: string;
  path?: string;
  raw?: string;
  parseError?: boolean;
};

export default function DbErrorLogsPage() {
  const [logs, setLogs] = useState<DbErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(50);
  const [clearingLogs, setClearingLogs] = useState(false);

  // جلب سجلات الأخطاء
  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/logs/db-errors?limit=${limit}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          `خطأ في جلب السجلات: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.success) {
        setLogs(data.logs || []);
      } else {
        throw new Error(data.error || "خطأ غير معروف");
      }
    } catch (err: any) {
      console.error("خطأ في جلب سجلات الأخطاء:", err);
      setError(err.message || "حدث خطأ أثناء جلب سجلات الأخطاء");
    } finally {
      setLoading(false);
    }
  };

  // مسح جميع السجلات
  const clearAllLogs = async () => {
    if (!window.confirm("هل أنت متأكد من أنك تريد مسح جميع سجلات الأخطاء؟")) {
      return;
    }

    try {
      setClearingLogs(true);

      const response = await fetch("/api/logs/db-errors", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(
          `خطأ في مسح السجلات: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.success) {
        setLogs([]);
        alert("تم مسح جميع السجلات بنجاح");
      } else {
        throw new Error(data.error || "خطأ غير معروف");
      }
    } catch (err: any) {
      console.error("خطأ في مسح سجلات الأخطاء:", err);
      alert(`فشل في مسح السجلات: ${err.message}`);
    } finally {
      setClearingLogs(false);
    }
  };

  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("ar-SA");
    } catch (e) {
      return dateString;
    }
  };

  // جلب السجلات عند تحميل الصفحة
  useEffect(() => {
    fetchLogs();
  }, [limit]);

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">سجلات أخطاء قاعدة البيانات</h1>
          <div className="flex gap-4">
            <Link
              href="/admin/db-status"
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
            >
              إدارة قاعدة البيانات
            </Link>
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 disabled:bg-green-300"
            >
              تحديث
            </button>
            <button
              onClick={clearAllLogs}
              disabled={clearingLogs || logs.length === 0}
              className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 disabled:bg-red-300"
            >
              مسح السجلات
            </button>
          </div>
        </div>

        {/* فلتر العرض */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <label className="block mb-2 font-medium">
            عدد السجلات المعروضة:
          </label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="border border-gray-300 rounded-lg p-2"
          >
            <option value={10}>10 سجلات</option>
            <option value={50}>50 سجل</option>
            <option value={100}>100 سجل</option>
            <option value={500}>500 سجل</option>
          </select>
        </div>

        {/* عرض الخطأ */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* جاري التحميل */}
        {loading && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* لا توجد سجلات */}
        {!loading && logs.length === 0 && (
          <div className="bg-gray-50 p-8 text-center rounded-lg">
            <p className="text-lg text-gray-600">لا توجد سجلات أخطاء حالياً</p>
          </div>
        )}

        {/* جدول السجلات */}
        {!loading && logs.length > 0 && (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    الوقت
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    الخطأ
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    السياق
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                      {log.parseError ? (
                        <code className="text-xs bg-red-50 p-1 rounded">
                          {log.raw}
                        </code>
                      ) : (
                        <>
                          <div className="font-medium">{log.error}</div>
                          {log.message && (
                            <div className="text-xs text-gray-600 mt-1">
                              {log.message}
                            </div>
                          )}
                          {log.path && (
                            <div className="text-xs text-gray-500 mt-1">
                              المسار: {log.path}
                            </div>
                          )}
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 text-right">
                      {log.context || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
