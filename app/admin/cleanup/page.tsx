"use client";

import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Database,
  FileText,
  Loader2,
  Trash2,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDarkMode } from "@/hooks/useDarkMode";

interface CleanupStats {
  totalArticles: number;
  totalMuqtarabCorners: number;
  totalMuqtarabArticles: number;
  totalTestData: number;
}

const AdminCleanupPage = () => {
  const { darkMode } = useDarkMode();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<CleanupStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // جلب إحصائيات البيانات
  const loadStats = async () => {
    try {
      setLoadingStats(true);

      // استعلامات متعددة للحصول على الإحصائيات
      const [articlesRes, cornersRes, muqtarabArticlesRes] = await Promise.all([
        fetch("/api/admin/articles"),
        fetch("/api/admin/muqtarab/corners"),
        fetch("/api/admin/muqtarab/articles"),
      ]);

      const [articlesData, cornersData, muqtarabArticlesData] =
        await Promise.all([
          articlesRes.json(),
          cornersRes.json(),
          muqtarabArticlesRes.json(),
        ]);

      setStats({
        totalArticles: articlesData.total || 0,
        totalMuqtarabCorners: cornersData.corners?.length || 0,
        totalMuqtarabArticles: muqtarabArticlesData.articles?.length || 0,
        totalTestData: 0, // سيتم حسابه لاحقاً
      });
    } catch (error) {
      console.error("Error loading stats:", error);
      toast.error("فشل في تحميل الإحصائيات");
    } finally {
      setLoadingStats(false);
    }
  };

  // حذف جميع البيانات التجريبية
  const cleanupTestData = async () => {
    if (
      !confirm(
        "⚠️ هل أنت متأكد من حذف جميع البيانات التجريبية؟ هذا الإجراء لا يمكن التراجع عنه!"
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/admin/cleanup/test-data", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          confirm: "DELETE_ALL_TEST_DATA",
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`تم حذف البيانات التجريبية بنجاح!`);
        loadStats(); // إعادة تحميل الإحصائيات
      } else {
        toast.error(data.error || "فشل في حذف البيانات التجريبية");
      }
    } catch (error) {
      console.error("Error cleaning test data:", error);
      toast.error("حدث خطأ في حذف البيانات التجريبية");
    } finally {
      setLoading(false);
    }
  };

  // حذف جميع زوايا المقترب
  const cleanupMuqtarabCorners = async () => {
    if (
      !confirm(
        "⚠️ هل أنت متأكد من حذف جميع زوايا المقترب؟ سيتم حذف جميع المقالات المرتبطة أيضاً!"
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/admin/cleanup/muqtarab", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          confirm: "DELETE_ALL_MUQTARAB_DATA",
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(
          `تم حذف ${data.deletedCorners} زاوية و ${data.deletedArticles} مقال من المقترب!`
        );
        loadStats(); // إعادة تحميل الإحصائيات
      } else {
        toast.error(data.error || "فشل في حذف بيانات المقترب");
      }
    } catch (error) {
      console.error("Error cleaning muqtarab:", error);
      toast.error("حدث خطأ في حذف بيانات المقترب");
    } finally {
      setLoading(false);
    }
  };

  // حذف جميع المقالات
  const cleanupAllArticles = async () => {
    if (
      !confirm(
        "⚠️ هل أنت متأكد من حذف جميع المقالات؟ هذا سيحذف جميع مقالات الأخبار والرأي!"
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/admin/cleanup/articles", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          confirm: "DELETE_ALL_ARTICLES_AND_OPINIONS",
          hard: true, // حذف فعلي وليس soft delete
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`تم حذف جميع المقالات بنجاح!`);
        loadStats(); // إعادة تحميل الإحصائيات
      } else {
        toast.error(data.error || "فشل في حذف المقالات");
      }
    } catch (error) {
      console.error("Error cleaning articles:", error);
      toast.error("حدث خطأ في حذف المقالات");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "min-h-screen p-6",
        darkMode ? "bg-gray-900" : "bg-gray-50"
      )}
    >
      {/* Header */}
      <div className="mb-8">
        <h1
          className={cn(
            "text-3xl font-bold mb-2",
            darkMode ? "text-white" : "text-gray-900"
          )}
        >
          🧹 تنظيف قاعدة البيانات
        </h1>
        <p
          className={cn(
            "text-sm",
            darkMode ? "text-gray-400" : "text-gray-600"
          )}
        >
          إدارة وحذف البيانات التجريبية والبيانات غير المرغوب فيها
        </p>
      </div>

      {/* تحذير مهم */}
      <div
        className={cn(
          "p-6 rounded-xl mb-8 border",
          darkMode ? "bg-red-900/10 border-red-800" : "bg-red-50 border-red-200"
        )}
      >
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-8 h-8 text-red-500 mt-1 flex-shrink-0" />
          <div>
            <h3
              className={cn(
                "text-lg font-bold mb-2",
                darkMode ? "text-red-200" : "text-red-800"
              )}
            >
              ⚠️ تحذير مهم جداً
            </h3>
            <div
              className={cn(
                "text-sm space-y-2",
                darkMode ? "text-red-300" : "text-red-700"
              )}
            >
              <p>
                • جميع عمليات الحذف في هذه الصفحة نهائية ولا يمكن التراجع عنها
              </p>
              <p>• تأكد من عمل نسخة احتياطية قبل تنفيذ أي عملية حذف</p>
              <p>• هذه الأدوات مخصصة للمطورين والمدراء فقط</p>
              <p>• استخدم هذه الأدوات بحذر شديد في بيئة الإنتاج</p>
            </div>
          </div>
        </div>
      </div>

      {/* إحصائيات البيانات */}
      <div
        className={cn(
          "p-6 rounded-xl mb-8 border",
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        )}
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            className={cn(
              "text-xl font-bold",
              darkMode ? "text-white" : "text-gray-900"
            )}
          >
            📊 إحصائيات قاعدة البيانات
          </h2>
          <button
            onClick={loadStats}
            disabled={loadingStats}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {loadingStats ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Database className="w-4 h-4" />
            )}
            تحديث الإحصائيات
          </button>
        </div>

        {stats ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              className={cn(
                "p-4 rounded-lg text-center",
                darkMode ? "bg-blue-900/20" : "bg-blue-50"
              )}
            >
              <FileText className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold text-blue-600">
                {stats.totalArticles}
              </p>
              <p className="text-sm text-gray-500">مقالات الأخبار والرأي</p>
            </div>

            <div
              className={cn(
                "p-4 rounded-lg text-center",
                darkMode ? "bg-purple-900/20" : "bg-purple-50"
              )}
            >
              <Zap className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <p className="text-2xl font-bold text-purple-600">
                {stats.totalMuqtarabCorners}
              </p>
              <p className="text-sm text-gray-500">زوايا المقترب</p>
            </div>

            <div
              className={cn(
                "p-4 rounded-lg text-center",
                darkMode ? "bg-green-900/20" : "bg-green-50"
              )}
            >
              <FileText className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold text-green-600">
                {stats.totalMuqtarabArticles}
              </p>
              <p className="text-sm text-gray-500">مقالات المقترب</p>
            </div>

            <div
              className={cn(
                "p-4 rounded-lg text-center",
                darkMode ? "bg-orange-900/20" : "bg-orange-50"
              )}
            >
              <Users className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <p className="text-2xl font-bold text-orange-600">
                {stats.totalArticles +
                  stats.totalMuqtarabCorners +
                  stats.totalMuqtarabArticles}
              </p>
              <p className="text-sm text-gray-500">إجمالي البيانات</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              اضغط على "تحديث الإحصائيات" لعرض البيانات
            </p>
          </div>
        )}
      </div>

      {/* أدوات التنظيف */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* حذف البيانات التجريبية */}
        <div
          className={cn(
            "p-6 rounded-xl border",
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          )}
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
              <Database className="w-8 h-8 text-yellow-600" />
            </div>
            <h3
              className={cn(
                "text-lg font-bold mb-2",
                darkMode ? "text-white" : "text-gray-900"
              )}
            >
              البيانات التجريبية
            </h3>
            <p
              className={cn(
                "text-sm",
                darkMode ? "text-gray-400" : "text-gray-600"
              )}
            >
              حذف البيانات التجريبية والوهمية المستخدمة في التطوير
            </p>
          </div>

          <button
            onClick={cleanupTestData}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            حذف البيانات التجريبية
          </button>
        </div>

        {/* حذف زوايا المقترب */}
        <div
          className={cn(
            "p-6 rounded-xl border",
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          )}
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <Zap className="w-8 h-8 text-purple-600" />
            </div>
            <h3
              className={cn(
                "text-lg font-bold mb-2",
                darkMode ? "text-white" : "text-gray-900"
              )}
            >
              زوايا المقترب
            </h3>
            <p
              className={cn(
                "text-sm",
                darkMode ? "text-gray-400" : "text-gray-600"
              )}
            >
              حذف جميع زوايا المقترب والمقالات المرتبطة بها
            </p>
          </div>

          <button
            onClick={cleanupMuqtarabCorners}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            حذف جميع زوايا المقترب
          </button>
        </div>

        {/* حذف جميع المقالات */}
        <div
          className={cn(
            "p-6 rounded-xl border border-red-300",
            darkMode ? "bg-red-900/10" : "bg-red-50"
          )}
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <FileText className="w-8 h-8 text-red-600" />
            </div>
            <h3
              className={cn(
                "text-lg font-bold mb-2",
                darkMode ? "text-red-200" : "text-red-800"
              )}
            >
              جميع المقالات
            </h3>
            <p
              className={cn(
                "text-sm",
                darkMode ? "text-red-300" : "text-red-700"
              )}
            >
              ⚠️ حذف جميع مقالات الأخبار والرأي (خطر جداً!)
            </p>
          </div>

          <button
            onClick={cleanupAllArticles}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            حذف جميع المقالات
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCleanupPage;
